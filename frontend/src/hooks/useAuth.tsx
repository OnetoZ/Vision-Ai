import { useAuthContext } from '@/lib/auth';

export const useAuth = () => {
  const { user, loading, signOut } = useAuthContext();

  return {
    user,
    session: user ? { user } : null,
    isLoading: loading,
    signOut,
    isAuthenticated: !!user,
  };
};
