# SkyRun on Hedera

## Prerequisites
- Node 18+
- Hedera testnet account and private key
- Token associations handled by wallets if using HTS

## Install
```
cd hedera
npm i
```

## Configure
Create `.env` in `hedera/`:
```
HEDERA_PRIVATE_KEY=0xYOUR_ECDSA_PRIVATE_KEY
HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api
# Optional HTS wiring
USE_HTS=false
HTS_TOKEN_ADDRESS=0x0000000000000000000000000000000000000000
```

## Compile
```
npm run compile
```

## Deploy (ERC-20 default)
```
npm run deploy:testnet
```
Outputs token and game addresses. The game mints rewards via ERC-20 by default.

## Enable HTS (native Hedera token)
To reward via HTS:
1) Create a Hedera fungible token with:
   - Treasury = the deployed `SkyRunGame` contract address
   - Supply key = Contract Key set to the `SkyRunGame` contract
2) Ensure players have associated to the token (auto-association or manual).
3) Set in `.env` and redeploy (or call from a script):
```
USE_HTS=true
HTS_TOKEN_ADDRESS=0xYourHtsTokenAddress
```
On deploy, the script calls:
```
SkyRunGame.setHTSToken(HTS_TOKEN_ADDRESS, true)
```
Now `submitGameScore` and `claimQuestReward` will mint+transfer via HTS precompile.

## Notes
- Chain ID: 296 (Hedera testnet)
- RPC: https://testnet.hashio.io/api
- Contracts: `SkyRunToken.sol`, `SkyRunGame.sol`


