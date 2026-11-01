# GadgetPulse

Community gadget reviews with persistent accounts, moderated submissions, and product-photo uploads.

## Folder Structure

```text
interface/   Next.js app, XAMPP MySQL database, local uploads, API routes, and UI
```

## Prerequisites

1. Start **Apache** and **MySQL** in the XAMPP control panel.
2. Import the database (first time only):

```bash
npm run db:import
```

This creates the `gadgetpulse` database and loads accounts, sessions, and reviews from `interface/sql/gadgetpulse-mysql.sql`.

## Run The App

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

The app uses XAMPP MySQL (`127.0.0.1:3306`, user `root`, empty password by default) and stores review photos under `interface/uploads/`.

Copy `interface/.env.example` to `interface/.env` if you need different MySQL credentials.

## Useful Commands

```bash
npm run lint
npm run build
npm run start
npm run db:generate
npm run db:import
```

## Notes

- Accounts, sessions, and review records are persisted in XAMPP MySQL.
- Account passwords are salted and hashed; sessions use secure HTTP-only cookies.
- Optional reviewed-product photos are stored on the local filesystem and linked to review records.
- Imported review rows keep photo metadata, but photo files from the old R2 bucket are not included — re-upload photos if needed.
- The review store starts empty until data is imported or users submit reviews.
- Products and category activity are derived only from approved reviews.
- Votes, saved products, and theme choice remain device-local preferences.
