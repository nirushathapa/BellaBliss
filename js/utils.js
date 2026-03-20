 // Initialize AOS
        AOS.init({
            duration: 1000,
            once: true,
            offset: 100
        });
        
        // Sample products data with high-quality images
        const products = [
            { 
                id: 1, 
                name: 'Matte Lipstick - Ruby Red', 
                price: 29.99, 
                image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600&h=400&fit=crop', 
                rating: 4.5,
                badge: 'Bestseller'
            },
            { 
                id: 2, 
                name: 'Hydrating Face Cream', 
                price: 34.99, 
                image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&h=400&fit=crop', 
                rating: 4.8,
                badge: 'New'
            },
            { 
                id: 3, 
                name: 'Volume Mascara', 
                price: 24.99, 
                image: 'https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=600&h=400&fit=crop', 
                rating: 4.3,
                badge: 'Sale'
            },
            { 
                id: 4, 
                name: 'Eyeshadow Palette', 
                price: 49.99, 
                image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&h=400&fit=crop', 
                rating: 4.6,
                badge: 'Limited'
            }
        ];

        // Display featured products
        function displayFeaturedProducts() {
            const container = document.getElementById('featuredProducts');
            
            container.innerHTML = products.map(product => `
                <div class="product-card group" data-aos="fade-up">
                    <div class="relative overflow-hidden">
                        <img src="${product.image}" alt="${product.name}" class="product-image w-full h-64 object-cover">
                        <div class="product-overlay"></div>
                        ${product.badge ? `
                            <span class="absolute top-4 left-4 bg-rose-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                ${product.badge}
                            </span>
                        ` : ''}
                    </div>
                    <div class="p-4">
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="font-semibold text-gray-800 group-hover:text-rose-600 transition">${product.name}</h3>
                            <span class="text-sm text-gray-500">ID: ${product.id}</span>
                        </div>
                        <div class="flex items-center mb-2">
                            <div class="flex text-yellow-400">
                                ${'<i class="fas fa-star"></i>'.repeat(Math.floor(product.rating))}
                                ${product.rating % 1 ? '<i class="fas fa-star-half-alt"></i>' : ''}
                                ${'<i class="far fa-star"></i>'.repeat(5 - Math.ceil(product.rating))}
                            </div>
                            <span class="text-sm text-gray-500 ml-2">(${product.rating})</span>
                        </div>
                        <div class="flex justify-between items-center">
                            <span class="text-2xl font-bold text-rose-600">$${product.price}</span>
                            <button onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})" 
                                    class="bg-rose-600 text-white px-4 py-2 rounded-full hover:bg-rose-700 transition text-sm">
                                Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
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
            document.getElementById('userInitials').textContent = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        }