const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const expressAsyncHandler = require("express-async-handler");
const generateToken = require("../configs/JWTtoken");

// Register User Api
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

// Get Users Api
const getUsers = expressAsyncHandler(async (req, res) => {
  try {
    const allUsers = await User.find({});
    res.json(allUsers);
  } catch (error) {
    res.json(error);
  }
});

// Login Api
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

// Logout Api
const userLogout = expressAsyncHandler(async (req, res) => {
  const id = req.body;
  if (id) {
    try {
      await User.findByIdAndUpdate(id, { online: false });
      return res.json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Error updating online status:", error);
      return res.status(500).json({ error: "Server error" });
    }
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
});
// createCollection Api
const createCollection = expressAsyncHandler(async (req, res) => {
  try {
    const { theme, name, description, image } = req.body;

    if (!theme || !name || !description) {
      return res
        .status(400)
        .json({ message: "Необходимо заполнить все обязательные поля" });
    }

    const userId = req.user.id;

    const newCollection = {
      theme,
      name,
      description,
      image,
      items: [],
      comments: [],
      likes: [],
      user: userId,
    };

    const user = await User.findById(userId);
    user.collections.push(newCollection);
    await user.save();

    res.status(201).json(newCollection);
  } catch (error) {
    console.error("Ошибка при создании коллекции:", error);
    res
      .status(500)
      .json({ message: "Произошла ошибка при создании коллекции" });
  }
});

module.exports = {
  registerUser,
  getUsers,
  userLogin,
  userLogout,
  createCollection,
};
