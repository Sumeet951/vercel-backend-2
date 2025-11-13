import app from "./app.js";
import databaseconnect from "./config/dbConnection.js";
const PORT = process.env.PORT || 3000;
const startServer = async () => {
  try {
    await databaseconnect();
    app.listen(PORT, () => console.log("Server started"));
  } catch (err) {
    console.log("DB Error", err);
  }
};

startServer();
