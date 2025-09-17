import React from 'react';
import { supabase } from '../services/db/supabaseClient';
import { GoogleIcon } from './icons';

const Auth: React.FC = () => {
  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      console.error('Error logging in with Google:', error.message);
      // You could display an error message to the user here
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 text-center">
      <div className="max-w-md w-full p-8 bg-gray-800 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome to Polygots</h1>
        <p className="text-gray-400 mb-8">
          Sign in to create and study your personal language flashcards.
        </p>
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-gray-800 bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-gray-900 transition-colors"
        >
          <GoogleIcon className="w-6 h-6" />
          Sign in with Google
        </button>
      </div>
      <footer className="w-full text-center mt-8 text-gray-500 text-sm">
          <p>Data will be securely stored in your Supabase database.</p>
      </footer>
    </div>
  );
};

export default Auth;
