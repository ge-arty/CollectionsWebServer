const {
  registerUser,
  userLogin,
  createCollection,
  getUser,
  deleteCollection,
  createItem,
  updateItem,
  deleteItem,
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
authRoutes.delete("/deleteCollection/:id", jwtMiddleware, deleteCollection);
// getCollections
authRoutes.put("/updateItem/:id", jwtMiddleware, updateItem);
// Create Item
authRoutes.post("/createItem/:id", jwtMiddleware, createItem);
// Delete Item
authRoutes.delete(`/deleteItem/:id`, jwtMiddleware, deleteItem);
// -----------------------

module.exports = authRoutes;
