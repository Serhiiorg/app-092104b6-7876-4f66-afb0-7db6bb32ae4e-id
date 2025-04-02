export interface User {
  id: string;
  username: string;
  email: string;
  profilePicture?: string;
  createdAt: Date;
  lastLogin?: Date;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  darkMode: boolean;
  notificationsEnabled: boolean;
  reminderTime?: string; // Format: "HH:MM"
  preferredMeditationDuration: number; // in minutes
}

export interface MeditationSession {
  id: string;
  userId: string;
  title: string;
  duration: number; // in minutes
  completedAt: Date;
  rating?: number; // 1-5 stars
  notes?: string;
  videoId?: string; // YouTube video ID if used
}

export interface Schedule {
  id: string;
  userId: string;
  title: string;
  dayOfWeek: DayOfWeek[];
  time: string; // Format: "HH:MM"
  duration: number; // in minutes
  reminderEnabled: boolean;
  videoId?: string; // YouTube video ID if scheduled
}

export type DayOfWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export interface FavoriteVideo {
  id: string;
  userId: string;
  videoId: string; // YouTube video ID
  title: string;
  thumbnailUrl: string;
  duration: number; // in minutes
  addedAt: Date;
  tags?: string[];
}

export interface UserProgress {
  userId: string;
  totalSessions: number;
  totalMinutes: number;
  currentStreak: number; // consecutive days
  longestStreak: number;
  lastSessionDate?: Date;
  weeklyGoal?: number; // sessions per week
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  earnedAt: Date;
  iconUrl: string;
}

// Mock Data
export const mockUsers: User[] = [
  {
    id: "u1",
    username: "mindful_meditator",
    email: "mindful@example.com",
    profilePicture:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    createdAt: new Date("2023-01-15"),
    lastLogin: new Date("2023-06-10"),
    preferences: {
      darkMode: true,
      notificationsEnabled: true,
      reminderTime: "07:30",
      preferredMeditationDuration: 15,
    },
  },
  {
    id: "u2",
    username: "zen_master",
    email: "zen@example.com",
    profilePicture:
      "https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80",
    createdAt: new Date("2023-02-20"),
    lastLogin: new Date("2023-06-09"),
    preferences: {
      darkMode: false,
      notificationsEnabled: true,
      reminderTime: "20:00",
      preferredMeditationDuration: 20,
    },
  },
];

export const mockMeditationSessions: MeditationSession[] = [
  {
    id: "ms1",
    userId: "u1",
    title: "Morning Mindfulness",
    duration: 15,
    completedAt: new Date("2023-06-09T08:15:00"),
    rating: 4,
    notes: "Felt very relaxed and focused afterward",
    videoId: "inpok4MKVLM",
  },
  {
    id: "ms2",
    userId: "u1",
    title: "Stress Relief",
    duration: 10,
    completedAt: new Date("2023-06-08T19:30:00"),
    rating: 5,
    videoId: "O-6f5wQXSu8",
  },
  {
    id: "ms3",
    userId: "u2",
    title: "Deep Relaxation",
    duration: 20,
    completedAt: new Date("2023-06-09T21:00:00"),
    rating: 5,
    notes: "Best session this week",
  },
];

export const mockSchedules: Schedule[] = [
  {
    id: "s1",
    userId: "u1",
    title: "Morning Meditation",
    dayOfWeek: ["Monday", "Wednesday", "Friday"],
    time: "07:30",
    duration: 15,
    reminderEnabled: true,
    videoId: "inpok4MKVLM",
  },
  {
    id: "s2",
    userId: "u1",
    title: "Evening Wind Down",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    time: "21:00",
    duration: 10,
    reminderEnabled: true,
  },
  {
    id: "s3",
    userId: "u2",
    title: "Weekend Deep Meditation",
    dayOfWeek: ["Saturday", "Sunday"],
    time: "10:00",
    duration: 30,
    reminderEnabled: false,
    videoId: "O-6f5wQXSu8",
  },
];

export const mockFavoriteVideos: FavoriteVideo[] = [
  {
    id: "fv1",
    userId: "u1",
    videoId: "inpok4MKVLM",
    title: "15-Minute Mindfulness Meditation",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80",
    duration: 15,
    addedAt: new Date("2023-05-20"),
    tags: ["mindfulness", "beginner", "guided"],
  },
  {
    id: "fv2",
    userId: "u1",
    videoId: "O-6f5wQXSu8",
    title: "Stress Relief Meditation",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80",
    duration: 10,
    addedAt: new Date("2023-05-25"),
    tags: ["stress", "quick", "guided"],
  },
  {
    id: "fv3",
    userId: "u2",
    videoId: "ZToicYcHIOU",
    title: "Deep Sleep Meditation",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1574482620826-40685ca5ebd2?ixlib=rb-1.2.1&auto=format&fit=crop&w=720&q=80",
    duration: 30,
    addedAt: new Date("2023-06-01"),
    tags: ["sleep", "relaxation", "evening"],
  },
];

export const mockUserProgress: UserProgress[] = [
  {
    userId: "u1",
    totalSessions: 42,
    totalMinutes: 630,
    currentStreak: 7,
    longestStreak: 14,
    lastSessionDate: new Date("2023-06-09"),
    weeklyGoal: 5,
    achievements: [
      {
        id: "a1",
        name: "First Week Complete",
        description:
          "Completed at least one meditation session every day for a week",
        earnedAt: new Date("2023-02-01"),
        iconUrl:
          "https://images.unsplash.com/photo-1589561253898-768105ca91a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&q=80",
      },
      {
        id: "a2",
        name: "Mindfulness Master",
        description: "Completed 30 meditation sessions",
        earnedAt: new Date("2023-04-15"),
        iconUrl:
          "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&q=80",
      },
    ],
  },
  {
    userId: "u2",
    totalSessions: 28,
    totalMinutes: 560,
    currentStreak: 3,
    longestStreak: 10,
    lastSessionDate: new Date("2023-06-09"),
    weeklyGoal: 3,
    achievements: [
      {
        id: "a1",
        name: "First Week Complete",
        description:
          "Completed at least one meditation session every day for a week",
        earnedAt: new Date("2023-03-10"),
        iconUrl:
          "https://images.unsplash.com/photo-1589561253898-768105ca91a8?ixlib=rb-1.2.1&auto=format&fit=crop&w=64&q=80",
      },
    ],
  },
];
