const http = require("node:http");
const { URL } = require("node:url");

const { HttpError, readJson, sendJson } = require("./http");

function createApp({ reviewService, allowedOrigin }) {
  return http.createServer(async (request, response) => {
    const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

    response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    response.setHeader("Access-Control-Allow-Headers", "Content-Type");
    response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    response.setHeader("Vary", "Origin");

    if (request.method === "OPTIONS") {
      response.statusCode = 204;
      response.end();
      return;
    }

    try {
      if (request.method === "GET" && url.pathname === "/") {
        sendJson(response, 200, { name: "GadgetPulse API", status: "ready" });
        return;
      }

      if (request.method === "GET" && url.pathname === "/health") {
        sendJson(response, 200, { ok: true, service: "gadgetpulse-backend" });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/status") {
        sendJson(response, 200, { api: "GadgetPulse", version: "1.0.0", mode: "persistent reviews" });
        return;
      }

      if (request.method === "GET" && url.pathname === "/api/reviews") {
        const reviews = await reviewService.list({
          productSlug: url.searchParams.get("productSlug") || undefined,
          username: url.searchParams.get("username") || undefined,
          category: url.searchParams.get("category") || undefined,
          limit: url.searchParams.get("limit") || undefined
        });
        sendJson(response, 200, { data: reviews, meta: { count: reviews.length } });
        return;
      }

      if (request.method === "POST" && url.pathname === "/api/reviews") {
        const review = await reviewService.create(await readJson(request));
        sendJson(response, 201, { data: review });
        return;
      }

      const reviewMatch = url.pathname.match(/^\/api\/reviews\/([^/]+)$/);
      if (request.method === "GET" && reviewMatch) {
        const review = await reviewService.get(decodeURIComponent(reviewMatch[1]));
        sendJson(response, 200, { data: review });
        return;
      }

      throw new HttpError(404, "Route not found.");
    } catch (error) {
      const statusCode = error instanceof HttpError ? error.statusCode : 500;
      const message = error instanceof HttpError ? error.message : "An unexpected server error occurred.";
      if (statusCode === 500) console.error(error);
      sendJson(response, statusCode, { error: { message, details: error.details } });
    }
  });
}

module.exports = { createApp };
