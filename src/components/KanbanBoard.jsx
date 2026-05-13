import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, MoreHorizontal, CheckSquare, Square } from 'lucide-react';
import PromptModal from './PromptModal';

export default function KanbanBoard({ content, onChange }) {
  const [columns, setColumns] = useState([]);

  // Parse markdown into columns
  useEffect(() => {
    const lines = content.split('\n');
    const newColumns = [];
    let currentColumn = null;

    lines.forEach((line, index) => {
      const headerMatch = line.match(/^##\s+(.+)$/);
      if (headerMatch) {
        if (currentColumn) {
          newColumns.push(currentColumn);
        }
        currentColumn = {
          id: `col-${index}`,
          title: headerMatch[1],
          lineIndex: index,
          items: []
        };
      } else if (currentColumn) {
        // Look for task items: - [ ] Task or - [x] Task or - Task
        const taskMatch = line.match(/^-\s+\[( |x|X)\]\s+(.+)$/) || line.match(/^-\s+(.+)$/);
        if (taskMatch) {
          const isCheckbox = line.includes('- [');
          const isChecked = taskMatch[1]?.toLowerCase() === 'x';
          const text = isCheckbox ? taskMatch[2] : taskMatch[1];
          
          currentColumn.items.push({
            id: `item-${index}`,
            lineIndex: index,
            text: text,
            isChecked: isChecked,
            isCheckbox: isCheckbox,
            rawLine: line
          });
        } else if (line.trim() !== '') {
          // If there's other text, we could either keep it as part of the column description
          // but for simplicity, we just ignore non-task lines for the Kanban rendering
        }
      }
    });

    if (currentColumn) {
      newColumns.push(currentColumn);
    }

    setColumns(newColumns);
  }, [content]);

  const [draggedItem, setDraggedItem] = useState(null);
  const [draggedOverCol, setDraggedOverCol] = useState(null);

  const handleDragStart = (e, item, sourceColId) => {
    setDraggedItem({ item, sourceColId });
    e.dataTransfer.effectAllowed = "move";
    // Slight delay for visual feedback
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedItem(null);
    setDraggedOverCol(null);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    if (draggedOverCol !== colId) {
      setDraggedOverCol(colId);
    }
  };

  const handleDrop = (e, targetColId) => {
    e.preventDefault();
    setDraggedOverCol(null);
    if (!draggedItem) return;

    const { item, sourceColId } = draggedItem;
    if (sourceColId === targetColId) return;

    // We need to move the line in the markdown content.
    const lines = content.split('\n');
    
    // Find target column insertion point (end of target column)
    const targetCol = columns.find(c => c.id === targetColId);
    let insertIndex = lines.length;
    
    // Find the start of the next column to insert before it
    const targetColIndex = columns.findIndex(c => c.id === targetColId);
    if (targetColIndex < columns.length - 1) {
      insertIndex = columns[targetColIndex + 1].lineIndex;
    }

    // Remove item from old position
    const itemRawLine = lines[item.lineIndex];
    lines.splice(item.lineIndex, 1);
    
    // Adjust insertIndex if we removed a line before it
    if (item.lineIndex < insertIndex) {
      insertIndex--;
    }
    
    // Insert into new position
    lines.splice(insertIndex, 0, itemRawLine);
    
    onChange(lines.join('\n'));
  };

  const toggleTaskStatus = (item) => {
    if (!item.isCheckbox) return;
    const lines = content.split('\n');
    const oldLine = lines[item.lineIndex];
    let newLine;
    if (item.isChecked) {
      newLine = oldLine.replace(/- \[(x|X)\]/, '- [ ]');
    } else {
      newLine = oldLine.replace(/- \[ \]/, '- [x]');
    }
    lines[item.lineIndex] = newLine;
    onChange(lines.join('\n'));
  };

  const [promptData, setPromptData] = useState({ isOpen: false, col: null });

  const addItemToCol = (col) => {
    setPromptData({ isOpen: true, col });
  };

  const handlePromptSubmit = (text) => {
    const col = promptData.col;
    setPromptData({ isOpen: false, col: null });
    
    const lines = content.split('\n');
    const colIndex = columns.findIndex(c => c.id === col.id);
    let insertIndex = lines.length;
    
    if (colIndex < columns.length - 1) {
      insertIndex = columns[colIndex + 1].lineIndex;
    }
    
    lines.splice(insertIndex, 0, `- [ ] ${text}`);
    onChange(lines.join('\n'));
  };

  if (columns.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-dim)' }}>
        <p>Pour utiliser le Kanban, ajoutez des titres de niveau 2 (## Colonne) et des listes de tâches (- [ ] Tâche) dans votre note.</p>
        <button 
          onClick={() => onChange(content + '\n\n## À Faire\n- [ ] Nouvelle Tâche\n\n## En Cours\n\n## Terminé\n')}
          style={{ marginTop: '1rem', background: 'var(--accent-primary)', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', color: 'black', cursor: 'pointer', fontWeight: 600 }}
        >
          Initialiser un Kanban
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      gap: '1.5rem', 
      overflowX: 'auto', 
      overflowY: 'auto',
      padding: '1rem 2rem',
      flex: 1,
      alignItems: 'flex-start'
    }}>
      {columns.map(col => (
        <div 
          key={col.id}
          onDragOver={(e) => handleDragOver(e, col.id)}
          onDrop={(e) => handleDrop(e, col.id)}
          style={{
            minWidth: '300px',
            width: '300px',
            background: draggedOverCol === col.id ? 'rgba(255,255,255,0.05)' : 'var(--card-bg)',
            border: `1px solid ${draggedOverCol === col.id ? 'var(--accent-primary)' : 'var(--glass-border)'}`,
            borderRadius: '16px',
            padding: '1.2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            transition: 'all 0.2s',
            maxHeight: 'calc(100% - 2rem)',
            marginTop: '1rem'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>{col.title}</h3>
            <div style={{ display: 'flex', gap: '0.5rem', color: 'var(--text-dim)' }}>
              <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                {col.items.length}
              </span>
              <MoreHorizontal size={18} style={{ cursor: 'pointer' }} />
            </div>
          </div>

          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '0.8rem',
            overflowY: 'auto',
            flex: 1,
            minHeight: '50px' // Allow dropping into empty columns
          }}>
            {col.items.map(item => (
              <motion.div
                layoutId={item.id}
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item, col.id)}
                onDragEnd={handleDragEnd}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  padding: '1rem',
                  cursor: 'grab',
                  display: 'flex',
                  gap: '0.8rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
                whileHover={{ y: -2, boxShadow: '0 6px 12px rgba(0,0,0,0.15)', borderColor: 'rgba(255,255,255,0.2)' }}
              >
                {item.isCheckbox && (
                  <div 
                    onClick={() => toggleTaskStatus(item)}
                    style={{ cursor: 'pointer', color: item.isChecked ? 'var(--accent-primary)' : 'var(--text-dim)', marginTop: '2px' }}
                  >
                    {item.isChecked ? <CheckSquare size={18} /> : <Square size={18} />}
                  </div>
                )}
                <div style={{ 
                  flex: 1, 
                  fontSize: '0.95rem',
                  textDecoration: item.isChecked ? 'line-through' : 'none',
                  color: item.isChecked ? 'var(--text-dim)' : 'white'
                }}>
                  {item.text}
                </div>
              </motion.div>
            ))}
          </div>

          <button 
            onClick={() => addItemToCol(col)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              background: 'transparent', 
              border: '1px dashed var(--glass-border)', 
              color: 'var(--text-dim)',
              padding: '0.8rem',
              borderRadius: '10px',
              cursor: 'pointer',
              justifyContent: 'center',
              transition: 'all 0.2s',
              marginTop: 'auto'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.borderColor = 'var(--glass-border)'; }}
          >
            <Plus size={16} />
            Ajouter une carte
          </button>
        </div>
      ))}

      <PromptModal
        isOpen={promptData.isOpen}
        onClose={() => setPromptData({ isOpen: false, col: null })}
        onSubmit={handlePromptSubmit}
        title="Nouvelle Tâche"
        placeholder="Nom de la tâche..."
      />
    </div>
  );
}
