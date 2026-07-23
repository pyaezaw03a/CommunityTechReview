# GadgetPulse Frontend

Next.js frontend for the GadgetPulse community gadget review MVP.

## Stack

- Next.js 16 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style primitives
- Lucide React icons
- Framer Motion
- D1-backed accounts, sessions, and review API
- R2-backed reviewed-product photo uploads

## Run Locally

From the workspace root:

```bash
npm --workspace frontend run dev
```

Or from this folder:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Current Behavior

- Accounts and sessions are stored in D1. Passwords are salted and hashed, and sessions use HTTP-only cookies.
- User reviews are fetched from and submitted to the same-origin `/api/reviews` API.
- Reviewers can attach one optional JPG, PNG, or WebP product photo up to 5MB; files are stored in R2.
- New reviews are stored as `under_review` and are never returned in public feeds until an admin approves them.
- Admins can approve, return, or mark reviews as violated from the protected moderation queue.
- Set the server-side `ADMIN_REVIEW_CODE` runtime value to replace the local `PULSE-ADMIN` fallback.
- No catalog, accounts, reviews, users, or discussions are seeded.
- Products and active categories are derived exclusively from submitted reviews.
- Empty review feeds, ratings, counts, product lists, rankings, and data-driven sections are hidden.
- Product name on the review form is a free text field.
- Users must sign in before submitting, and the account username is attached to the submission.
- Ownership duration is a free text field.
- User and admin accounts can save a profile picture from `/account`.
- Votes, saved products, and theme choice remain browser-local preferences.

## Build

```bash
npm run build
```
