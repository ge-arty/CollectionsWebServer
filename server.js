const express = require("express");
const dbConnect = require("./configs/dbConnect.js");
const authRoutes = require("./router/router.js");

// Set up Express.js app
const app = express();
app.use(express.json());
const PORT = process.env.PORT;

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
