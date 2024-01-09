import multer, { FileFilterCallback } from "multer";
import { Request, Response, NextFunction } from "express";
import fs from "fs/promises";
import path from "path";

const storage = multer.memoryStorage();

// Multer file filter callback
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback
) => {
  // Define an array of allowed MIME types for uploaded files
  // Images: JPEG, PNG, WebP
  // Videos: MP4, WebM
  const allowedMimeTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
  ];

  // Check if the file's MIME type is allowed
  if (allowedMimeTypes.includes(file.mimetype)) {
    callback(null, true); // Accept the file
  } else {
    callback(
      new Error(
        "Unsupported file type. Only JPEG, PNG, WebP, MP4, and WebM are allowed."
      )
    ); // Reject the file with an error
  }
};

const uploadPath = "uploads";

// Check if a file exists asynchronously
const checkIfFileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    return false;
  }
};

// Generate a unique file name asynchronously
const generateUniqueFileName = async (
  originalname: string
): Promise<string> => {
  let newFileName = originalname;
  let counter = 1;

  // Keep generating a new name until a unique one is found
  while (await checkIfFileExists(path.join(uploadPath, newFileName))) {
    const fileNameWithoutExtension = path.basename(
      originalname,
      path.extname(originalname)
    );
    const numberedFileName = `${fileNameWithoutExtension} (${counter})${path.extname(
      originalname
    )}`;
    newFileName = numberedFileName;
    counter++;
  }

  return newFileName;
};

// Custom request interface extending Express Request
export interface CustomRequest extends Request {
  file: Express.Multer.File;
  uploadedFileName?: string;
  uploadedFilePath?: string;
  uploadedFileMediaType?: string;
}

// Multer middleware configuration for image uploads
const uploadImageToMediaGallery = multer({
  storage,
  fileFilter,
});

// Single file upload middleware
const singleUpload = uploadImageToMediaGallery.single("file");

// Middleware for handling media uploads
const uploadMedia = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      res.status(400);
      throw new Error("No file uploaded");
    }

    const { originalname, buffer, mimetype } = req.file;
    const newFileName = await generateUniqueFileName(originalname); // Generate a unique file name

    await fs.writeFile(path.join(uploadPath, newFileName), buffer); // Asynchronously write the file to disk

    // Determine the media type based on MIME type
    const MediaType = mimetype.startsWith("image") ? "image" : "video";
    const { protocol, hostname } = req;
    const isDevMode = process.env.NODE_ENV === "development";

    // Extract port from the request's 'host' header
    const port = req.get("host").split(":")[1] || "";

    // Build the base URL of the server
    const serverBaseUrl = `${protocol}://${hostname}${
      isDevMode && port ? ":" + port : ""
    }/`;

    // Set additional information of the file in the request object
    req.uploadedFileName = newFileName;
    req.uploadedFilePath = serverBaseUrl + path.join(uploadPath, newFileName); //  Full file url
    req.uploadedFileMediaType = MediaType;

    next();
  } catch (error) {
    next(error);
  }
};

export { singleUpload, uploadMedia };
