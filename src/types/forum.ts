// Update existing forum.ts with role types
export type ForumRole = 'admin' | 'moderator' | 'user';

export interface ForumRoleDefinition {
  id: string;
  role: ForumRole;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role_id: string;
  created_at: string;
  updated_at: string;
  role?: ForumRoleDefinition;
}

export interface ForumCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  parent_id?: string;
  position: number;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export interface ForumModerator {
  id: string;
  user_id: string;
  category_id: string;
  created_at: string;
  updated_at: string;
  user?: {
    name: string;
    avatar_url?: string;
  };
  category?: ForumCategory;
}

export interface ForumAnnouncement {
  id: string;
  title: string;
  content: string;
  author_id: string;
  is_active: boolean;
  starts_at: string;
  ends_at?: string;
  created_at: string;
  updated_at: string;
  author?: {
    name: string;
    avatar_url?: string;
  };
}

export interface AuditLogEntry {
  id: string;
  action_type: string;
  action_by: string;
  action_on: string;
  resource_type: string;
  details?: Record<string, any>;
  created_at: string;
}