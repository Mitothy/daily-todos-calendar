# Render Deployment Guide

This guide walks you through deploying **MIT Daily Tracker** to Render.

---

## Part 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)

2. Create a new project or select an existing one

3. **Enable the Google Calendar API:**
   - Navigate to "APIs & Services" → "Library"
   - Search for "Google Calendar API" and enable it

4. **Create OAuth 2.0 credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Application type: **Web application**
   - Add **Authorized JavaScript origins:**
     - `https://mit-daily-tracker.onrender.com`
   - Add **Authorized redirect URIs:**
     - `https://mit-daily-tracker-api.onrender.com/auth/google/callback`

5. Copy the **Client ID** and **Client Secret** - you'll need these later

---

## Part 2: Deploy to Render

### Option A: Using render.yaml Blueprint (Recommended)

1. **Commit and push your changes:**
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin Render-Production
   ```

2. Go to [Render Dashboard](https://dashboard.render.com/)

3. Click **New** → **Blueprint**

4. Connect your GitHub repository

5. Select the `Render-Production` branch

6. Render will detect the `render.yaml` and create both services automatically

7. You'll be prompted to fill in the environment variables (see Part 3)

### Option B: Manual Deployment

#### Deploy Backend First

1. Go to Render Dashboard → **New** → **Web Service**

2. Connect your GitHub repository

3. Configure the service:
   - **Name:** `mit-daily-tracker-api`
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`

4. Add environment variables (see Part 3)

5. Click **Create Web Service**

6. Copy your backend URL (e.g., `https://mit-daily-tracker-api.onrender.com`)

#### Deploy Frontend

1. Go to Render Dashboard → **New** → **Static Site**

2. Connect your GitHub repository

3. Configure the service:
   - **Name:** `mit-daily-tracker`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`

4. Add environment variables (see Part 3)

5. **Add rewrite rule for SPA routing:**
   - Source: `/*`
   - Destination: `/index.html`

6. Click **Create Static Site**

---

## Part 3: Environment Variables

### Backend (`mit-daily-tracker-api`)

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `PORT` | `5002` |
| `GOOGLE_CLIENT_ID` | Your Google Client ID from Part 1 |
| `GOOGLE_CLIENT_SECRET` | Your Google Client Secret from Part 1 |
| `GOOGLE_REDIRECT_URI` | `https://mit-daily-tracker-api.onrender.com/auth/google/callback` |
| `SESSION_SECRET` | Click "Generate" or use a random 32+ character string |
| `FRONTEND_URL` | `https://mit-daily-tracker.onrender.com` |
| `LOG_LEVEL` | `info` |

### Frontend (`mit-daily-tracker`)

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | `https://mit-daily-tracker-api.onrender.com` |
| `VITE_GOOGLE_CLIENT_ID` | Your Google Client ID from Part 1 |

---

## Part 4: Update Google Cloud Console

After your services are deployed and you have the actual URLs:

1. Go back to [Google Cloud Console](https://console.cloud.google.com/)

2. Navigate to "APIs & Services" → "Credentials"

3. Edit your OAuth 2.0 Client ID

4. Update **Authorized JavaScript origins** with your actual frontend URL:
   - `https://mit-daily-tracker.onrender.com`

5. Update **Authorized redirect URIs** with your actual backend callback URL:
   - `https://mit-daily-tracker-api.onrender.com/auth/google/callback`

6. Save the changes

---

## Part 5: Verify Deployment

1. Visit your frontend URL (e.g., `https://mit-daily-tracker.onrender.com`)

2. Click "Sign in with Google"

3. Authorize the app with your Google account

4. Verify you can:
   - Create new tasks
   - View tasks on the calendar
   - Toggle task completion
   - See data persisted in your Google Calendar

---

## Troubleshooting

### "Failed to fetch" or CORS errors
- Verify `FRONTEND_URL` in backend matches your actual frontend URL exactly
- Check that `VITE_API_URL` in frontend matches your actual backend URL
- Ensure both URLs use `https://` (not `http://`)

### Google Sign-in fails
- Verify the Authorized JavaScript origins in Google Cloud Console
- Check that `GOOGLE_CLIENT_ID` matches in both frontend and backend
- Ensure `GOOGLE_REDIRECT_URI` matches the callback URL exactly

### Session/cookie issues
- Make sure `NODE_ENV=production` is set on the backend
- The app uses `sameSite: 'none'` and `secure: true` in production for cross-origin cookies

### First request is slow
- Render's free tier spins down after 15 minutes of inactivity
- First request may take 30-60 seconds while the service wakes up
- Consider upgrading to a paid plan for always-on services

---

## Important Notes

### Free Tier Limitations

- **Cold starts:** Services spin down after 15 minutes of inactivity. First request takes 30-60 seconds.
- **Ephemeral filesystem:** The `.event-cache.json` file won't persist across deploys. This means duplicate event prevention won't work across restarts, but won't cause data loss.

### Scaling Considerations

- **Session storage:** Currently uses in-memory sessions. If you scale to multiple instances, you'll need to add Redis for session storage.
- **Rate limits:** Google Calendar API has rate limits. For high-traffic apps, implement caching.

---

## Quick Reference

```
Frontend URL: https://mit-daily-tracker.onrender.com
Backend URL:  https://mit-daily-tracker-api.onrender.com
Health Check: https://mit-daily-tracker-api.onrender.com/health
```

Replace the URLs above with your actual Render URLs after deployment.
