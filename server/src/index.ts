import dotenv from "dotenv";
dotenv.config(); // load .env variables

import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import cors from "cors";
import connectToDB from "./config/db";
import { notFound, errorHandler } from "./middlewares/errorMiddleware";

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(cookieParser());

// Enable logging in the development environment
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// EJS setup
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

// Connect to MongoDB
connectToDB();

// Load routes
import siteRoutes from "./routes/siteRoutes";
import mediaGalleryRoutes from "./routes/mediGalleryRoutes";

// Use routes
app.get("/api/v1/", (req, res) => {
  res.send("Welcome to Multibourn API");
});
app.use("/api/v1/site", siteRoutes);
app.use("/api/v1/mediagallery", mediaGalleryRoutes);

// Use error middleware
app.use(notFound);
app.use(errorHandler);

// Start the server
app.listen(PORT, () => {
  console.log(`Multibourn server is running on port ${PORT}`);
});
