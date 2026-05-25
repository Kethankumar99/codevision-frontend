import React from 'react';

export default function ApiTable({ apis, onSelect, selected }) {
  return (
    <div style={{maxHeight:500, overflow:'auto'}}>
      <table className="api-table">
        <thead>
          <tr>
            <th>Method</th>
            <th>Path</th>
            <th>Controller</th>
            <th>Method</th>
          </tr>
        </thead>
        <tbody>
          {apis.map((api, i) => (
            <tr
              key={i}
              onClick={() => onSelect(api)}
              style={{
                cursor: 'pointer',
                background: selected?.path === api.path ? '#1a1f35' : 'transparent'
              }}
            >
              <td>
                <span className={`method-badge method-${api.httpMethod}`}>
                  {api.httpMethod}
                </span>
              </td>
              <td style={{fontFamily:'monospace'}}>{api.path}</td>
              <td style={{color:'#94a3b8'}}>{api.controllerFile}</td>
              <td style={{color:'#64748b'}}>{api.methodName}()</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}