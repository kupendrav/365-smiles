
# 365 Smiles – Donation Platform (Next.js)

<p align="center">
  <img src="365-smiles/public/logo.png" alt="365 Smiles Logo" />
</p>

A modern, full‑stack donation platform for 365 Smiles Foundation built with Next.js App Router. Donors can sponsor a specific date, upload UPI proof, and automatically receive a personalized certificate by email. Admins can verify donations, view summaries, log donations manually, and explore nearby NGOs/charities.

## Features

- Sponsor a Day: Interactive calendar with donated days highlighted and smooth month/year navigation.
- Donation Submission: Secure form with UPI proof upload, Supabase Storage, and DB insert.
- PDF Certificates: Personalized certificate generated from a template (public/certi.pdf) using pdf-lib + fontkit (Unicode/₹ support), emailed via Resend.
- Admin Panel: Login, dashboard stats, donation summary, location Explorer, and manual log donation tools.
- Elegant UI: Glassmorphism cards, video backgrounds, accessible forms, and responsive layouts.


## Tech Stack

- Next.js (App Router, TypeScript, Tailwind CSS)
- Supabase (Auth, Database, Storage)
- pdf-lib + @pdf-lib/fontkit (certificate generation)
- Resend (emailing certificates)
- date-fns (calendar formatting)


## Project Structure (selected)

- app/
    - page.tsx – Landing page
    - calendar/page.tsx – Calendar with donated-day highlighting, month scroller, year slider
    - donate/page.tsx – Donor form (date query), QR scan instructions, upload, redirect to thank-you
    - donate/education, donate/daily-needs, donate/medicine-support – Cause pages
    - admin/
        - login/page.tsx – Admin Sign In (Supabase auth)
        - frontpage/page.tsx – Admin home with nav, email shortcuts, stats, and embedded NGO page
        - dashboard/page.tsx – Donations table with verify toggle
        - donation-summary/page.tsx – Aggregates/summaries
        - log-donation/page.tsx – Manual entry tool
        - locations/page.tsx – Embedded Bing Maps (NGO/old age/orphan homes)
    - api/
        - submit-donation/route.ts – Parses multipart form, uploads to Storage, inserts into DB, emails certificate
        - public-donations/route.ts – Simple public donation intake (name, amount, message, image_url)
        - check-donation/route.ts – Checks if a date is already sponsored
        - log-donation/route.ts – Admin logging endpoint
- lib/
    - supabase.ts / supabaseClient.ts – Server/client Supabase instances
    - generateCertificate.ts – Optional library-based certificate util (if used)
- public/
    - certi.pdf – Certificate template
    - fonts/NotoSans-Regular.ttf – Unicode font (₹ support)
    - donate.mp4, education-bg.mp4, hand.mp4 – Background videos
    - qr.png – UPI QR


## Environment Variables

Create a .env.local file with:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
RESEND_API_KEY=...
```

If using a server Supabase key for server-only code, store it as SUPABASE_SERVICE_ROLE and never expose on client.

## Database

Tables used (examples; adjust to your schema):

- donations
    - id (uuid)
    - name (text)
    - email (text)
    - amount (numeric)
    - ref_id (text)
    - screenshot (text)
    - status (text: pending|verified|null)
    - created_at (timestamp)
    - date (date, optional – if storing the sponsored date)
- public-donations
    - id (uuid)
    - name (text)
    - amount (numeric)
    - message (text)
    - image_url (text)
    - created_at (timestamp)
    - date (date, optional)
- Storage bucket: donation-screenshots (public)


## Certificate Generation

- Uses pdf-lib and @pdf-lib/fontkit.
- Loads public/certi.pdf, embeds NotoSans-Regular.ttf (Unicode), and draws donor name at pre-measured coordinates.
- Tip: If only the first letter appears colored, disable subsetting in embedFont and ensure coordinates/size fit the template.


## Getting Started

1) Clone
```
git clone https://github.com/<user>/<repo>.git
cd <repo>
```

2) Install
```
npm install
```

3) Dev run
```
npm run dev
```

Visit http://localhost:3000.

4) Build \& start
```
npm run build
npm start
```


## Scripts

- dev – Next.js dev server
- build – Production build
- start – Run the built app
- lint – ESLint (fix types, hooks deps, unused vars, etc.)


## Packages Installed

- next, react, react-dom
- typescript, @types/react, @types/node
- tailwindcss, postcss, autoprefixer
- @supabase/supabase-js
- pdf-lib, @pdf-lib/fontkit
- resend
- date-fns
- eslint, eslint-config-next, @typescript-eslint/eslint-plugin, @typescript-eslint/parser

Install example (already done in project):

```
npm i next react react-dom @supabase/supabase-js pdf-lib @pdf-lib/fontkit resend date-fns
npm i -D typescript @types/react @types/node tailwindcss postcss autoprefixer eslint eslint-config-next @typescript-eslint/parser @typescript-eslint/eslint-plugin
```


## Key Pages \& Usage

- Calendar (/calendar): Pick a date to sponsor. Year slider, month rail, donated-day highlights (red), today highlight.
- Donate (/donate?date=YYYY-MM-DD): Upload UPI proof, submit details, receive certificate via email.
- Admin Login (/admin/login): Supabase email/password sign-in.
- Admin Frontpage (/admin/frontpage): Quick links (Log Donation, Locations, Donation Summary), mailbox shortcut, stats, embedded NGO list.
- Admin Dashboard (/admin/dashboard): Review all donations, toggle verification.
- Locations (/admin/locations): Embedded Bing Maps of Bengaluru orphan/old-age homes; open in new tab for full view.
- Donation Summary (/admin/donation-summary): Aggregate metrics \& insights.
- Public Donations API (/api/public-donations): Minimal intake + certificate email flow (if used).
- Submit Donation API (/api/submit-donation): Main multipart form endpoint with email cert.


## Conventions \& Notes

- Use Next.js Image instead of img for performance where applicable.
- Always include required dependencies in useEffect, or memoize external instances.
- Store fonts and template PDFs under public/ for easy access in Node runtime.
- For server routes that read files, set export const runtime = "nodejs".


## License

MIT (or your preferred license). Update this section as needed.

## Contact

For issues or contributions, open a GitHub issue or contact the maintainers of 365 Smiles Foundation.

