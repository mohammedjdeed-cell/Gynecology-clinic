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

## Design

The look follows Samsung One UI 9: a large page title at the top, flat rounded cards on a soft grey
ground (black in dark mode), pill buttons, filled inputs without outlines, a floating bottom bar on
phones and dialogs that rise from the bottom. Icons are Lucide line icons (`ic('name')` in code), never
emoji. It is the "One UI 9 layer" CSS at the end of the first `<style>` in `index.html`, on top of the
existing colour tokens.

Motion and gestures live in the last `<script>` of `index.html` (phones; off when the device asks for
reduced motion). The app is right-to-left, so the tabs run from اليوم (right) to المالية (left):

- Drag the page to the right for the next tab, to the left for the previous one; a quick flick works too.
- Pull down at the top of a screen to reload the records.
- The large title shrinks on scroll and moves into the top bar.
- Dialogs have a grab handle: drag down from the top of a dialog to close it.
- The phone's Back button/gesture never leaves the app. In order it closes the open dialog, closes the
  settings menu, clears the search, returns to اليوم from another tab, scrolls to the top, and on Today
  only shows a hint (to exit, use the phone's Home button).
- A dialog with something typed in it refuses to close by gesture or Back (it shakes and says so);
  the × button still closes it.
