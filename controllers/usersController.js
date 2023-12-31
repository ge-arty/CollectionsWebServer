const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const expressAsyncHandler = require("express-async-handler");
const validateMongoId = require("../utils/validateMongoId");
const generateToken = require("../configs/JWTtoken");
const upload = require("../configs/cloudinary");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv").config();

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
  try {
    const userFound = await User.findOne({ email });
    if (!userFound) {
      res.status(401).json({ message: "Account doesn't exist" });
      return;
    }

    const isPasswordMatched = await userFound.isPasswordMatched(password);
    if (!isPasswordMatched) {
      res.status(401).json({ message: "Login failed, incorrect password" });
      return;
    }

    if (userFound.block) {
      res.status(403).json({ message: "Account is blocked" });
      return;
    }

    // Generating Token
    const token = generateToken(userFound._id);
    res.cookie("token", token, { httpOnly: true });

    const transporter = nodemailer.createTransport({
      host: "smtp.mail.ru",
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: userFound.email,
      subject: "Login Notification",
      text: "You have successfully logged in.",
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });

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
  } catch (error) {
    res.status(500).json({ message: `Error: ${error.message}` });
  }
});
// Get User By Id
const getUser = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    validateMongoId(id);

    const myProfile = await User.findById(id);
    res.json(myProfile);
  } catch (error) {
    res.json(error);
  }
});
// Get all collections
const getCollections = expressAsyncHandler(async (req, res) => {
  try {
    const users = await User.find({});
    const allCollections = users.reduce((collections, user) => {
      return collections.concat(user.collections);
    }, []);

    return res.json({ allCollections });
  } catch (error) {
    res.status(500).json({ error: "Server internal error!" });
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
  try {
    const { id } = req.params;
    const userId = req.body.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    user.collections.pull(id);
    await user.save();

    return res.status(200).json({ message: "Collection has been deleted!" });
  } catch (error) {
    console.error("Failed to delete Collection:", error);
    return res.status(500).json({ error: "Server internal error!" });
  }
});
// Create Item
const createItem = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (!data) {
      return res.status(400).json({ error: "Not enough info about item!" });
    }
    const user = await User.findById(data.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    const collection = user.collections.id(id);

    if (!collection) {
      return res
        .status(404)
        .json({ error: "Collection not found in the user's collections!" });
    }
    collection.item.push(data);

    await user.save();
    return res.status(201).json({
      message: "Collection has been created!",
    });
  } catch (error) {
    console.error("Failed to create Collection!:", error);
    return res.status(500).json({ error: "Server internal error!" });
  }
});
// Update Item
const updateItem = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    if (!data) {
      return res.status(400).json({ error: "Not enough info about item!" });
    }
    const user = await User.findById(data.userId);
    const item = user.collections
      .map((collection) => collection.item.id(id))
      .filter((item) => item !== null);
    const filteredItem = item[0];
    if (!filteredItem) {
      return res.status(404).json({ error: "Item not found!" });
    }

    filteredItem.name = data.name || filteredItem.name;
    filteredItem.date = data.date || filteredItem.date;
    filteredItem.description = data.description || filteredItem.description;

    if (data.customFields && Array.isArray(data.customFields)) {
      filteredItem.customFields = data.customFields;
    }

    // Save the updated item to the database
    const updatedItem = await user.save();

    // Return the updated item in the response
    return res.status(200).json(updatedItem);
  } catch (error) {
    console.error("Failed to update item:", error);
    return res.status(500).json({ error: "Server internal error!" });
  }
});
// Delete Item
const deleteItem = expressAsyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId, collectionId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }
    const collection = user.collections.id(collectionId);
    console.log(collection);
    collection.item.pull(id);

    await user.save();

    return res.status(200).json({ message: "Collection has been deleted!" });
  } catch (error) {
    console.error("Failed to delete Collection:", error);
    return res.status(500).json({ error: "Server internal error!" });
  }
});
// Get Explore Info
const getExploreInfo = expressAsyncHandler(async (req, res) => {
  try {
    const users = await User.find({});
    // --------------------Biggest Collections
    // Extract all collections from all users
    const allCollections = users.reduce((collections, user) => {
      return collections.concat(user.collections);
    }, []);
    // Sort collections in descending order based on their length (number of items)
    const sortedCollections = allCollections.sort(
      (a, b) => b.item.length - a.item.length
    );
    // Get the 6 biggest collections
    const biggestCollections = sortedCollections.slice(0, 6);
    // ----------------------------------------------------------------
    const allItems = allCollections.reduce((items, collection) => {
      return items.concat(collection.item);
    }, []);

    // Sort items in descending order based on their createdAt date (latest first)
    const latestItems = allItems
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    res.json({ biggestCollections, latestItems });
  } catch (error) {
    res.json(error);
  }
});
// Get Users List for Admin
const getUsersList = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.admin) {
      const users = await User.find({});
      return res.json(users);
    } else {
      return res.json(user);
    }
  } catch (err) {
    res.status(500).json({ message: `Error: ${err.message}` });
  }
});

// ----------------------- Admin methods
//  Delete User
const deleteUser = expressAsyncHandler(async (req, res) => {
  try {
    const { id } = req.body;
    await User.findByIdAndDelete(id);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Make or Remove Admin
const adminControl = expressAsyncHandler(async (req, res) => {
  try {
    const { id, admin } = req.body;
    const user = await User.findById(id);
    user.admin = !admin;
    await user.save();
    res.json({ message: "Admin status updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// Block or unBlock User
const blockControl = expressAsyncHandler(async (req, res) => {
  try {
    const { id, block } = req.body;
    const user = await User.findById(id);
    user.block = !block;
    await user.save();
    res.json({ message: "User status updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = {
  registerUser,
  getExploreInfo,
  getUser,
  userLogin,
  createItem,
  createCollection,
  deleteCollection,
  updateItem,
  deleteItem,
  getCollections,
  getUsersList,
  deleteUser,
  adminControl,
  blockControl,
};
