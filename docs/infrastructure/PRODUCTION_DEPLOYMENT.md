# Production Deployment Guide

Complete guide for deploying Cidadão.AI Frontend to Vercel production environment.

## Prerequisites

- [ ] Vercel account created
- [ ] GitHub repository access
- [ ] Backend API deployed and accessible
- [ ] Domain name (optional)
- [ ] Google Analytics ID (optional)

## Step 1: Vercel Project Setup

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import GitHub repository:
   - Select **cidadao.ai-frontend**
   - Click **"Import"**
4. Configure Project:
   - **Project Name**: `cidadao-ai-frontend`
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Link project
cd /path/to/cidadao.ai-frontend
vercel link

# Deploy to production
vercel --prod
```

## Step 2: Environment Variables

Configure these environment variables in Vercel Dashboard → Settings → Environment Variables:

### Required Variables

```env
# Backend API (Production)
NEXT_PUBLIC_API_URL=https://neural-thinker-cidadao-ai-backend.hf.space

# Vercel KV (will be auto-added when KV is created)
KV_REST_API_URL=
KV_REST_API_TOKEN=
KV_REST_API_READ_ONLY_TOKEN=
```

### Optional Variables

```env
# Google Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Feature Flags
NEXT_PUBLIC_FEATURE_WEBSOCKET=false

# Sentry (Error Tracking)
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@xxxxx.ingest.sentry.io/xxxxx
SENTRY_AUTH_TOKEN=xxxxx
```

### Environment-Specific Configuration

- **Production**: Set all required + optional variables
- **Preview**: Same as production (uses preview API endpoints)
- **Development**: Use `.env.local` file

## Step 3: Vercel KV Setup

### Create KV Database

1. In Vercel Dashboard, go to **Storage** tab
2. Click **"Create Database"**
3. Select **"KV"** (Redis)
4. Configure:
   - **Name**: `cidadao-ai-cache`
   - **Region**: `iad1` (US East - closest to backend)
5. Click **"Create"**

### Link to Project

1. Go to KV database page
2. Click **"Connect Project"**
3. Select `cidadao-ai-frontend`
4. Environment variables are automatically added

### Verify KV Connection

After deployment, test KV connection:
```bash
curl https://your-domain.vercel.app/api/test-kv
```

Expected response:
```json
{
  "status": "success",
  "value": "test-value",
  "message": "KV connection working"
}
```

## Step 4: Domain Configuration (Optional)

### Add Custom Domain

1. In Vercel Dashboard, go to **Settings** → **Domains**
2. Add your domain:
   - Primary: `cidadao.ai` or `www.cidadao.ai`
   - Redirect: other variants
3. Configure DNS:
   - **Type**: CNAME
   - **Name**: `www` (or `@` for apex)
   - **Value**: `cname.vercel-dns.com`
4. Wait for DNS propagation (5-60 minutes)
5. SSL certificate auto-generated

### Subdomain Configuration

For API subdomain (if needed):
```
api.cidadao.ai → CNAME → cname.vercel-dns.com
```

## Step 5: Deployment Protection

### Enable Production Protection

1. Go to **Settings** → **Deployment Protection**
2. Enable **"Protect Production Deployments"**
3. Configure:
   - **Require Approval**: ON (for main branch)
   - **Preview Deployments**: Auto-deploy for PRs
   - **Environment**: Production

### Configure Git Integration

1. **Auto-deploy**: main branch → production
2. **Preview deploys**: Pull requests → preview URLs
3. **Comments on PR**: Deploy status + preview link

## Step 6: Build Optimization

### Vercel Configuration

Verify `vercel.json` settings:
```json
{
  "regions": ["iad1", "fra1", "sin1"],
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 10
    }
  }
}
```

### Performance Settings

1. Enable **Edge Functions** for `/api/edge/*`
2. Configure **Caching Headers**:
   - Static assets: 1 year
   - API responses: Private, 5 minutes
3. Enable **Compression**: Gzip + Brotli

## Step 7: Analytics & Monitoring

### Vercel Analytics

1. Go to **Analytics** tab
2. Enable **Vercel Analytics**
3. View metrics:
   - Page views
   - Unique visitors
   - Top pages
   - Web Vitals

### Google Analytics (Optional)

Set `NEXT_PUBLIC_GA_ID` environment variable with your tracking ID.

### Performance Monitoring

- **Lighthouse CI**: Auto-runs on every deployment
- **Web Vitals**: Tracked in Vercel Analytics
- **Build Times**: Visible in deployment logs

## Step 8: Security Configuration

### Security Headers

Configured in `vercel.json`:
- ✅ HSTS
- ✅ X-Content-Type-Options
- ✅ X-Frame-Options
- ✅ X-XSS-Protection
- ✅ Referrer-Policy
- ✅ Permissions-Policy

### Content Security Policy

Will be added in middleware for dynamic control.

### Rate Limiting

Edge functions have built-in rate limiting using Vercel KV.

## Step 9: Deployment Verification

### Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] Vercel KV database created and linked
- [ ] Backend API accessible
- [ ] Build succeeds locally (`npm run build`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)

### Deploy to Production

```bash
# Via CLI
vercel --prod

# Via Dashboard
# Push to main branch (auto-deploy)
git push origin main
```

### Post-Deployment Verification

1. **Health Check**:
   ```bash
   curl https://your-domain.vercel.app/api/edge/chat
   ```

2. **Performance Test**:
   - Run Lighthouse
   - Target: Performance >90

3. **Functionality Test**:
   - Test chat functionality
   - Verify authentication
   - Check caching (X-Cache-Status headers)

4. **Error Monitoring**:
   - Check Vercel logs
   - Verify no 500 errors
   - Test error pages

## Step 10: Continuous Deployment

### Git Workflow

```bash
# Development
git checkout -b feature/new-feature
# ... make changes ...
git push origin feature/new-feature

# Preview deployment auto-created
# Review preview URL in PR

# Merge to main
git checkout main
git merge feature/new-feature
git push origin main

# Production deployment auto-triggered
```

### Deployment Logs

View deployment logs:
1. Go to **Deployments** tab
2. Click on deployment
3. View **Build Logs**
4. Check for errors/warnings

## Rollback Procedure

### Option 1: Via Dashboard

1. Go to **Deployments**
2. Find last known good deployment
3. Click **"..."** menu
4. Select **"Promote to Production"**

### Option 2: Via Git

```bash
# Revert last commit
git revert HEAD
git push origin main

# Or reset to specific commit
git reset --hard <commit-hash>
git push origin main --force
```

## Troubleshooting

### Build Failures

**Problem**: Build fails with TypeScript errors

**Solution**:
```bash
# Run locally
npm run type-check
npm run build

# Fix errors and redeploy
```

**Problem**: Out of memory during build

**Solution**: Contact Vercel support for build resource increase

### Runtime Errors

**Problem**: 500 errors in production

**Solution**:
1. Check Vercel logs (Runtime Logs)
2. Verify environment variables
3. Check backend API connectivity

**Problem**: KV connection errors

**Solution**:
1. Verify KV_REST_API_URL is set
2. Check KV_REST_API_TOKEN is valid
3. Test with `/api/test-kv` endpoint

### Performance Issues

**Problem**: Slow page loads

**Solution**:
1. Check Vercel Analytics → Web Vitals
2. Run Lighthouse audit
3. Review Network tab in DevTools
4. Check caching headers

## Monitoring Production

### Daily Checks

- [ ] Check deployment status
- [ ] Review error rates in logs
- [ ] Monitor cache hit rates
- [ ] Verify uptime (99.9% target)

### Weekly Checks

- [ ] Review Web Vitals trends
- [ ] Check dependency updates
- [ ] Review security alerts
- [ ] Analyze usage patterns

### Monthly Checks

- [ ] Review Vercel costs
- [ ] Optimize caching strategies
- [ ] Update dependencies
- [ ] Performance optimization review

## Cost Management

### Vercel Pricing (Hobby Tier - Free)

- **Bandwidth**: 100GB/month
- **Build Minutes**: 100 hours/month
- **Serverless Function Executions**: 100GB-hours
- **Edge Functions**: Unlimited

### Vercel KV Pricing

- **Free Tier**:
  - 30,000 commands/day
  - 256MB storage
- **Pro Tier** ($1/month):
  - 100,000 commands/day
  - 512MB storage

### Cost Optimization

1. **Caching**: Maximize cache hit rate (>60%)
2. **TTL Strategy**: Use appropriate TTLs
3. **Compression**: Enable for all assets
4. **CDN**: Leverage Vercel's global CDN

## Support

### Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Discord**: https://vercel.com/discord
- **GitHub Issues**: Report bugs in repository

### Emergency Contacts

- **Vercel Support**: support@vercel.com
- **Team Lead**: [Your email]

## Appendix

### Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL | `https://api.cidadao.ai` |
| `KV_REST_API_URL` | Yes* | Vercel KV URL | Auto-generated |
| `KV_REST_API_TOKEN` | Yes* | Vercel KV token | Auto-generated |
| `NEXT_PUBLIC_GA_ID` | No | Google Analytics | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_SENTRY_DSN` | No | Sentry error tracking | `https://xxx.ingest.sentry.io/xxx` |

\* Auto-generated when KV database is created

### Useful Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# View deployment logs
vercel logs <deployment-url>

# List deployments
vercel ls

# Remove deployment
vercel rm <deployment-url>

# Environment variables
vercel env ls
vercel env add <name> production
vercel env rm <name> production
```

### Checklist Before Going Live

- [ ] All environment variables configured
- [ ] Vercel KV database created
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate verified
- [ ] Security headers tested
- [ ] Performance budget met (Lighthouse >90)
- [ ] Error tracking configured
- [ ] Backup/rollback procedure documented
- [ ] Team trained on deployment process
- [ ] Monitoring/alerting configured
- [ ] Cost limits set
