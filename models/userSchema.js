const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const customFieldSchema = new mongoose.Schema({
  key: String,
  value: mongoose.Schema.Types.Mixed,
});

const collectionItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  customFields: [customFieldSchema],
});

const collectionSchema = new mongoose.Schema({
  theme: {
    type: String,
    enum: ["Books", "Signs", "Silverware", "Others"],
  },
  name: String,
  description: String,
  image: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  items: [collectionItemSchema],
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
  online: {
    type: Boolean,
    default: false,
  },
  collections: [collectionSchema],
});

// Checking if password matches
userSchema.methods.isPasswordMatched = async function (password) {
  return bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
