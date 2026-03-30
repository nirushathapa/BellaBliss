# Blisss Backend

This folder contains a basic MERN-ready backend for your frontend-only project.

## Stack

- Node.js
- Express
- MongoDB
- Mongoose

## Setup

1. Open a terminal in `backend`
2. Install dependencies:

```bash
npm install
```

3. Copy the environment file:

```bash
cp .env.example .env
```

4. Update `MONGODB_URI` in `.env`
5. Start the backend:

```bash
npm run dev
```

## API Endpoints

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:slug`
- `POST /api/products`

## Example Product Payload

```json
{
  "name": "Lavender Candle",
  "slug": "lavender-candle",
  "description": "A calming scented candle for your room.",
  "price": 24.99,
  "image": "/assets/lavender-candle.jpg",
  "category": "Candles",
  "inStock": true
}
```
