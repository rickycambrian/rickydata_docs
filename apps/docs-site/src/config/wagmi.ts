import { createConfig } from '@privy-io/wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { http } from 'wagmi';

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});
