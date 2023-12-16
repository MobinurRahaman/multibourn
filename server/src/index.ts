import dotenv from "dotenv";
dotenv.config(); // load .env variables

import express from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import connectToDB from "./config/db";

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(bodyParser.json());
app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Connect to MongoDB
connectToDB();

// Use routes
app.get("/api/v1/", (req, res) => {
  res.send("Welcome to Multibourn API");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Multibourn server is running on port ${PORT}`);
});
