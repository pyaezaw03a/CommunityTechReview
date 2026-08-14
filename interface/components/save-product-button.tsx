"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { storageKeys } from "@/lib/storage-keys";

export function SaveProductButton({ slug }: { slug: string }) {
  const [savedProducts, setSavedProducts] = useLocalStorage<string[]>(storageKeys.savedProducts, []);
  const isSaved = savedProducts.includes(slug);

  function toggleSaved() {
    setSavedProducts((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]));
  }

  return (
    <Button type="button" variant={isSaved ? "olive" : "outline"} onClick={toggleSaved}>
      {isSaved ? <BookmarkCheck className="h-4 w-4" aria-hidden="true" /> : <Bookmark className="h-4 w-4" aria-hidden="true" />}
      {isSaved ? "Saved" : "Save Product"}
    </Button>
  );
}
