# HB Plus Portal

Cross-platform (Android, iOS, Web) internal portal built with Expo + React Native Web + TypeScript. Google sign-in via Firebase Authentication, restricted to **@hbplus.fit** accounts, with a protected dashboard, role-based access (Admin/User) and Firestore user records.

## Features
Google sign-in on all platforms · centralized domain validation · verified-email check · auto sign-out of unauthorized users · protected routes (direct URL and refresh safe) · logout with session cleanup · loading/error states · Firestore profiles (uid, name, email, photo, role, createdAt, lastLoginAt) · server-enforced roles · responsive SaaS UI.

## Stack
Expo SDK 54, Expo Router, React Native Web, TypeScript, Firebase Auth + Firestore + Cloud Functions, `@react-native-google-signin/google-signin` (native), React Native Paper, AsyncStorage, Netlify.

## Screenshots
_Add `docs/login.png` and `docs/dashboard.png` after running the app._

## Structure
```
app/                 Expo Router routes (_layout, index=login, (app)/dashboard)
src/components       GoogleSignInButton, LoadingScreen, ProtectedRoute, UserProfileCard
src/config           firebase.ts
src/contexts         AuthContext.tsx
src/services         authService.ts, userService.ts
src/utils            domainValidator.ts
src/{types,constants,theme}
firebase/firestore.rules   functions/ (blocking functions, setUserRole, make-admin.js)
```

## Prerequisites
Node LTS, Git, a Firebase project, Android Studio (Android) and/or Xcode on macOS (iOS).

## Installation
```bash
npm install
npx expo install --fix      # aligns native package versions to your Expo SDK
cp .env.example .env        # then fill it in
```

## Firebase configuration
1. console.firebase.google.com → **Add project**.
2. **Build → Authentication → Sign-in method → Google → Enable**; set the support email. Also enable **Email/Password** (needed for Create Account). Optionally customize the verification/reset email templates under Authentication → Templates.
3. **Authentication → Settings → Authorized domains**: add `localhost` and your Netlify domain.
4. **Project settings → General → Your apps**: add a **Web app**, copy its config into `.env`.
5. Add an **Android app** (`fit.hbplus.portal`) with your debug SHA-1 (`cd android && ./gradlew signingReport`), download `google-services.json` to the repo root. Add an **iOS app** (`fit.hbplus.portal`), download `GoogleService-Info.plist` to the repo root. Both files are git-ignored.
6. After adding the SHA-1, re-download the config; copy the **Web client ID** (Authentication → Google → Web SDK configuration) into `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, and the iOS client ID into `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`. In `app.json` add the iOS reversed client ID URL scheme to the google-signin plugin: `["@react-native-google-signin/google-signin", {"iosUrlScheme": "com.googleusercontent.apps.XXXX"}]`.
7. **Build → Firestore Database → Create database** (production mode).
8. Deploy rules: `npm i -g firebase-tools && firebase login && firebase use <project-id> && firebase deploy --only firestore:rules`.
9. **Server-side blocking (recommended):** upgrade Authentication to **Identity Platform** and switch to the **Blaze** plan, then `cd functions && npm install && cd .. && firebase deploy --only functions`. In Authentication → Settings → Blocking functions, register `validateOnCreate` and `validateOnSignIn`. If you stay on Spark, rules-only enforcement still protects all data.
10. First admin: download a service account key (kept out of git), then `GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json node functions/make-admin.js you@hbplus.fit`. Sign out and in again.

## Create account (email + password)
`/signup` registers only `@hbplus.fit` emails (domain checked before the account is created, and again by the blocking function). Flow: create account → verification email sent → user is signed out → user clicks the link → logs in. Unverified users are signed out on login (a new link is re-sent) and cannot read or write Firestore (rules require `email_verified`). Password reset is available from the login form. Minimum password length is 8.

## Test mode (no login)
Set `EXPO_PUBLIC_ENABLE_TEST_MODE=true` in `.env` (or Netlify env vars) to show "Continue as User / Admin" buttons on the login screen. It opens the dashboard with sample data and a yellow TEST MODE banner. It is **UI-only**: no Firebase session is created, so Firestore and Cloud Functions still reject it, and it does not persist (refresh or direct URL returns to login; log out exits). Disabled by default; leave it off for real deployments.

## Authentication flow
Google ID token → `signInWithPopup` (web) or `GoogleSignin` + `signInWithCredential` (native) → Firebase blocking functions → client `assertAuthorized` (email present, verified, domain) → `upsertUserProfile` → dashboard. Unauthorized users are signed out and shown: *"Access restricted. Please login using your official domain email."*

## Domain restriction
- `src/utils/domainValidator.ts`: exact-match check on the part after `@` (so `x@hbplus.fit.evil.com` fails).
- `hd`/`hostedDomain` hint limits Google's account chooser (UX only).
- **Client checks can be bypassed**: the app runs on the user's device, and Firebase config is public, so anyone can call Firebase APIs directly. The authoritative layers are (a) blocking functions, which run on Google servers before a session exists, and (b) Firestore rules, which check `email_verified` and the email domain from the signed token on every request.

## Security implementation
No secrets in the client (only public Firebase config) · rules deny by default · users cannot set or change `role` (rules + custom claim set only by Admin SDK) · `setUserRole` callable is admin-only · persistence: IndexedDB (web) / AsyncStorage (native) · sign-out clears Firebase and Google sessions · routes guarded in `app/(app)/_layout.tsx`.

## Run
- **Web:** `npx expo start --web` (http://localhost:8081)
- **Android:** needs a dev build (not Expo Go): `npx expo run:android` with an emulator running (Android Studio → Device Manager, use a Google Play image).
- **iOS (macOS):** `npx expo run:ios` (Simulator).

## Deploy (Netlify)
Repo → Netlify "Import project". `netlify.toml` sets build `npx expo export --platform web`, publish `dist`, and SPA redirects. Add all `EXPO_PUBLIC_*` vars under Site settings → Environment variables, add the Netlify domain to Firebase authorized domains, redeploy, test login on the live URL.

## Testing checklist
1. @hbplus.fit account → dashboard. 2. Gmail → error message, signed out. 3. Yahoo → same. 4. Unverified email → blocked. 5. Open `/dashboard` while logged out → redirected to login. 6. Refresh dashboard while logged in → stays. 7. Logout → login screen; back button/URL can't reopen dashboard. 8. Turn off network and sign in → network message. 9. Android/iOS sign-in. 10. Web sign-in. Also verify rules in the Firebase Rules Playground: a non-hbplus token must be denied, and a user update changing `role` must be denied.

Extra scenarios for Create Account: sign up with a gmail address (blocked, no account created) · sign up with @hbplus.fit (verification email arrives) · log in before verifying (blocked, message shown) · log in after verifying (dashboard) · duplicate email (friendly error) · weak password.

Test mode: enable the flag, click Continue as User/Admin (dashboard shows banner and sample role) · refresh (returns to login) · flag off (buttons hidden).

## Future improvements
Admin user-management screen, audit log, dark mode, unit tests for the validator, E2E tests, App Check.
