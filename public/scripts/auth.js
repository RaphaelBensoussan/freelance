// ==========================================
// GESTION DE L'AUTHENTIFICATION
// ==========================================

const API_URL = ''; // Même domaine que le site

let currentUser = null;

// Éléments du DOM
const authModal = document.getElementById('auth-modal');
const authBtn = document.getElementById('auth-btn');
const authClose = document.getElementById('auth-close');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const userProfile = document.getElementById('user-profile');
const adminModal = document.getElementById('admin-modal');
const adminClose = document.getElementById('admin-close');
const adminPanelBtn = document.getElementById('admin-panel-btn');
const mainContent = document.querySelector('.main-content') || document.body;

// Liens pour basculer entre connexion et inscription
const showRegister = document.getElementById('show-register');
const showLogin = document.getElementById('show-login');

// Formulaires
const loginFormElement = document.getElementById('login-form-element');
const registerFormElement = document.getElementById('register-form-element');

// Bouton logout
const logoutBtn = document.getElementById('logout-btn');

// ==========================================
// INITIALISATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
  checkAuthStatus();
  setupEventListeners();
});

function setupEventListeners() {
  // Ouverture/fermeture modal auth
  if (authBtn) {
    authBtn.addEventListener('click', openAuthModal);
  }
  
  if (authClose) {
    authClose.addEventListener('click', closeAuthModal);
  }
  
  // Fermer en cliquant en dehors
  if (authModal) {
    authModal.addEventListener('click', function(e) {
      if (e.target === authModal) {
        closeAuthModal();
      }
    });
  }
  
  // Basculer entre connexion et inscription
  if (showRegister) {
    showRegister.addEventListener('click', function(e) {
      e.preventDefault();
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
      userProfile.classList.add('hidden');
    });
  }
  
  if (showLogin) {
    showLogin.addEventListener('click', function(e) {
      e.preventDefault();
      registerForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
      userProfile.classList.add('hidden');
    });
  }
  
  // Soumission formulaire de connexion
  if (loginFormElement) {
    loginFormElement.addEventListener('submit', handleLogin);
  }
  
  // Soumission formulaire d'inscription
  if (registerFormElement) {
    registerFormElement.addEventListener('submit', handleRegister);
  }
  
  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', handleLogout);
  }
  
  // Panel admin
  if (adminPanelBtn) {
    adminPanelBtn.addEventListener('click', openAdminPanel);
  }
  
  if (adminClose) {
    adminClose.addEventListener('click', closeAdminPanel);
  }
  
  // Onglets admin
  const adminTabs = document.querySelectorAll('.admin-tab');
  adminTabs.forEach(tab => {
    tab.addEventListener('click', function() {
      const tabName = this.getAttribute('data-tab');
      switchAdminTab(tabName);
    });
  });
}

// ==========================================
// GESTION DE L'AUTHENTIFICATION
// ==========================================

function checkAuthStatus() {
  const token = localStorage.getItem('authToken');
  const user = localStorage.getItem('currentUser');
  
  if (token && user) {
    currentUser = JSON.parse(user);
    updateUIForLoggedInUser();
  } else {
    updateUIForLoggedOutUser();
  }
}

async function handleLogin(e) {
  e.preventDefault();
  
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Stocker le token et les infos utilisateur
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      currentUser = data.user;
      
      // Afficher notification de succès
      showNotification('Connexion réussie ! Bienvenue ' + data.user.prenom, 'success');
      
      // Mettre à jour l'UI
      updateUIForLoggedInUser();
      closeAuthModal();
      
      // Réinitialiser le formulaire
      loginFormElement.reset();
    } else {
      showNotification(data.error || 'Erreur de connexion', 'error');
    }
  } catch (error) {
    console.error('Erreur login:', error);
    showNotification('Erreur de connexion au serveur', 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  
  const nom = document.getElementById('register-nom').value;
  const prenom = document.getElementById('register-prenom').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ nom, prenom, email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      // Stocker le token et les infos utilisateur
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('currentUser', JSON.stringify(data.user));
      currentUser = data.user;
      
      // Afficher notification de succès
      showNotification('Inscription réussie ! Bienvenue ' + data.user.prenom, 'success');
      
      // Mettre à jour l'UI
      updateUIForLoggedInUser();
      closeAuthModal();
      
      // Réinitialiser le formulaire
      registerFormElement.reset();
    } else {
      showNotification(data.error || 'Erreur lors de l\'inscription', 'error');
    }
  } catch (error) {
    console.error('Erreur inscription:', error);
    showNotification('Erreur de connexion au serveur', 'error');
  }
}

function handleLogout() {
  // Supprimer le token et les infos utilisateur
  localStorage.removeItem('authToken');
  localStorage.removeItem('currentUser');
  currentUser = null;
  
  // Mettre à jour l'UI
  updateUIForLoggedOutUser();
  
  // Afficher notification
  showNotification('Déconnexion réussie', 'info');
  
  // Fermer le modal
  closeAuthModal();
}

// ==========================================
// MISE À JOUR DE L'INTERFACE
// ==========================================

function updateUIForLoggedInUser() {
  if (!currentUser) return;
  
  // Afficher le contenu principal
  mainContent.style.display = 'block';
  
  // Mettre à jour le bouton d'authentification
  if (authBtn) {
    authBtn.innerHTML = `<i class="fas fa-user-circle"></i> ${currentUser.prenom}`;
  }
  
  // Afficher le profil utilisateur
  loginForm.classList.add('hidden');
  registerForm.classList.add('hidden');
  userProfile.classList.remove('hidden');
  
  // Remplir les informations du profil
  document.getElementById('profile-nom').textContent = currentUser.nom;
  document.getElementById('profile-prenom').textContent = currentUser.prenom;
  document.getElementById('profile-email').textContent = currentUser.email;
  document.getElementById('profile-role').textContent = currentUser.role === 'admin' ? 'Administrateur' : 'Utilisateur';
  
  // Afficher le bouton panel admin si l'utilisateur est admin
  if (currentUser.role === 'admin') {
    adminPanelBtn.classList.remove('hidden');
  } else {
    adminPanelBtn.classList.add('hidden');
  }
}

function updateUIForLoggedOutUser() {
  // Cacher le contenu principal
  mainContent.style.display = 'none';
  
  // Réinitialiser le bouton d'authentification
  if (authBtn) {
    authBtn.innerHTML = '<i class="fas fa-user"></i> Compte';
  }
  
  // Afficher le formulaire de connexion par défaut
  loginForm.classList.remove('hidden');
  registerForm.classList.add('hidden');
  userProfile.classList.add('hidden');
  
  // Cacher le bouton panel admin
  if (adminPanelBtn) {
    adminPanelBtn.classList.add('hidden');
  }
  
  // Ouvrir automatiquement le modal de connexion
  openAuthModal();
}

// ==========================================
// GESTION DES MODALS
// ==========================================

function openAuthModal() {
  if (authModal) {
    authModal.style.display = 'flex';
    setTimeout(() => {
      authModal.classList.add('active');
    }, 10);
    
    // Si déjà connecté, afficher le profil
    if (currentUser) {
      updateUIForLoggedInUser();
    } else {
      updateUIForLoggedOutUser();
    }
  }
}

function closeAuthModal() {
  if (authModal) {
    authModal.classList.remove('active');
    setTimeout(() => {
      authModal.style.display = 'none';
    }, 300);
  }
}

function openAdminPanel() {
  if (adminModal) {
    adminModal.style.display = 'flex';
    setTimeout(() => {
      adminModal.classList.add('active');
    }, 10);
    
    // Charger les messages
    loadMessages();
  }
}

function closeAdminPanel() {
  if (adminModal) {
    adminModal.classList.remove('active');
    setTimeout(() => {
      adminModal.style.display = 'none';
    }, 300);
  }
}

function switchAdminTab(tabName) {
  const tabs = document.querySelectorAll('.admin-tab');
  const contents = document.querySelectorAll('.admin-content');
  
  tabs.forEach(tab => tab.classList.remove('active'));
  contents.forEach(content => content.classList.add('hidden'));
  
  // Activer l'onglet sélectionné
  const activeTab = document.querySelector(`.admin-tab[data-tab="${tabName}"]`);
  if (activeTab) {
    activeTab.classList.add('active');
  }
  
  // Afficher le contenu correspondant
  const activeContent = document.getElementById(`admin-${tabName}`);
  if (activeContent) {
    activeContent.classList.remove('hidden');
    
    // Charger les données si nécessaire
    if (tabName === 'messages') {
      loadMessages();
    } else if (tabName === 'users') {
      loadUsers();
    }
  }
}

// ==========================================
// CHARGEMENT DES DONNÉES ADMIN
// ==========================================

async function loadMessages() {
  const token = localStorage.getItem('authToken');
  const messagesList = document.getElementById('messages-list');
  
  if (!token) {
    messagesList.innerHTML = '<p class="error">Non authentifié</p>';
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/messages`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.messages.length > 0) {
      messagesList.innerHTML = data.messages.map(msg => `
        <div class="message-item" data-id="${msg.id}">
          <div class="message-header">
            <span class="message-name">${escapeHtml(msg.nom)}</span>
            <span class="message-email">${escapeHtml(msg.email)}</span>
            <span class="message-date">${new Date(msg.created_at).toLocaleDateString('fr-FR')}</span>
            <span class="message-status status-${msg.status}">${msg.status}</span>
          </div>
          <div class="message-body">
            <p>${escapeHtml(msg.message)}</p>
          </div>
          <div class="message-actions">
            <button class="btn btn-sm btn-outline" onclick="updateMessageStatus(${msg.id}, 'lu')">Marquer comme lu</button>
            <button class="btn btn-sm btn-outline" onclick="updateMessageStatus(${msg.id}, 'traité')">Marquer comme traité</button>
            <button class="btn btn-sm btn-danger" onclick="deleteMessage(${msg.id})">Supprimer</button>
          </div>
        </div>
      `).join('');
    } else {
      messagesList.innerHTML = '<p>Aucun message trouvé</p>';
    }
  } catch (error) {
    console.error('Erreur chargement messages:', error);
    messagesList.innerHTML = '<p class="error">Erreur de chargement</p>';
  }
}

async function loadUsers() {
  const token = localStorage.getItem('authToken');
  const usersList = document.getElementById('users-list');
  
  if (!token) {
    usersList.innerHTML = '<p class="error">Non authentifié</p>';
    return;
  }
  
  try {
    const response = await fetch(`${API_URL}/api/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.users.length > 0) {
      usersList.innerHTML = data.users.map(user => `
        <div class="user-item">
          <div class="user-info">
            <span class="user-name">${escapeHtml(user.nom)} ${escapeHtml(user.prenom)}</span>
            <span class="user-email">${escapeHtml(user.email)}</span>
            <span class="user-role badge-${user.role}">${user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</span>
          </div>
          <div class="user-date">
            Inscrit le ${new Date(user.created_at).toLocaleDateString('fr-FR')}
          </div>
        </div>
      `).join('');
    } else {
      usersList.innerHTML = '<p>Aucun utilisateur trouvé</p>';
    }
  } catch (error) {
    console.error('Erreur chargement utilisateurs:', error);
    usersList.innerHTML = '<p class="error">Erreur de chargement</p>';
  }
}

async function updateMessageStatus(id, status) {
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`${API_URL}/api/messages/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });
    
    if (response.ok) {
      showNotification('Statut mis à jour', 'success');
      loadMessages(); // Recharger la liste
    } else {
      showNotification('Erreur lors de la mise à jour', 'error');
    }
  } catch (error) {
    console.error('Erreur update status:', error);
    showNotification('Erreur de connexion au serveur', 'error');
  }
}

async function deleteMessage(id) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
    return;
  }
  
  const token = localStorage.getItem('authToken');
  
  try {
    const response = await fetch(`${API_URL}/api/messages/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (response.ok) {
      showNotification('Message supprimé', 'success');
      loadMessages(); // Recharger la liste
    } else {
      showNotification('Erreur lors de la suppression', 'error');
    }
  } catch (error) {
    console.error('Erreur suppression:', error);
    showNotification('Erreur de connexion au serveur', 'error');
  }
}

// ==========================================
// UTILITAIRES
// ==========================================

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Fonction showNotification (déjà définie dans main.js, mais on la redéfinit au cas où)
function showNotification(message, type = 'info') {
  // Vérifier si la fonction existe déjà
  if (typeof window.showNotification === 'function' && window.showNotification !== showNotification) {
    window.showNotification(message, type);
    return;
  }
  
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  const styles = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    padding: '15px 20px',
    borderRadius: '8px',
    color: 'white',
    fontWeight: '500',
    fontSize: '14px',
    zIndex: '9999',
    maxWidth: '400px',
    animation: 'slideInRight 0.3s ease-out',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
  };
  
  Object.assign(notification.style, styles);
  
  const colors = {
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6'
  };
  
  notification.style.backgroundColor = colors[type] || colors.info;
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 10px;">
      <i class="fas fa-${getNotificationIcon(type)}"></i>
      <span>${message}</span>
      <button onclick="this.parentElement.parentElement.remove()" 
              style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; margin-left: 10px;">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }
  }, 5000);
}

function getNotificationIcon(type) {
  const icons = {
    success: 'check-circle',
    error: 'exclamation-triangle',
    warning: 'exclamation-circle',
    info: 'info-circle'
  };
  return icons[type] || icons.info;
}
