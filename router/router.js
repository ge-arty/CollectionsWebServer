const {
  registerUser,
  getUsers,
  userLogin,
  userLogout,
  createCollection,
  getUser,
  getAllUsers,
  deleteCollection,
} = require("../controllers/usersController");
const jwtMiddleware = require("../middlewares/jwtMiddleware");
const express = require("express");

const authRoutes = express.Router();

// Register route
authRoutes.post("/register", registerUser);
// User Login
authRoutes.post("/login", userLogin);
// Get User route
authRoutes.get("/user/:id", jwtMiddleware, getUser);

// Create User collection
authRoutes.post("/createCollection", jwtMiddleware, createCollection);

// Remove Collection
authRoutes.delete("collection/:id", jwtMiddleware, deleteCollection);
// -----------------------
// Get All Users route
authRoutes.get("/users", getAllUsers);

// User Logout
authRoutes.put("/logout/:id", jwtMiddleware, userLogout);

module.exports = authRoutes;
