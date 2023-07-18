const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const expressAsyncHandler = require("express-async-handler");
const validateMongoId = require("../utils/validateMongoId");
const generateToken = require("../configs/JWTtoken");
const mongoose = require("mongoose");
const upload = require("../configs/cloudinary");

// Register User
const registerUser = expressAsyncHandler(async (req, res) => {
  const { email, username, password } = req.body;
  const userExist = await User.findOne({ email });
  const message = userExist ? "User already exists" : "Registered successfully";
  const current = !userExist;

  if (!userExist) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
      });
      res.json({ user, current, message });
    } catch (error) {
      return res.status(400).json(error.errors);
    }
  } else {
    res.status(400).json({ current, message });
  }
});

// Login
const userLogin = expressAsyncHandler(async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  try {
    const userFound = await User.findOne({ email });
    if (!userFound) {
      res.status(401);
      throw new Error("Account doesn't exist");
    }
    const isPasswordMatched = await userFound.isPasswordMatched(password);
    if (isPasswordMatched) {
      await userFound.save();

      // Generating Token
      const token = generateToken(userFound._id);

      // Cookie HttpOnly
      res.cookie("token", token, { httpOnly: true });
      res.json({
        _id: userFound._id,
        firstName: userFound.firstName,
        lastName: userFound.lastName,
        email: userFound.email,
        password: userFound.password,
        online: userFound.online,
        admin: userFound.admin,
        createdAt: userFound.createdAt,
        token: token,
      });
    } else {
      res.status(401);
      throw new Error("Login failed, incorrect password");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get User By Id
const getUser = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  validateMongoId(id);
  try {
    const myProfile = await User.findById(id);
    res.json(myProfile);
  } catch (error) {
    res.json(error);
  }
});

// createCollection
const createCollection = expressAsyncHandler(async (req, res) => {
  try {
    const data = req.body;
    if (!data) {
      return res.status(400).json({ error: "Not enough info about User!" });
    }
    const user = await User.findById(data.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }
    const result = await upload(data.image);
    if (!result || !result.secure_url) {
      return res.status(500).json({ error: "Failed to upload image!" });
    }
    data.image = result.secure_url;
    user.collections.push(data);
    await user.save();
    return res.status(201).json({
      collection: user.collections[user.collections.length - 1],
      message: "Collection has been created!",
    });
  } catch (error) {
    console.error("Failed to create Collection!:", error);
    return res.status(500).json({ error: "Server internal error!" });
  }
});
// Remove Collection
const deleteCollection = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.body.userId;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    const collection = user.collections.id(id);
    if (!collection) {
      return res.status(404).json({ error: "Collection not found!" });
    }

    collection.remove();
    await user.save();

    return res.status(200).json({ message: "Collection has been deleted!" });
  } catch (error) {
    console.error("Failed to delete Collection:", error);
    const statusCode = error.statusCode || 500;
    const errorMsg = error.message || "Server internal error!";
    return res.status(statusCode).json({ error: errorMsg });
  }
});

// ------------------------------------------

// Get All Users
const getAllUsers = expressAsyncHandler(async (req, res) => {
  try {
    const allUsers = await User.find({});
    res.json(allUsers);
  } catch (error) {
    res.json(error);
  }
});

module.exports = {
  registerUser,
  getAllUsers,
  getUser,
  userLogin,

  createCollection,
  deleteCollection,
};
