// src/components/Auth/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { postLoginPath, takeAfterLogin } from '../../lib/postLogin';

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
          const afterLogin = takeAfterLogin();

          if (afterLogin) {
            navigate(afterLogin, { replace: true });
          } else {
            // The old `pendingUpgrade` branch lived here. Nothing sets that flag now:
            // clicking Upgrade while logged out stashes `/pricing#upgrade` as the return
            // path instead, which this first branch already handles. The flag's other
            // reader, UpgradeHandler, auto-opened Stripe — which would silently pick card
            // over bank transfer and USDT.
            // Same rule the OTP form uses: returning builders get their dashboard.
            navigate(await postLoginPath(session.user.id, null), { replace: true });
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