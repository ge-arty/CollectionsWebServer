const {
  registerUser,
  getUsers,
  userLogin,
  userLogout,
} = require("../controllers/usersController");
const express = require("express");

const authRoutes = express.Router();

// Register route
authRoutes.post("/register", registerUser);
// GetUsers route
authRoutes.get("/users", getUsers);
// User Login
authRoutes.post("/login", userLogin);
// User Logout
authRoutes.get("/logout", userLogout);

module.exports = authRoutes;
