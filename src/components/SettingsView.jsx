import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Zap, Layout as LayoutIcon, Edit3, Type, Check, Palette, Box, MapPin, Clock, CloudRain } from 'lucide-react';

export default function SettingsView({ plugins, setPlugins, theme, setTheme }) {
  const togglePlugin = (key) => {
    setPlugins(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const pluginList = [
    {
      id: 'templates',
      name: 'Templates Avancés',
      description: 'Scripts JavaScript pour automatiser les notes et insertions dynamiques.',
      icon: <Zap size={20} color="#eab308" />
    },
    {
      id: 'kanban',
      name: 'Kanban Markdown',
      description: 'Tableaux Kanban pour la gestion de projets visuels, directement dans vos notes.',
      icon: <LayoutIcon size={20} color="#3b82f6" />
    },
    {
      id: 'diagrams',
      name: 'Draw & Mindmaps',
      description: 'Dessine des diagrammes et des mindmaps intégrés, exportables en SVG.',
      icon: <Edit3 size={20} color="#ec4899" />
    },
    {
      id: 'tables',
      name: 'Éditeur Tables Markdown',
      description: 'Un éditeur interactif et facile pour les tables Markdown complexes.',
      icon: <Type size={20} color="#10b981" />
    },
    {
      id: 'bimViewer',
      name: 'Visionneuse 3D / BIM',
      description: 'Affiche des modèles 3D interactifs (Three.js) directement dans tes notes.',
      icon: <Box size={20} color="#8b5cf6" />
    },
    {
      id: 'smartBlueprint',
      name: 'Smart Blueprint',
      description: 'Annote des plans architecturaux avec des points interactifs.',
      icon: <MapPin size={20} color="#f43f5e" />
    },
    {
      id: 'gantt4d',
      name: 'Super-Gantt Animé',
      description: 'Planning de chantier interactif pour visualiser les phases de construction.',
      icon: <Clock size={20} color="#f59e0b" />
    },
    {
      id: 'weatherBTP',
      name: 'Météo & Béton',
      description: 'Indicateur météo intelligent pour les alertes de chantier (vent, gel).',
      icon: <CloudRain size={20} color="#0ea5e9" />
    }
  ];

  return (
    <div className="settings-view" style={{ padding: '1rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <Settings size={28} color="var(--accent-primary)" />
        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Plugins & Fonctionnalités</h2>
      </div>
      
      <p style={{ color: 'var(--text-dim)', marginBottom: '2rem', fontSize: '1.1rem' }}>
        Activez ou désactivez les plugins pour personnaliser votre expérience dans Obsidian Nexus.
      </p>

      <div className="plugins-grid" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
        {pluginList.map((plugin, index) => (
          <motion.div 
            key={plugin.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            style={{
              background: 'var(--card-bg)',
              border: `1px solid ${plugins[plugin.id] ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
              borderRadius: '16px',
              padding: '1.5rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              cursor: 'pointer',
              transition: 'all 0.3s',
              boxShadow: plugins[plugin.id] ? '0 0 20px rgba(0, 210, 255, 0.1)' : 'none'
            }}
            onClick={() => togglePlugin(plugin.id)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                <div style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  padding: '0.6rem', 
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {plugin.icon}
                </div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{plugin.name}</h3>
              </div>
              
              {/* Toggle switch */}
              <div style={{
                width: '44px',
                height: '24px',
                background: plugins[plugin.id] ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                position: 'relative',
                transition: 'background 0.3s'
              }}>
                <motion.div 
                  initial={false}
                  animate={{ 
                    x: plugins[plugin.id] ? 22 : 2,
                    y: 2
                  }}
                  style={{
                    width: '20px',
                    height: '20px',
                    background: 'white',
                    borderRadius: '50%',
                    position: 'absolute',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {plugins[plugin.id] && <Check size={12} color="var(--accent-primary)" />}
                </motion.div>
              </div>
            </div>
            
            <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.5 }}>
              {plugin.description}
            </p>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '4rem', marginBottom: '2rem' }}>
        <Palette size={28} color="var(--accent-secondary)" />
        <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Apparence & Thèmes</h2>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        {[
          { id: 'nexus', name: 'Nexus (Sombre)', color1: '#00d2ff', color2: '#3a7bd5' },
          { id: 'cyberpunk', name: 'Cyberpunk (Sombre)', color1: '#fcee0a', color2: '#ff003c' },
          { id: 'emerald', name: 'Emerald (Sombre)', color1: '#34d399', color2: '#059669' },
          { id: 'lavender', name: 'Lavender (Sombre)', color1: '#c4b5fd', color2: '#8b5cf6' },
          { id: 'light-minimal', name: 'Clair Minimaliste', color1: '#3b82f6', color2: '#0ea5e9' },
          { id: 'light-warm', name: 'Clair Chaleureux', color1: '#f59e0b', color2: '#d97706' }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTheme(t.id)}
            style={{
              padding: '1rem 2rem',
              borderRadius: '12px',
              border: `2px solid ${theme === t.id ? t.color1 : 'var(--glass-border)'}`,
              background: 'var(--card-bg)',
              color: 'var(--text-main)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              transition: 'all 0.3s',
              boxShadow: theme === t.id ? `0 0 20px rgba(0,0,0,0.2)` : 'none'
            }}
          >
            <div style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '50%', 
              background: `linear-gradient(135deg, ${t.color1}, ${t.color2})` 
            }} />
            <span style={{ fontWeight: theme === t.id ? 700 : 400 }}>{t.name}</span>
            {theme === t.id && <Check size={18} color={t.color1} style={{ marginLeft: '0.5rem' }} />}
          </button>
        ))}
      </div>
    </div>
  );
}
