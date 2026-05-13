import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, AlertCircle, CheckCircle, Clock } from 'lucide-react';

export default function SmartBlueprint({ content }) {
  const [activePin, setActivePin] = useState(null);

  // Valeurs par défaut
  let config = {
    bg: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=2000&auto=format&fit=crop",
    title: "Plan RDC - Bâtiment A",
    subtitle: "Réserves actives",
    pins: [
    { 
      id: 1, 
      x: 25, 
      y: 40, 
      title: "Reprise Béton", 
      entreprise: "Gros Œuvre Pro", 
      status: "En cours", 
      icon: <Clock size={16} color="#f59e0b" />, 
      color: "#f59e0b" 
    },
    { 
      id: 2, 
      x: 65, 
      y: 30, 
      title: "Fuite CVC", 
      entreprise: "Plombix", 
      status: "Urgent", 
      icon: <AlertCircle size={16} color="#ef4444" />, 
      color: "#ef4444" 
    },
    { 
      id: 3, 
      x: 45, 
      y: 75, 
      title: "Menuiserie OK", 
      entreprise: "BoisArt", 
      status: "Terminé", 
      icon: <CheckCircle size={16} color="#10b981" />, 
      color: "#10b981" 
    }
  ]};

  try {
    if (content) {
      const parsed = JSON.parse(content);
      config = { ...config, ...parsed };
    }
  } catch (e) {}

  return (
    <div style={{
      width: '100%',
      height: '450px',
      borderRadius: '16px',
      border: '1px solid var(--glass-border)',
      overflow: 'hidden',
      position: 'relative',
      background: '#0a0a0a'
    }}>
      {/* Blueprint Image with blue overlay to look like a blueprint */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: `url(${config.bg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.5,
        filter: 'grayscale(100%) contrast(1.2)'
      }} />
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        background: 'linear-gradient(45deg, rgba(0, 50, 100, 0.4), rgba(0, 150, 255, 0.2))',
        mixBlendMode: 'color'
      }} />

      {/* Interface overlay */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)',
        padding: '0.8rem 1.2rem',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <MapPin size={20} color="#f43f5e" />
        <div>
          <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{config.title}</h4>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)' }}>{config.subtitle}</p>
        </div>
      </div>

      {/* Pins */}
      {config.pins.map(pin => (
        <div 
          key={pin.id}
          style={{
            position: 'absolute',
            left: `${pin.x}%`,
            top: `${pin.y}%`,
            transform: 'translate(-50%, -50%)',
            zIndex: activePin === pin.id ? 20 : 10
          }}
          onMouseEnter={() => setActivePin(pin.id)}
          onMouseLeave={() => setActivePin(null)}
        >
          {/* Animated pulsing dot */}
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
            transition={{ repeat: Infinity, duration: 2 }}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '40px', height: '40px',
              borderRadius: '50%',
              background: pin.color,
              zIndex: -1
            }}
          />
          <div style={{
            background: pin.color,
            width: '24px', height: '24px',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(0,0,0,0.5)',
            cursor: 'pointer',
            border: '2px solid white'
          }}>
            <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }} />
          </div>

          <AnimatePresence>
            {activePin === pin.id && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: -8, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: 'rgba(20,20,25,0.95)',
                  backdropFilter: 'blur(12px)',
                  border: `1px solid ${pin.color}`,
                  padding: '1rem',
                  borderRadius: '12px',
                  width: '220px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
                  color: 'white',
                  pointerEvents: 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  {pin.title.toLowerCase().includes('urgent') || pin.status?.toLowerCase() === 'urgent' ? <AlertCircle size={16} color={pin.color || '#f43f5e'} /> : <MapPin size={16} color={pin.color || '#0ea5e9'} />}
                  <span style={{ fontWeight: 600, color: pin.color || '#fff' }}>{pin.status || 'Signalé'}</span>
                </div>
                <h5 style={{ margin: '0 0 0.2rem 0', fontSize: '1rem' }}>{pin.title}</h5>
                {pin.entreprise && <p style={{ margin: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)' }}>Sous-traitant: <span style={{ color: 'white' }}>{pin.entreprise}</span></p>}
                
                {/* Petite flèche */}
                <div style={{
                  position: 'absolute',
                  bottom: '-6px',
                  left: '50%',
                  marginLeft: '-6px',
                  width: '12px',
                  height: '12px',
                  background: 'rgba(20,20,25,0.95)',
                  borderRight: `1px solid ${pin.color || '#fff'}`,
                  borderBottom: `1px solid ${pin.color || '#fff'}`,
                  transform: 'rotate(45deg)'
                }} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
