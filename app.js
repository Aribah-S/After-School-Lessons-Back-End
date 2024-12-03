const express = require("express");

var path = require("path");
var fs = require("fs");

const app = express();

const port = 3005;


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


    
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });