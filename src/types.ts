export interface Subscriber {
  email: string;
  source: string;
  timestamp: string;
  userAgent?: string;
}

export interface ProofStory {
  id: string;
  title: string;
  role: string;
  quote: string;
  fullStory: string;
  achievement: string;
  stat?: string;
  imageAlt: string;
}

export interface AdminState {
  isAuthenticated: boolean;
  token: string | null;
  subscribers: Subscriber[];
  errorMessage: string | null;
}

