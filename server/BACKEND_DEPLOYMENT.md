# Backend Deployment Guide

## Overview
Backend is configured for **Vercel deployment** with environment-driven configuration.

### Vercel Configuration
See `vercel.json` for build specifications:
- Entry point: `index.js` (Node.js runtime)
- Rewrites all routes to `/index.js` (Express handles routing)
- Supports environment variables from Vercel dashboard

---

## Deployment Checklist

### 1. Pre-Deployment
- [ ] Copy `.env.example` → `.env` (locally)
- [ ] Fill all required env variables (see section below)
- [ ] Run `npm install` to verify dependencies resolve
- [ ] Run `npm start` locally and test `/api-docs` endpoint
- [ ] Run test requests to verify MongoDB connection + API endpoints

### 2. Environment Variables Required

**Critical (App won't start without these)**:
```
MONGODB_URI=               # MongoDB Atlas connection string
JWT_SECRET=                # Random string for JWT signing
```

**Highly Recommended (Features won't work without these)**:
```
CLIENT_URL=                # Frontend domain (for CORS)
ALLOWED_ORIGINS=           # Additional allowed domains
IME_SOAP_BASE_URL=        # IME API endpoint
IME_ACCESS_CODE=          # IME credentials
IME_USERNAME=             # IME credentials
IME_PASSWORD=             # IME credentials
IME_PARTNER_BRANCH_ID=    # IME credentials
```

**Optional (Services work without these, but features disabled)**:
```
ENABLE_IME_PAYMENT=        # Set to false to disable IME
ENABLE_PRABHU_PAYMENT=     # Set to false to disable Prabhu
SMTP_HOST / SMTP_USER=     # Email notifications
GOOGLE_CLIENT_ID=          # OAuth login (if used)
```

### 3. Vercel Deployment Steps

#### Option A: Via Vercel Dashboard
1. **Connect Repository**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New" → "Project"
   - Select your GitHub/GitLab repository

2. **Configure Environment**:
   - In "Environment Variables" tab, add all variables from `.env`
   - Set `NODE_ENV=production`
   - MongoDB URI should use production cluster

3. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Check Deployment URL: `https://<project-name>.vercel.app`

#### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from server directory
cd server
vercel

# Add environment variables interactively or use vercel env push
vercel env add MONGODB_URI
vercel env add JWT_SECRET
# ... repeat for all required vars

# Redeploy after adding env vars
vercel --prod
```

### 4. Post-Deployment Validation

#### Check API Health
```bash
# Replace <your-backend-url> with actual Vercel URL
curl https://<your-backend-url>/api-docs
# Should return Swagger UI HTML (status 200)

curl https://<your-backend-url>/
# Should redirect to /api-docs (status 301/302)
```

#### Check Startup Logs
- Go to Vercel Dashboard → Select project → "Deployments" → Click latest deployment
- View "Function Logs" or "Build Logs" for errors
- Look for startup validation messages:
  ```
  ✓ Required env vars validated
  ✓ MongoDB connected
  ✓ Server running on port 5000
  ```

#### Check API Endpoints
```bash
# Test auth endpoint
curl -X GET https://<your-backend-url>/api/auth/profile

# Test IME endpoint
curl -X POST https://<your-backend-url>/api/IME/CheckCustomer \
  -H "Content-Type: application/json" \
  -d '{"mobile": "9841234567"}'

# Check response status (should not be 500 or deploy error)
```

---

## Troubleshooting

### Error: "Cannot find module 'dotenv'"
**Cause**: Dependencies not installed
```bash
npm install
vercel env pull  # Pull env vars locally for testing
npm start
```

### Error: "MONGODB_URI is required"
**Cause**: Environment variable not set on Vercel
**Fix**: 
1. Go to Vercel Dashboard
2. Project Settings → Environment Variables
3. Add `MONGODB_URI=<your-mongodb-url>`
4. Redeploy: `vercel --prod`

### Error: "Connection refused at localhost:5000"
**Cause**: App not listening (wrong PORT or crash at startup)
**Fix**:
1. Check Vercel logs for startup errors
2. Verify all required env vars are set
3. Run locally: `npm start` to see detailed errors

### Error: "CORS error" on frontend
**Cause**: Frontend domain not in ALLOWED_ORIGINS
**Fix**:
1. Get frontend URL from AWS Amplify: `https://<your-project>.amplifyapp.com`
2. Set backend env var:
   ```
   CLIENT_URL=https://<your-project>.amplifyapp.com
   ALLOWED_ORIGINS=https://<your-project>.amplifyapp.com
   ```
3. Redeploy: `vercel --prod`

### Error: "Cannot reach IME API"
**Cause**: IME credentials or network issue
**Fix**:
1. Verify IME credentials in .env:
   ```bash
   echo $IME_SOAP_BASE_URL
   echo $IME_ACCESS_CODE
   ```
2. Check IME_SOAP_BASE_URL is reachable: `curl $IME_SOAP_BASE_URL`
3. Check firewall/VPN if on-prem IME

---

## Connected Services

### Frontend (AWS Amplify)
- Frontend Domain: `https://<frontend>.amplifyapp.com`
- Backend URL: Set in `VITE_API_URL` environment variable
- CORS Origin: Must be in backend `ALLOWED_ORIGINS`

### Database (MongoDB Atlas)
- Connection: `MONGODB_URI` env var (connection string)
- Recommended: Use Vercel's MongoDB integration for easy setup

### IME SOAP API
- Base URL: `IME_SOAP_BASE_URL` (externally hosted)
- Auth: Username/Password/AccessCode injected in SOAP envelope
- Rate Limits: Check IME documentation for throttling

---

## Scaling Notes

- **Serverless Functions**: Vercel auto-scales (no action needed)
- **Database Connections**: MongoDB has connection pooling; set `MONGODB_MAX_POOL_SIZE=10`
- **Rate Limiting**: Configured via `RATE_LIMIT_MAX_REQUESTS` env var
- **Caching**: Consider enabling Redis for session store if traffic high

---

## Security Best Practices

1. **Never commit .env file** (it's in .gitignore)
2. **Use Vercel's protected environment variables** for secrets
3. **Rotate JWT_SECRET periodically**
4. **Restrict ALLOWED_ORIGINS to known domains only**
5. **Monitor Vercel logs for suspicious activity**
6. **Use HTTPS only** (Vercel auto-enforces)
7. **Keep NODE_ENV=production on Vercel**

---

## Quick Reference

| Environment | MongoDB | JWT_SECRET | CLIENT_URL | STRIPE_KEY |
|---|---|---|---|---|
| **Local** | mongodb://localhost:27017 | test-secret | http://localhost:5173 | sk_test_... |
| **Dev** | dev.mongodb.net | dev-secret | https://dev.yourdomain.com | sk_test_... |
| **Prod** | prod.mongodb.net | prod-secret-long-random | https://yourdomain.com | sk_live_... |

---

## Support

For deployment issues:
1. Check Vercel Docs: https://vercel.com/docs/frameworks/express
2. Check MongoDB Docs: https://docs.mongodb.com/
3. View backend logs: Vercel Dashboard → Deployments → Logs
4. Debug locally: `npm start` and check console output

