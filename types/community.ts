export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  event_type: "webinar" | "workshop" | "challenge" | "meetup" | "qna";
  host_id: string;
  start_time: string;
  end_time: string;
  max_participants?: number;
  is_online: boolean;
  meeting_url?: string;
  location?: string;
  cover_image_url?: string;
  is_recurring: boolean;
  recurrence_pattern?: string;
  price_points: number;
  is_active: boolean;
  created_at: string;
  host?: Profile;
  participants_count?: number;
  is_joined?: boolean;
}

export interface ChatRoom {
  id: string;
  name: string;
  description?: string;
  room_type: "public" | "private" | "event";
  event_id?: string;
  max_members?: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  member_count?: number;
  unread_count?: number;
  last_message?: ChatMessage;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  message_type: "text" | "image" | "system";
  attachment_url?: string;
  replied_to_id?: string;
  is_edited: boolean;
  created_at: string;
  user?: Profile;
  replied_to?: ChatMessage;
}

export interface Profile {
  id: string;
  clerk_user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
}

export interface EventParticipant {
  id: string;
  event_id: string;
  user_id: string;
  joined_at: string;
  user: Profile;
}
