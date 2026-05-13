import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function Gantt4D({ content }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100%

  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1; // 1% per tick (~50ms -> 5 seconds total)
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    if (progress >= 100) setProgress(0);
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  let tasks = [
    { id: 1, name: "Terrassement", start: 0, duration: 15, color: "#8b5cf6" },
    { id: 2, name: "Fondations", start: 10, duration: 20, color: "#3b82f6" },
    { id: 3, name: "Gros Œuvre RDC", start: 30, duration: 25, color: "#f59e0b" },
    { id: 4, name: "Gros Œuvre R+1", start: 50, duration: 25, color: "#ef4444" },
    { id: 5, name: "Charpente/Couverture", start: 70, duration: 20, color: "#10b981" },
    { id: 6, name: "Menuiseries Extérieures", start: 85, duration: 15, color: "#0ea5e9" }
  ];

  try {
    if (content) {
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) {
        tasks = parsed;
      }
    }
  } catch (e) {}

  return (
    <div style={{
      background: 'var(--card-bg)',
      border: '1px solid var(--glass-border)',
      borderRadius: '16px',
      padding: '1.5rem',
      color: 'var(--text-main)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ color: 'var(--accent-primary)' }}>Super-Gantt 4D</span> Simulation
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={reset}
            style={{ background: 'transparent', border: '1px solid var(--glass-border)', padding: '0.4rem', borderRadius: '8px', color: 'var(--text-dim)', cursor: 'pointer' }}
          >
            <RotateCcw size={16} />
          </button>
          <button 
            onClick={togglePlay}
            style={{ background: 'var(--accent-primary)', border: 'none', padding: '0.4rem 1rem', borderRadius: '8px', color: 'black', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? "Pause" : progress >= 100 ? "Rejouer" : "Lancer 4D"}
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', padding: '1rem 0' }}>
        {/* Timeline Bar */}
        <div style={{ width: '100%', height: '2px', background: 'var(--glass-border)', position: 'absolute', top: 0, left: 0 }} />
        <div style={{ width: `${progress}%`, height: '2px', background: 'var(--accent-primary)', position: 'absolute', top: 0, left: 0, transition: 'width 0.05s linear' }} />
        
        {/* Playhead indicator */}
        <div style={{
          position: 'absolute',
          top: -4,
          left: `${progress}%`,
          width: '10px', height: '10px',
          background: 'var(--accent-primary)',
          borderRadius: '50%',
          boxShadow: '0 0 10px var(--accent-primary)',
          transform: 'translateX(-50%)',
          transition: 'left 0.05s linear'
        }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1rem' }}>
          {tasks.map((task) => {
            const isStarted = progress >= task.start;
            const taskProgress = isStarted ? Math.min(100, ((progress - task.start) / task.duration) * 100) : 0;
            const isCompleted = taskProgress >= 100;

            return (
              <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '150px', fontSize: '0.85rem', color: isStarted ? 'var(--text-main)' : 'var(--text-dim)', transition: 'color 0.3s' }}>
                  {task.name}
                </div>
                <div style={{ flex: 1, position: 'relative', height: '24px', background: 'rgba(255,255,255,0.02)', borderRadius: '4px' }}>
                  {/* Contour de la tâche */}
                  <div style={{
                    position: 'absolute',
                    left: `${task.start}%`,
                    width: `${task.duration}%`,
                    height: '100%',
                    border: `1px dashed ${task.color}40`,
                    borderRadius: '4px'
                  }} />
                  
                  {/* Remplissage animé */}
                  <div style={{
                    position: 'absolute',
                    left: `${task.start}%`,
                    width: `${(task.duration * taskProgress) / 100}%`,
                    height: '100%',
                    background: isCompleted ? task.color : `linear-gradient(90deg, ${task.color}aa, ${task.color})`,
                    borderRadius: '4px',
                    boxShadow: isStarted && !isCompleted ? `0 0 15px ${task.color}80` : 'none',
                    transition: 'width 0.05s linear, box-shadow 0.3s'
                  }} />

                  {/* Pourcentage à l'intérieur */}
                  {isStarted && (
                    <span style={{
                      position: 'absolute',
                      left: `calc(${task.start}% + 5px)`,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      fontSize: '0.7rem',
                      color: 'white',
                      fontWeight: 600,
                      textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                    }}>
                      {Math.floor(taskProgress)}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
