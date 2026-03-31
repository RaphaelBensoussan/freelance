// ==========================================
// VARIABLES GLOBALES ET CONFIGURATION
// ==========================================
const CONFIG = {
  animationDuration: 300,
  scrollOffset: 80,
  testimonialAutoplayDelay: 5000,
  counterAnimationSpeed: 2000
};

let currentTestimonial = 0;
let testimonialInterval;

// ==========================================
// INITIALISATION AU CHARGEMENT DE LA PAGE
// ==========================================
document.addEventListener('DOMContentLoaded', function() {
  // Initialiser AOS (Animate On Scroll)
  AOS.init({
    duration: 800,
    easing: 'ease-in-out',
    once: true,
    offset: 100
  });

  // Initialiser toutes les fonctionnalités
  initNavigation();
  initHeroAnimations();
  initServicesFilter();
  initTestimonialsSlider();
  initContactForm();
  initBackToTop();
  initSmoothScrolling();
  initCounterAnimations();
  initTypingEffect();
  
  // Démarrer les animations automatiques
  startTestimonialAutoplay();
});

// ==========================================
// NAVIGATION
// ==========================================
function initNavigation() {
  const navbar = document.getElementById('navbar');
  const mobileMenu = document.getElementById('mobile-menu');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');

  // Effet de scroll sur la navbar
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Menu mobile toggle
  mobileMenu.addEventListener('click', function() {
    mobileMenu.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Fermer le menu mobile quand on clique sur un lien
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      mobileMenu.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Mise à jour du lien actif en fonction du scroll
  window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  let currentSection = '';
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop - CONFIG.scrollOffset;
    const sectionHeight = section.offsetHeight;
    
    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
      currentSection = section.getAttribute('id');
    }
  });

  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${currentSection}`) {
      link.classList.add('active');
    }
  });
}

// ==========================================
// ANIMATIONS HERO
// ==========================================
function initHeroAnimations() {
  // Animation des cartes flottantes
  const floatingCards = document.querySelectorAll('.floating-card');
  
  floatingCards.forEach((card, index) => {
    // Ajouter des delays différents pour chaque carte
    card.style.animationDelay = `${index * 0.5}s`;
    
    // Effet hover interactif
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-10px) scale(1.1)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });
}

function initTypingEffect() {
  const typingText = document.querySelector('.typing-text');
  if (!typingText) return;

  const texts = ['WordPress & HubSpot', 'Solutions Web', 'CRM & Automation'];
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typeSpeed = 100;
  const deleteSpeed = 50;
  const pauseDelay = 2000;

  function typeText() {
    const currentText = texts[textIndex];
    
    if (isDeleting) {
      typingText.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typingText.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? deleteSpeed : typeSpeed;

    if (!isDeleting && charIndex === currentText.length) {
      delay = pauseDelay;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      delay = 500;
    }

    setTimeout(typeText, delay);
  }

  // Démarrer l'effet de frappe après un délai
  setTimeout(typeText, 1000);
}

// ==========================================
// ANIMATIONS DE COMPTEUR
// ==========================================
function initCounterAnimations() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  
  const observerOptions = {
    threshold: 0.7,
    rootMargin: '0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  counters.forEach(counter => {
    observer.observe(counter);
  });
}

function animateCounter(element) {
  const target = parseInt(element.getAttribute('data-target'));
  const duration = CONFIG.counterAnimationSpeed;
  const increment = target / (duration / 16);
  let current = 0;

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    element.textContent = Math.floor(current);
  }, 16);
}

// (Filtre du portfolio supprimé avec les boutons)

// ==========================================
// FILTRE DES SERVICES PAR CATÉGORIE
// ==========================================
function initServicesFilter() {
  const servicesSection = document.getElementById('services');
  if (!servicesSection) return;

  const filterButtons = servicesSection.querySelectorAll('.filter-btn');
  const serviceCards = servicesSection.querySelectorAll('.service-card');
  if (filterButtons.length === 0 || serviceCards.length === 0) return;

  const flipMode = servicesSection.classList.contains('flip-mode');

  filterButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const filter = this.getAttribute('data-filter');

      // Etat actif sur les boutons
      filterButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      if (flipMode) {
        // En mode flip: on ne masque pas les cartes, on bascule l'état de la section
        if (filter === 'business') {
          servicesSection.classList.add('business-active');
        } else {
          servicesSection.classList.remove('business-active');
        }
        return; // ne pas exécuter l'ancien masquage
      }

      // Afficher/Masquer les cartes
      serviceCards.forEach(card => {
        const category = card.getAttribute('data-category');
        const show = filter === 'all' || category === filter;
        card.style.display = show ? 'block' : 'none';
        if (show) {
          card.style.animation = 'fadeInUp 0.5s ease forwards';
        }
      });
    });
  });

  // Appliquer le filtre initial basé sur le bouton actif (par défaut "web")
  const activeBtn = servicesSection.querySelector('.filter-btn.active') || filterButtons[0];
  if (activeBtn) {
    if (flipMode) {
      // En mode flip, on applique juste la classe une première fois sans animation click
      const initialFilter = activeBtn.getAttribute('data-filter');
      if (initialFilter === 'business') {
        servicesSection.classList.add('business-active');
      } else {
        servicesSection.classList.remove('business-active');
      }
    } else {
      // Déclenche le filtrage initial pour n'afficher que la catégorie active
      activeBtn.click();
    }
  }
}

// ==========================================
// SLIDER TÉMOIGNAGES
// ==========================================
function initTestimonialsSlider() {
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.querySelector('.prev-btn');
  const nextBtn = document.querySelector('.next-btn');

  if (testimonialCards.length === 0) return;

  // Boutons de navigation
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      showTestimonial(currentTestimonial - 1);
      resetAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      showTestimonial(currentTestimonial + 1);
      resetAutoplay();
    });
  }

  // Navigation par points
  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showTestimonial(index);
      resetAutoplay();
    });
  });

  // Gestion du swipe sur mobile
  initTouchSwipe();
}

function showTestimonial(index) {
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const dots = document.querySelectorAll('.dot');

  // Gérer les limites
  if (index >= testimonialCards.length) {
    currentTestimonial = 0;
  } else if (index < 0) {
    currentTestimonial = testimonialCards.length - 1;
  } else {
    currentTestimonial = index;
  }

  // Mettre à jour l'affichage
  testimonialCards.forEach(card => card.classList.remove('active'));
  dots.forEach(dot => dot.classList.remove('active'));

  if (testimonialCards[currentTestimonial]) {
    testimonialCards[currentTestimonial].classList.add('active');
  }
  if (dots[currentTestimonial]) {
    dots[currentTestimonial].classList.add('active');
  }
}

function startTestimonialAutoplay() {
  testimonialInterval = setInterval(() => {
    showTestimonial(currentTestimonial + 1);
  }, CONFIG.testimonialAutoplayDelay);
}

function resetAutoplay() {
  clearInterval(testimonialInterval);
  startTestimonialAutoplay();
}

function initTouchSwipe() {
  const testimonialContainer = document.querySelector('.testimonials-slider');
  if (!testimonialContainer) return;

  let startX = 0;
  let endX = 0;

  testimonialContainer.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
  });

  testimonialContainer.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    handleSwipe();
  });

  function handleSwipe() {
    const threshold = 50;
    const diff = startX - endX;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swipe gauche - témoignage suivant
        showTestimonial(currentTestimonial + 1);
      } else {
        // Swipe droite - témoignage précédent
        showTestimonial(currentTestimonial - 1);
      }
      resetAutoplay();
    }
  }
}

// ==========================================
// FORMULAIRE DE CONTACT
// ==========================================
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  
  if (!contactForm) return;

  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validation des champs
    if (!validateForm(this)) {
      return;
    }

    // État de chargement
    const submitButton = this.querySelector('button[type="submit"]');
    const originalText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Envoi en cours...';
    submitButton.disabled = true;

    try {
      // Récupérer les données du formulaire
      const formData = new FormData(this);
      const data = {
        nom: formData.get('nom'),
        email: formData.get('email'),
        telephone: formData.get('telephone'),
        entreprise: formData.get('entreprise'),
        budget: formData.get('budget'),
        message: formData.get('message')
      };

      // Envoyer au serveur
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        showNotification('Message envoyé avec succès ! Je vous répondrai dans les plus brefs délais.', 'success');
        contactForm.reset();
      } else {
        showNotification(result.error || 'Erreur lors de l\'envoi du message', 'error');
      }
    } catch (error) {
      console.error('Erreur envoi contact:', error);
      showNotification('Erreur de connexion au serveur', 'error');
    } finally {
      // Restaurer le bouton
      submitButton.innerHTML = originalText;
      submitButton.disabled = false;
    }
  });

  // Validation en temps réel
  const requiredFields = contactForm.querySelectorAll('[required]');
  requiredFields.forEach(field => {
    field.addEventListener('blur', function() {
      validateField(this);
    });
    
    field.addEventListener('input', function() {
      if (this.classList.contains('error')) {
        validateField(this);
      }
    });
  });
}

function validateForm(form) {
  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;

  requiredFields.forEach(field => {
    if (!validateField(field)) {
      isValid = false;
    }
  });

  // Validation email
  const emailField = form.querySelector('input[type="email"]');
  if (emailField && !validateEmail(emailField.value)) {
    showFieldError(emailField, 'Veuillez saisir une adresse email valide');
    isValid = false;
  }

  return isValid;
}

function validateField(field) {
  const value = field.value.trim();
  
  if (!value) {
    showFieldError(field, 'Ce champ est obligatoire');
    return false;
  }
  
  clearFieldError(field);
  return true;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function showFieldError(field, message) {
  field.classList.add('error');
  
  // Supprimer l'ancien message d'erreur s'il existe
  let errorElement = field.parentNode.querySelector('.error-message');
  if (errorElement) {
    errorElement.remove();
  }
  
  // Créer le nouveau message d'erreur
  errorElement = document.createElement('span');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  errorElement.style.color = '#EF4444';
  errorElement.style.fontSize = '0.875rem';
  errorElement.style.marginTop = '0.25rem';
  errorElement.style.display = 'block';
  
  field.parentNode.appendChild(errorElement);
}

function clearFieldError(field) {
  field.classList.remove('error');
  const errorElement = field.parentNode.querySelector('.error-message');
  if (errorElement) {
    errorElement.remove();
  }
}

// ==========================================
// NOTIFICATIONS
// ==========================================
function showNotification(message, type = 'info') {
  // Créer l'élément de notification
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

  // Appliquer les styles de base
  Object.assign(notification.style, styles);

  // Couleurs selon le type
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

  // Ajouter au DOM
  document.body.appendChild(notification);

  // Supprimer automatiquement après 5 secondes
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

// ==========================================
// SCROLL FLUIDE
// ==========================================
function initSmoothScrolling() {
  const links = document.querySelectorAll('a[href^="#"]');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const offsetTop = targetElement.offsetTop - CONFIG.scrollOffset;
        
        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ==========================================
// BOUTON RETOUR EN HAUT
// ==========================================
function initBackToTop() {
  const backToTopButton = document.getElementById('back-to-top');
  
  if (!backToTopButton) return;

  // Afficher/masquer le bouton selon la position de scroll
  window.addEventListener('scroll', function() {
    if (window.scrollY > 300) {
      backToTopButton.classList.add('visible');
    } else {
      backToTopButton.classList.remove('visible');
    }
  });

  // Action du clic
  backToTopButton.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

// ==========================================
// OPTIMISATIONS PERFORMANCE
// ==========================================


// (Lazy loading supprimé car non utilisé)

// ==========================================
// GESTION DES ERREURS
// ==========================================
window.addEventListener('error', function(e) {
  console.error('Erreur JavaScript:', e.error);
  
  // En mode développement, afficher l'erreur
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    showNotification('Erreur JavaScript détectée. Voir la console.', 'error');
  }
});

// ==========================================
// ANIMATIONS CSS SUPPLÉMENTAIRES
// ==========================================

// Ajouter les keyframes pour les animations personnalisées
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .form-group input.error,
  .form-group select.error,
  .form-group textarea.error {
    border-color: #EF4444;
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }
`;

document.head.appendChild(style);

// (Tracking Analytics supprimé car aucun élément data-track présent)

// (Préchargement des ressources supprimé: images critiques absentes du projet)

// (Toggle de thème supprimé car aucun #theme-toggle dans le DOM)

console.log('Site vitrine freelance - Scripts chargés avec succès !');
