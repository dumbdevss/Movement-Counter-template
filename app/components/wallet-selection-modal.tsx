"use client";

import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { usePrivy, useLogin } from "@privy-io/react-auth";
import { useCreateWallet } from "@privy-io/react-auth/extended-chains";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { getAptosWallets } from "@aptos-labs/wallet-standard";
import { Separator } from "@/app/components/ui/separator";
import { createMovementWallet } from "@/app/lib/privy-movement";
import { MOVEMENT_CONFIGS, CURRENT_NETWORK } from "@/app/lib/aptos";
import Image from "next/image";

interface WalletSelectionModalProps {
  children: React.ReactNode;
}

export function WalletSelectionModal({ children }: WalletSelectionModalProps) {
  const [open, setOpen] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);
  const { wallets, connect } = useWallet();
  const { ready, authenticated, user } = usePrivy();
  const { createWallet } = useCreateWallet();

  // Check for Movement wallet
  const movementWallet: any = user?.linkedAccounts?.find(
    (account: any) => account.type === 'wallet' && account.chainType === 'aptos'
  );

  // Filter out unwanted wallets, remove duplicates, and sort with Nightly first
  const filteredWallets = wallets?.filter((wallet) => {
      const name = wallet.name.toLowerCase();
      return !name.includes("petra") && 
             !name.includes("google") && 
             !name.includes("apple");
    })
    .filter((wallet, index, self) => {
      // Remove duplicates based on wallet name
      return index === self.findIndex((w) => w.name === wallet.name);
    })
    .sort((a, b) => {
      // Nightly always first
      if (a.name.toLowerCase().includes("nightly")) return -1;
      if (b.name.toLowerCase().includes("nightly")) return 1;
      return 0;
    });

  const handleWalletSelect = async (walletName: string) => {
    try {
      // Try to connect with Movement network info using wallet-standard features
      if (typeof window !== "undefined") {
        const allWallets = getAptosWallets();
        const selectedWallet = allWallets.aptosWallets.find(w => w.name === walletName);

        if (selectedWallet?.features?.['aptos:connect']) {
          // Use wallet-standard aptos:connect feature with network info
          const networkInfo: any = {
            chainId: MOVEMENT_CONFIGS[CURRENT_NETWORK].chainId,
            name: "custom" as const,
            url: MOVEMENT_CONFIGS[CURRENT_NETWORK].fullnode
          };

          try {
            const result = await selectedWallet.features['aptos:connect'].connect(false, networkInfo);

            // If wallet-standard connection succeeded, now connect via wallet adapter
            if (result.status === "Approved") {
              await connect(walletName as any);
              setOpen(false);
              return;
            }
          } catch (connectError) {
            // Fallback to standard connection
          }
        }
      }

      // Fallback to standard wallet adapter connection
      await connect(walletName as any);
      setOpen(false);
    } catch (error) {
      // Silent error - wallet adapter will handle error display
    }
  };

  const handleWalletCreation = async (user: any) => {
    try {
      setIsCreatingWallet(true)

      // Create Movement wallet using API
      const movementWallet = await createMovementWallet(user, createWallet);

      setOpen(false);
      return movementWallet;
    } catch (error) {
      console.error('Wallet creation error:', error);
    } finally {
      setIsCreatingWallet(false);
    }
  };

  const { login } = useLogin({
    onComplete: async ({ user, isNewUser, wasAlreadyAuthenticated, loginMethod, loginAccount }) => {

      try {
        // Create wallet after successful login
        await handleWalletCreation(user);
      } catch (error) {
        console.error('Error in login completion:', error);
        setIsCreatingWallet(false);
      }
    },
    onError: (error) => {
      console.error('Login failed:', error);
      setIsCreatingWallet(false);
    }
  });

  const handlePrivyLogin = async () => {
    try {
      setIsCreatingWallet(true);

      if (!authenticated) {
        await login({ 
          loginMethods: ['email', 'twitter', 'google', 'github', 'discord'], 
          prefill: { type: 'email', value: '' }, 
          disableSignup: false 
        });
      } else {
        // User is already authenticated, just create wallet
        await handleWalletCreation(user);
      }
    } catch (error) {
      console.error('Privy login error:', error);
      setIsCreatingWallet(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect Wallet</DialogTitle>
          <DialogDescription>
            Choose a wallet to connect to Movement Network
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {/* Privy Social Login Option */}
          <div className="space-y-3">
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Login with Privy</h3>
              <p className="text-sm text-muted-foreground">
                Secure social login with automatic wallet creation
              </p>
            </div>

            <Button
              variant="default"
              className="w-full justify-center h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium"
              onClick={handlePrivyLogin}
              disabled={isCreatingWallet || authenticated}
            >
              {isCreatingWallet ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Setting up wallet...</span>
                </div>
              ) : authenticated ? (
                <span>✓ Setup Movement Wallet</span>
              ) : (
                <span>Continue with Privy</span>
              )}
            </Button>

            {authenticated && user && (
              <div className="space-y-2">
                {/* User Authentication Status */}
                <div className="text-sm text-muted-foreground text-center bg-muted/50 p-3 rounded-lg">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Authenticated as: {user.email?.address || user.phone?.number || 'User'}</span>
                  </div>
                </div>

                {/* Movement Wallet Status */}
                {movementWallet ? (
                  <div className="text-sm text-center bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 p-3 rounded-lg">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="font-medium text-blue-700">Movement Wallet Connected</span>
                    </div>
                    <div className="text-xs text-blue-600 font-mono">
                      {movementWallet.address?.slice(0, 6)}...{movementWallet.address?.slice(-4)}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-center bg-orange-50 border border-orange-200 p-3 rounded-lg">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                      <span className="text-orange-700">Movement Wallet Not Created</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="relative my-6">
            <Separator />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="bg-background px-2 text-xs text-muted-foreground">OR</span>
            </div>
          </div>

          {/* Native Wallet Options */}
          <div className="space-y-3">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-1">Connect Native Wallet</h3>
              <p className="text-xs text-muted-foreground">
                Use your existing Aptos wallet
              </p>
            </div>
            <div className="space-y-2">
              {filteredWallets?.length === 0 ? (
                <div className="text-center py-6 px-4 border border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    No wallets detected
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Please install a supported Aptos wallet like Nightly
                  </p>
                </div>
              ) : (
                filteredWallets?.map((wallet) => (
                  <Button
                    key={wallet.name}
                    variant="outline"
                    className="w-full justify-start h-12 hover:bg-accent"
                    onClick={() => handleWalletSelect(wallet.name)}
                  >
                    <div className="flex items-center space-x-3">
                      {wallet.icon && (
                        <img 
                          src={wallet.icon} 
                          alt={wallet.name} 
                          className="w-6 h-6 rounded"
                        />
                      )}
                      <span className="font-medium">{wallet.name}</span>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}