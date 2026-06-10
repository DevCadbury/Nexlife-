'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Site } from '@/lib/types/product';

interface SiteContextValue {
  site: Site;
  setSite: (site: Site) => void;
}

const SiteContext = createContext<SiteContextValue>({
  site: 'surgical',
  setSite: () => {},
});

export function SiteContextProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const getInitialSite = (): Site => {
    const param = searchParams.get('site');
    if (param === 'surgical' || param === 'general') return param;
    const envSite = process.env.NEXT_PUBLIC_SITE_NAME;
    if (envSite === 'surgical' || envSite === 'general') return envSite;
    return 'surgical';
  };

  const [site, setSiteState] = useState<Site>(getInitialSite);

  // Keep state in sync when URL param changes (e.g., back/forward)
  useEffect(() => {
    const param = searchParams.get('site');
    if (param === 'surgical' || param === 'general') {
      setSiteState(param);
    }
  }, [searchParams]);

  const setSite = (newSite: Site) => {
    setSiteState(newSite);
    const params = new URLSearchParams(searchParams.toString());
    params.set('site', newSite);
    router.push(`?${params.toString()}`);
  };

  return (
    <SiteContext.Provider value={{ site, setSite }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSiteContext() {
  return useContext(SiteContext);
}
