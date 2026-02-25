---
sidebar_position: 2
---

# OAuth Integration Guide

This guide explains how to integrate your application with **Online Saathi SSO** using the OAuth 2.0 Authorization Code flow.

## Prerequisites

- **Client ID**: Your application's unique identifier.
- **Client Secret**: A secret key known only to your application and Online Saathi.
- **Redirect URI**: The URL where Online Saathi will send users after they log in.

## The Authorization Flow

### Step 1: Redirect User to Login

Redirect the user's browser to the Online Saathi authorization endpoint:

```http
GET http://localhost:5000/api/oauth/authorize?
  response_type=code
  &client_id=YOUR_CLIENT_ID
  &redirect_uri=YOUR_REDIRECT_URI
  &scope=openid profile email
```

- **client_id**: Your App's Client ID.
- **redirect_uri**: Must match one of the URIs registered for your app.
- **scope**: Space-separated list of permissions (e.g., `openid profile email`).

### Step 2: Handle the Callback

After the user logs in, they will be redirected back to your `redirect_uri` with a `code` parameter.

```http
GET https://your-app.com/callback?code=AUTHORIZATION_CODE
```

### Step 3: Exchange Code for Token

Make a POST request to the token endpoint to exchange the authorization code for an ID Token and Access Token.

```json
{
  "grant_type": "authorization_code",
  "client_id": "YOUR_CLIENT_ID",
  "client_secret": "YOUR_CLIENT_SECRET",
  "code": "AUTHORIZATION_CODE",
  "redirect_uri": "YOUR_REDIRECT_URI"
}
```

Endpoint: `POST http://localhost:5000/api/oauth/token`

### Step 4: Verify and Use Token

The response will contain an `id_token` (JWT) which contains user information. You should verify the signature of this token using our JWKS endpoint.

**JWKS Endpoint**: `http://localhost:5000/api/oauth/jwks`

## Example (Node.js)

```javascript
const axios = require('axios');

async function getUser(code) {
  const tokenResponse = await axios.post('http://localhost:5000/api/oauth/token', {
    grant_type: 'authorization_code',
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    code: code,
    redirect_uri: process.env.REDIRECT_URI
  });

  const { id_token, access_token } = tokenResponse.data;
  // Decode id_token to get user info
  return jwt.decode(id_token);
}
```
