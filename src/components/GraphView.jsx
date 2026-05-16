import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_BASE = 'http://localhost:3001/api';

const GraphView = ({ onNodeClick }) => {
  const [data, setData] = useState({ nodes: [], links: [] });
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef();

  const fetchGraphData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/graph?t=${Date.now()}`);

      // Inject Black Hole Node
      const graphData = res.data;
      graphData.nodes.push({
        id: '__blackhole__',
        name: 'Delete',
        isBlackHole: true,
        val: 10,
        fx: 0,
        fy: 0
      });

      setData(graphData);
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

  useEffect(() => {
    fetchGraphData();
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

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
        onNodeClick={(node) => {
          if (!node.isBlackHole) {
            onNodeClick({ path: node.id + '.md', name: node.id });
          }
        }}
        onNodeDragEnd={async (node) => {
          if (node.isBlackHole) return;

          const blackHole = data.nodes.find(n => n.isBlackHole);
          if (blackHole) {
            const dx = node.x - blackHole.x;
            const dy = node.y - blackHole.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If dropped within 40 units of the black hole
            if (distance < 40) {
              try {
                await axios.delete(`${API_BASE}/notes/${encodeURIComponent(node.id + '.md')}`);
                fetchGraphData();
              } catch (err) {
                console.error("Error deleting note:", err);
              }
            }
          }
        }}
        nodeLabel="name"
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        nodeColor={() => '#00d2ff'}
        nodeRelSize={6}
        linkColor={() => 'rgba(255, 255, 255, 0.1)'}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={() => 0.005}
        backgroundColor="rgba(0,0,0,0)"
        nodeCanvasObject={(node, ctx, globalScale) => {
          if (node.isBlackHole) {
            // Draw Black Hole
            const bhRadius = 25;

            // Accretion disk (glow)
            ctx.beginPath();
            ctx.arc(node.x, node.y, bhRadius * 1.5, 0, 2 * Math.PI, false);
            ctx.fillStyle = 'rgba(120, 0, 255, 0.2)';
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#ff0055';
            ctx.fill();

            // Event horizon (dark center)
            ctx.beginPath();
            ctx.arc(node.x, node.y, bhRadius, 0, 2 * Math.PI, false);
            ctx.fillStyle = '#050010';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#000000';
            ctx.fill();

            // Label
            const fontSize = 14 / globalScale;
            ctx.font = `bold ${fontSize}px Inter`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.shadowBlur = 0;
            ctx.fillText(node.name, node.x, node.y);
          } else {
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
          }
        }}
      />
    </motion.div>
  );
};

export default GraphView;
