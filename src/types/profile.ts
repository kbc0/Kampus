export interface Achievement {
  id: string;
  title: string;
  description: string;
  date: string;
  type: 'academic' | 'award' | 'certification' | 'other';
}

export interface ProfileStats {
  topicsCount: number;
  repliesCount: number;
  likesGivenCount: number;
  likesReceivedCount: number;
  friendsCount: number;
}

export interface ProfileDetails {
  id: string;
  name: string;
  university: string;
  bio?: string;
  avatar_url?: string;
  cover_image_url?: string;
  major?: string;
  minor?: string;
  subjects?: {
    canHelp: string[];
    needsHelp: string[];
  };
  social_links?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  achievements?: Achievement[];
  skills?: string[];
  interests?: string[];
  theme_preferences?: {
    primaryColor: string;
    layout: string;
    showStats: boolean;
  };
  stats?: ProfileStats;
  xp: number;
  level: number;
  level_title: string;
  created_at: string;
  updated_at: string;
}