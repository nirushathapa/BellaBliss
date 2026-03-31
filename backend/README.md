# Blisss Backend

This folder contains the Express backend for the Blisss frontend project.

## Stack

- Node.js
- Express
- SQLite (`src/data/blisss.sqlite`)

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

4. Adjust `DATA_FILE` in `.env` if you want the SQLite database somewhere else
5. Start the backend:

```bash
npm run dev
```

## API Endpoints

- `GET /api/health`
- `GET /api/products`
- `GET /api/products/:slug`
- `POST /api/products`

## Notes

- On first run, the app migrates data from the legacy `src/data/local-db.json` file into SQLite if that JSON file exists.

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
