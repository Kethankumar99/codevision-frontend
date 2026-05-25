import React, { useState } from 'react';
import { loginUser, setToken } from '../services/api';

export default function LoginPage({ onLogin, onSwitchToRegister }) {
  const [email, setEmail] = useState('kethan@codevision.ai');
  const [password, setPassword] = useState('Kethan@123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await loginUser(email, password);
      const token = res.data.data?.accessToken || res.data.accessToken;
      
      if (token) {
        setToken(token);
        onLogin(token);
      } else {
        setError('No token received');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div className="upload-page">
      <div className="upload-container" style={{maxWidth: 400}}>
        <h1>🚀 CodeVision AI</h1>
        <p style={{marginBottom: 25}}>Sign in to continue</p>

        {error && (
          <div style={{
            background:'rgba(239,68,68,0.15)',border:'1px solid #ef4444',
            color:'#fca5a5',padding:12,borderRadius:8,marginBottom:15,fontSize:14
          }}>
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)}
            className="url-input" placeholder="Email" style={{marginBottom:10}} />
          
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
            className="url-input" placeholder="Password" style={{marginBottom:15}} />
          
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '🔄 Signing in...' : '🔐 Sign In'}
          </button>
        </form>

        <p style={{marginTop:20, color:'#94a3b8', fontSize:14, textAlign:'center'}}>
          Don't have an account?{' '}
          <span onClick={onSwitchToRegister} style={{color:'#60a5fa', cursor:'pointer', textDecoration:'underline'}}>
            Create Account
          </span>
        </p>
      </div>
    </div>
  );
}