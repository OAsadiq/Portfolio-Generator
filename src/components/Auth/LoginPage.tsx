/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

const LoginPage = () => {
  const { signInWithGoogle, signInWithOTP, verifyOTP, user, loading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (user && !loading) {
      const from = (location.state as any)?.from?.pathname || '/templates';
      navigate(from, { replace: true });
    }
  }, [user, loading, navigate, location]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

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

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter your email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const { data: userCheck, error: checkError } = await supabase.rpc('check_user_verified', {
        user_email: email
      });

      console.log('User check result:', { userCheck, checkError });

      let userExists = false;
      let emailVerified = false;

      if (checkError) {
        console.log('RPC error, using signInWithOtp response fallback');
        const result = await signInWithOTP(email);
        console.log('SignInWithOTP result:', result);
        
        userExists = !!result?.user;
        emailVerified = !!result?.session;
      } else {
        const checkResult = Array.isArray(userCheck) && userCheck.length > 0 ? userCheck[0] : null;
        console.log('Parsed check result:', checkResult);
        
        userExists = checkResult?.user_exists || false;
        emailVerified = checkResult?.email_verified || false;
        
        await signInWithOTP(email);
      }

      console.log('Final state:', { userExists, emailVerified });

      if (!emailVerified) {
        setIsNewUser(true);
        setOtpSent(true);
        setSuccess('📧 Check your email for a confirmation link. Click the link to verify your account and sign in.');
      } else {
        setIsNewUser(false);
        setOtpSent(true);
        setSuccess('✨ Welcome back! Check your email for a 6-digit code.');
      }
      
      setResendTimer(60);
      setIsLoading(false);
    } catch (err: any) {
      console.error('OTP send error:', err);
      
      if (err.message?.includes('rate limit') || err.message?.includes('Email rate limit exceeded')) {
        setError('Too many attempts. Please try again in 1 hour or use a different email.');
      } else if (err.message?.includes('Email not allowed')) {
        setError('This email domain is not allowed. Please use a different email.');
      } else {
        setError(err.message || 'Failed to send verification code');
      }
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await verifyOTP(email, otp);

      if (isNewUser) {
        setSuccess('Account created! Signing you in...');
      } else {
        setSuccess('Verified! Signing you in...');
      }
    } catch (err: any) {
      console.error('OTP verify error:', err);

      if (err.message?.includes('expired')) {
        setError('Code expired. Please request a new one.');
        setOtpSent(false);
        setOtp('');
      } else if (err.message?.includes('invalid') || err.message?.includes('Token has expired or is invalid')) {
        setError('Invalid code. Please check your email and try again.');
      } else if (err.message?.includes('Email link is invalid or has expired')) {
        setError('This code has already been used or expired. Request a new one.');
        setOtpSent(false);
        setOtp('');
      } else {
        setError(err.message || 'Verification failed. Please try again.');
      }
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      await signInWithOTP(email);

      setSuccess(isNewUser 
        ? 'New confirmation link sent! Check your email.'
        : 'New code sent! Check your email.'
      );
      setResendTimer(60);
      setIsLoading(false);
    } catch (err: any) {
      if (err.message?.includes('rate limit')) {
        setError('Rate limit reached. Please wait before requesting another code.');
      } else {
        setError(err.message || 'Failed to resend code');
      }
      setIsLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setOtpSent(false);
    setOtp('');
    setError(null);
    setSuccess(null);
    setIsNewUser(false);
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
              {otpSent 
                ? (isNewUser ? 'Check Your Email' : 'Welcome Back')
                : 'Welcome to Foliobase'
              }
            </h1>
            <p className="text-slate-400">
              {otpSent
                ? (isNewUser 
                    ? `Verify your email to complete signup`
                    : `We sent a code to ${email}`
                  )
                : 'Sign in or create an account'
              }
            </p>
          </div>

          {/* Google Sign In Button */}
          {!otpSent && (
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
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          )}

          {/* Divider */}
          {!otpSent && (
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-800/50 text-slate-500">Or continue with email</span>
              </div>
            </div>
          )}

          {/* Email OTP Flow */}
          {!otpSent ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all"
                  disabled={isLoading}
                  autoComplete="email"
                />
                <p className="mt-2 text-xs text-slate-500">
                  🔒 No password needed. We'll create your account or sign you in automatically.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : (
                  'Continue with Email'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="bg-slate-900/30 border border-slate-700/50 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-slate-300 text-sm truncate">{email}</span>
                </div>
                <button
                  type="button"
                  onClick={handleChangeEmail}
                  className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors whitespace-nowrap ml-2"
                >
                  Change
                </button>
              </div>

              {isNewUser ? (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 text-center">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                    </svg>
                  </div>
                  <p className="font-semibold text-blue-400 mb-2">Check Your Email</p>
                  <p className="text-blue-300 text-sm leading-relaxed">
                    We sent a <strong>confirmation link</strong> to <strong>{email}</strong>
                  </p>
                  <p className="text-blue-300/80 text-xs mt-3">
                    Click the link in your email to verify your account and sign in.
                  </p>
                  <p className="text-blue-400/60 text-xs mt-4">
                    Link expires in 24 hours
                  </p>
                  
                  {/* Resend for new users */}
                  <div className="mt-6">
                    {resendTimer > 0 ? (
                      <p className="text-sm text-slate-500">
                        Resend link in {resendTimer}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isLoading}
                        className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-50"
                      >
                        Didn't receive email? Resend
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="otp" className="block text-sm font-medium text-slate-300 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400 transition-all text-center text-2xl tracking-widest font-mono"
                      disabled={isLoading}
                      maxLength={6}
                      autoComplete="one-time-code"
                      autoFocus
                    />
                    <p className="mt-2 text-xs text-slate-500 text-center">
                      Enter the 6-digit code from your email
                    </p>
                  </div>

                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-sm text-slate-500">
                        Resend code in {resendTimer}s
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isLoading}
                        className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-50"
                      >
                        Didn't receive code? Resend
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </>
              )}
            </form>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {!otpSent && (
            <>
              <div className="relative mt-4 mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-700"></div>
                </div>
              </div>

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
            </>
          )}

          <p className="mt-6 text-xs text-slate-500 text-center">
            By continuing, you agree to our{' '}
            <a href="/privacy-policy" className="text-yellow-400 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy-policy" className="text-yellow-400 hover:underline">Privacy Policy</a>
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