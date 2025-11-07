# Image Upload Troubleshooting Guide

## Quick Diagnosis

Run this test script to check your Cloudinary configuration:

```bash
cd server
node test-cloudinary.js
```

This will tell you exactly what's wrong with your setup.

---

## Common Issues & Solutions

### Issue 1: "❌ Missing required Cloudinary environment variables"

**Problem**: Your `.env` file doesn't have Cloudinary credentials.

**Solution**:
1. Open `server/.env` file
2. Add these lines (replace with your actual values):
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

**How to get credentials**:
1. Go to https://cloudinary.com/console
2. Sign up or login
3. On the dashboard, you'll see:
   - **Cloud Name**: At the top (e.g., "dxxxxxxx")
   - **API Key**: Below cloud name (e.g., "123456789012345")
   - **API Secret**: Click "Show" button to reveal it

---

### Issue 2: "Internal Server Error" when uploading

**Possible causes**:

#### A) Cloudinary credentials are wrong
- Double-check you copied them correctly
- No extra spaces or quotes
- Cloud name should NOT include "cloudinary://"

#### B) Cloudinary account issue
- Your free tier might be exhausted
- Account might be suspended
- Check your Cloudinary dashboard for alerts

#### C) File is too large
- Current limit: 5MB per file
- Free Cloudinary tier: 10MB max
- Solution: Resize image before uploading

---

### Issue 3: "Invalid file type"

**Problem**: File type not allowed.

**Allowed types**:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

**Solution**: Convert your image to one of these formats.

---

## Step-by-Step Fix

### Step 1: Verify .env file

Open `server/.env` and check:

```env
# Should look like this (with your actual values):
CLOUDINARY_CLOUD_NAME=dxxxxxxx
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz
```

**Common mistakes**:
- ❌ `CLOUDINARY_CLOUD_NAME="dxxxxxxx"` (don't use quotes)
- ❌ `CLOUDINARY_CLOUD_NAME = dxxxxxxx` (no spaces around =)
- ❌ Missing one of the three variables

### Step 2: Run test script

```bash
cd server
node test-cloudinary.js
```

**Expected output**:
```
🔍 Testing Cloudinary Configuration...

Environment Variables:
├─ CLOUDINARY_CLOUD_NAME: ✅ SET
├─ CLOUDINARY_API_KEY: ✅ SET
└─ CLOUDINARY_API_SECRET: ✅ SET

📋 Cloudinary Config Object:
├─ cloud_name: dxxxxxxx
├─ api_key: ✅ SET
└─ api_secret: ✅ SET

🌐 Testing Cloudinary API Connection...
✅ SUCCESS: Cloudinary connection working!
```

### Step 3: Restart server

After fixing `.env`, you MUST restart the server:

```bash
# Stop the server (Ctrl+C)
# Start it again
npm run dev
```

### Step 4: Check server logs

When the server starts, look for:
```
✅ Cloudinary configuration loaded successfully
✅ Multer: Cloudinary configuration validated
```

If you see:
```
❌ Missing required Cloudinary environment variables
❌ CRITICAL: Cloudinary not configured properly!
```

Go back to Step 1.

### Step 5: Test upload

1. Go to your app
2. Open browser console (F12 → Console)
3. Try uploading an image
4. Check console for detailed error messages

---

## Error Messages Explained

### Backend Errors (check server terminal)

```
❌ Missing required Cloudinary environment variables: CLOUDINARY_CLOUD_NAME
```
→ Add `CLOUDINARY_CLOUD_NAME` to your `.env` file

```
❌ CRITICAL: Cloudinary not configured properly!
```
→ One or more env vars are missing or empty

```
❌ Invalid file type: image/gif
```
→ Upload only JPG, PNG, or WebP files

```
MulterError: File too large
```
→ File exceeds 5MB limit

### Frontend Errors (check browser console)

```
Upload error details: { status: 500, message: "Internal Server Error" }
```
→ Check server logs for the actual error

```
Upload error details: { status: 400, message: "No image file provided" }
```
→ File not attached properly. Check your upload component.

```
Upload error details: { status: 400, message: "Group ID is required" }
```
→ groupId not being sent. Check your upload function.

```
Upload error details: { status: 403, message: "You are not a member of this group" }
```
→ User not a member. Join the group first.

---

## Still Not Working?

### Debug Checklist:

1. **Server .env file**:
   ```bash
   # In server directory
   cat .env | grep CLOUDINARY
   ```
   Should show all three variables.

2. **Server is using .env**:
   - Make sure `dotenv` package is installed
   - Check that `dotenv.config()` is at the top of your server files

3. **Cloudinary account is active**:
   - Login to Cloudinary dashboard
   - Check for any warnings or errors
   - Verify you haven't exceeded free tier limits

4. **Test with curl** (to isolate frontend issues):
   ```bash
   curl -X POST http://localhost:5000/api/gallery/upload \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "image=@/path/to/test-image.jpg" \
     -F "groupId=YOUR_GROUP_ID"
   ```

5. **Check network tab**:
   - F12 → Network tab
   - Try upload
   - Click on the failed request
   - Check:
     - Request Headers (is Authorization header present?)
     - Request Payload (is image and groupId present?)
     - Response (what's the actual error?)

---

## Production Deployment

For Render/Railway/Heroku:

1. **Add environment variables** in your hosting dashboard:
   ```
   CLOUDINARY_CLOUD_NAME=your_value
   CLOUDINARY_API_KEY=your_value
   CLOUDINARY_API_SECRET=your_value
   ```

2. **Restart the service** after adding env vars

3. **Check deployment logs** for:
   ```
   ✅ Cloudinary configuration loaded successfully
   ```

---

## Get Help

If still stuck, provide:
1. Output of `node test-cloudinary.js`
2. Server startup logs (first 20 lines)
3. Error message from browser console
4. Error message from server logs when upload fails
5. Network tab screenshot of failed upload request
