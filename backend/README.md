# GadgetPulse Backend

Dependency-free Node.js API for persistent GadgetPulse user reviews.

## Behavior

- Starts with an empty review store at `data/reviews.json`.
- Validates every review submission on the server.
- Generates IDs and timestamps on the server.
- Writes through an atomic, serialized JSON repository so submissions survive restarts.
- Stores new submissions as `under_review`.
- Returns only `published` reviews from public listing and detail endpoints.
- Supports protected admin listing and moderation status changes.

Run locally from the workspace root:

```bash
npm --workspace backend run dev
```

## Endpoints

- `http://localhost:4000/`
- `http://localhost:4000/health`
- `http://localhost:4000/api/status`
- `GET http://localhost:4000/api/reviews`
- `GET http://localhost:4000/api/reviews/:id`
- `POST http://localhost:4000/api/reviews`
- `GET http://localhost:4000/api/reviews?scope=admin`
- `PATCH http://localhost:4000/api/reviews/:id`

List filters are available as query parameters: `productSlug`, `username`, `category`, and `limit`.
Admin routes require the `X-Admin-Access-Code` request header.

## Configuration

- `PORT` defaults to `4000`.
- `REVIEWS_FILE` overrides the JSON data path.
- `ALLOWED_ORIGIN` defaults to `http://localhost:3000`.
- `ADMIN_REVIEW_CODE` defaults to `PULSE-ADMIN` for local development.

## Tests

```bash
npm test
```
