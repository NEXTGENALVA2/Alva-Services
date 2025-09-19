## Banner Upload Debug Checklist

### ✅ Issues to Check:

1. **File Size**: Very large files (>10MB) may timeout
2. **File Type**: Only image files (jpg, png, gif, webp) should work
3. **Website ID**: Make sure you're logged in and have a valid website
4. **Server Response**: Check for 500/400 errors in Network tab
5. **Multer Config**: File upload middleware may have restrictions

### 🔧 Quick Fixes:

#### Fix 1: Add File Size Limit Check
```javascript
const handleBannerChange = (e) => {
  const files = Array.from(e.target.files || []);
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  const validFiles = files.filter(file => {
    if (file.size > maxSize) {
      alert(`File ${file.name} is too large. Max size: 5MB`);
      return false;
    }
    return true;
  });
  
  setBanners(validFiles);
  setBannerPreviews(validFiles.map(file => URL.createObjectURL(file)));
};
```

#### Fix 2: Add File Type Validation
```javascript
const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
const validFiles = files.filter(file => {
  if (!allowedTypes.includes(file.type)) {
    alert(`File ${file.name} is not a valid image type`);
    return false;
  }
  return true;
});
```

#### Fix 3: Check Network Request
- Open Browser DevTools → Network tab
- Upload a banner
- Look for request to `/api/banner`
- Check if it shows 200 OK or error status

### 🐛 Backend Debug:
Check server logs in terminal for:
- "Banner upload error:"
- "No file uploaded"
- Database connection issues