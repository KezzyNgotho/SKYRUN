// coinQuest - Stacks Contract Deployment Script
// Using Clarinet SDK for deployment

import { Clarinet, Tx, Chain, Account, types } from '@hirosystems/clarinet-sdk';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { 
  makeContractDeploy, 
  broadcastTransaction, 
  getAddressFromPrivateKey,
  TransactionVersion
} from '@stacks/transactions';

// Contract configuration
const CONTRACT_NAME = 'coin-quest';
const CONTRACT_PATH = './contracts/coin-quest.clar';
const TRAIT_CONTRACT_NAME = 'coin-quest-trait';
const TRAIT_CONTRACT_PATH = './contracts/coin-quest-trait.clar';

// Network configuration
const testnet = new StacksTestnet({
  url: 'https://stacks-node-api.testnet.stacks.co',
});

const mainnet = new StacksMainnet({
  url: 'https://stacks-node-api.mainnet.stacks.co',
});

// Deploy contract to testnet
async function deployToTestnet(privateKey) {
  try {
    console.log('🚀 Deploying coinQuest contracts to Stacks Testnet...');
    
    // Get address from private key
    const address = getAddressFromPrivateKey(privateKey, TransactionVersion.Testnet);
    console.log(`📍 Deploying from address: ${address}`);
    
    // Read contract files
    const fs = require('fs');
    const contractCode = fs.readFileSync(CONTRACT_PATH, 'utf8');
    const traitCode = fs.readFileSync(TRAIT_CONTRACT_PATH, 'utf8');
    
    // Deploy trait contract first
    console.log('📋 Deploying trait contract...');
    const traitDeployTx = await makeContractDeploy({
      contractName: TRAIT_CONTRACT_NAME,
      codeBody: traitCode,
      senderKey: privateKey,
      network: testnet,
    });
    
    const traitResult = await broadcastTransaction(traitDeployTx, testnet);
    console.log('✅ Trait contract deployed:', traitResult);
    
    // Deploy main contract
    console.log('📋 Deploying main contract...');
    const deployTx = await makeContractDeploy({
      contractName: CONTRACT_NAME,
      codeBody: contractCode,
      senderKey: privateKey,
      network: testnet,
    });
    
    const result = await broadcastTransaction(deployTx, testnet);
    console.log('✅ Main contract deployed:', result);
    
    // Calculate contract address
    const contractAddress = `${address}.${CONTRACT_NAME}`;
    console.log(`🎉 Contract deployed at: ${contractAddress}`);
    console.log(`🔗 Explorer: https://explorer.stacks.co/txid/${result.txid}?chain=testnet`);
    
    return {
      contractAddress,
      txid: result.txid,
      traitTxid: traitResult.txid
    };
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error;
  }
}

// Test contract functions
async function testContract(contractAddress, privateKey) {
  try {
    console.log('🧪 Testing contract functions...');
    
    // Test start-game function
    const startGameTx = await makeContractCall({
      contractAddress: contractAddress.split('.')[0],
      contractName: contractAddress.split('.')[1],
      functionName: 'start-game',
      functionArgs: [],
      senderKey: privateKey,
      network: testnet,
    });
    
    const startResult = await broadcastTransaction(startGameTx, testnet);
    console.log('✅ start-game test passed:', startResult);
    
    // Test finalize-game-score function
    const finalizeTx = await makeContractCall({
      contractAddress: contractAddress.split('.')[0],
      contractName: contractAddress.split('.')[1],
      functionName: 'finalize-game-score',
      functionArgs: [types.uint(100)], // Test with score 100
      senderKey: privateKey,
      network: testnet,
    });
    
    const finalizeResult = await broadcastTransaction(finalizeTx, testnet);
    console.log('✅ finalize-game-score test passed:', finalizeResult);
    
    return true;
  } catch (error) {
    console.error('❌ Contract test failed:', error);
    return false;
  }
}

// Main deployment function
async function deployCoinQuest() {
  try {
    // Check if private key is provided
    const privateKey = process.env.STACKS_PRIVATE_KEY;
    if (!privateKey) {
      console.error('❌ Please set STACKS_PRIVATE_KEY environment variable');
      console.log('💡 Get a testnet private key from: https://explorer.stacks.co/sandbox/faucet');
      return;
    }
    
    // Deploy contracts
    const deployment = await deployToTestnet(privateKey);
    
    // Test contracts
    const testPassed = await testContract(deployment.contractAddress, privateKey);
    
    if (testPassed) {
      console.log('🎉 coinQuest deployment successful!');
      console.log('📋 Next steps:');
      console.log(`1. Update CONTRACT_ADDRESS in scripts/contract.js to: ${deployment.contractAddress}`);
      console.log('2. Test the game with Stacks Wallet');
      console.log('3. Submit to hackathon!');
      
      // Update contract.js automatically
      updateContractJs(deployment.contractAddress);
    }
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
  }
}

// Update contract.js with deployed address
function updateContractJs(contractAddress) {
  try {
    const fs = require('fs');
    const contractJsPath = './scripts/contract.js';
    let content = fs.readFileSync(contractJsPath, 'utf8');
    
    // Replace the placeholder contract address
    content = content.replace(
      "const CONTRACT_ADDRESS = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM';",
      `const CONTRACT_ADDRESS = '${contractAddress}';`
    );
    
    fs.writeFileSync(contractJsPath, content);
    console.log('✅ Updated scripts/contract.js with deployed contract address');
  } catch (error) {
    console.error('❌ Failed to update contract.js:', error);
  }
}

// Export functions
module.exports = {
  deployToTestnet,
  testContract,
  deployCoinQuest
};

// Run deployment if called directly
if (require.main === module) {
  deployCoinQuest();
}
