const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res
    .status(200)
    .json({ message: "hello world from the express server", app: "Natours" });
});

app.post("/", (req, res) => {
  res.end("You can post to this endpoint...");
});

const port = 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}, http://127.0.0.1:${port}`);
});
