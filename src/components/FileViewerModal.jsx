import React, { useState, useEffect } from 'react';
import { getFileContent } from '../services/api';

export default function FileViewerModal({ projectId, file, onClose }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (file) loadContent();
  }, [file]);

  const loadContent = async () => {
    setLoading(true);
    setError('');
    try {
      const filePath = file.path || file.name;
      const res = await getFileContent(projectId, filePath);
      setContent(res.data.data?.content || 'No content');
    } catch (err) {
      setError('Could not load file content');
    }
    setLoading(false);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name || 'file.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.85)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:1000}} onClick={onClose}>
      <div style={{background:'#111827',borderRadius:16,width:'90%',maxWidth:900,maxHeight:'85vh',display:'flex',flexDirection:'column'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'15px 20px',borderBottom:'1px solid #1e293b'}}>
          <span style={{fontSize:16,fontWeight:600,color:'#e2e8f0'}}>📄 {file.name}</span>
          <div style={{display:'flex',gap:8}}>
            <button onClick={handleDownload} style={{padding:'6px 14px',border:'none',borderRadius:6,background:'#3b82f6',color:'#fff',cursor:'pointer',fontSize:12}}>⬇ Download</button>
            <button onClick={onClose} style={{padding:'6px 14px',border:'none',borderRadius:6,background:'#ef4444',color:'#fff',cursor:'pointer',fontSize:12}}>✕ Close</button>
          </div>
        </div>
        <div style={{flex:1,overflow:'auto',padding:20}}>
          {loading ? (
            <div style={{textAlign:'center',padding:40}}><div className="spinner"></div></div>
          ) : error ? (
            <div style={{color:'#ef4444',textAlign:'center',padding:40}}>{error}</div>
          ) : (
            <pre style={{background:'#0a0e17',padding:20,borderRadius:8,color:'#e2e8f0',fontSize:13,lineHeight:1.6,overflowX:'auto',whiteSpace:'pre-wrap',wordBreak:'break-word',fontFamily:"'Courier New',monospace"}}><code>{content}</code></pre>
          )}
        </div>
      </div>
    </div>
  );
}