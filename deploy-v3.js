// Deploy V3 contracts to Stacks Testnet
const fs = require('fs');
const path = require('path');

// Contract configuration
const DEPLOYER_ADDRESS = 'ST18YM565C2RG5W8DFDT5W577YMG5QSAKVRG0MGV1';
const DEPLOYER_PRIVATE_KEY = '7a8d04854344e115b4d2e48e8b5ceb5d494e6cea71b325d2e13f186b9e8097a401';

// Contract names and paths
const CONTRACTS = [
  {
    name: 'GameTokenV3',
    path: './contracts/GameToken.clar'
  },
  {
    name: 'QuestRewardsV3', 
    path: './contracts/QuestRewards.clar'
  },
  {
    name: 'PlayerProfileV3',
    path: './contracts/PlayerProfile.clar'
  }
];

// Network configuration
const TESTNET_URL = 'https://stacks-node-api.testnet.stacks.co';

console.log('🚀 Deploying CoinQuest V3 contracts to Stacks Testnet...');
console.log(`📍 Deployer: ${DEPLOYER_ADDRESS}`);

// Generate deployment commands for manual execution
function generateDeploymentCommands() {
  console.log('\n📋 Manual Deployment Commands:');
  console.log('Copy and run these commands in WSL Ubuntu or Linux terminal:');
  console.log('\n# Install Clarinet if not already installed:');
  console.log('curl -L https://clarinet.io/install.sh | bash');
  console.log('source ~/.bashrc');
  console.log('\n# Navigate to project directory:');
  console.log('cd /mnt/c/Users/kezie/Desktop/STACKS/coinQuest-react');
  console.log('\n# Deploy contracts:');
  console.log('clarinet deployments apply -p deployments/Testnet.toml');
  
  console.log('\n📋 Contract Addresses (after deployment):');
  CONTRACTS.forEach(contract => {
    const address = `${DEPLOYER_ADDRESS}.${contract.name}`;
    console.log(`${contract.name}: ${address}`);
  });
}

// Update contract addresses in the codebase
function updateContractAddresses() {
  console.log('\n🔄 Updating contract addresses in codebase...');
  
  const contractAddresses = {
    GameTokenV3: `${DEPLOYER_ADDRESS}.GameTokenV3`,
    QuestRewardsV3: `${DEPLOYER_ADDRESS}.QuestRewardsV3`,
    PlayerProfileV3: `${DEPLOYER_ADDRESS}.PlayerProfileV3`
  };
  
  // Update WalletContext.tsx
  const walletContextPath = './src/contexts/WalletContext.tsx';
  if (fs.existsSync(walletContextPath)) {
    let content = fs.readFileSync(walletContextPath, 'utf8');
    
    // Update contract addresses
    content = content.replace(
      /const STACKS_CONTRACTS = \{[\s\S]*?\};/,
      `const STACKS_CONTRACTS = {
  GameTokenV3: '${contractAddresses.GameTokenV3}',
  QuestRewardsV3: '${contractAddresses.QuestRewardsV3}',
  PlayerProfileV3: '${contractAddresses.PlayerProfileV3}',
};`
    );
    
    fs.writeFileSync(walletContextPath, content);
    console.log('✅ Updated WalletContext.tsx');
  }
  
  // Update README.md
  const readmePath = './README.md';
  if (fs.existsSync(readmePath)) {
    let content = fs.readFileSync(readmePath, 'utf8');
    
    // Update contract table
    const contractTable = `| Contract | Address | Purpose |
|----------|---------|---------|
| **GameTokenV3** | \`${contractAddresses.GameTokenV3}\` | ERC20-like token for in-game rewards |
| **QuestRewardsV3** | \`${contractAddresses.QuestRewardsV3}\` | Quest management and reward distribution |
| **PlayerProfileV3** | \`${contractAddresses.PlayerProfileV3}\` | Player statistics and profile management |`;
    
    content = content.replace(
      /\| Contract \| Address \| Purpose \|[\s\S]*?\| \*\*PlayerProfileV2\*\* \|.*?\|/,
      contractTable
    );
    
    fs.writeFileSync(readmePath, content);
    console.log('✅ Updated README.md');
  }
  
  console.log('\n📋 Contract Addresses Updated:');
  Object.entries(contractAddresses).forEach(([name, address]) => {
    console.log(`${name}: ${address}`);
  });
}

// Main function
function main() {
  console.log('🎯 CoinQuest V3 Contract Deployment Setup');
  console.log('==========================================');
  
  // Check if contract files exist
  console.log('\n📁 Checking contract files...');
  CONTRACTS.forEach(contract => {
    if (fs.existsSync(contract.path)) {
      console.log(`✅ ${contract.name}: ${contract.path}`);
    } else {
      console.log(`❌ ${contract.name}: ${contract.path} - FILE NOT FOUND`);
    }
  });
  
  // Generate deployment commands
  generateDeploymentCommands();
  
  // Update contract addresses
  updateContractAddresses();
  
  console.log('\n🎉 Setup Complete!');
  console.log('\n📋 Next Steps:');
  console.log('1. Run the deployment commands above in WSL Ubuntu');
  console.log('2. Wait for deployment to complete');
  console.log('3. Test the game with wallet connection');
  console.log('4. Push changes to GitHub');
  
  console.log('\n🔗 Useful Links:');
  console.log(`- Stacks Explorer: https://explorer.stacks.co/?chain=testnet`);
  console.log(`- Testnet Faucet: https://explorer.stacks.co/sandbox/faucet`);
  console.log(`- Clarinet Docs: https://docs.hiro.so/clarinet/`);
}

// Run the script
main();
