export interface User {
  email: string;
  name: string;
  picture: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  accessToken: string | null;
  loading: boolean;
}
