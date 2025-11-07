// Gallery model for storing uploaded images (group-specific)
import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    publicId: {
        type: String,
        required: true
    },
    groupId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
gallerySchema.index({ groupId: 1, createdAt: -1 });

export const Gallery = mongoose.model("Gallery", gallerySchema);
