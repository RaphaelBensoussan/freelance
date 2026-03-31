# Portfolio Freelance - Système d'Authentification

## 📋 Description

Ce projet est un site vitrine pour freelance avec un système d'authentification complet et une base de données. L'accès au site est protégé : les utilisateurs doivent se connecter ou s'inscrire pour pouvoir consulter le contenu.

## ✨ Fonctionnalités

### 🔐 Authentification
- **Inscription** : Création de compte utilisateur avec email et mot de passe sécurisé (haché avec bcryptjs)
- **Connexion** : Authentification via JWT (JSON Web Token)
- **Session persistante** : Maintien de la connexion lors de la navigation
- **Déconnexion** : Bouton de déconnexion disponible dans le menu "Compte"

### 👥 Gestion des Utilisateurs
- **Rôles** : Système de rôles (user/admin)
- **Compte Admin par défaut** :
  - Email : `admin@example.com`
  - Mot de passe : `admin123`
- **Panneau d'administration** : Réservé aux administrateurs

### 💾 Base de Données (SQLite)
- **Table `users`** : Stocke les utilisateurs (id, email, password_hash, role, created_at)
- **Table `messages`** : Stocke les messages du formulaire de contact (id, name, email, message, created_at)

### 📬 Formulaire de Contact
- Envoi de messages enregistrés en base de données
- Consultation des messages reçus dans le panneau admin

### 🛡️ Sécurité
- Protection des routes API (middleware d'authentification)
- Hachage des mots de passe avec bcryptjs
- Tokens JWT pour l'authentification
- Protection contre les accès non autorisés

## 🚀 Installation

### Prérequis
- Node.js (version 14 ou supérieure)
- npm (inclus avec Node.js)

### Étapes d'installation

1. **Cloner le dépôt**
```bash
git clone https://github.com/RaphaelBensoussan/freelance.git
cd freelance
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Lancer le serveur**
```bash
node server/server.js
```

4. **Accéder à l'application**
Ouvrez votre navigateur et allez sur : http://localhost:3000

## 📖 Guide d'utilisation

### Premier accès
1. À l'ouverture du site, seul le bouton **"Compte"** est visible
2. Cliquez sur **"Compte"** en haut à droite
3. Une modale s'ouvre avec les options "Se connecter" et "S'inscrire"

### Créer un compte
1. Cliquez sur l'onglet **"S'inscrire"**
2. Remplissez le formulaire (email et mot de passe)
3. Validez l'inscription
4. Vous serez automatiquement connecté

### Se connecter
1. Cliquez sur l'onglet **"Se connecter"**
2. Entrez vos identifiants
3. Cliquez sur "Connexion"
4. Le site s'affiche avec tout son contenu

### Accéder au Panneau Admin (réservé aux administrateurs)
1. Connectez-vous avec le compte admin :
   - Email : `admin@example.com`
   - Mot de passe : `admin123`
2. Cliquez sur **"Compte"** en haut à droite
3. Cliquez sur **"Panneau Admin"**
4. Consultez :
   - La liste des utilisateurs inscrits
   - Les messages reçus via le formulaire de contact

### Envoyer un message de contact
1. Une fois connecté, naviguez vers la section "Contact"
2. Remplissez le formulaire (nom, email, message)
3. Envoyez le message
4. Un administrateur pourra le consulter dans le panneau admin

## 🏗️ Architecture du Projet

### Backend (Node.js/Express)
```
server/
├── server.js          # Serveur principal et routes API
└── database.sqlite    # Base de données SQLite (créée automatiquement)
```

### Frontend
```
public/
├── index.html         # Page principale
├── styles.css         # Feuilles de style
└── scripts/
    ├── main.js        # Logique principale du site
    └── auth.js        # Gestion de l'authentification
```

### Routes API

#### Authentification
- `POST /api/auth/register` - Inscription d'un nouvel utilisateur
- `POST /api/auth/login` - Connexion d'un utilisateur
- `GET /api/auth/me` - Récupération du profil utilisateur connecté

#### Messages
- `POST /api/contact` - Envoi d'un message de contact
- `GET /api/messages` - Récupération de tous les messages (admin uniquement)

#### Utilisateurs
- `GET /api/users` - Récupération de tous les utilisateurs (admin uniquement)

## 📁 Structure des Fichiers

```
freelance/
├── package.json           # Dépendances et scripts npm
├── server/
│   └── server.js          # Code backend (Express + SQLite)
├── public/
│   ├── index.html         # Structure HTML
│   ├── styles.css         # Styles CSS
│   └── scripts/
│       ├── main.js        # Logique frontend
│       └── auth.js        # Authentification frontend
├── database.sqlite        # Base de données (générée automatiquement)
└── README.md              # Ce fichier
```

## 🔧 Commandes Utiles

### Démarrer le serveur
```bash
node server/server.js
```

### Installer les dépendances
```bash
npm install
```

### Vérifier les dépendances installées
```bash
npm list
```

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** : Runtime JavaScript
- **Express** : Framework web
- **better-sqlite3** : Base de données SQLite synchrone
- **bcryptjs** : Hachage des mots de passe
- **jsonwebtoken** : Gestion des tokens JWT
- **cors** : Gestion des requêtes cross-origin
- **express-rate-limit** : Limitation des requêtes API

### Frontend
- **HTML5** : Structure de la page
- **CSS3** : Styles et animations
- **JavaScript (ES6+)** : Logique client
- **Fetch API** : Requêtes HTTP vers le backend

## 🔒 Sécurité

- Les mots de passe sont hachés avec bcryptjs avant stockage
- Les tokens JWT expirent après 24 heures
- Les routes sensibles sont protégées par middleware d'authentification
- Rate limiting sur les routes d'authentification pour prévenir les attaques par force brute

## 📝 Notes Importantes

- La base de données `database.sqlite` est créée automatiquement au premier lancement
- Le compte admin est créé automatiquement s'il n'existe pas
- En production, il faudra :
  - Changer le mot de passe admin par défaut
  - Utiliser HTTPS
  - Stocker les secrets (JWT_SECRET) dans des variables d'environnement
  - Configurer une base de données plus robuste (PostgreSQL, MySQL)

## 🤝 Support

Pour toute question ou problème, ouvrez une issue sur le dépôt GitHub :
https://github.com/RaphaelBensoussan/freelance/issues

## 📄 Licence

Ce projet est propriétaire. Tous droits réservés.

---

**Développé avec ❤️ par Raphael Bensoussan**
