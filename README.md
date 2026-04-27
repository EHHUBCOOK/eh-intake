# EH Intake Form — GitHub Pages

Essential Herbs event inquiry form. Hosted on GitHub Pages, submissions go to Google Sheets (EH LEADS).

---

## Setup (one-time, ~5 min)

### Step 1 — Create the Google Sheet + Apps Script

1. Go to [sheets.google.com](https://sheets.google.com) → create a new blank sheet → name it **EH LEADS**
2. Open **Extensions → Apps Script**
3. Delete the default code, paste the full contents of `google-apps-script.js`
4. Click **Save** (name the project anything, e.g. "EH Intake")
5. Click **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy** → copy the URL (looks like `https://script.google.com/macros/s/ABC.../exec`)

### Step 2 — Add the URL to the form

Open `index.html`, find this line:
```
var SHEET_URL = 'PASTE_YOUR_APPS_SCRIPT_URL_HERE';
```
Replace with your deployment URL. Save.

### Step 3 — Push to GitHub + enable Pages

```bash
git init
git add .
git commit -m "EH intake form"
gh repo create essential-herbs-intake --public --push --source=.
```

Then in GitHub → Settings → Pages → Source: **Deploy from branch → main → / (root)**

Your form will be live at: `https://[your-username].github.io/essential-herbs-intake/`

### Step 4 — Embed on Shopify

On essentialherbs.com → Pages → Book an Event → Edit HTML:

```html
<iframe
  src="https://[your-username].github.io/essential-herbs-intake/"
  style="width:100%;min-height:900px;border:none;"
  title="Book an Event">
</iframe>
```

---

## Re-deploying after changes

Any time you update `index.html`:
1. Push to GitHub (Pages auto-rebuilds in ~30 sec)
2. If you update `google-apps-script.js` → redeploy in Apps Script (Deploy → Manage → New version)

---

## Troubleshooting

- **Form submits but nothing in sheet** → check Apps Script deployment is set to "Anyone" access, redeploy as new version
- **"Continue" button not working** → open browser console, check for JS errors
- **Sheet headers missing** → the script auto-creates them on first submission
