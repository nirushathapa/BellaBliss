// Khalti configuration
const khaltiConfig = {
    publicKey: 'test_public_key_dc74e0fd57cb46cd93832aee0a390234',
    productIdentity: 'bellabliss_product',
    productName: 'BellaBliss Order',
    productUrl: window.location.origin,
    eventHandler: {
        onSuccess(payload) {
            verifyPayment(payload);
        },
        onError(error) {
            console.error('Khalti error:', error);
            showNotification('Payment failed. Please try again.', 'error');
        },
        onClose() {
            console.log('Khalti widget closed');
        }
    },
    paymentPreference: ["KHALTI", "EBANKING", "MOBILE_BANKING", "CONNECT_IPS", "SCT"]
};

// Load cart for checkout
async function loadCartForCheckout() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        
        const response = await axios.get(`${API_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const cart = response.data;
        
        if (!cart.items || cart.items.length === 0) {
            window.location.href = 'cart.html';
            return;
        }
        
        displayOrderItems(cart.items);
        updateTotals(cart.totalAmount);
        
        // Pre-fill user data
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.name) {
            document.getElementById('fullName').value = user.name;
        }
        if (user.phone) {
            document.getElementById('phone').value = user.phone;
        }
        
    } catch (error) {
        console.error('Error loading cart:', error);
        showError('checkoutForm', 'Failed to load cart');
    }
}

// Display order items
function displayOrderItems(items) {
    const orderItemsHtml = items.map(item => `
        <div class="flex items-center space-x-3">
            <img src="${item.product.images[0]?.url}" alt="${item.product.name}" 
                 class="w-16 h-16 object-cover rounded">
            <div class="flex-1">
                <h3 class="font-semibold">${item.product.name}</h3>
                <p class="text-sm text-gray-600">Qty: ${item.quantity}</p>
                <p class="text-rose-600 font-bold">${formatPrice(item.price * item.quantity)}</p>
            </div>
        </div>
    `).join('');
    
    document.getElementById('orderItems').innerHTML = orderItemsHtml;
    document.getElementById('mobileOrderItems').innerHTML = orderItemsHtml;
}

// Update totals
function updateTotals(total) {
    document.getElementById('subtotal').textContent = formatPrice(total);
    document.getElementById('mobileSubtotal').textContent = formatPrice(total);
    document.getElementById('total').textContent = formatPrice(total);
    document.getElementById('mobileTotal').textContent = formatPrice(total);
}

// Validate checkout form
function validateCheckoutForm() {
    const requiredFields = ['fullName', 'phone', 'street', 'city', 'state', 'zipCode'];
    for (const field of requiredFields) {
        const element = document.getElementById(field);
        if (!element || !element.value.trim()) {
            showNotification(`Please fill in all shipping details`, 'error');
            element?.focus();
            return false;
        }
    }
    return true;
}

// Place order
async function placeOrder() {
    try {
        if (!validateCheckoutForm()) return;
        
        const token = localStorage.getItem('token');
        const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
        
        // Get cart data
        const cartResponse = await axios.get(`${API_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const cart = cartResponse.data;
        
        // Create order
        const orderData = {
            items: cart.items.map(item => ({
                product: item.product._id,
                quantity: item.quantity,
                price: item.price,
                variant: item.variant
            })),
            totalAmount: cart.totalAmount,
            shippingAddress: {
                fullName: document.getElementById('fullName').value,
                street: document.getElementById('street').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                zipCode: document.getElementById('zipCode').value,
                phone: document.getElementById('phone').value
            },
            paymentMethod
        };
        
        const orderResponse = await axios.post(`${API_URL}/orders`, orderData, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const order = orderResponse.data.data;
        
        if (paymentMethod === 'khalti') {
            await initializeKhaltiPayment(order);
        }
        
    } catch (error) {
        console.error('Error placing order:', error);
        showNotification('Failed to place order. Please try again.', 'error');
    }
}

// Initialize Khalti payment
async function initializeKhaltiPayment(order) {
    try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        const response = await axios.post(`${API_URL}/payments/khalti/initiate`, {
            amount: order.totalAmount,
            purchase_order_id: order._id,
            purchase_order_name: `Order #${order._id}`,
            customer_info: {
                name: document.getElementById('fullName').value,
                email: user.email,
                phone: document.getElementById('phone').value
            }
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
            // Open Khalti checkout
            const checkout = new KhaltiCheckout({
                ...khaltiConfig,
                amount: order.totalAmount * 100,
                orderId: order._id,
                orderName: `Order #${order._id}`,
                orderDetail: {
                    productIdentity: order._id,
                    productName: `Order #${order._id}`,
                    productUrl: window.location.origin
                }
            });
            
            checkout.show({amount: order.totalAmount * 100});
        }
    } catch (error) {
        console.error('Error initializing payment:', error);
        showNotification('Failed to initialize payment. Please try again.', 'error');
    }
}

// Verify payment
async function verifyPayment(payload) {
    try {
        const token = localStorage.getItem('token');
        
        const response = await axios.post(`${API_URL}/payments/khalti/verify`, {
            pidx: payload.pidx,
            amount: payload.amount / 100,
            purchase_order_id: payload.orderId,
            type: 'order'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
            // Clear cart
            await axios.delete(`${API_URL}/cart/clear`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            showNotification('Payment successful!');
            window.location.href = `order-success.html?id=${payload.orderId}`;
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        showNotification('Payment verification failed. Please contact support.', 'error');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', loadCartForCheckout);