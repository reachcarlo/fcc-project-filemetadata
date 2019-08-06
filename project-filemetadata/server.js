"use strict";

var express = require("express");
var cors = require("cors");
var mongoose = require("mongoose");
var mongo = require("mongodb");
var multer = require("multer");
var bodyParser = require("body-parser");
var fs = require("fs");

// require and use "multer"...

mongoose.connect(
  "mongodb+srv://carlo:NzEkYYnMjBuc@cluster0-laxez.mongodb.net/test?retryWrites=true&w=majority",
  { useNewUrlParser: true }
);

var app = express();

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now());
  }
});

var upload = multer({ storage: storage, dest: "./uploads/" });

app.use(cors());
app.use("/public", express.static(process.cwd() + "/public"));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var Schema = mongoose.Schema;

var fileSchema = new Schema({
  file: {
    data: Buffer,
    contentType: String
  },
  fieldname: String,
  originalname: String,
  encoding: String,
  mimetype: String,
  destination: String,
  filename: String,
  path: String,
  size: Number
});

var File = mongoose.model("File", fileSchema);

app.get("/", function(req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.get("/hello", function(req, res) {
  res.json({ greetings: "Hello, API" });
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Node.js listening ...");
});

app.post("/api/fileanalyse", upload.single("upfile"), function(req, res) {
  let file = new File({
    file: {
      data: fs.readFileSync(req.file.path),
      contentType: req.file.mimetype
    },
    fieldname: req.file.fieldname,
    originalname: req.file.originalname,
    encoding: req.file.encoding,
    mimetype: req.file.mimetype,
    destination: req.file.destination,
    filename: req.file.filename,
    path: req.file.path,
    size: req.file.size
  });
  file.save((err, data) => {
    if (err) res.send("Failed");
    res.json({
      name: data.fieldname,
      type: data.mimetype,
      size: data.size
    });
  });
});

// {
//   "name": "hello.txt",
//   "type": "text/plain",
//   "size": 0
// }

app.get("/file/:id", function(req, res) {
  File.findOne({ _id: req.params.id }, (err, data) => {
    if (err) res.send("No file found");
    if (data) res.send(data.file.data);
  });
});

app.get("/checkDB", function(req, res) {
  File.find()
    .then(item => {
      res.send(item);
    })
    .catch(err => {
      res.status(400).send("unable to find");
    });
});

app.get("/clearDB", function(req, res) {
  File.remove((err, data) => {
    if (err) res.send("Failed");
    res.send(data);
  });
});
