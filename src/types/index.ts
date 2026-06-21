export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Status = 'Not Started' | 'In Progress' | 'Solved' | 'Needs Review';

export type Attempt = {
  date: string;       // ISO date string
  outcome: 'Solved' | 'Partial' | 'Failed';
  timeTaken: number;  // minutes
  notes: string;
  language: string;
};

export type Problem = {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  status: Status;
  tags: string[];
  companies: string[];
  frequency: number;    // 0–100 interview frequency score
  acceptance: number;   // percentage
  attempts: Attempt[];
  notes: string;
  leetcodeUrl?: string;
  videoUrl?: string;
  isPremium: boolean;
  isBookmarked: boolean;
  lastAttempted?: string; // ISO date string
};

export type Topic = {
  id: string;
  name: string;
  icon: string;
  color: string;
  totalProblems: number;
  solvedProblems: number;
  problems: string[]; // Problem IDs
};

export type RevisionEntry = {
  id: string;
  problemId: string;
  scheduledDate: string; // ISO date string
  completed: boolean;
  priority: 'Low' | 'Medium' | 'High';
};

export type MockTest = {
  id: string;
  title: string;
  duration: number;      // minutes
  difficulty: Difficulty;
  problems: string[];    // Problem IDs
  createdAt: string;
  completedAt?: string;
  score?: number;        // percentage
};

export type UserStats = {
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  streak: number;
  lastActive: string;
  totalAttempts: number;
};

export type FilterState = {
  difficulty: Difficulty[];
  status: Status[];
  tags: string[];
  companies: string[];
  search: string;
  bookmarked: boolean;
};
