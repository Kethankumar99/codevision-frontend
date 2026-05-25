import React, { useState } from 'react';
import { uploadZip } from '../services/api';

export default function UploadZone({ onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFile = async (file) => {
    setUploading(true);
    try {
      const res = await uploadZip(file);
      onUploaded(res.data.data.projectId);
    } catch (err) {
      alert('Upload failed!');
    }
    setUploading(false);
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        <h1>🚀 CodeVision AI</h1>
        <p>Upload your codebase - Get instant architecture insights</p>

        <div
          className={`drop-zone ${dragActive ? 'active' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={(e) => { e.preventDefault(); setDragActive(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => document.getElementById('fileInput').click()}
        >
          <div className="icon">{uploading ? '⏳' : '📁'}</div>
          <p style={{color:'#e2e8f0', fontSize:16}}>
            {uploading ? 'Analyzing...' : 'Drop your ZIP file here'}
          </p>
          <p>or click to browse</p>
          <input
            id="fileInput"
            type="file"
            accept=".zip"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        <div className="or-divider"><span>OR</span></div>

        <input
          className="url-input"
          placeholder="Paste GitHub URL: https://github.com/user/repo.git"
        />
        <button className="btn btn-primary" disabled>
          🔗 Analyze from GitHub (Coming Soon)
        </button>

        <p style={{marginTop:20, color:'#475569', fontSize:12}}>
          Supports: Java • Python • C# • JavaScript • Go • Ruby • PHP
        </p>
      </div>
    </div>
  );
}