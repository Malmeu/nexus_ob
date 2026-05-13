import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';

export default function BtpPluginEditorModal({ isOpen, onClose, onInsert, pluginType }) {
  // Weather State
  const [weatherData, setWeatherData] = useState({ city: 'Alger', temp: 15, wind: 20, humidity: 60 });

  // Gantt State
  const [ganttTasks, setGanttTasks] = useState([
    { id: 1, name: "Nouvelle Tâche", start: 0, duration: 20, color: "#3b82f6" }
  ]);

  // Blueprint State
  const [blueprintData, setBlueprintData] = useState({
    title: "Plan de Chantier",
    subtitle: "Sélectionnez une image",
    bg: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?q=80&w=1000",
    pins: []
  });

  if (!isOpen) return null;

  const handleInsert = () => {
    let markdownBlock = '';
    
    if (pluginType === 'weather') {
      markdownBlock = "```weather\n" + JSON.stringify(weatherData, null, 2) + "\n```\n";
    } else if (pluginType === 'gantt4d') {
      markdownBlock = "```gantt4d\n" + JSON.stringify(ganttTasks, null, 2) + "\n```\n";
    } else if (pluginType === 'blueprint') {
      markdownBlock = "```blueprint\n" + JSON.stringify(blueprintData, null, 2) + "\n```\n";
    }
    
    onInsert(markdownBlock);
    onClose();
  };

  const renderWeatherEditor = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Ville / Chantier</label>
        <input 
          type="text" 
          value={weatherData.city} 
          onChange={e => setWeatherData({...weatherData, city: e.target.value})}
          style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Température (°C)</label>
          <input 
            type="number" 
            value={weatherData.temp} 
            onChange={e => setWeatherData({...weatherData, temp: Number(e.target.value)})}
            style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Vent (km/h)</label>
          <input 
            type="number" 
            value={weatherData.wind} 
            onChange={e => setWeatherData({...weatherData, wind: Number(e.target.value)})}
            style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}
          />
        </div>
      </div>
    </div>
  );

  const renderGanttEditor = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: '0.9rem' }}>Les pourcentages vont de 0 à 100.</p>
      {ganttTasks.map((task, index) => (
        <div key={task.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <input 
            type="text" 
            placeholder="Nom"
            value={task.name}
            onChange={e => { const t = [...ganttTasks]; t[index].name = e.target.value; setGanttTasks(t); }}
            style={{ flex: 2, padding: '0.5rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px' }}
          />
          <input 
            type="number" 
            placeholder="Début %"
            value={task.start}
            onChange={e => { const t = [...ganttTasks]; t[index].start = Number(e.target.value); setGanttTasks(t); }}
            style={{ flex: 1, padding: '0.5rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px' }}
          />
          <input 
            type="number" 
            placeholder="Durée %"
            value={task.duration}
            onChange={e => { const t = [...ganttTasks]; t[index].duration = Number(e.target.value); setGanttTasks(t); }}
            style={{ flex: 1, padding: '0.5rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px' }}
          />
          <input 
            type="color" 
            value={task.color}
            onChange={e => { const t = [...ganttTasks]; t[index].color = e.target.value; setGanttTasks(t); }}
            style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', cursor: 'pointer' }}
          />
          <button onClick={() => setGanttTasks(ganttTasks.filter(t => t.id !== task.id))} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
            <Trash2 size={18} />
          </button>
        </div>
      ))}
      <button 
        onClick={() => setGanttTasks([...ganttTasks, { id: Date.now(), name: 'Nouvelle Tâche', start: 0, duration: 10, color: '#10b981' }])}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--glass-border)', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' }}
      >
        <Plus size={16} /> Ajouter une tâche
      </button>
    </div>
  );

  const renderBlueprintEditor = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>Titre du Plan</label>
        <input 
          type="text" 
          value={blueprintData.title} 
          onChange={e => setBlueprintData({...blueprintData, title: e.target.value})}
          style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}
        />
      </div>
      <div>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-dim)' }}>URL de l'image du Plan (Web ou Locale)</label>
        <input 
          type="text" 
          value={blueprintData.bg} 
          onChange={e => setBlueprintData({...blueprintData, bg: e.target.value})}
          placeholder="https://..."
          style={{ width: '100%', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '8px' }}
        />
      </div>
      
      <div style={{ marginTop: '1rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)' }}>Points d'intérêt (Réserves)</h4>
        {blueprintData.pins.map((pin, index) => (
          <div key={pin.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)', marginBottom: '0.5rem' }}>
            <input 
              type="text" 
              placeholder="Titre"
              value={pin.title}
              onChange={e => { const p = [...blueprintData.pins]; p[index].title = e.target.value; setBlueprintData({...blueprintData, pins: p}); }}
              style={{ flex: 2, padding: '0.5rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px' }}
            />
            <input 
              type="number" 
              placeholder="X (%)"
              value={pin.x}
              onChange={e => { const p = [...blueprintData.pins]; p[index].x = Number(e.target.value); setBlueprintData({...blueprintData, pins: p}); }}
              style={{ flex: 1, padding: '0.5rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px' }}
            />
            <input 
              type="number" 
              placeholder="Y (%)"
              value={pin.y}
              onChange={e => { const p = [...blueprintData.pins]; p[index].y = Number(e.target.value); setBlueprintData({...blueprintData, pins: p}); }}
              style={{ flex: 1, padding: '0.5rem', background: 'transparent', border: '1px solid var(--glass-border)', color: 'white', borderRadius: '4px' }}
            />
            <input 
              type="color" 
              value={pin.color}
              onChange={e => { const p = [...blueprintData.pins]; p[index].color = e.target.value; setBlueprintData({...blueprintData, pins: p}); }}
              style={{ width: '40px', height: '40px', border: 'none', background: 'transparent', cursor: 'pointer' }}
            />
            <button onClick={() => setBlueprintData({...blueprintData, pins: blueprintData.pins.filter(p => p.id !== pin.id)})} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        <button 
          onClick={() => setBlueprintData({...blueprintData, pins: [...blueprintData.pins, { id: Date.now(), title: 'Nouveau point', x: 50, y: 50, status: 'En cours', color: '#f43f5e' }]})}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--glass-border)', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' }}
        >
          <Plus size={16} /> Ajouter un point
        </button>
      </div>
    </div>
  );

  const getTitle = () => {
    if (pluginType === 'weather') return 'Configurer le Widget Météo';
    if (pluginType === 'gantt4d') return 'Configurer le Super-Gantt';
    if (pluginType === 'blueprint') return 'Configurer le Smart Blueprint';
    return 'Éditeur';
  };

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, padding: '1rem'
      }}>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
          style={{
            background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px',
            padding: '2rem', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
            position: 'relative', zIndex: 1, boxShadow: '0 20px 40px rgba(0,0,0,0.4)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)' }}>{getTitle()}</h3>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
              <X size={24} />
            </button>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            {pluginType === 'weather' && renderWeatherEditor()}
            {pluginType === 'gantt4d' && renderGanttEditor()}
            {pluginType === 'blueprint' && renderBlueprintEditor()}
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={{ background: 'transparent', border: '1px solid var(--glass-border)', padding: '0.8rem 1.5rem', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' }}>
              Annuler
            </button>
            <button onClick={handleInsert} style={{ background: 'var(--accent-primary)', border: 'none', padding: '0.8rem 1.5rem', borderRadius: '8px', color: 'black', fontWeight: 600, cursor: 'pointer' }}>
              Insérer dans la note
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
