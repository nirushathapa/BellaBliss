const path = require("path");
const { setFileStoreEnabled } = require("../utils/fileStore");

const connectDB = async () => {
  setFileStoreEnabled(true);

  const dbFile = process.env.DATA_FILE
    ? path.resolve(process.cwd(), process.env.DATA_FILE)
    : path.join(__dirname, "..", "data", "blisss.sqlite");
  console.log(`Using SQLite database at ${dbFile}`);

  return {
    driver: "sqlite",
    file: dbFile,
  };
};

module.exports = connectDB;
