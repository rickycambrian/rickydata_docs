import type { PrivyClientConfig } from '@privy-io/react-auth';
import { base, baseSepolia } from 'wagmi/chains';

export function getPrivyConfig(theme: 'light' | 'dark'): PrivyClientConfig {
  return {
    defaultChain: base,
    supportedChains: [base, baseSepolia],
    embeddedWallets: { ethereum: { createOnLogin: 'users-without-wallets' } },
    loginMethodsAndOrder: {
      primary: ['google', 'email', 'github'],
      overflow: ['discord', 'metamask', 'coinbase_wallet', 'wallet_connect'],
    },
    appearance: {
      theme,
      accentColor: (theme === 'dark' ? '#d5a050' : '#b8782a') as `#${string}`,
      landingHeader: 'Sign in to RickyData',
      loginMessage: 'Connect to access MCP tools and agent services',
    },
  };
}
