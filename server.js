const dotenv = require("dotenv");
const mongoose = require("mongoose");
const formatError = require("./utils/formatError");

process.on("uncaughtException", (err) => {
  formatError(err);
  console.log("UNCAUGHT EXCEPTION: shutting down...");
  process.exit(1);
});

dotenv.config({ path: `${__dirname}/config.env` });

const app = require("./app");

console.log(`------------------${process.env.NODE_ENV}------------------`);

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
const server = app.listen(port, () => {
  console.log(`App running on port ${port}, http://127.0.0.1:${port}`);
});

// unhandledRejection event is emitted whenever a promise is rejected and no
// error handling is attached to the promise
process.on("unhandledRejection", (err) => {
  formatError(err);
  console.log("UNHANDLED REJECTION: shutting down...");
  server.close(() => {
    process.exit(1);
  });
});
