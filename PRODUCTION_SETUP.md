# 🚀 KW Vault Production Setup Guide

## 📋 **Step-by-Step Setup for Real Working Project**

### 1. 🔐 **Get WalletConnect Project ID** (CRITICAL)
```bash
# Visit: https://cloud.walletconnect.com/
# 1. Create account/login
# 2. Create new project
# 3. Copy your Project ID (32 characters)
# 4. Add to .env.local:
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_real_project_id_here
```

### 2. 📄 **Deploy Smart Contracts**
```bash
# Navigate to contracts directory
cd contracts

# Install Hardhat dependencies
npm install

# Deploy to Kaia Testnet first
npx hardhat run scripts/deploy.js --network kaia-testnet

# Deploy to Kaia Mainnet (for production)
npx hardhat run scripts/deploy.js --network kaia-mainnet

# Copy contract addresses to .env.local:
VAULT_CONTRACT_ADDRESS=0xYourVaultContractAddress
KW_TOKEN_ADDRESS=0xYourTokenContractAddress
```

### 3. 🤖 **Set Up AI Backend**
```bash
# Option A: Deploy your own AI service
# Use scripts/ai_api_server.py as starting point
# Deploy to Heroku/Railway/Vercel

# Option B: Use existing AI API
# Get API key from your AI service provider

# Add to .env.local:
AI_API_URL=https://your-ai-service.com/api/v1
AI_API_KEY=your_real_ai_api_key
```

### 4. 🔑 **Create Environment File**
```bash
# Copy example to real env file
cp .env.example .env.local

# Edit .env.local with your real values:
# - WalletConnect Project ID
# - Contract addresses (after deployment)
# - AI API endpoint and key
# - Your private key (for contract interactions)
# - Production domain URL
```

### 5. 🌐 **Production Deployment**
```bash
# Build the project
npm run build

# Deploy to Vercel (recommended)
npx vercel --prod

# Or deploy to Netlify
npm run build && netlify deploy --prod --dir=out

# Update .env.local with your deployed URL:
NEXT_PUBLIC_APP_URL=https://your-deployed-app.com
```

## ⚠️ **CRITICAL REQUIREMENTS**

### **Must Have for Real Functionality:**
1. ✅ **WalletConnect Project ID** - Get from cloud.walletconnect.com
2. ✅ **Deployed Smart Contracts** - Deploy KWVault.sol and KWToken.sol
3. ✅ **AI Backend Service** - Real AI API for yield predictions
4. ✅ **Private Key** - For contract interactions (keep secure!)
5. ✅ **Production Domain** - For CORS and wallet connections

### **Currently Working (No Setup Needed):**
- ✅ SQLite Database (auto-created)
- ✅ RainbowKit Wallet Connection
- ✅ Kaia Network Integration
- ✅ Mock Data Fallbacks

## 🔧 **Quick Start Commands**

```bash
# 1. Install dependencies
npm install

# 2. Copy and edit environment
cp .env.example .env.local
# Edit .env.local with your real values

# 3. Start development server
npm run dev

# 4. Deploy contracts (when ready)
cd contracts && npx hardhat run scripts/deploy.js --network kaia-mainnet

# 5. Build and deploy
npm run build
npx vercel --prod
```

## 🎯 **Hackathon Ready Checklist**

- [ ] WalletConnect Project ID configured
- [ ] Smart contracts deployed to Kaia
- [ ] AI backend service running
- [ ] Environment variables set
- [ ] App deployed to production
- [ ] Wallet connection tested
- [ ] Contract interactions working
- [ ] AI predictions loading

## 🆘 **Need Help?**

1. **WalletConnect Issues**: Check project ID is 32 characters
2. **Contract Deployment**: Ensure you have KAIA tokens for gas
3. **AI Backend**: Start with mock data, add real AI later
4. **Deployment**: Use Vercel for easiest deployment

Your app will work with mock data until you set up the real services!
