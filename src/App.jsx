import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Layout, 
  FileText, 
  Hash, 
  Link as LinkIcon, 
  Clock, 
  Search, 
  Settings, 
  Layers,
  ChevronRight,
  Activity,
  CalendarDays,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import GraphView from './components/GraphView';
import NoteEditor from './components/NoteEditor';
import TagsView from './components/TagsView';
import SettingsView from './components/SettingsView';

const API_BASE = 'http://localhost:3001/api';

function App() {
  const [plugins, setPlugins] = useState(() => {
    const saved = localStorage.getItem('nexus_plugins');
    if (saved) return JSON.parse(saved);
    return {
      templates: false,
      kanban: false,
      diagrams: false,
      tables: false,
      bimViewer: false,
      smartBlueprint: false,
      gantt4d: false,
      weatherBTP: false
    };
  });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('nexus_theme') || 'nexus';
  });
  const [view, setView] = useState('dashboard');
  const [stats, setStats] = useState({ totalNotes: 0, totalLinks: 0, totalTags: 0 });
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNoteRef, setSelectedNoteRef] = useState(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [view]);

  useEffect(() => {
    localStorage.setItem('nexus_theme', theme);
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('nexus_plugins', JSON.stringify(plugins));
  }, [plugins]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setView('notes');
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'g') {
        e.preventDefault();
        setView('graph');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await axios.get(`${API_BASE}/search?q=${encodeURIComponent(searchQuery)}&t=${Date.now()}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error(err);
      }
      setIsSearching(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, notesRes] = await Promise.all([
        axios.get(`${API_BASE}/stats?t=${Date.now()}`),
        axios.get(`${API_BASE}/notes?t=${Date.now()}`)
      ]);
      setStats(statsRes.data);
      setRecentNotes(notesRes.data.slice(0, 6));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const navigateToNote = (note) => {
    setSelectedNoteRef({ ...note, _ts: Date.now() });
    setView('notes');
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const openDailyNote = async () => {
    try {
      const res = await axios.get(`${API_BASE}/daily`);
      navigateToNote({ path: res.data.path, name: res.data.name });
    } catch (err) {
      console.error(err);
    }
  };

  // Highlight matched text in snippets
  const highlightSnippet = (snippet) => {
    if (!searchQuery) return snippet;
    const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return snippet.split(regex).map((part, i) => 
      regex.test(part) ? <mark key={i} style={{ background: 'rgba(0, 210, 255, 0.3)', color: 'white', borderRadius: '2px', padding: '0 2px' }}>{part}</mark> : part
    );
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="logo">
          <Layers size={28} />
          <span>NEXUS</span>
        </div>
        
        <nav className="nav-links">
          <div 
            className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
            onClick={() => setView('dashboard')}
          >
            <Layout size={20} />
            Dashboard
          </div>
          <div 
            className={`nav-item ${view === 'notes' ? 'active' : ''}`}
            onClick={() => { setView('notes'); setSelectedNoteRef(null); }}
          >
            <FileText size={20} />
            Notes
          </div>
          <div 
            className={`nav-item ${view === 'graph' ? 'active' : ''}`}
            onClick={() => setView('graph')}
          >
            <Activity size={20} />
            Graph View
          </div>
          <div 
            className={`nav-item ${view === 'tags' ? 'active' : ''}`}
            onClick={() => setView('tags')}
          >
            <Hash size={20} />
            Tags
          </div>
          <div 
            className={`nav-item ${view === 'settings' ? 'active' : ''}`}
            onClick={() => setView('settings')}
          >
            <Settings size={20} />
            Plugins
          </div>
        </nav>

        <div style={{ marginTop: 'auto' }} className="nav-links">
          <div className="nav-item" onClick={openDailyNote}>
            <CalendarDays size={20} />
            Note du Jour
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
              {view === 'dashboard' ? 'Bonjour !' : view === 'graph' ? 'Mind Palace' : view === 'tags' ? 'Tags Explorer' : view === 'settings' ? 'Paramètres & Plugins' : 'Notes'}
            </h1>
            <p style={{ color: 'var(--text-dim)' }}>
              {view === 'dashboard' ? "Voici l'état actuel de ton second cerveau." : view === 'graph' ? "Visualise les connexions entre tes idées." : view === 'tags' ? "Explore tes notes par thématiques." : view === 'settings' ? "Configure tes outils avancés." : "Gère tes connaissances."}
            </p>
          </div>
          <div style={{ position: 'relative' }}>
            <Search 
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', cursor: 'pointer' }} 
              size={18} 
              onClick={() => setSearchOpen(true)}
            />
            <input 
              type="text" 
              placeholder="Rechercher (Ctrl+F)..." 
              value={searchQuery}
              onFocus={() => setSearchOpen(true)}
              onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
              style={{ 
                background: 'var(--card-bg)', 
                border: searchOpen ? '1px solid var(--accent-primary)' : '1px solid var(--glass-border)',
                padding: '0.8rem 1rem 0.8rem 2.5rem',
                borderRadius: '12px',
                color: 'white',
                width: '300px',
                transition: 'all 0.3s'
              }}
            />
            {searchOpen && searchQuery && (
              <X 
                size={16} 
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)', cursor: 'pointer' }}
                onClick={() => { setSearchQuery(''); setSearchResults([]); setSearchOpen(false); }}
              />
            )}

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchOpen && searchQuery.length >= 2 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'rgba(20, 20, 20, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    maxHeight: '400px',
                    overflowY: 'auto',
                    zIndex: 100,
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  {isSearching ? (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)' }}>Recherche...</div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map(result => (
                      <div 
                        key={result.path}
                        onClick={() => navigateToNote(result)}
                        style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--glass-border)', cursor: 'pointer', transition: 'background 0.2s' }}
                        className="search-result-item"
                      >
                        <div style={{ fontWeight: 600, marginBottom: '0.3rem' }}>{result.name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', lineHeight: 1.4 }}>
                          {highlightSnippet(result.snippet)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-dim)' }}>Aucun résultat pour "{searchQuery}"</div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        {view === 'dashboard' && (
          <>
            <section className="stats-grid">
              <StatCard icon={<FileText color="var(--accent-primary)" />} label="Notes Totales" value={stats.totalNotes} delay={0.1} />
              <StatCard icon={<LinkIcon color="#ff0080" />} label="Connexions" value={stats.totalLinks} delay={0.2} />
              <StatCard icon={<Hash color="#00ff88" />} label="Tags" value={stats.totalTags} delay={0.3} />
            </section>

            <section>
              <div className="section-title">
                <Clock size={20} />
                <h2>Notes Récemment Modifiées</h2>
              </div>
              <div className="files-grid">
                {loading ? (
                  <p>Chargement...</p>
                ) : recentNotes.length > 0 ? (
                  recentNotes.map((note, index) => (
                    <FileCard key={note.path} note={note} index={index} onClick={() => navigateToNote(note)} />
                  ))
                ) : (
                  <div style={{ gridColumn: '1/-1', padding: '3rem', textAlign: 'center', background: 'var(--card-bg)', borderRadius: '20px', border: '1px dashed var(--glass-border)' }}>
                    <p style={{ color: 'var(--text-dim)' }}>Aucune note trouvée dans ton dossier Obsidian.</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {view === 'graph' && <GraphView onNodeClick={navigateToNote} />}
        {view === 'notes' && <NoteEditor initialNote={selectedNoteRef} plugins={plugins} />}
        {view === 'tags' && <TagsView onNoteClick={navigateToNote} />}
        {view === 'settings' && <SettingsView plugins={plugins} setPlugins={setPlugins} theme={theme} setTheme={setTheme} />}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="stat-card">
      <div style={{ marginBottom: '1rem' }}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
    </motion.div>
  );
}

function FileCard({ note, index, onClick }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.05 }} className="file-card" onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="file-name">{note.name}</div>
        <ChevronRight size={16} color="var(--text-dim)" />
      </div>
      <div className="file-meta">Modifié le {new Date(note.mtime).toLocaleDateString()}</div>
    </motion.div>
  );
}

export default App;
