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

// Get all media items
router.get("/", mediaGalleryController.getAllMedia);

// Get a specific media item by ID
router.get("/:id", mediaGalleryController.getMediaById);

// Update a specific media item by ID
router.put(
  "/:id",
  singleUpload,
  uploadMedia,
  mediaGalleryController.updateMediaById
);

// Delete a specific media item by ID
router.delete("/:id", mediaGalleryController.deleteMediaById);

export default router;
