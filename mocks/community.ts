import { Post, User } from '@/types/tally';

export type UserStatusUpdate = {
  id: string;
  userId: string;
  content: string;
  timeAgo: string;
  likes: number;
  comments: number;
  tag: string;
};

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Martinez',
    username: 'sarahmartinez',
    email: 'sarah@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    bio: '90 days sober 🎉 One day at a time',
    blockedUsers: [],
    followersCount: 234,
    followingCount: 156,
    createdAt: Date.now() - 90 * 24 * 60 * 60 * 1000,
  },
  {
    id: '2',
    name: 'Marcus Chen',
    username: 'marcuschen',
    email: 'marcus@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    bio: 'Recovery warrior | Fitness enthusiast',
    blockedUsers: [],
    followersCount: 567,
    followingCount: 289,
    createdAt: Date.now() - 180 * 24 * 60 * 60 * 1000,
  },
  {
    id: '3',
    name: 'Emma Johnson',
    username: 'emmajohnson',
    email: 'emma@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    bio: 'Taking back control of my life 💪',
    blockedUsers: [],
    followersCount: 892,
    followingCount: 445,
    createdAt: Date.now() - 45 * 24 * 60 * 60 * 1000,
  },
  {
    id: '4',
    name: 'David Kim',
    username: 'davidkim',
    email: 'david@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    bio: '1 year sober! Never looking back',
    blockedUsers: [],
    followersCount: 1234,
    followingCount: 678,
    createdAt: Date.now() - 365 * 24 * 60 * 60 * 1000,
  },
  {
    id: '5',
    name: 'Priya Patel',
    username: 'priyapatel',
    email: 'priya@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    bio: 'Mental health advocate | Therapy changed my life',
    blockedUsers: [],
    followersCount: 445,
    followingCount: 234,
    createdAt: Date.now() - 120 * 24 * 60 * 60 * 1000,
  },
  {
    id: '6',
    name: 'Alex Rivera',
    username: 'alexrivera',
    email: 'alex@example.com',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    bio: 'Living my best life without substances 🌟',
    blockedUsers: [],
    followersCount: 678,
    followingCount: 345,
    createdAt: Date.now() - 200 * 24 * 60 * 60 * 1000,
  },
];

const mockStatusesByUser: Record<string, UserStatusUpdate[]> = {
  '1': [
    {
      id: 'status-1-1',
      userId: '1',
      content: 'Day 90: stacked gratitude, a sunrise run, and journaling. Energy is unreal today.',
      timeAgo: '1h ago',
      likes: 214,
      comments: 29,
      tag: 'Momentum',
    },
    {
      id: 'status-1-2',
      userId: '1',
      content: 'Skipped a party tonight and hosted a mocktail circle instead. Choosing my peace.',
      timeAgo: '6h ago',
      likes: 188,
      comments: 23,
      tag: 'Boundaries',
    },
  ],
  '2': [
    {
      id: 'status-2-1',
      userId: '2',
      content: 'Hit PRs in the gym and celebrated with a cold plunge. No vape, just vibes.',
      timeAgo: '3h ago',
      likes: 276,
      comments: 34,
      tag: 'Discipline',
    },
    {
      id: 'status-2-2',
      userId: '2',
      content: 'Shared my craving toolkit with the group chat today. Community wins.',
      timeAgo: 'Yesterday',
      likes: 198,
      comments: 17,
      tag: 'Accountability',
    },
  ],
  '3': [
    {
      id: 'status-3-1',
      userId: '3',
      content: 'Therapy breakthrough: reframed my triggers into data points. Proud of the work.',
      timeAgo: '2h ago',
      likes: 332,
      comments: 41,
      tag: 'Clarity',
    },
    {
      id: 'status-3-2',
      userId: '3',
      content: 'Hosted a reflection circle tonight. Tears, laughter, and breakthroughs.',
      timeAgo: '8h ago',
      likes: 267,
      comments: 36,
      tag: 'Community',
    },
  ],
  '4': [
    {
      id: 'status-4-1',
      userId: '4',
      content: '365-day check-in: still choosing the quiet ritual over the loud room.',
      timeAgo: '4h ago',
      likes: 412,
      comments: 54,
      tag: 'Anniversary',
    },
    {
      id: 'status-4-2',
      userId: '4',
      content: 'Mentored two newcomers tonight. Remembering day one keeps me humble.',
      timeAgo: '14h ago',
      likes: 356,
      comments: 38,
      tag: 'Service',
    },
  ],
  '5': [
    {
      id: 'status-5-1',
      userId: '5',
      content: 'Reset playlist is live. Breathwork + lo-fi = calm nervous system.',
      timeAgo: '45m ago',
      likes: 248,
      comments: 26,
      tag: 'Wellness',
    },
    {
      id: 'status-5-2',
      userId: '5',
      content: 'Held space for someone else’s story today. Healing is collective.',
      timeAgo: '9h ago',
      likes: 189,
      comments: 22,
      tag: 'Support',
    },
  ],
  '6': [
    {
      id: 'status-6-1',
      userId: '6',
      content: 'Day 30 offline and my focus is razor sharp. Documenting the toolkit soon.',
      timeAgo: '5h ago',
      likes: 302,
      comments: 31,
      tag: 'Focus',
    },
    {
      id: 'status-6-2',
      userId: '6',
      content: 'Traded doom scroll for sunset walks. Heart rate variability up 12%.',
      timeAgo: 'Yesterday',
      likes: 224,
      comments: 19,
      tag: 'Recovery',
    },
  ],
};

const fallbackStatuses: UserStatusUpdate[] = [
  {
    id: 'status-fallback-1',
    userId: 'fallback',
    content: 'Locking in small wins today. Hydration, journaling, and texting my accountability partner.',
    timeAgo: 'Today',
    likes: 84,
    comments: 9,
    tag: 'Routine',
  },
  {
    id: 'status-fallback-2',
    userId: 'fallback',
    content: 'Shared a craving story in group chat and felt the wave pass. Proud of the check-in.',
    timeAgo: '1d ago',
    likes: 92,
    comments: 11,
    tag: 'Courage',
  },
];

const now = Date.now();
const dayMs = 24 * 60 * 60 * 1000;

export const mockPosts: Post[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Sarah Martinez',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: '90 days without alcohol! 🎉 This is the longest I\'ve been sober in 10 years. To anyone struggling, you can do this!',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&auto=format&fit=crop',
    tallyId: 'mock-1',
    category: 'alcohol',
    reactions: 234,
    commentsCount: 45,
    isPublic: true,
    createdAt: now - 2 * 60 * 60 * 1000,
  },
  {
    id: '2',
    userId: '2',
    userName: 'Marcus Chen',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    content: 'Day 180 of no vaping. My lungs feel amazing and I saved over $1,500! 💰',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
    tallyId: 'mock-2',
    category: 'vaping',
    reactions: 156,
    commentsCount: 28,
    isPublic: true,
    createdAt: now - 5 * 60 * 60 * 1000,
  },
  {
    id: '3',
    userId: '3',
    userName: 'Emma Johnson',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    content: 'Started therapy 6 weeks ago and it\'s been life-changing. If you\'re on the fence, take that first step. You\'re worth it! 💙',
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=900&auto=format&fit=crop',
    tallyId: 'mock-3',
    category: 'therapy',
    reactions: 445,
    commentsCount: 67,
    isPublic: true,
    createdAt: now - 8 * 60 * 60 * 1000,
  },
  {
    id: '4',
    userId: '4',
    userName: 'David Kim',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    content: '365 days clean from alcohol! One year ago I couldn\'t imagine getting here. To everyone starting their journey: it gets easier, I promise. 🙏',
    imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80',
    tallyId: 'mock-4',
    category: 'alcohol',
    reactions: 892,
    commentsCount: 134,
    isPublic: true,
    createdAt: now - 12 * 60 * 60 * 1000,
  },
  {
    id: '5',
    userId: '5',
    userName: 'Priya Patel',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    content: '4 months of consistent workouts! 🏋️‍♀️ Never thought I\'d be that person who actually enjoys the gym.',
    imageUrl: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=900&auto=format&fit=crop',
    tallyId: 'mock-5',
    category: 'working-out',
    reactions: 234,
    commentsCount: 42,
    isPublic: true,
    createdAt: now - 1 * dayMs,
  },
  {
    id: '6',
    userId: '6',
    userName: 'Alex Rivera',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    content: '30 days without social media and I feel so much more present. Deleted Instagram, Twitter, and TikTok. Life is happening in real time now! 📵',
    imageUrl: 'https://images.unsplash.com/photo-1525182008055-f88b95ff7980?w=900&auto=format&fit=crop',
    tallyId: 'mock-6',
    category: 'no-social-media',
    reactions: 567,
    commentsCount: 89,
    isPublic: true,
    createdAt: now - 2 * dayMs,
  },
  {
    id: '7',
    userId: '1',
    userName: 'Sarah Martinez',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    content: 'Morning run complete! ☀️ Who knew sobriety would turn me into a morning person?',
    imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800&q=80',
    reactions: 123,
    commentsCount: 15,
    isPublic: true,
    createdAt: now - 3 * dayMs,
  },
  {
    id: '8',
    userId: '2',
    userName: 'Marcus Chen',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    content: 'Hit the 6-month milestone! Feeling stronger every day 💪',
    imageUrl: 'https://images.unsplash.com/photo-1546484959-fcc4b70913ea?w=900&auto=format&fit=crop',
    tallyId: 'mock-2',
    category: 'vaping',
    reactions: 345,
    commentsCount: 52,
    isPublic: true,
    createdAt: now - 4 * dayMs,
  },
  {
    id: '9',
    userId: '4',
    userName: 'David Kim',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    content: 'Gratitude post: thankful for this community, my support system, and second chances. 🙏❤️',
    imageUrl: 'https://images.unsplash.com/photo-1526481280695-3c46917a1805?w=900&auto=format&fit=crop',
    reactions: 678,
    commentsCount: 98,
    isPublic: true,
    createdAt: now - 5 * dayMs,
  },
  {
    id: '10',
    userId: '5',
    userName: 'Priya Patel',
    userAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    content: 'Therapy session today made me realize how far I\'ve come. The work is hard but so worth it. Keep going everyone! 💙',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&auto=format&fit=crop',
    tallyId: 'mock-3',
    category: 'therapy',
    reactions: 289,
    commentsCount: 34,
    isPublic: true,
    createdAt: now - 6 * dayMs,
  },
];

export const getMockPostsByCategory = (category?: string): Post[] => {
  if (!category || category === 'all') {
    return mockPosts;
  }
  return mockPosts.filter(post => post.category === category);
};

export const getMockPostsByUser = (userId: string): Post[] => {
  return mockPosts.filter(post => post.userId === userId);
};

export const getMockStatusesByUser = (userId: string): UserStatusUpdate[] => {
  const existing = mockStatusesByUser[userId];
  if (existing) {
    return existing;
  }
  return fallbackStatuses.map((status, index) => ({
    ...status,
    id: `${userId}-status-${index}`,
    userId,
  }));
};
