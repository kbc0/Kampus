export interface NotificationData {
  message_id?: string;
  conversation_id?: string;
  sender_id?: string;
  sender_name?: string;
  content?: string;
  reply_id?: string;
  topic_id?: string;
  author_id?: string;
  author_name?: string;
  topic_title?: string;
  friendship_id?: string;
  message?: string;
  receiver_id?: string;
  receiver_name?: string;
  warning_id?: string;
  warned_by?: string;
  created_at?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'message' | 'reply' | 'friend_request' | 'friend_request_accepted' | 'warning';
  data: NotificationData;
  read: boolean;
  created_at: string;
}