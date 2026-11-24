# Oullin

Oullin has two front-end clients in this repository:

- The web app is React with Vite and lives at the repository root.
- The mobile app is React Native with Expo and lives in `mobile/`.

## Web app

```bash
npm ci
npm run dev
```

Web routes are declared in `src/App.jsx`; screen components belong in `src/pages/`
and reusable UI belongs in `src/components/`.

Useful commands:

```bash
npm run build
npm run lint
```

## Mobile app

```bash
cd mobile
npm ci
npm start
```

The mobile app entry point is `mobile/App.js`. Screens are split between
`mobile/OnboardingScreen.js`, `mobile/HomeScreens.js`, `mobile/SearchScreen.js`,
and `mobile/AddressScreen.js`. `mobile/App.js` manages the screen stack: tabs
switch between the main sections, secondary screens can be opened from them,
and Android's back button returns to the previous screen.

To create an installable Android test APK, sign in to Expo and start an EAS
preview build:

```bash
cd mobile
npx eas-cli login
npx eas-cli init
npx eas-cli build --profile preview --platform android
```

EAS prints a download link when the build finishes. Internal iPhone builds also
require an Apple Developer account and registered test devices:

```bash
npx eas-cli build --profile preview --platform ios
```

## Team workflow

Both clients are shared through this Git repository. Create a branch, commit the
files you changed, and push it so teammates can fetch the work. Coordinate edits
to the same screen through branches or pull requests to avoid overwriting one
another's changes.
