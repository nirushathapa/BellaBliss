const { seedFileStore } = require("./fileStore");

const seedDatabase = async () => {
  await seedFileStore();
  console.log("Seeded SQLite database");
};

module.exports = seedDatabase;
