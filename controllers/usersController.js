const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const generateToken = require("../configs/JWTtoken");

// Register User Api
const registerUser = async (req, res) => {
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
};

// Get Users Api
const getUsers = async (req, res) => {
  try {
    const allUsers = await User.find({});
    res.json(allUsers);
  } catch (error) {
    res.json(error);
  }
};

// Login Api
const userLogin = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  const userFound = await User.findOne({ email });
  if (!userFound) {
    res.status(401);
    throw new Error("Account doesn't exist");
  }
  const isPasswordMatched = await userFound.isPasswordMatched(password);
  if (isPasswordMatched) {
    userFound.online = true;
    await userFound.save();
    res.json({
      _id: userFound._id,
      firstName: userFound.firstName,
      lastName: userFound.lastName,
      email: userFound.email,
      password: userFound.password,
      online: userFound.online,
      admin: userFound.admin,
      createdAt: userFound.createdAt,
      token: generateToken(userFound._id),
    });
  } else {
    res.status(401);
    throw new Error("Login failed, incorrect password");
  }
};

// Logout Api
const userLogout = async (req, res) => {
  if (req.user) {
    // Update the user's online status to false
    User.findByIdAndUpdate(req.user._id, { online: false }, (err, user) => {
      if (err) {
        console.error("Error updating online status:", err);
        // Handle the error accordingly
        return res.status(500).json({ error: "Server error" });
      }
      // Logout the user from the session
      req.logout();
      return res.json({ message: "Logged out successfully" });
    });
  } else {
    // User is not logged in
    return res.status(401).json({ error: "Unauthorized" });
  }
};
// createCollection Api
const createCollection = async (req, res) => {
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
};

module.exports = {
  registerUser,
  getUsers,
  userLogin,
  userLogout,
  createCollection,
};
