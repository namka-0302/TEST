
export type Role = 'Admin' | 'User';

export interface User {
  id: string;
  name: string;
  role: Role;
  username: string;
}

export interface Account extends User {
  password: string;
}

export interface Choice {
  id: string;
  label: string; // A, B, C, D
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  choices: Choice[];
  explanation?: string;
  subject?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  createdAt: number;
  seenCount: number; // For tracking seen questions
}

export interface Quiz {
  id: string;
  title: string;
  questions: Question[];
  durationMinutes: number;
  createdAt: number;
  assignedTo?: string[]; // IDs of users assigned (optional)
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  timeSpent: number;
  answers: Record<string, string>; // questionId -> choiceId
  quizId: string;
  timestamp: number;
  userId?: string;
  userName?: string;
  quizTitle?: string;
}