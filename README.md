# 🎮 Movement Counter Game

A decentralized counter game built on the Movement blockchain, featuring dual wallet support with Privy social login and native Aptos wallets.

## ✨ Features

- **Dual Wallet Support**
  - 🔐 Privy social login (Email, Twitter, Google, GitHub, Discord)
  - 💼 Native Aptos wallets (Nightly, etc.)
  - 🔄 Seamless switching between wallet types

- **Game Mechanics**
  - ➕ Increment/Decrement counter
  - 📊 Level up system (every 100 points = 1 level)
  - 🔥 Streak tracking
  - ⏱️ Debounced transaction batching
  - 🎯 Real-time blockchain sync

- **User Experience**
  - 🎨 Modern, responsive UI with Tailwind CSS
  - 🌈 Dynamic level emojis and colors
  - 📱 Mobile-friendly design
  - 🔔 Toast notifications for all actions
  - ⚡ Optimistic UI updates

## 🏗️ Tech Stack

- **Frontend**: Next.js 16, React 18, TypeScript
- **Blockchain**: Movement Network (Aptos-based)
- **Wallet Integration**:
  - Privy SDK for social login
  - Aptos Wallet Adapter for native wallets
- **Smart Contract**: Move language
- **Styling**: Tailwind CSS, Radix UI components
- **State Management**: React hooks

## 📋 Prerequisites

- Node.js 18+ and Yarn
- Movement CLI (for smart contract deployment)
- A wallet (Nightly recommended for native wallet support)

## 🚀 Getting Started

### 1. Clone and Install

```bash
git clone <repository-url>
cd Movement-Counter-template
yarn install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
```

Get your Privy App ID from [Privy Dashboard](https://dashboard.privy.io/)

### 3. Smart Contract Deployment

Navigate to the modules directory and deploy the counter contract:

```bash
cd modules

# Initialize Movement CLI for testnet
movement init --network custom \
  --rest-url https://testnet.movementnetwork.xyz/v1 \
  --faucet-url https://faucet.testnet.movementnetwork.xyz/

# Update Move.toml with your address
# Edit Move.toml and set counter="<your-address>"

# Deploy the contract
movement move deploy
```

### 4. Update Contract Address

Update the contract address in `app/lib/aptos.ts`:

```typescript
export const CONTRACT_ADDRESS = 'your_deployed_contract_address';
```

### 5. Run Development Server

```bash
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## 🌐 Network Configuration

The app uses a centralized network configuration system. To switch between mainnet and testnet, edit `app/lib/aptos.ts`:

```typescript
// Change this to switch networks
export const CURRENT_NETWORK = 'testnet'; // or 'mainnet'

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
```

## 🎯 How It Works

### Wallet Connection Flow

1. **Privy Wallet**:
   - User logs in with social account
   - Privy creates an embedded Aptos wallet
   - Transactions signed with Privy's `signRawHash`
   - User pays gas fees

2. **Native Wallet**:
   - User connects wallet (e.g., Nightly)
   - Wallet adapter handles connection
   - Transactions signed via wallet popup
   - User pays gas fees

### Transaction Flow

1. User clicks increment/decrement buttons
2. Actions are debounced (2-second delay)
3. Multiple actions batched into single transaction
4. Transaction submitted to Movement blockchain
5. UI updates optimistically
6. Blockchain state refreshed on confirmation

### Smart Contract Functions

```move
// Increment counter
public entry fun add_counter(account: &signer, amount: u64)

// Decrement counter
public entry fun subtract_counter(account: &signer, amount: u64)

// Get counter value
#[view]
public fun get_counter(addr: address): u64
```

## 📁 Project Structure

```
Movement-Counter-template/
├── app/
│   ├── components/
│   │   ├── CounterArena.tsx      # Main game arena
│   │   ├── counterItem.tsx       # Counter logic & UI
│   │   ├── LoginPage.tsx         # Landing page
│   │   ├── wallet-selection-modal.tsx  # Wallet connection modal
│   │   ├── wallet-provider.tsx   # Wallet adapter provider
│   │   └── ui/                   # Reusable UI components
│   ├── lib/
│   │   ├── aptos.ts              # Aptos SDK & network config
│   │   ├── transactions.ts       # Transaction submission logic
│   │   └── privy-movement.ts     # Privy wallet utilities
│   ├── providers.tsx             # App-level providers
│   └── page.tsx                  # Main page component
├── modules/
│   ├── sources/
│   │   └── counter.move          # Smart contract
│   └── Move.toml                 # Move package config
└── package.json
```

## 🔧 Key Components

### CounterItem
- Handles counter state and UI
- Manages transaction debouncing
- Supports both wallet types
- Real-time blockchain sync

### WalletSelectionModal
- Unified wallet connection interface
- Privy social login
- Native wallet detection
- Network configuration

### Transaction System
- `submitCounterTransaction()` - Privy wallet transactions
- `submitCounterTransactionNative()` - Native wallet transactions
- `fetchCounterValue()` - Read blockchain state

## 🎨 UI Features

- **Level System**: Emojis change based on level (🌱 → 🌳 → 🏆)
- **Color Coding**: Counter color reflects value (green = high, red = negative)
- **Progress Bar**: Visual level progress indicator
- **Pending Actions**: Shows queued transactions
- **Toast Notifications**: Success/error feedback

## 🔐 Security

- No private keys stored in frontend
- Privy handles wallet security
- Users control their own gas fees
- All transactions require user approval (native wallets)

## 🐛 Troubleshooting

### Wrong Network Error
Ensure your wallet is connected to Movement Testnet (Chain ID: 250)

### Transaction Fails
- Check wallet has sufficient MOVE tokens for gas
- Verify contract address is correct
- Check network configuration

### Privy Login Issues
- Verify `NEXT_PUBLIC_PRIVY_APP_ID` is set correctly
- Check Privy dashboard for app configuration

## 📚 Resources

- [Movement Network Docs](https://docs.movementnetwork.xyz/)
- [Aptos SDK Documentation](https://aptos.dev/sdks/ts-sdk/)
- [Privy Documentation](https://docs.privy.io/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

Built with ❤️ on Movement Network
