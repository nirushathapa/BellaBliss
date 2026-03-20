let selectedVariant = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Get product ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');
    
    if (productId) {
        loadProductDetails(productId);
    } else {
        window.location.href = 'products.html';
    }
});

// Load product details
async function loadProductDetails(productId) {
    try {
        const response = await axios.get(`${API_URL}/products/${productId}`);
        const product = response.data.data;
        
        displayProductDetails(product);
        loadRelatedProducts(product.category);
    } catch (error) {
        console.error('Error loading product:', error);
        document.getElementById('productDetails').innerHTML = 
            '<p class="text-center text-red-600">Failed to load product details</p>';
    }
}

// Display product details
function displayProductDetails(product) {
    const container = document.getElementById('productDetails');
    
    let variantOptions = '';
    if (product.variants && product.variants.length > 0) {
        product.variants.forEach(variant => {
            variantOptions += `
                <div class="mb-4">
                    <label class="block text-gray-700 mb-2">Select ${variant.type}:</label>
                    <div class="flex space-x-2">
                        ${variant.options.map(opt => `
                            <button onclick="selectVariant('${variant.type}', '${opt.value}', ${opt.price})" 
                                    class="px-3 py-1 border rounded hover:bg-rose-50">
                                ${opt.value}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        });
    }
    
    container.innerHTML = `
        <div class="grid md:grid-cols-2 gap-8">
            <!-- Product Images -->
            <div>
                <div class="mb-4">
                    <img id="mainImage" src="${product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url}" 
                         alt="${product.name}" 
                         class="w-full rounded-lg">
                </div>
                <div class="grid grid-cols-4 gap-2">
                    ${product.images?.map((img, index) => `
                        <img src="${img.url}" 
                             alt="${img.alt || product.name}" 
                             class="w-full h-20 object-cover rounded cursor-pointer border-2 hover:border-rose-600"
                             onclick="changeMainImage('${img.url}')">
                    `).join('')}
                </div>
            </div>
            
            <!-- Product Info -->
            <div>
                <h1 class="text-3xl font-bold mb-2">${product.name}</h1>
                
                <!-- Rating -->
                <div class="flex items-center mb-4">
                    <div class="flex text-yellow-400">
                        ${'★'.repeat(Math.floor(product.ratings?.average || 0))}${'☆'.repeat(5-Math.floor(product.ratings?.average || 0))}
                    </div>
                    <span class="text-gray-600 ml-2">(${product.ratings?.count || 0} reviews)</span>
                </div>
                
                <!-- Price -->
                <p class="text-3xl font-bold text-rose-600 mb-6">${formatPrice(product.price)}</p>
                
                <!-- Description -->
                <p class="text-gray-600 mb-6">${product.description}</p>
                
                <!-- Variants -->
                ${variantOptions}
                
                <!-- Quantity -->
                <div class="mb-6">
                    <label class="block text-gray-700 mb-2">Quantity:</label>
                    <div class="flex items-center space-x-2">
                        <button onclick="updateQuantity(-1)" class="w-8 h-8 border rounded hover:bg-rose-50">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" id="quantity" value="1" min="1" max="${product.stock}" 
                               class="w-16 text-center border rounded py-1">
                        <button onclick="updateQuantity(1)" class="w-8 h-8 border rounded hover:bg-rose-50">
                            <i class="fas fa-plus"></i>
                        </button>
                        <span class="text-gray-500 ml-2">${product.stock} available</span>
                    </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex space-x-4 mb-6">
                    <button onclick="addToCart('${product._id}')" 
                            class="flex-1 bg-rose-600 text-white px-6 py-3 rounded-md hover:bg-rose-700 transition">
                        <i class="fas fa-shopping-cart mr-2"></i>Add to Cart
                    </button>
                    <button onclick="addToWishlist('${product._id}')" 
                            class="border border-rose-600 text-rose-600 px-6 py-3 rounded-md hover:bg-rose-50">
                        <i class="far fa-heart"></i>
                    </button>
                </div>
                
                <!-- Additional Info -->
                <div class="border-t pt-6">
                    <div class="flex items-center mb-2">
                        <i class="fas fa-truck text-rose-600 mr-2"></i>
                        <span>Free shipping on orders over $50</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fas fa-undo text-rose-600 mr-2"></i>
                        <span>30-day easy returns</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('loadingSpinner').classList.add('hidden');
}

// Change main image
function changeMainImage(url) {
    document.getElementById('mainImage').src = url;
}

// Update quantity
function updateQuantity(change) {
    const input = document.getElementById('quantity');
    let value = parseInt(input.value) + change;
    const min = parseInt(input.min);
    const max = parseInt(input.max);
    
    if (value >= min && value <= max) {
        input.value = value;
    }
}

// Select variant
function selectVariant(type, value, price) {
    selectedVariant = { type, value, price };
    // Highlight selected variant
    document.querySelectorAll('[onclick^="selectVariant"]').forEach(btn => {
        btn.classList.remove('bg-rose-600', 'text-white');
        btn.classList.add('hover:bg-rose-50');
    });
    event.target.classList.add('bg-rose-600', 'text-white');
}

// Add to cart with variant
async function addToCart(productId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        
        const quantity = document.getElementById('quantity').value;
        
        const data = {
            productId,
            quantity: parseInt(quantity)
        };
        
        if (selectedVariant) {
            data.variant = selectedVariant;
        }
        
        await axios.post(`${API_URL}/cart/add`, data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        updateCartCount();
        showNotification('Product added to cart!');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Failed to add to cart', 'error');
    }
}

// Load related products
async function loadRelatedProducts(category) {
    try {
        const response = await axios.get(`${API_URL}/products?category=${category}&limit=4`);
        const products = response.data.data;
        
        const container = document.querySelector('#relatedProducts .grid');
        container.innerHTML = products.map(product => `
            <div class="bg-white rounded-lg shadow-md overflow-hidden">
                <a href="product-detail.html?id=${product._id}">
                    <img src="${product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url}" 
                         alt="${product.name}" 
                         class="w-full h-32 object-cover">
                </a>
                <div class="p-3">
                    <a href="product-detail.html?id=${product._id}">
                        <h3 class="font-semibold hover:text-rose-600">${product.name}</h3>
                    </a>
                    <p class="text-rose-600 font-bold mt-1">${formatPrice(product.price)}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading related products:', error);
    }
}