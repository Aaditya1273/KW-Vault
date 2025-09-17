@echo off
echo Fixing RainbowKit dependencies...

echo Step 1: Removing node_modules and package-lock.json
rmdir /s /q node_modules 2>nul
del package-lock.json 2>nul

echo Step 2: Installing stable versions
npm install @rainbow-me/rainbowkit@1.3.0 wagmi@1.4.0 viem@1.21.0 @tanstack/react-query@4.36.0 

echo Step 3: Installing missing dependencies
npm install @walletconnect/keyvaluestorage@1.1.1 rxjs@7.8.2 cross-fetch@4.1.0

echo Step 4: Final install
npm install

echo Dependencies fixed! Try running: npm run dev
pause
