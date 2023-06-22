const express = require("express");
const dotenv = require("dotenv").config();
const dbConnect = require("./configs/dbConnect.js");
const authRoutes = require("./router/router.js");
const cors = require("cors");

// Set up Express.js app
const app = express();
app.use(express.json());
const PORT = process.env.PORT;
app.use(cors());
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

app.use("/", authRoutes);
