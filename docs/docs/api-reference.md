---
sidebar_position: 3
---

# API Reference

Online Saathi provides a comprehensive REST API. For interactive documentation, please visit our [Swagger UI](https://api.i-sewa.in/api-docs).

## Base URL
```
https://api.i-sewa.in/api
```

## Authentication Endpoints

### Register User
Create a new user account.

- **URL**: \`/auth/register\`
- **Method**: \`POST\`
- **Body**:
  \`\`\`json
  {
    "username": "John Doe",
    "email": "john@example.com",
    "password": "securepassword",
    "phoneNumber": "1234567890" (optional)
  }
  \`\`\`

### Login User
Authenticate a user and receive a session cookie/token.

- **URL**: \`/auth/login\`
- **Method**: \`POST\`
- **Body**:
  \`\`\`json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  \`\`\`

### Get User Profile
Retrieve the currently authenticated user's profile. Requires a valid session cookie.

- **URL**: \`/auth/profile\`
- **Method**: \`GET\`
- **Response**:
  \`\`\`json
  {
    "_id": "user_id_here",
    "username": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
  \`\`\`

## OAuth Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| \`/oauth/authorize\` | GET | Initiates the OAuth flow. |
| \`/oauth/token\` | POST | Exchanges code for tokens. |
| \`/oauth/jwks\` | GET | Returns public keys for token verification. |
| \`/.well-known/openid-configuration\` | GET | OIDC Discovery document. |
