/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  hasUsedFreeTemplate: boolean;
  isPro: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithOTP: (email: string) => Promise<void>;
  verifyOTP: (email: string, token: string) => Promise<any>;
  signOut: () => Promise<void>;
  checkTemplateUsage: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasUsedFreeTemplate, setHasUsedFreeTemplate] = useState(false);
  const [isPro, setIsPro] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setIsPro(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status, plan, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error(error);
        setIsPro(false);
        return;
      }

      if (data && data.length > 0) {
        const subscription = data[0];
        if (subscription.status === 'active' && subscription.plan === 'pro') {
          setIsPro(true);
        } else {
          setIsPro(false);
        }
      } else {
        setIsPro(false);
      }
    } catch (err) {
      console.error(err);
      setIsPro(false);
    }
  }, [user]);

  const checkTemplateUsage = useCallback(async () => {
    if (!user) {
      setHasUsedFreeTemplate(false);
      return;
    }

    try {
      const { error, count } = await supabase
        .from('user_portfolio_usage')
        .select('*', { count: 'exact', head: false })
        .eq('user_id', user.id)
        .eq('template_id', 'minimal-template');

      if (error) {
        console.error(error);
        return;
      }

      const usageCount = count || 0;
      const hasUsed = usageCount > 0;

      setHasUsedFreeTemplate(hasUsed);
    } catch (err) {
      console.error('Exception checking template usage:', err);
    }
  }, [user]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) throw error;
  };

  const signInWithOTP = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true, 
      },
    });

    if (error) {
      throw error;
    }
  };

  const verifyOTP = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      throw error;
    }

    if (!data.session) {
      throw new Error('Verification failed. Please try again.');
    }

    return data;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setHasUsedFreeTemplate(false);
    setIsPro(false);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      checkSubscription();
      checkTemplateUsage();
    } else {
      setIsPro(false);
      setHasUsedFreeTemplate(false);
    }
  }, [user, checkSubscription, checkTemplateUsage]);

  useEffect(() => {
    console.log({
      userEmail: user?.email,
      isPro,
      hasUsedFreeTemplate,
      loading
    });
  }, [user, isPro, hasUsedFreeTemplate, loading]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        hasUsedFreeTemplate,
        isPro,
        signInWithGoogle,
        signInWithOTP,
        verifyOTP,
        signOut,
        checkTemplateUsage,
        checkSubscription,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};