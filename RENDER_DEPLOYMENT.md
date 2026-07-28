# 🚀 Render Deployment Guide - QRcraft

## ⚠️ CRITICAL: Required Environment Variables

Tracking feature ke liye ye environment variables **ZAROORI** hain. Agar ye missing honge toh:
- ❌ "Create Tracked QR" button kaam nahi karega
- ❌ QR scan tracking fail hoga
- ❌ Analytics dashboard khali rahega

## 📝 Render Dashboard Setup

### Step 1: Open Environment Variables
1. Render Dashboard kholo: https://dashboard.render.com
2. Apni "qrcraft" service pe click karo
3. Left sidebar mein **"Environment"** tab pe jao

### Step 2: Add These Variables (Exactly)

**⚠️ IMPORTANT**: Replace the placeholder values with your actual keys from `.env` file

```
DATABASE_URL
file:./prisma/dev.db

NEXT_PUBLIC_APP_URL
https://qrcraft-gura.onrender.com

GROQ_API_KEY
<your_groq_api_key_from_env_file>

OPENROUTER_API_KEY
<your_openrouter_api_key_from_env_file>

NODE_ENV
production
```

### Step 3: Save & Redeploy
1. **"Save Changes"** button pe click karo (upar right corner)
2. Automatic redeploy hoga (ya manually **"Manual Deploy"** → **"Deploy latest commit"**)

## ✅ Verification Steps

Deploy complete hone ke baad:

1. **Check Logs**: 
   - Left sidebar → **"Logs"** tab
   - Dekho ki `✅ Server ready on http://0.0.0.0:10000` aa raha hai

2. **Test Health Endpoint**:
   - Browser mein open karo: `https://qrcraft-gura.onrender.com/api/route`
   - Response aana chahiye: `{"status":"ok","timestamp":"..."}`

3. **Test Tracking Feature**:
   - Main page pe jao
   - Koi bhi QR generate karo
   - **"Create Tracked QR"** button click karo
   - Success message aana chahiye: "QR code saved! You can now track scans."

## 🗄️ Database Notes

### Current Setup (SQLite)
- **Pros**: Setup easy, koi external database nahi chahiye
- **Cons**: Render free plan pe data **ephemeral** hai — restart/redeploy pe wipe ho jata hai

### For Production (PostgreSQL - Recommended)
Agar real users ke liye persistent analytics chahiye:

1. **Render Postgres Database Create Karo**:
   - Dashboard → **"New +"** → **"PostgreSQL"**
   - Free tier select karo
   - Database create karo

2. **Schema Update Karo**:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

3. **Environment Variable Update**:
   - Render Postgres ka internal URL copy karo (automatically milta hai)
   - `DATABASE_URL` ko usse replace karo
   - Format: `postgresql://user:pass@host/dbname`

4. **Redeploy**:
   - Code push karo
   - Prisma migrations automatically run honge

## 🐛 Common Issues

### Issue 1: "Tracking setup failed: Server error"
**Reason**: `DATABASE_URL` missing ya incorrect
**Fix**: Dashboard Environment tab check karo, exactly `file:./prisma/dev.db` hona chahiye

### Issue 2: QR scan karne pe redirect nahi ho raha
**Reason**: `NEXT_PUBLIC_APP_URL` missing
**Fix**: Environment tab mein add karo with full URL

### Issue 3: AI features kaam nahi kar rahe
**Reason**: API keys missing
**Fix**: `GROQ_API_KEY` aur `OPENROUTER_API_KEY` dono add karo

## 📊 Monitoring

### Check if Tracking is Working:
```bash
# Local development test
curl http://localhost:3000/api/route

# Production test
curl https://qrcraft-gura.onrender.com/api/route
```

### View Logs:
- Render Dashboard → Your Service → **"Logs"** tab
- Filter by "Error" to see issues only

## 🎯 Next Steps After Deployment

1. ✅ Verify all environment variables are set
2. ✅ Check deployment logs for errors
3. ✅ Test health endpoint
4. ✅ Create a tracked QR and test scanning
5. ✅ Check analytics dashboard

---

**Last Updated**: July 28, 2026  
**Service URL**: https://qrcraft-gura.onrender.com
