# Tachbonest Classic Ventures website

Pages: `index.html` (home) · `about.html` · `order-blinds.html` (blind orders + photo upload) · `order-food.html` (food list) · `admin.html` (back office)

## Step 1. Put it on GitHub Pages
1. Create a new repository on github.com (e.g. `tachbonest`).
2. Click **Add file → Upload files**, drag in **everything inside this folder** (index.html must be at the top level), then **Commit**.
3. Go to **Settings → Pages**, set Source to **Deploy from a branch**, branch **main**, folder **/ (root)**, then Save.
4. After about a minute your site is live at `https://YOUR-USERNAME.github.io/tachbonest/`.

## Step 2. Put in your details (js/config.js)
- Check both phone numbers and the WhatsApp number (international format, no +, e.g. `2348035613703`).
- There is no admin password in the code any more. The admin page only works with Firebase (Step 3).

## Step 3. Make orders from customers reach your admin page
GitHub Pages only hosts static files, so out of the box (`provider: 'local'`) an order is saved in the browser of whoever places it. Customers can still send it to you on WhatsApp from the confirmation screen, but it will NOT appear in your admin page. To fix that, connect a free Firebase database:

1. Go to https://console.firebase.google.com → **Add project**.
2. **Build → Firestore Database → Create database** (production mode).
3. **Build → Authentication → Get started → Email/Password → Enable**, then **Users → Add user** (your admin email and password).
4. **Project settings → Your apps → Web (</>)**, register an app, and copy the config values (`apiKey`, `authDomain`, `projectId`, `appId`).
5. In `js/config.js` set `provider: 'firebase'` and paste those values.
6. In Authentication → Settings → **Authorized domains**, add `YOUR-USERNAME.github.io`.
7. In Firestore → **Rules**, paste this and Publish:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /orders/{id}   { allow create: if true; allow read, update, delete: if request.auth != null; }
    match /products/{id} { allow read: if true; allow write: if request.auth != null; }
  }
}
```
Now open `admin.html` and sign in with the email and password from step 3.

## Using the admin page
- **Blind orders / Food lists**: view, change status, WhatsApp the customer, print a quotation sheet that matches your paper pad.
- **Products**: add or edit blinds and food items, set prices and upload real photos.
- **Backup & export**: download orders as CSV (Excel) or a full JSON backup.

## Notes
- Fonts load from Google Fonts, so visitors need internet.
- Customer photos are shrunk automatically (max 4 per order).
- In `local` mode, orders stay in the customer's browser and the admin page is switched off.
- `assets/logo.svg` is a clean redraw of your logo. Your original cropped from the photo is `assets/logo-original.png`. Replace `logo.svg` with a proper file from your designer if you have one.

## Phase 1 additions
- `cart.html`: one cart for food and blind quotations, delivery option, review step, then submit. Food and blinds are saved as separate orders so the current admin page keeps working.
- Delivery fees: set real amounts in `js/config.js` (`delivery`). `null` means "we confirm after you order".
- Product photos: put a JPG named after the product id in `assets/img/` (e.g. `f-rice.jpg`, `b-vert-plain.jpg`; ids are in `js/products.js`), or upload one in Admin > Products. If a photo is missing, a neutral "Photo coming soon" tile shows.
- No payment is taken on the site.

## Phase 2 additions
- `contact.html`: enquiry form. Enquiries are saved as orders with type `enquiry` (they show in the admin once phase 3 adds an Enquiries tab).
- Reviews: add real ones to `reviews` in `js/config.js`; the section stays hidden while it is empty.
- Social links: fill `social` in `js/config.js`; empty ones are hidden.
- Featured products = products with badge "Popular"; New arrivals = badge "New" (set badges in Admin > Products).


## Phase 3: use THESE Firestore rules instead of the ones in Step 3
Replace `YOUR-ADMIN-EMAIL` with the admin email you created in Authentication. Also go to Authentication > Settings > User actions and turn OFF "Enable create (sign-up)", so nobody else can make an account.
```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    function isAdmin() { return request.auth != null && request.auth.token.email == 'YOUR-ADMIN-EMAIL'; }
    match /orders/{id} {
      allow create: if request.resource.data.status == 'Pending'
        && request.resource.data.type in ['food','blind','request','enquiry']
        && request.resource.data.customer.name is string && request.resource.data.customer.name.size() <= 120;
      allow read, update, delete: if isAdmin();
    }
    match /tracking/{ref} {
      allow get: if true;
      allow list: if false;
      allow create: if request.resource.data.keys().hasOnly(['ref','status','type','updatedAt']) && request.resource.data.status == 'Pending';
      allow update, delete: if isAdmin();
    }
    match /products/{id} { allow read: if true; allow write: if isAdmin(); }
    match /settings/{id} { allow read: if true; allow write: if isAdmin(); }
  }
}
```
- My Orders (`my-orders.html`) shows only the status of a reference number. No names, phones or addresses are public.
- Customers can attach up to 3 files (400 KB each) and 4 pictures per order. They are stored inside the order, so the whole order must stay under about 1 MB. Bigger files should go on WhatsApp. For larger uploads later, use Firebase Storage (needs a billing plan).
- Admin tabs: Blind orders, Food lists, Own lists & files, Enquiries, Products (with stock), Settings, Backup.
