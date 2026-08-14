"use client";

import { type ChangeEvent, type FormEvent, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Pencil, RefreshCw, Save, X } from "lucide-react";

import { useAuth } from "@/components/auth/auth-provider";
import { RatingPill } from "@/components/rating";
import { ReviewPhoto } from "@/components/review-photo";
import { ReviewStatusBadge } from "@/components/review-status-badge";
import { useReviews } from "@/components/reviews-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { categories, type Category, type Review } from "@/data/domain";
import { prepareUploadImage } from "@/lib/image-upload";
import { fetchUserReviews } from "@/lib/reviews-api";
import { slugify } from "@/lib/utils";

const ratingFields = ["performance", "camera", "battery", "display", "value"] as const;

type EditFormState = {
  productName: string;
  category: Category;
  overallRating: number;
  performance: number;
  camera: number;
  battery: number;
  display: number;
  value: number;
  title: string;
  body: string;
  pros: string;
  cons: string;
  ownership: string;
};

function createEditFormState(review: Review): EditFormState {
  return {
    productName: review.productName,
    category: review.category,
    overallRating: review.rating,
    performance: review.categoryRatings.performance || 3,
    camera: review.categoryRatings.camera || 3,
    battery: review.categoryRatings.battery || 3,
    display: review.categoryRatings.display || 3,
    value: review.categoryRatings.value || 3,
    title: review.title,
    body: review.body,
    pros: review.pros.join("\n"),
    cons: review.cons.join("\n"),
    ownership: review.ownership
  };
}

function parseTags(value: string) {
  return value
    .split(/[,\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });
}

export function UserPosts() {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState<Review[] | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const loadPosts = useCallback(
    async (signal?: AbortSignal) => {
      if (!currentUser) {
        setPosts(null);
        return;
      }

      setLoading(true);
      try {
        setPosts(await fetchUserReviews(signal));
        setError("");
      } catch (requestError) {
        if ((requestError as Error).name !== "AbortError") {
          setError((requestError as Error).message);
        }
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [currentUser]
  );

  useEffect(() => {
    const controller = new AbortController();
    void loadPosts(controller.signal);
    return () => controller.abort();
  }, [loadPosts]);

  if (!currentUser || (!error && !posts?.length)) return null;

  return (
    <section id="your-posts" className="scroll-mt-24 border border-ink bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-signal">Post Status</p>
          <h2 className="mt-2 text-3xl font-black uppercase leading-none text-ink">Your Posts</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Track every review you submitted, edit your own posts, and see when an admin approves them.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={() => void loadPosts()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} aria-hidden="true" />
          Refresh Status
        </Button>
      </div>

      {error ? (
        <div className="mt-5 border border-signal bg-paper p-3 text-sm font-semibold text-signal" role="alert">
          {error}
        </div>
      ) : null}

      {posts?.length ? (
        <div className="mt-6 grid gap-4">
          {posts.map((post) => (
            <article key={post.id} className="border border-line bg-paper p-4 sm:p-5">
              {editingId === post.id ? (
                <EditPostForm
                  post={post}
                  onCancel={() => setEditingId(null)}
                  onSaved={(updatedPost) => {
                    setPosts((current) => current?.map((item) => (item.id === updatedPost.id ? updatedPost : item)) ?? [updatedPost]);
                    setEditingId(null);
                  }}
                />
              ) : (
                <PostSummary post={post} onEdit={() => setEditingId(post.id)} />
              )}
            </article>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function PostSummary({ post, onEdit }: { post: Review; onEdit: () => void }) {
  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-signal">{post.productName}</p>
          <h3 className="mt-2 text-xl font-black uppercase leading-tight text-ink">{post.title}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ReviewStatusBadge
            status={post.status}
            label={post.status === "published" ? "Approved by admin" : undefined}
          />
          <RatingPill rating={post.rating} />
          <Button type="button" variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Edit Post
          </Button>
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-muted">{post.body}</p>
      {post.photoUrl ? (
        <ReviewPhoto
          src={post.photoUrl}
          alt={`${post.productName} uploaded by @${post.username}`}
          sizes="(max-width: 768px) 100vw, 760px"
          className="mt-4 bg-white"
        />
      ) : null}
      <p className="mt-4 text-xs font-bold uppercase text-muted">Submitted {formatDate(post.date)}</p>
    </div>
  );
}

function EditPostForm({ post, onCancel, onSaved }: { post: Review; onCancel: () => void; onSaved: (post: Review) => void }) {
  const { products, updateReview } = useReviews();
  const [form, setForm] = useState<EditFormState>(() => createEditFormState(post));
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoMessage, setPhotoMessage] = useState("");
  const [processingPhoto, setProcessingPhoto] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const selectedProduct = useMemo(
    () =>
      products.find(
        (product) =>
          product.name.toLowerCase() === form.productName.trim().toLowerCase() ||
          product.slug === slugify(form.productName)
      ),
    [form.productName, products]
  );
  const visiblePhotoUrl = photoPreview || post.photoUrl;

  function updateField<T extends keyof EditFormState>(field: T, value: EditFormState[T]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function clearPhoto() {
    setPhoto(null);
    setPhotoPreview("");
    setPhotoMessage("");
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  async function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      clearPhoto();
      return;
    }

    setProcessingPhoto(true);
    setPhotoMessage("Adjusting photo...");
    try {
      const result = await prepareUploadImage(file, {
        maxWidth: 2000,
        maxHeight: 2000,
        maxBytes: 5_000_000,
        onStage: (stage) => {
          setPhotoMessage(
            stage === "removing-background"
              ? "Removing background... The first photo can take a moment."
              : "Adjusting photo..."
          );
        }
      });
      setPhoto(result.file);
      setErrors([]);
      setPhotoMessage(
        `${result.backgroundRemoved ? "Background removed" : "Background kept (removal unavailable)"} at ${result.width} × ${result.height}px. Full photo will be shown.`
      );
      const reader = new FileReader();
      reader.onload = () => setPhotoPreview(String(reader.result));
      reader.readAsDataURL(result.file);
    } catch (photoError) {
      clearPhoto();
      setErrors([(photoError as Error).message]);
    } finally {
      setProcessingPhoto(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = [
      !form.productName.trim() ? "Add a product name." : "",
      !form.ownership.trim() ? "Add your ownership duration." : "",
      !form.title.trim() ? "Add a review title." : "",
      !form.body.trim() ? "Write your review." : "",
      !parseTags(form.pros).length ? "Add at least one pro." : "",
      !parseTags(form.cons).length ? "Add at least one con." : ""
    ].filter(Boolean);
    setErrors(nextErrors);
    if (nextErrors.length) return;

    const cleanProductName = form.productName.trim();
    const productNameUnchanged = cleanProductName.toLowerCase() === post.productName.toLowerCase();

    setSaving(true);
    try {
      const updatedPost = await updateReview(
        post.id,
        {
          userId: post.userId,
          productSlug: selectedProduct?.slug ?? (productNameUnchanged ? post.productSlug : `custom-${slugify(cleanProductName)}`),
          productName: selectedProduct?.name ?? cleanProductName,
          username: post.username,
          rating: Number(form.overallRating),
          categoryRatings: {
            performance: Number(form.performance),
            camera: Number(form.camera),
            battery: Number(form.battery),
            display: Number(form.display),
            value: Number(form.value)
          },
          title: form.title.trim(),
          body: form.body.trim(),
          pros: parseTags(form.pros),
          cons: parseTags(form.cons),
          ownership: form.ownership.trim(),
          category: selectedProduct?.category ?? form.category
        },
        photo ?? undefined
      );
      setErrors([]);
      onSaved(updatedPost);
    } catch (requestError) {
      setErrors([(requestError as Error).message]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase text-signal">Edit Post</p>
          <h3 className="mt-2 text-xl font-black uppercase leading-tight text-ink">{post.title}</h3>
          <p className="mt-2 text-xs font-semibold text-muted">Saving changes sends this post back to admin review.</p>
        </div>
        <ReviewStatusBadge status={post.status} />
      </div>

      {errors.length ? (
        <div className="border border-signal bg-white p-4" role="alert">
          <p className="font-black uppercase text-signal">Please fix the following</p>
          <ul className="mt-2 grid gap-1 text-sm text-muted">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Product" htmlFor={`edit-product-${post.id}`}>
          <Input
            id={`edit-product-${post.id}`}
            value={form.productName}
            onChange={(event) => updateField("productName", event.target.value)}
            placeholder="Type any product name"
          />
        </Field>
        <Field label="Category" htmlFor={`edit-category-${post.id}`}>
          <Select
            id={`edit-category-${post.id}`}
            value={selectedProduct?.category ?? form.category}
            onChange={(event) => updateField("category", event.target.value as Category)}
            disabled={Boolean(selectedProduct)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Replace product photo (optional)" htmlFor={`edit-photo-${post.id}`}>
        <Input
          ref={photoInputRef}
          id={`edit-photo-${post.id}`}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoChange}
        />
        <p className="text-xs font-semibold text-muted">
          Any dimensions are accepted. Photos are automatically resized, their background is removed, and they are shown without cropping.
        </p>
        {photoMessage ? <p className="text-xs font-black uppercase text-olive">{photoMessage}</p> : null}
        {visiblePhotoUrl ? (
          <div className="relative mt-2 max-w-2xl border border-ink bg-white p-2">
            <ReviewPhoto
              src={visiblePhotoUrl}
              alt={photoPreview ? "Replacement product photo preview" : `${post.productName} uploaded by @${post.username}`}
              sizes="672px"
              className="border-0 bg-white"
            />
            {photoPreview ? (
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="absolute right-4 top-4 bg-white"
                onClick={clearPhoto}
                aria-label="Remove replacement photo"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : null}
            <p className="mt-2 flex items-center gap-2 text-xs font-black uppercase text-muted">
              <ImagePlus className="h-4 w-4 text-signal" aria-hidden="true" />
              {photo?.name ?? "Current product photo"}
            </p>
          </div>
        ) : null}
      </Field>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Overall rating" htmlFor={`edit-rating-${post.id}`}>
          <RatingSlider id={`edit-rating-${post.id}`} value={form.overallRating} onChange={(value) => updateField("overallRating", value)} />
        </Field>
        <Field label="Ownership duration" htmlFor={`edit-ownership-${post.id}`}>
          <Input
            id={`edit-ownership-${post.id}`}
            value={form.ownership}
            onChange={(event) => updateField("ownership", event.target.value)}
            placeholder="Example: 6 weeks, 8 months, 1 year+"
          />
        </Field>
      </div>

      <div className="border border-ink bg-white p-4">
        <p className="mb-4 text-sm font-black uppercase text-ink">Category ratings</p>
        <div className="grid gap-4 md:grid-cols-2">
          {ratingFields.map((field) => (
            <Field key={field} label={field} htmlFor={`edit-${field}-${post.id}`}>
              <RatingSlider id={`edit-${field}-${post.id}`} value={form[field]} onChange={(value) => updateField(field, value)} />
            </Field>
          ))}
        </div>
      </div>

      <Field label="Review title" htmlFor={`edit-title-${post.id}`}>
        <Input
          id={`edit-title-${post.id}`}
          value={form.title}
          onChange={(event) => updateField("title", event.target.value)}
          placeholder="What should buyers know first?"
        />
      </Field>
      <Field label="Full review" htmlFor={`edit-body-${post.id}`}>
        <Textarea
          id={`edit-body-${post.id}`}
          value={form.body}
          onChange={(event) => updateField("body", event.target.value)}
          placeholder="Share real ownership details: battery, reliability, comfort, quirks, updates, repair concerns..."
        />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Pros" htmlFor={`edit-pros-${post.id}`}>
          <Textarea
            id={`edit-pros-${post.id}`}
            value={form.pros}
            onChange={(event) => updateField("pros", event.target.value)}
            placeholder="Excellent camera, bright display, strong value"
          />
        </Field>
        <Field label="Cons" htmlFor={`edit-cons-${post.id}`}>
          <Textarea
            id={`edit-cons-${post.id}`}
            value={form.cons}
            onChange={(event) => updateField("cons", event.target.value)}
            placeholder="Slow charging, gets warm, expensive accessories"
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={saving || processingPhoto}>
          <Save className="h-4 w-4" aria-hidden="true" />
          {processingPhoto ? "Adjusting Photo..." : saving ? "Saving..." : "Save Changes"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={onCancel} disabled={saving || processingPhoto}>
          <X className="h-4 w-4" aria-hidden="true" />
          Cancel
        </Button>
      </div>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function RatingSlider({ id, value, onChange }: { id: string; value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <input
        id={id}
        type="range"
        min="1"
        max="5"
        step="0.1"
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="focus-ring h-2 w-full cursor-pointer accent-signal"
      />
      <span className="w-12 border border-ink bg-white px-2 py-1 text-center text-sm font-black">{value.toFixed(1)}</span>
    </div>
  );
}
