const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { ReviewRepository } = require("../src/reviews/review-repository");
const { ReviewService } = require("../src/reviews/review-service");

function validReview(overrides = {}) {
  return {
    userId: "account-1",
    productSlug: "test-phone",
    productName: "Test Phone",
    username: "real-user",
    rating: 4.4,
    categoryRatings: { performance: 4.5, camera: 4.2, battery: 3.9, display: 4.6, value: 4.1 },
    title: "A reliable phone after three months",
    body: "I have used this phone every day for three months and the battery, camera, and call quality have been consistent.",
    pros: ["Reliable camera"],
    cons: ["Slow charging"],
    ownership: "3 months",
    category: "Smartphones",
    ...overrides
  };
}

async function createService() {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "gadgetpulse-reviews-"));
  const repository = new ReviewRepository(path.join(directory, "reviews.json"));
  const service = new ReviewService(repository, {
    createId: () => "test-id",
    now: () => new Date("2026-07-23T00:00:00.000Z")
  });
  return { service, directory };
}

test("the store starts empty and persists a submitted review", async (context) => {
  const { service, directory } = await createService();
  context.after(() => fs.rm(directory, { recursive: true, force: true }));

  assert.deepEqual(await service.list(), []);
  const created = await service.create(validReview());

  assert.equal(created.id, "review-test-id");
  assert.deepEqual(await service.list(), [created]);
  assert.deepEqual(await service.get(created.id), created);
});

test("reviews can be filtered without injecting seed data", async (context) => {
  const { service, directory } = await createService();
  context.after(() => fs.rm(directory, { recursive: true, force: true }));

  await service.create(validReview());
  assert.equal((await service.list({ productSlug: "test-phone" })).length, 1);
  assert.equal((await service.list({ productSlug: "missing-phone" })).length, 0);
});

test("invalid user submissions are rejected", async (context) => {
  const { service, directory } = await createService();
  context.after(() => fs.rm(directory, { recursive: true, force: true }));

  await assert.rejects(() => service.create(validReview({ body: "Too short" })), /body must be between/);
  await assert.rejects(() => service.create(validReview({ rating: 7 })), /rating must be between/);
});
