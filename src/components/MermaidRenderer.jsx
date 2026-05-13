import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Download, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

// Initialize mermaid with specific theme
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Inter, sans-serif'
});

export default function MermaidRenderer({ chart }) {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');
  const [error, setError] = useState(null);
  const [id] = useState(`mermaid-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    const renderChart = async () => {
      try {
        setError(null);
        // Clear previous content
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
        
        // Render new SVG
        const { svg } = await mermaid.render(id, chart);
        setSvgContent(svg);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError(err.message || 'Erreur de syntaxe Mermaid');
        // Clean up partial DOM on error
        const orphanNode = document.getElementById(id);
        if (orphanNode) orphanNode.remove();
      }
    };

    if (chart) {
      renderChart();
    }
  }, [chart, id]);

  const downloadSVG = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `diagram-${new Date().getTime()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mermaid-container"
      style={{
        background: 'rgba(20, 20, 20, 0.5)',
        border: '1px solid var(--glass-border)',
        borderRadius: '12px',
        padding: '1.5rem',
        margin: '1.5rem 0',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        boxShadow: 'inset 0 0 20px rgba(0,0,0,0.5)'
      }}
    >
      <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={downloadSVG}
          title="Exporter en SVG"
          disabled={!!error || !svgContent}
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--glass-border)',
            color: (!!error || !svgContent) ? 'var(--text-dim)' : 'var(--accent-primary)',
            padding: '0.4rem',
            borderRadius: '6px',
            cursor: (!!error || !svgContent) ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            opacity: (!!error || !svgContent) ? 0.5 : 1
          }}
          onMouseEnter={(e) => { if(!error && svgContent) e.currentTarget.style.background = 'rgba(0, 210, 255, 0.1)'; }}
          onMouseLeave={(e) => { if(!error && svgContent) e.currentTarget.style.background = 'var(--card-bg)'; }}
        >
          <Download size={16} />
        </button>
      </div>

      {error ? (
        <div style={{ color: '#ff4444', textAlign: 'center', padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={24} color="#ff4444" />
          <div style={{ fontWeight: 600 }}>Erreur de diagramme</div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8, fontFamily: 'monospace', maxWidth: '100%', overflowX: 'auto' }}>
            {error}
          </div>
        </div>
      ) : (
        <div 
          ref={containerRef} 
          style={{ 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'center',
            overflowX: 'auto'
          }} 
        />
      )}
    </motion.div>
  );
}
