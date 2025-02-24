import AOS from 'aos';
import 'aos/dist/aos.css';

// Initialize AOS
AOS.init({
  duration: 800,
  easing: 'ease-out',
  once: true
});

// MongoDB connection and auth handling
let currentUser = null;

// Modal handling
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginBtn = document.getElementById('loginBtn');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const closeButtons = document.querySelectorAll('.close-modal');

// Show modals
loginBtn?.addEventListener('click', () => {
  loginModal.classList.add('active');
});

showRegisterBtn?.addEventListener('click', () => {
  loginModal.classList.remove('active');
  setTimeout(() => {
    registerModal.classList.add('active');
  }, 100);
});

showLoginBtn?.addEventListener('click', () => {
  registerModal.classList.remove('active');
  setTimeout(() => {
    loginModal.classList.add('active');
  }, 100);
});

// Close modals
closeButtons.forEach(button => {
  button.addEventListener('click', () => {
    loginModal.classList.remove('active');
    registerModal.classList.remove('active');
  });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  if (e.target === loginModal || e.target === registerModal) {
    loginModal.classList.remove('active');
    registerModal.classList.remove('active');
  }
});

// Form handling with loading states and feedback
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

function showLoading(form) {
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  button.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Loading...';
}

function hideLoading(form, originalText) {
  const button = form.querySelector('button[type="submit"]');
  button.disabled = false;
  button.innerHTML = originalText;
}

function showFeedback(form, message, isError = false) {
  const feedbackDiv = form.querySelector('.form-feedback');
  feedbackDiv.textContent = message;
  feedbackDiv.className = `form-feedback mt-4 text-center ${isError ? 'text-red-600' : 'text-green-600'}`;
}

loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  showLoading(loginForm);
  
  const formData = new FormData(e.target);
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      showFeedback(loginForm, 'Login successful! Redirecting...');
      setTimeout(() => {
        loginModal.classList.remove('active');
        updateUIForLoggedInUser();
      }, 1500);
    } else {
      const error = await response.json();
      showFeedback(loginForm, error.message || 'Login failed. Please check your credentials.', true);
    }
  } catch (error) {
    showFeedback(loginForm, 'An error occurred during login.', true);
  } finally {
    hideLoading(loginForm, 'Login');
  }
});

registerForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  showLoading(registerForm);
  
  const formData = new FormData(e.target);
  const name = formData.get('name');
  const email = formData.get('email');
  const password = formData.get('password');

  try {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    if (response.ok) {
      const data = await response.json();
      currentUser = data.user;
      showFeedback(registerForm, 'Registration successful! Redirecting...');
      setTimeout(() => {
        registerModal.classList.remove('active');
        updateUIForLoggedInUser();
      }, 1500);
    } else {
      const error = await response.json();
      showFeedback(registerForm, error.message || 'Registration failed. Please try again.', true);
    }
  } catch (error) {
    showFeedback(registerForm, 'An error occurred during registration.', true);
  } finally {
    hideLoading(registerForm, 'Register');
  }
});

function updateUIForLoggedInUser() {
  if (currentUser) {
    loginBtn.innerHTML = `
      Profile
    `;
    // loginBtn.classList.remove('btn-primary');
    // loginBtn.classList.add('flex', 'items-center', 'bg-white', 'text-gray-800', 'hover:bg-gray-50');
  }
}