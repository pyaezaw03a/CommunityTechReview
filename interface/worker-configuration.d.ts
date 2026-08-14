declare namespace Cloudflare {
  interface Env {
    ADMIN_REVIEW_CODE?: string;
    DB: D1Database;
    UPLOADS: R2Bucket;
  }
}
