# Render Deployment - Environment Variables Setup

## Problem
Your local `.env` has the correct `CORS_ORIGIN`, but the deployed server on Render doesn't have it set (or has an old value). This causes CORS errors from your Vercel frontend.

## Solution: Set Environment Variables on Render

### Step 1: Go to your Render Dashboard
1. Open https://dashboard.render.com
2. Select your **QuickSplit** web service (the one at `quicksplit-he1m.onrender.com`)

### Step 2: Navigate to Environment Variables
1. Click on **Environment** in the left sidebar (or scroll down to the Environment section)
2. You'll see a list of environment variables

### Step 3: Add/Update CORS_ORIGIN
Set the following environment variable:

**Key:** `CORS_ORIGIN`  
**Value:** `http://localhost:5173,https://quick-split-smoky.vercel.app`

**Important Notes:**
- Use the **exact** origin from your Vercel deployment (no trailing slash)
- Multiple origins are comma-separated with **no spaces**
- If you have multiple Vercel preview deployments, you may need to add them or use `*` temporarily (not recommended for production)

### Step 4: Add All Required Environment Variables
Make sure these are also set on Render (from your local `.env`):

| Key | Example Value | Notes |
|-----|---------------|-------|
| `PORT` | `5000` | Render usually auto-assigns; you can use `8000` or `5000` |
| `CORS_ORIGIN` | `http://localhost:5173,https://quick-split-smoky.vercel.app` | **Critical for CORS** |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB connection string |
| `ACCESS_TOKEN_SECRET` | `PsSduppyKStj` | Keep this secret! |
| `ACCESS_TOKEN_EXPIRY` | `1d` | Lowercase 'd' is standard |
| `REFRESH_TOKEN_SECRET` | `RkXJYpXyZKqf` | Keep this secret! |
| `REFRESH_TOKEN_EXPIRY` | `7d` | Lowercase 'd' is standard |
| `NODE_ENV` | `production` | Use `production` on Render, not `development` |

### Step 5: Save and Redeploy
1. Click **Save Changes** or **Add Environment Variable**
2. Render will automatically trigger a **new deployment**
3. Wait for the deployment to complete (check the **Logs** tab)

### Step 6: Verify the Fix
Once deployed, test from your browser console or with curl:

```bash
# Test preflight (OPTIONS request)
curl -i -X OPTIONS 'https://quicksplit-he1m.onrender.com/auth/login' \
  -H 'Origin: https://quick-split-smoky.vercel.app' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type'
```

**Expected Response Headers:**
```
Access-Control-Allow-Origin: https://quick-split-smoky.vercel.app
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE
Access-Control-Allow-Headers: content-type
```

If you see these headers, CORS is working! ✅

---

## Alternative: Use Wildcard (Development Only)
If you need to allow **all origins** temporarily (e.g., for testing):

**Key:** `CORS_ORIGIN`  
**Value:** `*`

⚠️ **Warning:** This is **not recommended for production** with credentials. Use specific origins for security.

---

## Troubleshooting

### Issue: Still getting CORS errors after setting env var
1. **Check Render Logs:** Look for startup errors or CORS_ORIGIN being logged
2. **Verify env var was saved:** Go to Environment tab and confirm it's there
3. **Hard refresh browser:** Clear cache or use incognito mode
4. **Check Vercel origin:** Make sure the origin matches exactly (no `/login` path)

### Issue: 500 Internal Server Error
This means CORS is now working, but the server has an application error. Check:
- MongoDB connection (is `MONGODB_URI` correct?)
- Server logs on Render for the actual error
- Request body format (email/password fields)

### Issue: Multiple Vercel deployments (preview branches)
Vercel creates unique URLs for each branch/PR. Options:
1. Add each preview URL to `CORS_ORIGIN` (comma-separated)
2. Use a wildcard pattern like `https://*.vercel.app` (requires custom CORS logic)
3. For development, temporarily use `CORS_ORIGIN=*` and set `credentials: false` (less secure)

---

## Security Best Practices
- Never commit `.env` to git (it's in `.gitignore`)
- Use different secrets for development and production
- Rotate `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` periodically
- Set `NODE_ENV=production` on Render
- Only whitelist your production frontend origin(s)

---

## 🍪 Cookie Configuration for Cross-Site Requests

### Issue: "Cookie has been rejected because it is in a cross-site context"
When your frontend (Vercel) and backend (Render) are on different domains, browsers block cookies with `SameSite=Lax` or `SameSite=Strict`.

### ✅ Solution Applied
Updated `server/controller/user.controller.js` to set cookies with:
- `sameSite: "none"` in production (allows cross-site cookies)
- `secure: true` in production (required with SameSite=none)
- `sameSite: "lax"` in development (localhost works fine)

**Cookie options now:**
```javascript
const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",  // true in production
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",  // "none" in production
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/"
};
```

### ⚠️ Critical Requirement
**You MUST set `NODE_ENV=production` on Render** for this to work!

If `NODE_ENV` is not set to `production`:
- Cookies will use `sameSite: "lax"` 
- Browsers will reject them in cross-site requests
- You'll see the error: "Cookie has been rejected because it is in a cross-site context"

### How Cookies Work Now
1. **Development (localhost):** Uses `sameSite: "lax"`, `secure: false` - works fine for same-origin
2. **Production (cross-site):** Uses `sameSite: "none"`, `secure: true` - allows Vercel → Render cookie transmission

### Verify Cookies Are Set Correctly
After deployment, open DevTools → Network → Login request → Response Headers:

```
Set-Cookie: accessToken=...; Path=/; HttpOnly; Secure; SameSite=None
Set-Cookie: refreshToken=...; Path=/; HttpOnly; Secure; SameSite=None
```

If you see `SameSite=Lax` instead of `SameSite=None`, check that `NODE_ENV=production` on Render!

### Alternative: Use Authorization Headers Only
The client already sends tokens in the `Authorization` header as a fallback:
```javascript
config.headers.Authorization = `Bearer ${token}`;
```

The server accepts both cookies and headers, so authentication will work even if cookies are blocked. However, for best security and automatic token rotation, cookies should work properly.

