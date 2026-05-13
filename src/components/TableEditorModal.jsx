import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Check, X, ArrowRight, ArrowDown } from 'lucide-react';

export default function TableEditorModal({ initialMarkdown, onSave, onClose }) {
  const [grid, setGrid] = useState([['Colonne 1', 'Colonne 2'], ['Valeur 1', 'Valeur 2']]);

  useEffect(() => {
    if (initialMarkdown && initialMarkdown.includes('|')) {
      // Basic markdown table parser
      const lines = initialMarkdown.split('\n').filter(line => line.trim().startsWith('|'));
      if (lines.length >= 2) {
        const parsedGrid = [];
        lines.forEach((line, index) => {
          // Skip the separator line like |---|---|
          if (index === 1 && line.replace(/\|/g, '').replace(/-/g, '').replace(/:/g, '').trim() === '') {
            return;
          }
          const cells = line.split('|').map(c => c.trim()).slice(1, -1);
          if (cells.length > 0) {
            parsedGrid.push(cells);
          }
        });
        
        // Ensure all rows have the same number of columns
        if (parsedGrid.length > 0) {
          const maxCols = Math.max(...parsedGrid.map(row => row.length));
          const normalizedGrid = parsedGrid.map(row => {
            while (row.length < maxCols) row.push('');
            return row;
          });
          setGrid(normalizedGrid);
        }
      }
    }
  }, [initialMarkdown]);

  const updateCell = (rowIndex, colIndex, value) => {
    const newGrid = [...grid];
    newGrid[rowIndex][colIndex] = value;
    setGrid(newGrid);
  };

  const addColumn = () => {
    setGrid(grid.map(row => [...row, '']));
  };

  const addRow = () => {
    const newRow = new Array(grid[0].length).fill('');
    setGrid([...grid, newRow]);
  };

  const removeColumn = (colIndex) => {
    if (grid[0].length <= 1) return;
    setGrid(grid.map(row => row.filter((_, i) => i !== colIndex)));
  };

  const removeRow = (rowIndex) => {
    if (grid.length <= 1) return;
    setGrid(grid.filter((_, i) => i !== rowIndex));
  };

  const handleSave = () => {
    // Generate Markdown
    let md = '\n';
    grid.forEach((row, rowIndex) => {
      md += '| ' + row.join(' | ') + ' |\n';
      // Add separator after header
      if (rowIndex === 0) {
        md += '|' + row.map(() => '---').join('|') + '|\n';
      }
    });
    md += '\n';
    onSave(md);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '24px',
          padding: '2rem',
          width: '90%',
          maxWidth: '1000px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            Éditeur de Tableau Interactif
          </h2>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <div style={{ overflow: 'auto', flex: 1, border: '1px solid var(--glass-border)', borderRadius: '12px', padding: '1rem', background: 'rgba(0,0,0,0.3)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: 'max-content' }}>
            {grid.map((row, rowIndex) => (
              <div key={rowIndex} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {row.map((cell, colIndex) => (
                  <div key={colIndex} style={{ position: 'relative' }}>
                    <input 
                      value={cell}
                      onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                      placeholder={rowIndex === 0 ? `En-tête ${colIndex + 1}` : `Cellule`}
                      style={{
                        padding: '0.6rem',
                        background: rowIndex === 0 ? 'rgba(0, 210, 255, 0.1)' : 'rgba(255,255,255,0.05)',
                        border: `1px solid ${rowIndex === 0 ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
                        borderRadius: '8px',
                        color: 'var(--text-main)',
                        width: '180px',
                        outline: 'none',
                        fontWeight: rowIndex === 0 ? 600 : 400
                      }}
                    />
                    {rowIndex === 0 && grid[0].length > 1 && (
                      <button 
                        onClick={() => removeColumn(colIndex)}
                        title="Supprimer la colonne"
                        style={{ position: 'absolute', top: '-10px', right: '-10px', background: '#ff4444', color: 'var(--text-main)', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '10px', opacity: 0.8 }}
                      ><X size={12}/></button>
                    )}
                  </div>
                ))}
                {grid.length > 1 && (
                  <button 
                    onClick={() => removeRow(rowIndex)}
                    title="Supprimer la ligne"
                    style={{ background: 'rgba(255, 68, 68, 0.1)', color: '#ff4444', border: 'none', borderRadius: '8px', padding: '0 0.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                  ><Trash2 size={16} /></button>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button 
              onClick={addRow}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--glass-border)', padding: '0.6rem 1rem', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' }}
            >
              <ArrowDown size={16} /> Ajouter une ligne
            </button>
            <button 
              onClick={addColumn}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--glass-border)', padding: '0.6rem 1rem', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' }}
            >
              <ArrowRight size={16} /> Ajouter une colonne
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
          <button 
            onClick={onClose}
            style={{ background: 'transparent', border: '1px solid var(--glass-border)', padding: '0.6rem 1.5rem', borderRadius: '8px', color: 'var(--text-main)', cursor: 'pointer' }}
          >
            Annuler
          </button>
          <button 
            onClick={handleSave}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-primary)', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', color: 'black', fontWeight: 600, cursor: 'pointer' }}
          >
            <Check size={18} />
            Insérer le Tableau
          </button>
        </div>
      </motion.div>
    </div>
  );
}
