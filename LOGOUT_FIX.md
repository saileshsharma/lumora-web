# Logout Redirect URI Fix

**Issue:** "Invalid redirect URI" error when clicking logout
**Status:** ✅ FIXED
**Date:** November 22, 2025

---

## Problem Description

When users clicked the logout button, they encountered an error:
```
Invalid redirect URI
```

This happened because Keycloak's `lumora-frontend` client was not configured with the `post.logout.redirect.uris` attribute, which is required for OAuth2 logout redirects.

---

## Root Cause

The Keycloak client had:
- ✅ Valid redirect URIs for login
- ❌ Missing post-logout redirect URIs configuration

According to OAuth2 specs, logout redirects must be explicitly whitelisted separately from login redirects.

---

## Solution

Updated the Keycloak `lumora-frontend` client configuration with:

```json
{
  "redirectUris": [
    "http://localhost:5174/*",
    "http://localhost:5173/*",
    "https://lumora.aihack.workers.dev/*"
  ],
  "attributes": {
    "post.logout.redirect.uris": "+"
  }
}
```

**Key Change:** The `+` value in `post.logout.redirect.uris` allows all valid redirect URIs to be used for post-logout redirects.

---

## How It Was Fixed

### Automated Fix Script

Created `fix_keycloak_logout.py` to automatically configure Keycloak:

```bash
python3 fix_keycloak_logout.py
```

The script:
1. Authenticates as Keycloak admin
2. Finds the `lumora-frontend` client
3. Sets redirect URIs for login
4. Sets `post.logout.redirect.uris` to `+` (allow all)
5. Updates the client configuration

---

## Verification

### Test Results

```bash
✅ Login successful
✅ Token obtained
✅ Logout successful (HTTP 204)
✅ Token invalidated
✅ No "Invalid redirect URI" error
```

### Manual Testing

1. Visit http://localhost:5174
2. Login with credentials
3. Click logout from header or profile page
4. ✅ Confirmation modal appears
5. ✅ Click "Yes, Logout"
6. ✅ Redirected to login page
7. ✅ No errors!

---

## Configuration Details

### Valid Redirect URIs

These URIs are now accepted for both login and logout:

1. **Local Development:**
   - `http://localhost:5174/*`
   - `http://localhost:5173/*`

2. **Production:**
   - `https://lumora.aihack.workers.dev/*`

### Post-Logout Behavior

After logout:
- User is redirected to: `window.location.origin`
- For local: `http://localhost:5174`
- For production: `https://lumora.aihack.workers.dev`
- Session cleared completely
- All tokens invalidated

---

## Code Changes

### No Code Changes Required

The fix was purely a Keycloak configuration update. The application code in `KeycloakProvider.tsx` already had the correct logout implementation:

```typescript
const logout = () => {
  keycloak.logout({
    redirectUri: window.location.origin,
  });
};
```

This code was correct all along - it just needed Keycloak to accept the redirect URI.

---

## Production Deployment

### Important Note

When deploying to production, you MUST configure the Keycloak client with:

1. **Add production redirect URI:**
   ```
   https://lumora.aihack.workers.dev/*
   ```

2. **Set post-logout redirect URIs:**
   ```
   post.logout.redirect.uris = +
   ```

### Using the Fix Script

The fix script can be run in any environment:

```bash
# Local
python3 fix_keycloak_logout.py

# Production (update KEYCLOAK_URL in script)
# Edit KEYCLOAK_URL to your production Keycloak URL
python3 fix_keycloak_logout.py
```

Or manually configure in Keycloak Admin Console:

1. Go to: `https://your-keycloak/admin`
2. Select realm: `lumora`
3. Go to: Clients → `lumora-frontend`
4. Scroll to: **Advanced Settings**
5. Find: **Post Logout Redirect URIs**
6. Set to: `+`
7. Save

---

## Impact

### Before Fix
- ❌ Logout caused "Invalid redirect URI" error
- ❌ Users couldn't logout properly
- ❌ Poor user experience

### After Fix
- ✅ Logout works smoothly
- ✅ Users redirected to login page
- ✅ Confirmation modal works
- ✅ Professional user experience
- ✅ OAuth2 compliant

---

## Related Files

- `fix_keycloak_logout.py` - Automated fix script
- `frontend/src/providers/KeycloakProvider.tsx` - Logout implementation
- `frontend/src/components/common/LogoutConfirmModal.tsx` - Confirmation UI
- `frontend/src/components/Layout/Header.tsx` - Header logout button
- `frontend/src/components/Profile/Profile.tsx` - Profile logout button

---

## Testing Checklist

After applying fix:

- [x] Logout from header menu works
- [x] Logout from profile page works
- [x] Confirmation modal appears
- [x] User redirected to login page
- [x] Session cleared
- [x] Tokens invalidated
- [x] No "Invalid redirect URI" error
- [x] Can login again after logout

---

## Technical Details

### OAuth2 Logout Flow

1. User clicks logout
2. Confirmation modal shown
3. User confirms
4. JavaScript calls: `keycloak.logout({ redirectUri: window.location.origin })`
5. Keycloak checks if redirect URI is in `post.logout.redirect.uris`
6. If valid, Keycloak:
   - Invalidates session
   - Clears cookies
   - Redirects to specified URI
7. User lands on login page

### Keycloak Client Attributes

```json
{
  "clientId": "lumora-frontend",
  "publicClient": true,
  "redirectUris": [
    "http://localhost:5174/*",
    "http://localhost:5173/*",
    "https://lumora.aihack.workers.dev/*"
  ],
  "webOrigins": [
    "http://localhost:5174",
    "http://localhost:5173",
    "https://lumora.aihack.workers.dev"
  ],
  "attributes": {
    "post.logout.redirect.uris": "+",
    "pkce.code.challenge.method": "S256"
  }
}
```

---

## Summary

✅ **Issue Fixed:** Logout redirect URI error resolved
✅ **Solution:** Configured `post.logout.redirect.uris` in Keycloak
✅ **Impact:** Users can now logout smoothly
✅ **Production:** Ready to deploy with same configuration

**Status:** RESOLVED - No further action needed for local development.
**Production:** Apply same fix to production Keycloak instance.

---

**Fixed by:** Automated configuration script
**Date:** November 22, 2025
**Tested:** ✅ All logout flows working
