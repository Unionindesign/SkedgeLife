# Sign-in across the mobile app and the website

How accounts work today, and what the web app (#15, #19) needs so it doesn't build a second sign-in system.

## One set of accounts

Both apps talk to the same Supabase project, so an account made in the mobile app works on the website and the other way round. There's no separate web user table and nothing to sync.

What isn't shared is the *session*. Signing in on your phone doesn't sign you in on your laptop, as with any app. Each device keeps its own session:

| | Where the session lives | Client |
|---|---|---|
| Mobile (`apps/mobile`) | AsyncStorage on the device, refreshed while the app is in the foreground | `apps/mobile/src/lib/supabase.ts` |
| Web (`apps/web`, not built yet) | Cookies, so server-rendered pages know who's signed in | `@supabase/ssr` (`createServerClient` / `createBrowserClient`) |

## Shared sign-in code

Sign-up, log-in, log-out, and the handle check live in `packages/data` (`src/auth.ts`). Each function takes a Supabase client, so the web app calls the same functions with its cookie-based client:

- `signUp(client, { email, password, handle, displayName })`
- `logIn(client, email, password)`
- `logOut(client)`
- `isHandleAvailable(client, handle)`

Rules such as handle format, reserved words, and minimum password length stay in the database and Supabase settings, so both apps get them for free.

## Redirect URLs

Links in auth emails (confirmation, password reset, later passwordless codes) send people back to an allowed URL.

- **Local:** `supabase/config.toml` sets `site_url` to the Next.js dev server (`http://localhost:3000`) and allows any path under `localhost:3000` and `127.0.0.1:3000`.
- **Hosted:** set in the dashboard under Authentication → URL Configuration once the website has an address (`https://skedgelife.com`). There's a row in `docs/TODO.md`.
- **Mobile:** email confirmation is off until launch, so the app doesn't handle email links yet. When it does, it needs a deep link scheme (for example `skedgelife://`) added to the allowed list.

## When the web app is built (#19)

1. Add `@supabase/ssr` to `apps/web` and create server and browser clients from the same URL and publishable key.
2. Add the middleware that refreshes the session cookie on each request.
3. Use the `packages/data` auth functions for the forms.
4. Add an `/auth/callback` route for email links.
