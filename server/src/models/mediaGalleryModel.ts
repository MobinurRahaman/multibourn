import mongoose, { Document, Schema } from "mongoose";

enum MediaType {
  IMAGE = "image",
  VIDEO = "video",
}

export interface IMediaGallery extends Document {
  title: string;
  path: string;
  description: string;
  altText: string;
  caption: string;
  mediaType: MediaType;
}

const mediaGallerySchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    path: {
      type: String,
      required: [true, "Path is required"],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    altText: {
      type: String,
      trim: true,
    },
    caption: {
      type: String,
      trim: true,
    },
    mediaType: {
      type: String,
      enum: [MediaType.IMAGE, MediaType.VIDEO],
      required: [true, "Media Type is required"],
    },
  },
  { timestamps: true }
);

const MediaGallery = mongoose.model<IMediaGallery>(
  "MediaGallery",
  mediaGallerySchema
);

export default MediaGallery;
