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

app.use(express.json()); // middleware to use json

app.use(function (req, res, next) {
  // logging middleware
  console.log("Request IP: " + req.url);
  console.log("Request Body: " + JSON.stringify(req.body));
  console.log("Request Query Params: " + JSON.stringify(req.query));
  console.log("Request date: " + new Date());
  next();
});

app.use(function (req, res, next) {
  // static image file middleware
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

MongoClient.connect(url) // mongodb driver for node.js
  .then((client) => {
    console.log("Connected to MongoDB");
    db = client.db(dbName);

    app.get("/", (req, res) => {
      // homepage API (back-end route / )
      res.send("Hello, World! MongoDB connected.");
    });

    app.post("/collection/:collectionName/addMany", async (req, res) => {
      // addMany API for either lessons or orders or any other collection in the database
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
      // addOne API for either lessons or orders or any other collection in the database
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
      // GET API for retreiving data in any collection in database in Array structure
      try {
        const collection = db.collection(req.params.collectionName);
        const items = await collection.find({}).toArray();
        return res.json(items);
      } catch (err) {
        console.error("Error fetching items:", err);
        return res.status(500).send("Error fetching items");
      }
    });

    app.get("/collection/:collectionName/search", async (req, res) => {
      // GET API for search functionality (filters across any field in the table)
      try {
        const collection = db.collection(req.params.collectionName);

        const query = req.query.value;

        if (!query) {
          return res.status(400).json({ error: "Query parameter is required" });
        }

        const searchQuery = {};

        if (!isNaN(query)) {
          // this is to check if the query is a number
          const queryNumber = parseInt(query);
          searchQuery.$or = [
            { price: queryNumber },
            { availableInventory: queryNumber },
            { rating: queryNumber },
          ];
        } else {
          searchQuery.$or = [
            { title: { $regex: query, $options: "i" } }, //regex is for string matching and $options: "i" is for implementing case-insensitivity
            { location: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } },
          ];
        }
        const items = await collection.find(searchQuery).toArray();
        return res.json(items);
      } catch (err) {
        console.error("Error fetching items:", err);
        return res.status(500).send("Error fetching items");
      }
    });

    app.put("/collection/:collectionName/update/:id", async (req, res) => {
      // API to update a record in the collection
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
      // middleware for Page not found 404 error
      res.status(404);
      res.send("Path not found!");
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.listen(port, () => {
  // log for checking the port number when the server is running
  console.log(`Server is running on port: ${port}`);
});
