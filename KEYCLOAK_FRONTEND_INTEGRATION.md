# Keycloak Frontend Integration Guide

## Overview

This guide explains how to integrate the React frontend with Keycloak authentication.

---

## Files Created

### Configuration
- `frontend/src/config/keycloak.ts` - Keycloak client configuration
- `frontend/.env.example` - Environment variables

### Providers
- `frontend/src/providers/KeycloakProvider.tsx` - React context provider

### Stores
- `frontend/src/store/keycloakAuthStore.ts` - Zustand store for auth state

### Components
- `frontend/src/components/Auth/KeycloakLogin.tsx` - Login/Register page
- `frontend/src/KeycloakApp.tsx` - Main app with Keycloak
- `frontend/src/main-keycloak.tsx` - Entry point with provider

---

## Installation

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This will install:
- `keycloak-js@^23.0.3` - Keycloak JavaScript adapter

### 2. Configure Environment Variables

Create `frontend/.env.local`:

```bash
# Backend API
VITE_API_URL=http://localhost:5001

# Keycloak Configuration
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=lumora
VITE_KEYCLOAK_CLIENT_ID=lumora-frontend
```

---

## Usage

### Option A: Use Keycloak (Recommended)

**Update `frontend/src/main.tsx`:**

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { KeycloakProvider } from './providers/KeycloakProvider';
import KeycloakApp from './KeycloakApp';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <KeycloakProvider>
      <KeycloakApp />
    </KeycloakProvider>
  </StrictMode>
);
```

### Option B: Keep Legacy Auth

Keep the existing `main.tsx` unchanged. Both systems can coexist.

---

## How It Works

### 1. Keycloak Provider

Wraps the entire app and manages Keycloak initialization:

```typescript
<KeycloakProvider>
  <KeycloakApp />
</KeycloakProvider>
```

**What it does:**
- Initializes Keycloak client
- Checks if user is already logged in (SSO)
- Manages token refresh automatically
- Provides authentication context to all components

### 2. Authentication Flow

```
User visits app
    ↓
KeycloakProvider initializes
    ↓
Check if user is authenticated
    ↓
┌─────────────────┬─────────────────┐
│  Authenticated  │ Not Authenticated│
│                 │                  │
│  Load user info │  Show login page │
│  Get roles      │                  │
│  Show main app  │  User clicks     │
│                 │  "Sign In"       │
│                 │       ↓          │
│                 │  Redirect to     │
│                 │  Keycloak        │
│                 │       ↓          │
│                 │  User logs in    │
│                 │       ↓          │
│                 │  Redirect back   │
│                 │       ↓          │
│                 │  Show main app   │
└─────────────────┴──────────────────┘
```

### 3. Token Management

**Automatic Token Refresh:**
- Tokens are refreshed every 4 minutes
- Keycloak tokens expire in 5 minutes by default
- Refresh happens before expiration
- User stays logged in seamlessly

**Manual Token Refresh:**
```typescript
import { getToken } from './config/keycloak';

const token = await getToken();
```

### 4. API Calls with Token

**Example using fetch:**

```typescript
import keycloak from './config/keycloak';

const makeAuthenticatedRequest = async () => {
  const response = await fetch('http://localhost:5001/api/protected', {
    headers: {
      'Authorization': `Bearer ${keycloak.token}`,
      'Content-Type': 'application/json',
    },
  });

  return response.json();
};
```

**Example with automatic token refresh:**

```typescript
import { getToken } from './config/keycloak';

const makeAuthenticatedRequest = async () => {
  // Automatically refreshes token if needed
  const token = await getToken();

  const response = await fetch('http://localhost:5001/api/protected', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  return response.json();
};
```

---

## Using Keycloak in Components

### 1. useKeycloak Hook

Access Keycloak functionality in any component:

```typescript
import { useKeycloak } from '../providers/KeycloakProvider';

function MyComponent() {
  const {
    keycloak,      // Keycloak instance
    authenticated, // boolean
    user,          // User info
    roles,         // User roles
    login,         // Login function
    logout,        // Logout function
    register,      // Register function
  } = useKeycloak();

  return (
    <div>
      {authenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={login}>Login</button>
      )}
    </div>
  );
}
```

### 2. Protected Components

**Using withKeycloak HOC:**

```typescript
import { withKeycloak } from '../providers/KeycloakProvider';

const ProtectedComponent = () => {
  return <div>This is only visible to authenticated users</div>;
};

export default withKeycloak(ProtectedComponent);
```

### 3. Role-Based Rendering

```typescript
import { useKeycloak } from '../providers/KeycloakProvider';

function AdminPanel() {
  const { roles } = useKeycloak();

  const isAdmin = roles.includes('admin');

  if (!isAdmin) {
    return <div>Access Denied</div>;
  }

  return <div>Admin Panel</div>;
}
```

### 4. Conditional Features

```typescript
import { useKeycloak } from '../providers/KeycloakProvider';

function Features() {
  const { roles } = useKeycloak();

  const isPremium = roles.includes('premium') || roles.includes('admin');

  return (
    <div>
      <h2>Available Features</h2>
      <ul>
        <li>✅ Outfit Rating</li>
        <li>✅ Outfit Generation</li>
        {isPremium && (
          <>
            <li>✅ Premium Analytics</li>
            <li>✅ Unlimited Generations</li>
            <li>✅ Priority Support</li>
          </>
        )}
      </ul>
    </div>
  );
}
```

---

## Keycloak Auth Store

For more complex state management, use the Zustand store:

```typescript
import { useKeycloakAuthStore } from '../store/keycloakAuthStore';

function MyComponent() {
  const {
    user,
    roles,
    isAuthenticated,
    hasRole,
    isPremium,
    isAdmin,
    login,
    logout,
  } = useKeycloakAuthStore();

  return (
    <div>
      <p>User: {user?.username}</p>
      <p>Premium: {isPremium() ? 'Yes' : 'No'}</p>
      <p>Admin: {isAdmin() ? 'Yes' : 'No'}</p>

      {hasRole('admin') && <button>Admin Action</button>}

      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

---

## Helper Functions

### Check User Roles

```typescript
import { getUserRoles, hasRole, hasAnyRole } from '../config/keycloak';

// Get all roles
const roles = getUserRoles();
console.log(roles); // ['user', 'premium']

// Check specific role
const isAdmin = hasRole('admin');

// Check any of multiple roles
const isPrivileged = hasAnyRole(['admin', 'premium']);
```

### Get User Info

```typescript
import { getUserInfo } from '../config/keycloak';

const user = getUserInfo();
console.log(user);
// {
//   id: "user-id",
//   username: "john.doe",
//   email: "john@example.com",
//   name: "John Doe",
//   email_verified: true
// }
```

---

## Migration from Legacy Auth

### Gradual Migration

You can run both authentication systems in parallel:

**1. Keep Both Entry Points:**
- `main.tsx` - Legacy JWT auth
- `main-keycloak.tsx` - Keycloak auth

**2. Switch Entry Point in index.html:**

```html
<!-- Legacy Auth -->
<script type="module" src="/src/main.tsx"></script>

<!-- Keycloak Auth -->
<script type="module" src="/src/main-keycloak.tsx"></script>
```

**3. Test Keycloak:**
- Start Keycloak
- Switch to main-keycloak.tsx
- Test authentication flow
- Verify all features work

**4. Final Migration:**
- Once tested, replace main.tsx content with main-keycloak.tsx
- Remove main-keycloak.tsx
- Update build configuration if needed

---

## Testing

### Local Testing

1. **Start Keycloak:**
   ```bash
   docker-compose -f docker-compose.keycloak.yml up -d
   ```

2. **Configure Keycloak:**
   - Follow KEYCLOAK_SETUP.md
   - Create test user

3. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Test Flow:**
   - Visit http://localhost:5174
   - Click "Sign In"
   - Redirected to Keycloak
   - Login with test user
   - Redirected back to app
   - Should see main app

### Test Scenarios

**1. Login Flow:**
- Click "Sign In" → Redirects to Keycloak
- Enter credentials → Redirects back
- Should be authenticated

**2. Register Flow:**
- Click "Create Account" → Redirects to Keycloak registration
- Fill form → Create account
- Redirects back → Should be authenticated

**3. Logout Flow:**
- Click "Logout" → Clears session
- Should see login page

**4. Token Refresh:**
- Wait 4 minutes
- Make API call
- Token should refresh automatically

**5. Social Login:**
- Click "Sign In"
- Choose Google/GitHub
- OAuth flow
- Should be authenticated

---

## Troubleshooting

### "Keycloak initialization failed"

**Check:**
1. Keycloak is running: `docker ps | grep keycloak`
2. Keycloak URL is correct in `.env.local`
3. Realm name matches: `lumora`
4. Client ID matches: `lumora-frontend`

**Fix:**
```bash
# Restart Keycloak
docker-compose -f docker-compose.keycloak.yml restart

# Check logs
docker-compose -f docker-compose.keycloak.yml logs -f keycloak
```

### "Invalid redirect URI"

**Fix:**
1. Go to Keycloak Admin Console
2. Clients → lumora-frontend
3. Add to Valid redirect URIs:
   ```
   http://localhost:5174/*
   http://localhost:5173/*
   ```
4. Save

### "Token expired"

**This is normal** - tokens expire in 5 minutes. The app automatically refreshes them.

**If auto-refresh fails:**
- Check browser console for errors
- Verify Keycloak is accessible
- User will be logged out and redirected to login

### "CORS Error"

**Fix:**
1. Check Keycloak Web Origins in client settings
2. Add:
   ```
   http://localhost:5174
   http://localhost:5173
   ```

### "User info not loading"

**Check:**
1. Token is valid
2. User exists in Keycloak
3. Email is verified (if required)
4. Check browser console for errors

---

## Best Practices

### 1. Always Use getToken() for API Calls

```typescript
// ❌ Don't do this
const token = keycloak.token;

// ✅ Do this (auto-refreshes)
const token = await getToken();
```

### 2. Handle Token Expiration

```typescript
try {
  const token = await getToken();
  // Make API call
} catch (error) {
  // Token refresh failed, user will be logged out
  console.error('Authentication failed');
}
```

### 3. Check Roles Before Rendering

```typescript
const { roles } = useKeycloak();

// Check role before showing admin features
if (roles.includes('admin')) {
  return <AdminPanel />;
}
```

### 4. Use Loading States

```typescript
const { initialized, authenticated } = useKeycloak();

if (!initialized) {
  return <Loading />;
}

if (!authenticated) {
  return <LoginPage />;
}

return <MainApp />;
```

---

## Security Considerations

### 1. Token Storage

**✅ Good:**
- Tokens are stored in memory by Keycloak
- Not stored in localStorage (XSS risk)
- Auto-refresh prevents expiration

**❌ Avoid:**
- Don't manually store tokens in localStorage
- Don't store refresh tokens in frontend

### 2. HTTPS in Production

**Always use HTTPS for:**
- Keycloak server
- Frontend application
- Backend API

### 3. Client Configuration

**Frontend client should be:**
- Type: `public` (no client secret)
- PKCE: Enabled (for security)
- Standard flow: Enabled
- Direct access grants: Optional

---

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure environment: Create `.env.local`
3. ⏳ Start Keycloak: Follow KEYCLOAK_SETUP.md
4. ⏳ Switch entry point: Update to use main-keycloak.tsx
5. ⏳ Test authentication flow
6. ⏳ Update API calls to use Keycloak tokens
7. ⏳ Migrate existing users
8. ⏳ Deploy to production

---

## Support

- **Keycloak JS Docs:** https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter
- **React Integration:** https://www.keycloak.org/docs/latest/securing_apps/#_react
- **Troubleshooting:** Check browser console and Keycloak logs

Ready to test the frontend integration! 🚀
