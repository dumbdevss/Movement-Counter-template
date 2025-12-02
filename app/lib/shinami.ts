import { GasStationClient } from '@shinami/clients/aptos';

// Validate that API key is configured
export const validateGasStationKey = (): boolean => {
  return !!process.env.SHINAMI_GAS_STATION_KEY;
};

// Create Shinami Gas Station client on-demand
// API key should be stored in environment variable (server-side only)
// The access key format (us1_movement_testnet_xxx) determines the target blockchain
export const getGasStationClient = (): GasStationClient => {
  return new GasStationClient(process.env.SHINAMI_GAS_STATION_KEY || '');
};
