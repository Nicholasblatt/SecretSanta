# Secret Santa / Amigo Secreto

A bilingual, mobile-friendly family gift exchange, hosted at **https://ssproj-770af.web.app**.

## How it works

1. Add 3–100 people with unique names. Matching preferences are optional.
2. **Would love to buy for / Gostaria de presentear** lists people this participant prefers to give to. The draw fulfills as many preferences as a valid assignment allows.
3. **Shouldn’t buy for / Não deve presentear** excludes those pairings. Exclusions always apply; preferences never override them.
4. Draw names, then copy and send each participant their own link. Recipients are hidden behind a reveal button.

Every person gives once and receives once, and nobody draws themselves. Rules are directional: excluding João for Ana does not also exclude Ana for João. Enter both rules when needed. Separate names with commas; full names and accents are supported. Old space-separated lists of first names also work. Unknown names, contradictory rules, and impossible draws receive useful errors instead of hanging.

Groups and current draw links are saved in this browser's local storage. There is no account, database, or messaging integration. Refreshing restores the exchange; “Start fresh” clears it. Editing a name updates matching rules, and removing a participant removes references to them. Changing a completed exchange requires confirmation and a new draw.

## Reveal links and compatibility

New links encrypt the giver and recipient with Web Crypto AES-GCM. The ciphertext, random key, and IV are in the URL fragment, which is not sent to the hosting server. **The link is the access credential: anyone with the full link can reveal its match.** Send individual links privately. The organizer's browser stores links, so use a trusted device.

A redraw cannot revoke links already sent: old links retain their original matches. The UI explains this before redrawing or changing a completed group. Links copied after changing language open in the selected language.

Both previous reveal formats are supported: the deployed site's CryptoJS AES `?name=` links and the GitHub version's original XOR links. The legacy CryptoJS dependency is loaded locally only to open old AES links; all new links use native Web Crypto. The `legacy/` folder preserves the bilingual site recovered from Firebase before the redesign and is excluded from deployment.

## Local development

Requires Node.js 22 or later. No framework or bundler is needed.

```sh
npm ci
npm test
npm run build
npm run dev
```

Open **http://127.0.0.1:4173**. Run `npm run build` and reload after source edits.

- `SecretSanta.js`: organizer and reveal UI, participant editing, local persistence, clipboard, and confirmation dialogs.
- `translations.js`: English and Brazilian Portuguese copy.
- `draw.js`: validated, randomized minimum-cost assignment (Hungarian algorithm, O(n³)).
- `parseQueryParams.js`: new encrypted links and legacy compatibility.
- `style.css`, `gift.svg`, `favicon.svg`: responsive design and original vector assets.
- `tests/draw.test.js`: assignment invariants, exclusions, preferences, impossible cases, Unicode, translations, and new/legacy link compatibility.

Google Fonts supplies DM Sans and Libre Caslon Display, with system and Georgia fallbacks. No family names are sent to a database; fonts and static assets make ordinary network requests.

## Firebase deployment

The existing project and hosting site are both `ssproj-770af`. `.firebaserc` and `firebase.json` explicitly target this site. Only the build output in `dist/` is published, with revalidation on each request. Builds version the script, stylesheet, and imported module URLs so old browser caches cannot mix the previous site with the new app.

```sh
firebase login
npm run deploy
```

Deployment only changes Firebase Hosting; it does not change Firestore, Authentication, billing, or other Firebase services.
