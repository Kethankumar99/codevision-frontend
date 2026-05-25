import React, { useState, useEffect } from 'react';
import { extractApis, mapFlows, getFiles } from '../services/api';
import FileViewerModal from '../components/FileViewerModal';

// ==========================================
// 1. FLOW VIEW COMPONENT (OUTSIDE DASHBOARD)
// ==========================================
const FlowView = ({ flow, api }) => {
  if (!flow || !flow.steps) return (
    <div className="empty-state"><p style={{ color: '#64748b' }}>No flow data available</p></div>
  );

  const colors = { CONTROLLER: '#16a34a', SERVICE: '#7c3aed', REPOSITORY: '#ca8a04', DATABASE: '#dc2626' };

  return (
    <div>
      {api && (
        <div style={{ marginBottom: 12, padding: 10, background: '#1a1f35', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className={`method-badge method-${api.httpMethod}`}>{api.httpMethod}</span>
          <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{api.path}</span>
          <span style={{ color: '#64748b', fontSize: 11, marginLeft: 'auto' }}>{api.controllerFile}:{api.lineNumber}</span>
        </div>
      )}
      {flow.steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid #1e293b' }}>
          <span style={{ width: 26, height: 26, borderRadius: '50%', background: colors[s.type] || '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 'bold', flexShrink: 0 }}>
            {s.step}
          </span>
          <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600, background: colors[s.type] || '#3b82f6', color: '#fff' }}>
            {s.type}
          </span>
          <span style={{ fontSize: 13, color: '#e2e8f0' }}>
            {s.class}.{s.method}()
          </span>
          {s.dbOperation && (
            <span style={{ fontSize: 10, color: '#4ade80', marginLeft: 'auto', background: '#0f2a1e', padding: '3px 8px', borderRadius: 4 }}>
              💾 {s.dbOperation}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

// ==========================================
// 2. MAIN DASHBOARD COMPONENT
// ==========================================
export default function Dashboard({ projectId, projectInfo, onBack }) {
  const [apis, setApis] = useState([]);
  const [flows, setFlows] = useState([]);
  const [fileTree, setFileTree] = useState({});
  const [totalFiles, setTotalFiles] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedApi, setSelectedApi] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [language, setLanguage] = useState('');
  const [framework, setFramework] = useState('');
  const [viewingFile, setViewingFile] = useState(null);

  useEffect(() => { loadAll(); }, [projectId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      let apiData = { apis: [], language: 'Unknown', framework: '' };
      let flowData = { flows: [] };
      let fileData = { files: [], totalFiles: 0 };

      try {
        const res = await extractApis(projectId);
        apiData = res.data?.data || res.data || {};
      } catch (e) { console.log('APIs extraction pending - showing files only'); }

      try {
        const res = await mapFlows(projectId);
        flowData = res.data?.data || res.data || {};
      } catch (e) { console.log('Flows pending'); }

      try {
        const res = await getFiles(projectId);
        fileData = res.data?.data || res.data || {};
      } catch (e) { console.log('Using local file count'); }

      setApis(apiData.apis || []);
      setFlows(flowData.flows || []);
      setLanguage(apiData.language || projectInfo.language || 'Detecting...');
      setFramework(apiData.framework || '');

      const tree = {};
      const files = fileData.files || [];
      files.forEach(f => {
        const path = f.path || f.name || '';
        const parts = path.replace(/\\/g, '/').split('/');
        const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : 'root';
        if (!tree[folder]) tree[folder] = [];
        tree[folder].push(f);
      });

      if (Object.keys(tree).length === 0 && projectInfo.totalFiles > 0) {
        tree['project'] = [{ name: projectInfo.name || 'Project files', path: '/', size: '' }];
      }

      setFileTree(tree);
      setTotalFiles(fileData.totalFiles || projectInfo.totalFiles || files.length || 0);

    } catch (err) {
      console.log('Loading data...');
    }
    setLoading(false);
  };

  if (loading) return (
    <div className="loading">
      <div className="spinner"></div>
      <p style={{ color: '#64748b', marginTop: 15 }}>Analyzing project...</p>
      <p style={{ color: '#475569', fontSize: 13, marginTop: 5 }}>
        📄 {projectInfo.totalFiles || '...'} files | 🔍 Detecting language...
      </p>
    </div>
  );

  const langEmoji = { Java: '☕', Python: '🐍', 'C#': '💚', JavaScript: '💛', TypeScript: '💙', Go: '🔵', Ruby: '💎', PHP: '🐘', Unknown: '📄' };
  const emoji = langEmoji[language] || '📄';
  const controllers = [...new Set(apis.map(a => a.controllerFile).filter(Boolean))];

  return (
    <div className="dashboard">
      {/* NAVBAR */}
      <nav className="navbar">
        <span className="navbar-brand">🚀 CodeVision AI</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span style={{
            padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
            background: '#3b82f6', color: '#fff'
          }}>
            {emoji} {language} {framework ? `(${framework})` : ''}
          </span>
          <span style={{ color: '#94a3b8', fontSize: 13 }}>
            📁 {projectInfo.name || 'Project'}
          </span>
          <span style={{ color: '#64748b', fontSize: 12 }}>
            📄 {totalFiles} files
          </span>
        </div>
        <button className="btn-sm btn-upload" onClick={onBack}>📤 New Upload</button>
      </nav>

      {/* STATS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{totalFiles}</div>
          <div className="stat-label">Total Files</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{apis.length}</div>
          <div className="stat-label">API Endpoints</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{controllers.length}</div>
          <div className="stat-label">Controllers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{flows.length}</div>
          <div className="stat-label">Flows Mapped</div>
        </div>
      </div>

      {/* TABS */}
      <div style={{ padding: '0 24px', maxWidth: 1400, margin: '0 auto' }}>
        <div className="tabs">
          <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>📊 Overview</button>
          <button className={`tab ${activeTab === 'apis' ? 'active' : ''}`} onClick={() => setActiveTab('apis')}>📋 APIs ({apis.length})</button>
          <button className={`tab ${activeTab === 'flows' ? 'active' : ''}`} onClick={() => setActiveTab('flows')}>🔄 Flows ({flows.length})</button>
          <button className={`tab ${activeTab === 'files' ? 'active' : ''}`} onClick={() => setActiveTab('files')}>📁 Files ({totalFiles})</button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="dashboard-grid">
        
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="panel panel-full">
            <h3>📊 Project Overview</h3>
            {apis.length === 0 ? (
              <div className="empty-state">
                <div className="icon">📭</div>
                <p style={{ fontSize: 16, color: '#cbd5e1' }}>No API endpoints detected</p>
                <p style={{ fontSize: 13, marginTop: 8, color: '#64748b' }}>
                  This project may be a library, frontend, or non-web application.
                </p>
                <div style={{ marginTop: 15, padding: 12, background: '#1a1f35', borderRadius: 8, display: 'inline-block' }}>
                  <span style={{ color: '#94a3b8' }}>📄 {totalFiles} files found</span>
                  <span style={{ color: '#64748b', marginLeft: 15 }}>🔍 Language: {language}</span>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div>
                  <h4 style={{ color: '#94a3b8', marginBottom: 10 }}>🔗 Method Distribution</h4>
                  {Object.entries(
                    apis.reduce((acc, a) => { acc[a.httpMethod] = (acc[a.httpMethod] || 0) + 1; return acc; }, {})
                  ).map(([method, count]) => (
                    <div key={method} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e293b' }}>
                      <span className={`method-badge method-${method}`}>{method}</span>
                      <span style={{ color: '#e2e8f0' }}>{count} endpoints</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 style={{ color: '#94a3b8', marginBottom: 10 }}>📁 Controllers</h4>
                  {controllers.slice(0, 10).map((file) => (
                    <div key={file} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e293b', fontSize: 13 }}>
                      <span style={{ color: '#e2e8f0' }}>📄 {file}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* APIS TAB */}
        {activeTab === 'apis' && (
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, height: 'calc(100vh - 250px)'}}>
            
            {/* LEFT: API List */}
            <div className="panel" style={{overflow: 'auto', maxHeight: '100%'}}>
              <h3 style={{position: 'sticky', top: 0, background: '#111827', padding: '10px 0', zIndex: 1}}>
                📋 API Endpoints ({apis.length})
              </h3>
              {apis.length === 0 ? (
                <div className="empty-state">
                  <div className="icon">📭</div>
                  <p>No APIs found</p>
                </div>
              ) : (
                <div>
                  {apis.map((a, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedApi(a)}
                      style={{
                        padding: '10px 12px',
                        margin: '4px 0',
                        borderRadius: 8,
                        cursor: 'pointer',
                        background: selectedApi === a ? '#1a1f35' : 'transparent',
                        border: selectedApi === a ? '1px solid #3b82f6' : '1px solid transparent',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                        <span className={`method-badge method-${a.httpMethod}`} style={{fontSize: 10}}>
                          {a.httpMethod}
                        </span>
                        <span style={{fontFamily: 'monospace', fontSize: 12, color: '#e2e8f0'}}>
                          {a.path}
                        </span>
                      </div>
                      <div style={{fontSize: 11, color: '#64748b', marginTop: 4}}>
                        {a.controllerFile} → {a.methodName}()
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Flow Diagram */}
            <div className="panel" style={{overflow: 'auto', maxHeight: '100%', position: 'sticky', top: 20}}>
              <h3 style={{position: 'sticky', top: 0, background: '#111827', padding: '10px 0', zIndex: 1}}>
                🔄 Flow Diagram
              </h3>
              {selectedApi ? (
                <FlowView 
                  flow={flows.find(f => f.api?.path === selectedApi.path && f.api?.httpMethod === selectedApi.httpMethod)} 
                  api={selectedApi} 
                />
              ) : (
                <div className="empty-state">
                  <div className="icon">👈</div>
                  <p>Click an API endpoint to see its execution flow</p>
                  <p style={{fontSize: 12, color: '#475569', marginTop: 5}}>
                    The flow diagram will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* FLOWS TAB */}
        {activeTab === 'flows' && (
          <div className="panel panel-full">
            <h3>🔄 Execution Flows ({flows.length})</h3>
            {flows.length === 0 ? (
              <div className="empty-state"><div className="icon">🔄</div><p>No flows mapped yet</p><p style={{ fontSize: 13 }}>Run language detection and API extraction first</p></div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                {flows.slice(0, 6).map((f, i) => (
                  <div key={i} style={{ background: '#0a0e17', borderRadius: 8, padding: 12 }}>
                    <FlowView flow={f} api={f.api} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FILES TAB */}
        {activeTab === 'files' && (
          <div className="panel panel-full">
            <h3>📁 File Structure ({totalFiles} files)</h3>
            {Object.keys(fileTree).length === 0 ? (
              <div className="empty-state">
                <div className="icon">📁</div>
                <p style={{ fontSize: 16 }}>File structure loading...</p>
                <p style={{ fontSize: 13, marginTop: 5 }}>Total files in project: {totalFiles}</p>
              </div>
            ) : (
              <div className="file-tree">
                {Object.entries(fileTree).sort().map(([folder, files]) => (
                  <div key={folder} style={{ marginBottom: 12 }}>
                    <div className="file-folder">
                      📁 {folder}/ <span style={{ color: '#64748b', fontWeight: 400 }}>({files.length} files)</span>
                    </div>
                    {files.map((f, i) => (
                      <div 
                        key={i} 
                        className="file-item"
                        onClick={() => setViewingFile(f)}
                        style={{ cursor: 'pointer' }}
                        title="Click to view file content"
                      >
                        <span style={{ color: '#64748b', marginRight: 8 }}>📄</span>
                        <span style={{ fontSize: 12, fontFamily: 'monospace', flex: 1, color: '#60a5fa' }}>
                          {f.name || f.path || f}
                        </span>
                        {f.size && <span style={{ color: '#475569', fontSize: 11 }}>{f.size}</span>}
                        <span style={{ color: '#3b82f6', fontSize: 11, marginLeft: 10 }}>👁 View</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* FILE VIEWER MODAL */}
      {viewingFile && (
        <FileViewerModal 
          projectId={projectId}
          file={viewingFile}
          onClose={() => setViewingFile(null)}
        />
      )}
    </div>
  );
}