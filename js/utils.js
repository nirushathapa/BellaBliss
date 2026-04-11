const fallbackFeaturedProducts = [
    {
        _id: 'fallback-matte-lipstick-ruby-red',
        slug: 'matte-lipstick-ruby-red',
        name: 'Matte Lipstick - Ruby Red',
        price: 29.99,
        image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=900&auto=format&fit=crop',
        category: 'Makeup',
        rating: 4.5,
        reviews: 128,
        badge: 'Bestseller',
        featured: true,
        inStock: true
    },
    {
        _id: 'fallback-hydrating-face-cream',
        slug: 'hydrating-face-cream',
        name: 'Hydrating Face Cream',
        price: 34.99,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=900&auto=format&fit=crop',
        category: 'Skincare',
        rating: 4.8,
        reviews: 89,
        badge: 'New',
        featured: true,
        inStock: true
    },
    {
        _id: 'fallback-volume-mascara',
        slug: 'volume-mascara',
        name: 'Volume Mascara',
        price: 24.99,
        image: 'https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=900&auto=format&fit=crop',
        category: 'Makeup',
        rating: 4.3,
        reviews: 67,
        badge: 'Sale',
        featured: true,
        inStock: true
    },
    {
        _id: 'fallback-eyeshadow-palette',
        slug: 'eyeshadow-palette',
        name: 'Eyeshadow Palette',
        price: 49.99,
        image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=900&auto=format&fit=crop',
        category: 'Makeup',
        rating: 4.6,
        reviews: 234,
        badge: 'Limited',
        featured: true,
        inStock: true
    }
];

// Initialize AOS
if (window.AOS) {
    AOS.init({
        duration: 1000,
        once: true,
        offset: 100
    });
}

function renderFeaturedProducts(container, products) {
    container.innerHTML = products.map(product => `
        <div class="product-card group" data-aos="fade-up">
            <a href="pages/products/${buildProductUrl(product)}" class="block">
                <div class="relative overflow-hidden">
                    <img src="${getProductImage(product)}" alt="${product.name}" class="product-image w-full h-64 object-cover">
                    <div class="product-overlay"></div>
                    ${product.badge ? `
                        <span class="absolute top-4 left-4 bg-rose-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                            ${product.badge}
                        </span>
                    ` : ''}
                </div>
            </a>
            <div class="p-4">
                <div class="flex items-center justify-between mb-2 gap-3">
                    <a href="pages/products/${buildProductUrl(product)}" class="font-semibold text-gray-800 group-hover:text-rose-600 transition">${product.name}</a>
                    <span class="text-sm text-gray-500">${product.category}</span>
                </div>
                <div class="flex items-center mb-2">
                    ${renderStars(product.rating)}
                    <span class="text-sm text-gray-500 ml-2">(${product.reviews || 0})</span>
                </div>
                <div class="flex justify-between items-center gap-3">
                    <span class="text-2xl font-bold text-rose-600">${formatPrice(product.price)}</span>
                    <button onclick='addToCart(${JSON.stringify(product).replace(/'/g, "&apos;")})'
                            class="bg-rose-600 text-white px-4 py-2 rounded-full hover:bg-rose-700 transition text-sm">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

async function displayFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (!container) {
        return;
    }

    container.innerHTML = '<p class="col-span-full text-center text-gray-500">Loading featured products...</p>';

    try {
        const response = await fetchFromApi('/products?featured=true&limit=4');
        const products = response.data || [];

        if (!products.length) {
            renderFeaturedProducts(container, fallbackFeaturedProducts);
            return;
        }

        renderFeaturedProducts(container, products);
    } catch (error) {
        console.error('Error loading featured products:', error);
        renderFeaturedProducts(container, fallbackFeaturedProducts);
    }
}

        // Toggle mobile menu
        function toggleMobileMenu() {
            document.getElementById('mobileMenu').classList.toggle('hidden');
        }

        // Toggle user menu
        function toggleUserMenu() {
            document.getElementById('userDropdown').classList.toggle('hidden');
        }

        // Handle newsletter
        function handleNewsletter(event) {
            event.preventDefault();
            alert('Thank you for subscribing! Check your email for exclusive offers.');
            event.target.reset();
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            const dropdown = document.getElementById('userDropdown');
            const userMenu = document.getElementById('userMenu');
            
            if (dropdown && userMenu && !userMenu.contains(event.target)) {
                dropdown.classList.add('hidden');
            }
        });

// Initialize
displayFeaturedProducts();

// Update user info if logged in
if (isLoggedIn()) {
    const user = getCurrentUser();
    const initials = document.getElementById('userInitials');
    if (user && initials) {
        initials.textContent = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
}
