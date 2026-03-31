const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const { DatabaseSync } = require("node:sqlite");
const seedProducts = require("../data/seedProducts");
const createSeedUsers = require("../data/seedUsers");

const DEFAULT_DB_FILE = path.join(__dirname, "..", "data", "blisss.sqlite");
const DEFAULT_LEGACY_JSON_FILE = path.join(__dirname, "..", "data", "local-db.json");

let fileStoreEnabled = false;
let db;

const getDbFile = () =>
  process.env.DATA_FILE
    ? path.resolve(process.cwd(), process.env.DATA_FILE)
    : DEFAULT_DB_FILE;

const getLegacyJsonFile = () =>
  process.env.LEGACY_DATA_FILE
    ? path.resolve(process.cwd(), process.env.LEGACY_DATA_FILE)
    : DEFAULT_LEGACY_JSON_FILE;

const ensureParentDir = (filename) => {
  const dir = path.dirname(filename);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

const clone = (value) => {
  if (value === undefined || value === null) {
    return value ?? null;
  }

  return JSON.parse(JSON.stringify(value));
};

const createId = () => randomUUID().replace(/-/g, "");

const timestamp = () => new Date().toISOString();

const withMeta = (item) => {
  const now = timestamp();
  return {
    _id: item._id || createId(),
    createdAt: item.createdAt || now,
    updatedAt: item.updatedAt || now,
    ...item,
  };
};

const parseJson = (value, fallback) => {
  if (!value) {
    return clone(fallback);
  }

  try {
    return JSON.parse(value);
  } catch {
    return clone(fallback);
  }
};

const boolToInt = (value) => (value ? 1 : 0);
const intToBool = (value) => Boolean(value);

const getDb = () => {
  if (db) {
    return db;
  }

  const dbFile = getDbFile();
  ensureParentDir(dbFile);
  db = new DatabaseSync(dbFile);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      _id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      professionalDetails TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS products (
      _id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      price REAL NOT NULL,
      image TEXT,
      category TEXT,
      stock INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      reviews INTEGER DEFAULT 0,
      badge TEXT,
      featured INTEGER DEFAULT 0,
      inStock INTEGER DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS orders (
      _id TEXT PRIMARY KEY,
      user TEXT NOT NULL,
      items TEXT NOT NULL,
      shippingAddress TEXT,
      totalAmount REAL NOT NULL,
      paymentMethod TEXT,
      paymentStatus TEXT,
      status TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS bookings (
      _id TEXT PRIMARY KEY,
      user TEXT NOT NULL,
      service TEXT,
      professional TEXT,
      date TEXT,
      time TEXT,
      price REAL DEFAULT 0,
      paymentStatus TEXT,
      status TEXT,
      notes TEXT,
      customerName TEXT,
      userEmail TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);

  return db;
};

const mapUserRow = (row) => {
  if (!row) return null;
  return {
    ...row,
    professionalDetails: parseJson(row.professionalDetails, {}),
  };
};

const mapProductRow = (row) => {
  if (!row) return null;
  return {
    ...row,
    price: Number(row.price),
    stock: Number(row.stock || 0),
    rating: Number(row.rating || 0),
    reviews: Number(row.reviews || 0),
    featured: intToBool(row.featured),
    inStock: intToBool(row.inStock),
  };
};

const mapOrderRow = (row) => {
  if (!row) return null;
  return {
    ...row,
    totalAmount: Number(row.totalAmount || 0),
    items: parseJson(row.items, []),
    shippingAddress: parseJson(row.shippingAddress, {}),
  };
};

const mapBookingRow = (row) => {
  if (!row) return null;
  return {
    ...row,
    price: Number(row.price || 0),
  };
};

const matchesSearch = (text, term) =>
  String(text || "").toLowerCase().includes(String(term || "").toLowerCase());

const sortItems = (items, sort) => {
  const sorted = [...items];

  if (sort === "price-asc") {
    sorted.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sort === "price-desc") {
    sorted.sort((a, b) => Number(b.price) - Number(a.price));
  } else if (sort === "rating-desc") {
    sorted.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  } else if (sort === "name-asc") {
    sorted.sort((a, b) => String(a.name).localeCompare(String(b.name)));
  } else {
    sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  return sorted;
};

const filterProducts = (products, query = {}) => {
  let filtered = [...products];

  if (query.category) {
    const categories = String(query.category)
      .split(",")
      .map((item) => item.trim().toLowerCase());
    filtered = filtered.filter((product) =>
      categories.includes(String(product.category).toLowerCase())
    );
  }

  if (query.featured === "true") {
    filtered = filtered.filter((product) => product.featured);
  }

  if (query.search) {
    filtered = filtered.filter(
      (product) =>
        matchesSearch(product.name, query.search) ||
        matchesSearch(product.description, query.search)
    );
  }

  return sortItems(filtered, query.sort);
};

const countRows = (table) => {
  const row = getDb().prepare(`SELECT COUNT(*) AS count FROM ${table}`).get();
  return Number(row.count || 0);
};

const readLegacyDb = () => {
  const legacyFile = getLegacyJsonFile();
  if (!fs.existsSync(legacyFile)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(legacyFile, "utf8"));
  } catch {
    return null;
  }
};

const insertUser = getDb().prepare(`
  INSERT OR REPLACE INTO users
  (_id, name, email, phone, password, role, professionalDetails, createdAt, updatedAt)
  VALUES (@_id, @name, @email, @phone, @password, @role, @professionalDetails, @createdAt, @updatedAt)
`);

const insertProduct = getDb().prepare(`
  INSERT OR REPLACE INTO products
  (_id, name, slug, description, price, image, category, stock, rating, reviews, badge, featured, inStock, createdAt, updatedAt)
  VALUES (@_id, @name, @slug, @description, @price, @image, @category, @stock, @rating, @reviews, @badge, @featured, @inStock, @createdAt, @updatedAt)
`);

const insertOrder = getDb().prepare(`
  INSERT OR REPLACE INTO orders
  (_id, user, items, shippingAddress, totalAmount, paymentMethod, paymentStatus, status, createdAt, updatedAt)
  VALUES (@_id, @user, @items, @shippingAddress, @totalAmount, @paymentMethod, @paymentStatus, @status, @createdAt, @updatedAt)
`);

const insertBooking = getDb().prepare(`
  INSERT OR REPLACE INTO bookings
  (_id, user, service, professional, date, time, price, paymentStatus, status, notes, customerName, userEmail, createdAt, updatedAt)
  VALUES (@_id, @user, @service, @professional, @date, @time, @price, @paymentStatus, @status, @notes, @customerName, @userEmail, @createdAt, @updatedAt)
`);

const persistUser = (user) => {
  insertUser.run({
    ...withMeta(user),
    email: String(user.email).toLowerCase(),
    professionalDetails: JSON.stringify(user.professionalDetails || {}),
  });
};

const persistProduct = (product) => {
  insertProduct.run({
    ...withMeta(product),
    price: Number(product.price || 0),
    stock: Number(product.stock || 0),
    rating: Number(product.rating || 0),
    reviews: Number(product.reviews || 0),
    featured: boolToInt(product.featured),
    inStock: boolToInt(product.inStock !== false),
  });
};

const persistOrder = (order) => {
  insertOrder.run({
    ...withMeta(order),
    items: JSON.stringify(order.items || []),
    shippingAddress: JSON.stringify(order.shippingAddress || {}),
    totalAmount: Number(order.totalAmount || 0),
  });
};

const persistBooking = (booking) => {
  insertBooking.run({
    ...withMeta(booking),
    price: Number(booking.price || 0),
    notes: booking.notes || "",
    customerName: booking.customerName || booking.name || "",
    userEmail: booking.userEmail || booking.email || "",
  });
};

const setFileStoreEnabled = (enabled) => {
  fileStoreEnabled = enabled;
};

const isFileStoreEnabled = () => fileStoreEnabled;

const seedFileStore = async () => {
  getDb();

  const hasExistingData =
    countRows("users") > 0 ||
    countRows("products") > 0 ||
    countRows("orders") > 0 ||
    countRows("bookings") > 0;

  if (hasExistingData) {
    return;
  }

  const legacyDb = readLegacyDb();
  if (legacyDb) {
    (legacyDb.users || []).forEach((user) => persistUser(user));
    (legacyDb.products || []).forEach((product) => persistProduct(product));
    (legacyDb.orders || []).forEach((order) => persistOrder(order));
    (legacyDb.bookings || []).forEach((booking) => persistBooking(booking));
    return;
  }

  seedProducts.forEach((product) => persistProduct(product));
  const users = await createSeedUsers();
  users.forEach((user) => persistUser(user));
};

const getProducts = (query = {}) => {
  const rows = getDb().prepare("SELECT * FROM products").all().map(mapProductRow);
  const currentPage = Number(query.page) || 1;
  const pageSize = Number(query.limit) || 12;
  const filtered = filterProducts(rows, query);
  const start = (currentPage - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return {
    data: clone(data),
    pagination: {
      page: currentPage,
      pages: Math.max(1, Math.ceil(filtered.length / pageSize)),
      total: filtered.length,
    },
  };
};

const getAllProducts = () =>
  clone(getDb().prepare("SELECT * FROM products").all().map(mapProductRow));

const getProductBySlug = (slug) =>
  clone(mapProductRow(getDb().prepare("SELECT * FROM products WHERE slug = ?").get(slug)));

const getProductById = (id) =>
  clone(mapProductRow(getDb().prepare("SELECT * FROM products WHERE _id = ?").get(String(id))));

const createProduct = (product) => {
  const record = withMeta(product);
  persistProduct(record);
  return clone(record);
};

const updateProduct = (id, updates) => {
  const current = getProductById(id);
  if (!current) return null;
  const updated = {
    ...current,
    ...updates,
    _id: current._id,
    updatedAt: timestamp(),
  };
  persistProduct(updated);
  return clone(updated);
};

const deleteProduct = (id) => {
  const result = getDb().prepare("DELETE FROM products WHERE _id = ?").run(String(id));
  return result.changes > 0;
};

const findUserByEmail = (email) =>
  clone(
    mapUserRow(
      getDb().prepare("SELECT * FROM users WHERE email = ?").get(String(email).toLowerCase())
    )
  );

const findUserById = (id) =>
  clone(mapUserRow(getDb().prepare("SELECT * FROM users WHERE _id = ?").get(String(id))));

const createUser = (user) => {
  const record = withMeta({
    ...user,
    email: String(user.email).toLowerCase(),
  });
  persistUser(record);
  return clone(record);
};

const updateUser = (id, updates) => {
  const current = findUserById(id);
  if (!current) return null;
  const updated = {
    ...current,
    ...updates,
    _id: current._id,
    email: current.email,
    updatedAt: timestamp(),
  };
  persistUser(updated);
  return clone(updated);
};

const createOrder = (order) => {
  const record = withMeta(order);
  persistOrder(record);
  return clone(record);
};

const getOrdersByUser = (userId) =>
  clone(
    getDb()
      .prepare("SELECT * FROM orders WHERE user = ?")
      .all(String(userId))
      .map(mapOrderRow)
  );

const getOrderById = (id, userId = null) => {
  const row = userId
    ? getDb().prepare("SELECT * FROM orders WHERE _id = ? AND user = ?").get(String(id), String(userId))
    : getDb().prepare("SELECT * FROM orders WHERE _id = ?").get(String(id));
  return clone(mapOrderRow(row));
};

const getAllOrders = () =>
  clone(getDb().prepare("SELECT * FROM orders").all().map(mapOrderRow));

const createBooking = (booking) => {
  const record = withMeta(booking);
  persistBooking(record);
  return clone(record);
};

const getBookingsByUser = (userId) =>
  clone(
    getDb()
      .prepare("SELECT * FROM bookings WHERE user = ?")
      .all(String(userId))
      .map(mapBookingRow)
  );

const getBookingById = (id, userId = null) => {
  const row = userId
    ? getDb().prepare("SELECT * FROM bookings WHERE _id = ? AND user = ?").get(String(id), String(userId))
    : getDb().prepare("SELECT * FROM bookings WHERE _id = ?").get(String(id));
  return clone(mapBookingRow(row));
};

const getBookingsByProfessional = (professionalName) =>
  clone(
    getDb()
      .prepare("SELECT * FROM bookings WHERE professional = ?")
      .all(professionalName)
      .map(mapBookingRow)
  );

const getAllBookings = () =>
  clone(getDb().prepare("SELECT * FROM bookings").all().map(mapBookingRow));

const updateBooking = (id, updates) => {
  const current = getBookingById(id);
  if (!current) return null;
  const updated = {
    ...current,
    ...updates,
    _id: current._id,
    updatedAt: timestamp(),
  };
  persistBooking(updated);
  return clone(updated);
};

const getCounts = () => ({
  users: countRows("users"),
  products: countRows("products"),
  orders: countRows("orders"),
  bookings: countRows("bookings"),
});

module.exports = {
  setFileStoreEnabled,
  isFileStoreEnabled,
  seedFileStore,
  getProducts,
  getAllProducts,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  findUserByEmail,
  findUserById,
  createUser,
  updateUser,
  createOrder,
  getOrdersByUser,
  getOrderById,
  getAllOrders,
  createBooking,
  getBookingsByUser,
  getBookingById,
  getBookingsByProfessional,
  getAllBookings,
  updateBooking,
  getCounts,
};
