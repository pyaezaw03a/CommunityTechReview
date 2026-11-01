import fs from "node:fs/promises";
import path from "node:path";

const uploadsRoot = path.join(process.cwd(), "uploads");

function resolveUploadPath(key: string) {
  const normalized = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, "");
  const filePath = path.join(uploadsRoot, normalized);
  if (!filePath.startsWith(uploadsRoot)) {
    throw new Error("Invalid upload key.");
  }
  return filePath;
}

export async function putUpload(
  key: string,
  stream: ReadableStream<Uint8Array>,
  options: { contentType?: string } = {}
) {
  const filePath = resolveUploadPath(key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const buffer = Buffer.from(await new Response(stream).arrayBuffer());
  await fs.writeFile(filePath, buffer);

  if (options.contentType) {
    await fs.writeFile(`${filePath}.meta.json`, JSON.stringify({ contentType: options.contentType }), "utf8");
  }
}

export async function getUpload(key: string) {
  const filePath = resolveUploadPath(key);
  try {
    const body = await fs.readFile(filePath);
    let contentType: string | undefined;
    try {
      const meta = JSON.parse(await fs.readFile(`${filePath}.meta.json`, "utf8")) as { contentType?: string };
      contentType = meta.contentType;
    } catch {
      contentType = undefined;
    }
    return { body, contentType };
  } catch {
    return null;
  }
}

export async function deleteUpload(key: string) {
  const filePath = resolveUploadPath(key);
  await fs.rm(filePath, { force: true }).catch(() => undefined);
  await fs.rm(`${filePath}.meta.json`, { force: true }).catch(() => undefined);
}
