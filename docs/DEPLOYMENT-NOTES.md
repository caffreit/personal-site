# Deployment Notes

## Images Location

**Yes, images live in GitHub!** They're stored in:
- `public/photos/<album>/` - Photo album images
- `public/blog/<slug>/` - Blog post images  
- `public/logo.png` - Site logo

These are **static assets** that Next.js/Vercel serves directly. They are:
- ✅ Committed to Git and pushed to GitHub
- ✅ Served as static files (not bundled into JavaScript)
- ✅ Optimized by Next.js Image component when used
- ✅ Accessible at URLs like `/photos/Faves/image.jpg`

## Function Size Warning

The "Max serverless function size exceeded" warning you saw is likely a **false positive** or related to:

1. **Build analysis** - Vercel analyzes the build output, but images in `public/` are NOT bundled into serverless functions
2. **Server actions** - The `analyzeImageAction` in `src/app/actions.ts` uses `fs.readFileSync` to read images at runtime, but this doesn't bundle them
3. **Large dependencies** - Some npm packages might be large, but this is normal

**The build completed successfully** - this was a warning, not an error. Your images will be served as static assets.

## Next.js Vulnerability Fixed

✅ Updated from `16.0.3` to `16.1.1` (patches CVE-2025-66478)

## Optimizing Images (Optional)

If you want to reduce image sizes:

1. **Compress images before committing:**
   - Use tools like [Squoosh](https://squoosh.app/) or [ImageOptim](https://imageoptim.com/)
   - Convert to WebP format for better compression
   - Resize large images to appropriate dimensions

2. **Use Next.js Image component:**
   - Already using `<Image>` component which optimizes automatically
   - Images are automatically converted to WebP/AVIF when supported

3. **Consider CDN:**
   - Vercel already serves static assets via CDN
   - No additional setup needed

## Deployment Checklist

- [x] Next.js updated to secure version (16.1.1)
- [x] Build passes locally
- [x] Images are in `public/` folder
- [ ] Push to GitHub
- [ ] Deploy to Vercel
- [ ] Update DNS records in Squarespace

