// API Configuration
const API_URL = 'http://localhost:5000/api';

// Check if user is logged in
function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}

// Get current user
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Check user role
function hasRole(role) {
    const user = getCurrentUser();
    return user && user.role === role;
}

// Redirect if not logged in
function requireAuth() {
    if (!isLoggedIn()) {
        window.location.href = '/pages/auth/login.html';
        return false;
    }
    return true;
}

// Redirect if not admin
function requireAdmin() {
    if (!isLoggedIn()) {
        window.location.href = '/pages/auth/login.html';
        return false;
    }
    
    const user = getCurrentUser();
    if (user.role !== 'admin') {
        if (user.role === 'professional') {
            window.location.href = '/pages/professional/dashboard.html';
        } else {
            window.location.href = '/index.html';
        }
        return false;
    }
    return true;
}

// Redirect if not professional
function requireProfessional() {
    if (!isLoggedIn()) {
        window.location.href = '/pages/auth/login.html';
        return false;
    }
    
    const user = getCurrentUser();
    if (user.role !== 'professional') {
        if (user.role === 'admin') {
            window.location.href = '/pages/admin/dashboard.html';
        } else {
            window.location.href = '/index.html';
        }
        return false;
    }
    return true;
}

// Update navigation based on login status
function updateNavigation() {
    const authButtons = document.getElementById('authButtons');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');
    const adminLink = document.getElementById('adminLink');
    const professionalLink = document.getElementById('professionalLink');
    
    if (isLoggedIn()) {
        const user = getCurrentUser();
        
        if (authButtons) authButtons.classList.add('hidden');
        if (userMenu) userMenu.classList.remove('hidden');
        if (userName) userName.textContent = user.name.split(' ')[0];
        
        // Show role-specific links
        if (user.role === 'admin' && adminLink) {
            adminLink.classList.remove('hidden');
        }
        if (user.role === 'professional' && professionalLink) {
            professionalLink.classList.remove('hidden');
        }
    } else {
        if (authButtons) authButtons.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
        if (adminLink) adminLink.classList.add('hidden');
        if (professionalLink) professionalLink.classList.add('hidden');
    }
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/index.html';
}

// Update cart count
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    const cartCounts = document.querySelectorAll('.cart-count');
    cartCounts.forEach(el => {
        el.textContent = count;
    });
}

// Add to cart
function addToCart(product) {
    if (!isLoggedIn()) {
        if (confirm('Please login to add items to cart')) {
            window.location.href = '/pages/auth/login.html';
        }
        return;
    }
    
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Product added to cart!');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateNavigation();
    updateCartCount();
});