const mongoose = require("mongoose");
const dbUrl =
  process.env.MONGODB ||
  `mongodb+srv://georgearutinyan:Giorgi98@cluster0.w9bgwzb.mongodb.net/?retryWrites=true&w=majority`;

const dbConnect = async () => {
  try {
    mongoose.set("strictQuery", false);
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`Db is connected`);
  } catch (error) {
    console.error(`Error ${error.message}`);
  }
};

module.exports = dbConnect;
