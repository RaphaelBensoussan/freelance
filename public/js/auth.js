// Variables globales
let currentUser = null;

// Éléments DOM
const loginScreen = document.getElementById('login-screen');
const mainSite = document.getElementById('main-site');
const accountModal = document.getElementById('account-modal');
const adminPanel = document.getElementById('admin-panel');
const btnOpenLogin = document.getElementById('btn-open-login');
const btnAccount = document.getElementById('btn-account');
const btnLogout = document.getElementById('btn-logout');
const btnCloseAdmin = document.getElementById('btn-close-admin');
const userNameSpan = document.getElementById('user-name');
const modalClose = document.querySelector('.modal-close');
const loginFormContainer = document.getElementById('login-form-container');
const registerFormContainer = document.getElementById('register-form-container');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const contactForm = document.getElementById('contact-form');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Vérifier l'état d'authentification au chargement
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

// Vérifier si l'utilisateur est connecté
async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    
    if (!token) {
        showLoginScreen();
        return;
    }
    
    try {
        const response = await fetch('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            currentUser = data.user;
            showMainSite();
        } else {
            localStorage.removeItem('token');
            showLoginScreen();
        }
    } catch (error) {
        console.error('Erreur vérification auth:', error);
        showLoginScreen();
    }
}

// Afficher l'écran de connexion
function showLoginScreen() {
    loginScreen.classList.remove('hidden');
    mainSite.classList.add('hidden');
}

// Afficher le site principal
function showMainSite() {
    loginScreen.classList.add('hidden');
    mainSite.classList.remove('hidden');
    updateUIForLoggedInUser();
}

// Mettre à jour l'interface pour un utilisateur connecté
function updateUIForLoggedInUser() {
    if (currentUser) {
        userNameSpan.textContent = currentUser.name;
        btnLogout.classList.remove('hidden');
        
        // Afficher le bouton admin seulement si admin
        if (currentUser.isAdmin) {
            // Le bouton compte permet d'accéder au panel admin
        }
    }
}

// Ouvrir le modal de compte
btnAccount.addEventListener('click', () => {
    if (currentUser && currentUser.isAdmin) {
        // Si admin, ouvrir le panneau admin
        openAdminPanel();
    } else {
        // Sinon, ouvrir le modal de compte (déconnexion)
        accountModal.classList.remove('hidden');
        loginFormContainer.classList.remove('hidden');
        registerFormContainer.classList.add('hidden');
    }
});

// Fermer le modal
modalClose.addEventListener('click', () => {
    accountModal.classList.add('hidden');
});

// Fermer le modal en cliquant dehors
window.addEventListener('click', (e) => {
    if (e.target === accountModal) {
        accountModal.classList.add('hidden');
    }
    if (e.target === adminPanel) {
        adminPanel.classList.add('hidden');
    }
});

// Basculer entre connexion et inscription
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormContainer.classList.add('hidden');
    registerFormContainer.classList.remove('hidden');
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerFormContainer.classList.add('hidden');
    loginFormContainer.classList.remove('hidden');
});

// Gestion du formulaire de connexion
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            accountModal.classList.add('hidden');
            showMainSite();
            loginForm.reset();
        } else {
            alert(data.error || 'Erreur de connexion');
        }
    } catch (error) {
        console.error('Erreur login:', error);
        alert('Erreur de connexion');
    }
});

// Gestion du formulaire d'inscription
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            localStorage.setItem('token', data.token);
            currentUser = data.user;
            accountModal.classList.add('hidden');
            showMainSite();
            registerForm.reset();
        } else {
            alert(data.error || 'Erreur d\'inscription');
        }
    } catch (error) {
        console.error('Erreur register:', error);
        alert('Erreur d\'inscription');
    }
});

// Déconnexion
btnLogout.addEventListener('click', () => {
    localStorage.removeItem('token');
    currentUser = null;
    showLoginScreen();
});

// Gestion du formulaire de contact
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('contact-name').value;
    const email = document.getElementById('contact-email').value;
    const message = document.getElementById('contact-message').value;
    
    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, message })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Message envoyé avec succès !');
            contactForm.reset();
        } else {
            alert(data.error || 'Erreur lors de l\'envoi');
        }
    } catch (error) {
        console.error('Erreur contact:', error);
        alert('Erreur lors de l\'envoi');
    }
});

// Ouvrir le panneau admin
function openAdminPanel() {
    adminPanel.classList.remove('hidden');
    loadMessages();
    loadUsers();
}

// Fermer le panneau admin
btnCloseAdmin.addEventListener('click', () => {
    adminPanel.classList.add('hidden');
});

// Gestion des tabs admin
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;
        
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
        
        if (tabName === 'messages') {
            loadMessages();
        } else if (tabName === 'users') {
            loadUsers();
        }
    });
});

// Charger les messages
async function loadMessages() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/messages', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const messagesList = document.getElementById('messages-list');
            
            if (data.messages.length === 0) {
                messagesList.innerHTML = '<p>Aucun message</p>';
            } else {
                messagesList.innerHTML = data.messages.map(msg => `
                    <div class="message-item">
                        <h4>${msg.name} - ${msg.email}</h4>
                        <p>${msg.message}</p>
                        <small>${new Date(msg.createdAt).toLocaleString('fr-FR')}</small>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Erreur chargement messages:', error);
    }
}

// Charger les utilisateurs
async function loadUsers() {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            const usersList = document.getElementById('users-list');
            
            if (data.users.length === 0) {
                usersList.innerHTML = '<p>Aucun utilisateur</p>';
            } else {
                usersList.innerHTML = data.users.map(user => `
                    <div class="user-item">
                        <h4>${user.name} ${user.isAdmin ? '(Admin)' : ''}</h4>
                        <p>${user.email}</p>
                        <small>Inscrit le ${new Date(user.createdAt).toLocaleString('fr-FR')}</small>
                    </div>
                `).join('');
            }
        }
    } catch (error) {
        console.error('Erreur chargement utilisateurs:', error);
    }
}

console.log('Application chargée avec succès !');
