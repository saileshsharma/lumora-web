# CloudFlare Pages Deployment Fix

## Issue
CloudFlare is running `npx wrangler deploy` which is **INCORRECT** for CloudFlare Pages.

## Solution: Remove Deploy Command in CloudFlare Dashboard

### Step-by-Step Instructions:

1. **Go to CloudFlare Dashboard**
   - URL: https://dash.cloudflare.com
   - Login to your account

2. **Navigate to Your Project**
   - Click "Workers & Pages" in left sidebar
   - Find and click on your project (e.g., "lumora-frontend")

3. **Go to Settings**
   - Click "Settings" tab at the top
   - Click "Builds & deployments" in the left menu

4. **Edit Build Configuration**
   - Scroll down to "Build configuration" section
   - Click "Edit configuration" button

5. **CRITICAL: Update These Settings**
   ```
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist
   Root directory: outfit-assistant/frontend

   >>> DEPLOY COMMAND: npx wrangler pages deploy dist <<<
   ```

   **Note**: If deploy command is mandatory, use: `npx wrangler pages deploy dist`
   This is the **Pages** deploy command (different from Workers deploy)

6. **Important Notes**
   - If the field is mandatory, use: `npx wrangler pages deploy dist`
   - The key difference: `wrangler pages deploy` (not just `wrangler deploy`)
   - `wrangler deploy` = Workers (wrong) ❌
   - `wrangler pages deploy dist` = Pages (correct) ✅

7. **Save and Retry**
   - Click "Save" at the bottom
   - Go to "Deployments" tab
   - Click "Retry deployment" on the latest failed build

## Expected Build Output

You should see:
```
✓ Build command completed
✓ Deployment completed
```

You should **NOT** see:
```
Executing user deploy command: npx wrangler deploy  ❌ WRONG
```

## Correct CloudFlare Pages Settings

| Setting | Value |
|---------|-------|
| Framework preset | Vite |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | `outfit-assistant/frontend` |
| **Deploy command** | `npx wrangler pages deploy dist` |
| Node.js version | 20 (auto-detected) |

## Environment Variables

Don't forget to add in "Settings" → "Environment variables":
```
VITE_API_URL = https://web-production-c70ba.up.railway.app/api
```

## After Fix

Once you remove the deploy command and save:
1. The build will succeed
2. Deployment will happen automatically
3. Your site will be live at: `https://lumora-frontend.pages.dev`

## Why This Happens

CloudFlare Pages has two deployment modes:
1. **Pages (Static Sites)**: No deploy command needed ✅
2. **Workers**: Requires wrangler deploy ❌

Your project is a **static Vite site**, so it should use Pages mode (no deploy command).

The `npx wrangler deploy` command is for CloudFlare Workers, not Pages!
