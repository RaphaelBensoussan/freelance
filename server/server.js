const express = require('express');
const path = require('path');
const Database = require('./database');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Initialiser la base de données
const db = new Database();

// Routes API - Authentification
app.post('/api/auth/register', (req, res) => {
    const { email, password, name } = req.body;
    
    if (!email || !password || !name) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    
    try {
        const user = db.createUser(email, password, name);
        if (!user) {
            return res.status(400).json({ error: 'Cet email est déjà utilisé' });
        }
        const token = db.generateToken(user.id);
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin } });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email et mot de passe requis' });
    }
    
    try {
        const user = db.authenticateUser(email, password);
        if (!user) {
            return res.status(401).json({ error: 'Identifiants invalides' });
        }
        const token = db.generateToken(user.id);
        res.json({ token, user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin } });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

app.get('/api/auth/me', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Non autorisé' });
    }
    
    const token = authHeader.split(' ')[1];
    try {
        const user = db.getUserByToken(token);
        if (!user) {
            return res.status(401).json({ error: 'Token invalide' });
        }
        res.json({ user: { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin } });
    } catch (error) {
        res.status(401).json({ error: 'Token invalide' });
    }
});

// Routes API - Messages de contact
app.post('/api/contact', (req, res) => {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Tous les champs sont requis' });
    }
    
    try {
        db.createMessage(name, email, message);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Routes protégées (admin uniquement)
app.get('/api/messages', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Non autorisé' });
    }
    
    const token = authHeader.split(' ')[1];
    try {
        const user = db.getUserByToken(token);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Accès refusé' });
        }
        const messages = db.getAllMessages();
        res.json({ messages });
    } catch (error) {
        res.status(401).json({ error: 'Token invalide' });
    }
});

app.get('/api/users', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Non autorisé' });
    }
    
    const token = authHeader.split(' ')[1];
    try {
        const user = db.getUserByToken(token);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ error: 'Accès refusé' });
        }
        const users = db.getAllUsers();
        res.json({ users });
    } catch (error) {
        res.status(401).json({ error: 'Token invalide' });
    }
});

// Servir le fichier HTML principal pour toutes les autres routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
