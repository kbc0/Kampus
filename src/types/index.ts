export type AuthView = 'landing' | 'login' | 'register';

export type University = 'Boğaziçi' | 'Bilkent' | 'Koç' | 'Sabancı' | 'İTÜ' | 'ODTÜ' | 'Galatasaray' | 'Hacettepe';

export interface UserSubjects {
  canHelp: string[];
  needsHelp: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  university?: University;
  bio?: string;
  subjects?: UserSubjects;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  authView: AuthView;
  setAuthView: (view: AuthView) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, name: string, university: University) => Promise<void>;
}