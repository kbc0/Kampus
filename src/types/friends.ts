export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  created_at: string;
  updated_at: string;
  sender?: {
    name: string;
    university: string;
    avatar_url?: string;
  };
  receiver?: {
    name: string;
    university: string;
    avatar_url?: string;
  };
}

export interface Friend {
  id: string;
  name: string;
  university: string;
  avatar_url?: string;
  friendship_id: string;
}