const express = require("express");
const dotenv = require("dotenv").config();
const dbConnect = require("./configs/dbConnect.js");
const authRoutes = require("./router/router.js");
const bodyParser = require("body-parser");
const cors = require("cors");
const PORT = process.env.PORT;
// Set up Express.js app
const app = express();
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
app.use(cors());

app.use("/", authRoutes);

// Connecting to MongoDB database
dbConnect()
  .then(() => {
    // Starting the server
    app.listen(PORT, () => {
      console.log(`Server listening at ${PORT} port`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB", error);
  });
