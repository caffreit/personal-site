# DNS Changes for www.drdimg.com

## Current Squarespace DNS Records (TO DELETE)

You currently have these records pointing to Squarespace:

```
@    A    151.101.0.119
@    A    151.101.192.119
www  A    151.101.0.119
www  A    151.101.192.119
```

**These need to be DELETED** and replaced with Vercel records.

## New Vercel DNS Records (TO ADD)

After deploying to Vercel and adding your domain, Vercel will show you the exact IP addresses to use. Typically:

### For Apex Domain (`@`):
```
@    A    76.76.21.21
```
(Or whatever IPv4 address Vercel provides)

### For `www` Subdomain:
```
www  CNAME  cname.vercel-dns.com
```
(Or the specific CNAME Vercel provides - it may be something like `cname.vercel-dns.com` or a project-specific CNAME)

## Steps in Squarespace DNS Settings

1. **Delete old records:**
   - Remove all 4 A records (@ and www pointing to Squarespace IPs)

2. **Add new records:**
   - Add A record for `@` with Vercel's IPv4 address
   - Add CNAME record for `www` pointing to Vercel's CNAME

3. **Keep existing:**
   - Keep the `_domainconnect` CNAME record (don't delete it)

## Important Notes

- **Don't delete the `_domainconnect` record** - this is for Squarespace domain management
- The exact IP addresses will be shown in your Vercel project settings → Domains
- DNS changes can take 15 minutes to 48 hours to propagate
- Vercel will automatically provision SSL certificates once DNS is verified


