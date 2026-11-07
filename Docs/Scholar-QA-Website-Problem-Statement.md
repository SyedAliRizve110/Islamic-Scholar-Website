# Scholar Q&A Website: Problem Statement

Nov 7, 2026 · @Ali Rizve

Build a small, free, static website for Ayatullah Syed Sibtain Abbas Rizvi that presents his biography, publishes his answered questions in an A-Z topic index, lets anyone send him a question without logging in, and gives visitors his contact details and a way to donate.

## 1. Project Overview

The site is the public home of Syed Sibtain Abbas Rizvi, a scholar who lives in Qum, Iran and in India. It follows the structure of the English Q&A section of sistani.org, scaled down to one scholar and a handful of pages.

The site must:

- Introduce the scholar with a biography and photo.
- Publish answered questions grouped by topic, with an A-Z topic index.
- Let any visitor search the answers.
- Let any visitor send a question by a web form, with no account.
- Email each new question to the scholar's Gmail address.
- Let the scholar turn a received question into a published Q&A entry, with a very simple workflow.
- Let the scholar edit or delete answers he published earlier.
- Show the newest answers in a side panel on the front page.
- Provide a contact page with his phone number and other contact details.
- Provide a donation page with a QR code and bank details.
- Be pushed to GitHub with a README and deployed on Vercel.
- Run with free tools only, built in vertical slices with the Antigravity agent.

## 2. Problem Statement

People with religious questions need a reliable place to read answers from a named scholar and a clear way to ask new ones. Today questions arrive scattered across WhatsApp, Gmail and social media, and answers are not organised, searchable or permanent.

The scholar needs a place where the answer to one person's question becomes a permanent, findable page for everyone. He should not have to run a server, pay for a database, or learn a framework to keep it up to date.

## 3. Primary Goal

At the end of the build, a visitor can open the site on a phone and:

1. Read who the scholar is, his bio where he studied and what he does.
2. Browse questions from an A-Z list of topics.
3. Open a topic, then a single question with its full answer.
4. Search across all questions and answers.
5. Send a new question without logging in.
6. See the latest answers in a side panel on the home page.
7. Find the scholar's phone number and other contact details.
8. Donate using a QR code or bank details shown on a donation page.

And the scholar can:

1. Receive each new question in Gmail.
2. Write the answer once and publish it under the right topic in a few minutes.
3. Add a new topic, or fix a typo without a developer.
4. Edit or delete any answer he published earlier.
5. Put every change live by pushing it to GitHub, which updates the Vercel site automatically.

## 4. About the Scholar (supplied facts only)

The site may state only the facts below and anything the scholar supplies later. The agent must not invent teachers, dates, titles or rulings.

| Item | Detail |
| --- | --- |
| Name | Ayatullah Syed Sibtain Abbas Rizvi |
| Born | 1970, Azamgarh, India |
| Early studies | Anwarul Uloom, Allahabad, under Syed Allama Jawadi and Syed Ahsan Abbas RIzvi |
| Studies in Qum | Under Ayatollah Taqi Bahjat, Ayatollah Hassan Hasanzadeh Amoli and other scholars |
| Qualification | Attained ijtihad |
| Residence | Qum, Iran and India |
| Work | Religious service for the followers of Ahlulbayt (a.s.) |

Open items for the scholar to confirm before launch: exact spelling and honorifics of each teacher's name, the year he reached ijtihad, the correct form of his own title, and the full names of the teachers marked "and other scholars".

## 5. Target Platform and Core Stack

Everything is a static site: plain files served as-is, with no backend and no database server.

| Layer | Choice | Why |
| --- | --- | --- |
| Pages | Plain HTML, CSS and vanilla JavaScript | No build tools, nothing to break |
| Site data | `data/qa.json`, `data/topics.json` and `data/site.json` (contact and donation details) in the repository | Free, versioned, easy to back up |
| Search | Fuse.js loaded as a single script, running in the browser | No search server |
| Send question | A free form-to-email service such as Web3Forms or Formspree, posting to the scholar's Gmail | No backend code, no SMTP setup |
| Spam control | Hidden honeypot field plus the form service's free captcha | Keeps the inbox usable |
| Managing answers | A local `admin.html` page the scholar opens from his own computer; it adds, edits and deletes entries and saves an updated `qa.json` to replace the old one | No online login system to secure |
| Source control | GitHub repository with a README | Free, keeps a history of every edit |
| Deployment | Vercel free plan, connected to the GitHub repository; every push to the main branch redeploys the site | Free, no server to manage |
| Development | Antigravity agent as primary editor and AI assistant | As requested |
| Fonts | Free web fonts, including an Urdu or Arabic-script font for the optional RTL stretch goal | Free |

The site is plain static files, so it should also work on any other static host if the scholar moves later. Vercel's free Hobby plan is meant for personal, non-commercial use, so the scholar should check its current terms before launch because the site has a donation page.

## 6. Build Plan

Build one slice at a time, test it in a real browser, then move on.

### Phase 1: Foundation, Biography, Contact and Donation

- Project folder, shared header, footer, navigation and a mobile-first stylesheet.
- Home page with the scholar's name, a short introduction, his photo, and links to the main sections.
- Biography page built from section 4, with headings for Early Life, Studies in India, Studies in Qum, Ijtihad and Present Work.
- `data/site.json` holding the contact and donation details, so the scholar can change them without editing page code.
- Contact page driven by `site.json`: phone number (tap to call on phones), email, WhatsApp link if provided, office or postal addresses in Qum and India if provided, available hours or days if provided, and social media links if provided. The main contact details also appear in the footer of every page.
- Donation page driven by `site.json`: a short explanation of what donations support, the QR code image supplied by the scholar, and the bank details he supplies (account holder name, bank name, account number, branch and IFSC or equivalent code). A "copy" button beside each bank detail helps people on phones.
- The donation page only displays information. It has no card form, no payment gateway and never collects any financial detail from visitors.

Phase 1 is complete when the Home, Biography, Contact and Donation pages load, look right at 360 px width, and read their content from files, not from hard-coded text. The phone number, QR code and bank details shown must match exactly what the scholar supplied.

### Phase 2: Q&A Reading Experience

- Topics index page with every topic grouped under its first letter, an A-Z jump bar across the top, and a question count beside each topic.
- Topic page listing every question under that topic, newest first.
- Question page showing the question, the full answer, topic, date answered and a permanent link.
- Search box on the Q&A pages, matching question text, answer text and topic names.
- Letters with no topics are shown dimmed, not hidden.
- Home page "Latest answers" side panel: the 5 newest answers, each showing the question, topic, date and a link to the full answer, with a "New" badge for answers from the last 7 days and a "View all" link. It sits beside the main content on desktop and below it on phones, and updates automatically from `qa.json`. It is a panel on the page, not a pop-up window.

Phase 2 is complete when a visitor can reach any answer in three taps from the Q&A home, a search for a word in an answer finds it, and a newly added answer appears in the home page panel without any extra step.

### Phase 3: Send a Question

- Question form with fields: question (required), topic (optional dropdown, defaulting to "Not sure"), name (optional), email (optional, for a reply).
- Client-side checks for empty or very short questions, with clear messages.
- Honeypot field and captcha to block bots.
- On success, a confirmation page that says the question was received and that not every question can be answered.
- Each submission arrives in the scholar's Gmail with the question, chosen topic, and sender details.
- A "mailto" link as a plain fallback for people who prefer to email directly.

Phase 3 is complete when a test submission from a phone reaches Gmail within a minute and bad input is rejected politely.

### Phase 4: Publishing Workflow and Polish

- `admin.html` opened locally: the scholar opens his current `qa.json` with a file picker, and sees every published answer in a searchable list.
- Add: paste the received question, type or paste the answer, pick a topic (or add a new one), and click Save. The page adds an automatic ID and today's date.
- Edit: change the question, answer or topic of an existing entry. The ID and web address stay the same, and an `updatedOn` date is recorded.
- Delete: remove an entry after a confirmation that names the question. A deleted answer's old link shows a friendly "this answer is no longer available" page.
- The page validates everything and saves an updated `qa.json` for the scholar to put in the project folder, replacing the old file.
- Short written steps for replacing the file and pushing the change (see Phase 5).
- A check script or page that fails loudly if `qa.json` is invalid, a topic is missing, or two entries share an ID.
- Basic accessibility, page titles, meta descriptions and a favicon.

Phase 4 is complete when the scholar, following only the written steps, adds a new answer, edits an old one and deletes another, and all three changes show correctly on the site.

### Phase 5: Git and Deployment (last step)

This phase starts only after every page and feature above is finished and tested locally.

- Git repository set up with a `.gitignore`, a clean first commit and a push to GitHub.
- README covering: what the site is, the folder layout, how to run it locally, how to add, edit and delete an answer, how to add a topic, how to update contact and donation details, and how to deploy.
- Vercel project connected to the GitHub repository as a static site with no build step, so every push to the main branch updates the live site.
- A short launch checklist run on the live Vercel address: every page, the question form, search, the contact page, the donation page and the home page panel.

Phase 5 is complete when the live Vercel address shows all pages correctly and a small change pushed to GitHub appears on the live site within a few minutes.

## 7. Data Model

All data lives in three JSON files.

| File | Field | Meaning |
| --- | --- | --- |
| `qa.json` | `id` | Unique number, never reused |
| `qa.json` | `topic` | Slug of a topic in `topics.json` |
| `qa.json` | `question` | Question text, lightly edited for clarity |
| `qa.json` | `answer` | Full answer text |
| `qa.json` | `answeredOn` | Date in YYYY-MM-DD |
| `qa.json` | `language` | `en` for now |
| `qa.json` | `updatedOn` | Date of the last edit, empty if never edited |
| `topics.json` | `slug`, `name` | URL-safe key and display name; the first letter of `name` drives the A-Z index |
| `site.json` | `contact` | Phone, email, WhatsApp link, addresses, hours and social links; any field left empty is not shown |
| `site.json` | `donation` | QR image path, account holder name, bank name, account number, branch, IFSC or equivalent code, and a short note |

The asker's name and email are never stored in these files and never shown on the site.

## 8. Functional Requirements

- **FR-1 Navigation:** Every page has the same header with Home, Biography, Q&A, Send Question, Contact and Donate.
- **FR-2 Mobile first:** All pages work at 360 px width and without horizontal scrolling.
- **FR-3 A-Z index:** Topics appear under their first letter, in alphabetical order, with counts.
- **FR-4 Permanent links:** Every answered question has its own stable URL that never changes after publishing.
- **FR-5 Search:** Search runs in the browser, returns results as the user types, and shows a clear empty state.
- **FR-6 Question form:** Works with no login, validates input, and confirms receipt.
- **FR-7 Email delivery:** Every valid submission reaches the scholar's Gmail.
- **FR-8 Data-driven content:** Biography details, topics and answers come from files, so the scholar can change them without editing page code.
- **FR-9 Local admin helper:** `admin.html` adds, edits and deletes entries, produces a valid `qa.json`, and never sends data anywhere.
- **FR-10 Content integrity:** Validation prevents broken topic links and duplicate IDs before publishing.
- **FR-11 Latest answers panel:** The home page shows the 5 newest answers in a side panel, built from `qa.json`.
- **FR-12 Edit and delete:** An existing answer can be edited without changing its link, and deleted only after confirmation. Deleted links show a friendly message.
- **FR-13 Contact page:** Shows the contact details from `site.json`, with tap-to-call and tap-to-email links on phones.
- **FR-14 Donation page:** Shows the QR code and bank details from `site.json` and collects nothing from visitors.
- **FR-15 Deployment:** The project lives in a GitHub repository with a README, and Vercel redeploys the site on every push to the main branch.

## 9. Content and Safety Rules

This is religious content under a named scholar, so accuracy and attribution matter more than speed.

- Every answer on the site must come from the scholar himself. The agent and any AI tool may help with layout, spelling and formatting, but must never write, summarise or invent a religious answer.
- Sample entries used during development must be clearly labelled as placeholders and removed before launch.
- Questions are published only after the scholar has reviewed and approved the answer.
- A question is never published in a way that identifies the asker, unless the asker has agreed in writing.
- The form states, in plain words, that questions are emailed to the scholar and may be published without the asker's name.
- Keys and secrets (the form service access key) are not committed to a public repository if the key allows anything beyond sending to the scholar's inbox; otherwise they are restricted to the scholar's email and the site's domain.
- No analytics or tracking scripts that collect personal data.
- The QR code and bank details come only from the scholar. The agent must never invent, guess or "fix" an account number, code or name.
- The donation page shows the account holder name beside the details so donors can check them, and tells donors to confirm the name before sending money.
- Bank details and the phone number are published openly, so the scholar should use an account and number he is comfortable having public. Never publish card numbers, PINs, passwords or one-time codes.
- Changes to the donation details are made only by the scholar, in `site.json` through the written steps, and each change is a separate, clearly labelled commit.
- Deleting an answer is permanent on the live site, but the earlier version stays in the GitHub history so it can be restored if it was a mistake.
- The GitHub repository never contains passwords, private keys or anything beyond the details meant to be public.

## 10. Non-Functional Requirements

**Cost:** Zero required spend for the core build, using the free GitHub and Vercel plans and the free address Vercel provides. A custom domain is optional and paid.

**Reliability:** The site keeps working if the form service is down; the form shows a clear error and offers the mailto fallback.

**Performance:** Each page loads under 2 seconds on a normal mobile connection; total JavaScript stays small, with no framework.

**Privacy:** No cookies are required to read the site. Asker details live only in the scholar's inbox.

**Maintainability:** One person with basic computer skills can add, edit or delete an answer and push it live in under ten minutes, following written steps.

**Accessibility:** Readable text size, strong contrast, labelled form fields, keyboard-friendly navigation.

## 11. Content the Scholar Must Provide

- [ ] Professional photo of the scholar, at least 800 px wide.
- [ ] Biography text in his own words or approved by him, with the open items from section 4 confirmed.
- [ ] Site name, tagline and, if available, a logo.
- [ ] List of 10 to 20 starting topics (for example Prayer, Fasting, Marriage, Business, Inheritance, Purity), spelled as he wants them.
- [ ] 5 to 10 real, approved question-and-answer pairs to launch with.
- [ ] Gmail address that will receive questions.
- [ ] Phone number, and any other contact details to show (email, WhatsApp, addresses in Qum and India, hours, social links).
- [ ] QR code image for donations.
- [ ] Bank details for donations: account holder name, bank name, account number, branch and IFSC or equivalent code.
- [ ] A short sentence on what donations are used for.
- [ ] GitHub account and Vercel account (both free), created with the email the scholar controls.
- [ ] Preferred colours or "leave it to the designer".
- [ ] Decision on whether Urdu or Hindi versions are wanted later.

## 12. Out of Scope

- Buying a custom domain name (the free Vercel address is used at first).
- A Books section (left out for now; can be added later).
- User accounts, comments or public logins.
- Online payment processing: the donation page only shows a QR code and bank details.
- A server, database, or paid email service.
- Angular, .NET or any other framework.
- Automatic AI-written answers of any kind.
- Multi-language content in the first release, apart from keeping the layout ready for right-to-left text.
- An online, login-protected admin panel. Answers are managed in the local admin page and pushed to GitHub.

## 13. Stretch Goals

- Urdu and Hindi versions of pages and answers, with right-to-left support.
- Related questions shown under each answer.
- Printable and share-friendly answer pages.
- An RSS feed of new answers.
- An online admin panel with login, so answers can be edited from any device without using Git.

## 14. Definition of Done

The site is complete when:

1. Home, Biography, Q&A, Send Question, Contact and Donate pages all work on phone and desktop.
2. The biography states only facts approved by the scholar.
3. The A-Z topic index, topic pages and question pages work with real approved content.
4. Search finds questions by words in the question, the answer or the topic.
5. A visitor can send a question with no login and the scholar receives it in Gmail.
6. Spam attempts are blocked by the honeypot and captcha.
7. The scholar adds a new answer, edits an old one and deletes one, using only the written steps, and each change shows correctly on the site.
8. A newly added answer appears in the home page side panel automatically.
9. The contact page shows the scholar's real phone number and other supplied details, and the phone number works with tap-to-call.
10. The donation page shows the scholar's real QR code and bank details exactly as supplied, and collects nothing from visitors.
11. The validation check passes on the final data files.
12. No placeholder content remains.
13. The project is pushed to GitHub with a clear README and no secrets.
14. The site is live on Vercel, and a change pushed to GitHub appears on the live site.

## 15. Recommended Antigravity Execution Order

Use this document as the top-level specification. Ask the agent to build one slice at a time and to show the result before moving on.

1. Folder structure, shared header and footer, stylesheet.
2. Home page.
3. Biography page from the facts in section 4.
4. `site.json` and the Contact page, with contact details in the footer.
5. Donation page with the QR code and bank details.
6. Sample `topics.json` and `qa.json` with clearly marked placeholders.
7. Topics index with the A-Z jump bar and counts.
8. Topic page and question page with permanent links.
9. Search with Fuse.js.
10. Latest answers side panel on the home page.
11. Send Question form with validation and confirmation.
12. Form-to-Gmail delivery and spam protection.
13. Local `admin.html` with add, edit and delete.
14. Data validation check.
15. Accessibility and mobile pass.
16. Last: Git repository, README with plain-language steps for the scholar, and push to GitHub.
17. Last: Vercel deployment and the launch checklist.

For each slice, build the smallest working version first, test it in a real browser, and only then continue. Never let the agent write the content of a religious answer.
