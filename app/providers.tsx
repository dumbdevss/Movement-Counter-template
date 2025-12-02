'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { WalletProvider } from '@/app/components/wallet-provider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <PrivyProvider
        appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || 'YOUR_PRIVY_APP_ID'}
        config={{
          // Login methods - email, google, twitter, discord, and github
          loginMethods: ['email', 'google', 'twitter', 'discord', 'github'],
        }}
      >
        {children}
      </PrivyProvider>
    </WalletProvider>
  );
}
