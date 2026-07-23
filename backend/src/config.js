const path = require("node:path");

const rootDirectory = path.resolve(__dirname, "..");

module.exports = {
  port: Number(process.env.PORT || 4000),
  reviewsFile: process.env.REVIEWS_FILE || path.join(rootDirectory, "data", "reviews.json"),
  allowedOrigin: process.env.ALLOWED_ORIGIN || "http://localhost:3000"
};
