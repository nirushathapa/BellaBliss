let currentProduct = null;

document.addEventListener('DOMContentLoaded', () => {
    loadProductDetails();
});

async function loadProductDetails() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('slug');

    if (!slug) {
        window.location.href = 'products.html';
        return;
    }

    try {
        const response = await fetchFromApi(`/products/${encodeURIComponent(slug)}`);
        currentProduct = response.data;

        document.getElementById('productName').textContent = currentProduct.name;
        document.getElementById('productNameTitle').textContent = currentProduct.name;
        document.getElementById('productPrice').textContent = formatPrice(currentProduct.price);
        document.getElementById('productDescription').textContent = currentProduct.description;
        document.getElementById('mainImage').src = getProductImage(currentProduct);
        document.getElementById('mainImage').alt = currentProduct.name;
        document.getElementById('stockStatus').textContent = currentProduct.inStock ? 'In Stock' : 'Out of Stock';
        document.getElementById('stockStatus').className = currentProduct.inStock ? 'text-green-600 ml-3' : 'text-red-500 ml-3';
        document.getElementById('productRating').innerHTML = renderStars(currentProduct.rating);
        document.getElementById('productReviews').textContent = `(${currentProduct.reviews || 0} reviews)`;
        document.getElementById('quantity').max = currentProduct.stock || 10;

        renderThumbnails(currentProduct);
        loadRelatedProducts(currentProduct.category, currentProduct.slug);
    } catch (error) {
        console.error('Error loading product details:', error);
        document.getElementById('productDescription').textContent = 'Could not load this product right now.';
    }
}

function renderThumbnails(product) {
    const container = document.getElementById('productThumbnails');
    const image = getProductImage(product);

    container.innerHTML = Array.from({ length: 4 }, () => `
        <img src="${image}" alt="${product.name}" class="thumbnail border-2 rounded-lg" onclick="changeImage('${image}')">
    `).join('');
}

async function loadRelatedProducts(category, activeSlug) {
    const container = document.getElementById('relatedProducts');

    try {
        const response = await fetchFromApi(`/products?category=${encodeURIComponent(category)}&limit=4`);
        const products = (response.data || []).filter(product => product.slug !== activeSlug).slice(0, 4);

        if (!products.length) {
            container.innerHTML = '<p class="text-gray-500 text-center col-span-4">No related products found</p>';
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                <a href="${buildProductUrl(product)}">
                    <img src="${getProductImage(product)}" alt="${product.name}" class="w-full h-48 object-cover">
                </a>
                <div class="p-4">
                    <a href="${buildProductUrl(product)}">
                        <h3 class="font-semibold hover:text-rose-600">${product.name}</h3>
                    </a>
                    <p class="text-rose-600 font-bold mt-2">${formatPrice(product.price)}</p>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading related products:', error);
        container.innerHTML = '<p class="text-gray-500 text-center col-span-4">Could not load related products</p>';
    }
}

function changeImage(src) {
    document.getElementById('mainImage').src = src;
}

function updateQuantity(change) {
    const input = document.getElementById('quantity');
    let value = parseInt(input.value, 10) + change;

    if (value < 1) {
        value = 1;
    }

    if (currentProduct?.stock && value > currentProduct.stock) {
        value = currentProduct.stock;
    }

    input.value = value;
}

function selectShade(button) {
    document.querySelectorAll('.shade-btn').forEach(btn => btn.classList.remove('selected', 'border-gray-400'));
    button.classList.add('selected');
}

function addCurrentProductToCart() {
    if (!currentProduct) {
        return;
    }

    const quantity = parseInt(document.getElementById('quantity').value, 10) || 1;
    addToCart(currentProduct, quantity);
}

function addToWishlist() {
    const token = localStorage.getItem('token');
    if (!token) {
        if (confirm('Please login to add items to wishlist')) {
            window.location.href = '../auth/login.html';
        }
        return;
    }

    alert('Added to wishlist!');
}
