const fs = require("fs");
const path = require("path");
const { randomUUID } = require("crypto");
const seedProducts = require("../data/seedProducts");
const createSeedUsers = require("../data/seedUsers");

const DB_FILE = path.join(__dirname, "..", "data", "local-db.json");

let fileStoreEnabled = false;

const ensureDbFile = () => {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(
      DB_FILE,
      JSON.stringify({ users: [], products: [], orders: [], bookings: [] }, null, 2),
      "utf8"
    );
  }
};

const readDb = () => {
  ensureDbFile();
  return JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
};

const writeDb = (db) => {
  ensureDbFile();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
};

const clone = (value) => {
  if (value === undefined || value === null) {
    return value ?? null;
  }

  return JSON.parse(JSON.stringify(value));
};

const createId = () => randomUUID().replace(/-/g, "");

const withMeta = (item) => {
  const timestamp = new Date().toISOString();
  return {
    _id: item._id || createId(),
    createdAt: item.createdAt || timestamp,
    updatedAt: timestamp,
    ...item,
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

const setFileStoreEnabled = (enabled) => {
  fileStoreEnabled = enabled;
};

const isFileStoreEnabled = () => fileStoreEnabled;

const seedFileStore = async () => {
  const db = readDb();

  if (!db.products.length) {
    db.products = seedProducts.map((product) =>
      withMeta({
        ...product,
      })
    );
  }

  if (!db.users.length) {
    const users = await createSeedUsers();
    db.users = users.map((user) => withMeta(user));
  }

  writeDb(db);
};

const getProducts = (query = {}) => {
  const db = readDb();
  const currentPage = Number(query.page) || 1;
  const pageSize = Number(query.limit) || 12;
  const filtered = filterProducts(db.products, query);
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

const getAllProducts = () => clone(readDb().products);
const getProductBySlug = (slug) =>
  clone(readDb().products.find((product) => product.slug === slug));
const getProductById = (id) =>
  clone(readDb().products.find((product) => String(product._id) === String(id)));

const createProduct = (product) => {
  const db = readDb();
  const record = withMeta(product);
  db.products.push(record);
  writeDb(db);
  return clone(record);
};

const updateProduct = (id, updates) => {
  const db = readDb();
  const index = db.products.findIndex((product) => String(product._id) === String(id));
  if (index === -1) return null;
  db.products[index] = {
    ...db.products[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);
  return clone(db.products[index]);
};

const deleteProduct = (id) => {
  const db = readDb();
  const index = db.products.findIndex((product) => String(product._id) === String(id));
  if (index === -1) return false;
  db.products.splice(index, 1);
  writeDb(db);
  return true;
};

const findUserByEmail = (email) =>
  clone(readDb().users.find((user) => user.email === String(email).toLowerCase()));
const findUserById = (id) =>
  clone(readDb().users.find((user) => String(user._id) === String(id)));

const createUser = (user) => {
  const db = readDb();
  const record = withMeta({
    ...user,
    email: String(user.email).toLowerCase(),
  });
  db.users.push(record);
  writeDb(db);
  return clone(record);
};

const updateUser = (id, updates) => {
  const db = readDb();
  const index = db.users.findIndex((user) => String(user._id) === String(id));
  if (index === -1) return null;
  db.users[index] = {
    ...db.users[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);
  return clone(db.users[index]);
};

const createOrder = (order) => {
  const db = readDb();
  const record = withMeta(order);
  db.orders.unshift(record);
  writeDb(db);
  return clone(record);
};

const getOrdersByUser = (userId) =>
  clone(readDb().orders.filter((order) => String(order.user) === String(userId)));
const getOrderById = (id, userId = null) =>
  clone(
    readDb().orders.find(
      (order) =>
        String(order._id) === String(id) &&
        (userId ? String(order.user) === String(userId) : true)
    )
  );
const getAllOrders = () => clone(readDb().orders);

const createBooking = (booking) => {
  const db = readDb();
  const record = withMeta(booking);
  db.bookings.unshift(record);
  writeDb(db);
  return clone(record);
};

const getBookingsByUser = (userId) =>
  clone(readDb().bookings.filter((booking) => String(booking.user) === String(userId)));
const getBookingById = (id, userId = null) =>
  clone(
    readDb().bookings.find(
      (booking) =>
        String(booking._id) === String(id) &&
        (userId ? String(booking.user) === String(userId) : true)
    )
  );
const getBookingsByProfessional = (professionalName) =>
  clone(readDb().bookings.filter((booking) => booking.professional === professionalName));
const getAllBookings = () => clone(readDb().bookings);

const updateBooking = (id, updates) => {
  const db = readDb();
  const index = db.bookings.findIndex((booking) => String(booking._id) === String(id));
  if (index === -1) return null;
  db.bookings[index] = {
    ...db.bookings[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeDb(db);
  return clone(db.bookings[index]);
};

const getCounts = () => {
  const db = readDb();
  return {
    users: db.users.length,
    products: db.products.length,
    orders: db.orders.length,
    bookings: db.bookings.length,
  };
};

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
