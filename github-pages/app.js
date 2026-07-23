const reviewsSection = document.querySelector("#community-reviews");
const reviewsList = document.querySelector("#review-list");
const reviewCount = document.querySelector("#review-count");
const averageRating = document.querySelector("#average-rating");
const apiBase = document.body.dataset.reviewsApi?.replace(/\/$/, "") ?? "";

function createTextElement(tagName, className, value) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = value;
  return element;
}

function renderReview(review) {
  const card = document.createElement("article");
  card.className = "review-card";

  const meta = document.createElement("div");
  meta.className = "review-meta";
  meta.append(
    createTextElement("span", "", review.username || "Community member"),
    createTextElement("span", "rating", `${Number(review.rating).toFixed(1)} / 5`)
  );

  card.append(
    meta,
    createTextElement("h3", "", review.title),
    createTextElement("p", "product", review.productName),
    createTextElement("p", "body", review.body)
  );

  return card;
}

async function loadReviews() {
  try {
    const response = await fetch(`${apiBase}/api/reviews`, {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) return;

    const payload = await response.json();
    const reviews = Array.isArray(payload?.data) ? payload.data : [];
    if (reviews.length === 0) return;

    const validReviews = reviews.filter(
      (review) =>
        review &&
        typeof review.title === "string" &&
        typeof review.body === "string" &&
        typeof review.productName === "string" &&
        Number.isFinite(Number(review.rating))
    );
    if (validReviews.length === 0) return;

    const totalRating = validReviews.reduce((total, review) => total + Number(review.rating), 0);
    reviewCount.textContent = String(validReviews.length);
    averageRating.textContent = (totalRating / validReviews.length).toFixed(1);
    reviewsList.replaceChildren(...validReviews.slice(0, 12).map(renderReview));
    reviewsSection.hidden = false;
  } catch {
    // GitHub Pages has no backend. If no real API is configured, data sections stay hidden.
  }
}

loadReviews();
