# GadgetPulse Workspace

Clean project layout with frontend and backend separated.

## Folder Structure

```text
frontend/   Next.js app, UI components, domain types, and browser account state
backend/    Persistent review API and JSON data store
```

## Run The App

```bash
pnpm install
pnpm dev
```

Open:

```text
http://localhost:3000
```

This starts the frontend at `http://localhost:3000` and the backend at `http://localhost:4000`.

To run either service separately:

```bash
pnpm frontend:dev
pnpm backend:dev
```

## Useful Commands

```bash
pnpm frontend:lint
pnpm frontend:build
pnpm test
pnpm backend:start
```

## Notes

- Portfolio/Pyae Zaw files and generated build folders were removed.
- Reviews are submitted by signed-in users and persisted in `backend/data/reviews.json`.
- The review store starts empty. Review feeds, ratings, counts, reviewer rankings, and review-driven homepage sections stay hidden until real submissions exist.
- Products and category activity are derived only from submitted backend reviews; there is no seeded catalog, user list, discussion list, or account.
- Accounts, votes, saved products, and profile pictures created by the user are stored in browser `localStorage`.
