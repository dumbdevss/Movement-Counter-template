'use client';

import { WalletSelectionModal } from './wallet-selection-modal';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8" style={{ backgroundColor: '#e8f4f8' }}>
      <div className="bg-white rounded-xl md:rounded-2xl text-center my-4" style={{
        border: '4px solid black',
        boxShadow: '4px 4px 0px black',
        padding: '2rem 2rem',
        maxWidth: '900px',
        width: '95%'
      }}>
        <style jsx>{`
          @media (min-width: 640px) {
            div > div {
              padding: 3rem 4rem !important;
              border-width: 5px !important;
              box-shadow: 6px 6px 0px black !important;
            }
          }
          @media (min-width: 1024px) {
            div > div {
              padding: 4rem 6rem !important;
            }
          }
        `}</style>

        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 md:mb-8 flex items-center justify-center flex-wrap gap-2" style={{ letterSpacing: '0.05em' }}>
          <span>🎮</span>
          <span className="whitespace-nowrap">COUNTER GAME</span>
          <span>🎮</span>
        </h1>
        <p className="text-gray-600 text-sm sm:text-base md:text-lg lg:text-xl pt-2 md:pt-4 mb-8 md:mb-16">
          Increment, decrement, and level up your counter!
        </p>

        <WalletSelectionModal>
          <button
            className="font-bold text-white text-lg sm:text-xl transition-opacity hover:opacity-90 disabled:opacity-50 rounded-lg"
            style={{
              backgroundColor: '#0099ff',
              border: '3px solid black',
              boxShadow: '3px 3px 0px black',
              padding: '8px 20px',
              margin: '15px'
            }}
          >
            CONNECT WALLET →
          </button>
        </WalletSelectionModal>

        <style jsx>{`
          @media (min-width: 640px) {
            button {
              border-width: 4px !important;
              box-shadow: 4px 4px 0px black !important;
              padding: 10px 25px !important;
              margin: 25px !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
