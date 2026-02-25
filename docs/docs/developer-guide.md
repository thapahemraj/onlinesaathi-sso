---
sidebar_position: 2
---

# Developer Guide

Integrate your applications with Online Saathi SSO using standard OAuth2 and OpenID Connect (OIDC) protocols.

## 1. Registering Your Application

Before you can integrate, you must register your application in our system:
1. Log in as an **Admin**.
2. Navigate to **Applications** in the Admin Dashboard.
3. Click **Register an application**.
4. Provide a name, description, and your **Redirect URIs**.
5. Save to receive your **Client ID** and **Client Secret**.

> [!WARNING]
> Keep your **Client Secret** private. Never share it in public repositories or frontend code.

---

## 2. Integration Steps

### Step 1: Redirect to Authorization Endpoint
Redirect your users to our authorization URL to start the sign-in flow:

```text
GET http://localhost:5000/api/oauth/authorize?
  response_type=code&
  client_id=YOUR_CLIENT_ID&
  redirect_uri=YOUR_REDIRECT_URI&
  scope=openid profile email&
  state=YOUR_RANDOM_STATE
```

### Step 2: Receive Authorization Code
After the user approves, we will redirect them back to your `redirect_uri` with a `code`:

```text
YOUR_REDIRECT_URI?code=AUTH_CODE&state=YOUR_RANDOM_STATE
```

### Step 3: Exchange Code for Token
Exchange the authorization code for an ID token and access token by calling our token endpoint from your server:

```bash
POST http://localhost:5000/api/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=AUTH_CODE&
client_id=YOUR_CLIENT_ID&
client_secret=YOUR_CLIENT_SECRET&
redirect_uri=YOUR_REDIRECT_URI
```

---

## 3. API Reference

### User Info Endpoint
Get details about the authenticated user using their access token.

```bash
GET http://localhost:5000/api/oauth/userinfo
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Scopes
| Scope | Description |
| :--- | :--- |
| `openid` | Basic OIDC identity |
| `profile` | Name, username, and profile picture |
| `email` | User's email address |
| `phone` | User's phone number |

---

## 4. Best Practices

1. **Use PKCE**: For mobile and single-page apps (SPAs), always use Proof Key for Code Exchange (PKCE).
2. **Validate State**: Always verify the `state` parameter to prevent CSRF attacks.
3. **HTTPS**: Only use HTTPS for redirect URIs in production.
