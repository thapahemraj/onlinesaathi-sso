---
sidebar_position: 2
---

# Register an Application

To integrate your application (Web, Mobile, or API) with Online Saathi, you must first register it in the Admin Dashboard. This process generates the **Client ID** and **Client Secret** needed for authentication.

## Prerequisites

- You must have an **Admin** account.
- You must be logged in to the [Admin Dashboard](/dashboard/admin).

## Step-by-Step Guide

### 1. Navigate to Application Management
1. Log in to the Admin Dashboard.
2. In the sidebar, click on **Applications (OAuth)**.

### 2. Create a New Registration
1. Click the **+ New registration** button in the top right.
2. Fill in the **Display Name**. This is the name your users will see on the login screen (e.g., "My HR Portal").
3. (Optional) Enter a **Homepage URL**.
4. Click **Save**.

### 3. Configure Redirect URIs
After creating the app, you will be redirected to the details page.
1. Scroll to the **Authentication** section.
2. Enter your **Redirect URIs** in the text box (one per line).
   - These are the URLs where the Identity Provider is allowed to send tokens.
   - Example: \`https://myapp.com/callback\` or \`http://localhost:3000/api/auth/callback\`.
3. Click **Save Changes**.

### 4. Get Your Credentials
1. On the application details page, look for the **Credentials** section.
2. **Client ID**: This is your public identifier. You can share this.
3. **Client Secret**: This is a secret key. **Copy it immediately** and store it securely. You may not be able to see it again.

:::danger Security Warning
Never share your **Client Secret** or commit it to public source control. If you suspect it has been compromised, use the **Regenerate Secret** button in the dashboard.
:::
