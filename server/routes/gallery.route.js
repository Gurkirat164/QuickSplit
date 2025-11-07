// Routes for gallery image uploads and retrieval (group-specific)
import { Router } from "express";
import multer from "multer";
import upload from "../middleware/multer.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    uploadImage,
    getGallery,
    deleteImage
} from "../controller/gallery.controller.js";

const router = Router();

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
    console.error("❌ Multer Error:", err);
    
    if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                payload: null,
                statusCode: 400,
                message: 'File size too large. Maximum size is 5MB.',
                success: false
            });
        }
        return res.status(400).json({
            payload: null,
            statusCode: 400,
            message: `Upload error: ${err.message}`,
            success: false
        });
    } else if (err) {
        // An unknown error occurred
        return res.status(500).json({
            payload: null,
            statusCode: 500,
            message: err.message || 'File upload failed',
            success: false
        });
    }
    next();
};

// Upload image to a group (requires authentication)
router.route("/upload").post(
    verifyJWT, 
    (req, res, next) => {
        upload.single("image")(req, res, (err) => {
            if (err) {
                return handleMulterError(err, req, res, next);
            }
            next();
        });
    },
    uploadImage
);

// Get all gallery images for a specific group (requires authentication)
router.route("/:groupId").get(verifyJWT, getGallery);

// Delete image (requires authentication and group membership)
router.route("/image/:imageId").delete(verifyJWT, deleteImage);

export default router;