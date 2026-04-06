'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (!loading && user) {
      router.push('/app');
    }
  }, [user, loading, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/app');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      setError(formatFirebaseError(message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setSubmitting(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/app');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create account';
      setError(formatFirebaseError(message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSubmitting(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/app');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in with Google';
      setError(formatFirebaseError(message));
    } finally {
      setSubmitting(false);
    }
  };

  function formatFirebaseError(message: string): string {
    if (message.includes('auth/invalid-credential')) return 'Invalid email or password';
    if (message.includes('auth/email-already-in-use')) return 'An account with this email already exists';
    if (message.includes('auth/weak-password')) return 'Password is too weak';
    if (message.includes('auth/invalid-email')) return 'Invalid email address';
    if (message.includes('auth/too-many-requests')) return 'Too many attempts. Please try again later';
    if (message.includes('auth/popup-closed-by-user')) return 'Sign-in popup was closed';
    return message;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4A017] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold font-mono tracking-[0.3em] text-[#E8E8E0]">
            SHADOW<span className="text-[#D4A017]">.</span>OPS
          </h1>
          <p className="mt-2 text-sm text-[#888888] tracking-wide">
            AI-Powered Dark Psychology Coaching
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#1A1A1A] border border-[#333333] rounded-xl p-8">
          {/* Tabs */}
          <div className="flex mb-8 border-b border-[#333333]">
            <button
              onClick={() => { setTab('signin'); setError(''); }}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wider transition-colors ${
                tab === 'signin'
                  ? 'text-[#D4A017] border-b-2 border-[#D4A017]'
                  : 'text-[#888888] hover:text-[#E8E8E0]'
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => { setTab('signup'); setError(''); }}
              className={`flex-1 pb-3 text-sm font-semibold tracking-wider transition-colors ${
                tab === 'signup'
                  ? 'text-[#D4A017] border-b-2 border-[#D4A017]'
                  : 'text-[#888888] hover:text-[#E8E8E0]'
              }`}
            >
              SIGN UP
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Sign In Form */}
          {tab === 'signin' && (
            <form onSubmit={handleSignIn} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-lg text-[#E8E8E0] placeholder-[#555555] focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017] transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-lg text-[#E8E8E0] placeholder-[#555555] focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017] transition-colors"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#D4A017] hover:bg-[#B8860B] text-[#0A0A0A] font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-wider text-sm"
              >
                {submitting ? 'SIGNING IN...' : 'SIGN IN'}
              </button>
            </form>
          )}

          {/* Sign Up Form */}
          {tab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-lg text-[#E8E8E0] placeholder-[#555555] focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017] transition-colors"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-lg text-[#E8E8E0] placeholder-[#555555] focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017] transition-colors"
                  placeholder="At least 6 characters"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#888888] uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[#0A0A0A] border border-[#333333] rounded-lg text-[#E8E8E0] placeholder-[#555555] focus:outline-none focus:border-[#D4A017] focus:ring-1 focus:ring-[#D4A017] transition-colors"
                  placeholder="Confirm your password"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-[#D4A017] hover:bg-[#B8860B] text-[#0A0A0A] font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed tracking-wider text-sm"
              >
                {submitting ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-[#333333]" />
            <span className="px-4 text-xs text-[#555555] uppercase tracking-wider">or</span>
            <div className="flex-1 border-t border-[#333333]" />
          </div>

          {/* Google Sign In */}
          <button
            onClick={handleGoogleSignIn}
            disabled={submitting}
            className="w-full py-3 bg-[#0A0A0A] border border-[#333333] hover:border-[#555555] text-[#E8E8E0] font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </button>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-[#555555]">
          Influence is a skill. Master it responsibly.
        </p>
      </div>
    </div>
  );
}
