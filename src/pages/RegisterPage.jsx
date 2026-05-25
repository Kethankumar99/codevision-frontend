import React, { useState } from 'react';
import { registerUser, setToken } from '../services/api';

export default function RegisterPage({ onRegister, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Auto-generate username from email
      const username = email.split('@')[0];
      
      const res = await registerUser({ 
        email, username, password, fullName 
      });
      
      const token = res.data.data?.accessToken || res.data.accessToken;
      
      if (token) {
        setToken(token);
        setSuccess('Account created! Redirecting...');
        setTimeout(() => onRegister(token), 1000);
      } else {
        setSuccess('Account created! You can now login.');
        setTimeout(() => onSwitchToLogin(), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="upload-page">
      <div className="upload-container" style={{maxWidth: 450}}>
        <h1>🚀 CodeVision AI</h1>
        <p style={{marginBottom: 20}}>Create your account</p>

        {error && (
          <div style={{
            background:'rgba(239,68,68,0.15)',border:'1px solid #ef4444',
            color:'#fca5a5',padding:12,borderRadius:8,marginBottom:15,fontSize:14
          }}>
            ❌ {error}
          </div>
        )}
        
        {success && (
          <div style={{
            background:'rgba(34,197,94,0.15)',border:'1px solid #22c55e',
            color:'#86efac',padding:12,borderRadius:8,marginBottom:15,fontSize:14
          }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)}
            className="url-input" placeholder="Full Name" style={{marginBottom:10}} required />
          
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            className="url-input" placeholder="Email address" style={{marginBottom:10}} required />
          
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
            className="url-input" placeholder="Password (min 8 chars, Aa1@)" style={{marginBottom:15}} required />

          <button type="submit" className="btn btn-primary" disabled={loading}
            style={{background:'linear-gradient(135deg, #8b5cf6, #6366f1)'}}>
            {loading ? '🔄 Creating account...' : '✅ Create Account'}
          </button>
        </form>

        <p style={{marginTop:20, color:'#94a3b8', fontSize:14, textAlign:'center'}}>
          Already have an account?{' '}
          <span onClick={onSwitchToLogin} style={{color:'#60a5fa', cursor:'pointer', textDecoration:'underline'}}>
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}