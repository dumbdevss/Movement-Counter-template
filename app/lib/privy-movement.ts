/**
 * Utility functions for creating and managing Movement wallets with Privy
 */

export interface CreateWalletFunction {
  (params: { chainType: 'aptos' }): Promise<any>;
}

/**
 * Create a Movement wallet for a Privy user
 * @param user - The Privy user object
 * @param createWallet - The createWallet function from useCreateWallet hook
 * @returns The created wallet object with address
 */
export async function createMovementWallet(
  user: any,
  createWallet: CreateWalletFunction
): Promise<any> {
  try {
    // Check if user already has an Aptos/Movement wallet
    const existingWallet = user?.linkedAccounts?.find(
      (account: any) => account.type === 'wallet' && account.chainType === 'aptos'
    );

    if (existingWallet) {
      console.log('Movement wallet already exists:', existingWallet.address);
      return existingWallet;
    }

    // Create a new Aptos/Movement wallet
    console.log('Creating new Movement wallet for user...');
    const wallet = await createWallet({ chainType: 'aptos' });
    
    console.log('Movement wallet created successfully:', (wallet as any).address);
    return wallet;
  } catch (error) {
    console.error('Error creating Movement wallet:', error);
    throw error;
  }
}
