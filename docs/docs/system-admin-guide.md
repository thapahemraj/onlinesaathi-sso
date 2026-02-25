---
sidebar_position: 4
---

# System Administration Guide

This guide is intended for system administrators who manage the Online Saathi SSO platform.

## 1. Accessing the Admin Dashboard

The Admin Dashboard is a restricted area. Access is strictly limited to users with the **`admin`** role.

### How to Access
1. Log in to the [User Portal](http://localhost:5173/login).
2. If your account has administrative privileges, you will see an "Admin Panel" link in your dashboard or navigation bar.
3. Alternatively, navigate directly to [http://localhost:5173/dashboard/admin](http://localhost:5173/dashboard/admin).

> [!IMPORTANT]
> **Authentication Check**: If a non-admin user attempts to access this URL, they will be automatically redirected back to the user dashboard or login page.

---

## 2. User Management

As an administrator, you have full control over the user base:
- **View All Users**: See a complete list of registered users.
- **Role Assignment**: Elevate regular users to `admin` or demote them.
- **Account Status**: Lock or unlock accounts in case of security concerns.
- **Audit Logs**: Review the login history and security actions of any user.

---

## 3. Application Management

Manage the ecosystem of applications that use Online Saathi for SSO:
- **Register New Apps**: Generate client IDs and secrets for internal or third-party applications.
- **Configuration**: Update redirect URIs and application metadata.
- **Usage Statistics**: Monitor which applications are most active.

---

## 4. Security Settings

Global security configurations can be managed here:
- **JWT Expiration**: Set the duration for session tokens.
- **2FA Enforcement**: View which users have enabled 2FA and assist with recovery if they lose access.
- **System Health**: Monitor the status of the backend services and database connections.

---

## 5. Maintenance Tasks

### Database Backups
Ensure that the MongoDB instance is backed up regularly.

### Log Rotation
Monitor the server logs for any unusual activity. Administrative actions are logged in the **Audit Log** section for accountability.
