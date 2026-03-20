let currentPage = 1;
let totalPages = 1;

// Load products on page load
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

// Load products with filters
async function loadProducts(page = 1) {
    try {
        document.getElementById('loadingSpinner').classList.remove('hidden');
        
        // Build query string
        const params = new URLSearchParams({
            page,
            limit: 9
        });
        
        // Add category filters
        const categories = [];
        document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
            categories.push(cb.value);
        });
        if (categories.length) {
            params.append('category', categories.join(','));
        }
        
        // Add price range
        const minPrice = document.getElementById('minPrice')?.value;
        const maxPrice = document.getElementById('maxPrice')?.value;
        if (minPrice) params.append('minPrice', minPrice);
        if (maxPrice) params.append('maxPrice', maxPrice);
        
        // Add rating
        const rating = document.getElementById('ratingFilter')?.value;
        if (rating && rating > 0) params.append('minRating', rating);
        
        // Add search
        const search = document.getElementById('searchInput')?.value;
        if (search) params.append('search', search);
        
        // Add sorting
        const sort = document.getElementById('sortBy')?.value;
        if (sort) params.append('sort', sort);
        
        const response = await axios.get(`${API_URL}/products?${params.toString()}`);
        const { data, pagination } = response.data;
        
        displayProducts(data);
        setupPagination(pagination);
        
        currentPage = pagination.page;
        totalPages = pagination.pages;
        
    } catch (error) {
        console.error('Error loading products:', error);
        showError('productsContainer', 'Failed to load products');
    } finally {
        document.getElementById('loadingSpinner').classList.add('hidden');
    }
}

// Display products
function displayProducts(products) {
    const container = document.getElementById('productsContainer');
    
    if (!products || products.length === 0) {
        container.innerHTML = '<p class="text-center text-gray-600 col-span-3">No products found</p>';
        return;
    }
    
    container.innerHTML = products.map(product => `
        <div class="bg-white rounded-lg shadow-md overflow-hidden hover-scale group">
            <a href="product-detail.html?id=${product._id}">
                <div class="relative">
                    <img src="${product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url}" 
                         alt="${product.name}" 
                         class="w-full h-48 object-cover group-hover:scale-105 transition duration-300">
                    ${product.stock < 10 ? `
                        <span class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                            Only ${product.stock} left
                        </span>
                    ` : ''}
                </div>
            </a>
            <div class="p-4">
                <a href="product-detail.html?id=${product._id}">
                    <h3 class="text-lg font-semibold mb-2 hover:text-rose-600">${product.name}</h3>
                </a>
                <p class="text-gray-600 text-sm mb-2">${product.description?.substring(0, 60)}...</p>
                <div class="flex items-center mb-2">
                    <div class="flex text-yellow-400">
                        ${'★'.repeat(Math.floor(product.ratings?.average || 0))}${'☆'.repeat(5-Math.floor(product.ratings?.average || 0))}
                    </div>
                    <span class="text-sm text-gray-500 ml-2">(${product.ratings?.count || 0})</span>
                </div>
                <div class="flex justify-between items-center">
                    <span class="text-rose-600 font-bold">${formatPrice(product.price)}</span>
                    <div class="flex space-x-2">
                        <button onclick="addToWishlist('${product._id}')" 
                                class="text-gray-400 hover:text-rose-600 transition">
                            <i class="far fa-heart"></i>
                        </button>
                        <button onclick="addToCart('${product._id}')" 
                                class="bg-rose-600 text-white px-3 py-1 rounded text-sm hover:bg-rose-700 transition">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Setup pagination
function setupPagination(pagination) {
    const container = document.getElementById('pagination');
    if (!container) return;
    
    let html = '';
    
    if (pagination.page > 1) {
        html += `<button onclick="loadProducts(${pagination.page - 1})" class="px-3 py-1 border rounded hover:bg-rose-50">&laquo;</button>`;
    }
    
    for (let i = 1; i <= pagination.pages; i++) {
        if (i === pagination.page) {
            html += `<button class="px-3 py-1 bg-rose-600 text-white rounded">${i}</button>`;
        } else if (i === 1 || i === pagination.pages || (i >= pagination.page - 2 && i <= pagination.page + 2)) {
            html += `<button onclick="loadProducts(${i})" class="px-3 py-1 border rounded hover:bg-rose-50">${i}</button>`;
        } else if (i === pagination.page - 3 || i === pagination.page + 3) {
            html += `<span class="px-3 py-1">...</span>`;
        }
    }
    
    if (pagination.page < pagination.pages) {
        html += `<button onclick="loadProducts(${pagination.page + 1})" class="px-3 py-1 border rounded hover:bg-rose-50">&raquo;</button>`;
    }
    
    container.innerHTML = html;
}

// Filter products
function filterProducts() {
    loadProducts(1);
}

// Clear all filters
function clearFilters() {
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.getElementById('minPrice').value = '';
    document.getElementById('maxPrice').value = '';
    document.getElementById('ratingFilter').value = '0';
    document.getElementById('searchInput').value = '';
    document.getElementById('sortBy').value = 'newest';
    loadProducts(1);
}

// Add to cart
async function addToCart(productId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        
        await axios.post(`${API_URL}/cart/add`, 
            { productId, quantity: 1 },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        updateCartCount();
        showNotification('Product added to cart!');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Failed to add to cart', 'error');
    }
}

// Add to wishlist
async function addToWishlist(productId) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = 'login.html';
            return;
        }
        
        await axios.post(`${API_URL}/wishlist/add`, 
            { productId },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        
        updateWishlistCount();
        showNotification('Added to wishlist!');
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        showNotification('Failed to add to wishlist', 'error');
    }
}