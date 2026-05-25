import React, { useEffect, useRef } from 'react';

export default function FlowDiagram({ flow, api }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && flow?.mermaidCode) {
      containerRef.current.innerHTML = '';
      
      // Simple SVG diagram without Mermaid library
      const steps = flow.steps || [];
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('width', '100%');
      svg.setAttribute('height', `${steps.length * 80 + 40}`);
      svg.style.background = '#0a0e17';
      
      const colors = {
        CONTROLLER: '#16a34a',
        SERVICE: '#7c3aed',
        REPOSITORY: '#ca8a04',
        DATABASE: '#dc2626'
      };

      steps.forEach((step, i) => {
        const y = 30 + i * 80;
        
        // Box
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('x', '50');
        rect.setAttribute('y', y.toString());
        rect.setAttribute('width', '300');
        rect.setAttribute('height', '40');
        rect.setAttribute('rx', '8');
        rect.setAttribute('fill', colors[step.type] || '#3b82f6');
        svg.appendChild(rect);
        
        // Text
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', '70');
        text.setAttribute('y', (y + 25).toString());
        text.setAttribute('fill', 'white');
        text.setAttribute('font-size', '13');
        text.textContent = `${step.type}: ${step.class}.${step.method}()`;
        svg.appendChild(text);
        
        // Arrow
        if (i < steps.length - 1) {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', '200');
          line.setAttribute('y1', (y + 40).toString());
          line.setAttribute('x2', '200');
          line.setAttribute('y2', (y + 80).toString());
          line.setAttribute('stroke', '#475569');
          line.setAttribute('stroke-width', '2');
          line.setAttribute('marker-end', 'url(#arrow)');
          svg.appendChild(line);
        }
      });

      // Arrow marker
      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
      marker.setAttribute('id', 'arrow');
      marker.setAttribute('viewBox', '0 0 10 10');
      marker.setAttribute('refX', '5');
      marker.setAttribute('refY', '5');
      marker.setAttribute('markerWidth', '6');
      marker.setAttribute('markerHeight', '6');
      marker.setAttribute('orient', 'auto-start-reverse');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
      path.setAttribute('fill', '#475569');
      marker.appendChild(path);
      defs.appendChild(marker);
      svg.appendChild(defs);

      containerRef.current.appendChild(svg);
    }
  }, [flow]);

  if (!flow) return <p style={{color:'#64748b', textAlign:'center', padding:40}}>No flow data</p>;

  return (
    <div>
      {api && (
        <div style={{marginBottom:15, padding:10, background:'#1a1f35', borderRadius:8}}>
          <span className={`method-badge method-${api.httpMethod}`}>{api.httpMethod}</span>
          <span style={{marginLeft:10, fontFamily:'monospace'}}>{api.path}</span>
          <span style={{marginLeft:10, color:'#64748b', fontSize:12}}>{api.controllerFile}:{api.lineNumber}</span>
        </div>
      )}
      <div ref={containerRef} style={{overflow:'auto', maxHeight:500}}></div>
    </div>
  );
}