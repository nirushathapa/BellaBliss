require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const seedDatabase = require("./utils/seedDatabase");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const dbInfo = await connectDB();
    await seedDatabase();
    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
      if (dbInfo?.driver === "sqlite") {
        console.log(`Database driver: ${dbInfo.driver} (${dbInfo.file})`);
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
