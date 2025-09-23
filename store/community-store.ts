// lib/stores/community-store.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";
import { CommunityEvent, ChatRoom, ChatMessage } from "@/types/community";

interface CommunityStore {
  events: CommunityEvent[];
  chatRooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  roomMessages: ChatMessage[];
  isLoading: boolean;
  error: string | null;

  fetchEvents: () => Promise<void>;
  fetchChatRooms: () => Promise<void>;
  fetchRoomMessages: (roomId: string) => Promise<void>;
  joinEvent: (eventId: string) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  createEvent: (eventData: Partial<CommunityEvent>) => Promise<void>;
  sendMessage: (
    roomId: string,
    content: string,
    messageType?: string
  ) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  createRoom: (roomData: Partial<ChatRoom>) => Promise<void>;

  subscribeToMessages: (roomId: string) => () => void;
  subscribeToEvents: () => () => void;

  clearError: () => void;
  setCurrentRoom: (room: ChatRoom | null) => void;
}

export const useCommunityStore = create<CommunityStore>((set, get) => ({
  events: [],
  chatRooms: [],
  currentRoom: null,
  roomMessages: [],
  isLoading: false,
  error: null,

  // Fetch community events
  fetchEvents: async () => {
    set({ isLoading: true, error: null });

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: events, error } = await supabase
        .from("community_events")
        .select(
          `
          *,
          host:profiles(*),
          event_participants(count)
        `
        )
        .eq("is_active", true)
        .gte("end_time", new Date().toISOString())
        .order("start_time", { ascending: true });

      if (error) throw error;

      // Check if user is joined to each event
      const eventsWithParticipation = await Promise.all(
        (events || []).map(async (event) => {
          const { data: participation } = await supabase
            .from("event_participants")
            .select("id")
            .eq("event_id", event.id)
            .eq("user_id", event.host.id)
            .single();

          return {
            ...event,
            participants_count: event.event_participants[0]?.count || 0,
            is_joined: !!participation,
          };
        })
      );

      set({ events: eventsWithParticipation, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Fetch chat rooms
  fetchChatRooms: async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

      if (profileError) throw profileError;

      const { data: rooms, error } = await supabase
        .from("chat_rooms")
        .select(
          `
          *,
          room_members(count),
          chat_messages!inner(
            content,
            created_at,
            user:profiles(first_name, last_name)
          )
        `
        )
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const roomsWithStats = (rooms || []).map((room) => ({
        ...room,
        member_count: room.room_members[0]?.count || 0,
        last_message: room.chat_messages[0]
          ? {
              content: room.chat_messages[0].content,
              created_at: room.chat_messages[0].created_at,
              user: room.chat_messages[0].user,
            }
          : undefined,
      }));

      set({ chatRooms: roomsWithStats });
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Fetch messages for a specific room
  fetchRoomMessages: async (roomId: string) => {
    set({ isLoading: true });

    try {
      const { data: messages, error } = await supabase
        .from("chat_messages")
        .select(
          `
          *,
          user:profiles(*),
          replied_to:chat_messages!replied_to_id(*)
        `
        )
        .eq("room_id", roomId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) throw error;

      set({ roomMessages: messages || [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Join an event
  joinEvent: async (eventId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

      if (profileError) throw profileError;

      const { error } = await supabase
        .from("event_participants")
        .insert([{ event_id: eventId, user_id: profile.id }]);

      if (error) throw error;

      // Refresh events
      get().fetchEvents();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Leave an event
  leaveEvent: async (eventId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

      if (profileError) throw profileError;

      const { error } = await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", eventId)
        .eq("user_id", profile.id);

      if (error) throw error;

      // Refresh events
      get().fetchEvents();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Send a chat message
  sendMessage: async (
    roomId: string,
    content: string,
    messageType = "text"
  ) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

      if (profileError) throw profileError;

      const { error } = await supabase.from("chat_messages").insert([
        {
          room_id: roomId,
          user_id: profile.id,
          content,
          message_type: messageType,
        },
      ]);

      if (error) throw error;
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Join a chat room
  joinRoom: async (roomId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

      if (profileError) throw profileError;

      const { error } = await supabase
        .from("room_members")
        .insert([{ room_id: roomId, user_id: profile.id }]);

      if (error && error.code !== "23505") {
        // Ignore duplicate key errors
        throw error;
      }

      // Refresh rooms
      get().fetchChatRooms();
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  // Real-time subscription for messages
  subscribeToMessages: (roomId: string) => {
    const subscription = supabase
      .channel(`room:${roomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          set((state) => ({
            roomMessages: [...state.roomMessages, payload.new as ChatMessage],
          }));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  // Real-time subscription for events
  subscribeToEvents: () => {
    const subscription = supabase
      .channel("community_events")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "community_events",
        },
        () => {
          get().fetchEvents();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  // Utility functions
  clearError: () => set({ error: null }),
  setCurrentRoom: (room: ChatRoom | null) => set({ currentRoom: room }),
}));
