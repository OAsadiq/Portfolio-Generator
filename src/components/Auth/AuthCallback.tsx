// src/components/Auth/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth callback
    const handleCallback = async () => {
      try {
        // Check if we have a session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          navigate('/login', { 
            state: { error: 'Authentication failed. Please try again.' } 
          });
          return;
        }

        if (session) {
          console.log('✅ Successfully authenticated!', session.user.email);
          // Redirect to templates page
          navigate('/templates', { replace: true });
        } else {
          // No session, go back to login
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-12 h-12 border-4 border-slate-700 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;