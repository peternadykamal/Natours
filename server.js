const app = require("./app");

// the main purpose of the server.js
// 1. to start the server

// START THE SERVER
const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}, http://127.0.0.1:${port}`);
});
