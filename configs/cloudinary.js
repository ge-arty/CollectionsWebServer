const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: "dbfpdhvwk",
  api_key: "94uudFSwJRlq7E7TEygxUA1S3t8",
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log(cloudinary.config);
