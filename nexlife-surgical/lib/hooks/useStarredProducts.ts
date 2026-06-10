'use client';
import { useState, useEffect, useRef } from 'react';
import { getStarredProducts } from '@/lib/api';
import type { ProductsResponse } from '@/lib/types/product';

const cache = new Map<string, { data: ProductsResponse; ts: number }>();
const STALE_MS = 60_000;

export function useStarredProducts(site?: string) {
  const key = JSON.stringify({ site });
  const [data, setData] = useState<ProductsResponse | null>(null);
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

    getStarredProducts(site)
      .then((res) => {
        cache.set(key, { data: res, ts: Date.now() });
        setData(res);
        setIsLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to load starred products.');
          setIsLoading(false);
        }
      });

    return () => abortRef.current?.abort();
  }, [key]);

  return { data, error, isLoading };
}
