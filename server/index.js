const express = require('express');
const cors = require('cors');
const fg = require('fast-glob');
const fs = require('fs-extra');
const path = require('path');
const MarkdownIt = require('markdown-it');

const app = express();
const PORT = 3001;
const md = new MarkdownIt();

app.use(cors());
app.use(express.json());

// Path to the Obsidian Vault (Parent of nexus-app)
const VAULT_PATH = path.resolve(__dirname, '../../');

// Filter out nexus-app directory to avoid recursion or showing app files
const IGNORE_DIR = 'nexus-app';

app.get('/api/stats', async (req, res) => {
    try {
        const files = await fg(['**/*.md'], { 
            cwd: VAULT_PATH, 
            ignore: [`${IGNORE_DIR}/**`, '**/node_modules/**', '**/.git/**'] 
        });
        
        let totalLinks = 0;
        let tags = new Set();
        
        for (const file of files) {
            const content = await fs.readFile(path.join(VAULT_PATH, file), 'utf-8');
            // Basic regex for [[links]] and #tags
            const links = content.match(/\[\[.*?\]\]/g) || [];
            const fileTags = content.match(/#\w+/g) || [];
            
            totalLinks += links.length;
            fileTags.forEach(t => tags.add(t));
        }

        res.json({
            totalNotes: files.length,
            totalLinks,
            totalTags: tags.size,
            recentFiles: files.slice(0, 5) // Simplification for now
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/notes', async (req, res) => {
    try {
        const files = await fg(['**/*.md'], { 
            cwd: VAULT_PATH, 
            ignore: [`${IGNORE_DIR}/**`, '**/node_modules/**', '**/.git/**'],
            stats: true
        });

        const notes = files.map(f => ({
            path: f.name,
            name: path.basename(f.name, '.md'),
            mtime: f.stats.mtime
        })).sort((a, b) => b.mtime - a.mtime);

        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/notes/:path', async (req, res) => {
    try {
        const filePath = path.join(VAULT_PATH, req.params.path);
        if (!filePath.startsWith(VAULT_PATH)) {
            return res.status(403).send('Forbidden');
        }
        const content = await fs.readFile(filePath, 'utf-8');
        const html = md.render(content);
        res.json({ content, html });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/graph', async (req, res) => {
    try {
        const files = await fg(['**/*.md'], { 
            cwd: VAULT_PATH, 
            ignore: [`${IGNORE_DIR}/**`, '**/node_modules/**', '**/.git/**'] 
        });

        const nodesMap = new Map();
        const links = [];

        // First pass: create nodes and identify connections
        for (const file of files) {
            const id = path.basename(file, '.md');
            const content = await fs.readFile(path.join(VAULT_PATH, file), 'utf-8');
            nodesMap.set(id, { 
                id, 
                name: id, 
                isEmpty: content.trim().length < 20, // Consider very short notes as empty
                linksCount: 0 
            });
        }

        // Second pass: identify links
        for (const file of files) {
            const source = path.basename(file, '.md');
            const content = await fs.readFile(path.join(VAULT_PATH, file), 'utf-8');
            const matches = content.match(/\[\[(.*?)\]\]/g) || [];
            
            matches.forEach(match => {
                const target = match.replace('[[', '').replace(']]', '').split('|')[0];
                if (nodesMap.has(target)) {
                    links.push({ source, target });
                    // Increment link counts
                    nodesMap.get(source).linksCount++;
                    nodesMap.get(target).linksCount++;
                }
            });
        }

        const nodes = Array.from(nodesMap.values()).map(node => {
            let color = '#00d2ff'; // Default Blue
            const isIsolated = node.linksCount === 0;
            
            if (node.isEmpty && isIsolated) {
                color = '#888888'; // Light Grey
            } else if (node.isEmpty) {
                color = '#ffa500'; // Orange
            } else if (isIsolated) {
                color = '#ff4444'; // Red
            }

            return { ...node, color };
        });

        res.json({ nodes, links });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/notes', async (req, res) => {
    try {
        const { name, content } = req.body;
        const fileName = name.endsWith('.md') ? name : `${name}.md`;
        const filePath = path.join(VAULT_PATH, fileName);
        await fs.writeFile(filePath, content || `# ${name}`);
        res.json({ success: true, path: fileName });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/notes/:path', async (req, res) => {
    try {
        const { content } = req.body;
        const filePath = path.join(VAULT_PATH, req.params.path);
        if (!filePath.startsWith(VAULT_PATH)) {
            return res.status(403).send('Forbidden');
        }
        await fs.writeFile(filePath, content);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/notes/:path', async (req, res) => {
    try {
        const filePath = path.join(VAULT_PATH, req.params.path);
        if (!filePath.startsWith(VAULT_PATH)) {
            return res.status(403).send('Forbidden');
        }
        await fs.remove(filePath);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/tags', async (req, res) => {
    try {
        const files = await fg(['**/*.md'], { 
            cwd: VAULT_PATH, 
            ignore: [`${IGNORE_DIR}/**`, '**/node_modules/**', '**/.git/**'] 
        });
        
        let tagsMap = {};
        
        for (const file of files) {
            const content = await fs.readFile(path.join(VAULT_PATH, file), 'utf-8');
            const fileTags = content.match(/#\w+/g) || [];
            
            fileTags.forEach(tag => {
                if (!tagsMap[tag]) tagsMap[tag] = [];
                tagsMap[tag].push({
                    name: path.basename(file, '.md'),
                    path: file
                });
            });
        }

        res.json(tagsMap);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/search', async (req, res) => {
    try {
        const query = (req.query.q || '').toLowerCase();
        if (!query) return res.json([]);

        const files = await fg(['**/*.md'], { 
            cwd: VAULT_PATH, 
            ignore: [`${IGNORE_DIR}/**`, '**/node_modules/**', '**/.git/**'] 
        });

        const results = [];

        for (const file of files) {
            const content = await fs.readFile(path.join(VAULT_PATH, file), 'utf-8');
            const lowerContent = content.toLowerCase();
            const idx = lowerContent.indexOf(query);

            if (idx !== -1) {
                // Extract a snippet around the match
                const start = Math.max(0, idx - 40);
                const end = Math.min(content.length, idx + query.length + 60);
                const snippet = content.substring(start, end);

                results.push({
                    path: file,
                    name: path.basename(file, '.md'),
                    snippet: (start > 0 ? '...' : '') + snippet + (end < content.length ? '...' : ''),
                    matchIndex: idx
                });
            }
        }

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/backlinks/:name', async (req, res) => {
    try {
        const targetName = req.params.name;
        const files = await fg(['**/*.md'], { 
            cwd: VAULT_PATH, 
            ignore: [`${IGNORE_DIR}/**`, '**/node_modules/**', '**/.git/**'] 
        });

        const backlinks = [];

        for (const file of files) {
            const noteName = path.basename(file, '.md');
            if (noteName === targetName) continue;

            const content = await fs.readFile(path.join(VAULT_PATH, file), 'utf-8');
            const regex = new RegExp(`\\[\\[${targetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\|.*?)?\\]\\]`, 'g');
            const matches = content.match(regex);

            if (matches && matches.length > 0) {
                // Find the line containing the backlink for context
                const lines = content.split('\n');
                const contextLine = lines.find(l => regex.test(l)) || '';
                
                backlinks.push({
                    path: file,
                    name: noteName,
                    context: contextLine.trim(),
                    count: matches.length
                });
            }
        }

        res.json(backlinks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/daily', async (req, res) => {
    try {
        const today = new Date();
        const dateStr = today.toISOString().split('T')[0]; // 2026-05-10
        const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        
        const dayName = dayNames[today.getDay()];
        const monthName = monthNames[today.getMonth()];
        const fileName = `${dateStr}.md`;
        const filePath = path.join(VAULT_PATH, fileName);

        const exists = await fs.pathExists(filePath);

        if (!exists) {
            const template = `# 📅 ${dayName} ${today.getDate()} ${monthName} ${today.getFullYear()}

## 🎯 Objectifs du Jour
- [ ] 

## 📝 Notes
- 

## 💡 Idées
- 

## ✅ Réalisations
- 

---
*Note quotidienne créée automatiquement par Nexus*
`;
            await fs.writeFile(filePath, template);
        }

        const content = await fs.readFile(filePath, 'utf-8');
        res.json({ path: fileName, name: dateStr, content, isNew: !exists });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Obsidian Nexus Server running on http://localhost:${PORT}`);
    console.log(`Watching vault at: ${VAULT_PATH}`);
});
