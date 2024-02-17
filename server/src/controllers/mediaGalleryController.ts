import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import path from "path";
import asyncHandler from "express-async-handler";
import MediaGallery, { IMediaGallery } from "../models/mediaGalleryModel";
import { CustomRequest } from "../middlewares/mediaUploadMiddleware";
import deleteFile from "../utils/deleteFile";

interface IMediaGalleryController {
  createMedia: (req: CustomRequest, res: Response, next: NextFunction) => void;
  getAllMedia: (req: Request, res: Response, next: NextFunction) => void;
  getMediaById: (req: Request, res: Response, next: NextFunction) => void;
  updateMediaById: (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => void;
}

const mediaGalleryController: IMediaGalleryController = {
  // Create a new media
  createMedia: asyncHandler(async (req, res, next) => {
    try {
      const { title, description, altText, caption } = req.body;
      // Destructure file-related information from the custom request set in the media upload middleware
      const { uploadedFileName, uploadedFilePath, uploadedFileMediaType } =
        req as CustomRequest;

      const newMedia: IMediaGallery = new MediaGallery({
        title: title || uploadedFileName, // Use the provided title, else use the uploaded file name
        description,
        altText,
        caption,
        path: uploadedFilePath,
        mediaType: uploadedFileMediaType,
      });

      await newMedia.save();

      res
        .status(201)
        .json({ status: "success", message: "Media created successfully" });
    } catch (error) {
      // Pass any caught errors to the error middleware
      next(error);
    }
  }),

  // Get all media items
  getAllMedia: asyncHandler(async (req, res, next) => {
    try {
      const allMedia = await MediaGallery.find();
      res.status(200).json(allMedia);
    } catch (error) {
      next(error);
    }
  }),

  // Get a specific media item by ID
  getMediaById: asyncHandler(async (req, res, next) => {
    try {
      const mediaId = req.params.id;

      const isValidObjectId = mongoose.Types.ObjectId.isValid(mediaId);

      if (!isValidObjectId) {
        res.status(404);
        throw new Error("No media found by the specified ID");
      }

      const media = await MediaGallery.findById(mediaId);

      if (!media) {
        res.status(404);
        throw new Error("No media found by the specified ID");
      }

      res.status(200).json(media);
    } catch (error) {
      if (error.name === "CastError") {
        res.status(404).json({ error: "Invalid media ID format" });
      } else {
        next(error);
      }
    }
  }),

  // Update a specific media item by ID
  updateMediaById: asyncHandler(async (req, res, next) => {
    try {
      const mediaId = req.params.id;
      const { title, description, altText, caption } = req.body;
      // Destructure file-related information from the custom request set in the media upload middleware
      const { uploadedFileName, uploadedFilePath, uploadedFileMediaType } =
        req as CustomRequest;

      const isValidObjectId = mongoose.Types.ObjectId.isValid(mediaId);

      if (!isValidObjectId) {
        res.status(404);
        throw new Error("No media found by the specified ID");
      }

      const previousMedia = await MediaGallery.findById(mediaId);

      const updatedMedia = await MediaGallery.findByIdAndUpdate(
        mediaId,
        {
          title: title || uploadedFileName, // Use the provided title, else use the uploaded file name
          description,
          altText,
          caption,
          path: uploadedFilePath,
          mediaType: uploadedFileMediaType,
        },
        { new: true }
      );

      if (!updatedMedia) {
        res.status(404);
        throw new Error("No media found by the specified ID");
      }

      // Delete the previous media file
      if (previousMedia?.path && previousMedia?.path !== uploadedFilePath) {
        const previousFileName = path.basename(previousMedia.path);
        await deleteFile("uploads/" + previousFileName);
      }

      res
        .status(200)
        .json({ status: "success", message: "Media updated successfully" });
    } catch (error) {
      const { uploadedFileName } = req as CustomRequest;

      // Delete the current media file if any error occurs
      if (uploadedFileName) {
        await deleteFile("uploads/" + uploadedFileName);
      }

      if (error.name === "MongoServerError" && error.code === 11000) {
        // Duplicate key error
        throw new Error(
          "Unexpected error occurred on the server. Please rename the media file and upload it again. Try to give it a unique name."
        );
      }

      next(error);
    }
  }),
};

export default mediaGalleryController;
