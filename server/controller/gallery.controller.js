// Controller for handling gallery image uploads and retrieval (group-specific)
import { Gallery } from "../models/gallery.model.js";
import { Group } from "../models/groups.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Upload image to Cloudinary and save to database
export const uploadImage = asyncHandler(async (req, res) => {
    try {
        const { groupId } = req.body;

        if (!req.file) {
            throw new ApiError(400, "No image file provided");
        }

        if (!groupId) {
            throw new ApiError(400, "Group ID is required");
        }

        // Verify user is a member of the group
        const group = await Group.findById(groupId);
        if (!group) {
            throw new ApiError(404, "Group not found");
        }

        if (!group.isMember(req.user._id)) {
            throw new ApiError(403, "You are not a member of this group");
        }

        // req.file.path contains the Cloudinary URL
        // req.file.filename contains the public_id
        const newImage = new Gallery({
            url: req.file.path,
            publicId: req.file.filename,
            groupId: groupId,
            uploadedBy: req.user._id
        });

        await newImage.save();

        // Populate user details
        await newImage.populate("uploadedBy", "fullName email username");

        const imageResponse = {
            _id: newImage._id,
            url: newImage.url,
            publicId: newImage.publicId,
            groupId: newImage.groupId,
            uploadedBy: {
                _id: newImage.uploadedBy._id,
                name: newImage.uploadedBy.fullName,
                email: newImage.uploadedBy.email,
                username: newImage.uploadedBy.username
            },
            createdAt: newImage.createdAt
        };

        return res
            .status(201)
            .json(
                new ApiResponse(
                    imageResponse,
                    201,
                    "Image uploaded successfully"
                )
            );
    } catch (error) {
        console.error("Error in uploadImage:", error.message);
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    null,
                    error.statusCode || 500,
                    error.message || "Failed to upload image"
                )
            );
    }
});

// Get gallery images for a specific group
export const getGallery = asyncHandler(async (req, res) => {
    try {
        const { groupId } = req.params;

        if (!groupId) {
            throw new ApiError(400, "Group ID is required");
        }

        // Verify user is a member of the group
        const group = await Group.findById(groupId);
        if (!group) {
            throw new ApiError(404, "Group not found");
        }

        if (!group.isMember(req.user._id)) {
            throw new ApiError(403, "You are not a member of this group");
        }

        const images = await Gallery.find({ groupId })
            .populate("uploadedBy", "fullName email username")
            .sort({ createdAt: -1 }); // Most recent first

        const imagesResponse = images.map((image) => ({
            _id: image._id,
            url: image.url,
            publicId: image.publicId,
            groupId: image.groupId,
            uploadedBy: {
                _id: image.uploadedBy._id,
                name: image.uploadedBy.fullName,
                email: image.uploadedBy.email,
                username: image.uploadedBy.username
            },
            createdAt: image.createdAt
        }));

        return res
            .status(200)
            .json(
                new ApiResponse(
                    imagesResponse,
                    200,
                    "Gallery images fetched successfully"
                )
            );
    } catch (error) {
        console.error("Error in getGallery:", error.message);
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    null,
                    error.statusCode || 500,
                    error.message || "Failed to fetch gallery images"
                )
            );
    }
});

// Delete image from gallery
export const deleteImage = asyncHandler(async (req, res) => {
    try {
        const { imageId } = req.params;

        const image = await Gallery.findById(imageId).populate('groupId');

        if (!image) {
            throw new ApiError(404, "Image not found");
        }

        // Verify user is a member of the group
        if (!image.groupId.isMember(req.user._id)) {
            throw new ApiError(403, "You are not a member of this group");
        }

        // Any group member can delete images, not just the uploader
        // If you want only uploader to delete, uncomment below:
        // if (image.uploadedBy.toString() !== req.user._id.toString()) {
        //     throw new ApiError(403, "You are not authorized to delete this image");
        // }

        // Delete from Cloudinary
        const cloudinary = (await import("../config/cloudinary.js")).default;
        await cloudinary.uploader.destroy(image.publicId);

        // Delete from database
        await Gallery.findByIdAndDelete(imageId);

        return res
            .status(200)
            .json(
                new ApiResponse(
                    null,
                    200,
                    "Image deleted successfully"
                )
            );
    } catch (error) {
        console.error("Error in deleteImage:", error.message);
        return res
            .status(error.statusCode || 500)
            .json(
                new ApiResponse(
                    null,
                    error.statusCode || 500,
                    error.message || "Failed to delete image"
                )
            );
    }
});
