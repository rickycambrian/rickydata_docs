import React from 'react';

// Lazy-load AuthProvider only on client to avoid SSR issues with Privy/wagmi.
// We avoid BrowserOnly here because it causes React hooks ordering violations
// when the child component (AuthProvider) uses hooks.
const LazyAuthProvider = React.lazy(() =>
  import('../auth/AuthProvider').then((mod) => ({ default: mod.AuthProvider })),
);

export default function Root({ children }: { children: React.ReactNode }) {
  const isBrowser = typeof window !== 'undefined';

  if (!isBrowser) {
    return <>{children}</>;
  }

  return (
    <React.Suspense fallback={<>{children}</>}>
      <LazyAuthProvider>{children}</LazyAuthProvider>
    </React.Suspense>
  );
}
