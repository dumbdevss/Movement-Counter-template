import {
  AccountAuthenticatorEd25519,
  Ed25519PublicKey,
  Ed25519Signature,
  generateSigningMessageForTransaction,
  SimpleTransaction,
} from '@aptos-labs/ts-sdk';
import { aptos, CONTRACT_ADDRESS, toHex } from './aptos';

export type CounterAction = 'increment' | 'decrement';

export interface CounterTransaction {
  action: CounterAction;
  amount: number;
}

export interface SignRawHashFunction {
  (params: { address: string; chainType: 'aptos'; hash: `0x${string}` }): Promise<{
    signature: string;
  }>;
}

/**
 * Get the contract function name for a counter action
 */
export const getCounterFunction = (action: CounterAction): `${string}::${string}::${string}` => {
  const functionName = action === 'increment' ? 'add_counter' : 'subtract_counter';
  return `${CONTRACT_ADDRESS}::counter::${functionName}` as `${string}::${string}::${string}`;
};

/**
 * Build and submit a single counter transaction with gas sponsorship
 */
export const submitCounterTransaction = async (
  action: CounterAction,
  amount: number,
  walletAddress: string,
  publicKeyHex: string,
  signRawHash: SignRawHashFunction
): Promise<string> => {
  try {
    console.log(`[Privy Transaction] Starting ${action} transaction:`, { 
      action, 
      amount, 
      walletAddress, 
      publicKeyLength: publicKeyHex?.length 
    });

    // Build the transaction (user pays gas fees)
    const rawTxn = await aptos.transaction.build.simple({
      sender: walletAddress,
      data: {
        function: getCounterFunction(action),
        typeArguments: [],
        functionArguments: [amount],
      },
    });

    console.log('[Privy Transaction] Transaction built successfully');

    // Generate signing message
    const message = generateSigningMessageForTransaction(rawTxn);
    console.log('[Privy Transaction] Signing message generated');

    // Sign with Privy wallet
    const { signature: rawSignature } = await signRawHash({
      address: walletAddress,
      chainType: 'aptos',
      hash: `0x${toHex(message)}`,
    });

    console.log('[Privy Transaction] Transaction signed successfully');

    // Create authenticator
    // Ensure publicKeyHex is properly formatted (remove 0x prefix and any leading bytes)
    let cleanPublicKey = publicKeyHex.startsWith('0x') ? publicKeyHex.slice(2) : publicKeyHex;

    // If public key is 66 characters (33 bytes), remove the first byte (00 prefix)
    if (cleanPublicKey.length === 66) {
      cleanPublicKey = cleanPublicKey.slice(2);
    }

    const senderAuthenticator = new AccountAuthenticatorEd25519(
      new Ed25519PublicKey(cleanPublicKey),
      new Ed25519Signature(rawSignature.startsWith('0x') ? rawSignature.slice(2) : rawSignature)
    );

    console.log('[Privy Transaction] Submitting transaction to blockchain');

    // Submit the signed transaction directly to the blockchain
    const committedTransaction = await aptos.transaction.submit.simple({
      transaction: rawTxn,
      senderAuthenticator,
    });

    console.log('[Privy Transaction] Transaction submitted:', committedTransaction.hash);

    // Wait for confirmation
    const executed = await aptos.waitForTransaction({
      transactionHash: committedTransaction.hash,
    });

    if (!executed.success) {
      throw new Error('Transaction failed');
    }

    console.log('[Privy Transaction] Transaction confirmed successfully');

    return committedTransaction.hash;
  } catch (error) {
    console.error(`Error submitting ${action} transaction:`, error);
    throw error;
  }
};

/**
 * Submit counter transaction using native wallet adapter (for Nightly, etc.)
 * This follows the pattern from send-transaction.tsx
 */
export const submitCounterTransactionNative = async (
  action: CounterAction,
  amount: number,
  walletAddress: string,
  signAndSubmitTransaction: any
): Promise<string> => {
  try {
    const response = await signAndSubmitTransaction({
      sender: walletAddress,
      data: {
        function: getCounterFunction(action),
        functionArguments: [amount],
      },
    });

    console.log(response)

    // Wait for transaction confirmation
    const executed = await aptos.waitForTransaction({
      transactionHash: response.hash,
    });

    if (!executed.success) {
      throw new Error('Transaction failed');
    }

    return response.hash;
  } catch (error) {
    console.error(`Error submitting ${action} transaction with native wallet:`, error);
    throw error;
  }
};

/**
 * Fetch current counter value from blockchain
 */
export const fetchCounterValue = async (address: string): Promise<number | null> => {
  try {
    const result = await aptos.view({
      payload: {
        function: `${CONTRACT_ADDRESS}::counter::get_counter`,
        typeArguments: [],
        functionArguments: [address],
      },
    });

    return Number(result[0]);
  } catch (error) {
    console.error('Error fetching counter value:', error);
    return null;
  }
};
