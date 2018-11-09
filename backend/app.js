const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const userRoutes = require("./routes/user");
const actionRoutes = require("./routes/action");
const pageSetRoutes = require("./routes/page-set");
const pageRoutes = require("./routes/pageRoute");
const messageRoutes = require('./routes/message');

const app = express();

const mongodbServer = require('../.settings/mongodbServer');

mongoose
  .connect(
    mongodbServer.mongodbServer
  )
  .then(() => {
    console.log("Connected to database!");
  })
  .catch(() => {
    console.log("Connection failed!");
  });

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, PUT, DELETE, OPTIONS"
  );
  next();
});

app.use("/api/user", userRoutes);
app.use("/api/action", actionRoutes);
app.use("/api/pages", pageSetRoutes);
app.use("/api/page", pageRoutes);
app.use("/api/message", messageRoutes);

module.exports = app;