document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadCart();
    loadRecommendedProducts();
});

// Load cart items
async function loadCart() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            document.getElementById('emptyCart').classList.remove('hidden');
            return;
        }
        
        const response = await axios.get(`${API_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const cart = response.data;
        
        if (!cart.items || cart.items.length === 0) {
            document.getElementById('emptyCart').classList.remove('hidden');
            document.getElementById('cartItems').innerHTML = '';
        } else {
            document.getElementById('emptyCart').classList.add('hidden');
            displayCartItems(cart.items);
            updateSummary(cart.totalAmount);
        }
    } catch (error) {
        console.error('Error loading cart:', error);
        showError('cartItems', 'Failed to load cart');
    }
}

// Display cart items
function displayCartItems(items) {
    const container = document.getElementById('cartItems');
    
    container.innerHTML = items.map(item => `
        <div class="flex items-center space-x-4 py-4 border-b cart-item-enter" data-product-id="${item.product._id}">
            <img src="${item.product.images?.[0]?.url}" alt="${item.product.name}" 
                 class="w-24 h-24 object-cover rounded">
            
            <div class="flex-1">
                <h3 class="font-semibold">${item.product.name}</h3>
                ${item.variant ? `<p class="text-sm text-gray-600">${item.variant.type}: ${item.variant.value}</p>` : ''}
                <p class="text-rose-600 font-bold">${formatPrice(item.price)}</p>
            </div>
            
            <div class="flex items-center space-x-2">
                <button onclick="updateQuantity('${item.product._id}', ${item.quantity - 1})" 
                        class="w-8 h-8 border rounded hover:bg-rose-50 transition">
                    <i class="fas fa-minus"></i>
                </button>
                <span class="w-8 text-center">${item.quantity}</span>
                <button onclick="updateQuantity('${item.product._id}', ${item.quantity + 1})" 
                        class="w-8 h-8 border rounded hover:bg-rose-50 transition">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
            
            <div class="text-right">
                <p class="font-semibold">${formatPrice(item.price * item.quantity)}</p>
                <button onclick="removeFromCart('${item.product._id}')" 
                        class="text-red-500 hover:text-red-700 text-sm mt-1 transition">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `).join('');
}

// Update quantity
async function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) return;
    
    try {
        const token = localStorage.getItem('token');
        await axios.put(`${API_URL}/cart/update`, 
            { productId, quantity: newQuantity },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        await loadCart();
        updateCartCount();
        showNotification('Cart updated');
    } catch (error) {
        console.error('Error updating quantity:', error);
        showNotification('Failed to update cart', 'error');
    }
}

// Remove from cart
async function removeFromCart(productId) {
    if (!confirm('Are you sure you want to remove this item?')) return;
    
    try {
        const token = localStorage.getItem('token');
        await axios.delete(`${API_URL}/cart/remove/${productId}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        await loadCart();
        updateCartCount();
        showNotification('Item removed from cart');
    } catch (error) {
        console.error('Error removing from cart:', error);
        showNotification('Failed to remove item', 'error');
    }
}

// Update order summary
function updateSummary(subtotal) {
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    document.getElementById('subtotal').textContent = formatPrice(subtotal);
    document.getElementById('tax').textContent = formatPrice(tax);
    document.getElementById('total').textContent = formatPrice(total);
}

// Apply promo code
async function applyPromoCode() {
    const code = document.getElementById('promoCode').value;
    if (!code) {
        showNotification('Please enter a promo code', 'error');
        return;
    }
    
    try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${API_URL}/cart/apply-promo`, 
            { code },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        if (response.data.success) {
            showNotification('Promo code applied!');
            loadCart();
        }
    } catch (error) {
        console.error('Error applying promo:', error);
        showNotification('Invalid promo code', 'error');
    }
}

// Proceed to checkout
function proceedToCheckout() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    window.location.href = 'checkout.html';
}

// Load recommended products
async function loadRecommendedProducts() {
    try {
        const response = await axios.get(`${API_URL}/products/featured?limit=4`);
        const products = response.data.data;
        
        const container = document.getElementById('recommendedProducts');
        container.innerHTML = products.map(product => `
            <div class="bg-white rounded-lg shadow-md overflow-hidden hover-scale">
                <a href="product-detail.html?id=${product._id}">
                    <img src="${product.images?.[0]?.url}" alt="${product.name}" 
                         class="w-full h-32 object-cover">
                </a>
                <div class="p-3">
                    <a href="product-detail.html?id=${product._id}">
                        <h3 class="font-semibold hover:text-rose-600">${product.name}</h3>
                    </a>
                    <p class="text-rose-600 font-bold mt-1">${formatPrice(product.price)}</p>
                    <button onclick="addToCart('${product._id}')" 
                            class="mt-2 w-full bg-rose-600 text-white px-2 py-1 rounded text-sm hover:bg-rose-700 transition">
                        Add to Cart
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading recommended products:', error);
    }
}