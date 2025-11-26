// auth-context.d.ts
export interface AuthContextType {
  user: any | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<{ error: any | null }>;
  resetPassword: (email: string) => Promise<{ error: any | null }>;
}

export function AuthProvider({ children }: { children: React.ReactNode }): JSX.Element;
export function useAuth(): AuthContextType;