const fs = require("fs");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Tour = require("../../models/tourModel");
const User = require("../../models/userModel");
const Review = require("../../models/reviewModel");

// the main purpose of the server.js
// 1. to start the server
// 2. to load the environment variables
// 3. to connect with database

dotenv.config({ path: `./config.env` });

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

// reading the json file
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, "utf-8"));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, "utf-8"));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, "utf-8")
);

// Import data into db
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews, { validateBeforeSave: false });
    console.log("Data successfully loaded!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete All Data from collection
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log("Data successfully deleted!");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const argument = process.argv[2];

if (argument === "--import") {
  importData();
} else if (argument === "--delete") {
  deleteData();
}
