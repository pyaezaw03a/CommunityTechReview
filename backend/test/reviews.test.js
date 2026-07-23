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
  assert.equal(created.status, "under_review");
  assert.deepEqual(await service.list(), [created]);
  assert.deepEqual(await service.get(created.id), created);
});

test("reviews can be filtered without injecting seed data", async (context) => {
  const { service, directory } = await createService();
  context.after(() => fs.rm(directory, { recursive: true, force: true }));

  await service.create(validReview());
  await service.create(validReview({ userId: "another-user", username: "another-user", productSlug: "second-phone" }));
  assert.equal((await service.list({ productSlug: "test-phone" })).length, 1);
  assert.equal((await service.list({ productSlug: "missing-phone" })).length, 0);
  assert.equal((await service.list({ userId: "account-1" })).length, 1);
  assert.equal((await service.list({ userId: "another-user" })).length, 1);
});

test("invalid user submissions are rejected", async (context) => {
  const { service, directory } = await createService();
  context.after(() => fs.rm(directory, { recursive: true, force: true }));

  const shortReview = await service.create(validReview({ title: "Ok", body: "Good" }));
  assert.equal(shortReview.body, "Good");
  const detailedPro = "A".repeat(200);
  const detailedReview = await service.create(validReview({ pros: [detailedPro] }));
  assert.equal(detailedReview.pros[0], detailedPro);
  await assert.rejects(() => service.create(validReview({ body: "   " })), /body is required/);
  await assert.rejects(() => service.create(validReview({ rating: 7 })), /rating must be between/);
});

test("reviews require moderation before they are published", async (context) => {
  const { service, directory } = await createService();
  context.after(() => fs.rm(directory, { recursive: true, force: true }));

  const created = await service.create(validReview());
  assert.deepEqual(await service.list({ status: "published" }), []);

  const published = await service.moderate(created.id, "published");
  assert.equal(published.status, "published");
  assert.deepEqual(await service.list({ status: "published" }), [published]);

  const violated = await service.moderate(created.id, "violated");
  assert.equal(violated.status, "violated");
  assert.deepEqual(await service.list({ status: "published" }), []);
});

test("invalid moderation statuses are rejected", async (context) => {
  const { service, directory } = await createService();
  context.after(() => fs.rm(directory, { recursive: true, force: true }));

  const created = await service.create(validReview());
  await assert.rejects(() => service.moderate(created.id, "removed"), /status must be/);
});
