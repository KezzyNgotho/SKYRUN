import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const name = "CoinQuest Token";
  const symbol = "COINQ";

  const Token = await ethers.getContractFactory("CoinQuestToken");
  const token = await Token.deploy(name, symbol, deployer.address);
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("Token deployed:", tokenAddress);

  const Game = await ethers.getContractFactory("CoinQuestGame");
  const game = await Game.deploy(tokenAddress);
  await game.waitForDeployment();
  const gameAddress = await game.getAddress();
  console.log("Game deployed:", gameAddress);

  const tx = await token.setGameContract(gameAddress);
  await tx.wait();
  console.log("Token minter set to game contract.");

  // Create an initial quest similar to Clarity initialize
  const createQuestTx = await game.createQuest(
    "First Score",
    "Score your first 100 points in the game",
    1,
    50,
    100
  );
  await createQuestTx.wait();
  console.log("Default quest created");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


