const { createApp } = require("./app");
const config = require("./config");
const { ReviewRepository } = require("./reviews/review-repository");
const { ReviewService } = require("./reviews/review-service");

const repository = new ReviewRepository(config.reviewsFile);
const reviewService = new ReviewService(repository);
const server = createApp({ reviewService, allowedOrigin: config.allowedOrigin });

server.listen(config.port, () => {
  console.log(`GadgetPulse backend running at http://localhost:${config.port}`);
});
