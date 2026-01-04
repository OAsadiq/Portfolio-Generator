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

  // Check if user has Pro subscription
  const checkSubscription = useCallback(async () => {
    if (!user) {
      console.log('❌ No user, setting isPro to false');
      setIsPro(false);
      return;
    }

    try {
      console.log('🔍 Checking subscription for user:', user.id);
      
      // Get the most recent subscription (in case there are multiple)
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status, plan, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);

      console.log('📊 Subscription data:', data);

      if (error) {
        console.error('❌ Subscription error:', error);
        setIsPro(false);
        return;
      }

      // Check if we got any results
      if (data && data.length > 0) {
        const subscription = data[0];
        if (subscription.status === 'active' && subscription.plan === 'pro') {
          console.log('✅ User HAS Pro subscription!');
          setIsPro(true);
        } else {
          console.log('❌ Subscription found but not active pro:', subscription);
          setIsPro(false);
        }
      } else {
        console.log('❌ No subscription found');
        setIsPro(false);
      }
    } catch (err) {
      console.error('Exception checking subscription:', err);
      setIsPro(false);
    }
  }, [user]);

  // Check if user has used their free template
  const checkTemplateUsage = useCallback(async () => {
    if (!user) {
      setHasUsedFreeTemplate(false);
      return;
    }

    try {
      console.log('🔍 Checking template usage for user:', user.id);
      
      // Count how many times user has used the minimal-template
      const { error, count } = await supabase
        .from('user_portfolio_usage')
        .select('*', { count: 'exact', head: false })
        .eq('user_id', user.id)
        .eq('template_id', 'minimal-template');

      if (error) {
        console.error('Error checking template usage:', error);
        return;
      }

      const usageCount = count || 0;
      const hasUsed = usageCount > 0;
      console.log('📊 Minimal template usage count:', usageCount);
      console.log('📊 Has used free template:', hasUsed);
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

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setHasUsedFreeTemplate(false);
    setIsPro(false);
  };

  // Get initial session
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📱 Initial session:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 Auth state changed:', _event, session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check subscription and template usage when user changes
  useEffect(() => {
    if (user) {
      console.log('👤 User logged in, checking subscription and usage');
      checkSubscription();
      checkTemplateUsage();
    } else {
      console.log('👤 No user, resetting state');
      setIsPro(false);
      setHasUsedFreeTemplate(false);
    }
  }, [user, checkSubscription, checkTemplateUsage]);

  // Log current state for debugging
  useEffect(() => {
    console.log('🎯 Current Auth State:', {
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