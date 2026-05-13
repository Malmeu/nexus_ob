import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Hash, FileText, ChevronRight } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

const TagsView = ({ onNoteClick }) => {
  const [tags, setTags] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const res = await axios.get(`${API_BASE}/tags`);
      setTags(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <div className="tags-view" style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 180px)' }}>
      {/* Liste des Tags */}
      <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
        <h3 style={{ fontSize: '1rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tous les Tags</h3>
        {Object.keys(tags).map(tag => (
          <motion.div 
            key={tag}
            whileHover={{ x: 5 }}
            onClick={() => setSelectedTag(tag)}
            style={{ 
              padding: '1rem', 
              borderRadius: '12px', 
              background: selectedTag === tag ? 'rgba(0, 255, 136, 0.1)' : 'var(--card-bg)', 
              border: selectedTag === tag ? '1px solid #00ff88' : '1px solid var(--glass-border)',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: selectedTag === tag ? '#00ff88' : 'white' }}>
              <Hash size={16} />
              {tag}
            </div>
            <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>{tags[tag].length}</span>
          </motion.div>
        ))}
      </div>

      {/* Notes associées au tag sélectionné */}
      <div style={{ flex: 1, background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--glass-border)', padding: '2rem', overflowY: 'auto' }}>
        {!selectedTag ? (
          <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)', opacity: 0.5 }}>
            <Hash size={48} style={{ marginBottom: '1rem' }} />
            <p>Sélectionne un tag pour voir les notes associées.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
              <span style={{ color: '#00ff88' }}>#</span> {selectedTag.replace('#', '')}
            </h2>
            <div className="files-grid">
              {tags[selectedTag].map(note => (
                <div 
                  key={note.path} 
                  className="file-card"
                  onClick={() => onNoteClick(note)}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <FileText size={18} color="var(--accent-primary)" />
                    <span>{note.name}</span>
                  </div>
                  <ChevronRight size={16} opacity={0.5} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TagsView;
