const app = require("./src/app");
require("dotenv").config();
const connectDB = require("./src/db/db");

app.listen(3000, () => {
    connectDB();
    console.log("Server is running on port 3000");
});