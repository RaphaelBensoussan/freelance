const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'votre-secret-jwt-tres-securise';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialisation de la base de données SQLite
const db = new Database('./database.sqlite');
console.log('Connecté à la base de données SQLite');
initDatabase();

// Initialisation des tables
function initDatabase() {
  db.exec(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    nom TEXT NOT NULL,
    prenom TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  console.log('Table users prête');

  db.exec(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT,
    entreprise TEXT,
    budget TEXT,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'nouveau',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
  console.log('Table messages prête');

  const defaultAdminEmail = 'admin@example.com';
  const defaultAdminPassword = bcrypt.hashSync('admin123', 10);
  
  const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(defaultAdminEmail);
  if (!existingAdmin) {
    db.prepare('INSERT INTO users (email, password, nom, prenom, role) VALUES (?, ?, ?, ?, ?)').run(
      defaultAdminEmail, defaultAdminPassword, 'Admin', 'Principal', 'admin'
    );
    console.log('Admin créé: admin@example.com / admin123');
  }
}

// Middleware d'authentification
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requis' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.user = user;
    next();
  });
}

function isAdmin(req, res, next) {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès réservé aux admins' });
  next();
}

// Inscription
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, nom, prenom } = req.body;
    if (!email || !password || !nom || !prenom) return res.status(400).json({ error: 'Tous les champs sont requis' });
    if (password.length < 6) return res.status(400).json({ error: 'Mot de passe trop court' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (email, password, nom, prenom) VALUES (?, ?, ?, ?)');
    const result = stmt.run(email, hashedPassword, nom, prenom);
    
    const token = jwt.sign({ id: result.lastInsertRowid, email, nom, prenom, role: 'user' }, JWT_SECRET, { expiresIn: '24h' });
    res.status(201).json({ message: 'Inscription réussie', token, user: { id: result.lastInsertRowid, email, nom, prenom, role: 'user' } });
  } catch (error) {
    if (error.message.includes('UNIQUE')) return res.status(400).json({ error: 'Email déjà utilisé' });
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Connexion
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'Identifiants incorrects' });
  
  bcrypt.compare(password, user.password, (err, isMatch) => {
    if (err || !isMatch) return res.status(401).json({ error: 'Identifiants incorrects' });
    const token = jwt.sign({ id: user.id, email: user.email, nom: user.nom, prenom: user.prenom, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Connexion réussie', token, user: { id: user.id, email: user.email, nom: user.nom, prenom: user.prenom, role: user.role } });
  });
});

// Profil utilisateur
app.get('/api/auth/me', authenticateToken, (req, res) => {
  const user = db.prepare('SELECT id, email, nom, prenom, role, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  res.json({ user });
});

// Messages (admin)
app.get('/api/messages', authenticateToken, isAdmin, (req, res) => {
  const messages = db.prepare('SELECT * FROM messages ORDER BY created_at DESC').all();
  res.json({ messages });
});

app.put('/api/messages/:id/status', authenticateToken, isAdmin, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = db.prepare('UPDATE messages SET status = ? WHERE id = ?').run(status, id);
  if (result.changes === 0) return res.status(404).json({ error: 'Message non trouvé' });
  res.json({ message: 'Statut mis à jour' });
});

app.delete('/api/messages/:id', authenticateToken, isAdmin, (req, res) => {
  const result = db.prepare('DELETE FROM messages WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Message non trouvé' });
  res.json({ message: 'Message supprimé' });
});

// Utilisateurs (admin)
app.get('/api/users', authenticateToken, isAdmin, (req, res) => {
  const users = db.prepare('SELECT id, email, nom, prenom, role, created_at FROM users ORDER BY created_at DESC').all();
  res.json({ users });
});

// Contact (public)
app.post('/api/contact', (req, res) => {
  const { nom, email, telephone, entreprise, budget, message } = req.body;
  if (!nom || !email || !message) return res.status(400).json({ error: 'Champs requis manquants' });
  const result = db.prepare('INSERT INTO messages (nom, email, telephone, entreprise, budget, message) VALUES (?, ?, ?, ?, ?, ?)').run(nom, email, telephone || null, entreprise || null, budget || null, message);
  res.status(201).json({ message: 'Message envoyé avec succès', id: result.lastInsertRowid });
});

app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
