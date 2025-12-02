'use client';

import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import CounterItem from './counterItem';
import WalletDropdown from './WalletDropdown';
import Toast from './Toast';

interface CounterArenaProps {
  username: string;
}

export default function CounterArena({ username }: CounterArenaProps) {
  const { logout: privyLogout, authenticated } = usePrivy();
  const { disconnect, connected } = useWallet();
  const [showStats, setShowStats] = useState(false);
  const [showWalletDropdown, setShowWalletDropdown] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; isVisible: boolean }>({ message: '', type: 'info', isVisible: false });

  // Determine which wallet type is being used
  const isPrivyWallet = authenticated;
  const isNativeWallet = connected && !authenticated;

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    // Fully reset toast state to ensure clean state
    setToast({ message: '', type: 'info', isVisible: false });
  };

  // Handle logout/disconnect based on wallet type
  const handleLogout = async () => {
    try {
      if (isPrivyWallet) {
        await privyLogout();
        showToast('Logged out from Privy', 'info');
      } else if (isNativeWallet) {
        await disconnect();
        showToast('Wallet disconnected', 'info');
      }
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Error disconnecting wallet', 'error');
    }
  };

  return (
    <div className="min-h-screen overflow-auto flex flex-col gap-4 justify-start items-center p-4" style={{ backgroundColor: '#e8f4f8' }}>
      {/* Header */}
      <div className="w-full max-w-4xl">
        <div 
          className="bg-white rounded-xl p-6 flex justify-between items-center"
          style={{
            border: '4px solid black',
            boxShadow: '4px 4px 0px black'
          }}
        >
          <div>
            <h1 className="text-3xl font-black mb-2" style={{ letterSpacing: '0.05em' }}>
              🎮 COUNTER GAME 🎮
            </h1>
            <p className="text-gray-600 flex items-center gap-2">
              Increment or decrement your counter and level up!
              {isPrivyWallet && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                  Privy
                </span>
              )}
              {isNativeWallet && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                  Native
                </span>
              )}
            </p>
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <button
                onClick={() => setShowWalletDropdown(!showWalletDropdown)}
                className="font-bold text-white px-4 py-2 rounded-lg transition-opacity hover:opacity-90 flex items-center gap-2"
                style={{
                  backgroundColor: '#0099ff',
                  border: '3px solid black',
                  boxShadow: '3px 3px 0px black'
                }}
              >
                <span>👛</span>
                <span>Wallet</span>
              </button>
              
              <WalletDropdown
                walletAddress={username}
                isOpen={showWalletDropdown}
                onClose={() => setShowWalletDropdown(false)}
                onCopy={(message) => showToast(message, 'success')}
              />
            </div>
            
            <button
              onClick={handleLogout}
              className="font-bold text-white px-4 py-2 rounded-lg transition-opacity hover:opacity-90"
              style={{
                backgroundColor: '#ff4444',
                border: '3px solid black',
                boxShadow: '3px 3px 0px black'
              }}
            >
              {isPrivyWallet ? '🚪 LOGOUT' : '🔌 DISCONNECT'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div className="w-full max-w-4xl">
          <div 
            className="bg-white rounded-xl p-6"
            style={{
              border: '4px solid black',
              boxShadow: '4px 4px 0px black'
            }}
          >
            <h2 className="text-2xl font-black mb-4">📈 GAME STATS</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div 
                className="p-4 rounded-lg text-center"
                style={{
                  backgroundColor: '#e8f4f8',
                  border: '2px solid black'
                }}
              >
                <div className="text-2xl font-bold">🎯</div>
                <div className="text-sm text-gray-600">Total Actions</div>
                <div className="text-xl font-bold">Coming Soon</div>
              </div>
              
              <div 
                className="p-4 rounded-lg text-center"
                style={{
                  backgroundColor: '#e8f4f8',
                  border: '2px solid black'
                }}
              >
                <div className="text-2xl font-bold">🏆</div>
                <div className="text-sm text-gray-600">Best Streak</div>
                <div className="text-xl font-bold">Coming Soon</div>
              </div>
              
              <div 
                className="p-4 rounded-lg text-center"
                style={{
                  backgroundColor: '#e8f4f8',
                  border: '2px solid black'
                }}
              >
                <div className="text-2xl font-bold">⚡</div>
                <div className="text-sm text-gray-600">Highest Level</div>
                <div className="text-xl font-bold">Coming Soon</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Counter Component */}
      <div className="w-full max-w-4xl">
        <CounterItem username={username} onToast={showToast} />
      </div>

      {/* Game Rules */}
      <div className="w-full max-w-4xl">
        <div 
          className="bg-white rounded-xl p-6"
          style={{
            border: '4px solid black',
            boxShadow: '4px 4px 0px black'
          }}
        >
          <h2 className="text-2xl font-black mb-4">🎲 HOW TO PLAY</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#0099ff' }}>
                🚀 Level Up System
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Every 100 counter points = 1 level</li>
                <li>• Higher levels unlock cooler emojis</li>
                <li>• Level progress shown in progress bar</li>
                <li>• Counter can be positive or negative</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#ff6600' }}>
                🔥 Streak System
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Each successful action increases streak</li>
                <li>• Failed transactions don't break streak</li>
                <li>• Higher streaks = bragging rights</li>
                <li>• Keep clicking to build momentum!</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-2" style={{ color: isPrivyWallet ? '#0099ff' : '#00cc88' }}>
                {isPrivyWallet ? '💳 Privy Wallet' : '🔐 Native Wallet'}
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                {isPrivyWallet ? (
                  <>
                    <li>• Social login convenience</li>
                    <li>• Embedded wallet solution</li>
                    <li>• You pay your own gas fees</li>
                    <li>• Wallet managed by Privy</li>
                  </>
                ) : (
                  <>
                    <li>• You pay your own gas fees</li>
                    <li>• Manual transaction approval</li>
                    <li>• Full wallet control</li>
                    <li>• Self-custody security</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
