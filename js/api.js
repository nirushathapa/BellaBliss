function getApiBaseUrl() {
    if (window.API_BASE_URL) {
        return window.API_BASE_URL;
    }

    const storedUrl = localStorage.getItem('apiBaseUrl');
    if (storedUrl) {
        return storedUrl;
    }

    return "http://localhost:5000/api";
}

const API_URL = getApiBaseUrl();

function getRootRelativePath(path) {
    const normalizedPath = String(path || '').replace(/^\/+/, '');
    const origin = window.location.origin;
    const isFileProtocol = window.location.protocol === 'file:';

    if (!normalizedPath) {
        return isFileProtocol ? `${window.location.pathname}` : `${origin}/`;
    }

    if (isFileProtocol) {
        const pathname = window.location.pathname.replace(/\\/g, '/');
        const marker = '/pages/';
        const rootPath = pathname.includes(marker)
            ? pathname.slice(0, pathname.indexOf(marker))
            : pathname.slice(0, pathname.lastIndexOf('/'));

        return `${rootPath}/${normalizedPath}`.replace(/\/{2,}/g, '/');
    }

    return `${origin}/${normalizedPath}`;
}

function navigateTo(path) {
    window.location.href = getRootRelativePath(path);
}

function formatPrice(price) {
    return `$${Number(price || 0).toFixed(2)}`;
}

function renderStars(rating = 0) {
    const roundedRating = Math.round(Number(rating) || 0);
    return `
        <div class="flex text-yellow-400">
            ${'<i class="fas fa-star"></i>'.repeat(roundedRating)}
            ${'<i class="far fa-star"></i>'.repeat(Math.max(0, 5 - roundedRating))}
        </div>
    `;
}

async function fetchFromApi(path) {
    let response;

    try {
        response = await fetch(`${API_URL}${path}`);
    } catch (error) {
        throw new Error('Cannot connect to the backend server at http://localhost:5000. Start the backend and try again.');
    }

    if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
    }

    return response.json();
}

function getProductImage(product) {
    return product.image || "https://via.placeholder.com/600x600?text=Product";
}

function buildProductUrl(product) {
    return `product-detail.html?slug=${encodeURIComponent(product.slug)}`;
}
