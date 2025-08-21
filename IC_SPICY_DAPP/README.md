# IC SPICY RWA Co-op 🌶️

**The Premier Real World Asset Cooperative on the Internet Computer**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Available-brightgreen)](https://oo7fg-waaaa-aaaap-qp5sq-cai.icp0.io/)
[![Internet Computer](https://img.shields.io/badge/Internet%20Computer-Deployed-blue)](https://internetcomputer.org/)
[![Motoko](https://img.shields.io/badge/Motoko-Backend-orange)](https://internetcomputer.org/docs/current/developer-docs/build/languages/motoko/)
[![React](https://img.shields.io/badge/React-Frontend-61dafb)](https://reactjs.org/)

## 📖 Overview

IC SPICY RWA Co-op is a comprehensive decentralized application (dApp) built on the Internet Computer blockchain, focusing on Real World Assets (RWA) and interactive gaming experiences. The platform combines DeFi mechanics with engaging gameplay centered around chili farming and NFT collection.

### 🌟 Key Features

- **🎮 Interactive Gaming**: Spicy Grotto game with play-to-earn mechanics
- **🌶️ NFT Collection**: Unique chili pepper NFTs with varying rarities
- **💰 DeFi Integration**: $SPICY and $HEAT token economics
- **🏛️ Governance Portal**: Community-driven decision making
- **🤖 AI Assistant**: Weather and farming guidance
- **📱 Modern UI**: Glassmorphism design with responsive layout
- **🔐 Secure Wallet**: Plug wallet integration for seamless transactions

## 🏗️ Architecture

### Backend Canisters (Motoko)
- **`ai`**: AI assistant with weather and farming guidance
- **`blog`**: Content management and blog system
- **`chili`**: NFT chili pepper management
- **`game`**: Spicy Grotto gaming mechanics
- **`membership`**: Cooperative membership management
- **`portal`**: Governance and staking portal
- **`profile`**: User profile management
- **`shop`**: NFT marketplace and shop
- **`user`**: User authentication and management
- **`wallet2`**: Token wallet functionality
- **`whitepaper`**: Documentation and whitepaper hosting

### Frontend (React)
- **Modern React 18** with functional components
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Plug Wallet** integration
- **Responsive design** for all devices

## 🚀 Live Deployment

- **Frontend**: https://oo7fg-waaaa-aaaap-qp5sq-cai.icp0.io/
- **Network**: Internet Computer Mainnet
- **Status**: ✅ Production Ready

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **DFX** (Internet Computer SDK)
- **Git**
- **Plug Wallet** browser extension

### Installing DFX

```bash
# Install DFX
sh -ci "$(curl -fsSL https://internetcomputer.org/install.sh)"

# Verify installation
dfx --version
```

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd IC_SPICY_DAPP
```

### 2. Install Dependencies

```bash
# Install frontend dependencies
cd src/ic_spicy_modular/frontend
npm install

# Return to root
cd ../../..
```

### 3. Configure Environment

The project uses mainnet canister IDs by default. For local development:

```bash
# Start local replica
dfx start --background

# Deploy to local network
dfx deploy --network local
```

### 4. Build and Deploy

```bash
# Build frontend
cd src/ic_spicy_modular/frontend
npm run build

# Deploy to mainnet
cd ../../..
dfx deploy --network ic
```

## 🎮 Game Mechanics

### Spicy Grotto
- **Plant Seeds**: Purchase and plant different chili varieties
- **Water Plants**: Maintain plant growth with regular watering
- **Harvest Rewards**: Earn coins and tokens upon harvest
- **Level Progression**: Advance through levels for multipliers
- **Leaderboards**: Compete with other players

### Token Economics
- **$SPICY**: Primary utility token for game actions
- **$HEAT**: Reward token earned through gameplay
- **Multipliers**: Level-based token earning multipliers
- **Staking**: Stake tokens for governance participation

## 🔧 Development

### Project Structure

```
IC_SPICY_DAPP/
├── dfx.json                 # DFX configuration
├── canister_ids.json        # Deployed canister IDs
├── src/
│   └── ic_spicy_modular/
│       ├── Constants.mo     # Shared constants
│       ├── frontend/        # React frontend
│       ├── ai/             # AI assistant canister
│       ├── game/           # Gaming mechanics
│       ├── portal/         # Governance portal
│       ├── shop/           # NFT marketplace
│       └── ...             # Other canisters
└── README.md
```

### Available Scripts

```bash
# Frontend development
cd src/ic_spicy_modular/frontend
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests

# Backend deployment
dfx deploy         # Deploy all canisters
dfx deploy frontend --network ic  # Deploy frontend only
```

### Local Development

```bash
# Start local replica
dfx start --background

# Deploy to local network
dfx deploy --network local

# Access local frontend
open http://localhost:4943
```

## 🔐 Security Features

- **Rate Limiting**: Prevents spam and abuse
- **Input Validation**: Secure data handling
- **Audit Logging**: Comprehensive activity tracking
- **Principal Verification**: Secure user authentication
- **Error Handling**: Graceful error management

## 🌐 API Endpoints

### Game Canister
- `getPlayerData(principal)`: Retrieve player information
- `plantSeed(principal, plantType, cost)`: Plant new seeds
- `waterPlant(principal, plantId)`: Water existing plants
- `harvestPlant(principal, plantId)`: Harvest mature plants
- `getLeaderboard()`: Get player rankings

### Portal Canister
- `createProposal(proposal)`: Submit governance proposals
- `vote(proposalId, vote)`: Vote on proposals
- `getProposals()`: List all proposals
- `stakeTokens(amount)`: Stake tokens for governance

### Shop Canister
- `getProducts()`: List available products
- `purchaseProduct(productId)`: Buy products
- `getUserInventory(principal)`: Get user's inventory

## 🎨 UI Components

### Design System
- **Glassmorphism**: Modern glass-like UI elements
- **Responsive**: Mobile-first design approach
- **Dark Theme**: Eye-friendly dark color scheme
- **Animations**: Smooth transitions and hover effects

### Key Pages
- **Dashboard**: Overview of user's assets and activities
- **Game**: Interactive Spicy Grotto gameplay
- **Shop**: NFT marketplace and product browsing
- **Portal**: Governance and staking interface
- **AI**: Weather and farming guidance
- **Profile**: User profile management

## 🔗 Integration

### Wallet Integration
- **Plug Wallet**: Primary wallet for Internet Computer
- **Principal Management**: Secure user identification
- **Transaction Signing**: Secure transaction approval

### External APIs
- **Weather API**: Real-time weather data for farming
- **Geolocation**: Location-based services
- **Reverse Geocoding**: Address lookup services

## 📊 Performance

- **Fast Loading**: Optimized bundle sizes
- **Caching**: Efficient data caching strategies
- **Lazy Loading**: On-demand component loading
- **CDN**: Global content delivery

## 🧪 Testing

```bash
# Run frontend tests
cd src/ic_spicy_modular/frontend
npm test

# Run with coverage
npm test -- --coverage
```

## 🚀 Deployment

### Mainnet Deployment

```bash
# Deploy all canisters to mainnet
dfx deploy --network ic

# Deploy frontend only
dfx deploy frontend --network ic
```

### Environment Variables

The project uses the following environment variables:
- `REACT_APP_CANISTER_IDS`: Canister ID mappings
- `REACT_APP_NETWORK`: Network configuration (ic/local)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Motoko best practices for backend development
- Use TypeScript for frontend development
- Maintain consistent code formatting
- Write comprehensive tests
- Update documentation for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the whitepaper canister for detailed documentation
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Community**: Join our community discussions
- **Email**: Contact the development team

## 🙏 Acknowledgments

- **Internet Computer Foundation** for the blockchain infrastructure
- **DFINITY** for the Motoko programming language
- **Plug Wallet** team for wallet integration
- **React Team** for the frontend framework
- **Tailwind CSS** for the styling framework

## 📈 Roadmap

- [ ] **SNS Launch**: Decentralized governance token launch
- [ ] **Mobile App**: Native mobile application
- [ ] **Advanced AI**: Enhanced farming recommendations
- [ ] **Cross-chain Integration**: Multi-chain support
- [ ] **DAO Governance**: Full decentralized governance
- [ ] **Real-world Partnerships**: Physical chili partnerships

---

**🌶️ Built with ❤️ on the Internet Computer**

*IC SPICY RWA Co-op - Growing the future of decentralized assets* 