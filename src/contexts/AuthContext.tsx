/* eslint-disable react-refresh/only-export-components */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  subscriptionLoading: boolean;
  hasPortfolio: boolean;
  existingPortfolio: { slug: string; template_id: string } | null;
  isPro: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithOTP: (email: string) => Promise<any>;
  verifyOTP: (email: string, token: string) => Promise<any>;
  signOut: () => Promise<void>;
  checkPortfolio: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [hasPortfolio, setHasPortfolio] = useState(false);
  const [existingPortfolio, setExistingPortfolio] = useState<{ slug: string; template_id: string } | null>(null);
  const [isPro, setIsPro] = useState(false);

  const checkSubscription = useCallback(async () => {
    if (!user) {
      setIsPro(false);
      setSubscriptionLoading(false);
      return;
    }

    setSubscriptionLoading(true);
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
        setIsPro(subscription.status === 'active' && subscription.plan === 'pro');
      } else {
        setIsPro(false);
      }
    } catch (err) {
      console.error(err);
      setIsPro(false);
    } finally {
      setSubscriptionLoading(false);
    }
  }, [user]);

  const checkPortfolio = useCallback(async () => {
    if (!user) {
      setHasPortfolio(false);
      setExistingPortfolio(null);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('slug, template_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error(error);
        return;
      }

      if (data && data.length > 0) {
        setHasPortfolio(true);
        setExistingPortfolio({ slug: data[0].slug, template_id: data[0].template_id });
      } else {
        setHasPortfolio(false);
        setExistingPortfolio(null);
      }
    } catch (err) {
      console.error('Exception checking portfolio:', err);
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
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        shouldCreateUser: true,
      },
    });

    if (error) {
      throw error;
    }

    return data;
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
    setHasPortfolio(false);
    setExistingPortfolio(null);
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
      checkPortfolio();
    } else {
      setIsPro(false);
      setSubscriptionLoading(false);
      setHasPortfolio(false);
      setExistingPortfolio(null);
    }
  }, [user, checkSubscription, checkPortfolio]);



  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        subscriptionLoading,
        hasPortfolio,
        existingPortfolio,
        isPro,
        signInWithGoogle,
        signInWithOTP,
        verifyOTP,
        signOut,
        checkPortfolio,
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