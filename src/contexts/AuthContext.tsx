/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  hasUsedFreeTemplate: boolean;
  checkTemplateUsage: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasUsedFreeTemplate, setHasUsedFreeTemplate] = useState(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Check template usage when user logs in
        if (session?.user) {
          await checkTemplateUsage();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkTemplateUsage = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_portfolio_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('template_id', 'minimal-template') // Free template ID
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error checking template usage:', error);
      }

      setHasUsedFreeTemplate(!!data);
    } catch (err) {
      console.error('Error checking template usage:', err);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Use environment variable for redirect URL, fallback to current origin
      const baseUrl = import.meta.env.VITE_REDIRECT_URL || window.location.origin;
      const redirectUrl = `${baseUrl}/templates`;
      
      console.log('Redirecting to:', redirectUrl); // Debug log
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false, // Ensure browser redirect happens
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setHasUsedFreeTemplate(false);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
    hasUsedFreeTemplate,
    checkTemplateUsage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};