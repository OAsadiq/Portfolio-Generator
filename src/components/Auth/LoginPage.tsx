/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Auth/LoginPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const LoginPage = () => {
  const { signInWithGoogle, user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && !loading) {
      const from = (location.state as any)?.from?.pathname || '/templates';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await signInWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="inline-block w-12 h-12 border-4 border-slate-700 border-t-yellow-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-50 flex items-center justify-center py-10 px-4 relative overflow-hidden">
      
      {/* Animated Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-grid-horizontal pointer-events-none"></div>
          <div className="absolute inset-0 bg-grid-vertical pointer-events-none"></div>
        </div>
        <div className="absolute inset-0 bg-radial-gradient pointer-events-none"></div>
      </div>

      {/* Login Card */}
      <div className="max-w-md w-full relative z-10">
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-3xl p-8 md:p-10 shadow-2xl">
          
          {/* Back to Home */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-yellow-400 transition-colors mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>

          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-50 mb-2">
              Welcome to Foliobase
            </h1>
            <p className="text-slate-400">
              Sign in to create your free writing portfolio
            </p>
          </div>

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full bg-white hover:bg-gray-50 text-slate-900 font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-800/50 text-slate-500">One-time free template</span>
            </div>
          </div>

          {/* Features List */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-5 h-5 bg-green-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Create one free portfolio</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-5 h-5 bg-green-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>Free hosting included</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="w-5 h-5 bg-green-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span>No credit card required</span>
            </div>
          </div>

          {/* Terms */}
          <p className="mt-6 text-xs text-slate-500 text-center">
            By continuing, you agree to our{' '}
            <a href="#" className="text-yellow-400 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-yellow-400 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        .bg-grid-horizontal {
          background-image: linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px);
          background-size: 100% 50px;
          animation: gridMoveVertical 20s linear infinite;
        }
        .bg-grid-vertical {
          background-image: linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px);
          background-size: 50px 100%;
          animation: gridMoveHorizontal 20s linear infinite;
        }

        @keyframes gridMoveVertical {
          0% { background-position: 0 0; }
          100% { background-position: 0 50px; }
        }
        @keyframes gridMoveHorizontal {
          0% { background-position: 0 0; }
          100% { background-position: 50px 0; }
        }

        .bg-radial-gradient {
          background: radial-gradient(circle at 50% 50%, transparent 0%, rgba(15, 23, 42, 0.2) 50%, rgba(15, 23, 42, 0.6) 100%);
        }
      `}</style>
    </div>
  );
};

export default LoginPage;