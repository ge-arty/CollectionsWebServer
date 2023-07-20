const {
  registerUser,
  userLogin,
  createCollection,
  getUser,
  deleteCollection,
  createItem,
  updateItem,
  deleteItem,
  getExploreInfo,
  getCollections,
  getUsersList,
  deleteUser,
  adminControl,
  blockControl,
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
// get Collection by id
authRoutes.get("/collections", getCollections);
// Remove Collection
authRoutes.delete("/deleteCollection/:id", jwtMiddleware, deleteCollection);
// Update Item
authRoutes.put("/updateItem/:id", jwtMiddleware, updateItem);
// Create Item
authRoutes.post("/createItem/:id", jwtMiddleware, createItem);
// Delete Item
authRoutes.delete(`/deleteItem/:id`, jwtMiddleware, deleteItem);
// Latest Items and Biggest Collections
authRoutes.get(`/exploreInfo`, getExploreInfo);
// Get All Users
authRoutes.get(`/users/:id`, jwtMiddleware, getUsersList);
// Delete User
authRoutes.delete(`/deleteUser`, jwtMiddleware, deleteUser);
// Admin state control
authRoutes.put(`/admin`, jwtMiddleware, adminControl);
// Block state control
authRoutes.put(`/block`, jwtMiddleware, blockControl);
// -----------------------

module.exports = authRoutes;
