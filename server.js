const dotenv = require("dotenv");
const mongoose = require("mongoose");

// the main purpose of the server.js
// 1. to start the server
// 2. to load the environment variables
// 3. to connect with database

dotenv.config({ path: `${__dirname}/config.env` });

const app = require("./app");

// CONNECT WITH DATABASE
let DB_USER = "";
let DB_PASSWORD = "";
let DB = "";
if (process.env.NODE_ENV === "development") {
  DB_USER = process.env.DATABASE_USERNAME;
  DB_PASSWORD = process.env.DATABASE_PASSWORD;
  DB = process.env.LOCAL_DB_CONNECTION_STRING;
} else {
  DB_USER = process.env.REMOTE_DATABASE_USERNAME;
  DB_PASSWORD = process.env.REMOTE_DATABASE_PASSWORD;
  DB = process.env.REMOTE_DB_CONNECTION_STRING;
}

DB = DB.replace("<user>", DB_USER).replace("<password>", DB_PASSWORD);
mongoose.connect(DB).then(() => console.log("DB Connections successfully"));

// START THE SERVER
const port = process.env.PORt || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}, http://127.0.0.1:${port}`);
});
