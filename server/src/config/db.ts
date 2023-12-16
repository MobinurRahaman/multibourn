import dotenv from "dotenv";
dotenv.config(); // load .env variables
import mongoose from "mongoose";

// Connect to mongoDB
const connectToDB = () => {
  try {
    const conn = mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to database");
  } catch (error) {
    console.log("Database error");
  }
};

// Export connection
export default connectToDB;
