const authState = {
  authenticated: false,
  user: null,
};

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || 'Požadavek selhal');
  }

  return data;
}

function ensureLoginModal() {
  if (document.getElementById('login-modal')) return;

  const modal = document.createElement('div');
  modal.id = 'login-modal';
  modal.className = 'login-modal hidden';
  modal.innerHTML = `
    <div class="login-modal-content">
      <h3>🔐 Přihlášení správce</h3>
      <form id="login-form">
        <label for="login-username">Uživatelské jméno:</label>
        <input id="login-username" type="text" autocomplete="username" required>

        <label for="login-password">Heslo:</label>
        <input id="login-password" type="password" autocomplete="current-password" required>

        <div class="login-actions">
          <button type="button" id="login-cancel" class="secondary-btn">Zrušit</button>
          <button type="submit">Přihlásit se</button>
        </div>
      </form>
      <p id="login-error" class="form-error"></p>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById('login-cancel').addEventListener('click', closeLoginModal);
  document.getElementById('login-form').addEventListener('submit', handleLoginSubmit);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeLoginModal();
    }
  });
}

function openLoginModal() {
  ensureLoginModal();
  const modal = document.getElementById('login-modal');
  modal.classList.remove('hidden');
  document.getElementById('login-error').textContent = '';
}

function closeLoginModal() {
  const modal = document.getElementById('login-modal');
  if (!modal) return;

  modal.classList.add('hidden');
  document.getElementById('login-form').reset();
}

async function handleLoginSubmit(event) {
  event.preventDefault();

  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';

  try {
    const result = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    authState.authenticated = true;
    authState.user = result.user;
    closeLoginModal();
    updateAuthUI();
    window.dispatchEvent(new CustomEvent('auth:changed', { detail: authState }));
  } catch (error) {
    errorEl.textContent = error.message;
  }
}

async function checkAuth() {
  try {
    const result = await apiRequest('/api/auth/me', { method: 'GET' });
    authState.authenticated = Boolean(result.authenticated);
    authState.user = result.user;
  } catch (error) {
    authState.authenticated = false;
    authState.user = null;
  }

  updateAuthUI();
  window.dispatchEvent(new CustomEvent('auth:changed', { detail: authState }));
}

async function logout() {
  await apiRequest('/api/auth/logout', { method: 'POST' });
  authState.authenticated = false;
  authState.user = null;
  updateAuthUI();
  window.dispatchEvent(new CustomEvent('auth:changed', { detail: authState }));
}

function updateAuthUI() {
  const authContainer = document.getElementById('auth-container');
  if (!authContainer) return;

  const addWorkForm = document.getElementById('add-work-form');

  if (authState.authenticated && authState.user) {
    authContainer.innerHTML = `
      <div class="user-info">
        <span>👤 ${authState.user.username}</span>
        <button class="logout-btn" id="logout-btn">Odhlásit se</button>
      </div>
    `;

    document.getElementById('logout-btn').addEventListener('click', logout);

    if (addWorkForm) {
      addWorkForm.style.display = 'block';
    }
    return;
  }

  authContainer.innerHTML = '<button class="login-btn" id="login-btn">🔐 Přihlásit se</button>';
  document.getElementById('login-btn').addEventListener('click', openLoginModal);

  if (addWorkForm) {
    addWorkForm.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', checkAuth);
window.updateAuthUI = updateAuthUI;
window.isAuthenticated = () => authState.authenticated;
