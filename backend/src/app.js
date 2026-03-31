const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const orderRoutes = require("./routes/orderRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const professionalRoutes = require("./routes/professionalRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

const configuredClientUrl = process.env.CLIENT_URL;
const allowedOrigins = new Set(
  [
    configuredClientUrl,
    "http://127.0.0.1:5500",
    "http://localhost:5500",
    "http://127.0.0.1:5501",
    "http://localhost:5501",
  ].filter(Boolean)
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origin === "null") {
        return callback(null, true);
      }

      if (
        allowedOrigins.has(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(null, false);
    },
  })
);
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Blisss Backend</title>
      <style>
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: linear-gradient(135deg, #fff1f2, #ffe4e6);
          color: #1f2937;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }
        .card {
          max-width: 720px;
          width: 100%;
          background: #ffffff;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(225, 29, 72, 0.15);
          padding: 32px;
        }
        h1 {
          margin-top: 0;
          color: #be123c;
        }
        .badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          background: #ffe4e6;
          color: #be123c;
          font-weight: 700;
          margin-bottom: 16px;
        }
        ul {
          padding-left: 20px;
        }
        li {
          margin: 10px 0;
        }
        code, a {
          color: #e11d48;
        }
      </style>
    </head>
    <body>
      <main class="card">
        <div class="badge">Backend Running</div>
        <h1>Blisss API Server</h1>
        <p>The backend is online and listening on <code>http://localhost:${process.env.PORT || 5000}</code>.</p>
        <p>This project now uses one SQLite database file for app data.</p>
        <p>Available routes:</p>
        <ul>
          <li><a href="/api/health">/api/health</a></li>
          <li><a href="/api/products">/api/products</a></li>
          <li><code>/api/auth/login</code></li>
          <li><code>/api/auth/register</code></li>
          <li><code>/api/orders</code></li>
          <li><code>/api/bookings</code></li>
          <li><code>/api/admin/dashboard</code></li>
          <li><code>/api/professional/bookings</code></li>
        </ul>
        <p>If you see this page, the backend server itself is working.</p>
      </main>
    </body>
    </html>
  `);
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Blisss backend is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/professional", professionalRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

module.exports = app;
