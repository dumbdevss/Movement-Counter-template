'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({ message, type, isVisible, onClose, duration = 3000 }: ToastProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Wait for animation to complete
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible && !isAnimating) return null;

  const getToastColor = () => {
    switch (type) {
      case 'success':
        return '#00ff88';
      case 'error':
        return '#ff4444';
      case 'info':
        return '#0099ff';
      default:
        return '#0099ff';
    }
  };

  const getToastIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'info':
        return 'ℹ️';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isAnimating ? 'animate-slide-in-right opacity-100' : 'opacity-0 translate-x-full'
      }`}
      style={{
        backgroundColor: 'white',
        border: '3px solid black',
        boxShadow: '4px 4px 0px black',
        borderRadius: '12px',
        padding: '16px 20px',
        maxWidth: '400px',
        minWidth: '300px'
      }}
    >
      <div className="flex items-center gap-3">
        <div className="text-2xl">{getToastIcon()}</div>
        <div className="flex-1">
          <div 
            className="font-bold text-lg"
            style={{ color: getToastColor() }}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
          <div className="text-gray-700 text-sm mt-1">
            {message}
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 font-bold text-xl"
        >
          ×
        </button>
      </div>
    </div>
  );
}
