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
        navigateTo('pages/auth/login.html');
        return false;
    }
    return true;
}

// Redirect if not admin
function requireAdmin() {
    if (!isLoggedIn()) {
        navigateTo('pages/auth/login.html');
        return false;
    }
    
    const user = getCurrentUser();
    if (user.role !== 'admin') {
        if (user.role === 'professional') {
            navigateTo('pages/professional/dashboard.html');
        } else {
            navigateTo('index.html');
        }
        return false;
    }
    return true;
}

// Redirect if not professional
function requireProfessional() {
    if (!isLoggedIn()) {
        navigateTo('pages/auth/login.html');
        return false;
    }
    
    const user = getCurrentUser();
    if (user.role !== 'professional') {
        if (user.role === 'admin') {
            navigateTo('pages/admin/dashboard.html');
        } else {
            navigateTo('index.html');
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
        const userInitials = document.getElementById('userInitials');
        if (userInitials) {
            userInitials.textContent = user.name.split(' ').map(name => name[0]).join('').slice(0, 2).toUpperCase();
        }
        
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
    navigateTo('index.html');
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

function saveCartItem(product, quantity = 1) {
    if (!product) {
        return;
    }

    const normalizedProduct = {
        id: product.id || product._id || product.slug,
        slug: product.slug,
        name: product.name,
        price: Number(product.price),
        image: product.image || product.images?.[0]?.url || '',
        category: product.category || 'Beauty Product',
        quantity
    };

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === normalizedProduct.id);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push(normalizedProduct);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Add to cart
function addToCart(product, quantity = 1) {
    if (!isLoggedIn()) {
        if (confirm('Please login to add items to cart')) {
            navigateTo('pages/auth/login.html');
        }
        return;
    }

    saveCartItem(product, quantity);
    alert('Product added to cart!');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    if (window.AOS) {
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100
        });
    }
    updateNavigation();
    updateCartCount();
});
