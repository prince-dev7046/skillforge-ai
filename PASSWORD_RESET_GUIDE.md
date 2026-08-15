# Password Reset Feature Documentation

## Overview
A complete password reset system has been implemented for the SkillForge AI application. This feature allows users to securely reset their forgotten passwords.

## Features Implemented

### Backend Components
1. **User Model Updates** (`backend/models/User.js`)
   - Added `passwordResetToken` field
   - Added `passwordResetExpires` field
   - Added automatic TTL index for token cleanup

2. **Email Service** (`backend/services/emailService.js`)
   - Flexible email configuration (Gmail, SMTP, or Ethereal for testing)
   - Professional HTML email templates
   - Test preview URLs for development

3. **Auth Routes** (`backend/routes/authRoutes.js`)
   - `POST /auth/forgot-password` - Request password reset
   - `GET /auth/verify-reset-token/:token` - Verify token validity
   - `POST /auth/reset-password` - Reset password with token

### Frontend Components
1. **ForgotPassword Page** (`src/pages/ForgotPassword.jsx`)
   - User-friendly form for email input
   - Success/error message handling
   - Auto-redirect to login on success

2. **ResetPassword Page** (`src/pages/ResetPassword.jsx`)
   - Token verification on load
   - Password strength feedback
   - Show/hide password toggle
   - Password confirmation validation

3. **Updated Login Page** (`src/pages/Login.jsx`)
   - "Forgot Password?" link in login form
   - Navigation to password reset flow

4. **Updated Routes** (`src/App.jsx`)
   - New routes for password reset flows
   - Protected route handling

## Email Configuration

### Option 1: Gmail (Recommended for Production)
1. Enable 2-Factor Authentication on your Google Account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Update `.env`:
```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password-from-google
EMAIL_FROM=noreply@skillforge.com
```

### Option 2: Custom SMTP Server
Update `.env`:
```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password
EMAIL_FROM=noreply@skillforge.com
```

### Option 3: Ethereal (Testing/Development)
- No configuration needed
- Email service automatically creates test account
- Check console for preview URLs

## API Endpoints

### 1. Request Password Reset
**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account exists with this email, a reset link has been sent"
}
```

### 2. Verify Reset Token
**Endpoint:** `GET /api/auth/verify-reset-token/:token`

**Response:**
```json
{
  "message": "Token is valid",
  "email": "user@example.com"
}
```

### 3. Reset Password
**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "newPassword": "new-password"
}
```

**Response:**
```json
{
  "message": "Password has been reset successfully"
}
```

## Frontend Usage

### Using the API in Components
```javascript
import { api } from "../services/api";

// Request password reset
await api.post("/auth/forgot-password", { email });

// Verify token
await api.get(`/auth/verify-reset-token/${token}`);

// Reset password
await api.post("/auth/reset-password", { token, newPassword });
```

## Security Features

1. **Token Expiration:** Reset tokens expire after 1 hour
2. **Token Hashing:** Tokens are hashed before storage using SHA256
3. **Password Hashing:** Passwords are hashed using bcryptjs (10 rounds)
4. **Email Validation:** Email hints not revealed for security (prevents email enumeration)
5. **Secure Reset Link:** Reset links contain unique, unguessable tokens
6. **HTTPS Recommended:** Use HTTPS in production

## Database Schema

### User Model Updates
```javascript
{
  ...existing fields,
  
  // Password reset fields
  passwordResetToken: {
    type: String,
    default: null,
  },
  
  passwordResetExpires: {
    type: Date,
    default: null,
  },
}
```

## Setup Instructions

### Backend Setup
1. Install dependencies:
   ```bash
   npm install nodemailer
   ```

2. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   MONGO_URI=your-mongodb-uri
   JWT_SECRET=your-secret
   FRONTEND_URL=http://localhost:5173
   
   # Email configuration (choose one option)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-app-password
   EMAIL_FROM=noreply@skillforge.com
   ```

3. Restart backend server

### Frontend Setup
1. Ensure `.env` has correct API URL:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

2. Routes are already configured in `App.jsx`

## Testing the Feature

### Manual Testing
1. Go to login page: http://localhost:5173/login
2. Click "Forgot Password?" link
3. Enter your test account email
4. Check email for reset link (or Ethereal preview URL)
5. Click the reset link
6. Enter new password and confirm
7. Login with new password

### Test Account
If you need to create a test account:
```bash
# Use the register endpoint
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
```

## Email Template

The email sent includes:
- Professional HTML formatting
- Reset button with direct link
- Plain text version for email clients without HTML support
- Expiration time notice (1 hour)
- Help text for spam folder issues

## Troubleshooting

### Email Not Sending
1. Check backend console for error messages
2. Verify email service configuration in `.env`
3. For Gmail: Ensure App Password is generated and correct
4. For SMTP: Test connection with `telnet` to SMTP server
5. Check firewall/network for port blocking

### Token Expiration Issues
- Default expiration: 1 hour
- Modify in `backend/routes/authRoutes.js` line with `Date.now() + 3600000`
- Change `3600000` (milliseconds) to desired duration

### Reset Link Not Working
1. Verify `FRONTEND_URL` is correct in `.env`
2. Check token is valid: `GET /api/auth/verify-reset-token/:token`
3. Ensure token hasn't expired (1 hour limit)

## Future Enhancements

Potential improvements:
- Two-factor authentication on password reset
- Email verification tokens
- Login attempt limiting
- Password history to prevent reuse
- Custom email templates per environment
- SMS option for password reset
- Social login integration

## Support

For issues or questions, refer to:
- Backend logs in terminal
- Email service error messages
- Frontend browser console errors
