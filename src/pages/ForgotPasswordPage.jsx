import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock - would send email in production
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-white mb-4">🔑 Forgot Password</h1>
        
        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-gray-400">Enter your email to receive a reset link.</p>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com" required />
            <button type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg">
              📧 Send Reset Link
            </button>
          </form>
        ) : (
          <div>
            <div className="text-6xl mb-4">📧</div>
            <p className="text-green-400 text-lg">Reset link sent to <strong>{email}</strong></p>
            <p className="text-gray-400 mt-2">Check your inbox and follow the instructions.</p>
          </div>
        )}
        
        <Link to="/login" className="text-blue-400 hover:underline mt-6 inline-block">
          ← Back to Login
        </Link>
      </div>
    </div>
  );
}