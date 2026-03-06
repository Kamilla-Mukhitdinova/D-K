export type Owner = 'Kamilla' | 'Doszhan';

export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type WishStatus = 'planned' | 'achieved';

export type DefaultCategory = 'Home' | 'Work';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: string;
  status: TaskStatus;
  dueDateTime?: string;
  owner: Owner;
  createdAt: string;
  completedAt?: string;
}

export interface Wish {
  id: string;
  title: string;
  notes?: string;
  imageUrl?: string;
  category?: string;
  owner: Owner;
  status: WishStatus;
  createdAt: string;
  achievedAt?: string;
}

export interface DailyWishMessage {
  id: string;
  from: Owner;
  to: Owner;
  message: string;
  date: string;
  createdAt: string;
}

export type ViewFilter = 'all' | 'my' | 'partner';
export type PeriodFilter = 'today' | 'week' | 'all';
