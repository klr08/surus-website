// Authentication types for admin access
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'editor';
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}
