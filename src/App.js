import React, { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadPage from './pages/UploadPage';
import Dashboard from './pages/Dashboard';
import { setToken as setApiToken } from './services/api'; // Token set cheyadaaniki import line

export default function App() {
  const [page, setPage] = useState('login');
  const [token, setToken] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [projectInfo, setProjectInfo] = useState({});

  const handleLogin = (userToken) => {
    setToken(userToken);
    if (setApiToken) setApiToken(userToken); // API layer ki token pass chestundi (Safe approach)
    setPage('upload');
  };

  const handleRegister = (userToken) => {
    setToken(userToken);
    if (setApiToken) setApiToken(userToken); // Register ainappudu kuda save avvuddi
    setPage('upload');
  };

  const handleUploaded = (id, name, info) => {
    setProjectId(id);
    setProjectInfo({ name, ...info });
    setPage('dashboard');
  };

  const handleBack = () => {
    setPage('upload');
    setProjectId(null);
  };

  if (page === 'login') {
    return <LoginPage onLogin={handleLogin} onSwitchToRegister={() => setPage('register')} />;
  }

  if (page === 'register') {
    return <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => setPage('login')} />;
  }

  if (page === 'dashboard' && projectId) {
    return <Dashboard projectId={projectId} projectInfo={projectInfo} onBack={handleBack} />;
  }

  // Fallback default page is UploadPage
  return <UploadPage onUploaded={handleUploaded} />;
}