import React from 'react';

export default function FileTree({ tree }) {
  return (
    <div style={{maxHeight:500, overflow:'auto'}}>
      {Object.entries(tree).map(([folder, files]) => (
        <div key={folder} style={{marginBottom:15}}>
          <div style={{color:'#60a5fa', fontWeight:600, padding:'6px 0'}}>
            📁 {folder}/ ({files.length})
          </div>
          {files.map((f, i) => (
            <div key={i} style={{
              padding:'4px 0 4px 20px', color:'#94a3b8', fontSize:13
            }}>
              📄 {f.file} → {f.path}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}