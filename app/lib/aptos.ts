import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

// Movement network configurations
export const MOVEMENT_CONFIGS = {
  mainnet: {
    chainId: 126,
    name: "Movement Mainnet",
    fullnode: "https://full.mainnet.movementinfra.xyz/v1",
    explorer: "mainnet"
  },
  testnet: {
    chainId: 250,
    name: "Movement Testnet",
    fullnode: "https://testnet.movementnetwork.xyz/v1",
    explorer: "testnet"
  }
};

// Current network (change this to switch between mainnet/testnet)
export const CURRENT_NETWORK = 'testnet' as keyof typeof MOVEMENT_CONFIGS;

// Initialize Aptos SDK with current Movement network
export const aptos = new Aptos(
  new AptosConfig({
    network: Network.CUSTOM,
    fullnode: MOVEMENT_CONFIGS[CURRENT_NETWORK].fullnode,
  })
);

// Contract address
export const CONTRACT_ADDRESS = '0x88d5bf2a5368c3cf3283e952e70e510cb8ce6318cfd587f1164e549827c87596';

// Utility to convert Uint8Array to hex string
export const toHex = (buffer: Uint8Array): string => {
  return Array.from(buffer)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
};

// Get explorer URL based on current network
export const getExplorerUrl = (txHash: string): string => {
  // Ensure txHash starts with 0x
  const formattedHash = txHash.startsWith('0x') ? txHash : `0x${txHash}`;
  const network = MOVEMENT_CONFIGS[CURRENT_NETWORK].explorer;
  return `https://explorer.movementnetwork.xyz/txn/${formattedHash}?network=${network}`;
};
