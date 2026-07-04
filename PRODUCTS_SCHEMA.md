# OPTIMA Labs — Firestore & Storage Schema

New standalone Firebase project (separate from the Gym/APEXFIT project).
Compat SDK, mirroring the patterns from the existing store.

## Collections

### `products/{productId}`
Public read, admin-only write (see `firestore.rules`).

| Field | Type | Notes |
|---|---|---|
| `name` | string | e.g. `"Tirzepatide"` |
| `slug` | string | URL key for the detail page, e.g. `"tirzepatide"` → `product.html?slug=tirzepatide`. Unique. |
| `category` | string | One of the taxonomy values below |
| `description` | string | 1–2 sentences |
| `dosageOptions` | array&lt;map&gt; | `[{ mg: "10mg", price: 2250 }, …]` — variable pricing per strength |
| `price` | number | The "from" price shown on the card = the **lowest** `dosageOptions[].price` |
| `imageURL` | string | Firebase **Storage download URL** (not Base64), uploaded to `product_images/` |
| `verified` | boolean | Shows the gold "Verified" badge |
| `inStock` | boolean | Out-of-stock cards are dimmed and un-buyable |
| `coaURL` | string \| null | Optional link to that batch's Certificate of Analysis |
| `created_at` / `updated_at` | timestamp | `serverTimestamp()` |

### Category taxonomy (filter tabs)
`Weight Management` · `Recovery & Repair` · `Metabolic` · `Skin & Beauty` ·
`Longevity` · `Sleep & Calm` · `Intimacy` · `Supplies`

## Storage
- `product_images/{slug}_{filename}` — product photos. Same upload→`getDownloadURL()`
  pattern as `payment_proofs/` in the existing store.
- `coa/{slug}_{lot}.pdf` — optional certificate files (or link out to any URL).

## Cart (localStorage, key `optima_cart`)
Each item is a **self-contained snapshot** so the cart/checkout never depend on a
hardcoded product array:
```js
{ key, id, slug, name, category, imageURL, dosage /* "10mg" */, price, qty }
```
`key = `${slug}_${dosage}``.

## Admin
`admin-products.html` — Google sign-in gated on the Firebase custom claim
`{ admin: true }` (same mechanism as the existing orders admin). Add/edit products,
upload image to Storage, set dosage options + prices, toggle verified / inStock.

## One-time setup
1. Create a new Firebase project, enable **Firestore**, **Storage**, **Auth → Google**.
2. Paste the web config into `js/firebase-init.js` (marked `TODO`).
3. Deploy rules: `firebase deploy --only firestore:rules,storage:rules`.
4. Deploy the admin-claim function (`functions/index.js` → `setAdminClaim`) and set its secret:
   ```
   firebase functions:secrets:set ADMIN_SECRET
   firebase deploy --only functions
   ```
5. Grant the admin claim to each admin email (repeat per person — both users must have
   already signed in to the app **once** with Google so the Auth user record exists):
   ```
   curl -X POST https://asia-east1-<PROJECT_ID>.cloudfunctions.net/setAdminClaim \
     -H "Content-Type: application/json" \
     -H "x-admin-secret: <ADMIN_SECRET>" \
     -d '{"email":"jen.llames.fb@gmail.com"}'

   curl -X POST https://asia-east1-<PROJECT_ID>.cloudfunctions.net/setAdminClaim \
     -H "Content-Type: application/json" \
     -H "x-admin-secret: <ADMIN_SECRET>" \
     -d '{"email":"pankaj.ydv707@gmail.com"}'
   ```
   Each user must sign out/in (or wait for their ID token to refresh) for the new claim
   to take effect in `admin-products.html` / `seed.html`.
6. Open `seed.html` while signed in as admin → **Seed catalogue** to load all 20 products.
