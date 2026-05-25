import React, { useState } from 'react';
import { uploadZip, uploadGitHub, detectLanguage, extractApis, mapFlows } from '../services/api';

export default function UploadPage({ onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [details, setDetails] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [gitUrl, setGitUrl] = useState('');

  const updateProgress = (pct, text, extra = {}) => {
    setProgress(pct);
    setStatusText(text);
    if (Object.keys(extra).length > 0) {
      setDetails(prev => ({ ...prev, ...extra }));
    }
  };

  // ==========================================
  // ZIP UPLOAD
  // ==========================================
  const handleFile = async (file) => {
    if (!file) return;
    if (!file.name.endsWith('.zip')) {
      alert('Only ZIP files are supported');
      return;
    }

    setUploading(true);
    setProgress(0);
    setDetails({ fileName: file.name, fileSize: formatSize(file.size) });

    try {
      updateProgress(5, '📤 Reading file...');

      const uploadRes = await uploadZip(file);
      const projectId = uploadRes.data.data.projectId;
      const totalFiles = uploadRes.data.data.totalFiles || 0;
      updateProgress(30, `📂 Extracted ${totalFiles} files`, { totalFiles });

      updateProgress(45, '🔍 Detecting language...');
      const langRes = await detectLanguage(projectId);
      const langMsg = langRes.data.message || langRes.data.data?.message || 'Detected';
      updateProgress(55, langMsg, { language: langMsg });

      updateProgress(65, '🔗 Extracting APIs...');
      const apiRes = await extractApis(projectId);
      const totalApis = apiRes.data.data?.totalApis || 0;
      updateProgress(80, `Found ${totalApis} APIs`, { totalApis });

      updateProgress(90, '🔄 Mapping flows...');
      const flowRes = await mapFlows(projectId);
      const totalFlows = flowRes.data.data?.totalFlows || 0;
      updateProgress(100, '✅ Analysis Complete!');

      setTimeout(() => {
        onUploaded(projectId, file.name, { totalFiles, totalApis, totalFlows, language: langMsg });
      }, 800);

    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Upload failed';
      updateProgress(0, `❌ ${errorMsg}`);
      setTimeout(() => setUploading(false), 2500);
    }
  };

  // ==========================================
  // GITHUB UPLOAD
  // ==========================================
  const handleGitHub = async () => {
    if (!gitUrl.trim()) {
      alert('Please enter a GitHub URL');
      return;
    }
    
    if (!gitUrl.includes('github.com')) {
      alert('Only GitHub URLs are supported');
      return;
    }

    setUploading(true);
    setProgress(0);
    setDetails({ gitUrl });

    try {
      updateProgress(10, '🔗 Cloning repository...');
      
      const res = await uploadGitHub(gitUrl);
      const projectId = res.data.data.projectId;
      const totalFiles = res.data.data.totalFiles || 0;
      updateProgress(30, `📂 Cloned ${totalFiles} files`, { totalFiles });

      updateProgress(45, '🔍 Detecting language...');
      const langRes = await detectLanguage(projectId);
      const langMsg = langRes.data.message || langRes.data.data?.message || 'Detected';
      updateProgress(55, langMsg, { language: langMsg });

      updateProgress(65, '🔗 Extracting APIs...');
      const apiRes = await extractApis(projectId);
      const totalApis = apiRes.data.data?.totalApis || 0;
      updateProgress(80, `Found ${totalApis} APIs`, { totalApis });

      updateProgress(90, '🔄 Mapping flows...');
      const flowRes = await mapFlows(projectId);
      const totalFlows = flowRes.data.data?.totalFlows || 0;
      updateProgress(100, '✅ Complete!');

      setTimeout(() => {
        const repoName = gitUrl.split('/').pop().replace('.git', '');
        onUploaded(projectId, repoName, { totalFiles, totalApis, totalFlows, language: langMsg });
      }, 800);

    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'GitHub upload failed';
      updateProgress(0, `❌ ${errorMsg}`);
      setTimeout(() => setUploading(false), 2500);
    }
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // ==========================================
  // UPLOADING STATE - Progress View
  // ==========================================
  if (uploading) {
    return (
      <div className="upload-page">
        <div className="upload-container" style={{maxWidth: 550}}>
          <h1>🚀 CodeVision AI</h1>

          {/* Progress Bar */}
          <div style={{margin: '30px 0'}}>
            <div style={{height: 12, background: '#1e293b', borderRadius: 6, overflow: 'hidden'}}>
              <div style={{
                height: '100%', width: `${progress}%`,
                background: progress === 100 ? '#4ade80' : 'linear-gradient(90deg, #3b82f6, #6366f1)',
                borderRadius: 6, transition: 'width 0.4s ease'
              }} />
            </div>
            <div style={{textAlign: 'center', marginTop: 8, color: '#94a3b8', fontSize: 14, fontWeight: 600}}>
              {progress}%
            </div>
          </div>

          {/* Status */}
          <div style={{background: '#111827', borderRadius: 14, padding: 24}}>
            <div style={{fontSize: 18, color: '#e2e8f0', marginBottom: 15, fontWeight: 600}}>
              {statusText || 'Starting...'}
            </div>

            {details.fileName && (
              <div style={detRow}>📁 <strong>{details.fileName}</strong> {details.fileSize && `(${details.fileSize})`}</div>
            )}
            {details.totalFiles > 0 && (
              <div style={detRow}>📄 <strong>{details.totalFiles}</strong> files found</div>
            )}
            {details.language && (
              <div style={detRow}>🔍 {details.language}</div>
            )}
            {details.totalApis > 0 && (
              <div style={detRow}>🔗 <strong>{details.totalApis}</strong> API endpoints detected</div>
            )}
          </div>

          {progress === 100 && (
            <div style={{textAlign: 'center', marginTop: 20, color: '#4ade80', fontSize: 18, fontWeight: 600}}>
              🎉 Analysis Complete! Opening dashboard...
            </div>
          )}

          {progress === 0 && statusText.startsWith('❌') && (
            <div style={{textAlign: 'center', marginTop: 20}}>
              <button onClick={() => setUploading(false)} className="btn btn-primary" style={{width: 'auto', padding: '12px 30px'}}>
                🔄 Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // UPLOAD FORM
  // ==========================================
  return (
    <div className="upload-page">
      <div className="upload-container">
        <h1>🚀 CodeVision AI</h1>
        <p>Drop your codebase - Get instant architecture & flow diagrams</p>

        {/* ZIP Upload */}
        <div
          className={`drop-zone ${dragActive ? 'active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <div className="icon">📁</div>
          <p style={{color: '#e2e8f0', fontSize: 16, fontWeight: 500}}>Drop ZIP file here</p>
          <p style={{color: '#64748b'}}>or click to browse</p>
          <input
            id="fileInput"
            type="file"
            accept=".zip"
            style={{display: 'none'}}
            onChange={(e) => {
              if (e.target.files[0]) handleFile(e.target.files[0]);
            }}
          />
        </div>

        {/* Divider */}
        <div className="or-divider"><span>OR</span></div>

        {/* GitHub URL */}
        <input
          className="url-input"
          value={gitUrl}
          onChange={(e) => setGitUrl(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleGitHub(); }}
          placeholder="https://github.com/user/repo.git"
        />
        <button className="btn btn-primary" onClick={handleGitHub}>
          🔗 Analyze from GitHub
        </button>

        <p style={{marginTop: 20, color: '#475569', fontSize: 12, textAlign: 'center'}}>
          Supports: ☕ Java • 🐍 Python • 💚 C# • 💛 JavaScript • 🔵 Go • 💎 Ruby • 🐘 PHP
        </p>
      </div>
    </div>
  );
}

const detRow = {
  padding: '7px 0',
  color: '#cbd5e1',
  fontSize: 14,
  borderBottom: '1px solid #1e293b'
};