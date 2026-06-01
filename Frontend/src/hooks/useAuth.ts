import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store/useStore';
import type { User } from '@/types';

let authInitialized = false;

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, setUser, setSession, authLoading, setAuthLoading, addToast } = useStore();

  useEffect(() => {
    if (authInitialized) return;
    authInitialized = true;

    // Check active session on mount
    const checkSession = async () => {
      try {
        setAuthLoading(true);
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session) {
          setSession(session);
          const sbUser = session.user;
          const appUser: User = {
            id: sbUser.id,
            email: sbUser.email || '',
            displayName: sbUser.user_metadata?.display_name || sbUser.email?.split('@')[0] || 'User',
            avatarUrl: sbUser.user_metadata?.avatar_url,
            createdAt: sbUser.created_at,
          };
          setUser(appUser);
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        setAuthLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        const sbUser = session.user;
        const appUser: User = {
          id: sbUser.id,
          email: sbUser.email || '',
          displayName: sbUser.user_metadata?.display_name || sbUser.email?.split('@')[0] || 'User',
          avatarUrl: sbUser.user_metadata?.avatar_url,
          createdAt: sbUser.created_at,
        };
        setUser(appUser);
      } else {
        setUser(null);
        setSession(null);
      }
      setAuthLoading(false);
    });

    return () => {
      // Don't unsubscribe on hook unmount because we only subscribe once globally
      // subscription.unsubscribe(); 
    };
  }, [setUser, setSession, setAuthLoading]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setSession(null);
      addToast({ type: 'success', message: 'Signed out successfully' });
      navigate('/login');
    } catch (err: any) {
      addToast({ type: 'error', message: err.message || 'Failed to sign out' });
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading: authLoading,
    signOut: handleSignOut,
  };
};

// Route guard hook
export const useRequireAuth = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/login');
    }
  }, [user, isLoading, navigate]);

  return { user, isLoading };
};

// Redirect if authenticated
export const useRedirectIfAuth = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard');
    }
  }, [user, isLoading, navigate]);

  return { user, isLoading };
};
