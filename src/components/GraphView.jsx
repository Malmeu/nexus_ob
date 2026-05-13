import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_BASE = 'http://localhost:3001/api';

const GraphView = ({ onNodeClick }) => {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef();

  useEffect(() => {
    fetchGraphData();
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const fetchGraphData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/graph?t=${Date.now()}`);
      setData(res.data);
    } catch (err) {
      console.error("Error fetching graph data:", err);
    }
  };

  const updateDimensions = () => {
    if (containerRef.current) {
      setDimensions({
        width: containerRef.current.offsetWidth,
        height: containerRef.current.offsetHeight
      });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="graph-container"
      ref={containerRef}
      style={{ width: '100%', height: 'calc(100vh - 150px)', borderRadius: '24px', overflow: 'hidden', border: '1px solid var(--glass-border)', position: 'relative' }}
    >
      {/* Starry Background Layers */}
      <div className="space-background">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>
      
      <ForceGraph2D
        graphData={data}
        width={dimensions.width}
        height={dimensions.height}
        onNodeClick={(node) => onNodeClick({ path: node.id + '.md', name: node.id })}
        nodeLabel="name"
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        nodeColor={() => '#00d2ff'}
        nodeRelSize={6}
        linkColor={() => 'rgba(255, 255, 255, 0.1)'}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={d => 0.005}
        backgroundColor="rgba(0,0,0,0)"
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12 / globalScale;
          ctx.font = `${fontSize}px Inter`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.fillText(label, node.x, node.y + 10);

          // Draw node circle with glow
          ctx.beginPath();
          ctx.arc(node.x, node.y, 4, 0, 2 * Math.PI, false);
          ctx.fillStyle = node.color || '#00d2ff';
          ctx.shadowBlur = 15;
          ctx.shadowColor = node.color || '#00d2ff';
          ctx.fill();
        }}
      />
    </motion.div>
  );
};

export default GraphView;
