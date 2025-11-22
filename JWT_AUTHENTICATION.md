# JWT Authentication System

## Overview

The AI Outfit Assistant now includes a complete JWT (JSON Web Token) authentication system with user registration, login, token refresh, and logout functionality.

## Features

✅ **User Registration** - Create new accounts with email/password
✅ **Secure Login** - Authenticate with bcrypt password hashing
✅ **JWT Tokens** - Access tokens (15 min) + Refresh tokens (7 days)
✅ **Auto-Refresh** - Automatic token refresh before expiration
✅ **Token Blacklist** - Secure logout with token revocation
✅ **Profile Management** - Update user name and password
✅ **Optional Authentication** - Endpoints work with or without auth

## Architecture

### Backend Components

#### 1. Authentication System (`backend/auth_system.py`)
- User database management (JSON-based)
- Password hashing with bcrypt
- Token blacklist management
- User CRUD operations

#### 2. Authentication Endpoints (`backend/auth_endpoints.py`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and blacklist token
- `GET /api/auth/me` - Get current user info
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/check-email` - Check email availability
- `GET /api/auth/stats` - Get authentication statistics

#### 3. JWT Configuration (`backend/app.py`)
- JWT secret key management
- Token expiration settings
- Blacklist checker
- Optional authentication helper

### Frontend Components

#### 1. Auth Store (`frontend/src/store/authStore.ts`)
- Zustand store with persistence
- JWT token management
- Auto-refresh mechanism (every 14 minutes)
- User state management

#### 2. Login Component (`frontend/src/components/Auth/Login.tsx`)
- Registration and login forms
- Input validation
- Error handling
- Seamless mode switching

## API Endpoints

### Registration

**Endpoint:** `POST /api/auth/register`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-01-15T10:30:00"
  },
  "access_token": "eyJ0eXAiOiJKV1...",
  "refresh_token": "eyJ0eXAiOiJKV1..."
}
```

**Validation:**
- Email: Valid email format required
- Password: Minimum 6 characters
- Name: Minimum 2 characters

### Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "access_token": "eyJ0eXAiOiJKV1...",
  "refresh_token": "eyJ0eXAiOiJKV1..."
}
```

### Token Refresh

**Endpoint:** `POST /api/auth/refresh`

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Response:**
```json
{
  "access_token": "eyJ0eXAiOiJKV1..."
}
```

### Logout

**Endpoint:** `POST /api/auth/logout`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

### Get Current User

**Endpoint:** `GET /api/auth/me`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-01-15T10:30:00"
  }
}
```

### Update Profile

**Endpoint:** `PUT /api/auth/profile`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "name": "Jane Doe",
  "password": "newPassword123"  // optional
}
```

**Response:**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "Jane Doe",
    "updated_at": "2025-01-15T11:00:00"
  }
}
```

### Check Email Availability

**Endpoint:** `POST /api/auth/check-email`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "available": false,
  "message": "Email already registered"
}
```

## Token Management

### Token Types

1. **Access Token**
   - Expires: 15 minutes
   - Used for API requests
   - Short-lived for security

2. **Refresh Token**
   - Expires: 7 days
   - Used to get new access tokens
   - Long-lived for convenience

### Auto-Refresh Mechanism

The frontend automatically refreshes access tokens every 14 minutes (before the 15-minute expiration):

```typescript
setInterval(async () => {
  const { isAuthenticated, refreshAccessToken } = useAuthStore.getState();
  if (isAuthenticated) {
    await refreshAccessToken();
  }
}, 14 * 60 * 1000); // 14 minutes
```

### Token Storage

Tokens are stored in localStorage via Zustand persist middleware:

```typescript
partialize: (state) => ({
  user: state.user,
  accessToken: state.accessToken,
  refreshToken: state.refreshToken,
  isAuthenticated: state.isAuthenticated,
})
```

## Security Features

### Password Security
- **Hashing:** bcrypt with automatic salt generation
- **Min Length:** 6 characters
- **Validation:** Server-side validation required

### Token Security
- **JWT Secret:** Environment variable (JWT_SECRET_KEY)
- **Blacklist:** Revoked tokens stored in `token_blacklist.json`
- **Expiration:** Short-lived access tokens
- **HTTPS Only:** Production deployments must use HTTPS

### Input Validation
- **Marshmallow Schemas:** Server-side validation
- **Email Format:** RFC 5322 compliant
- **SQL Injection:** Safe JSON-based storage
- **XSS Protection:** Input sanitization

## Environment Variables

### Backend (.env)

```bash
# JWT Secret Key for token signing
# Generate with: python3 -c "import secrets; print(secrets.token_hex(32))"
JWT_SECRET_KEY="your-jwt-secret-key-here"
```

**Important:** Generate a secure random key for production!

## Database Structure

### User Object (users_db.json)

```json
{
  "users": [
    {
      "id": "uuid-here",
      "email": "user@example.com",
      "password_hash": "$2b$12$...",
      "name": "John Doe",
      "created_at": "2025-01-15T10:30:00",
      "updated_at": "2025-01-15T10:30:00",
      "is_active": true,
      "email_verified": false
    }
  ]
}
```

### Token Blacklist (token_blacklist.json)

```json
{
  "tokens": [
    {
      "jti": "jwt-id-here",
      "blacklisted_at": "2025-01-15T10:30:00",
      "expires_at": "2025-01-15T10:45:00"
    }
  ]
}
```

## Frontend Usage

### Using Auth Store

```typescript
import { useAuthStore } from './store/authStore';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuthStore();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password123');
      console.log('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user?.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### Making Authenticated API Calls

The auth store automatically includes the access token in requests:

```typescript
const { accessToken } = useAuthStore.getState();

const response = await fetch('/api/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
});
```

## Error Handling

### Common Errors

1. **Invalid Credentials (401)**
   - Email or password incorrect
   - Account inactive

2. **Token Expired (401)**
   - Access token expired
   - Use refresh token to get new access token

3. **Token Blacklisted (401)**
   - Token was revoked via logout
   - User must login again

4. **Validation Error (400)**
   - Invalid email format
   - Password too short
   - Missing required fields

5. **User Already Exists (400)**
   - Email already registered
   - Use different email

### Error Response Format

```json
{
  "error": "Error message",
  "details": {
    "field": ["Validation message"]
  }
}
```

## Testing

### Manual Testing

1. **Registration:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
   ```

2. **Login:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123"}'
   ```

3. **Get Current User:**
   ```bash
   curl -X GET http://localhost:5000/api/auth/me \
     -H "Authorization: Bearer <access_token>"
   ```

4. **Logout:**
   ```bash
   curl -X POST http://localhost:5000/api/auth/logout \
     -H "Authorization: Bearer <access_token>"
   ```

### Frontend Testing

1. Navigate to the login page
2. Click "Sign Up" to create an account
3. Enter email, password, and name
4. Click "Create Account"
5. Verify successful login and redirect
6. Check localStorage for tokens
7. Test logout functionality
8. Test login with existing account

## Migration Notes

### Backward Compatibility

The authentication system is **optional** by default. Existing features continue to work without authentication:

- Outfit Rating
- Outfit Generation
- Fashion Arena
- Style Squad

Users can use the app without registering. However, registering enables:
- Personalized recommendations
- Outfit history
- Profile customization
- Social features

### Future Enhancements

1. **Email Verification**
   - Send verification emails
   - Require email confirmation

2. **Password Reset**
   - Forgot password flow
   - Email-based reset

3. **OAuth Integration**
   - Google Sign-In
   - Facebook Login

4. **Two-Factor Authentication**
   - TOTP support
   - SMS verification

5. **Session Management**
   - View active sessions
   - Revoke specific sessions

6. **User Preferences**
   - Store style preferences
   - Save favorite outfits
   - Personalized recommendations

## Deployment

### Railway Deployment

1. Add environment variable:
   ```
   JWT_SECRET_KEY=<generated-secret-key>
   ```

2. Generate secret key:
   ```bash
   python3 -c "import secrets; print(secrets.token_hex(32))"
   ```

3. Redeploy the application

### Cloudflare Workers (Frontend)

1. Update `.env.production`:
   ```
   VITE_API_URL=https://your-backend-url.railway.app
   ```

2. Build and deploy:
   ```bash
   npm run build
   npx wrangler deploy
   ```

## Troubleshooting

### Issue: "Token expired" errors

**Solution:** The auto-refresh should handle this. If it persists:
1. Check that the refresh token is valid
2. Verify the auto-refresh interval is running
3. Check browser console for errors

### Issue: "User already exists"

**Solution:** Use a different email or login with existing credentials

### Issue: Tokens not persisting

**Solution:**
1. Check localStorage is enabled
2. Verify Zustand persist is configured
3. Clear browser cache and try again

### Issue: CORS errors on login

**Solution:**
1. Verify backend CORS configuration includes frontend URL
2. Check that Authorization header is allowed
3. Ensure credentials are supported

## Security Best Practices

1. **Always use HTTPS in production**
2. **Generate a strong JWT secret key**
3. **Keep tokens secure (never log or expose)**
4. **Implement rate limiting on auth endpoints**
5. **Monitor for suspicious activity**
6. **Regular token blacklist cleanup**
7. **Hash all passwords with bcrypt**
8. **Validate all user inputs**
9. **Implement CSRF protection**
10. **Use secure, httpOnly cookies (future enhancement)**

## Summary

The JWT authentication system is now fully integrated into the AI Outfit Assistant:

- ✅ Complete backend API with 8 endpoints
- ✅ Frontend auth store with auto-refresh
- ✅ User registration and login flow
- ✅ Secure token management
- ✅ Optional authentication for backward compatibility
- ✅ Comprehensive error handling
- ✅ Production-ready security features

Users can now create accounts, login, and enjoy a personalized experience while maintaining backward compatibility for unauthenticated usage.
