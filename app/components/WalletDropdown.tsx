'use client';

import { useState, useRef, useEffect } from 'react';

interface WalletDropdownProps {
  walletAddress: string;
  isOpen: boolean;
  onClose: () => void;
  onCopy: (text: string) => void;
}

export default function WalletDropdown({ walletAddress, isOpen, onClose, onCopy }: WalletDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const shortAddress = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
  const explorerUrl = `https://explorer.movementnetwork.xyz/account/${walletAddress}?network=bardock+testnet`;
  const faucetUrl = 'https://faucet.movementnetwork.xyz/';

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    onCopy('Wallet address copied to clipboard!');
  };

  const handleOpenExplorer = () => {
    window.open(explorerUrl, '_blank');
  };

  const handleOpenFaucet = () => {
    window.open(faucetUrl, '_blank');
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 mt-2 z-50"
      style={{
        backgroundColor: 'white',
        border: '3px solid black',
        boxShadow: '4px 4px 0px black',
        borderRadius: '12px',
        padding: '16px',
        minWidth: '280px'
      }}
    >
      {/* Wallet Address Section */}
      <div className="mb-4">
        <div className="text-sm font-bold text-gray-600 mb-2">Wallet Address</div>
        <div 
          className="flex items-center justify-between p-3 rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
          style={{
            backgroundColor: '#e8f4f8',
            border: '2px solid black'
          }}
          onClick={handleCopyAddress}
        >
          <div className="font-mono text-sm">{shortAddress}</div>
          <div className="text-lg">📋</div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">

        <button
          onClick={handleOpenExplorer}
          className="w-full flex items-center justify-between p-3 rounded-lg font-bold text-white transition-opacity hover:opacity-90"
          style={{
            backgroundColor: '#ff6600',
            border: '2px solid black',
            boxShadow: '2px 2px 0px black'
          }}
        >
          <span>View on Explorer</span>
          <span>🔍</span>
        </button>

        <button
          onClick={handleOpenFaucet}
          className="w-full flex items-center justify-between p-3 rounded-lg font-bold text-white transition-opacity hover:opacity-90"
          style={{
            backgroundColor: '#00ff88',
            border: '2px solid black',
            boxShadow: '2px 2px 0px black'
          }}
        >
          <span>Get Test Tokens</span>
          <span>🚰</span>
        </button>
      </div>

      {/* Network Info */}
      <div className="mt-4 pt-3 border-t-2 border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Movement Testnet (Bardock)
        </div>
      </div>
    </div>
  );
}
