const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const customFieldSchema = new mongoose.Schema({
  key: String,
  value: mongoose.Schema.Types.Mixed,
});
const itemSchema = new mongoose.Schema({
  name: String,
  required: true,
  description: String,
  required: true,
  date: {
    type: Date,
    required: true,
  },
  customFields: [customFieldSchema],
});

const collectionSchema = new mongoose.Schema({
  theme: {
    type: String,
    enum: ["Books", "Stamps", "Silverware", "Coins", "Others"],
    required: true,
  },
  name: String,
  description: String,
  image: String,
  manufacturingDate: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  item: [itemSchema],
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  collections: [collectionSchema],
});

// Checking if password matches
userSchema.methods.isPasswordMatched = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
