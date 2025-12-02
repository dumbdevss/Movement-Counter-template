"use client";

import { ReactNode } from "react";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { MOVEMENT_CONFIGS, CURRENT_NETWORK } from "@/app/lib/aptos";

interface WalletProviderProps {
  children: ReactNode;
}

export function WalletProvider({ children }: WalletProviderProps) {
  // Movement network configuration from aptos.ts
  const aptosConfig = new AptosConfig({
    network: Network.MAINNET,
    fullnode: MOVEMENT_CONFIGS[CURRENT_NETWORK].fullnode,
  });
  
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={aptosConfig}
      onError={(error) => {
        console.error("Wallet error:", error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}