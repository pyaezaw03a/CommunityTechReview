"use client";

import Image from "next/image";
import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Send, X } from "lucide-react";

import { categories, type Category, type Review } from "@/data/domain";
import { useAuth } from "@/components/auth/auth-provider";
import { useReviews } from "@/components/reviews-provider";
import { ReviewStatusBadge } from "@/components/review-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { slugify } from "@/lib/utils";

const ratingFields = ["performance", "camera", "battery", "display", "value"] as const;

type FormState = {
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

function createInitialState(productName = "", category: Category = "Accessories"): FormState {
  return {
    productName,
    category,
    overallRating: 3,
    performance: 3,
    camera: 3,
    battery: 3,
    display: 3,
    value: 3,
    title: "",
    body: "",
    pros: "",
    cons: "",
    ownership: "1-3 months"
  };
}

export function SubmitReviewForm({ initialProductSlug }: { initialProductSlug?: string }) {
  const { currentUser } = useAuth();
  const { createReview, products } = useReviews();
  const [form, setForm] = useState<FormState>(() => createInitialState());
  const [errors, setErrors] = useState<string[]>([]);
  const [submittedReview, setSubmittedReview] = useState<Review | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const reviewUsername = currentUser?.username ?? "";
  const initialProduct = products.find((product) => product.slug === initialProductSlug);
  const selectedProduct = useMemo(
    () =>
      products.find(
        (product) =>
          product.name.toLowerCase() === form.productName.trim().toLowerCase() ||
          product.slug === slugify(form.productName)
      ),
    [form.productName, products]
  );

  useEffect(() => {
    if (initialProduct && !form.productName) {
      setForm((current) => ({ ...current, productName: initialProduct.name, category: initialProduct.category }));
    }
  }, [form.productName, initialProduct]);

  function updateField<T extends keyof FormState>(field: T, value: FormState[T]) {
    setForm((current) => ({ ...current, [field]: value }));
    setSubmittedReview(null);
  }

  function parseTags(value: string) {
    return value.split(/[,\n]/).map((tag) => tag.trim()).filter(Boolean);
  }

  function clearPhoto() {
    setPhoto(null);
    setPhotoPreview("");
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  function handlePhotoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      clearPhoto();
      return;
    }

    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
    if (!allowedTypes.has(file.type)) {
      setErrors(["Product photos must be JPG, PNG, or WebP images."]);
      clearPhoto();
      return;
    }
    if (file.size > 5_000_000) {
      setErrors(["Product photos must be smaller than 5MB."]);
      clearPhoto();
      return;
    }

    setPhoto(file);
    setErrors([]);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(String(reader.result));
    reader.readAsDataURL(file);
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
    if (!currentUser) return;

    setSubmitting(true);
    try {
      const review = await createReview(
        {
          userId: currentUser.id,
          productSlug: selectedProduct?.slug ?? `custom-${slugify(cleanProductName)}`,
          productName: selectedProduct?.name ?? cleanProductName,
          username: reviewUsername,
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
      setForm(createInitialState(form.productName, selectedProduct?.category ?? form.category));
      clearPhoto();
      setSubmittedReview(review);
      setErrors([]);
    } catch (requestError) {
      setErrors([(requestError as Error).message]);
    } finally {
      setSubmitting(false);
    }
  }

  if (!currentUser) {
    return (
      <div className="grid gap-5 border border-ink bg-white p-8 text-center">
        <p className="text-3xl font-black uppercase text-ink">Sign In To Write A Review</p>
        <p className="text-sm text-muted">Only signed-in community members can publish reviews to the shared review service.</p>
        <Button asChild className="justify-self-center">
          <Link href="/login?redirect=/submit-review">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 border border-ink bg-white p-4 sm:p-6">
      {submittedReview ? (
        <div className="flex flex-wrap items-start justify-between gap-3 border border-amber-500 bg-amber-50 p-4" role="status">
          <div>
            <p className="font-black uppercase">Review submitted</p>
            <p className="mt-1 text-sm text-muted">
              Your review is saved and waiting for admin approval. It will appear publicly only after approval.
            </p>
          </div>
          <ReviewStatusBadge status={submittedReview.status} />
        </div>
      ) : null}
      {errors.length ? (
        <div className="border border-signal bg-paper p-4" role="alert">
          <p className="font-black uppercase text-signal">Please fix the following</p>
          <ul className="mt-2 grid gap-1 text-sm text-muted">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Product" htmlFor="product">
          <Input
            id="product"
            value={form.productName}
            onChange={(event) => updateField("productName", event.target.value)}
            placeholder="Type any product name"
          />
        </Field>
        <Field label="Category" htmlFor="category">
          <Select
            id="category"
            value={selectedProduct?.category ?? form.category}
            onChange={(event) => updateField("category", event.target.value as Category)}
            disabled={Boolean(selectedProduct)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Product photo (optional)" htmlFor="product-photo">
        <Input
          ref={photoInputRef}
          id="product-photo"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoChange}
        />
        <p className="text-xs font-semibold text-muted">
          Upload one clear JPG, PNG, or WebP photo up to 5MB. It will appear after admin approval.
        </p>
        {photoPreview ? (
          <div className="relative mt-2 max-w-xl border border-ink bg-paper p-2">
            <div className="relative h-72 w-full">
              <Image
                src={photoPreview}
                alt="Product upload preview"
                fill
                unoptimized
                sizes="576px"
                className="object-contain"
              />
            </div>
            <Button
              type="button"
              size="icon"
              variant="outline"
              className="absolute right-4 top-4 bg-white"
              onClick={clearPhoto}
              aria-label="Remove product photo"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
            <p className="mt-2 flex items-center gap-2 text-xs font-black uppercase text-muted">
              <ImagePlus className="h-4 w-4 text-signal" aria-hidden="true" />
              {photo?.name}
            </p>
          </div>
        ) : null}
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Display username" htmlFor="username">
          <Input id="username" value={reviewUsername} readOnly aria-readonly="true" className="bg-paper" />
          <p className="text-xs font-semibold text-muted">Username is fixed here. Change it from Account settings.</p>
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Overall rating" htmlFor="overallRating">
          <RatingSlider id="overallRating" value={form.overallRating} onChange={(value) => updateField("overallRating", value)} />
        </Field>
        <Field label="Ownership duration" htmlFor="ownership">
          <Input
            id="ownership"
            value={form.ownership}
            onChange={(event) => updateField("ownership", event.target.value)}
            placeholder="Example: 6 weeks, 8 months, 1 year+"
          />
        </Field>
      </div>
      <div className="border border-ink bg-paper p-4">
        <p className="mb-4 text-sm font-black uppercase text-ink">Category ratings</p>
        <div className="grid gap-4 md:grid-cols-2">
          {ratingFields.map((field) => (
            <Field key={field} label={field} htmlFor={field}>
              <RatingSlider id={field} value={form[field]} onChange={(value) => updateField(field, value)} />
            </Field>
          ))}
        </div>
      </div>
      <Field label="Review title" htmlFor="title">
        <Input id="title" value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="What should buyers know first?" />
      </Field>
      <Field label="Full review" htmlFor="body">
        <Textarea id="body" value={form.body} onChange={(event) => updateField("body", event.target.value)} placeholder="Share real ownership details: battery, reliability, comfort, quirks, updates, repair concerns..." />
      </Field>
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Pros" htmlFor="pros">
          <Textarea id="pros" value={form.pros} onChange={(event) => updateField("pros", event.target.value)} placeholder="Excellent camera, bright display, strong value" />
        </Field>
        <Field label="Cons" htmlFor="cons">
          <Textarea id="cons" value={form.cons} onChange={(event) => updateField("cons", event.target.value)} placeholder="Slow charging, gets warm, expensive accessories" />
        </Field>
      </div>
      <Button type="submit" size="lg" className="justify-self-start" disabled={submitting}>
        <Send className="h-4 w-4" aria-hidden="true" />
        {submitting ? "Submitting..." : "Submit For Review"}
      </Button>
    </form>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
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
