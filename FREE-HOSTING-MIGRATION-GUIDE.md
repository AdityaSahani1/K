# Complete Migration Guide: Free Hosting + Domain for SnapSera PWA

## 🎯 Goal
Move SnapSera to a completely free hosting platform where:
- ✅ PWA installation works perfectly (HTTPS required)
- ✅ PHP support for your backend
- ✅ SQLite or MySQL database
- ✅ Free domain (subdomain) or connect your own cheap domain

---

## 📊 Quick Comparison: Best Free Options

| Platform | PHP Support | Database | HTTPS | PWA Works | Free Domain | Best For |
|----------|-------------|----------|-------|-----------|-------------|----------|
| **Railway.app** ⭐ | ✅ Full | PostgreSQL/MySQL | ✅ Auto | ✅ Yes | `*.up.railway.app` | Production-ready |
| **Render.com** ⭐ | ✅ Full | PostgreSQL | ✅ Auto | ✅ Yes | `*.onrender.com` | Modern apps |
| **000webhost** | ✅ cPanel | MySQL | ✅ Free SSL | ✅ Yes | `*.000webhostapp.com` | Traditional PHP |
| **InfinityFree** | ✅ Full | MySQL | ❌ Blocks PWA | ❌ No | `*.great-site.net` | Not for PWA |
| **GitHub Pages** | ❌ Static only | None | ✅ Auto | ✅ Yes | `*.github.io` | Static sites only |

---

## 🚀 RECOMMENDED: Railway.app (Best for SnapSera)

### Why Railway?
- ✅ Full PHP 8.2+ support
- ✅ Free PostgreSQL database (or bring SQLite)
- ✅ Automatic HTTPS on `*.up.railway.app`
- ✅ $5 free credits monthly (enough for personal projects)
- ✅ Easy GitHub deployment
- ✅ PWA works perfectly
- ✅ Can connect custom domain for free

### Step-by-Step Migration to Railway

#### 1. Prepare Your Project

**Create `railway.json` in project root:**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "php -S 0.0.0.0:$PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Create `nixpacks.toml` (tells Railway to use PHP):**
```toml
[phases.setup]
nixPkgs = ['php82', 'php82Extensions.pdo', 'php82Extensions.sqlite3']

[phases.install]
cmds = ['echo "Dependencies installed"']

[start]
cmd = 'php -S 0.0.0.0:$PORT'
```

**Update your PHP to use Railway's PORT:**
Create `server.php`:
```php
<?php
$port = getenv('PORT') ?: 5000;
echo "Starting server on port $port...\n";
exec("php -S 0.0.0.0:$port");
```

#### 2. Deploy to Railway

**Option A: Via GitHub (Recommended)**

1. Push your project to GitHub:
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

2. Go to [railway.app](https://railway.app)
3. Click "Start a New Project"
4. Select "Deploy from GitHub repo"
5. Connect your GitHub account
6. Select your SnapSera repository
7. Railway auto-detects PHP and deploys!

**Option B: Via Railway CLI**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up
```

#### 3. Get Your Free Domain

After deployment:
- Your app is live at: `https://your-app-name.up.railway.app`
- This URL has HTTPS automatically
- PWA will work immediately!

#### 4. Setup Database (SQLite or PostgreSQL)

**Option A: Keep using SQLite (Easiest)**
- Your `data/snapsera.db` file will work as-is
- Make sure `data/` directory is writable

**Option B: Switch to PostgreSQL (Recommended for production)**

1. In Railway dashboard, click "+ New"
2. Select "Database" → "PostgreSQL"
3. Copy the database credentials
4. Update your `config/config.php`:
```php
return [
    'DB_TYPE' => 'mysql', // Railway uses PostgreSQL but PDO treats it similarly
    'MYSQL_HOST' => getenv('PGHOST'),
    'MYSQL_PORT' => getenv('PGPORT'),
    'MYSQL_DATABASE' => getenv('PGDATABASE'),
    'MYSQL_USERNAME' => getenv('PGUSER'),
    'MYSQL_PASSWORD' => getenv('PGPASSWORD'),
    // ... rest of config
];
```

5. Import your data using Railway's built-in tools

---

## 🌐 Getting a Domain

### Option 1: Use Free Subdomain (Included)

Railway gives you: `https://snapsera-production.up.railway.app`
- **Pros**: Free, automatic HTTPS, works immediately
- **Cons**: Long URL, not memorable

### Option 2: Get a Cheap Domain ($1-12/year)

**Best Budget Registrars:**

| Registrar | .com Price | .xyz Price | Features |
|-----------|------------|------------|----------|
| **Namecheap** | $12.99/yr | $1.99/yr | Free WHOIS privacy, DNS |
| **Porkbun** | $9.99/yr | $0.99/yr | Cheapest renewals |
| **Cloudflare** | $9.77/yr | $9.51/yr | At-cost pricing |
| **Hostinger** | Free w/ hosting | $0.99/yr | Free first year |

**Recommendation**: Get a `.xyz` domain from **Porkbun** for $0.99/year

**Steps to buy:**
1. Go to [porkbun.com](https://porkbun.com)
2. Search for your desired name (e.g., `snapsera.xyz`)
3. Add to cart - should be ~$0.99-$1.99
4. Create account and checkout
5. Keep the domain at Porkbun (free DNS)

### Option 3: Truly Free Domain Options (2025)

⚠️ **Reality Check**: Freenom (.tk, .ml, .ga) is DEAD as of 2024

**Actual Free Options:**

1. **GitHub Pages Subdomain**
   - Domain: `yourusername.github.io`
   - HTTPS: ✅ Free
   - PWA: ✅ Works
   - Limitation: Static sites only (no PHP)

2. **Netlify Subdomain**
   - Domain: `yoursite.netlify.app`
   - HTTPS: ✅ Free
   - PWA: ✅ Works
   - Limitation: Static sites only

3. **Vercel Subdomain**
   - Domain: `yoursite.vercel.app`
   - HTTPS: ✅ Free
   - PWA: ✅ Works
   - Limitation: PHP as serverless only

4. **EU.org Free Domain** (Requires application)
   - Domain: `yoursite.eu.org`
   - HTTPS: ✅ (after setup)
   - PWA: ✅ Works
   - Process: Apply at [nic.eu.org](https://nic.eu.org)
   - Wait time: 2-4 weeks for approval
   - Best for: Non-profit/educational projects

---

## 🔗 Connecting Your Custom Domain to Railway

### If You Bought a Domain (Namecheap, Porkbun, etc.)

#### Step 1: In Railway Dashboard

1. Go to your project settings
2. Click "Domains" tab
3. Click "Custom Domain"
4. Enter your domain: `snapsera.xyz`
5. Railway shows you DNS records to add

#### Step 2: In Your Domain Registrar (Porkbun Example)

1. Login to Porkbun
2. Go to "Domain Management"
3. Click "DNS" for your domain
4. Add these records:

**For root domain (snapsera.xyz):**
```
Type: A
Host: @
Answer: [Railway's IP - shown in dashboard]
TTL: 600
```

**For www subdomain:**
```
Type: CNAME
Host: www
Answer: [your-app].up.railway.app
TTL: 600
```

#### Step 3: Wait for DNS Propagation
- Usually takes 5-60 minutes
- Railway automatically provisions SSL certificate
- Your PWA will work at `https://snapsera.xyz`

---

## 🔄 Alternative: Render.com (Also Excellent)

### Why Render?
- Similar to Railway but with more generous free tier
- 750 free hours/month (enough for always-on)
- Free PostgreSQL database
- Automatic HTTPS on `*.onrender.com`

### Deploy to Render

1. Create `render.yaml` in project root:
```yaml
services:
  - type: web
    name: snapsera
    env: php
    buildCommand: echo "Build complete"
    startCommand: php -S 0.0.0.0:$PORT
    envVars:
      - key: DB_TYPE
        value: sqlite
```

2. Go to [render.com](https://render.com)
3. "New" → "Web Service"
4. Connect GitHub repo
5. Render auto-deploys!
6. Free domain: `https://snapsera.onrender.com`

**Connect custom domain:**
- Same process as Railway
- Add CNAME record pointing to `yourapp.onrender.com`

---

## ⚡ Quick Option: 000webhost (Traditional cPanel)

### Why 000webhost?
- Traditional PHP hosting (like old-school shared hosting)
- Free cPanel access
- MySQL database included
- No credit card required

### Setup

1. Go to [000webhost.com](https://www.000webhost.com)
2. Sign up (free account)
3. Create new website
4. Upload files via FTP or File Manager
5. Import database via phpMyAdmin
6. Free domain: `https://snapsera.000webhostapp.com`

**Limitations:**
- 300MB storage (your project should fit)
- 3GB bandwidth/month
- Daily 1-hour forced sleep (inactive hours)
- Ads may appear (can remove with upgrade)

**Connect custom domain:**
- Upgrade to premium ($2.99/mo) to use custom domains
- Or use free subdomain with PWA working perfectly

---

## 📋 Migration Checklist

### Before Migration:

- [ ] Backup your database: `cp data/snapsera.db snapsera-backup.db`
- [ ] Export posts, users as SQL: Use `changelog-inserts.sql` approach
- [ ] Note down admin credentials
- [ ] Test app locally: `php -S localhost:8000`

### During Migration:

- [ ] Choose platform (Railway recommended)
- [ ] Create account and connect GitHub
- [ ] Add `railway.json` or `render.yaml`
- [ ] Push to GitHub
- [ ] Deploy and wait for build
- [ ] Test on free subdomain (e.g., `*.up.railway.app`)

### After Deployment:

- [ ] Visit your new URL
- [ ] Test PWA installation (should work with HTTPS)
- [ ] Check database connectivity
- [ ] Test login/logout
- [ ] Test admin panel
- [ ] Test PWA install prompt (should appear!)
- [ ] (Optional) Connect custom domain
- [ ] Update DNS records
- [ ] Wait for SSL certificate (auto)
- [ ] Test final domain

---

## 💰 Cost Comparison

| Option | Monthly Cost | Annual Cost | Custom Domain | Best For |
|--------|--------------|-------------|---------------|----------|
| **Railway free tier** | $0 ($5 credit) | $0 | ✅ Free to add | Small projects |
| **Render free tier** | $0 | $0 | ✅ Free to add | Personal sites |
| **000webhost free** | $0 | $0 | ❌ Need upgrade | Testing |
| **Porkbun .xyz domain** | - | $0.99 | N/A | Cheapest domain |
| **Namecheap .com** | - | $12.99 | N/A | Professional |

**Best Budget Setup:**
- Railway/Render (free hosting) + Porkbun .xyz ($0.99) = **$0.99/year total**

---

## 🎯 Recommended Setup for SnapSera

### Best Value: Railway + Porkbun

1. **Deploy to Railway** (free):
   - Push code to GitHub
   - Connect to Railway
   - Get `https://snapsera.up.railway.app`
   - PWA works immediately!

2. **Buy domain from Porkbun** ($0.99/year):
   - Register `snapsera.xyz`
   - Point DNS to Railway
   - Get `https://snapsera.xyz`

**Total Cost: $0.99/year** 🎉

### Free Option: Just Railway

- Use Railway's free subdomain
- `https://snapsera-production.up.railway.app`
- PWA works perfectly
- $0 cost forever (within free tier limits)

---

## 🔧 Troubleshooting

### PWA Still Not Installing?

1. **Check HTTPS**: URL must start with `https://`
2. **Clear cache**: Hard refresh (Ctrl+Shift+R)
3. **Check manifest**: Visit `/manifest.json` directly
4. **Check service worker**: Visit `/sw.js` directly
5. **Browser console**: Look for errors
6. **Wait 30 seconds**: Chrome requires engagement time

### Database Issues?

1. **Check file permissions**: `chmod 777 data/` (on Railway)
2. **Check database path**: Should be absolute or relative to root
3. **Switch to PostgreSQL**: More reliable on cloud platforms

### Domain Not Working?

1. **DNS propagation**: Wait up to 24 hours (usually 1 hour)
2. **Check DNS**: Use [dnschecker.org](https://dnschecker.org)
3. **SSL pending**: Railway/Render auto-provision (wait 10-20 min)
4. **Clear browser cache**: Force refresh

---

## 📞 Support Resources

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Porkbun Support**: [kb.porkbun.com](https://kb.porkbun.com)
- **DNS Checker**: [dnschecker.org](https://dnschecker.org)
- **SSL Checker**: [sslshopper.com/ssl-checker.html](https://www.sslshopper.com/ssl-checker.html)

---

## 🎉 Summary

**Fastest Path to PWA Working:**

1. Push your code to GitHub
2. Deploy to Railway (5 minutes)
3. Get free `*.up.railway.app` domain with HTTPS
4. PWA works immediately!
5. (Optional) Buy domain from Porkbun for $0.99/year
6. Connect domain to Railway (10 minutes)
7. Done!

**Your SnapSera PWA will work perfectly on any of these platforms because they all provide HTTPS by default. The key was HTTPS - InfinityFree blocks it on free accounts, but Railway, Render, and others give it for free!**
