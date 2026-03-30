import React, { useState, useEffect, useCallback, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PrivyProvider, usePrivy } from '@privy-io/react-auth';
import { WagmiProvider as PrivyWagmiProvider } from '@privy-io/wagmi';
import { RickyDataProvider } from '@rickydata/react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { getPrivyConfig } from '../config/privy';
import { wagmiConfig } from '../config/wagmi';

const queryClient = new QueryClient();

/** Detect color mode from DOM since Root renders above ColorModeProvider */
function useDetectColorMode(): 'light' | 'dark' {
  const [mode, setMode] = useState<'light' | 'dark'>('dark');
  useEffect(() => {
    const html = document.documentElement;
    const update = () =>
      setMode(html.dataset.theme === 'dark' ? 'dark' : 'light');
    update();
    const observer = new MutationObserver(update);
    observer.observe(html, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);
  return mode;
}

/** Inner provider that has access to Privy hooks for token retrieval */
function RickyDataBridge({ children }: { children: ReactNode }) {
  const { getAccessToken, authenticated } = usePrivy();

  const getAuthToken = useCallback(async () => {
    if (!authenticated) return undefined;
    try {
      const token = await getAccessToken();
      return token ?? undefined;
    } catch {
      return undefined;
    }
  }, [authenticated, getAccessToken]);

  return (
    <RickyDataProvider
      config={{
        gatewayUrl: 'https://agents.rickydata.org',
        getAuthToken,
      }}
    >
      {children}
    </RickyDataProvider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { siteConfig } = useDocusaurusContext();
  const colorMode = useDetectColorMode();

  const privyAppId = siteConfig.customFields?.privyAppId as string | undefined;

  if (!privyAppId) {
    // No Privy configured — still provide RickyDataProvider with a no-op token getter
    // so SDK hooks don't crash, they just operate in unauthenticated mode
    return (
      <QueryClientProvider client={queryClient}>
        <RickyDataProvider
          config={{
            gatewayUrl: 'https://agents.rickydata.org',
            getAuthToken: async () => undefined,
          }}
        >
          {children}
        </RickyDataProvider>
      </QueryClientProvider>
    );
  }

  const privyConfig = getPrivyConfig(colorMode);

  return (
    <PrivyProvider appId={privyAppId} config={privyConfig}>
      <QueryClientProvider client={queryClient}>
        <PrivyWagmiProvider config={wagmiConfig}>
          <RickyDataBridge>{children}</RickyDataBridge>
        </PrivyWagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}
