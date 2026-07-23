# GadgetPulse Workspace

Clean project layout with frontend and backend separated.

## Folder Structure

```text
frontend/   Next.js app, D1 database, R2 uploads, API routes, and UI
backend/    Legacy dependency-free review service retained for API tests
```

## Run The App

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

This starts the complete frontend application at `http://localhost:3000`. Its
same-origin API routes use local D1 and R2 development storage.

To run either service separately:

```bash
npm run frontend:dev
npm run backend:dev
```

## Useful Commands

```bash
npm run frontend:lint
npm run frontend:build
npm test
npm run backend:start
```

## Notes

- Portfolio/Pyae Zaw files and generated build folders were removed.
- Accounts, sessions, and review records are persisted in D1.
- Account passwords are salted and hashed; sessions use secure HTTP-only cookies.
- Optional reviewed-product photos are stored in R2 and linked to review records.
- The review store starts empty. Review feeds, ratings, counts, reviewer rankings, and review-driven homepage sections stay hidden until real submissions exist.
- Products and category activity are derived only from approved reviews; there is no seeded catalog, user list, discussion list, or account.
- Votes, saved products, and theme choice remain device-local preferences.
