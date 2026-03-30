import React, { useState, useEffect, type ReactNode } from 'react';

/**
 * Swizzled Root component.
 *
 * Dynamically loads AuthProvider on client only (it uses Privy + wagmi browser APIs).
 * During SSR and initial client render, children render without providers.
 * SDK components wrapped in BrowserOnly will render during the second paint
 * after the provider loads.
 */
export default function Root({ children }: { children: ReactNode }) {
  const [Wrapper, setWrapper] = useState<React.ComponentType<{ children: ReactNode }> | null>(null);
  const isBrowser = typeof window !== 'undefined';

  useEffect(() => {
    import('../auth/AuthProvider').then((mod) => {
      setWrapper(() => mod.AuthProvider);
    });
  }, []);

  if (!isBrowser || !Wrapper) {
    return <>{children}</>;
  }

  return <Wrapper>{children}</Wrapper>;
}
