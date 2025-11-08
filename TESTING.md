# Character Matters - Testing Guide

## Backend Server Status
✅ **Server is running on port 5000**
✅ **MongoDB connected successfully**
✅ **AWS SDK upgraded to v3**

## Testing Instructions

### 1. Test Backend Health
Open your browser and visit:
```
http://localhost:5000/
```
Expected response:
```json
{
  "status": "ok",
  "name": "Character Matters API",
  "version": "1.0.0"
}
```

Health endpoint:
```
http://localhost:5000/api/health
```

### 2. Test User Registration & MongoDB Persistence

**Register a new user:**
Using Postman, curl, or browser fetch:

```bash
# PowerShell
Invoke-WebRequest -Uri http://localhost:5000/api/auth/register `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

Expected response:
```json
{
  "message": "User created successfully",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "free-user"
  },
  "token": "eyJhbGc..."
}
```

**Verify in MongoDB Compass:**
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Navigate to database: `video-ebook-platform`
4. Check collection: `users`
5. You should see the newly created user document

### 3. Test User Login

```bash
# PowerShell
Invoke-WebRequest -Uri http://localhost:5000/api/auth/login `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"test@example.com","password":"password123"}'
```

Expected response:
```json
{
  "message": "Login successful",
  "user": {
    "id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "role": "free-user"
  },
  "token": "eyJhbGc..."
}
```

### 4. Test Frontend Login Flow

**Start the frontend:**
```bash
cd C:\Users\user\characterMatters\web
npm run dev -- -p 3001
```

**Then test in browser:**
1. Open: `http://localhost:3001/register`
2. Fill the form and register a new user
3. You should be automatically redirected to `/dashboard`
4. Check browser localStorage for `token` key
5. Verify the user appears in MongoDB Compass

**Login test:**
1. Logout from dashboard
2. Go to: `http://localhost:3001/login`
3. Enter credentials
4. Should redirect to `/dashboard` on success
5. If it loops back to login, check browser console for errors

### 5. Debugging Login Loop Issue

If login keeps returning to login page:

**Check browser console (F12):**
- Look for 401 errors
- Check if token is being saved to localStorage
- Verify API base URL is correct

**Check Network tab:**
- POST to `/api/auth/login` should return 200 with token
- GET to `/api/auth/me` should return user data (not 401)

**Common fixes:**
- Clear localStorage: `localStorage.clear()`
- Clear cookies
- Restart backend server
- Check JWT_SECRET in backend/.env file

### 6. Environment Variables Check

**Backend (.env file must exist):**
```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
MONGODB_URI=mongodb://localhost:27017/video-ebook-platform
PORT=5000
```

**Frontend (.env.local if needed):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Fixed Issues Summary

### ✅ MongoDB Connectivity
- Backend connects to MongoDB successfully
- User model schema is correct
- Registration saves users to database

### ✅ Authentication Flow
- Added `/auth/me` endpoint (alias for `/profile`)
- Fixed token storage in localStorage
- Proper error handling in auth slice

### ✅ Frontend TypeScript Errors
- Fixed `error: any` → `error: unknown` with proper type guards
- Added RootState type imports for useAppSelector
- Fixed FloatingStars Math.random purity issue with seeded random
- Removed unused variables

### ✅ AWS SDK Version
- Upgraded from aws-sdk v2 → @aws-sdk/client-s3 v3
- No more maintenance mode warnings

## Next Steps for User

1. **Start frontend dev server** if not already running
2. **Test registration** via frontend UI at http://localhost:3001/register
3. **Verify user in MongoDB Compass** - should see document in users collection
4. **Test login** - should redirect to dashboard after successful login
5. **Report any errors** seen in browser console or network tab

## Troubleshooting

### Backend not accessible
```bash
# Check if server is running
netstat -ano | findstr :5000

# Restart backend
cd C:\Users\user\characterMatters\backend
npm run build
node dist/app.js
```

### MongoDB connection issues
- Ensure MongoDB service is running on Windows
- Check Services → MongoDB Server → Status should be "Running"
- Or start manually: `net start MongoDB`

### Frontend compilation errors
```bash
cd C:\Users\user\characterMatters\web
npm run build
```
Should complete without errors.
