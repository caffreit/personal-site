# Serverless Function Size Fix

## Problem

Vercel was bundling the entire `public/` folder (100+ MB of images) into serverless functions because `analyzeImageAction` used `fs.readFileSync()` to read images from the filesystem. This caused the error:

```
Error: A Serverless Function has exceeded the unzipped maximum size of 250 MB
```

## Solution

Changed `src/app/actions.ts` to **fetch images via HTTP** instead of reading from the filesystem:

### Before (caused bundling):
```typescript
const absolutePath = path.join(process.cwd(), 'public', relativePath);
const fileBuffer = fs.readFileSync(absolutePath);
```

### After (prevents bundling):
```typescript
const fullImageUrl = `${baseUrl}${imageUrl}`;
const imageResponse = await fetch(fullImageUrl);
const arrayBuffer = await imageResponse.arrayBuffer();
```

## Why This Works

1. **Static assets stay static**: Images in `public/` are served as static files by Vercel's CDN
2. **No filesystem access**: Fetching via HTTP means Vercel doesn't need to bundle the files
3. **Runtime access**: Images are fetched at runtime from their public URLs, not bundled at build time

## Additional Changes

- Created `vercel.json` to configure build settings
- Removed `fs` and `path` imports from `actions.ts` (no longer needed)
- Images are now fetched from:
  - `NEXT_PUBLIC_SITE_URL` (if set)
  - `VERCEL_URL` (automatically set by Vercel)
  - `http://localhost:3000` (for local development)

## Testing

The build still passes locally. When deployed:
- Images will be served as static assets (not bundled)
- `analyzeImageAction` will fetch images from their public URLs
- Serverless functions will be under the 250 MB limit

## Note

The `public/` folder images are still committed to GitHub and deployed - they're just served as static assets instead of being bundled into serverless functions.

