# QuickSplit Gallery Feature 🖼️

## Overview
The Gallery feature allows authenticated users to upload, view, and delete images (trip photos, receipts, etc.) with cloud storage via Cloudinary.

## Features
- ✅ Upload images to Cloudinary
- ✅ Store image URLs in MongoDB
- ✅ View all uploaded images
- ✅ Delete owned images
- ✅ Secure authentication required
- ✅ Automatic image optimization

## API Endpoints

### 1. Upload Image
**POST** `/api/gallery/upload`

**Headers:**
- `Authorization: Bearer {accessToken}`
- `Content-Type: multipart/form-data`

**Body (form-data):**
- `image`: File (jpg, jpeg, png, webp)

**Success Response (201):**
```json
{
  "payload": {
    "_id": "64abc123...",
    "url": "https://res.cloudinary.com/.../image.jpg",
    "publicId": "QuickSplitGallery/abc123",
    "uploadedBy": {
      "_id": "64xyz...",
      "name": "John Doe",
      "email": "john@example.com",
      "username": "johndoe"
    },
    "createdAt": "2025-11-07T10:30:00.000Z"
  },
  "statusCode": 201,
  "message": "Image uploaded successfully",
  "success": true
}
```

---

### 2. Get All Images
**GET** `/api/gallery`

**Headers:**
- `Authorization: Bearer {accessToken}`

**Success Response (200):**
```json
{
  "payload": [
    {
      "_id": "64abc123...",
      "url": "https://res.cloudinary.com/.../image.jpg",
      "publicId": "QuickSplitGallery/abc123",
      "uploadedBy": {
        "_id": "64xyz...",
        "name": "John Doe",
        "email": "john@example.com",
        "username": "johndoe"
      },
      "createdAt": "2025-11-07T10:30:00.000Z"
    }
  ],
  "statusCode": 200,
  "message": "Gallery images fetched successfully",
  "success": true
}
```

---

### 3. Delete Image
**DELETE** `/api/gallery/:imageId`

**Headers:**
- `Authorization: Bearer {accessToken}`

**URL Parameters:**
- `imageId`: MongoDB ObjectId of the image

**Success Response (200):**
```json
{
  "payload": null,
  "statusCode": 200,
  "message": "Image deleted successfully",
  "success": true
}
```

**Error Response (403):**
```json
{
  "payload": null,
  "statusCode": 403,
  "message": "You are not authorized to delete this image",
  "success": false
}
```

---

## Environment Variables Required

Add these to your `.env` file:

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**How to get Cloudinary credentials:**
1. Sign up at https://cloudinary.com
2. Go to Dashboard
3. Copy Cloud Name, API Key, and API Secret

---

## File Structure

```
server/
├── config/
│   └── cloudinary.js          # Cloudinary configuration
├── controller/
│   └── gallery.controller.js  # Gallery business logic
├── middleware/
│   └── multer.js              # File upload middleware
├── models/
│   └── gallery.model.js       # Gallery MongoDB schema
└── routes/
    └── gallery.route.js       # Gallery API routes
```

---

## Usage Examples

### Frontend - Upload Image (React/JavaScript)

```javascript
import axios from 'axios';

const uploadImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  try {
    const response = await axios.post(
      'http://localhost:5000/api/gallery/upload',
      formData,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    console.log('Uploaded:', response.data);
  } catch (error) {
    console.error('Upload failed:', error.response.data);
  }
};

// Usage
const handleFileChange = (event) => {
  const file = event.target.files[0];
  uploadImage(file);
};
```

### Frontend - Get Gallery

```javascript
const fetchGallery = async () => {
  try {
    const response = await axios.get(
      'http://localhost:5000/api/gallery',
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    console.log('Gallery:', response.data.payload);
  } catch (error) {
    console.error('Fetch failed:', error.response.data);
  }
};
```

### Frontend - Delete Image

```javascript
const deleteImage = async (imageId) => {
  try {
    await axios.delete(
      `http://localhost:5000/api/gallery/${imageId}`,
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    console.log('Image deleted');
  } catch (error) {
    console.error('Delete failed:', error.response.data);
  }
};
```

---

## Testing with Postman/cURL

### Upload Image
```bash
curl -X POST http://localhost:5000/api/gallery/upload \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "image=@/path/to/image.jpg"
```

### Get Gallery
```bash
curl -X GET http://localhost:5000/api/gallery \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Delete Image
```bash
curl -X DELETE http://localhost:5000/api/gallery/IMAGE_ID \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Image Specifications

- **Allowed formats:** jpg, jpeg, png, webp
- **Max dimensions:** 1000x1000 (auto-resized if larger)
- **Storage:** Cloudinary folder `QuickSplitGallery`
- **Optimization:** Automatic compression and optimization

---

## Security Features

- ✅ JWT authentication required for all endpoints
- ✅ Users can only delete their own images
- ✅ File type validation (images only)
- ✅ Secure Cloudinary storage with API keys

---

## Troubleshooting

### Error: "No image file provided"
- Make sure you're sending the file as `multipart/form-data`
- Field name must be `image`

### Error: "Unauthorized request"
- Check if you're sending a valid JWT token in the Authorization header
- Ensure the token hasn't expired

### Error: Cloudinary upload fails
- Verify your `.env` has correct Cloudinary credentials
- Check if your Cloudinary account is active and has available storage

---

## Future Enhancements

- [ ] Add image captions/descriptions
- [ ] Link images to specific groups or expenses
- [ ] Image compression options
- [ ] Bulk upload support
- [ ] Image tagging and search
- [ ] Public/private image visibility
- [ ] Image thumbnails generation

---

## Notes

- All images are stored in the `QuickSplitGallery` folder on Cloudinary
- Images are automatically optimized for web delivery
- The `publicId` field stores the Cloudinary identifier for deletion
- Images are sorted by upload date (most recent first)
