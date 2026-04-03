require("dotenv").config();
const connectDb = require("./config/db");
const app = require("./app");

const PORT = process.env.PORT || 5000;
connectDb(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`API running on ${PORT}`));
  })
  .catch((error) => {
    console.error("Failed to start API:", error);
    process.exit(1);
  });
