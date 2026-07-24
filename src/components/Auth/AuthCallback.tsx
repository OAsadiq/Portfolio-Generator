// src/components/Auth/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          navigate('/login', { 
            state: { error: 'Authentication failed. Please try again.' } 
          });
          return;
        }

        if (session) {

          // Return to where the user was headed before signing in (e.g. mid-way through
          // filling a portfolio). Set by promptSignup; survives the OAuth round-trip.
          const afterLogin = localStorage.getItem('porfilr_after_login');
          const pendingUpgrade = sessionStorage.getItem('pendingUpgrade');

          if (afterLogin) {
            localStorage.removeItem('porfilr_after_login');
            navigate(afterLogin, { replace: true });
          } else if (pendingUpgrade === 'true') {

            sessionStorage.removeItem('pendingUpgrade');

            navigate('/pricing', { replace: true });
          } else {
            navigate('/templates', { replace: true });
          }
        } else {
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error('Callback error:', err);
        navigate('/login', { 
          state: { error: 'Something went wrong. Please try again.' } 
        });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-10 h-10 border-4 border-stone-200 border-t-orange-600 rounded-full animate-spin mb-4"></div>
        <p className="text-stone-500 text-sm">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;