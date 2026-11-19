# Gynecology-clinic

Arabic (RTL) OB/GYN clinic app: patient queue, visits, prescriptions, pregnancy calculator,
surgery log. Installable PWA with Firebase (Auth + Firestore) sync between devices.

## Sign-in and roles

Staff sign in with a Firebase **email/password** account. What an account can do comes from
its Firestore document `users/{uid}`:

| `role`      | Can do                                                         |
|-------------|----------------------------------------------------------------|
| `doctor`    | Everything, including deleting patients and editing the drug list |
| `secretary` | Register patients, manage the queue, add visits                |

Access is enforced on the server by [`firestore.rules`](firestore.rules), not by the page.

## One-time Firebase setup (project `hiam-khder`)

Do these in the [Firebase console](https://console.firebase.google.com/project/hiam-khder), in this order:

1. **Authentication → Sign-in method**: enable **Email/Password**, and **disable Anonymous**.
2. **Authentication → Users → Add user**: create one account for the doctor and one for each
   receptionist. Copy each account's **User UID**.
3. **Firestore → Data**: create a collection `users`. For each account add a document whose
   **Document ID is that UID**, with one field `role` (string) set to `doctor` or `secretary`.
4. **Firestore → Rules**: replace the rules with the contents of `firestore.rules` and click
   **Publish**. (Or with the Firebase CLI: `firebase deploy --only firestore:rules`.)
5. **Firestore → Data → settings**: delete the old `security` document (it held the PINs).
6. Open the app and sign in with the new accounts.

Until step 4 is published, the database is still protected only by whatever rules are there now.

## Data layout

- `patients/{id}`: patient profile, visits and surgeries. Visits keep only `photoCount`.
- `patients/{id}/photos/{visitId}`: the photos of one visit (`list` of JPEG data URLs).
  This keeps patient documents under Firestore's 1 MB limit. Photos load when the archive is opened.
- Each visit may hold `labs`: typed lab results (Hb, PLT, FBS, OGTT, TSH, urine, HBsAg,
  Toxo IgM, Rubella IgG, plus free text). Values outside the pregnancy reference points are
  shown in red; the reference points are in `LAB_TESTS` in `index.html` and can be adjusted.
- `settings/drugs`: the shared drug list.
- `users/{uid}`: staff roles (only editable from the console).

## Offline

`sw.js` caches the app, the Firebase SDK, Tailwind and fonts, so the app opens offline once it
has been opened online. A device that has signed in stays signed in offline, and changes sync
when the connection returns. The first sign-in on a device needs internet.
Change `CACHE_NAME` in `sw.js` on every release so installed copies update.
