# Connect Domain to Vercel - Quick Checklist

## ✅ Step 1: Add Domain in Vercel

1. Go to your Vercel project → **Settings** → **Domains**
2. Click **Add Domain**
3. Add both domains:
   - `drdimg.com`
   - `www.drdimg.com`
4. **Copy the DNS records** Vercel shows you (you'll need these for Step 2)

## ✅ Step 2: Update Squarespace DNS

### Delete These (Old Squarespace Records):
- ❌ `@` A → `151.101.0.119`
- ❌ `@` A → `151.101.192.119`
- ❌ `www` A → `151.101.0.119`
- ❌ `www` A → `151.101.192.119`

### Add These (From Vercel):
- ✅ `@` A → `[Vercel IPv4 address]` (e.g., `76.76.21.21`)
- ✅ `www` CNAME → `[Vercel CNAME]` (e.g., `cname.vercel-dns.com`)

### Keep This:
- ✅ `_domainconnect` CNAME → `_domainconnect.domains.squarespace.com` (don't delete!)

## ✅ Step 3: Set Environment Variables

In Vercel → Settings → Environment Variables, add:

1. **NEXT_PUBLIC_SITE_URL**
   - **Value:** `https://www.drdimg.com`
   - **Environment:** Production (and Preview if you want)

2. **GEMINI_API_KEY** (optional, for AI image analysis)
   - **Value:** Your Google Gemini API key
   - Get one at: https://aistudio.google.com/app/apikey
   - **Environment:** Production (and Preview if you want)

Then **redeploy** or wait for next deployment.

## ✅ Step 4: Wait & Verify

- Vercel will verify DNS automatically (checkmark appears when ready)
- DNS propagation: 15 minutes to 48 hours (usually 1-2 hours)
- Check status: https://www.whatsmydns.net/#A/drdimg.com

## ✅ Step 5: Test

- Visit `https://www.drdimg.com`
- Visit `https://drdimg.com` (should redirect to www)
- SSL certificate is automatic ✅

## Troubleshooting

**Domain not working after 24 hours?**
1. Double-check DNS records match exactly what Vercel shows
2. Verify you deleted ALL old Squarespace A records
3. Check DNS propagation: https://www.whatsmydns.net
4. In Vercel, check domain shows "Valid Configuration"

**Seeing Vercel deployment page?**
- Make sure domain is added in Vercel project settings
- Wait for DNS propagation to complete
- Clear browser cache

