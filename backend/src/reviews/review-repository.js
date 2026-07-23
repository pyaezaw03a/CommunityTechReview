const fs = require("node:fs/promises");
const path = require("node:path");

class ReviewRepository {
  constructor(filePath) {
    this.filePath = filePath;
    this.writeQueue = Promise.resolve();
  }

  async initialize() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    try {
      await fs.access(this.filePath);
    } catch {
      await fs.writeFile(this.filePath, "[]\n", "utf8");
    }
  }

  async list() {
    await this.initialize();
    const contents = await fs.readFile(this.filePath, "utf8");
    const records = JSON.parse(contents);
    if (!Array.isArray(records)) {
      throw new Error("The reviews data file must contain a JSON array.");
    }
    return records;
  }

  async findById(id) {
    const reviews = await this.list();
    return reviews.find((review) => review.id === id) || null;
  }

  async create(review) {
    const write = this.writeQueue.then(async () => {
      const reviews = await this.list();
      reviews.unshift(review);

      const temporaryFile = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
      await fs.writeFile(temporaryFile, `${JSON.stringify(reviews, null, 2)}\n`, "utf8");
      await fs.rename(temporaryFile, this.filePath);
      return review;
    });

    this.writeQueue = write.catch(() => undefined);
    return write;
  }
}

module.exports = { ReviewRepository };
