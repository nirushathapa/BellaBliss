document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});

async function loadProducts(page = 1) {
    const grid = document.getElementById('productsGrid');
    const loading = document.getElementById('loadingSpinner');
    const summary = document.getElementById('resultsSummary');
    const params = new URLSearchParams({
        page,
        limit: 9
    });

    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked'))
        .map(input => input.value);
    if (selectedCategories.length) {
        params.set('category', selectedCategories.join(','));
    }

    const search = document.getElementById('searchInput')?.value.trim();
    const sort = document.getElementById('sortBy')?.value;
    if (search) {
        params.set('search', search);
    }
    if (sort) {
        params.set('sort', sort);
    }

    if (loading) {
        loading.classList.remove('hidden');
    }

    try {
        const response = await fetchFromApi(`/products?${params.toString()}`);
        const products = response.data || [];
        const pagination = response.pagination || { page: 1, pages: 1, total: products.length };

        renderProducts(products, grid);

        if (summary) {
            summary.textContent = `Showing ${products.length} of ${pagination.total} products`;
        }

        renderPagination(pagination);
    } catch (error) {
        console.error('Error loading products:', error);
        grid.innerHTML = '<p class="col-span-full text-center text-red-500">Could not load products.</p>';
    } finally {
        if (loading) {
            loading.classList.add('hidden');
        }
    }
}

function renderProducts(products, container) {
    if (!products.length) {
        container.innerHTML = '<p class="col-span-full text-center text-gray-500">No products found.</p>';
        return;
    }

    container.innerHTML = products.map(product => `
        <div class="product-card bg-white shadow-lg" data-aos="fade-up">
            <a href="${buildProductUrl(product)}">
                <img src="${getProductImage(product)}" alt="${product.name}" class="w-full h-64 object-cover">
            </a>
            <div class="p-4">
                <a href="${buildProductUrl(product)}">
                    <h3 class="font-semibold text-gray-800 hover:text-rose-600">${product.name}</h3>
                </a>
                <p class="text-sm text-gray-500 mt-1">${product.category}</p>
                <div class="flex items-center mt-2">
                    ${renderStars(product.rating)}
                    <span class="text-sm text-gray-500 ml-2">(${product.reviews || 0})</span>
                </div>
                <div class="flex justify-between items-center mt-3 gap-3">
                    <span class="text-xl font-bold text-rose-600">${formatPrice(product.price)}</span>
                    <button onclick='addToCart(${JSON.stringify(product).replace(/'/g, "&apos;")})' class="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 text-sm">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderPagination(pagination) {
    const container = document.getElementById('pagination');
    if (!container) {
        return;
    }

    let html = '';

    for (let page = 1; page <= pagination.pages; page += 1) {
        html += `
            <button onclick="loadProducts(${page})" class="w-10 h-10 rounded-lg ${page === pagination.page ? 'bg-rose-600 text-white' : 'border hover:bg-rose-50'}">
                ${page}
            </button>
        `;
    }

    container.innerHTML = html;
}

function applyFilters() {
    loadProducts(1);
}

function clearFilters() {
    document.querySelectorAll('input[name="category"]').forEach(input => {
        input.checked = false;
    });
    const searchInput = document.getElementById('searchInput');
    const sortBy = document.getElementById('sortBy');

    if (searchInput) {
        searchInput.value = '';
    }
    if (sortBy) {
        sortBy.value = 'newest';
    }

    loadProducts(1);
}
