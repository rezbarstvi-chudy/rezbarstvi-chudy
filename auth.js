// Jednoduché přihlášení - pouze heslo
const ADMIN_USERNAME = 'rezbarstvi-chudy';
const ADMIN_PASSWORD = 'chudy2024'; // ZMĚŇ NA SVÉ HESLO!

function loginWithPassword() {
    const username = prompt('Uživatelské jméno:');
    if (!username) return;
    
    const password = prompt('Heslo:');
    if (!password) return;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('admin_user', JSON.stringify({
            username: username,
            loginTime: new Date()
        }));
        location.reload();
    } else {
        alert('❌ Špatné přihlašovací údaje!');
    }
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem('admin_user'));
}

function isAuthenticated() {
    return getCurrentUser() !== null;
}

function logout() {
    localStorage.removeItem('admin_user');
    location.reload();
}

function updateAuthUI() {
    const authContainer = document.getElementById('auth-container');
    
    if (isAuthenticated()) {
        const user = getCurrentUser();
        authContainer.innerHTML = `
            <div class="user-info">
                <span>👤 ${user.username}</span>
                <button onclick="logout()" class="logout-btn">Odhlásit se</button>
            </div>
        `;
        document.getElementById('add-work-form').style.display = 'block';
    } else {
        authContainer.innerHTML = `
            <button onclick="loginWithPassword()" class="login-btn">🔐 Přihlásit se</button>
        `;
        document.getElementById('add-work-form').style.display = 'none';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', updateAuthUI);
