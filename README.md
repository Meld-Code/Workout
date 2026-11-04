# Ember Arc — Firebase-ready workout app

A responsive workout tracking app with a workout library, XP/ranks, progress history, custom challenges, a workout generator, profile settings, and Firebase email/password authentication.

## Files
- `index.html` — app markup and Firebase compat SDK includes
- `style.css` — responsive styling
- `script.js` — workout app logic, Firebase Authentication, and Firestore sync
- `firebase-config.js` — **replace the placeholder values with your Firebase web app config**
- `firestore.rules` — owner-only Firestore security rules

## Firebase setup
1. Create a project at https://console.firebase.google.com/.
2. Add a Web App in Project settings → General → Your apps.
3. Copy its `firebaseConfig` values into `firebase-config.js`.
4. In Authentication → Sign-in method, enable **Email/Password**.
5. Create a Cloud Firestore database.
6. Open Firestore → Rules, paste the contents of `firestore.rules`, and click **Publish**.
7. Host the site on Firebase Hosting or another HTTPS static host. For local testing, use a local web server rather than opening `index.html` directly.

## Data model
Each signed-in user's data is stored in `users/{Firebase Auth UID}`. The rules allow that user to read and write only their own profile document. Unknown collections are denied.

## Security notes
- Firebase web config is intended to be present in browser code; it is not a service-account secret. Never add Admin SDK private keys to this project.
- Firestore rules protect users from reading or modifying **other people's** documents. Because this is a client-only app, an authenticated user can still modify their own XP/progress through browser tools. Preventing XP cheating requires trusted server-side validation (for example, Cloud Functions) and a more normalized data model.
- Do not store sensitive medical information in the profile.
- Account deletion removes the Firestore profile and then requests deletion of the Firebase Auth user. Firebase may require recent login before deleting the Auth account.
- Firebase Auth and Firestore usage may incur costs beyond the free quotas depending on traffic and configuration.

## Important
The Firebase config contains placeholders until you add your own project's values. Authentication and cloud sync will not work until configured and the rules are published.
