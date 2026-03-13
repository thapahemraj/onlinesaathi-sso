---
sidebar_position: 5
title: API Reference
description: Complete API reference for the OnlineSaathi SSO platform
---

# API Reference

All API endpoints are prefixed with `/api`. Authentication uses **JWT Bearer tokens** unless stated otherwise.

**Base URL:** `https://your-domain.com/api`

---

## 🔐 Authentication (`/auth`)

### Register a New User
```http
POST /api/auth/register
```
**Body:**
```json
{
  "username": "hemraj",
  "email": "hemraj@example.com",
  "password": "StrongPass@123",
  "phoneNumber": "+9779800000000",
  "firebaseUid": "optional-firebase-uid"
}
```
**Response:** `201 Created`

---

### Login
```http
POST /api/auth/login
```
**Body:**
```json
{
  "email": "hemraj@example.com",
  "password": "StrongPass@123"
}
```
**Response:** `200 OK` — Returns JWT access token and user info.

---

### Check Email / Phone Exists
```http
POST /api/auth/check-email
```
**Body:**
```json
{ "email": "hemraj@example.com" }
```

---

### Forgot Password
```http
POST /api/auth/forgot-password
```
**Body:**
```json
{ "email": "hemraj@example.com" }
```
**Effect:** Sends an OTP to the user's email.

---

### Reset Password
```http
POST /api/auth/reset-password
```
**Body:**
```json
{
  "email": "hemraj@example.com",
  "otp": "123456",
  "newPassword": "NewPass@123"
}
```

---

### Logout
```http
POST /api/auth/logout
```

---

### Send Email Verification Code
```http
POST /api/auth/send-verification
```
**Body:**
```json
{ "email": "hemraj@example.com" }
```

---

### Verify Email Code
```http
POST /api/auth/verify-code
```
**Body:**
```json
{ "email": "hemraj@example.com", "otp": "123456" }
```

---

### Google Login
```http
POST /api/auth/google-login
```
**Body:**
```json
{
  "uid": "firebase-uid",
  "email": "hemraj@gmail.com",
  "displayName": "Hemraj Thapa",
  "photoURL": "https://..."
}
```

---

### Get User Profile
```http
GET /api/auth/profile
```
🔒 **Requires:** `Authorization: Bearer <token>`

---

### OIDC Discovery
```http
GET /api/auth/.well-known/openid-configuration
```
Returns OpenID Connect configuration for setting up this SSO as an Identity Provider.

---

## 👤 Profile (`/profile`)

🔒 All routes require authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profile` | Get full user profile |
| `PUT` | `/api/profile` | Update profile (name, bio, etc.) |
| `PUT` | `/api/profile/picture` | Update profile picture |
| `PUT` | `/api/profile/password` | Change password |
| `PUT` | `/api/profile/privacy` | Update privacy settings |
| `POST` | `/api/profile/change-email` | Request email change (sends OTP) |
| `POST` | `/api/profile/confirm-email-change` | Confirm email change with OTP |
| `DELETE` | `/api/profile/delete-account` | Delete account |
| `PUT` | `/api/profile/recovery-email` | Set recovery email |

### Addresses

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profile/addresses` | Get all addresses |
| `POST` | `/api/profile/addresses` | Add new address |
| `PUT` | `/api/profile/addresses/:id` | Update address |
| `DELETE` | `/api/profile/addresses/:id` | Delete address |

### Payment Methods

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/profile/payments` | Get all payment methods |
| `POST` | `/api/profile/payments` | Add payment method |
| `DELETE` | `/api/profile/payments/:id` | Remove payment method |
| `PUT` | `/api/profile/payments/:id/default` | Set as default payment |

---

## 💰 Wallet (`/wallet`)

🔒 All routes require authentication.

### Get Wallet Balance
```http
GET /api/wallet
```
**Response:**
```json
{
  "balance": 5000,
  "currency": "NPR",
  "walletId": "wallet-id"
}
```

---

### Get Transaction History
```http
GET /api/wallet/transactions
```
Returns a list of all wallet transactions (top-ups, transfers, debits).

---

### Top Up Wallet (Add Money)
```http
POST /api/wallet/topup
```
**Body:**
```json
{
  "amount": 1000,
  "method": "bank_transfer",
  "referenceId": "TXN-20240313-001",
  "screenshotUrl": "https://..."
}
```
See the [Add Money Guide](./add-money) for the full flow.

---

## 🔑 Two-Factor Authentication (`/2fa`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/2fa/status` | 🔒 | Check if 2FA is enabled |
| `POST` | `/api/2fa/setup` | 🔒 | Generate TOTP QR code / setup |
| `POST` | `/api/2fa/verify` | 🔒 | Verify code and enable 2FA |
| `DELETE` | `/api/2fa/disable` | 🔒 | Disable 2FA |
| `POST` | `/api/2fa/login-verify` | Public | Verify 2FA code during login |

---

## 📋 KYC (`/kyc`)

🔒 All routes require authentication.

| Method | Endpoint | Role Required | Description |
|--------|----------|--------------|-------------|
| `POST` | `/api/kyc/submit` | Any user | Submit KYC documents |
| `GET` | `/api/kyc/my-status` | Any user | Check own KYC status |
| `GET` | `/api/kyc/queue` | Agent+ | View pending KYC queue |
| `GET` | `/api/kyc/:id` | Agent+ | View KYC details |
| `PUT` | `/api/kyc/:id/claim` | Agent+ | Claim a KYC for review |
| `PUT` | `/api/kyc/:id/review` | Agent+ | Approve/reject KYC |
| `GET` | `/api/kyc/admin/all` | SubAdmin+ | Get all KYC records |

---

## 🛡️ OAuth 2.0 / OIDC (`/oauth`)

### Authorization Endpoint
```http
GET /api/oauth/authorize?client_id=...&redirect_uri=...&response_type=code&scope=openid profile&state=xyz&code_challenge=...&code_challenge_method=S256
```

### Get Consent Info
```http
GET /api/oauth/consent-info?client_id=...&scope=...
```

### Submit Consent
```http
POST /api/oauth/consent
```
**Body:**
```json
{
  "client_id": "app-client-id",
  "redirect_uri": "https://yourapp.com/callback",
  "scope": "openid profile email",
  "state": "xyz",
  "code_challenge": "...",
  "code_challenge_method": "S256",
  "approved": true
}
```

### Token Exchange
```http
POST /api/oauth/token
```
**Body:**
```json
{
  "grant_type": "authorization_code",
  "code": "auth-code",
  "client_id": "app-client-id",
  "client_secret": "YOUR_SECRET",
  "redirect_uri": "https://yourapp.com/callback",
  "code_verifier": "pkce-verifier"
}
```
**Response:**
```json
{
  "access_token": "...",
  "id_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### UserInfo
```http
GET /api/oauth/userinfo
```
🔒 **Requires:** `Authorization: Bearer <access_token>`

### JWK Set (Public Keys)
```http
GET /api/oauth/jwks
```

---

## 🏗️ Admin (`/admin`)

🔒 Requires `supportTeam` role or above.

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/api/admin/stats` | Support+ | Dashboard statistics |
| `GET` | `/api/admin/users` | Support+ | List all users |
| `GET` | `/api/admin/users/lookup` | Support+ | Search/lookup a user |
| `GET` | `/api/admin/users/by-role` | SubAdmin+ | Filter users by role |
| `DELETE` | `/api/admin/users/:id` | SubAdmin+ | Delete user |
| `PUT` | `/api/admin/users/:id` | SubAdmin+ | Update user |
| `PUT` | `/api/admin/users/:id/role` | SubAdmin+ | Assign role |

---

## 📦 Schemes (`/schemes`)

🔒 Requires authentication.

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| `GET` | `/api/schemes` | Any | List all active schemes |
| `GET` | `/api/schemes/eligible` | Any | Get schemes user is eligible for |
| `GET` | `/api/schemes/:id` | Any | Get scheme details |
| `POST` | `/api/schemes` | SubAdmin+ | Create scheme |
| `PUT` | `/api/schemes/:id` | SubAdmin+ | Update scheme |
| `DELETE` | `/api/schemes/:id` | SuperAdmin | Delete scheme |
| `GET` | `/api/schemes/admin/all` | SubAdmin+ | All schemes (admin view) |

---

## ⚙️ Response Format

All API responses follow a standard format:

**Success:**
```json
{
  "success": true,
  "message": "Operation completed",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## 🔒 Role Hierarchy

| Role | Level | Access |
|------|-------|--------|
| `user` | 1 | Basic app access |
| `agent` | 2 | KYC review queue |
| `supportTeam` | 3 | Admin panel, user lookup |
| `subAdmin` | 4 | User management, schemes |
| `superAdmin` | 5 | Full system access |
