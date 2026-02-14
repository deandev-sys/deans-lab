export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  COMPLEX_MULTIPLE_CHOICE = 'COMPLEX_MULTIPLE_CHOICE',
  SHORT_ANSWER = 'SHORT_ANSWER'
}

export interface Choice {
  id: string;
  text: string;
}

export interface ComplexStatement {
  id: string;
  text: string;
  correctValue: boolean; // True or False
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  passage?: string;
  imageUrl?: string;
  choices?: Choice[];
  statements?: ComplexStatement[];
  correctAnswer?: string; // For MC or Short Answer
  explanation: string;
  difficulty: number; // 1-5 for IRT weighting
  subject: string;
}

export interface Subtest {
  id: string;
  title: string;
  durationMinutes: number;
  questions: Question[];
}

export interface ExamPackage {
  id: string;
  title: string;
  price: number;
  isPremium: boolean;
  subtests: Subtest[];
  isOwned?: boolean;
  // --- TAMBAHAN UNTUK FILTER KATALOG DINAMIS ---
  packageType?: 'FULL' | 'MINI'; 
  subject?: string;
  topic?: string;
  // ---------------------------------------------
  lynkUrl?: string;
}

export interface UserResponse {
  questionId: string;
  answer: any; // string, boolean[], or numeric string
  isFlagged: boolean; // "Ragu-ragu"
}

export interface ExamSession {
  packageId: string;
  currentSubtestIndex: number;
  responses: Record<string, UserResponse>;
  startTime: number;
  subtestStartTime: number;
  isFinished: boolean;
}

export interface ExamResult {
  id: string;
  packageId: string;
  packageTitle: string;
  date: string;
  totalScore: number;
  subjectScores: Record<string, number>;
  responses: Record<string, UserResponse>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  ownedPackages: string[];
  school?: string;
  targetPtn?: string;
}