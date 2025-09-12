# KW Vault - AI-Driven Cross-Chain Yield Vault:

![KW Vault Banner](./public/kw-vault-banner.jpg)

## 🚀 Overview

KW Vault is a revolutionary DeFi yield vault built on the Kaia ecosystem, featuring AI-powered yield predictions, cross-chain bridge integration, zero-knowledge privacy, and gamified SocialFi features. Designed for the Kaia Wave Stablecoin Summer Hackathon.

### 🌟 Key Features

- **ERC-4626 Compliant Vault**: Secure USDT deposits with automated yield optimization
- **AI Yield Predictions**: TensorFlow-powered yield forecasting and rebalancing recommendations
- **Cross-Chain Bridge**: Seamless asset transfers via Allbridge Core SDK
- **Zero-Knowledge Privacy**: zkMe integration for KYC-free identity verification
- **SocialFi Gamification**: KW token rewards, missions, leaderboards, and community vaults
- **LINE Mini-DApp**: Optimized for LINE ecosystem with push notifications
- **Real-time Analytics**: Live TVL, APY tracking, and strategy monitoring

## 🏗️ Architecture

\`\`\`
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend APIs  │    │  Smart Contracts│
│   (Next.js)     │◄──►│   (Next.js API) │◄──►│   (Solidity)    │
│                 │    │                 │    │                 │
│ • Wagmi/Viem    │    │ • MongoDB Cache │    │ • ERC-4626 Vault│
│ • SocialFi UI   │    │ • AI Integration│    │ • KW Token      │
│ • Cross-chain   │    │ • Bridge APIs   │    │ • Cross-chain   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   AI Backend    │
                    │   (Python/TF)   │
                    │                 │
                    │ • Yield Predict │
                    │ • Market Analysis│
                    │ • Rebalancing   │
                    └─────────────────┘
\`\`\`

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **Wagmi & Viem** - Ethereum interactions
- **Tailwind CSS** - Styling and responsive design
- **shadcn/ui** - Component library
- **Recharts** - Data visualization

### Backend
- **Next.js API Routes** - Server-side APIs
- **MongoDB** - Database with caching (TTL: 10s)
- **Python/TensorFlow** - AI yield prediction
- **Flask** - AI API server

### Blockchain
- **Solidity** - Smart contracts
- **Hardhat** - Development framework
- **Kaia Network** - Primary blockchain
- **Allbridge Core SDK** - Cross-chain bridges
- **zkMe SDK** - Privacy integration

## 📦 Installation & Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+ and pip
- MongoDB (local or cloud)
- Git

### 1. Clone Repository

\`\`\`bash
git clone https://github.com/your-username/kw-vault.git
cd kw-vault
\`\`\`

### 2. Install Dependencies

\`\`\`bash
# Frontend dependencies
npm install

# Smart contract dependencies
cd contracts
npm install
cd ..

# AI backend dependencies
cd scripts
pip install -r requirements.txt
cd ..
\`\`\`

### 3. Environment Setup

\`\`\`bash
# Copy environment template
cp .env.example .env

# Edit .env with your configuration
nano .env
\`\`\`

Required environment variables:
- `KAIA_RPC_URL`: Kaia network RPC endpoint
- `PRIVATE_KEY`: Deployment wallet private key
- `MONGODB_URI`: MongoDB connection string
- `ZKME_APP_ID`: zkMe application ID
- `ALLBRIDGE_API_KEY`: Allbridge API key

### 4. Deploy Smart Contracts

\`\`\`bash
cd contracts
npx hardhat compile
npx hardhat run scripts/deploy.js --network kaia-testnet
\`\`\`

### 5. Start AI Backend

\`\`\`bash
cd scripts
python ai_api_server.py
\`\`\`

### 6. Start Frontend

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000` to access KW Vault!

## 🚀 Deployment

### Production Deployment

1. **Deploy to Vercel**
\`\`\`bash
npm run build
vercel --prod
\`\`\`

2. **Deploy AI Backend**
\`\`\`bash
cd scripts
docker build -t kw-vault-ai .
docker run -p 5000:5000 kw-vault-ai
\`\`\`

3. **Setup MongoDB Atlas**
- Create MongoDB Atlas cluster
- Update `MONGODB_URI` in production environment

### Kaia Mainnet Deployment

\`\`\`bash
cd contracts
npx hardhat run scripts/deploy.js --network kaia-mainnet
\`\`\`

## 🧪 Testing

### Smart Contract Tests
\`\`\`bash
cd contracts
npx hardhat test
\`\`\`

### Frontend Tests
\`\`\`bash
npm run test
\`\`\`

### AI Model Tests
\`\`\`bash
cd scripts
python -m pytest test_ai_predictor.py
\`\`\`

## 📊 API Documentation

### Vault Stats API
\`\`\`
GET /api/vault/stats
Response: {
  "tvl": "1250000.50",
  "totalShares": "1180000.25",
  "currentAPY": 12.5,
  "hedgeRatio": 75.0,
  "strategyInvestment": "937500.38"
}
\`\`\`

### AI Predictions API
\`\`\`
GET /api/ai/predictions
Response: {
  "predicted_apy": 13.2,
  "confidence": 0.87,
  "rebalance_recommendation": "increase_hedge_ratio",
  "market_sentiment": "bullish"
}
\`\`\`

### SocialFi APIs
- `GET /api/socialfi/leaderboard` - User rankings
- `POST /api/socialfi/missions` - Complete missions
- `GET /api/bridge/status` - Bridge transaction status

## 🎮 SocialFi Features

### Mission System
- **First Deposit**: 100 KW tokens
- **Big Depositor**: 500 KW tokens (1000+ USDT)
- **Diamond Hands**: 1000 KW tokens (30-day hold)
- **Cross-Chain Explorer**: 300 KW tokens
- **Refer a Friend**: 250 KW tokens

### Gamification
- **Leaderboards**: Top depositors and KW token holders
- **Community Vaults**: Collaborative yield farming
- **Spin the Wheel**: Bonus rewards on withdrawal
- **Achievement Badges**: Visual progress tracking

## 🔒 Security Features

### Smart Contract Security
- **Reentrancy Protection**: OpenZeppelin ReentrancyGuard
- **Access Control**: Role-based permissions
- **Emergency Pause**: Circuit breaker mechanism
- **Audit Trail**: Comprehensive event logging

### Privacy Features
- **zkMe Integration**: Zero-knowledge identity verification
- **Private Transactions**: Optional privacy mode
- **Data Encryption**: Sensitive data protection

## 🌐 Cross-Chain Integration

### Supported Networks
- **Kaia Mainnet** (Primary)
- **Ethereum Mainnet**
- **BNB Smart Chain**

### Bridge Features
- **Allbridge Core SDK** integration
- **Real-time status tracking**
- **Automatic retry mechanisms**
- **Fee optimization**

## 📈 Monitoring & Analytics

### Real-time Metrics
- Total Value Locked (TVL)
- Annual Percentage Yield (APY)
- Strategy allocation ratios
- User activity metrics

### AI Insights
- Yield predictions (7-day forecast)
- Market sentiment analysis
- Rebalancing recommendations
- Risk assessment scores

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file.

## 🏆 Hackathon Submission

**Kaia Wave Stablecoin Summer Hackathon**

### Innovation Highlights
- First AI-powered yield vault on Kaia
- Seamless cross-chain DeFi experience
- Privacy-first architecture with zkMe
- Gamified SocialFi engagement
- LINE ecosystem integration

### Demo Links
- **Live Demo**: [https://kw-vault.vercel.app](https://kw-vault.vercel.app)
- **Video Demo**: [YouTube Link]
- **Pitch Deck**: [Presentation Link]

## 📞 Support

- **Documentation**: [docs.kw-vault.com]
- **Discord**: [Community Server]
- **Email**: support@kw-vault.com
- **Twitter**: [@KWVault]

---

Built with ❤️ for the Kaia ecosystem
