const {
  registerUser,
  getUsers,
  userLogin,
  userLogout,
  createCollection,
} = require("../controllers/usersController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");
const express = require("express");

const authRoutes = express.Router();

// Register route
authRoutes.post("/register", registerUser);
// GetUsers route
authRoutes.get("/users", getUsers);
// User Login
authRoutes.post("/login", userLogin);
// User Logout
authRoutes.put("/logout", jwtMiddleware, userLogout);
// Create User collection
authRoutes.post("/createCollection", jwtMiddleware, createCollection);

module.exports = authRoutes;
