const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

var path = require("path");
var fs = require("fs");

const app = express();

const port = 3005;

const url =
  "mongodb+srv://aribahshasmeen:fullstack@cluster0.ghnuw.mongodb.net/";
const dbName = "afterSchoolLessons";

let db;

app.use(express.json());

app.use(function (req, res, next) {
  console.log("Request IP: " + req.url);
  console.log("Request Body: " + JSON.stringify(req.body));
  console.log("Request date: " + new Date());
  next();
});

app.use(function (req, res, next) {
  var filePath = path.join(__dirname, "static", req.url);
  fs.stat(filePath, function (err, fileInfo) {
    if (err) {
      next();
      return;
    }
    if (fileInfo.isFile()) res.sendFile(filePath);
    else next();
  });
});

MongoClient.connect(url)
  .then((client) => {
    console.log("Connected to MongoDB");
    db = client.db(dbName);

    app.get("/", (req, res) => {
      res.send("Hello, World! MongoDB connected.");
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
