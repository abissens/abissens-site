'use client';

import { createContext, useContext, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { RouteConfig, getRouteConfig } from '@/lib/routes';

const RouteContext = createContext<RouteConfig | null>(null);

export function RouteProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const config = getRouteConfig(pathname);

  return (
    <RouteContext.Provider value={config}>
      {children}
    </RouteContext.Provider>
  );
}

export function useRoutes(): RouteConfig {
  const context = useContext(RouteContext);
  if (!context) {
    throw new Error('useRoutes must be used within RouteProvider');
  }
  return context;
}

export function useIsPreview(): boolean {
  return useRoutes().mode === 'preview';
}
