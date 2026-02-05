---
sidebar_position: 3
---

# Integration Guide

Online Saathi uses standard **OAuth 2.0** and **OpenID Connect (OIDC)** protocols. You can use any standard OIDC client library to authenticate users.

### Endpoints

| Endpoint | URL | Description |
|----------|-----|-------------|
| **Authorization** | `/api/oauth/authorize` | Initiates the login flow. |
| **Token** | `/api/oauth/token` | Exchanges code for tokens. |
| **User Info** | `/api/oauth/userinfo` | Fetches user profile. |

> **Note**: These endpoints are relative to your IdP base URL (e.g., `http://localhost:5000`).

## Example (Node.js / Express)

Using `passport-openidconnect`:

```javascript
const passport = require('passport');
const OIDCStrategy = require('passport-openidconnect').Strategy;

passport.use('oidc', new OIDCStrategy({
    issuer: 'http://localhost:5000',
    authorizationURL: 'http://localhost:5000/api/oauth/authorize',
    tokenURL: 'http://localhost:5000/api/oauth/token',
    userInfoURL: 'http://localhost:5000/api/oauth/userinfo',
    clientID: 'YOUR_CLIENT_ID',
    clientSecret: 'YOUR_CLIENT_SECRET',
    callbackURL: 'http://localhost:3000/callback',
    scope: 'openid profile email'
  },
  function(issuer, sub, profile, accessToken, refreshToken, done) {
    return done(null, profile);
  }
));
```
