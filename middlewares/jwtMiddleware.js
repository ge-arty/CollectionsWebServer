const expressAsyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/userSchema");

const authMiddleware = expressAsyncHandler(async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new Error("No token attached to the header");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const user = await User.findById(decoded?.id).select("-password");
    req.user = user;
    next();
  } catch (error) {
    throw new Error("Not authorized or token expired, please log in again");
  }
});

module.exports = authMiddleware;
