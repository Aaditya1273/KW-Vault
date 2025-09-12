require("@nomicfoundation/hardhat-toolbox")
require("dotenv").config()

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    "kaia-testnet": {
      url: "https://public-en-kairos.node.kaia.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 1001,
    },
    "kaia-mainnet": {
      url: "https://public-en-cypress.klaytn.net",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 8217,
    },
  },
  etherscan: {
    apiKey: {
      "kaia-testnet": "unnecessary",
      "kaia-mainnet": "unnecessary",
    },
    customChains: [
      {
        network: "kaia-testnet",
        chainId: 1001,
        urls: {
          apiURL: "https://api-baobab.klaytnscope.com/api",
          browserURL: "https://baobab.klaytnscope.com",
        },
      },
      {
        network: "kaia-mainnet",
        chainId: 8217,
        urls: {
          apiURL: "https://api.klaytnscope.com/api",
          browserURL: "https://klaytnscope.com",
        },
      },
    ],
  },
}
