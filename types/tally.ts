export type SobrietyCategory = 
  | 'alcohol'
  | 'vaping'
  | 'marijuana'
  | 'nicotine'
  | 'opioids'
  | 'meth'
  | 'cocaine'
  | 'pills'
  | 'energy-drinks'
  | 'other-sobriety';

export type LifeEventCategory =
  | 'breakup'
  | 'therapy'
  | 'faith'
  | 'no-porn'
  | 'no-junk-food'
  | 'no-social-media'
  | 'working-out'
  | 'business'
  | 'journaling'
  | 'meditation'
  | 'other-life';

export type TallyCategory = SobrietyCategory | LifeEventCategory;

export type TallyType = 'sobriety' | 'life-event';

export interface Tally {
  id: string;
  type: TallyType;
  category: TallyCategory;
  customName?: string;
  title: string;
  subcategory?: string;
  startDate: number;
  dailyCost: number;
  reason?: string;
  tags: string[];
  createdAt: number;
}

export interface Milestone {
  days: number;
  label: string;
  reached: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  mailingAddress?: string;
  blockedUsers: string[];
  followersCount: number;
  followingCount: number;
  createdAt: number;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content?: string;
  imageUrl?: string;
  tallyId?: string;
  category?: string;
  reactions: number;
  commentsCount: number;
  isPublic: boolean;
  createdAt: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: number;
}

export interface Notification {
  id: string;
  type: 'milestone' | 'follow' | 'reaction' | 'comment' | 'reset';
  title: string;
  message: string;
  read: boolean;
  userId?: string;
  tallyId?: string;
  createdAt: number;
}

export interface PublicTally extends Tally {
  userId: string;
  userName: string;
  userAvatar?: string;
  isPublic: boolean;
  reactions: number;
}

export interface JournalEntry {
  id: string;
  mood: number;
  entry?: string;
  tallyId?: string;
  timestamp: number;
}
