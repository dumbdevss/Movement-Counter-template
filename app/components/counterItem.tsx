'use client';

import { useState, useEffect, useRef } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { submitCounterTransaction, submitCounterTransactionNative, fetchCounterValue } from '../lib/transactions';
import { useSignRawHash } from '@privy-io/react-auth/extended-chains';

interface CounterItemProps {
    username: string;
    onToast?: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export default function CounterItem({ username, onToast }: CounterItemProps) {
    const { user } = usePrivy();
    const { signRawHash } = useSignRawHash();
    const { account, signAndSubmitTransaction } = useWallet();
    const [counter, setCounter] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);
    const [lastAction, setLastAction] = useState<string>('');
    const [streak, setStreak] = useState<number>(0);
    const [level, setLevel] = useState<number>(1);
    const [pendingCount, setPendingCount] = useState<number>(0);
    const [isSyncing, setIsSyncing] = useState<boolean>(false);

    const debounceTimer = useRef<NodeJS.Timeout | null>(null);
    const pendingIncrement = useRef<number>(0);
    const pendingDecrement = useRef<number>(0);

    // Calculate level based on counter value
    useEffect(() => {
        const newLevel = Math.floor(Math.abs(counter) / 100) + 1;
        setLevel(newLevel);
    }, [counter]);

    // Fetch current counter value
    const refreshCounter = async () => {
        if (!username) return;
        try {
            const value = await fetchCounterValue(username);
            if (value !== null) {
                setCounter(value);
            }
        } catch (error) {
            console.error('Error fetching counter:', error);
            // Don't show toast for fetch errors as they're background operations
        }
    };

    useEffect(() => {
        refreshCounter();
    }, [username]);

    const handleCounterAction = async (action: 'increment' | 'decrement') => {
        // Check if either wallet is connected
        if (!user && !account) return;

        // Update pending counts
        if (action === 'increment') {
            pendingIncrement.current += 1;
        } else {
            pendingDecrement.current += 1;
        }

        // Update total pending count for display
        setPendingCount(pendingIncrement.current + pendingDecrement.current);

        // Clear existing timer
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }

        // Set new timer to sync after user stops clicking
        debounceTimer.current = setTimeout(() => {
            syncPendingCounts();
        }, 2000); // 2 second debounce

        // Clear last action after animation
        setTimeout(() => setLastAction(''), 2000);
    };


    const syncPendingCounts = async () => {
        if (isSyncing) return;

        const incrementAmount = pendingIncrement.current;
        const decrementAmount = pendingDecrement.current;

        // If no pending changes, return
        if (incrementAmount === 0 && decrementAmount === 0) return;

        setIsSyncing(true);
        setIsLoading(true);

        try {
            // Check if using native wallet or Privy wallet
            // Prioritize Privy wallet if both are available
            const isPrivyWallet = !!user?.linkedAccounts?.find(
                (acc: any) => acc.chainType === 'aptos'
            );
            const isNativeWallet = !!account && !isPrivyWallet;

            console.log('Wallet detection:', { isPrivyWallet, isNativeWallet, hasUser: !!user, hasAccount: !!account });

            if (!isNativeWallet && !isPrivyWallet) {
                throw new Error('No wallet connected');
            }

            const promises = [];

            if (isNativeWallet) {
                // Use native wallet adapter for transactions
                if (incrementAmount > 0) {
                    promises.push(
                        submitCounterTransactionNative(
                            'increment',
                            incrementAmount,
                            account?.address.toString(),
                            signAndSubmitTransaction
                        )
                    );
                }

                if (decrementAmount > 0) {
                    promises.push(
                        submitCounterTransactionNative(
                            'decrement',
                            decrementAmount,
                            account?.address.toString(),
                            signAndSubmitTransaction
                        )
                    );
                }
            } else if (isPrivyWallet) {
                // Use Privy wallet for transactions
                const moveWallet = user!.linkedAccounts!.find(
                    (acc: any) => acc.chainType === 'aptos'
                ) as any;

                if (!moveWallet) {
                    throw new Error('Privy wallet not found');
                }

                console.log('Using Privy wallet:', { address: moveWallet.address, publicKey: moveWallet.publicKey });

                if (!signRawHash) {
                    throw new Error('signRawHash function not available');
                }

                if (incrementAmount > 0) {
                    promises.push(
                        submitCounterTransaction(
                            'increment',
                            incrementAmount,
                            moveWallet.address,
                            moveWallet.publicKey,
                            signRawHash
                        )
                    );
                }

                if (decrementAmount > 0) {
                    promises.push(
                        submitCounterTransaction(
                            'decrement',
                            decrementAmount,
                            moveWallet.address,
                            moveWallet.publicKey,
                            signRawHash
                        )
                    );
                }
            }

            // Wait for all transactions to complete
            const results = await Promise.all(promises);

            console.log('Sync transactions successful:', results);

            // Show success toast
            onToast?.(
                `Synced ${incrementAmount + decrementAmount} actions to blockchain!`,
                'success'
            );

            // Reset pending counts
            pendingIncrement.current = 0;
            pendingDecrement.current = 0;
            setPendingCount(0);

            // Update local state optimistically
            setCounter(prev => incrementAmount > 0 ? prev + incrementAmount : prev - decrementAmount);
            setLastAction(incrementAmount > 0 ? '+1 🚀' : '-1 💥');
            setStreak(prev => prev + 1);

            // Refresh from blockchain
            refreshCounter();

        } catch (error: any) {
            console.error('Error syncing pending counts:', error);
            console.error('Error details:', {
                message: error?.message,
                stack: error?.stack,
                response: error?.response
            });

            // Show error toast with more details
            const errorMessage = error?.message || 'Failed to sync changes to blockchain';
            onToast?.(
                errorMessage,
                'error'
            );

            // Reset pending counts on error to prevent stuck state
            pendingIncrement.current = 0;
            pendingDecrement.current = 0;
            setPendingCount(0);

            // Show error action and clear it after delay
            setLastAction('❌ Sync Failed');
            setTimeout(() => {
                setLastAction('');
            }, 3000);
        } finally {
            setIsSyncing(false);
            setIsLoading(false);
        }
    };


    const getCounterColor = () => {
        if (counter > 50) return '#00ff88'; // Bright green for high scores
        if (counter > 20) return '#0099ff'; // Blue for medium scores
        if (counter > 0) return '#66ccff'; // Light blue for positive
        if (counter === 0) return '#999999'; // Gray for zero
        if (counter > -20) return '#ff9966'; // Orange for small negative
        return '#ff4444'; // Red for very negative
    };

    const getLevelEmoji = () => {
        if (level >= 10) return '👑';
        if (level >= 8) return '🔥';
        if (level >= 6) return '⭐';
        if (level >= 4) return '💎';
        if (level >= 2) return '🚀';
        return '🌱';
    };

    return (
        <div className="w-full mx-auto p-4">
            <div
                className="bg-white rounded-xl text-center relative overflow-hidden"
                style={{
                    border: '4px solid black',
                    boxShadow: '6px 6px 0px black',
                    padding: '2rem'
                }}
            >
                {/* Level and Streak Display */}
                <div className="flex justify-between items-center mb-6">
                    <div
                        className="px-4 py-2 rounded-lg font-bold text-white"
                        style={{
                            backgroundColor: '#0099ff',
                            border: '2px solid black',
                            boxShadow: '2px 2px 0px black'
                        }}
                    >
                        {getLevelEmoji()} Level {level}
                    </div>

                    {/* Pending Count Display */}
                    {pendingCount > 0 && (
                        <div
                            className="px-4 py-2 rounded-lg font-bold text-white animate-pulse"
                            style={{
                                backgroundColor: isSyncing ? '#ff6600' : '#9333ea',
                                border: '2px solid black',
                                boxShadow: '2px 2px 0px black'
                            }}
                        >
                            {isSyncing ? '⏳ Syncing...' : `⏱️ Pending: ${pendingCount}`}
                        </div>
                    )}

                    <div
                        className="px-4 py-2 rounded-lg font-bold text-white"
                        style={{
                            backgroundColor: '#ff6600',
                            border: '2px solid black',
                            boxShadow: '2px 2px 0px black'
                        }}
                    >
                        🔥 Streak: {streak}
                    </div>
                </div>

                {/* Counter Display */}
                <div className="mb-8">
                    <div
                        className="text-8xl font-black mb-4 transition-all duration-300"
                        style={{
                            color: getCounterColor(),
                            textShadow: '3px 3px 0px rgba(0,0,0,0.3)',
                            letterSpacing: '0.05em'
                        }}
                    >
                        {counter}
                    </div>

                    {/* Last Action Animation */}
                    {lastAction && (
                        <div
                            className="text-3xl font-bold animate-bounce"
                            style={{
                                color: lastAction.includes('Failed') ? '#ff4444' : '#00ff88',
                                textShadow: '2px 2px 0px rgba(0,0,0,0.3)'
                            }}
                        >
                            {lastAction}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4 justify-center items-center">
                    <div className="flex gap-6 justify-center">
                        <button
                            onClick={() => handleCounterAction('increment')}
                            disabled={isLoading || isSyncing}
                            className="font-bold text-white text-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
                            style={{
                                backgroundColor: '#00ff88',
                                border: '4px solid black',
                                boxShadow: '4px 4px 0px black',
                                padding: '16px 32px'
                            }}
                        >
                            {isLoading || isSyncing ? '⏳' : '➕ INCREMENT'}
                        </button>

                        <button
                            onClick={() => handleCounterAction('decrement')}
                            disabled={isLoading || isSyncing}
                            className="font-bold text-white text-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
                            style={{
                                backgroundColor: '#ff4444',
                                border: '4px solid black',
                                boxShadow: '4px 4px 0px black',
                                padding: '16px 32px'
                            }}
                        >
                            {isLoading || isSyncing ? '⏳' : '➖ DECREMENT'}
                        </button>
                    </div>

                    {/* Manual Sync Button */}
                    {pendingCount > 0 && !isSyncing && (
                        <button
                            onClick={syncPendingCounts}
                            disabled={isLoading || isSyncing}
                            className="font-bold text-white text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg"
                            style={{
                                backgroundColor: '#9333ea',
                                border: '3px solid black',
                                boxShadow: '3px 3px 0px black',
                                padding: '8px 16px'
                            }}
                        >
                            🚀 SYNC NOW ({pendingCount})
                        </button>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="mt-8">
                    <div className="text-sm font-bold mb-2" style={{ color: '#666' }}>
                        Progress to Next Level: {Math.abs(counter) % 100}/100
                    </div>
                    <div
                        className="w-full h-4 rounded-full overflow-hidden"
                        style={{
                            backgroundColor: '#e0e0e0',
                            border: '2px solid black'
                        }}
                    >
                        <div
                            className="h-full transition-all duration-500 rounded-full"
                            style={{
                                width: `${(Math.abs(counter) % 100) / 100 * 100}%`,
                                backgroundColor: getCounterColor(),
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                            }}
                        />
                    </div>
                </div>

                {/* threshold */}
                <div className="mt-8">
                    <div className="text-sm font-bold mb-2" style={{ color: '#666' }}>
                        Progress to Threshold: {Math.abs(counter) % 1000}/1000
                    </div>
                    <div
                        className="w-full h-4 rounded-full overflow-hidden"
                        style={{
                            backgroundColor: '#e0e0e0',
                            border: '2px solid black'
                        }}
                    >
                        <div
                            className="h-full transition-all duration-500 rounded-full"
                            style={{
                                width: `${(Math.abs(counter) % 1000) / 1000 * 100}%`,
                                backgroundColor: getCounterColor(),
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                            }}
                        />
                    </div>
                </div>

                {/* User Info */}
                <div className="mt-6 text-sm" style={{ color: '#666' }}>
                    Player: {username.slice(0, 6)}...{username.slice(-4)}
                </div>
            </div>
        </div>
    );
}