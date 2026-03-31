const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const JWT_SECRET = 'votre-secret-key-tres-securisee-changez-la-en-prod';
const DB_PATH = path.join(__dirname, '../database.sqlite');

class DatabaseManager {
    constructor() {
        this.db = new Database(DB_PATH);
        this.initTables();
        this.createAdminIfNotExists();
    }

    initTables() {
        // Table utilisateurs
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                name TEXT NOT NULL,
                isAdmin INTEGER DEFAULT 0,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Table messages
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
    }

    createAdminIfNotExists() {
        const adminEmail = 'admin@example.com';
        const existingAdmin = this.db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
        
        if (!existingAdmin) {
            const hashedPassword = bcrypt.hashSync('admin123', 10);
            this.db.prepare(`
                INSERT INTO users (email, password, name, isAdmin)
                VALUES (?, ?, ?, 1)
            `).run(adminEmail, hashedPassword, 'Administrateur');
            console.log('Compte admin créé: admin@example.com / admin123');
        }
    }

    createUser(email, password, name) {
        const existingUser = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (existingUser) {
            return null;
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const result = this.db.prepare(`
            INSERT INTO users (email, password, name)
            VALUES (?, ?, ?)
        `).run(email, hashedPassword, name);

        return { id: result.lastInsertRowid, email, name, isAdmin: 0 };
    }

    authenticateUser(email, password) {
        const user = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        if (!user) {
            return null;
        }

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) {
            return null;
        }

        return { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin === 1 };
    }

    generateToken(userId) {
        return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    }

    getUserByToken(token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = this.db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.userId);
            if (!user) {
                return null;
            }
            return { id: user.id, email: user.email, name: user.name, isAdmin: user.isAdmin === 1 };
        } catch (error) {
            return null;
        }
    }

    createMessage(name, email, message) {
        this.db.prepare(`
            INSERT INTO messages (name, email, message)
            VALUES (?, ?, ?)
        `).run(name, email, message);
    }

    getAllMessages() {
        return this.db.prepare('SELECT * FROM messages ORDER BY createdAt DESC').all();
    }

    getAllUsers() {
        return this.db.prepare('SELECT id, email, name, isAdmin, createdAt FROM users ORDER BY createdAt DESC').all();
    }
}

module.exports = DatabaseManager;
