/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Logo from '../Logo';
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
    if (!email) { setError('Please enter your email'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { setError('Please enter a valid email address'); return; }

    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      const { data: userCheck, error: checkError } = await supabase.rpc('check_user_verified', { user_email: email });
      let userExists = false;
      let emailVerified = false;

      if (checkError) {
        const result = await signInWithOTP(email);
        userExists = !!result?.user;
        emailVerified = !!result?.session;
      } else {
        const checkResult = Array.isArray(userCheck) && userCheck.length > 0 ? userCheck[0] : null;
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
    if (!otp || otp.length !== 6) { setError('Please enter the 6-digit code'); return; }
    try {
      setIsLoading(true);
      setError(null);
      await verifyOTP(email, otp);
      setSuccess(isNewUser ? 'Account created! Signing you in...' : 'Verified! Signing you in...');
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
      setSuccess(isNewUser ? 'New confirmation link sent! Check your email.' : 'New code sent! Check your email.');
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
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="inline-block w-10 h-10 border-[3px] border-stone-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  const INPUT = 'w-full px-4 py-3 bg-white border border-stone-200 rounded-xl text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-orange-100 focus:border-orange-500 transition-all';

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center py-10 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white border border-stone-200 rounded-3xl p-8 md:p-10 shadow-sm">

          {/* Back to Home */}
          <Link to="/" className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors mb-6 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </Link>

          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Logo size={52} showWordmark={false} />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 mb-1">
              {otpSent ? (isNewUser ? 'Check Your Email' : 'Welcome Back') : 'Welcome to Porfilr'}
            </h1>
            <p className="text-stone-500 text-sm">
              {otpSent
                ? (isNewUser ? 'Verify your email to complete signup' : `We sent a code to ${email}`)
                : 'Sign in or create an account'
              }
            </p>
          </div>

          {/* Google Sign In */}
          {!otpSent && (
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white hover:bg-stone-50 text-stone-800 font-semibold py-3 px-6 rounded-xl border border-stone-200 hover:border-stone-300 shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-stone-300 border-t-stone-700 rounded-full animate-spin"></div>
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
            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-stone-400">Or continue with email</span>
              </div>
            </div>
          )}

          {/* Email OTP Flow */}
          {!otpSent ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-xs font-semibold text-stone-600 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={INPUT}
                  disabled={isLoading}
                  autoComplete="email"
                />
                <p className="mt-1.5 text-xs text-stone-400">
                  🔒 No password needed. We'll create your account or sign you in automatically.
                </p>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </div>
                ) : 'Continue with Email'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-stone-700 text-sm truncate">{email}</span>
                </div>
                <button type="button" onClick={handleChangeEmail} className="text-xs text-orange-600 hover:text-orange-500 transition-colors whitespace-nowrap ml-2 font-medium">
                  Change
                </button>
              </div>

              {isNewUser ? (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center">
                  <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                    </svg>
                  </div>
                  <p className="font-semibold text-blue-700 mb-1.5">Check Your Email</p>
                  <p className="text-blue-600 text-sm leading-relaxed">
                    We sent a <strong>confirmation link</strong> to <strong>{email}</strong>
                  </p>
                  <p className="text-blue-500 text-xs mt-2">Click the link in your email to verify your account.</p>
                  <p className="text-blue-400 text-xs mt-3">Link expires in 24 hours</p>
                  <div className="mt-5">
                    {resendTimer > 0 ? (
                      <p className="text-sm text-stone-400">Resend link in {resendTimer}s</p>
                    ) : (
                      <button type="button" onClick={handleResendOTP} disabled={isLoading}
                        className="text-sm text-orange-600 hover:text-orange-500 transition-colors disabled:opacity-50 font-medium">
                        Didn't receive email? Resend
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="otp" className="block text-xs font-semibold text-stone-600 mb-1.5">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className={`${INPUT} text-center text-2xl tracking-widest font-mono`}
                      disabled={isLoading}
                      maxLength={6}
                      autoComplete="one-time-code"
                      autoFocus
                    />
                    <p className="mt-1.5 text-xs text-stone-400 text-center">Enter the 6-digit code from your email</p>
                  </div>

                  <div className="text-center">
                    {resendTimer > 0 ? (
                      <p className="text-sm text-stone-400">Resend code in {resendTimer}s</p>
                    ) : (
                      <button type="button" onClick={handleResendOTP} disabled={isLoading}
                        className="text-sm text-orange-600 hover:text-orange-500 transition-colors disabled:opacity-50 font-medium">
                        Didn't receive code? Resend
                      </button>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || otp.length !== 6}
                    className="w-full bg-orange-600 hover:bg-orange-500 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Verifying...</span>
                      </div>
                    ) : 'Sign In'}
                  </button>
                </>
              )}
            </form>
          )}

          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl text-green-700 text-sm flex items-start gap-3">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-3">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {!otpSent && (
            <>
              <div className="border-t border-stone-100 mt-6 mb-5" />
              <div className="space-y-2.5">
                {['Create one free portfolio', 'Free hosting included', 'No credit card required'].map(item => (
                  <div key={item} className="flex items-center gap-3 text-sm text-stone-600">
                    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <p className="mt-6 text-xs text-stone-400 text-center">
            By continuing, you agree to our{' '}
            <a href="/privacy-policy" className="text-orange-600 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy-policy" className="text-orange-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
