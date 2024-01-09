import express from "express";
import {
  singleUpload,
  uploadMedia,
} from "../middlewares/mediaUploadMiddleware";
import mediaGalleryController from "../controllers/mediaGalleryController";

const router = express.Router();

// Create a new media with upload middleware
router.post(
  "/create",
  singleUpload,
  uploadMedia,
  mediaGalleryController.createMedia
);

export default router;
