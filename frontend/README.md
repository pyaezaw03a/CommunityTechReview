# GadgetPulse Frontend

Next.js frontend for the GadgetPulse community gadget review MVP.

## Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-style primitives
- Lucide React icons
- Framer Motion
- Shared backend review API plus user-created browser account interactions

## Run Locally

From the workspace root:

```bash
pnpm frontend:dev
```

Or from this folder:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

## Current Behavior

- Accounts and sessions are stored locally in the browser with `localStorage`.
- User reviews are fetched from and submitted to the backend through `/api/backend/reviews`.
- No catalog, accounts, reviews, users, or discussions are seeded.
- Products and active categories are derived exclusively from submitted reviews.
- Empty review feeds, ratings, counts, product lists, rankings, and data-driven sections are hidden.
- Product name on the review form is a free text field.
- Users must sign in before publishing, and the account username is attached to the submission.
- Ownership duration is a free text field.
- User and admin accounts can upload a local profile picture from `/account`.

## Build

```bash
pnpm build
```
