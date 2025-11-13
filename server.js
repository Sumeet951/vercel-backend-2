import app from "./app.js";
import databaseconnect from "./config/dbConnection.js";

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await databaseconnect();  // ✔ Connect MongoDB first

    app.listen(PORT, () => {
      console.log(`App is running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to connect to DB", error);
    process.exit(1);
  }
};

startServer();
