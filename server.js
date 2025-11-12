import app from "./app.js";
import databaseconnect from "./config/dbConnection.js";
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  await databaseconnect();
  console.log(`App is running at http://localhost:${PORT}`);
})