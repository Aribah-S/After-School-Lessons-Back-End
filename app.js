const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");

var path = require("path");
var fs = require("fs");

const app = express();

const port = 3005;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "Origin",
      "Accept",
      "X-Requested-With",
    ],
    credentials: true,
  })
);

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

    app.post("/collection/:collectionName/addMany", async (req, res) => {
      try {
        let collection = db.collection(req.params.collectionName);
        const result = await collection.insertMany(req.body);
        return res.send(result);
      } catch (err) {
        console.error("Error adding multi records to db:", err);
        return res.status(500).send("Error adding multi records to db");
      }
    });

    app.post("/collection/:collectionName/addOne", async (req, res) => {
      try {
        let collection = db.collection(req.params.collectionName);
        const result = await collection.insertOne(req.body);
        return res.send(result);
      } catch (err) {
        console.error("Error adding single record to db:", err);
        return res.status(500).send("Error adding single record to db");
      }
    });

    app.get("/collection/:collectionName", async (req, res) => {
      try {
        const collection = db.collection(req.params.collectionName);
        const items = await collection.find({}).toArray();
        return res.json(items);
      } catch (err) {
        console.error("Error fetching items:", err);
        return res.status(500).send("Error fetching items");
      }
    });

    app.put("/collection/:collectionName/update/:id", async (req, res) => {
      try {
        let collection = db.collection(req.params.collectionName);
        const filter = { _id: new ObjectId(req.params.id) };
        const updateDocument = { $set: req.body };
        const result = await collection.updateOne(filter, updateDocument);
        return res.send(result);
      } catch (err) {
        console.error("Error while trying to update record:", err);
        return res.status(500).send("Error while trying to update record");
      }
    });

    app.use(function (req, res) {
      res.status(404);
      res.send("Path not found!");
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
