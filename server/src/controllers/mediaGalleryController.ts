import { NextFunction, Request, Response } from "express";
import asyncHandler from "express-async-handler";
import MediaGallery, { IMediaGallery } from "../models/mediaGalleryModel";
import { CustomRequest } from "../middlewares/mediaUploadMiddleware";

interface IMediaGalleryController {
  createMedia: (req: CustomRequest, res: Response, next: NextFunction) => void;
  getAllMedia: (req: Request, res: Response, next: NextFunction) => void;
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
};

export default mediaGalleryController;
