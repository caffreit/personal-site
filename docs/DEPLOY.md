# Deploy to Vercel for www.drdimg.com

## Step 1: Commit and Push to GitHub

1. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   ```

2. **Create a GitHub repository** (if you haven't already):
   - Go to https://github.com/new
   - Create a new repository (e.g., `personal-site`)
   - **Don't** initialize with README, .gitignore, or license (you already have these)

3. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub username and repo name.

## Step 2: Deploy to Vercel

1. **Sign up/Login to Vercel:**
   - Go to https://vercel.com
   - Sign up with your GitHub account (recommended for easy integration)

2. **Import your project:**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Configure project settings:**
   - **Framework Preset:** Next.js (should be auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)

4. **Set environment variables:**
   - Add environment variables:
     - **Name:** `NEXT_PUBLIC_SITE_URL`
       - **Value:** `https://www.drdimg.com`
       - This ensures sitemap and robots.txt use the correct domain
     - **Name:** `GEMINI_API_KEY`
       - **Value:** Your Google Gemini API key (get from https://aistudio.google.com/app/apikey)
       - This enables AI image analysis features
   - Set for **Production** environment (and Preview/Development if desired)

5. **Deploy:**
   - Click "Deploy"
   - Wait for the build to complete (usually 1-2 minutes)

## Step 3: Connect Your Domain (www.drdimg.com)

1. **In Vercel Dashboard:**
   - Go to your project → **Settings** → **Domains**
   - Click **Add Domain**
   - Enter: `drdimg.com` (apex domain)
   - Enter: `www.drdimg.com` (www subdomain)
   - Vercel will show you the DNS records you need

2. **Update DNS in Squarespace:**
   
   **Important:** You need to **DELETE** the existing Squarespace A records and **REPLACE** them with Vercel's records.
   
   Go to your Squarespace DNS settings and update:

   **For the apex domain (`@`):**
   - **DELETE** the existing A records pointing to `151.101.0.119` and `151.101.192.119`
   - **ADD** new A records with Vercel's IPv4 addresses (Vercel will show these, typically `76.76.21.21`)
   - **ADD** AAAA records with Vercel's IPv6 addresses (if provided by Vercel)

   **For `www` subdomain:**
   - **DELETE** the existing A records for `www` pointing to Squarespace IPs
   - **ADD** a CNAME record:
     - **Host:** `www`
     - **Type:** `CNAME`
     - **Data:** `cname.vercel-dns.com` (or the specific CNAME Vercel provides)
     - **TTL:** 4 hrs (or auto)

   **Keep the `_domainconnect` record** (don't delete it)

3. **Verify DNS:**
   - Vercel will automatically verify your DNS records
   - This can take a few minutes to a few hours
   - You'll see a green checkmark when it's verified

## Step 4: Wait for DNS Propagation

- DNS changes can take **15 minutes to 48 hours** to propagate globally
- Usually works within 1-2 hours
- You can check propagation status at https://www.whatsmydns.net

## Step 5: Test Your Site

- Visit `https://www.drdimg.com` in your browser
- Visit `https://drdimg.com` (should redirect to www)
- Check that SSL certificate is active (should be automatic with Vercel)

## Step 6: Post-Deployment

### Adding New Content:

**Photos:**
- Add images to `public/photos/<album>/`
- Run locally: `npm run generate:albums`
- Commit and push the updated `content/photos/manifest.json`
- Vercel will auto-deploy on push

**Blog Posts:**
- Add new posts to `content/blog/<slug>/index.mdx`
- Commit and push
- Vercel will auto-deploy

## Troubleshooting

**If your domain doesn't work after 24 hours:**
1. Double-check DNS records match exactly what Vercel shows
2. Ensure you deleted the old Squarespace A records
3. Check DNS propagation: https://www.whatsmydns.net
4. Verify domain in Vercel dashboard shows as "Valid Configuration"

**If you see a Vercel deployment page instead of your site:**
- Make sure you added the domain in Vercel project settings
- Wait for DNS propagation to complete


