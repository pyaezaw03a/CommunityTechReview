export const acceptedUploadImageTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

type ResizeUploadImageOptions = {
  maxWidth: number;
  maxHeight: number;
  maxBytes: number;
  quality?: number;
};

export type ResizedUploadImage = {
  file: File;
  width: number;
  height: number;
  optimized: boolean;
};

export type PrepareUploadImageStage = "resizing" | "removing-background";

export type PrepareUploadImageOptions = ResizeUploadImageOptions & {
  onStage?: (stage: PrepareUploadImageStage) => void;
};

export type PreparedUploadImage = ResizedUploadImage & {
  backgroundRemoved: boolean;
};

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("The browser could not resize this photo."));
      },
      "image/webp",
      quality
    );
  });
}

function resizedName(name: string) {
  const baseName = name.replace(/\.[^.]+$/, "").trim() || "photo";
  return `${baseName}.webp`;
}

function cutoutName(name: string) {
  const baseName = name.replace(/\.[^.]+$/, "").trim() || "photo";
  return `${baseName}-cutout.webp`;
}

export async function resizeUploadImage(
  source: File,
  { maxWidth, maxHeight, maxBytes, quality = 0.86 }: ResizeUploadImageOptions
): Promise<ResizedUploadImage> {
  if (!acceptedUploadImageTypes.has(source.type)) {
    throw new Error("Photos must be JPG, PNG, or WebP images.");
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(source, { imageOrientation: "from-image" });
  } catch {
    throw new Error("This photo could not be opened. Try another JPG, PNG, or WebP image.");
  }

  try {
    const initialScale = Math.min(1, maxWidth / bitmap.width, maxHeight / bitmap.height);
    const initialWidth = Math.max(1, Math.round(bitmap.width * initialScale));
    const initialHeight = Math.max(1, Math.round(bitmap.height * initialScale));

    if (initialScale === 1 && source.size <= maxBytes) {
      return {
        file: source,
        width: bitmap.width,
        height: bitmap.height,
        optimized: false
      };
    }

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("The browser could not resize this photo.");

    let width = initialWidth;
    let height = initialHeight;
    let currentQuality = quality;
    let blob: Blob | null = null;

    for (let attempt = 0; attempt < 10; attempt += 1) {
      canvas.width = width;
      canvas.height = height;
      context.clearRect(0, 0, width, height);
      context.drawImage(bitmap, 0, 0, width, height);
      blob = await canvasToBlob(canvas, currentQuality);

      if (blob.size <= maxBytes) break;

      if (currentQuality > 0.62) {
        currentQuality = Math.max(0.62, currentQuality - 0.08);
      } else {
        width = Math.max(1, Math.round(width * 0.82));
        height = Math.max(1, Math.round(height * 0.82));
        currentQuality = 0.72;
      }
    }

    if (!blob || blob.size > maxBytes) {
      throw new Error("This photo is too large to optimize. Try a smaller image.");
    }

    return {
      file: new File([blob], resizedName(source.name), { type: blob.type, lastModified: Date.now() }),
      width,
      height,
      optimized: true
    };
  } finally {
    bitmap.close();
  }
}

async function readImageSize(file: File) {
  const bitmap = await createImageBitmap(file);
  try {
    return { width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
}

/**
 * Resizes the photo, then removes its background in the browser. The model
 * download can fail offline, so removal failures fall back to the resized
 * photo instead of blocking the upload.
 */
export async function prepareUploadImage(
  source: File,
  { onStage, ...resizeOptions }: PrepareUploadImageOptions
): Promise<PreparedUploadImage> {
  onStage?.("resizing");
  const resized = await resizeUploadImage(source, resizeOptions);

  onStage?.("removing-background");
  try {
    const { removeBackground } = await import("@imgly/background-removal");
    const cutoutBlob = await removeBackground(resized.file, {
      output: { format: "image/webp", quality: 0.86 }
    });
    let file = new File([cutoutBlob], cutoutName(source.name), { type: cutoutBlob.type, lastModified: Date.now() });
    if (file.size > resizeOptions.maxBytes) {
      file = (await resizeUploadImage(file, resizeOptions)).file;
    }
    const { width, height } = await readImageSize(file);
    return { file, width, height, optimized: true, backgroundRemoved: true };
  } catch {
    return { ...resized, backgroundRemoved: false };
  }
}
