export interface Member {
  displayName: string;
  email: string;
  color: string;
  joinedAt: string;
  role: 'admin' | 'member';
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
  createdAt: string;
  createdBy: string;
  members: Record<string, Member>;
}

export interface Entry {
  id: string;
  text: string;
  author: string;
  category: string;
  ts: string;
  acked: boolean;
  ackedBy: string | null;
  completed: boolean;
  completedBy: string | null;
  completedAt: string | null;
  dueDate: string | null;
  notes: string;
}

export type CategoryId = 'task' | 'worry' | 'idea' | 'purchase' | 'trip' | 'life-admin' | 'other' | 'completed';

export interface Category {
  id: CategoryId;
  e: string;
  l: string;
  keys?: string[];
}
