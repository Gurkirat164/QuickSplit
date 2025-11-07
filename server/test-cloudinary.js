// Test script to verify Cloudinary configuration
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

console.log("\n🔍 Testing Cloudinary Configuration...\n");

// Check environment variables
console.log("Environment Variables:");
console.log("├─ CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME ? "✅ SET" : "❌ MISSING");
console.log("├─ CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? "✅ SET" : "❌ MISSING");
console.log("└─ CLOUDINARY_API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "✅ SET" : "❌ MISSING");

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log("\n📋 Cloudinary Config Object:");
const config = cloudinary.config();
console.log("├─ cloud_name:", config.cloud_name || "❌ NOT SET");
console.log("├─ api_key:", config.api_key ? "✅ SET" : "❌ NOT SET");
console.log("└─ api_secret:", config.api_secret ? "✅ SET" : "❌ NOT SET");

// Test API connection
console.log("\n🌐 Testing Cloudinary API Connection...");

try {
    const result = await cloudinary.api.ping();
    console.log("✅ SUCCESS: Cloudinary connection working!");
    console.log("   Response:", result);
} catch (error) {
    console.error("❌ FAILED: Cannot connect to Cloudinary");
    console.error("   Error:", error.message);
    console.error("\n💡 Troubleshooting:");
    console.error("   1. Check your .env file in the server directory");
    console.error("   2. Verify your Cloudinary credentials at https://cloudinary.com/console");
    console.error("   3. Make sure there are no typos in your environment variable names");
    console.error("   4. Restart your server after updating .env");
}

console.log("\n");
