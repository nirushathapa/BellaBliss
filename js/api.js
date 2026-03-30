const API_URL = "http://localhost:5000/api";

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
    const response = await fetch(`${API_URL}${path}`);

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
