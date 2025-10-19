// lib/stores/community-store.ts
import { create } from "zustand";
import { supabase } from "@/lib/supabase/client";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  event_type: "webinar" | "workshop" | "challenge" | "meetup" | "qna";
  start_time: string;
  end_time: string;
  is_online: boolean;
  location?: string;
  meeting_url?: string;
  max_participants?: number;
  participants_count: number;
  is_joined: boolean;
  host: User;
  created_at: string;
  updated_at: string;
}

interface ChatRoom {
  id: string;
  name: string;
  description: string;
  member_count: number;
  last_message?: Message;
  created_at: string;
}

interface Message {
  isRead: any;
  user_id: string;
  id: string;
  content: string;
  user: User;
  room_id: string;
  created_at: string;
  updated_at: string;
}

interface CommunityStore {
  // State
  events: CommunityEvent[];
  chatRooms: ChatRoom[];
  currentRoom: ChatRoom | null;
  roomMessages: Message[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchEvents: () => Promise<void>;
  fetchChatRooms: () => Promise<void>;
  fetchRoomMessages: (roomId: string) => Promise<void>;
  joinEvent: (eventId: string) => Promise<void>;
  leaveEvent: (eventId: string) => Promise<void>;
  sendMessage: (roomId: string, content: string) => Promise<void>;
  joinRoom: (roomId: string) => Promise<void>;
  setCurrentRoom: (room: ChatRoom | null) => void;

  // Real-time subscriptions
  subscribeToMessages: (roomId: string) => () => void;
  subscribeToEvents: () => () => void;

  // Utilities
  clearError: () => void;
}

export const useCommunityStore = create<CommunityStore>((set, get) => ({
  // Initial state
  events: [],
  chatRooms: [],
  currentRoom: null,
  roomMessages: [],
  isLoading: false,
  error: null,

  // Fetch all community events
  fetchEvents: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data: events, error } = await supabase
        .from("community_events")
        .select(
          `
          *,
          host:profiles!host_id(id, first_name, last_name, email),
          event_participants(count)
        `
        )
        .order("start_time", { ascending: true });

      if (error) throw error;

      // Transform the data to include participants count and join status
      const transformedEvents =
        events?.map((event) => ({
          ...event,
          participants_count: event.event_participants?.[0]?.count || 0,
          is_joined: false, // This would need to be checked against current user
        })) || [];

      set({ events: transformedEvents, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Fetch all chat rooms
  fetchChatRooms: async () => {
    set({ isLoading: true, error: null });

    try {
      const { data: rooms, error } = await supabase
        .from("chat_rooms")
        .select(
          `
          *,
          room_members(count),
          messages!last_message_id(content, created_at)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const transformedRooms =
        rooms?.map((room) => ({
          ...room,
          member_count: room.room_members?.[0]?.count || 0,
          last_message: room.messages?.[0] || undefined,
        })) || [];

      set({ chatRooms: transformedRooms, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Fetch messages for a specific room
  fetchRoomMessages: async (roomId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data: messages, error } = await supabase
        .from("messages")
        .select(
          `
          *,
          user:profiles(id, first_name, last_name, email)
        `
        )
        .eq("room_id", roomId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      set({ roomMessages: messages || [], isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // Join an event
  joinEvent: async (eventId: string) => {
    set({ isLoading: true, error: null });

    try {
      // First, check if user is already registered
      const { data: existingRegistration } = await supabase
        .from("event_participants")
        .select("id")
        .eq("event_id", eventId)
        .single();

      if (existingRegistration) {
        throw new Error("You are already registered for this event");
      }

      // Register for the event
      const { error } = await supabase
        .from("event_participants")
        .insert([{ event_id: eventId }]);

      if (error) throw error;

      // Update local state
      set((state) => ({
        events: state.events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                participants_count: event.participants_count + 1,
                is_joined: true,
              }
            : event
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  // Leave an event
  leaveEvent: async (eventId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { error } = await supabase
        .from("event_participants")
        .delete()
        .eq("event_id", eventId);

      if (error) throw error;

      // Update local state
      set((state) => ({
        events: state.events.map((event) =>
          event.id === eventId
            ? {
                ...event,
                participants_count: Math.max(0, event.participants_count - 1),
                is_joined: false,
              }
            : event
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  // Send a message to a chat room
  sendMessage: async (roomId: string, content: string) => {
    try {
      const { error } = await supabase
        .from("messages")
        .insert([{ room_id: roomId, content }]);

      if (error) throw error;

      // Update last message in chat room
      const { error: updateError } = await supabase
        .from("chat_rooms")
        .update({ last_message_id: null }) // This would need to be set to the new message ID
        .eq("id", roomId);

      if (updateError)
        console.error("Failed to update last message:", updateError);
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  // Join a chat room
  joinRoom: async (roomId: string) => {
    try {
      const { error } = await supabase
        .from("room_members")
        .insert([{ room_id: roomId }])
        .select()
        .single();

      if (error && error.code !== "23505") {
        // Ignore duplicate key errors
        throw error;
      }

      // Update member count in local state
      set((state) => ({
        chatRooms: state.chatRooms.map((room) =>
          room.id === roomId
            ? { ...room, member_count: room.member_count + 1 }
            : room
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    }
  },

  // Set current room
  setCurrentRoom: (room: ChatRoom | null) => {
    set({ currentRoom: room, roomMessages: [] });
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
          table: "messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          set((state) => ({
            roomMessages: [...state.roomMessages, payload.new as Message],
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
          get().fetchEvents(); // Refresh events on any change
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "event_participants",
        },
        () => {
          get().fetchEvents(); // Refresh events when participants change
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  // Clear error
  clearError: () => set({ error: null }),
}));
