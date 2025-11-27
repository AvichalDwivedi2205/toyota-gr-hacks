# 🚀 Production Deployment Steps

## ✅ Issue Fixed
The WebSocket URL conversion bug has been fixed in commit `65dc9dd`.

## 🔧 Steps to Deploy to Production

### 1. **Verify Vercel Environment Variable**

Go to your Vercel project dashboard:
- Navigate to: **Settings** → **Environment Variables**
- Add/Verify this variable exists:
  - **Name**: `VITE_BACKEND_URL`
  - **Value**: `https://web-production-903eb.up.railway.app`
  - **Environments**: Check all (Production, Preview, Development)

⚠️ **CRITICAL**: Vite environment variables are bundled at **build time**, not runtime!

### 2. **Force Redeploy in Vercel**

Since the fix is already pushed, trigger a fresh deployment:

**Option A: Via Dashboard**
1. Go to Vercel Dashboard → Your Project
2. Click **"Deployments"** tab
3. Click the **three dots (...)** on the latest deployment
4. Select **"Redeploy"**
5. Make sure to check **"Use existing Build Cache"** is **UNCHECKED**

**Option B: Via Git (Force rebuild)**
```bash
cd /home/garudev/dev/ml/toyota-gr-hacks
git commit --allow-empty -m "Force Vercel rebuild"
git push origin master
```

### 3. **Clear Browser Cache**

After Vercel redeploys:
1. Open your production site
2. Hard refresh: **Ctrl + Shift + R** (Linux/Windows) or **Cmd + Shift + R** (Mac)
3. Or open DevTools → Network tab → Check "Disable cache"

### 4. **Verify the Fix**

Open Browser Console on production site and check for:

**✅ Good signs:**
```
Backend URLs: { 
  BACKEND_URL: "https://web-production-903eb.up.railway.app", 
  WS_URL: "wss://web-production-903eb.up.railway.app/ws" 
}
WebSocket connected
[WebSocket] Received track data
[WebSocket] Received race state: 20 cars, time: 0, race_started: false
```

**❌ Bad signs:**
```
Fetch API cannot load wss://... (means old cached version)
Backend URLs: { BACKEND_URL: "http://localhost:8000" } (means env var not set)
```

### 5. **Test the Race**

1. Click **"START RACE"** button
2. Cars should appear on the track
3. Leaderboard should update
4. No console errors

## 🐛 Troubleshooting

### Issue: Still seeing wss:// error
**Solution**: Clear browser cache completely or try incognito mode

### Issue: Cars in leaderboard but not on track
**Solution**: Check console for coordinate warnings:
- `TrackView: X cars received, but only Y have x/y coordinates`
- This means backend data structure might be different

### Issue: "http://localhost:8000" in production
**Solution**: 
1. Set `VITE_BACKEND_URL` in Vercel
2. Redeploy (environment variables require rebuild)

### Issue: WebSocket disconnected
**Solution**: 
1. Check Railway backend is running
2. Verify Railway URL is accessible: `https://web-production-903eb.up.railway.app/api/track`
3. Check Railway logs for errors

## 📊 Current Status

- ✅ Fix committed: `65dc9dd`
- ✅ Fix pushed to origin/master
- ⏳ Waiting for Vercel deployment
- ⏳ Environment variable needs verification

## 🔍 What Was Fixed

**File**: `f1-dashboard/src/components/SimulationControls.jsx`

**Before:**
```javascript
const baseUrl = wsUrl.replace('ws://', 'http://').replace('/ws', '');
```

**After:**
```javascript
const baseUrl = wsUrl.replace('/ws', '').replace('ws://', 'http://').replace('wss://', 'https://');
```

This ensures:
- `ws://localhost:8000/ws` → `http://localhost:8000` (local)
- `wss://web-production-903eb.up.railway.app/ws` → `https://web-production-903eb.up.railway.app` (production)

## 📝 Next Actions

1. [ ] Set `VITE_BACKEND_URL` in Vercel
2. [ ] Trigger redeploy in Vercel
3. [ ] Clear browser cache
4. [ ] Test production site
5. [ ] Verify cars appear on track

