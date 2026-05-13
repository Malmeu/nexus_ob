import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Save, Eye, Edit3, Plus, CheckCircle, Trash2, ArrowLeft, Link as LinkIcon, Layout as LayoutIcon, Zap, GitCommit } from 'lucide-react';
import CodeMirror from '@uiw/react-codemirror';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { oneDark } from '@codemirror/theme-one-dark';
import KanbanBoard from './KanbanBoard';
import MermaidRenderer from './MermaidRenderer';
import TableEditorModal from './TableEditorModal';
import PromptModal from './PromptModal';
import BimViewer from './BimViewer';
import SmartBlueprint from './SmartBlueprint';
import WeatherBTP from './WeatherBTP';
import Gantt4D from './Gantt4D';
import BtpPluginEditorModal from './BtpPluginEditorModal';
import { TableProperties, PanelLeftClose, PanelLeftOpen, Box, MapPin, Clock, CloudRain } from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

const NoteEditor = ({ initialNote, plugins = {} }) => {
  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState('preview');
  const [isSaving, setIsSaving] = useState(false);
  const [backlinks, setBacklinks] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showTableEditor, setShowTableEditor] = useState(false);
  const [tableInitialMarkdown, setTableInitialMarkdown] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [newNotePromptOpen, setNewNotePromptOpen] = useState(false);
  const [btpModalConfig, setBtpModalConfig] = useState({ isOpen: false, type: null });
  const editorRef = useRef(null);

  const templatesList = [
    { name: "Note Journalière", content: "# Journal du <% return new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) %>\n\n## Humeur\n\n## Tâches du jour\n- [ ] " },
    { name: "Fiche de Lecture", content: "# Titre du livre\n**Auteur:** \n**Date:** <% return new Date().toLocaleDateString('fr-FR') %>\n\n## Résumé\n\n## Citations clés\n> " },
    { name: "Réunion", content: "## Réunion - <% return new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'}) %>\n**Participants:** \n\n### Actions\n- [ ] " },
    { name: "Diagramme Mermaid", content: "```mermaid\ngraph TD\n    A[Idée] --> B(Conception)\n    B --> C{Décision}\n    C -->|Oui| D[Implémentation]\n    C -->|Non| E[Rejet]\n```" }
  ];

  const insertTemplate = (templateContent) => {
    let evaluated = templateContent;
    const regex = /<%([\s\S]+?)%>/g;
    evaluated = evaluated.replace(regex, (match, jsCode) => {
      try {
        return new Function(jsCode)();
      } catch (err) {
        console.error("Template eval error", err);
        return `[Erreur JS: ${err.message}]`;
      }
    });
    insertMarkdown(evaluated, '');
    setShowTemplates(false);
  };

  const insertMarkdown = (prefix, suffix = '') => {
    if (!editorRef.current) {
      setContent(content + '\n' + prefix + suffix);
      return;
    }
    const view = editorRef.current.view;
    if (!view) return;

    const ranges = view.state.selection.ranges;
    if (ranges.length > 0) {
      const range = ranges[0];
      const selectedText = view.state.sliceDoc(range.from, range.to);
      const insertText = prefix + selectedText + suffix;

      view.dispatch({
        changes: { from: range.from, to: range.to, insert: insertText },
        selection: { anchor: range.from + prefix.length, head: range.from + prefix.length + selectedText.length }
      });
      view.focus();
    }
  };

  const toggleCheckbox = async (index) => {
    let currentIdx = 0;
    const newContent = content.replace(/- \[( |x|X)\]/g, (match) => {
      if (currentIdx === index) {
        currentIdx++;
        return match === '- [ ]' ? '- [x]' : '- [ ]';
      }
      currentIdx++;
      return match;
    });
    
    setContent(newContent);
    // Auto-save immediately
    if (selectedNote) {
      setIsSaving(true);
      try {
        await axios.put(`${API_BASE}/notes/${encodeURIComponent(selectedNote.path)}`, { content: newContent });
        setTimeout(() => setIsSaving(false), 500);
      } catch (err) {
        console.error(err);
        setIsSaving(false);
      }
    }
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (initialNote) {
      selectNote(initialNote);
    }
  }, [initialNote]);

  const fetchNotes = async () => {
    try {
      const res = await axios.get(`${API_BASE}/notes?t=${Date.now()}`);
      setNotes(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBacklinks = async (noteName) => {
    try {
      const res = await axios.get(`${API_BASE}/backlinks/${encodeURIComponent(noteName)}?t=${Date.now()}`);
      setBacklinks(res.data);
    } catch (err) {
      console.error(err);
      setBacklinks([]);
    }
  };

  const deleteNote = async () => {
    if (!selectedNote) return;
    if (!window.confirm(`Es-tu sûr de vouloir supprimer "${selectedNote.name}" ?`)) return;
    try {
      await axios.delete(`${API_BASE}/notes/${encodeURIComponent(selectedNote.path)}`);
      setSelectedNote(null);
      setContent('');
      setBacklinks([]);
      await fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const selectNote = async (note) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/notes/${encodeURIComponent(note.path)}`);
      setSelectedNote(note);
      setContent(res.data.content);
      setMode('preview');
      fetchBacklinks(note.name);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const saveNote = async () => {
    if (!selectedNote) return;
    setIsSaving(true);
    try {
      await axios.put(`${API_BASE}/notes/${encodeURIComponent(selectedNote.path)}`, { content });
      await fetchNotes();
      fetchBacklinks(selectedNote.name);
      setTimeout(() => setIsSaving(false), 1000);
    } catch (err) {
      console.error(err);
      setIsSaving(false);
    }
  };

  const createNewNote = () => {
    setNewNotePromptOpen(true);
  };

  const handleNewNoteSubmit = async (name) => {
    setNewNotePromptOpen(false);
    try {
      const res = await axios.post(`${API_BASE}/notes`, { name, content: `# ${name}\n\nNouvelle note.` });
      await fetchNotes();
      const newNote = { path: res.data.path, name: name.replace('.md', ''), mtime: new Date() };
      selectNote(newNote);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderers = {
    text: ({ value }) => {
      const parts = value.split(/(\[\[.*?\]\]|#\w+)/g);
      return parts.map((part, i) => {
        if (part.startsWith('[[') && part.endsWith(']]')) {
          const link = part.slice(2, -2);
          return (
            <span 
              key={i} 
              className="wiki-link"
              onClick={() => selectNote({ path: link + '.md', name: link })}
            >
              {link}
            </span>
          );
        }
        if (part.startsWith('#')) {
          return <span key={i} className="note-tag">{part}</span>;
        }
        return part;
      });
    }
  };

  // Calculate word count
  const wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const checkboxCounterRef = useRef(0);
  checkboxCounterRef.current = 0;

  return (
    <div className="editor-layout" style={{ display: 'flex', gap: '2rem', height: 'calc(100vh - 180px)' }}>
      {/* Sidebar de notes */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div 
            initial={{ width: 0, opacity: 0, overflow: 'hidden' }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0, overflow: 'hidden' }}
            transition={{ duration: 0.3 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flexShrink: 0 }}
          >
            <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
              <button 
                onClick={createNewNote}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--glass-border)', padding: '0.8rem', borderRadius: '12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.3s' }}
                className="new-note-btn"
              >
                <Plus size={18} />
                Nouvelle Note
              </button>

              <div style={{ position: 'relative' }}>
                <Search style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }} size={16} />
                <input 
                  className="search-input"
                  type="text" 
                  placeholder="Filtrer..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ width: '100%', background: 'var(--card-bg)', border: '1px solid var(--glass-border)', padding: '0.6rem 1rem 0.6rem 2.2rem', borderRadius: '10px', color: 'var(--text-main)' }}
                />
              </div>
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
                {filteredNotes.map(note => (
                  <div 
                    key={note.path}
                    onClick={() => selectNote(note)}
                    style={{ 
                      padding: '1rem', 
                      borderRadius: '12px', 
                      background: selectedNote?.path === note.path ? 'rgba(var(--accent-primary-rgb), 0.1)' : 'transparent',
                      border: selectedNote?.path === note.path ? '1px solid var(--accent-primary)' : '1px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{note.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.3rem' }}>{new Date(note.mtime).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zone d'édition / Prévisualisation */}
      <div style={{ flex: 1, background: 'var(--card-bg)', borderRadius: '24px', border: '1px solid var(--glass-border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {!selectedNote ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-dim)' }}>
            Sélectionnez une note pour commencer à lire ou éditer.
          </div>
        ) : (
          <>
            <div style={{ padding: '1rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '0.5rem', borderRadius: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                  title={isSidebarOpen ? "Fermer le panneau des notes" : "Ouvrir le panneau des notes"}
                >
                  {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
                </button>
                <div>
                  <div style={{ fontWeight: 700 }}>{selectedNote.name}.md</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                    {wordCount} mots · ~{readTime} min de lecture
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button 
                  onClick={() => setMode(mode === 'preview' ? 'edit' : 'preview')}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', padding: '0.5rem 1rem', borderRadius: '8px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                >
                  {mode === 'preview' ? <Edit3 size={16} /> : <Eye size={16} />}
                  {mode === 'preview' ? 'Modifier' : 'Aperçu'}
                </button>
                {plugins.kanban && (
                  <button 
                    onClick={() => setMode(mode === 'kanban' ? 'preview' : 'kanban')}
                    style={{ background: mode === 'kanban' ? 'rgba(0, 210, 255, 0.1)' : 'rgba(255,255,255,0.05)', border: `1px solid ${mode === 'kanban' ? 'var(--accent-primary)' : 'var(--glass-border)'}`, padding: '0.5rem 1rem', borderRadius: '8px', color: mode === 'kanban' ? 'var(--accent-primary)' : 'white', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
                  >
                    <LayoutIcon size={16} />
                    Kanban
                  </button>
                )}
                <button 
                  onClick={deleteNote}
                  style={{ background: 'rgba(255, 68, 68, 0.1)', border: '1px solid rgba(255, 68, 68, 0.2)', padding: '0.5rem', borderRadius: '8px', color: '#ff4444', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                  title="Supprimer la note"
                >
                  <Trash2 size={16} />
                </button>
                <button 
                  onClick={saveNote}
                  disabled={isSaving}
                  style={{ background: 'var(--accent-primary)', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', color: 'black', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', opacity: isSaving ? 0.7 : 1 }}
                >
                  {isSaving ? <CheckCircle size={16} /> : <Save size={16} />}
                  {isSaving ? 'Enregistré' : 'Sauvegarder'}
                </button>
              </div>
            </div>
            
            <div style={{ flex: 1, overflowY: mode === 'kanban' ? 'hidden' : 'auto', padding: mode === 'kanban' ? '0' : '2rem', display: 'flex', flexDirection: 'column' }}>
              <AnimatePresence mode="wait">
                {mode === 'preview' ? (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="markdown-preview"
                  >
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        input: ({type, checked, ...props}) => {
                          if (type === 'checkbox') {
                            const currentIndex = checkboxCounterRef.current++;
                            return (
                              <input 
                                type="checkbox" 
                                checked={checked} 
                                onChange={() => toggleCheckbox(currentIndex)} 
                              />
                            );
                          }
                          return <input type={type} checked={checked} {...props} />;
                        },
                        p: ({children}) => {
                          if (typeof children === 'string') {
                            return <p>{renderers.text({value: children})}</p>
                          }
                          return <p>{children}</p>
                        },
                        li: ({children, checked, ...props}) => {
                          if (checked !== null) {
                            return (
                              <li className="task-list-item" style={{ listStyleType: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {children}
                              </li>
                            )
                          }
                          return <li {...props}>{children}</li>
                        },
                        code: ({node, inline, className, children, ...props}) => {
                          const match = /language-(\w+)/.exec(className || '');
                          const isMermaid = match && match[1] === 'mermaid';
                          const isBim = match && match[1] === 'bim';
                          const isBlueprint = match && match[1] === 'blueprint';
                          const isWeather = match && match[1] === 'weather';
                          const isGantt4d = match && match[1] === 'gantt4d';
                          
                          if (!inline && plugins.diagrams && isMermaid) {
                            return <MermaidRenderer chart={String(children).replace(/\n$/, '')} />;
                          }

                          if (!inline && plugins.bimViewer && isBim) {
                            return <BimViewer content={String(children).replace(/\n$/, '')} />;
                          }

                          if (!inline && plugins.smartBlueprint && isBlueprint) {
                            return <SmartBlueprint content={String(children).replace(/\n$/, '')} />;
                          }

                          if (!inline && plugins.weatherBTP && isWeather) {
                            return <WeatherBTP content={String(children).replace(/\n$/, '')} />;
                          }

                          if (!inline && plugins.gantt4d && isGantt4d) {
                            return <Gantt4D content={String(children).replace(/\n$/, '')} />;
                          }
                          
                          return (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          );
                        }
                      }}
                    >
                      {content}
                    </ReactMarkdown>

                    {/* Backlinks Panel */}
                    {backlinks.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--glass-border)' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'var(--accent-primary)' }}>
                          <LinkIcon size={16} />
                          <span style={{ fontWeight: 700, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            {backlinks.length} Backlink{backlinks.length > 1 ? 's' : ''}
                          </span>
                        </div>
                        {backlinks.map(bl => (
                          <div 
                            key={bl.path} 
                            onClick={() => selectNote({ path: bl.path, name: bl.name })}
                            style={{ 
                              padding: '0.8rem 1rem', 
                              marginBottom: '0.5rem', 
                              background: 'rgba(0, 210, 255, 0.05)', 
                              border: '1px solid rgba(0, 210, 255, 0.1)', 
                              borderRadius: '10px', 
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{bl.name}</div>
                            {bl.context && (
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '0.3rem', fontStyle: 'italic' }}>
                                "{bl.context}"
                              </div>
                            )}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </motion.div>
                ) : mode === 'kanban' ? (
                  <motion.div
                    key="kanban"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', paddingTop: '1rem' }}
                  >
                    <KanbanBoard 
                      content={content} 
                      onChange={(newContent) => {
                        setContent(newContent);
                        // Auto-save when Kanban is updated
                        setIsSaving(true);
                        axios.put(`${API_BASE}/notes/${encodeURIComponent(selectedNote.path)}`, { content: newContent })
                          .then(() => setTimeout(() => setIsSaving(false), 500))
                          .catch(err => { console.error(err); setIsSaving(false); });
                      }} 
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="edit"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                  >
                    {/* Markdown Formatting Toolbar */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                      <ToolbarButton icon={<span style={{ fontWeight: 800 }}>B</span>} onClick={(e) => { e.preventDefault(); insertMarkdown('**', '**'); }} title="Gras" />
                      <ToolbarButton icon={<span style={{ fontStyle: 'italic' }}>I</span>} onClick={(e) => { e.preventDefault(); insertMarkdown('*', '*'); }} title="Italique" />
                      <div style={{ width: '1px', background: 'var(--glass-border)', margin: '0 0.5rem' }}></div>
                      <ToolbarButton icon={<span style={{ fontWeight: 700 }}>H1</span>} onClick={() => insertMarkdown('# ', '')} title="Titre 1" />
                      <ToolbarButton icon={<span style={{ fontWeight: 600 }}>H2</span>} onClick={() => insertMarkdown('## ', '')} title="Titre 2" />
                      <ToolbarButton icon={<span style={{ fontWeight: 500 }}>H3</span>} onClick={() => insertMarkdown('### ', '')} title="Titre 3" />
                      <div style={{ width: '1px', background: 'var(--glass-border)', margin: '0 0.5rem' }}></div>
                      <ToolbarButton icon={<span style={{ fontWeight: 700 }}>-</span>} onClick={() => insertMarkdown('- ', '')} title="Liste à puces" />
                      <ToolbarButton icon={<span style={{ fontWeight: 700 }}>[ ]</span>} onClick={() => insertMarkdown('- [ ] ', '')} title="Tâche" />
                      <div style={{ width: '1px', background: 'var(--glass-border)', margin: '0 0.5rem' }}></div>
                      <ToolbarButton icon={<LinkIcon size={14} />} onClick={() => insertMarkdown('[[', ']]')} title="Lien Interne" />
                      <ToolbarButton icon={<span style={{ fontFamily: 'monospace' }}>&lt;/&gt;</span>} onClick={() => insertMarkdown('`', '`')} title="Code" />
                      <ToolbarButton icon={<span style={{ fontWeight: 700 }}>"</span>} onClick={() => insertMarkdown('> ', '')} title="Citation" />
                      
                      {plugins.diagrams && (
                        <>
                          <div style={{ width: '1px', background: 'var(--glass-border)', margin: '0 0.5rem' }}></div>
                          <ToolbarButton 
                            icon={<GitCommit size={14} color="#ec4899" />} 
                            onClick={() => insertMarkdown('```mermaid\ngraph TD\n    A[Nouveau Nœud] --> B(Autre Nœud)\n```\n', '')} 
                            title="Insérer un Diagramme / Mindmap" 
                          />
                        </>
                      )}

                      {plugins.bimViewer && (
                        <>
                          <div style={{ width: '1px', background: 'var(--glass-border)', margin: '0 0.5rem' }}></div>
                          <ToolbarButton 
                            icon={<Box size={14} color="#8b5cf6" />} 
                            onClick={() => insertMarkdown('```bim\nModèle interactif généré automatiquement.\n```\n', '')} 
                            title="Insérer une Visionneuse 3D (BIM)" 
                          />
                        </>
                      )}

                      {plugins.smartBlueprint && (
                        <ToolbarButton 
                          icon={<MapPin size={14} color="#f43f5e" />} 
                          onClick={() => setBtpModalConfig({ isOpen: true, type: 'blueprint' })} 
                          title="Configurer un Plan Interactif (Blueprint)" 
                        />
                      )}

                      {plugins.gantt4d && (
                        <ToolbarButton 
                          icon={<Clock size={14} color="#f59e0b" />} 
                          onClick={() => setBtpModalConfig({ isOpen: true, type: 'gantt4d' })} 
                          title="Configurer un Planning Animé (Super-Gantt 4D)" 
                        />
                      )}

                      {plugins.weatherBTP && (
                        <ToolbarButton 
                          icon={<CloudRain size={14} color="#0ea5e9" />} 
                          onClick={() => setBtpModalConfig({ isOpen: true, type: 'weather' })} 
                          title="Configurer un Widget Météo Chantier" 
                        />
                      )}

                      {plugins.templates && (
                        <>
                          <div style={{ width: '1px', background: 'var(--glass-border)', margin: '0 0.5rem' }}></div>
                          <div style={{ position: 'relative' }}>
                            <ToolbarButton 
                              icon={<Zap size={14} color="#eab308" />} 
                              onClick={() => setShowTemplates(!showTemplates)} 
                              title="Templates Avancés (JS Dynamique)" 
                            />
                            <AnimatePresence>
                              {showTemplates && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: 10 }}
                                  style={{
                                    position: 'absolute',
                                    top: '100%',
                                    left: 0,
                                    marginTop: '0.5rem',
                                    background: 'var(--card-bg)',
                                    backdropFilter: 'blur(20px)',
                                    border: '1px solid var(--accent-primary)',
                                    borderRadius: '12px',
                                    padding: '0.5rem',
                                    width: '220px',
                                    zIndex: 50,
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                                  }}
                                >
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', padding: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Insérer un template</div>
                                  {templatesList.map(t => (
                                    <div 
                                      key={t.name}
                                      onClick={() => insertTemplate(t.content)}
                                      style={{ padding: '0.6rem', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s', fontSize: '0.9rem' }}
                                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                    >
                                      <Zap size={14} color="var(--text-dim)" />
                                      {t.name}
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </>
                      )}
                      {plugins.tables && (
                        <>
                          <div style={{ width: '1px', background: 'var(--glass-border)', margin: '0 0.5rem' }}></div>
                          <ToolbarButton 
                            icon={<TableProperties size={14} color="#10b981" />} 
                            onClick={() => {
                              if (editorRef.current && editorRef.current.view) {
                                const view = editorRef.current.view;
                                const ranges = view.state.selection.ranges;
                                if (ranges.length > 0) {
                                  const range = ranges[0];
                                  setTableInitialMarkdown(view.state.sliceDoc(range.from, range.to));
                                } else {
                                  setTableInitialMarkdown('');
                                }
                              } else {
                                setTableInitialMarkdown('');
                              }
                              setShowTableEditor(true);
                            }} 
                            title="Créer / Éditer un Tableau interactif" 
                          />
                        </>
                      )}
                    </div>

                    <div style={{ flex: 1, overflow: 'auto', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                      <CodeMirror
                        ref={editorRef}
                        value={content}
                        theme={oneDark}
                        extensions={[markdown({ base: markdownLanguage, codeLanguages: languages })]}
                        onChange={(value) => setContent(value)}
                        style={{ fontSize: '1.1rem', minHeight: '100%' }}
                        className="cm-editor-container"
                      />
                    </div>

                    <AnimatePresence>
                      {showTableEditor && (
                        <TableEditorModal 
                          initialMarkdown={tableInitialMarkdown}
                          onClose={() => setShowTableEditor(false)}
                          onSave={(newMd) => {
                            insertMarkdown(newMd, '');
                            setShowTableEditor(false);
                          }}
                        />
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      <PromptModal
        isOpen={newNotePromptOpen}
        onClose={() => setNewNotePromptOpen(false)}
        onSubmit={handleNewNoteSubmit}
        title="Créer une Nouvelle Note"
        placeholder="Titre de la note..."
      />

      <BtpPluginEditorModal
        isOpen={btpModalConfig.isOpen}
        onClose={() => setBtpModalConfig({ isOpen: false, type: null })}
        pluginType={btpModalConfig.type}
        onInsert={(md) => insertMarkdown(md, '')}
      />
    </div>
  );
};

export default NoteEditor;

const ToolbarButton = ({ icon, onClick, title }) => (
  <button
    onClick={onClick}
    title={title}
    style={{
      background: 'transparent',
      border: 'none',
      color: 'var(--text-dim)',
      cursor: 'pointer',
      width: '28px',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '4px',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'var(--text-main)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-dim)'; }}
  >
    {icon}
  </button>
);
