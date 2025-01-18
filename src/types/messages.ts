// Update existing messages.ts to include group chat types

export interface Message {
  id: string;
  content: string;
  created_at: string;
  sender: {
    id: string;
    name: string;
    avatar_url?: string;
  };
  read_by?: {
    profile_id: string;
    read_at: string;
  }[];
}

export interface GroupChat {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  members?: {
    id: string;
    name: string;
    avatar_url?: string;
    joined_at: string;
  }[];
  lastMessage?: {
    id: string;
    content: string;
    created_at: string;
    sender_id: string;
    sender_name: string;
  };
}

export interface Conversation {
  id: string;
  lastMessage?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  otherUser: {
    id: string;
    name: string;
    university: string;
    avatar_url?: string;
  };
  unreadCount: number;
}