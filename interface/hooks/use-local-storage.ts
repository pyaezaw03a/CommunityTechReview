"use client";

import { Dispatch, SetStateAction, useCallback, useEffect, useRef, useState } from "react";

const localStorageEvent = "gadgetpulse-local-storage";

export function useLocalStorage<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>] {
  const initialRef = useRef(initialValue);
  const [value, setValue] = useState<T>(initialValue);
  const valueRef = useRef<T>(initialValue);

  useEffect(() => {
    function readStoredValue() {
      try {
        const stored = window.localStorage.getItem(key);
        const parsed = stored ? (JSON.parse(stored) as T) : initialRef.current;
        valueRef.current = parsed;
        setValue(parsed);
      } catch {
        valueRef.current = initialRef.current;
        setValue(initialRef.current);
      }
    }

    function handleLocalUpdate(event: Event) {
      const detail = (event as CustomEvent<{ key: string }>).detail;
      if (!detail || detail.key === key) readStoredValue();
    }

    function handleStorage(event: StorageEvent) {
      if (event.key === key) readStoredValue();
    }

    readStoredValue();
    window.addEventListener(localStorageEvent, handleLocalUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(localStorageEvent, handleLocalUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, [key]);

  const updateValue = useCallback<Dispatch<SetStateAction<T>>>(
    (nextValue) => {
      const resolved =
        typeof nextValue === "function" ? (nextValue as (current: T) => T)(valueRef.current) : nextValue;
      valueRef.current = resolved;
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
        window.dispatchEvent(new CustomEvent(localStorageEvent, { detail: { key } }));
      } catch {
        // Keep the in-memory UI usable if the browser blocks localStorage.
      }
      setValue(resolved);
    },
    [key]
  );

  return [value, updateValue];
}
