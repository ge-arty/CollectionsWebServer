const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const expressAsyncHandler = require("express-async-handler");
const validateMongoId = require("../utils/validateMongoId");
const generateToken = require("../configs/JWTtoken");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

// Register User
const registerUser = expressAsyncHandler(async (req, res) => {
  const { email, firstName, lastName, password } = req.body;
  const userExist = await User.findOne({ email });
  const message = userExist ? "User already exists" : "Registered successfully";
  const current = !userExist;

  if (!userExist) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        firstName,
        lastName,
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

// Get All Users
const getUsers = expressAsyncHandler(async (req, res) => {
  try {
    const allUsers = await User.find({});
    res.json(allUsers);
  } catch (error) {
    res.json(error);
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
      userFound.online = true;
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

// Logout
const userLogout = expressAsyncHandler(async (req, res) => {
  const idString = req.params.id;
  var ObjectId = mongoose.Types.ObjectId;
  const _id = new ObjectId(idString);
  validateMongoId(_id);
  const { online } = req.body;
  const userOff = await User.findByIdAndUpdate(
    _id,
    { online },
    { new: true, runValidators: true }
  );
  res.json(userOff);
});

// createCollection
createCollection = expressAsyncHandler(async (req, res) => {
  try {
    const { userId, formData } = req.body;
    console.log(userId, formData);
    if (!userId || !formData) {
      return res.status(400).json({ error: "Not enough info about User!" });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    const result = await cloudinary.uploader.upload(formData.image.path); // Assuming formData.image is the file object

    formData.image = result.secure_url;

    user.collections.push(formData);
    await user.save();
    return res.status(201).json({ message: "Collection has been created!" });
  } catch (error) {
    console.error("Failed to create Collection!:", error);
    return res.status(500).json({ error: "Server internal error!" });
  }
});

module.exports = {
  registerUser,
  getUsers,
  getUser,
  userLogin,
  userLogout,
  createCollection,
};
