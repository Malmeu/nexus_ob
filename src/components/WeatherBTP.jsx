import React from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Wind, ThermometerSnowflake, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function WeatherBTP({ content }) {
  let weatherData = {
    city: "Alger (Simulation)",
    temp: 2,
    wind: 45,
    humidity: 85
  };

  try {
    if (content) {
      const parsed = JSON.parse(content);
      weatherData = { ...weatherData, ...parsed };
    }
  } catch(e) {
    // silently fail and use default if parsing fails
  }

  const isPouringSafe = weatherData.temp > 5 && weatherData.wind < 50;

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9))',
      border: '1px solid var(--glass-border)',
      borderRadius: '12px',
      padding: '1rem',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      maxWidth: '400px',
      boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CloudRain size={20} color="#0ea5e9" />
          <h3 style={{ margin: 0, fontSize: '1rem' }}>Météo - {weatherData.city}</h3>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.8rem' }}>
        <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <ThermometerSnowflake size={20} color={weatherData.temp < 5 ? '#ef4444' : '#10b981'} />
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{weatherData.temp}°C</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Température</div>
          </div>
        </div>
        <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '0.8rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Wind size={20} color={weatherData.wind > 50 ? '#ef4444' : '#f59e0b'} />
          <div>
            <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{weatherData.wind} <span style={{fontSize: '0.7rem'}}>km/h</span></div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Vent</div>
          </div>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: isPouringSafe ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${isPouringSafe ? '#10b981' : '#ef4444'}`,
          borderRadius: '8px',
          padding: '0.8rem',
          display: 'flex',
          gap: '0.8rem',
          alignItems: 'flex-start'
        }}
      >
        {isPouringSafe ? <CheckCircle2 size={18} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} /> : <AlertTriangle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: '2px' }} />}
        <div>
          <h4 style={{ margin: 0, fontSize: '0.85rem', color: isPouringSafe ? '#10b981' : '#ef4444', marginBottom: '0.2rem' }}>
            {isPouringSafe ? "Coulage béton OK" : "Alerte Coulage"}
          </h4>
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.3 }}>
            {isPouringSafe 
              ? "Conditions OK."
              : "Risque identifié. Précautions nécessaires."}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
