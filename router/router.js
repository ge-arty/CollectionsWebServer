const {
  registerUser,
  getUsers,
  userLogin,
  userLogout,
  createCollection,
  getUser,
} = require("../controllers/usersController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");
const express = require("express");

const authRoutes = express.Router();

// Register route
authRoutes.post("/register", registerUser);
// Get All Users route
authRoutes.get("/users", getUsers);
// Get User route
authRoutes.get("/user/:id", jwtMiddleware, getUser);
// User Login
authRoutes.post("/login", userLogin);
// User Logout
authRoutes.put("/logout/:id", jwtMiddleware, userLogout);
// Create User collection
authRoutes.post("/createCollection", jwtMiddleware, createCollection);

module.exports = authRoutes;
