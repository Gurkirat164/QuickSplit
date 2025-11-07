// Multer middleware for handling file uploads to Cloudinary
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

// Validate Cloudinary configuration before creating storage
const validateCloudinaryConfig = () => {
    const { cloud_name, api_key, api_secret } = cloudinary.config();
    
    if (!cloud_name || !api_key || !api_secret) {
        console.error("❌ CRITICAL: Cloudinary not configured properly!");
        console.error("Missing:", {
            cloud_name: !cloud_name,
            api_key: !api_key,
            api_secret: !api_secret
        });
        throw new Error("Cloudinary configuration is incomplete. Check environment variables.");
    }
    
    console.log("✅ Multer: Cloudinary configuration validated");
    return true;
};

// Validate before creating storage
validateCloudinaryConfig();

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "QuickSplitGallery",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [{ width: 1000, height: 1000, crop: "limit" }]
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            console.error("❌ Invalid file type:", file.mimetype);
            cb(new Error(`Invalid file type. Allowed: ${allowedMimeTypes.join(', ')}`), false);
        }
    }
});

export default upload;