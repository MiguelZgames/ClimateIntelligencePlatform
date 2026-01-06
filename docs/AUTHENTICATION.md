# Authentication Configuration

## Overview
The Climate Intelligence Platform uses a simplified authentication flow designed for immediate access. New users can register and access the dashboard instantly without email verification.

## Configuration Requirements

To enable this flow, the Supabase project must be configured to **disable email confirmations**.

### Steps to Configure (Supabase Dashboard)

1.  Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project (`trae_g92h6dug`).
3.  Navigate to **Authentication** > **Providers** in the sidebar.
4.  Click on **Email**.
5.  **Disable** the toggle for **Confirm email**.
    *   *Note: This allows users to sign in immediately after signing up.*
6.  Click **Save**.

## Security Implications

By disabling email confirmation:
*   **Pros**: Frictionless onboarding; immediate access for demos and internal tools.
*   **Cons**: Users can register with fake email addresses (e.g., `fake@test.com`).
*   **Mitigation**:
    *   The `users` table is still protected by Row Level Security (RLS).
    *   Admin functionality is restricted to users with the `admin` role (manually assigned).
    *   We enforce password complexity (min 6 chars) on the frontend.

## Registration Flow

1.  **User Input**: User enters Email and Password on `/login`.
2.  **Validation**: Frontend sanitizes email and checks password length.
3.  **Creation**: `supabase.auth.signUp()` is called.
4.  **Auto-Login**:
    *   **If Configured Correctly**: Supabase returns a valid `session`. The app redirects to `/dashboard`.
    *   **If Misconfigured**: Supabase returns a `user` but `session` is null. The app displays an error prompting the admin to change settings.

## Manual User Creation (Bypass)

If you cannot change the project settings immediately, you can use the admin script to force-create a verified user:

```bash
node scripts/create_user.js <email> <password>
```
