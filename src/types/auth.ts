export interface AuthUser {
  id: number;
  username: string;
  role: 'user' | 'admin' | string;
  fullName?: string | null;
  email?: string | null;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  expiresAt?: number | null;
}

