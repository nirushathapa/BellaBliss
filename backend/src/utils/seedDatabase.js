const { isFileStoreEnabled, seedFileStore } = require("./fileStore");
const User = require("../models/User");
const Product = require("../models/Product");
const seedProducts = require("../data/seedProducts");
const createSeedUsers = require("../data/seedUsers");

const seedDatabase = async () => {
  if (isFileStoreEnabled()) {
    await seedFileStore();
    console.log("Seeded local file store");
    return;
  }

  const productCount = await Product.countDocuments();
  const userCount = await User.countDocuments();

  if (productCount > 0) {
    if (userCount > 0) {
      return;
    }
  }

  if (productCount === 0) {
    await Product.insertMany(seedProducts);
    console.log("Seeded default products");
  }

  if (userCount === 0) {
    await User.insertMany(await createSeedUsers());
    console.log("Seeded default users");
  }
};

module.exports = seedDatabase;
