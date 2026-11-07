# Ayatullah Syed Sibtain Abbas Rizvi — Official Q&amp;A Website

Welcome to the official source repository for the website of **Ayatullah Syed Sibtain Abbas Rizvi**. This static, zero-backend portal presents the scholar's biography, publishes his legal rulings and answered inquiries grouped by topic, allows believers to submit questions without an account, and provides verified office and donation details.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Folder Layout](#folder-layout)
4. [Running the Site Locally](#running-the-site-locally)
5. [Scholar's Publishing Guide (Plain Language)](#scholars-publishing-guide-plain-language)
   - [How to Add a New Answer](#1-how-to-add-a-new-answer)
   - [How to Edit an Existing Answer](#2-how-to-edit-an-existing-answer)
   - [How to Delete an Answer](#3-how-to-delete-an-answer)
   - [How to Add a New Topic](#4-how-to-add-a-new-topic)
   - [How to Update Contact or Donation Details](#5-how-to-update-contact-or-donation-details)
   - [How to Put Changes Live (Git Push)](#6-how-to-put-changes-live)
6. [Data Integrity & Validation](#data-integrity--validation)
7. [Vercel Deployment Setup](#vercel-deployment-setup)
8. [Privacy & Security Rules](#privacy--security-rules)

---

## Project Overview

The website provides an accessible digital presence for Ayatullah Syed Sibtain Abbas Rizvi, residing in the Holy City of Qum (Iran) and India. It is inspired by the structured Q&A experience of classic scholarly portals (such as sistani.org), but built using modern, responsive, mobile-first web standards with an emerald (`#1B5E20`) and warm gold (`#C8A951`) palette.

### Key Capabilities
- **Biographical Timeline:** Strictly verified hawza studies in Anwarul Uloom (Allahabad), advanced studies in Qum under Ayatollah Bahjat and Ayatollah Hasanzadeh Amoli, and attainment of Ijtihad.
- **A–Z Topic Index:** Sticky jump bar categorizing rulings across Islamic jurisprudence.
- **Permanent Deep Links:** Numeric permalinks (`question.html?id=1`) that remain stable even if topic names or questions are revised.
- **Client-Side Instant Search:** Fuzzy search powered by Fuse.js matching questions, answers, and topics as the user types.
- **Question Submission Form:** Zero-login form with bot protection (honeypot), email delivery to the scholar's Gmail, and a direct `mailto:` fallback.
- **Donation Page:** Display-only verified UPI PhonePe QR code and bank transfer details with one-tap copy buttons.
- **Local Admin Console:** Dedicated `admin.html` tool to add, edit, and delete rulings offline with auto-assigned IDs and date stamps.

---

## Technology Stack

| Layer | Implementation | Purpose |
|---|---|---|
| **Frontend** | Vanilla HTML5, CSS3 & JavaScript (ES6) | No build steps, no Node bundling, zero framework breakage |
| **Database** | Flat JSON files (`data/qa.json`, `data/topics.json`, `data/site.json`) | Free, version-controlled, auditable in Git history |
| **Search Engine** | Fuse.js (local zero-dependency copy in `js/vendor/fuse.min.js`) | Instant client-side fuzzy search with relevance weighting |
| **Question Delivery** | Web3Forms / Formspree API + resilient `mailto:` fallback | Direct delivery to scholar's Gmail with no server required |
| **Hosting & CI/CD** | GitHub + Vercel (Hobby plan, free tier) | Auto-deploy on every push to the `main` branch in 1–2 minutes |

---

## Folder Layout

```
Islamic-Q&A-website/
├── index.html                  # Home page with hero portrait & latest answers panel
├── biography.html              # Scholar biography & academic timeline
├── topics.html                 # A–Z topic index with sticky jump bar & live search
├── topic.html                  # Single topic page (?topic=slug)
├── question.html               # Single Q&A view with permanent link (?id=123)
├── ask.html                    # Send a Question form with anti-spam honeypot
├── ask-success.html            # Confirmation receipt page
├── contact.html                # Tap-to-call phone, email, WhatsApp, and office locations
├── donate.html                 # PhonePe UPI QR code & copyable bank details
├── admin.html                  # Local, offline administration console
├── validate.html               # Automated data integrity test suite
├── 404.html                    # Custom not-found and deleted-answer tombstone page
├── server.js                   # Lightweight local static server for previews
├── vercel.json                 # Vercel deployment routing & cache headers
│
├── css/
│   ├── variables.css           # Design tokens (colours, fonts, spacing)
│   ├── reset.css               # Modern CSS reset & accessibility focus rules
│   ├── layout.css              # Header, footer, containers, and grid layouts
│   ├── components.css          # Buttons, cards, badges, alerts, forms, panels
│   ├── pages.css               # Page-specific hero banner & timeline styling
│   ├── admin.css               # Admin dashboard UI styles
│   └── responsive.css          # Mobile-first breakpoints (360px -> 1024px)
│
├── js/
│   ├── utils.js                # XSS escaping, date formatting, slugs, clipboard copy
│   ├── data-loader.js          # In-memory cached data fetcher for JSON files
│   ├── nav.js                  # Dynamic header/footer injection & mobile drawer
│   ├── topics-index.js         # Alphabetical index builder with jump bar
│   ├── topic-page.js           # Renders questions under a specific topic
│   ├── question-page.js        # Renders single answer with copyable permalink
│   ├── search.js               # Fuzzy search engine integration
│   ├── latest-answers.js       # Dynamic 5-newest answers home page panel
│   ├── ask-form.js             # Form validation, honeypot & email delivery
│   ├── contact.js              # Renders contact channels dynamically
│   ├── donate.js               # Renders QR code & copyable bank details
│   ├── admin.js                # Add/edit/delete CRUD, validation & file export
│   └── vendor/
│       └── fuse.min.js         # Self-contained fuzzy search engine
│
├── data/
│   ├── qa.json                 # Database of all published Q&A entries
│   ├── topics.json             # Topics catalog (slugs + display names)
│   └── site.json               # Official contact details, donation info, scholar info
│
├── assets/
│   ├── images/
│   │   ├── scholar-photo.jpg   # High-resolution scholar portrait
│   │   ├── qr-code.png         # Official PhonePe donation QR code
│   │   └── favicon.svg         # Site browser icon
│   └── fonts/                  # Reserved for optional self-hosted web fonts
│
└── Docs/
    ├── Scholar-QA-Website-Problem-Statement.md
    ├── architecture.md
    └── implementation-plan.md
```

---

## Running the Site Locally

No complex dependencies or build tools are needed. You can preview the website using any local static web server:

### Option 1: Using the Included Node Server (Recommended)
```bash
node server.js
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Option 2: Using Python (Built-in)
```bash
python -m http.server 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Option 3: VS Code Live Server
Right-click on `index.html` and choose **"Open with Live Server"**.

---

## Scholar's Publishing Guide (Plain Language)

Managing answers does **not** require programming knowledge. Everything can be managed using the local admin page:

### 1. How to Add a New Answer
1. Start your local server (`node server.js`) and open **[http://localhost:3000/admin.html](http://localhost:3000/admin.html)**.  
   *(Or double-click `admin.html` from the folder and load `data/qa.json` and `data/topics.json`).*
2. Click the green **"+ Add New Answer"** button.
3. The next **Question ID** and today's date are assigned automatically.
4. Select the appropriate **Topic** from the dropdown.
5. Paste or type the **Question** and the scholar's **Answer**.
6. Click **"Save Entry"**.

### 2. How to Edit an Existing Answer
1. In `admin.html`, locate the answer using the search box or topic filter.
2. Click **"Edit"** beside the question.
3. Make your revisions. (The original ID and answered date are preserved; the `updatedOn` date is automatically stamped to today).
4. Click **"Save Entry"**.

### 3. How to Delete an Answer
1. In `admin.html`, find the answer and click **"Delete"**.
2. Confirm the prompt naming the question.
3. The entry is removed. *(Any visitor visiting the old permanent URL will see a polite notice that the ruling was archived/removed, with links back to the index).*

### 4. How to Add a New Topic
1. Click **"+ Add New Topic"** in `admin.html`.
2. Enter the display name (e.g., `Pilgrimage (Ziyarah)`). The web address slug is generated automatically.
3. Click **"Add Topic"**. It will immediately appear in the dropdowns and the public A–Z index.

### 5. How to Update Contact or Donation Details
1. Open [`data/site.json`](data/site.json) in any text editor (Notepad, VS Code).
2. Edit the phone number, email, office addresses, or bank account details.
3. Save the file. The Contact, Donation, and Footer sections update automatically.

### 6. How to Put Changes Live
1. After editing in `admin.html`, click **"💾 Download qa.json"** (and **"💾 Download topics.json"** if you added a new topic).
2. Move the downloaded file(s) into the `data/` folder, replacing the old ones.
3. Open a terminal in the project folder and run:
   ```bash
   git add .
   git commit -m "Updated rulings and answers"
   git push
   ```
4. **Done!** Vercel will detect your push and update the live website within 1 to 2 minutes.

---

## Data Integrity & Validation

Before pushing any changes to GitHub, you can test that your data files are 100% error-free:
1. Open **[http://localhost:3000/validate.html](http://localhost:3000/validate.html)** in your browser (or click **"✓ Validate Data"** in `admin.html`).
2. The automated auditor checks:
   - Zero duplicate Question IDs.
   - Every question references a valid, existing topic slug.
   - All dates adhere to standard `YYYY-MM-DD` formatting.
   - Required contact and bank information fields are present.

---

## Vercel Deployment Setup

The website is ready for zero-configuration deployment on **Vercel**:

1. Log in to your free [Vercel](https://vercel.com) account.
2. Click **"Add New Project"** and import this GitHub repository.
3. In the configuration settings:
   - **Framework Preset:** Select **"Other"**.
   - **Root Directory:** `./` (root).
   - **Build Command:** Leave empty (none).
   - **Output Directory:** Leave empty (none).
4. Click **"Deploy"**.
5. Your website will be live at `https://your-project.vercel.app` with free SSL and global CDN edge caching. Every future `git push` to `main` will redeploy automatically.

---

## Privacy & Security Rules

1. **Content Authenticity:** All rulings published must originate from Ayatullah Syed Sibtain Abbas Rizvi. Code or AI assistants must never invent, alter, or summarize religious rulings.
2. **Asker Confidentiality:** The asker's name and email address are never stored in `data/qa.json` and are never displayed on the website.
3. **No Financial Collection:** The donation page displays verified details and a UPI QR code only. It never collects card numbers, PINs, or bank logins.
4. **No Public Secrets:** Form access keys are restricted to the scholar's email and live domain. No database credentials or private API keys exist in this repository.

---

*Ayatullah Syed Sibtain Abbas Rizvi &bull; Religious Guidance &amp; Jurisprudence Portal*
