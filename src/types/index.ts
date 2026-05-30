export type BookType = 'textbook' | 'reference' | 'ebook';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  publisher: string;
  year: number;
  type: BookType;
  coverUrl?: string;
  source?: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  createdBy: string;
  status: 'active' | 'trashed';
  deletedAt?: number;
  language?: string;
}

export interface Assessment {
  id: string;
  bookId: string;
  userId: string;
  userName: string;
  scores: {
    contentAccuracy: number;
    readability: number;
    pedagogy: number;
    visualDesign: number;
    relevance: number;
  };
  comments: string;
  recommendation: 'highly-recommended' | 'recommended' | 'neutral' | 'not-recommended';
  createdAt: number;
  status: 'active' | 'trashed';
  deletedAt?: number;
}

export interface UserProfile {
  uid: string;
  email?: string;
  phoneNumber?: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'evaluator';
  createdAt: number;
  language?: string;
}
