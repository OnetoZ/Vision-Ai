import { createContext, useContext, useEffect, useState } from 'react';
import { fetchApi } from './api';

interface User {
  id: string;
  email: string;
  full_name?: string;
  is_admin?: boolean;
  brand_name?: string;
  website_url?: string;
  industry?: string;
  mobile_number?: string;
  is_approved?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('vision_ai_token');
    if (token) {
      // Try to fetch current user info
      fetchApi('/auth/me')
        .then((userData) => {
          setUser(userData as User);
        })
        .catch(() => {
          // Token invalid or expired
          localStorage.removeItem('vision_ai_token');
          setUser(null);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = (token: string, userData: User) => {
    localStorage.setItem('vision_ai_token', token);
    setUser(userData);
  };

  const signOut = () => {
    localStorage.removeItem('vision_ai_token');
    setUser(null);
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
