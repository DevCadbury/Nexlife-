'use client';
import { useState, useEffect, useRef } from 'react';
import { getCategories } from '@/lib/api';
import type { CategoriesResponse } from '@/lib/types/product';

const cache = new Map<string, { data: CategoriesResponse; ts: number }>();
const STALE_MS = 60_000;

export function useCategories(site?: string) {
  const key = JSON.stringify({ site });
  const [data, setData] = useState<CategoriesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.ts < STALE_MS) {
      setData(cached.data);
      setIsLoading(false);
      return;
    }

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    getCategories(site)
      .then((res) => {
        cache.set(key, { data: res, ts: Date.now() });
        setData(res);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load categories.');
          setIsLoading(false);
        }
      });

    return () => abortRef.current?.abort();
  }, [key]);

  return { data, error, isLoading };
}
