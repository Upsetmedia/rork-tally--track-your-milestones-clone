import Colors from "../constants/colors";

export type ThreadMessage = {
  id: string;
  author: 'me' | 'them';
  text: string;
  timestamp: string;
  isPinned?: boolean;
};

export type MessageThread = {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  preview: string;
  timestamp: string;
  unreadCount: number;
  messages: ThreadMessage[];
  moodTag?: {
    label: string;
    color: string;
  };
};

export const messageThreads: MessageThread[] = [
  {
    id: "aurora-habits",
    name: "Aurora Habits Circle",
    handle: "aurora_circle",
    avatarUrl: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80",
    preview: "We checked in today – proud of the momentum you’re keeping.",
    timestamp: "2m",
    unreadCount: 3,
    messages: [
      {
        id: "aurora-1",
        author: "them",
        text: "Morning accountability check: how are you arriving today?",
        timestamp: "8:01 AM",
      },
      {
        id: "aurora-2",
        author: "me",
        text: "Woke up heavy, but I did the reset breathing. Feeling lighter now.",
        timestamp: "8:04 AM",
      },
      {
        id: "aurora-3",
        author: "them",
        text: "That’s the practice. Share a voice note later if you want a mid-day reset.",
        timestamp: "8:05 AM",
      },
    ],
    moodTag: {
      label: "supportive",
      color: Colors.primary,
    },
  },
  {
    id: "coach-lena",
    name: "Coach Lena",
    handle: "lenatheguide",
    avatarUrl: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?auto=format&fit=crop&w=160&q=80",
    preview: "You’re 4 days into your streak – want a new micro-goal for tomorrow?",
    timestamp: "12m",
    unreadCount: 0,
    messages: [
      {
        id: "lena-1",
        author: "them",
        text: "Just reviewed your habit notes. You’re already pacing above last week.",
        timestamp: "7:42 AM",
      },
      {
        id: "lena-2",
        author: "them",
        text: "Would a 5-minute gratitude reflection anchor tomorrow for you?",
        timestamp: "7:42 AM",
      },
      {
        id: "lena-3",
        author: "me",
        text: "Yes, stack it right after my tea. I’ll log it in the journal.",
        timestamp: "7:45 AM",
      },
    ],
    moodTag: {
      label: "mentor",
      color: "#EC4899",
    },
  },
  {
    id: "reset-buddy",
    name: "Reset Buddy",
    handle: "buddy.alina",
    avatarUrl: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=160&q=80",
    preview: "Saved a grounding exercise for you. Let me know if it resonates.",
    timestamp: "45m",
    unreadCount: 2,
    messages: [
      {
        id: "buddy-1",
        author: "them",
        text: "Saved a grounding exercise for you. Let me know if it resonates.",
        timestamp: "Yesterday",
      },
      {
        id: "buddy-2",
        author: "me",
        text: "Listening now, the breath count pacing feels perfect.",
        timestamp: "Yesterday",
      },
      {
        id: "buddy-3",
        author: "them",
        text: "Pinning it so you can find it pre-meetings.",
        timestamp: "Yesterday",
        isPinned: true,
      },
    ],
  },
  {
    id: "breathwork-crew",
    name: "Breathwork Crew",
    handle: "calm_collective",
    avatarUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=160&q=80",
    preview: "Session tonite at 9 EST. Bring your favorite mantra!",
    timestamp: "1h",
    unreadCount: 0,
    moodTag: {
      label: "event",
      color: "#22C55E",
    },
    messages: [
      {
        id: "breath-1",
        author: "them",
        text: "Reminder: session tonight at 9 EST. Theme is ‘soft focus’.",
        timestamp: "Monday",
      },
      {
        id: "breath-2",
        author: "me",
        text: "Got it. I’ll bring the new mantra I wrote yesterday.",
        timestamp: "Monday",
      },
      {
        id: "breath-3",
        author: "them",
        text: "Love. Leaving a playlist here if you want ambience before we start.",
        timestamp: "Monday",
      },
    ],
  },
  {
    id: "sleep-journal",
    name: "Sleep Journal",
    handle: "dreamsync",
    avatarUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=160&q=80",
    preview: "Ready for tonight’s wind-down prompts? I’ve got a calming set.",
    timestamp: "4h",
    unreadCount: 1,
    messages: [
      {
        id: "sleep-1",
        author: "them",
        text: "Ready for tonight’s wind-down prompts? I’ve got a calming set.",
        timestamp: "Sunday",
      },
      {
        id: "sleep-2",
        author: "me",
        text: "Please send. I’m aiming for lights out by 10:30.",
        timestamp: "Sunday",
      },
      {
        id: "sleep-3",
        author: "them",
        text: "Stacking a body scan audio with it—let me know what lands.",
        timestamp: "Sunday",
      },
    ],
  },
];
