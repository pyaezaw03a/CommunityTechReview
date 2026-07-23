# GadgetPulse Backend

Dependency-free Node.js API for persistent GadgetPulse user reviews.

## Behavior

- Starts with an empty review store at `data/reviews.json`.
- Validates every review submission on the server.
- Generates IDs and timestamps on the server.
- Writes through an atomic, serialized JSON repository so submissions survive restarts.
- Supports review listing, filtering, creation, and detail lookup.

Run locally from the workspace root:

```bash
pnpm backend:dev
```

## Endpoints

- `http://localhost:4000/`
- `http://localhost:4000/health`
- `http://localhost:4000/api/status`
- `GET http://localhost:4000/api/reviews`
- `GET http://localhost:4000/api/reviews/:id`
- `POST http://localhost:4000/api/reviews`

List filters are available as query parameters: `productSlug`, `username`, `category`, and `limit`.

## Configuration

- `PORT` defaults to `4000`.
- `REVIEWS_FILE` overrides the JSON data path.
- `ALLOWED_ORIGIN` defaults to `http://localhost:3000`.

## Tests

```bash
pnpm test
```
