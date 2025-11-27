# 🔍 Production Debug Guide

## Changes Made

Added comprehensive debug logging to both frontend and backend to help identify where the issue is occurring.

## 🚀 Deployment Steps

1. **Push changes to trigger deployment:**
   ```bash
   git push origin master
   ```

2. **Verify environment variable in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Ensure `VITE_BACKEND_URL` is set to: `https://web-production-eff74.up.railway.app`
   - If you need to add/update it, **redeploy after changing**

3. **Check Railway backend is running:**
   - Visit: `https://web-production-eff74.up.railway.app/`
   - You should see: `{"message":"Toyota GR Simulator WebSocket Server",...}`

## 📊 What to Look For in Logs

### Backend Logs (Railway)

Check Railway deployment logs for these messages:

#### ✅ **Successful Startup:**
```
[STARTUP] ========================================
[STARTUP] Toyota GR Simulator Server Starting...
[STARTUP] ========================================
[INIT] 🏁 Starting simulation initialization...
[INIT] Loading track waypoints...
[INIT] ✅ Loaded 14 waypoints
[INIT] Building track spline...
[INIT] ✅ Track spline built: 2000 points, length=XXXX.Xm
[INIT] Weather: {...}
[INIT] ✅ Simulation initialized: 20 cars, 36 laps
[STARTUP] ✅ Simulation initialized successfully
[STARTUP] ✅ Simulation loop task created
```

#### 🔌 **WebSocket Connections:**
```
[WebSocket] 🔌 New connection attempt from ('IP', PORT)
[WebSocket] ✅ Connection accepted. Total connections: 1
[WebSocket] ✅ Track data exists
[WebSocket] 📤 Sending track data: 2000 points
[WebSocket] 📤 Sending initial state: 20 cars, race_started=False
```

#### 📡 **API Calls:**
```
[DEBUG] /api/race-status called
[DEBUG] sim object: <__main__.RaceSim object at 0x...>, type: <class '__main__.RaceSim'>
[DEBUG] Returning status: {...}
```

#### ❌ **Error Indicators:**
```
[STARTUP] ❌ Error during startup: ...
[ERROR] Exception in get_race_status: ...
[WebSocket] ❌ Failed to send track data: ...
```

### Frontend Logs (Browser Console)

Open DevTools Console on your deployed Vercel site:

#### ✅ **Successful Connection Flow:**

1. **Backend Configuration:**
   ```
   🔧 Backend Configuration: {
     BACKEND_URL: "https://web-production-eff74.up.railway.app",
     WS_URL: "wss://web-production-eff74.up.railway.app/ws",
     VITE_BACKEND_URL: "https://web-production-eff74.up.railway.app",
     MODE: "production"
   }
   ```

2. **WebSocket Connection:**
   ```
   🔌 [WebSocket] Attempting to connect to: wss://web-production-eff74.up.railway.app/ws
   🔌 [WebSocket] WebSocket object created, waiting for connection...
   ✅ [WebSocket] Connection established successfully!
   ✅ [WebSocket] Ready state: 1
   ```

3. **Track Data Received:**
   ```
   🛤️ [WebSocket] Received track data: {
     points: 2000,
     total_length: XXXX.X
   }
   📦 [useRaceData] Received data: { type: "track", hasTrack: true, ... }
   🛤️ [useRaceData] Setting track data: { points: 2000, total_length: XXXX.X }
   ```

4. **Initial Race State:**
   ```
   📡 [WebSocket] Received race state: {
     cars: 20,
     time: 0,
     race_started: false,
     race_finished: false,
     hasCarsWithCoords: 20
   }
   📦 [useRaceData] Received data: { ..., hasCars: true, carsCount: 20, ... }
   ✅ [useRaceData] Race state update: 20 total cars, 20 with coordinates
   📍 [useRaceData] Sample car position: { name: "...", x: XXX, y: XXX, speed: XXX }
   ```

5. **After Starting Race:**
   ```
   🏁 [SimulationControls] Race started, fetching status
   🔍 [SimulationControls] Fetching race status from: https://...
   📡 [SimulationControls] Race status response: { status: 200, ok: true, ... }
   ✅ [SimulationControls] Race status data: { paused: false, speed_multiplier: 1.0, ... }
   ```

#### ❌ **Error Indicators:**

1. **Wrong Backend URL (localhost):**
   ```
   🔧 Backend Configuration: {
     BACKEND_URL: "http://localhost:8000",  ← WRONG!
     ...
   }
   ```
   **Solution:** Set `VITE_BACKEND_URL` in Vercel and redeploy

2. **WebSocket Connection Failed:**
   ```
   ❌ [WebSocket] Error occurred: { ... }
   🔌 [WebSocket] Connection closed: { code: 1006, reason: "", wasClean: false }
   ```
   **Solution:** Check Railway backend is running and accessible

3. **No Cars with Coordinates:**
   ```
   ⚠️ [useRaceData] No cars have x/y coordinates!
   ```
   **Solution:** Backend simulation issue - check Railway logs

4. **CORS Error:**
   ```
   Access to fetch at 'https://...' has been blocked by CORS policy
   ```
   **Solution:** Backend CORS is already configured, but check if backend is returning 500 errors

5. **Race Status Endpoint Failed:**
   ```
   ❌ [SimulationControls] Race status failed: { status: 500, ... }
   ```
   **Solution:** Check Railway logs for backend errors

## 🎯 Common Issues & Solutions

### Issue 1: Cars in Leaderboard but NOT on Track

**Symptoms:**
- Leaderboard shows drivers
- Track view is empty
- No console errors

**Debug Steps:**
1. Look for: `📍 [useRaceData] Sample car position:`
2. Check if x/y values are reasonable numbers (not NaN, not 0)
3. Look in TrackView logs for rendering

**Likely Cause:** Frontend rendering issue, not data issue

### Issue 2: No Data Received at All

**Symptoms:**
- Empty leaderboard
- No track
- "Loading..." states persist

**Debug Steps:**
1. Check: `🔧 Backend Configuration` - is URL correct?
2. Check: `✅ [WebSocket] Connection established` - did connection succeed?
3. Check: `📡 [WebSocket] Received` - any messages received?

**Likely Cause:** 
- Environment variable not set → wrong URL
- Railway backend not running
- Network/firewall issue

### Issue 3: 500 Errors from Backend

**Symptoms:**
```
GET https://web-production-eff74.up.railway.app/api/race-status net::ERR_FAILED 500
```

**Debug Steps:**
1. Check Railway logs for `[ERROR]` messages
2. Look for startup errors
3. Check if simulation initialized properly

**Likely Cause:**
- Backend crash during startup
- Missing dependencies in production
- Python environment issue

### Issue 4: CORS Errors

**Symptoms:**
```
Access to fetch at '...' has been blocked by CORS policy
```

**Debug Steps:**
1. Check Railway logs - is the request even reaching the backend?
2. If 500 error first, fix that - CORS error is secondary
3. Backend CORS is already configured for `*`

**Likely Cause:** Backend returning error before CORS headers can be set

## 📝 Next Steps

1. **Push the debug changes:**
   ```bash
   git push origin master
   ```

2. **Wait for deployments:**
   - Vercel: Watch dashboard for completion
   - Railway: Watch logs for restart

3. **Test and collect logs:**
   - Open production site
   - Open browser console (F12)
   - Start the race
   - Copy ALL console output

4. **Check Railway logs:**
   - Open Railway dashboard
   - Go to your deployment
   - View logs
   - Look for [STARTUP], [INIT], [WebSocket] messages

5. **Share logs if issue persists:**
   - Copy browser console output
   - Copy Railway backend logs
   - Look for ❌ or ⚠️ indicators

## 🔧 Environment Variable Reminder

**Vercel Settings:**
- Variable: `VITE_BACKEND_URL`
- Value: `https://web-production-eff74.up.railway.app`
- Scope: Production, Preview, Development

**Important:** After setting/changing environment variables in Vercel, you MUST redeploy!

## 📞 What to Report

If issue persists after this, provide:

1. ✅ Browser console output (all messages)
2. ✅ Railway backend logs (startup + runtime)
3. ✅ Backend Configuration from console
4. ✅ Whether WebSocket connected successfully
5. ✅ Sample of what data is being received
6. ✅ Any ❌ error messages

This will help pinpoint exactly where the pipeline is breaking!

