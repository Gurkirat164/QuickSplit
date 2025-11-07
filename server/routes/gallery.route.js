// Routes for gallery image uploads and retrieval (group-specific)
import { Router } from "express";
import upload from "../middleware/multer.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import {
    uploadImage,
    getGallery,
    deleteImage
} from "../controller/gallery.controller.js";

const router = Router();

// Upload image to a group (requires authentication)
router.route("/upload").post(verifyJWT, upload.single("image"), uploadImage);

// Get all gallery images for a specific group (requires authentication)
router.route("/:groupId").get(verifyJWT, getGallery);

// Delete image (requires authentication and group membership)
router.route("/image/:imageId").delete(verifyJWT, deleteImage);

export default router;
