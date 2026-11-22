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

### Google sign-in

Accounts can also sign in with Google. The simplest path is to create the email/password account
first, sign in, then open **الحساب والإعدادات → ربط حساب Google**. Linking keeps the same UID, so the
existing `users/{uid}` role applies and both sign-in methods work afterwards.

Signing in with Google *without* linking first creates a new account with a new UID; it shows
"account not activated" until a `users/{uid}` document is added for that UID.

Google-only accounts confirm deletions with a Google pop-up instead of a password. Needs
**Authentication → Sign-in method → Google** enabled, and the app's domain in
**Authentication → Settings → Authorized domains**.

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

Each visit and each operation is its own document, so a save only sends what changed and two
devices editing the same patient cannot overwrite each other.

- `patients/{id}`: patient profile only, with `schemaVersion: 2`.
  The profile also holds `pregnancies`: one entry per pregnancy (`lmp`, `status` active/ended,
  `outcome`, `endDate`, linked `surgeryId`, `baby`). Patients saved before this get the list built
  from their operations and visits the first time they are opened. Pregnancy visits carry `pregnancyId`.
- `patients/{id}/visits/{visitId}`: one visit (`photoCount` only; the photos are separate).
- `patients/{id}/surgeries/{surgeryId}`: one operation / delivery.
- `patients/{id}/photos/{visitId}`: the photos of one visit (`list` of JPEG data URLs). Adding new
  photos was removed to keep the app light; visits that already have photos still show them.

Older versions kept `visits` / `surgeries` as arrays inside the patient document. The doctor's
device moves them into the documents above automatically, one patient at a time, and keeps a
copy in `legacyVisits` / `legacySurgeries` as a backup. Until `firestore.rules` with the
visits/surgeries rules is published, the app keeps saving the old way and retries every minute.

- Each visit may hold `labs`: typed lab results (Hb, PLT, FBS, OGTT, TSH, urine, HBsAg,
  Toxo IgM, Rubella IgG, plus free text). Values outside the pregnancy reference points are
  shown in red; the reference points are in `LAB_TESTS` in `index.html` and can be adjusted.
- `settings/drugs`: the shared drug list. Each drug has `name`, `company`, `category`
  (pregnancy, hormones, antibiotics, painkillers, vaginal, other), `favorite`, and up to 3 `doses`.
  Drugs saved before categories existed get one guessed from their name. Only the doctor can edit it.
- `users/{uid}`: staff roles (only editable from the console).

## Offline

`sw.js` caches the app, the Firebase SDK, Tailwind and fonts, so the app opens offline once it
has been opened online. A device that has signed in stays signed in offline, and changes sync
when the connection returns. The first sign-in on a device needs internet.
Change `CACHE_NAME` in `sw.js` on every release so installed copies update.


