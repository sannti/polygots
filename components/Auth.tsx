import React, { useState } from 'react';
import { supabase } from '../services/db/supabaseClient';
import { GoogleIcon } from './icons';

const Auth: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Success! Please check your email for a confirmation link.' });
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setMessage({ type: 'error', text: error.message });
    }
    // On success, the onAuthStateChange listener in App.tsx will handle session update.
    setLoading(false);
  };

  const handleMagicLink = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email to receive a magic link.' });
      return;
    }
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Magic link sent! Check your email.' });
    }
    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      setMessage({ type: 'error', text: error.message });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 text-center">
      <div className="max-w-md w-full p-8 bg-gray-800 rounded-xl shadow-lg space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome to Polygots</h1>
          <p className="text-gray-400">
            Sign in or create an account to get started.
          </p>
        </div>

        {message && (
          <div className={`p-3 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-900/50 text-green-300'
              : 'bg-red-900/50 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSignIn} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            className="block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-200 py-2 px-3 disabled:opacity-50"
            required
            aria-label="Email Address"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="block w-full bg-gray-900 border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-gray-200 py-2 px-3 disabled:opacity-50"
            aria-label="Password"
          />
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading || !email || !password}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-600 text-base font-medium rounded-md shadow-sm text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-600/50 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? '...' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400">Or continue with</span>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleMagicLink}
            disabled={loading || !email}
            className="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-600 text-base font-medium rounded-md shadow-sm text-gray-300 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Sign in with Magic Link (OTP)
          </button>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-gray-800 bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900 transition-colors disabled:opacity-50"
          >
            <GoogleIcon className="w-6 h-6" />
            Sign in with Google
          </button>
        </div>
      </div>
       <footer className="w-full text-center mt-8 text-gray-500 text-sm">
          <p>Data will be securely stored in your Supabase database.</p>
      </footer>
    </div>
  );
};

export default Auth;
