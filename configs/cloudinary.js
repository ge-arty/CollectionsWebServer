const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dbfpdhvwk",
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log(cloudinary.config);
