import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = process.env.HEDERA_PRIVATE_KEY || "";
const RPC_URL = process.env.HEDERA_TESTNET_RPC_URL || "https://testnet.hashio.io/api";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hederaTestnet: {
      url: RPC_URL,
      chainId: 296,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  }
};

export default config;


