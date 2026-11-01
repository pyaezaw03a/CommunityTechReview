import { getSessionAccount } from "@/db/accounts";
import { getUpload } from "@/db/uploads";
import { getReviewPhoto } from "@/db/reviews";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const photo = await getReviewPhoto(id);
  if (!photo?.photo_key) {
    return Response.json({ error: { message: "Product photo not found." } }, { status: 404 });
  }

  if (photo.status !== "published") {
    const account = await getSessionAccount(request);
    if (!account || (account.role !== "admin" && account.id !== photo.user_id)) {
      return Response.json({ error: { message: "Product photo not found." } }, { status: 404 });
    }
  }

  const object = await getUpload(photo.photo_key);
  if (!object) {
    return Response.json({ error: { message: "Product photo not found." } }, { status: 404 });
  }

  const headers = new Headers();
  headers.set("Content-Type", photo.photo_type || object.contentType || "application/octet-stream");
  headers.set(
    "Cache-Control",
    photo.status === "published" ? "public, max-age=86400, stale-while-revalidate=604800" : "private, no-store"
  );
  headers.set("X-Content-Type-Options", "nosniff");
  return new Response(object.body, { headers });
}
