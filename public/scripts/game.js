// Initialize global variables
var highScore = Number(localStorage.getItem("highScore")) || 0;
var myCoins = Number(localStorage.getItem("myCoins")) || 0;

// Update display on load
highScoreBlock.innerText = highScore;
mainCoinBlock.innerText = myCoins;

window.addEventListener("resize", Resize);
Resize();
updateAchives();
updateUpgrades();

const contractAddress = "0x784675590f1f072520dd0470840fA5CF256200D8";
const contractABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "buyLifeLine",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "initialOwner",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "ECDSAInvalidSignature",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "length",
        type: "uint256",
      },
    ],
    name: "ECDSAInvalidSignatureLength",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "ECDSAInvalidSignatureS",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "allowance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientAllowance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "needed",
        type: "uint256",
      },
    ],
    name: "ERC20InsufficientBalance",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "approver",
        type: "address",
      },
    ],
    name: "ERC20InvalidApprover",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "receiver",
        type: "address",
      },
    ],
    name: "ERC20InvalidReceiver",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "sender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "ERC20InvalidSpender",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
    ],
    name: "ERC2612ExpiredSignature",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "signer",
        type: "address",
      },
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "ERC2612InvalidSigner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_claimAmount",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_score",
        type: "uint256",
      },
    ],
    name: "finalizeGameScore",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "currentNonce",
        type: "uint256",
      },
    ],
    name: "InvalidAccountNonce",
    type: "error",
  },
  {
    inputs: [],
    name: "InvalidShortString",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "string",
        name: "str",
        type: "string",
      },
    ],
    name: "StringTooLong",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [],
    name: "EIP712DomainChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "deadline",
        type: "uint256",
      },
      {
        internalType: "uint8",
        name: "v",
        type: "uint8",
      },
      {
        internalType: "bytes32",
        name: "r",
        type: "bytes32",
      },
      {
        internalType: "bytes32",
        name: "s",
        type: "bytes32",
      },
    ],
    name: "permit",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "DOMAIN_SEPARATOR",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "eip712Domain",
    outputs: [
      {
        internalType: "bytes1",
        name: "fields",
        type: "bytes1",
      },
      {
        internalType: "string",
        name: "name",
        type: "string",
      },
      {
        internalType: "string",
        name: "version",
        type: "string",
      },
      {
        internalType: "uint256",
        name: "chainId",
        type: "uint256",
      },
      {
        internalType: "address",
        name: "verifyingContract",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "salt",
        type: "bytes32",
      },
      {
        internalType: "uint256[]",
        name: "extensions",
        type: "uint256[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "nonces",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "users",
    outputs: [
      {
        internalType: "uint256",
        name: "_corgiBalance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_level",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_lifeBalance",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_totalScore",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "_highestScore",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

console.log("Stacks mode active; EVM features disabled.");

// Debug: Check if particle systems are loaded
console.log('🔍 Particle Manager:', typeof window.particleManager);
console.log('🔍 Screen Shake:', typeof window.screenShake);
console.log('🔍 Power-Up Manager:', typeof window.powerUpManager);

// Debug: Check if power-up sprites are loaded
console.log('🔍 CollectSprites array length:', CollectSprites.length);
console.log('🔍 Power-up sprites:', {
  magnet: CollectSprites[4] ? '✅ Loaded' : '❌ Missing',
  doubleScore: CollectSprites[5] ? '✅ Loaded' : '❌ Missing', 
  invincibility: CollectSprites[6] ? '✅ Loaded' : '❌ Missing',
  slowMotion: CollectSprites[7] ? '✅ Loaded' : '❌ Missing',
  coinRain: CollectSprites[8] ? '✅ Loaded' : '❌ Missing'
});

// Debug: Check if dynamic background manager is loaded
console.log('🔍 Dynamic Background Manager:', typeof window.dynamicBackgroundManager);
if (window.dynamicBackgroundManager) {
  window.dynamicBackgroundManager.init();
}

// Test function to manually trigger effects
window.testEffects = function() {
  console.log('🧪 Testing effects...');
  if (window.particleManager) {
    window.particleManager.addDamageParticles(player.x, player.y, 10);
    console.log('💥 Test damage particles added');
  }
  if (window.screenShake) {
    window.screenShake.start(25, 0.8);
    console.log('📳 Test screen shake started');
  }
};

// Test function to manually trigger power-ups
window.testPowerUps = function(powerUpType = 'magnet') {
  console.log('🧪 Testing power-up:', powerUpType);
  if (window.powerUpManager) {
    window.powerUpManager.activate(powerUpType);
    console.log('🎁 Power-up activated:', powerUpType);
  } else {
    console.log('❌ Power-up manager not available');
  }
};

// Test all power-ups
window.testAllPowerUps = function() {
  const powerUps = ['magnet', 'doubleScore', 'invincibility', 'slowMotion', 'coinRain'];
  powerUps.forEach((powerUp, index) => {
    setTimeout(() => {
      window.testPowerUps(powerUp);
    }, index * 2000); // Activate each power-up 2 seconds apart
  });
};

// Test dynamic backgrounds
window.testBackgrounds = function(themeName = 'sunset') {
  console.log('🧪 Testing background theme:', themeName);
  if (window.dynamicBackgroundManager) {
    window.dynamicBackgroundManager.forceTheme(themeName);
    console.log('🌅 Background theme changed to:', themeName);
  } else {
    console.log('❌ Dynamic background manager not available');
  }
};

// Test all background themes
window.testAllBackgrounds = function() {
  const themes = ['day', 'sunset', 'night', 'storm', 'space'];
  themes.forEach((theme, index) => {
    setTimeout(() => {
      window.testBackgrounds(theme);
    }, index * 3000); // Change theme every 3 seconds
  });
};

// Function to finalize game score
async function finalizeGameScore() {
  console.log('🎮 === FINALIZE GAME SCORE CALLED ===');
  console.log('🎮 Current score:', score);
  console.log('🎮 Available functions:', {
    callStacksFinalize: typeof window.callStacksFinalize,
    callStacksClaim: typeof window.callStacksClaim,
    callStacksBuyLife: typeof window.callStacksBuyLife
  });
  
  // Disable the button and change text to "Loading..."
  document.getElementById("endGameButton").disabled = true;
  document.getElementById("endGamebuttonText").innerText = "Loading...";

	try {
			// Ensure we only pass the most basic, serializable values
			const scoreValue = parseInt(score.toFixed(0), 10); // Convert to integer
			console.log('🎮 Submitting score to Stacks:', scoreValue, typeof scoreValue);
			
			// Try to avoid serialization issues by using a different approach
		if (typeof window.callStacksFinalize === 'function') {
				console.log('🎮 callStacksFinalize function found, calling...');
				// Store the score in a global variable to avoid passing it directly
				window.currentGameScore = scoreValue;
				
				// Call the function without parameters to avoid serialization
				await window.callStacksFinalize();
				console.log('🎮 Submitted score to Stacks successfully.');
				
				// Show success message
				alert(`🎉 SUCCESS! Score submitted to blockchain!\n\n📊 Your score: ${scoreValue} points\n💰 Tokens earned for your achievement!\n\n🎮 Your progress has been saved on the Stacks blockchain!`);
			} else {
				console.warn('🎮 callStacksFinalize function not available');
				alert('❌ Blockchain function not available. Please refresh the page.');
			}
		} catch (e) { 
			console.log('🎮 Stacks finalize error', e); 
			alert(`❌ Failed to submit score: ${e.message}`);
		} finally {
    document.getElementById("endGameButton").disabled = false;
    document.getElementById("endGamebuttonText").innerText = "END GAME";
		}
  // EVM path removed; using Stacks only
}
// Claim last run rewards via MetaMask contract
async function claimLastRun() {
  try {
    const lCoins = localStorage.getItem("lastRunCoins") || "0";
    const lScore = localStorage.getItem("lastRunScore") || "0";
    
		try {
			// Ensure we only pass the most basic, serializable values
			const questId = 1; // default quest - simple integer
			console.log('Claiming quest reward:', questId, typeof questId);
			
			// Try to avoid serialization issues by using a different approach
			if (typeof window.callStacksClaim === 'function') {
				console.log('🎮 callStacksClaim function found, calling...');
				// Store the quest ID in a global variable to avoid passing it directly
				window.currentQuestId = questId;
				
				// Call the function without parameters to avoid serialization
				await window.callStacksClaim();
				console.log('🎮 Claimed via Stacks successfully.');
				
				// Show success message
				alert(`🎉 SUCCESS! Quest reward claimed!\n\n🏆 Quest ID: ${questId}\n💰 Reward tokens added to your balance!\n\n🎮 Your achievement has been recorded on the blockchain!`);
			} else {
				console.warn('🎮 callStacksClaim function not available');
				alert('❌ Blockchain function not available. Please refresh the page.');
			}
		} catch(e) { 
			console.log('Stacks claim error', e); 
			throw e; // Re-throw to handle in outer catch
		}
		return;
    
    const scoreValue = Number(lScore);
    const btn = document.getElementById('claimLastRunBtn');
    if (btn) { 
      btn.disabled = true; 
      btn.innerHTML = '<span class="claimIcon">⏳</span><span class="claimText">Claiming...</span>'; 
    }
    
    // Use MetaMask to call contract
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    
    const tx = await contract.finalizeGameScore(scoreValue);
    await tx.wait();
    
		console.log('Rewards claimed successfully!');
  } catch (err) {
    console.error(err);
		console.log('Failed to claim rewards.');
  } finally {
    const btn = document.getElementById('claimLastRunBtn');
    if (btn) { 
      btn.disabled = false; 
      btn.innerHTML = '<span class="claimIcon">💰</span><span class="claimText">Claim Rewards</span>'; 
    }
  }
}
async function buyLifeLine() {
  // Disable the button and change text to "Loading..."
  document.getElementById("saveButton").disabled = true;
  document.getElementById("SaveMebuttonText").innerText = "Loading...";

	try {
		// If lifeline maps to a Stacks function, call here; else fallback to in-game coins
		if (typeof window.callStacksBuyLife === 'function') {
			console.log('🎮 callStacksBuyLife function found, calling...');
			await window.callStacksBuyLife([]);
			console.log('🎮 Lifeline purchased on Stacks successfully.');
			
			// Show success message
			alert(`🎉 SUCCESS! Lifeline purchased!\n\n💊 Extra life added to your game!\n💰 Cost: 10 COINQ tokens\n\n🎮 Your lifeline has been recorded on the blockchain!`);
			
			coinSound.play();
			saveMe();
		} else {
			console.log('🎮 Using in-game coins for lifeline.');
			try { payForLife(); } catch(e) { console.log('payForLife not available'); }
		}
	} catch(e) { console.log('Stacks buyLife error', e); }
	document.getElementById("saveButton").disabled = false;
	document.getElementById("SaveMebuttonText").innerText = "Save Me!";
	return;

  console.log("Provider:", provider);
  console.log("Signer:", signer);
  console.log("Contract:", CorgiContract);

  try {
    const tx = await CorgiContract.buyLifeLine();
    await tx.wait(); // Wait for transaction to be mined
    console.log("Lifeline bought successfully!");
    coinSound.play();
    saveMe();
  } catch (error) {
    console.error("Error buying lifeline:", error);
		console.log("You dont have enough tokens!");
    // notEnough.play();
  } finally {
    // Re-enable the button and restore the original text
    document.getElementById("saveButton").disabled = false;
    document.getElementById("SaveMebuttonText").innerText = "Save Me!";
  }
}

function muteMe(audio) {
  if (pageMuted) {
    audio.mute(false);
  } else {
    audio.mute(true);
  }
}

function mutePage() {
  soundBtn.classList.toggle("soundBtnOff");
  if (pageMuted) {
    [].forEach.call(audioArr, function (elem) {
      muteMe(elem);
    });
    pageMuted = false;
    localStorage.setItem("pageMuted", "");
  } else {
    [].forEach.call(audioArr, function (elem) {
      muteMe(elem);
    });
    pageMuted = true;
    localStorage.setItem("pageMuted", "true");
  }
}
function autoMute() {
  soundBtn.classList.toggle("soundBtnOff");
  soundOff();
}

function soundOn() {
  [].forEach.call(audioArr, function (elem) {
    elem.mute(false);
  });
}
function soundOff() {
  [].forEach.call(audioArr, function (elem) {
    elem.mute(true);
  });
}

highScoreBlock.innerText = highScore;
mainCoinBlock.innerText = myCoins;

class Bg {
  constructor(image, x, layer) {
    this.x = x;
    this.y = 0;
    this.layer = layer;
    this.image = image;
    var obj = this;
    this.image.addEventListener("load", function () {
      obj.loaded = true;
    });
  }
  Update(bg) {
    this.x -= speed * this.layer;
    if (this.x < 0) {
      bg.x = this.x + canvas.height * bgRatio - speed;
    }
  }
}
class GameObject {
  constructor(image, x, y, isPlayer) {
    this.x = x;
    this.y = y;
    this.slideing = false;
    this.dead = false;
    this.isPlayer = isPlayer;
    this.image = image;
    this.speed = speed;

    this.isShield = false;
    this.isBooster = false;
    this.randDist = RandomInteger(-speed * 2, speed * 2);
    this.shieldTimer = 0;
    this.shield = false;
    this.boost = false;
    this.boostTimer = 0;

    this.topBarrier = false;
    this.levitateCount = 0;
    this.sizeCoef = 1;
    this.levitateHeight = 0;
    this.isLevitate = false;
  }
  Update() {
    var barrierWidth =
      (canvas.height / 5) * (this.image.width / this.image.height);

    if (!this.isPlayer) {
      if (this.isLevitate) {
        this.levitateCount += 0.025;
        this.levitateHeight =
          (canvas.height / 50) * Math.sin(Math.PI * this.levitateCount);
        this.y += this.levitateHeight;
      }

      if (
        (((!this.topBarrier && this.x < -1.5 * barrierWidth) ||
          (this.topBarrier && this.x < -5 * barrierWidth) ||
          this.y < -500) &&
          !this.kicked) ||
        (this.kicked && this.x <= -5 * canvas.width) ||
        (this.kicked && this.y <= -5 * canvas.height)
      ) {
        this.dead = true;
      }
      if (this.kicked) {
        this.x -= this.randDist;
        this.y -= speed * 2;
      } else {
        // Special handling for coin rain objects
        if (this.rainFall) {
          this.x -= this.rainSpeed || speed;
          this.y += this.rainSpeed || speed;
        } else {
          this.x -= speed;
        }
      }
    }
  }
  Collide(object) {
    var playerWidth =
      (canvas.height / 5) *
      (player.image.naturalWidth / player.image.naturalHeight);
    var playerHeight =
      (canvas.height / 5) *
      (player.image.naturalWidth / player.image.naturalHeight);
    var barrierWidth = canvas.height / 3.5;
    var barrierHight =
      canvas.height /
      3.5 /
      (object.image.naturalWidth / object.image.naturalHeight);
    var hit = false;

    // Debug collision detection
    if (object.isCoin || object.isShield || object.isBooster) {
      // Skip debug for collectibles
    } else {
      console.log('🔍 Checking collision with obstacle at', object.x, object.y);
    }

    if (object.topBarrier) {
      if (
        this.x + playerWidth / 2.5 > object.x &&
        this.x < object.x + (barrierWidth * object.sizeCoef) / 1.2
      ) {
        if (this.y - jumpHeight + playerHeight / 1.2 > object.y) {
          var actualPlayerHigh = this.slideing
            ? this.y + playerHeight / 2.2
            : this.y;
          if (
            actualPlayerHigh * 1.1 - jumpHeight <
            object.y + barrierHight * object.sizeCoef
          ) {
            if (player.shield) {
              object.kicked = true;
            } else {
              hit = true;
            }
          }
        }
      }
    } else {
      if (
        this.x + playerWidth / 1.5 > object.x &&
        this.x < object.x + barrierWidth / 1.5
      ) {
        if (
          this.y - jumpHeight + playerHeight > object.y * 1.1 &&
          this.y - jumpHeight < object.y + barrierHight * object.sizeCoef
        ) {
          if (player.shield) {
            if (object.isCoin) {
              if (!object.kicked) {
                coins += 1;
              }
              object.kicked = true;
            } else {
              object.kicked = true;
            }
          } else {
            if (object.isShield) {
              player.shield = true;
              activeTime = shieldLevel * 82;
              // Add power-up particles
              if (window.particleManager) {
                window.particleManager.addPowerupParticles(object.x, object.y, 8);
              }
              object.image = new Image();
            }
            if (object.isBooster) {
              player.boost = true;
              activeTime = boosterLevel * 82;
              // Add power-up particles
              if (window.particleManager) {
                window.particleManager.addPowerupParticles(object.x, object.y, 8);
              }
              object.image = new Image();
            }
            
            // New power-up collection logic
            if (object.isMagnet || object.isDoubleScore || object.isInvincibility || 
                object.isSlowMotion || object.isCoinRain) {
              
              // Activate the power-up
              if (window.powerUpManager && object.powerUpType) {
                window.powerUpManager.activate(object.powerUpType);
              }
              
              // Add power-up particles
              if (window.particleManager) {
                window.particleManager.addPowerupParticles(object.x, object.y, 10);
              }
              
              // Remove the power-up object
              object.image = new Image();
            }
            
            if (object.isCoin) {
              if (!object.kicked) {
                coins += 1;
                // Add coin collection particles
                if (window.particleManager) {
                  window.particleManager.addCoinParticles(object.x, object.y, 5);
                  window.particleManager.addSparkleParticles(object.x, object.y, 3);
                }
              }
              object.kicked = true;
              console.log(coins);
            }
            
            // Magnet effect - attract nearby coins
            if (window.powerUpManager && window.powerUpManager.isMagnetActive()) {
              // Find nearby coins and attract them
              for (let j = 0; j < objects.length; j++) {
                const nearbyObject = objects[j];
                if (nearbyObject.isCoin && !nearbyObject.kicked) {
                  const distance = Math.sqrt(
                    Math.pow(nearbyObject.x - player.x, 2) + 
                    Math.pow(nearbyObject.y - player.y, 2)
                  );
                  
                  // If coin is within magnet range (150 pixels)
                  if (distance < 150) {
                    // Move coin towards player
                    const magnetForce = 0.3;
                    nearbyObject.x += (player.x - nearbyObject.x) * magnetForce;
                    nearbyObject.y += (player.y - nearbyObject.y) * magnetForce;
                    
                    // Add magnetic effect particles
                    if (window.particleManager && Math.random() < 0.1) {
                      window.particleManager.addSparkleParticles(nearbyObject.x, nearbyObject.y, 2);
                    }
                  }
                }
              }
            }
            if (!object.isBooster && !object.isShield && !object.isCoin) {
              hit = true;
              console.log('💥 HIT DETECTED! Obstacle collision at', object.x, object.y);
            }
          }
        }
      }
    }
    return hit;
  }
}

var player = new GameObject(
  runSprites[0],
  0.2 * canvas.width,
  canvas.height - wrapperBlock.offsetHeight / 2.5,
  true
);

var objects = [];
function animate(object, spritesArr) {
  frameNumber += 1;
  if (frameNumber > spritesArr.length - 1) {
    frameNumber = 1;
  }
  object.image = spritesArr[frameNumber];
}

var playerAnimate = setInterval(() => {
  animate(player, runSprites);
}, 75);

function Move() {
  if (rightPressed && player.x + canvas.width / 10 < canvas.width) {
    //вправо
    player.x += speed;
  } else if (leftPressed && player.x > 0) {
    //влево
    player.x -= speed;
  }
  if (jumping) {
    //прыжок
    jumpCount += speed / (canvas.height / 75);
    jumpHeight =
      (canvas.height / 125) *
      jumpLength *
      Math.sin((Math.PI * jumpCount) / jumpLength);
  }
  if (jumpCount > jumpLength) {
    //приземление после прыжка
    jumpCount = 0;
    jumping = false;
    jumpHeight = 0;
    numberOfJumps = Number(numberOfJumps) + 1;
    localStorage.setItem("jumps", numberOfJumps);
    clearInterval(playerAnimate);
    playerAnimate = setInterval(() => {
      animate(player, runSprites);
    }, 75);
  }
}

const bg = [
  new Bg(bgSprites[0], 0, 0.1),
  new Bg(bgSprites[0], canvas.height * bgRatio, 0.1),

  new Bg(bgSprites[7], 0, 0.4),
  new Bg(bgSprites[7], canvas.height * bgRatio, 0.4),

  new Bg(bgSprites[6], 0, 1.2),
  new Bg(bgSprites[6], canvas.height * bgRatio, 1.2),
];

const fg = [
  new Bg(fgSprites[0], 0, 0.3),
  new Bg(fgSprites[0], canvas.height * bgRatio, 0.3),
  new Bg(fgSprites[1], 0, 1),
  new Bg(fgSprites[1], canvas.height * bgRatio, 1),
];

const CollectObjects = [new GameObject(CollectSprites[0], 0, 0, false)];

function jumpBegin() {
  if (!player.slideing) {
    clearInterval(playerAnimate);
    playerAnimate = setInterval(() => {
      animate(player, jumpSprites);
    }, 100 + score / 10);
    jumping = true;
  }
}
function slideBegin() {
  if (!jumping) {
    player.slideing = true;
    slideing += 1;
    if (slideing == 1) {
      clearInterval(playerAnimate);
      player.image = slideSprites[0];
      setTimeout(() => {
        player.image = slideSprites[1];
      }, 20);
      playerAnimate = setInterval(() => {
        player.image = slideSprites[2];
        animate(player, slideSprites.slice(3, 6));
      }, 100);
    }
  }
}

function slideEnd() {
  if (!jumping) {
    player.slideing = false;
    clearInterval(playerAnimate);
    slideing = 0;
    player.image = slideSprites[1];
    setTimeout(() => {
      player.image = slideSprites[0];
    }, 20);
    playerAnimate = setInterval(() => {
      animate(player, runSprites);
    }, 75);
    numberOfslides = Number(numberOfslides) + 1;
    localStorage.setItem("slides", numberOfslides);
  }
}

function keyRightHandler(e) {
  if (e.keyCode == 39 || e.keyCode == 68) {
    //right
    rightPressed = true;
  }
  if (e.keyCode == 37 || e.keyCode == 65) {
    //left
    leftPressed = true;
  }
  if (e.keyCode == 87 || e.keyCode == 38) {
    //jump
    jumpBegin();
  }
  if (e.keyCode == 83 || e.keyCode == 40) {
    //slide
    slideBegin();
  }

  if (e.keyCode == 27 && !gameOver) {
    //pause
    PauseToggle();
  }
}

function keyLeftHandler(e) {
  if (e.keyCode == 39 || e.keyCode == 68) {
    rightPressed = false;
  }
  if (e.keyCode == 37 || e.keyCode == 65) {
    leftPressed = false;
  }
  if (e.keyCode == 83 || e.keyCode == 40) {
    slideEnd();
  }
  if (e.keyCode == 32 && gameOver == true) {
    Replay();
  }
}
function updateAchives() {
  const achives = {
    0: highScore >= 100,
    1: highScore >= 300,
    2: highScore >= 500,
    3: highScore >= 700,
    4: highScore >= 1000,
    5: numberOfDeaths >= 8,
    6: numberOfDeaths >= 27,
    7: numberOfDeaths >= 42,
    8: numberOfDeaths >= 100,
    9: numberOfJumps >= 500,
    10: numberOfslides >= 300,
    11: shieldLevel >= 4,
    12: boosterLevel >= 4,
    13: myCoins >= 1000,
  };
  var unlockCount = 0;
  for (var i = 0; i < achivesBlocks.length - 1; i += 1) {
    if (achives[i]) {
      achivesBlocks[i].classList.remove("lock");
      unlockCount += 1;
    }
  }
  if (unlockCount == achivesBlocks.length - 1) {
    achivesBlocks[achivesBlocks.length - 1].classList.remove("lock");
  }
  document.getElementById("numberOfJumpsBlock").innerHTML =
    "Jumps: " + numberOfJumps;
  document.getElementById("numberOfDeathsBlock").innerHTML =
    "Deaths: " + numberOfDeaths;
  document.getElementById("numberOfslidesBlock").innerHTML =
    "Slides: " + numberOfslides;
}

function updateUpgrades() {
  for (let i = 0; i < shieldLevel; i += 1) {
    shieldLevels[i].classList.add("activeLevel");
  }
  for (let i = 0; i < boosterLevel; i += 1) {
    boosterLevels[i].classList.add("activeLevel");
  }
  if (shieldLevel < 4) {
    shieldCost.innerHTML = shieldLevel * 150;
  } else {
    shieldCost.innerHTML = "MAX";
    document.getElementsByClassName("upgradeCoinImg")[0].classList.add("hide");
  }
  if (boosterLevel < 4) {
    boosterCost.innerHTML = boosterLevel * 150;
  } else {
    boosterCost.innerHTML = "MAX";
    document.getElementsByClassName("upgradeCoinImg")[1].classList.add("hide");
  }
}
//localStorage.clear()
//localStorage.setItem('myCoins', 10000);
function payForLife() {
  if (+myCoins >= 100) {
    myCoins = +myCoins - 100;
    localStorage.setItem("myCoins", myCoins);
    coinSound.play();
    saveMe();
  } else {
    notEnough.play();
  }
}
function Upgrade(boost) {
  if (boost == "shield") {
    if (+shieldCost.innerText <= +myCoins && +shieldLevel < 4) {
      myCoins = +myCoins - +shieldCost.innerText;
      shieldLevel = +shieldLevel + 1;
      localStorage.setItem("shieldLevel", shieldLevel);
      localStorage.setItem("myCoins", myCoins);
      storeCoinsText.innerText = +myCoins;
      mainCoinBlock.innerText = localStorage.getItem("myCoins");
      coinSound.play();
      updateUpgrades();
    } else {
      notEnough.play();
    }
  } else {
    if (+boosterCost.innerText <= +myCoins && +boosterLevel < 4) {
      myCoins = +myCoins - +boosterCost.innerText;
      boosterLevel = +boosterLevel + 1;
      localStorage.setItem("boosterLevel", boosterLevel);
      localStorage.setItem("myCoins", myCoins);
      storeCoinsText.innerText = +myCoins;
      mainCoinBlock.innerText = localStorage.getItem("myCoins");
      coinSound.play();
      updateUpgrades();
    } else {
      notEnough.play();
    }
  }
}

function PlayButtonActivate() {
  console.log("PlayButtonActivate called");
  
  ResetGlobalVariables();

  document.addEventListener("keydown", keyRightHandler, false);
  document.addEventListener("keyup", keyLeftHandler, false);
  toggleHide(mainMenuBlock);
  toggleHide(pauseButton);
  toggleHide(scoreBlock);
  toggleHide(coinsBlock);
  saveMeBlock.classList.remove("hide");
  // Keep the on-screen controls visible
  controlBlock.style.opacity = 1;
  Start();
}

function PauseToggle() {
  stopGame ? Start() : Stop();
  pause = pauseBlock.classList.contains("hide") ? true : false;
  toggleHide(pauseBlock);
  toggleHide(scoreBlock);
  toggleHide(coinsBlock);
  toggleHide(pauseButton);
}
function ResetGlobalVariables() {
  objects = [];
  coins = 0;
  player.x = 0.2 * canvas.width;
  gameOver = false;
  pause = false;
  player.rise = false;
  player.shield = false;
  player.boostTimer = 0;
  player.boost = false;
  player.dead = false;
  speed = canvas.clientWidth / 115;
  player.y = canvas.height - wrapperBlock.offsetHeight / 2.5;
  score = 0;
  leftPressed = false;
  rightPressed = false;
  document.removeEventListener("keydown", keyRightHandler, false);
  document.removeEventListener("keyup", keyLeftHandler, false);
}
function GameOver() {
  player.shieldTimer = 0;
  player.boostTimer = 0;
  bgMusic.pause();
  bgMusic.currentTime = 0;
  Stop();
  gameOverSound.play();
  setTimeout(() => {
    player.image = deathSprites[0];
    Draw();
    setTimeout(() => {
      player.image = deathSprites[1];
      Draw();
      setTimeout(() => {
        player.image = deathSprites[2];
        Draw();
        setTimeout(() => {
          player.image = deathSprites[3];
          Draw();
          setTimeout(() => {
            GameOverScoreBlock.innerText = "Score: " + score.toFixed(0);
            toggleHide(scoreBlock);
            toggleHide(coinsBlock);
            toggleHide(pauseButton);
            toggleHide(gameOverBlock);
            gameOverCoinsBlock.innerText = Number(coins);
            // store last run for rewards panel
            try {
              localStorage.setItem("lastRunCoins", String(coins));
              localStorage.setItem("lastRunScore", String(score.toFixed(0)));
              if (typeof lastCoinsText !== 'undefined' && lastCoinsText) {
                lastCoinsText.innerText = String(coins);
              }
              if (typeof lastScoreText !== 'undefined' && lastScoreText) {
                lastScoreText.innerText = String(score.toFixed(0));
              }
            } catch (e) {}
            player.dead = false;
            showFullAdd();
            if (score > highScore) {
              HIandRecord.innerHTML = "new record!";
              highScore = Number(score.toFixed(0));
              localStorage.setItem("HI", score.toFixed(0));
            } else {
              HIandRecord.innerText = "HighScore: " + highScore;
            }
            if (player.rise) {
              saveMeBlock.classList.add("hide");
            }
            updateAchives();
          }, 80);
        }, 50);
      }, 50);
    }, 50);
  }, 50);
}

function Replay() {
  if (gameOver) {
    localStorage.setItem(
      "myCoins",
      Number(localStorage.getItem("myCoins")) + Number(coins)
    );
    mainCoinBlock.innerText = localStorage.getItem("myCoins");
    bgMusic.play();
    toggleHide(gameOverBlock);
    toggleHide(pauseButton);
    toggleHide(scoreBlock);
    toggleHide(coinsBlock);
    saveMeBlock.classList.remove("hide");
  }
  if (pause) {
    toggleHide(pauseBlock);
    toggleHide(pauseButton);
    toggleHide(scoreBlock);
    toggleHide(coinsBlock);
  }
  ResetGlobalVariables();
  document.addEventListener("keydown", keyRightHandler, false);
  document.addEventListener("keyup", keyLeftHandler, false);
  Start();
}
function GoToHome() {
  if (pause) {
    toggleHide(pauseBlock);
  }
  if (gameOver) {
    localStorage.setItem(
      "myCoins",
      Number(localStorage.getItem("myCoins")) + Number(coins)
    );
    mainCoinBlock.innerText = localStorage.getItem("myCoins");
    toggleHide(gameOverBlock);
  }

  bgMusic.pause();
  bgMusic.currentTime = 0;
  highScoreBlock.innerText = highScore;
  ResetGlobalVariables();
  updateAchives();
  updateUpgrades();
  toggleHide(mainMenuBlock);
  // refresh rewards panel values from storage
  try {
    const lCoins = localStorage.getItem("lastRunCoins") || "0";
    const lScore = localStorage.getItem("lastRunScore") || "0";
    if (typeof lastCoinsText !== 'undefined' && lastCoinsText) {
      lastCoinsText.innerText = lCoins;
    }
    if (typeof lastScoreText !== 'undefined' && lastScoreText) {
      lastScoreText.innerText = lScore;
    }
  } catch (e) {}
}
function UpdateBg(index, arr = bg) {
  arr[index].Update(arr[index + 1]);
  arr[index + 1].Update(arr[index]);
}

function showScoreAndCoins() {
  let scoreIncrease = 0.12;
  
  // Apply power-up multipliers
  if (window.powerUpManager) {
    scoreIncrease *= window.powerUpManager.getScoreMultiplier();
  }
  
  score += scoreIncrease;
  scoreBlock.innerText =
    "0".repeat(4 - String(score.toFixed(0).length)) + String(score.toFixed(0));
  coinsText.innerText = "0".repeat(3 - String(coins).length) + coins;
}

function Start() {
  stopGame = false;
  fpsInterval = 1000 / 60;
  then = Date.now();
  startTime = then;
  Update();
}

function Stop() {
  stopGame = true;
}
function pushRandomCoin(pos, newCoin = true) {
  let x;
  let y;
  if (RandomInteger(1, 4) >= 2) {
    if (RandomInteger(0, 1) == 1) {
      x = (4 * canvas.width) / 3;
      y =
        pos == "top"
          ? canvas.height - wrapperBlock.offsetHeight / 1.4
          : canvas.height - wrapperBlock.offsetHeight / 3.1;
    } else {
      x = (4 * canvas.width) / 2;
      y = canvas.height - wrapperBlock.offsetHeight / 3.1;
    }
    if (newCoin) {
      objects.push(new GameObject(barriersSprites[0], x, y, false));
    }
    objects.at(-1).image = CollectSprites[3];
    objects.at(-1).isCoin = true;
    objects.at(-1).sizeCoef = 0.3;
  }
}
function Update() {
  if (stopGame) {
    return;
  }
  frame = requestAnimationFrame(Update);

  now = Date.now();
  elapsed = now - then;

  if (elapsed > fpsInterval) {
    then = now - (elapsed % fpsInterval);

    for (let i = 0; i < bg.length - 1; i += 2) {
      UpdateBg(i);
    }

    if (RandomInteger(0, speed * 1.1) > speed) {
      if (objects.length == 0 || objects.at(-1).x < canvas.width - 100) {
        objects.push(
          new GameObject(
            barriersSprites[0],
            (4 * canvas.width) / 3.1,
            canvas.height - wrapperBlock.offsetHeight / 2.7,
            false
          )
        );
        var randomBarrier = RandomInteger(1, 8);
        switch (randomBarrier) {
          case 1:
            objects.at(-1).image = barriersSprites[randomBarrier - 1];
            pushRandomCoin("top");
            break;
          case 2:
            objects.at(-1).image = barriersSprites[randomBarrier - 1];
            pushRandomCoin("top");
            break;
          case 3:
            objects.at(-1).image = barriersSprites[randomBarrier - 1];
            pushRandomCoin("top");
            break;
          case 4:
            objects.at(-1).image = barriersSprites[randomBarrier - 1];
            objects.at(-1).y = canvas.height - wrapperBlock.offsetHeight / 2.35;
            pushRandomCoin("top");
            break;
          case 5:
            objects.at(-1).image = barriersSprites[randomBarrier - 1];
            objects.at(-1).topBarrier = true;
            objects.at(-1).y =
              canvas.height -
              canvas.height /
                2.58 /
                (objects.at(-1).image.naturalWidth /
                  objects.at(-1).image.naturalHeight);
            pushRandomCoin("bottom");
            break;
          case 6:
            objects.at(-1).image = barriersSprites[randomBarrier - 1];
            pushRandomCoin("top");
            break;
          case 7:
            objects.at(-1).image = barriersSprites[randomBarrier - 1];
            objects.at(-1).isLevitate = true;
            objects.at(-1).topBarrier = true;
            objects.at(-1).sizeCoef = 1.7;
            objects.at(-1).y = canvas.height - wrapperBlock.offsetHeight / 1.11;
            pushRandomCoin("bottom");
            break;
          case 8:
            if (
              !objects.at(-1).isBooster &&
              !player.boost &&
              !objects.at(-1).isShield &&
              !player.shield
            ) {
              if (RandomInteger(0, 100) > 70) {
                objects.at(-1).image = CollectSprites[1];
                objects.at(-1).isShield = true;
                objects.at(-1).sizeCoef = 0.5;
                objects.at(-1).y =
                  RandomInteger(0, 1) == 1
                    ? canvas.height - wrapperBlock.offsetHeight / 2.5
                    : canvas.height - wrapperBlock.offsetHeight / 1.3;
              }
              if (RandomInteger(0, 100) > 70) {
                objects.at(-1).image = CollectSprites[2];
                objects.at(-1).isBooster = true;
                objects.at(-1).sizeCoef = 0.5;
                objects.at(-1).y =
                  RandomInteger(0, 1) == 1
                    ? canvas.height - wrapperBlock.offsetHeight / 2.5
                    : canvas.height - wrapperBlock.offsetHeight / 1.3;
              }
              
              // Spawn new power-ups (lower chance)
              const powerUpChance = RandomInteger(0, 100);
              if (powerUpChance > 85) { // 15% chance for new power-ups
                const powerUpType = RandomInteger(1, 5);
                switch(powerUpType) {
                  case 1: // Magnet
                    objects.at(-1).image = CollectSprites[4]; // magnet.png
                    objects.at(-1).isMagnet = true;
                    objects.at(-1).sizeCoef = 0.4;
                    objects.at(-1).powerUpType = 'magnet';
                    break;
                  case 2: // Double Score
                    objects.at(-1).image = CollectSprites[5]; // doublescores.png
                    objects.at(-1).isDoubleScore = true;
                    objects.at(-1).sizeCoef = 0.4;
                    objects.at(-1).powerUpType = 'doubleScore';
                    break;
                  case 3: // Invincibility
                    objects.at(-1).image = CollectSprites[6]; // invincibility.png
                    objects.at(-1).isInvincibility = true;
                    objects.at(-1).sizeCoef = 0.4;
                    objects.at(-1).powerUpType = 'invincibility';
                    break;
                  case 4: // Slow Motion
                    objects.at(-1).image = CollectSprites[7]; // slowmotion.png
                    objects.at(-1).isSlowMotion = true;
                    objects.at(-1).sizeCoef = 0.4;
                    objects.at(-1).powerUpType = 'slowMotion';
                    break;
                  case 5: // Coin Rain
                    objects.at(-1).image = CollectSprites[8]; // coinrain.png
                    objects.at(-1).isCoinRain = true;
                    objects.at(-1).sizeCoef = 0.4;
                    objects.at(-1).powerUpType = 'coinRain';
                    break;
                }
                objects.at(-1).y =
                  RandomInteger(0, 1) == 1
                    ? canvas.height - wrapperBlock.offsetHeight / 2.5
                    : canvas.height - wrapperBlock.offsetHeight / 1.3;
              }
              break;
            }
        }
      }
    }

    for (let i = 0; i < fg.length - 1; i += 2) {
      UpdateBg(i, fg);
    }

    var isDead = false;

    for (var i = 0; i < objects.length; i++) {
      objects[i].Update(i);

      if (objects[i].dead) {
        isDead = true;
      }
    }

    if (isDead) {
      objects.shift();
    }

    var hit = false;

    for (var i = 0; i < objects.length; i++) {
      hit = player.Collide(objects[i]);

      if (hit) {
        // Check if player is invincible
        if (window.powerUpManager && window.powerUpManager.isInvincible()) {
          console.log('💎 Player is invincible! No damage taken.');
          // Still add visual effects but don't die
          if (window.particleManager) {
            window.particleManager.addSparkleParticles(player.x, player.y, 6);
          }
        } else {
          console.log('🎯 Player hit obstacle! Adding effects...');
          // Add damage particles at player position
          if (window.particleManager) {
            window.particleManager.addDamageParticles(player.x, player.y, 8);
            console.log('💥 Damage particles added');
          }
          // Add screen shake
          if (window.screenShake) {
            window.screenShake.start(20, 0.5);
            console.log('📳 Screen shake started');
          }
          player.dead = true;
        }
      }
    }

    // Update particles
    if (window.particleManager) {
      window.particleManager.update();
    }
    
    // Update screen shake
    if (window.screenShake) {
      window.screenShake.update(1/60); // Assuming 60 FPS
    }
    
    // Update power-ups
    if (window.powerUpManager) {
      window.powerUpManager.update();
    }
    
    // Update dynamic backgrounds
    if (window.dynamicBackgroundManager) {
      window.dynamicBackgroundManager.update(score, Date.now());
    }

    player.Update();

    if (player.dead) {
      numberOfDeaths = Number(numberOfDeaths) + 1;
      localStorage.setItem("deaths", numberOfDeaths);
      gameOver = true;
      GameOver();
    }

    speed += 0.001;

    Draw();
    Move();
    showScoreAndCoins();
  }
}

function Draw() {
  ctx.imageSmoothingQuality = "high";
  ctx.imageSmoothingEnabled = true;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Apply screen shake offset
  let shakeOffset = { x: 0, y: 0 };
  if (window.screenShake) {
    shakeOffset = window.screenShake.getOffset();
  }
  
  ctx.save();
  ctx.translate(shakeOffset.x, shakeOffset.y);
  
  for (var i = 0; i < bg.length; i += 1) {
    bg[i].image.addEventListener(
      "load",
      ctx.drawImage(
        bg[i].image,
        0,
        0,
        bg[i].image.naturalWidth,
        bg[i].image.naturalHeight,
        bg[i].x,
        bg[i].y,
        canvas.height * bgRatio,
        canvas.height
      )
    );
  }

  for (var i = 0; i < objects.length; i++) {
    DrawObject(objects[i]);
  }
  ctx.imageSmoothingEnabled = false;
  DrawObject(player);
  
  // Draw particles
  if (window.particleManager) {
    window.particleManager.draw(ctx);
  }
  
  // Draw power-up indicators
  if (window.powerUpManager) {
    window.powerUpManager.draw(ctx);
  }
  
  if (player.boost) {
    if (player.boostTimer == 0) {
      clearInterval(playerAnimate);
      playerAnimate = setInterval(() => {
        animate(player, runSprites);
      }, 30);
      player.boostTimer += 1;
      player.shield = true;
      normalSpeed = speed;
      speed = speed * 5;
    }
  }
  for (var i = 0; i < (player.boost ? fg.length : fg.length - 2); i += 1) {
    fg[i].image.addEventListener(
      "load",
      ctx.drawImage(
        fg[i].image,
        0,
        0,
        fg[i].image.naturalWidth,
        fg[i].image.naturalHeight,
        fg[i].x,
        fg[i].y,
        canvas.height * bgRatio,
        canvas.height
      )
    );
  }

  if (player.shield) {
    CollectObjects[0].x = player.x;
    CollectObjects[0].y = player.y - jumpHeight;
    player.shieldTimer += 1;
    if (player.boost) {
      score += 0.12;
    }
    if (player.shieldTimer == activeTime) {
      setTimeout(() => {
        CollectObjects[0].image = new Image();
        DrawObject(CollectObjects[0]);
        if (player.boost) {
          clearInterval(playerAnimate);
          playerAnimate = setInterval(() => {
            animate(player, runSprites);
          }, 75);
          player.boost = false;
          speed = normalSpeed;
          player.boostTimer = 0;
        }
        setTimeout(() => {
          CollectObjects[0].image = CollectSprites[0];
          DrawObject(CollectObjects[0]);
          setTimeout(() => {
            CollectObjects[0].image = new Image();
            DrawObject(CollectObjects[0]);
            setTimeout(() => {
              CollectObjects[0].image = CollectSprites[0];
              DrawObject(CollectObjects[0]);
              setTimeout(() => {
                CollectObjects[0].image = new Image();
                DrawObject(CollectObjects[0]);
                setTimeout(() => {
                  CollectObjects[0].image = CollectSprites[0];
                  DrawObject(CollectObjects[0]);
                  setTimeout(() => {
                    CollectObjects[0].image = new Image();
                    DrawObject(CollectObjects[0]);
                    setTimeout(() => {
                      CollectObjects[0].image = CollectSprites[0];
                      DrawObject(CollectObjects[0]);
                      setTimeout(() => {
                        CollectObjects[0].image = new Image();
                        DrawObject(CollectObjects[0]);
                        setTimeout(() => {
                          CollectObjects[0].image = CollectSprites[0];
                          DrawObject(CollectObjects[0]);
                          setTimeout(() => {
                            CollectObjects[0].image = new Image();
                            DrawObject(CollectObjects[0]);
                            setTimeout(() => {
                              CollectObjects[0].image = CollectSprites[0];
                              DrawObject(CollectObjects[0]);
                              player.shield = false;
                              player.shieldTimer = 0;
                              setTimeout(() => {
                                CollectObjects[0].image = new Image();
                                DrawObject(CollectObjects[0]);
                                setTimeout(() => {
                                  CollectObjects[0].image = CollectSprites[0];
                                  DrawObject(CollectObjects[0]);
                                  setTimeout(() => {
                                    CollectObjects[0].image = new Image();
                                    DrawObject(CollectObjects[0]);
                                    setTimeout(() => {
                                      CollectObjects[0].image =
                                        CollectSprites[0];
                                      DrawObject(CollectObjects[0]);
                                      setTimeout(() => {
                                        CollectObjects[0].image = new Image();
                                        DrawObject(CollectObjects[0]);
                                        setTimeout(() => {
                                          CollectObjects[0].image =
                                            CollectSprites[0];
                                          DrawObject(CollectObjects[0]);
                                          setTimeout(() => {
                                            CollectObjects[0].image =
                                              new Image();
                                            DrawObject(CollectObjects[0]);
                                            setTimeout(() => {
                                              CollectObjects[0].image =
                                                CollectSprites[0];
                                              DrawObject(CollectObjects[0]);
                                              setTimeout(() => {
                                                CollectObjects[0].image =
                                                  new Image();
                                                DrawObject(CollectObjects[0]);
                                                setTimeout(() => {
                                                  CollectObjects[0].image =
                                                    CollectSprites[0];
                                                  DrawObject(CollectObjects[0]);
                                                  setTimeout(() => {
                                                    CollectObjects[0].image =
                                                      new Image();
                                                    DrawObject(
                                                      CollectObjects[0]
                                                    );
                                                    setTimeout(() => {
                                                      CollectObjects[0].image =
                                                        CollectSprites[0];
                                                      DrawObject(
                                                        CollectObjects[0]
                                                      );
                                                      setTimeout(() => {
                                                        CollectObjects[0].image =
                                                          new Image();
                                                        DrawObject(
                                                          CollectObjects[0]
                                                        );
                                                        setTimeout(() => {
                                                          CollectObjects[0].image =
                                                            CollectSprites[0];
                                                          DrawObject(
                                                            CollectObjects[0]
                                                          );
                                                          setTimeout(() => {
                                                            CollectObjects[0].image =
                                                              new Image();
                                                            DrawObject(
                                                              CollectObjects[0]
                                                            );
                                                            setTimeout(() => {
                                                              CollectObjects[0].image =
                                                                CollectSprites[0];
                                                              DrawObject(
                                                                CollectObjects[0]
                                                              );
                                                              setTimeout(() => {
                                                                CollectObjects[0].image =
                                                                  new Image();
                                                                DrawObject(
                                                                  CollectObjects[0]
                                                                );
                                                                setTimeout(
                                                                  () => {
                                                                    CollectObjects[0].image =
                                                                      CollectSprites[0];
                                                                    DrawObject(
                                                                      CollectObjects[0]
                                                                    );
                                                                    setTimeout(
                                                                      () => {
                                                                        CollectObjects[0].image =
                                                                          new Image();
                                                                        DrawObject(
                                                                          CollectObjects[0]
                                                                        );
                                                                        setTimeout(
                                                                          () => {
                                                                            CollectObjects[0].image =
                                                                              CollectSprites[0];
                                                                            DrawObject(
                                                                              CollectObjects[0]
                                                                            );
                                                                            setTimeout(
                                                                              () => {
                                                                                CollectObjects[0].image =
                                                                                  new Image();
                                                                                DrawObject(
                                                                                  CollectObjects[0]
                                                                                );
                                                                                setTimeout(
                                                                                  () => {
                                                                                    CollectObjects[0].image =
                                                                                      CollectSprites[0];
                                                                                    DrawObject(
                                                                                      CollectObjects[0]
                                                                                    );
                                                                                    setTimeout(
                                                                                      () => {
                                                                                        CollectObjects[0].image =
                                                                                          new Image();
                                                                                        DrawObject(
                                                                                          CollectObjects[0]
                                                                                        );
                                                                                        setTimeout(
                                                                                          () => {
                                                                                            CollectObjects[0].image =
                                                                                              CollectSprites[0];
                                                                                            DrawObject(
                                                                                              CollectObjects[0]
                                                                                            );
                                                                                            setTimeout(
                                                                                              () => {
                                                                                                CollectObjects[0].image =
                                                                                                  new Image();
                                                                                                DrawObject(
                                                                                                  CollectObjects[0]
                                                                                                );
                                                                                                setTimeout(
                                                                                                  () => {
                                                                                                    CollectObjects[0].image =
                                                                                                      CollectSprites[0];
                                                                                                    DrawObject(
                                                                                                      CollectObjects[0]
                                                                                                    );
                                                                                                    setTimeout(
                                                                                                      () => {
                                                                                                        CollectObjects[0].image =
                                                                                                          new Image();
                                                                                                        DrawObject(
                                                                                                          CollectObjects[0]
                                                                                                        );
                                                                                                        setTimeout(
                                                                                                          () => {
                                                                                                            CollectObjects[0].image =
                                                                                                              CollectSprites[0];
                                                                                                            DrawObject(
                                                                                                              CollectObjects[0]
                                                                                                            );
                                                                                                            player.shield = false;
                                                                                                            player.shieldTimer = 0;
                                                                                                          },
                                                                                                          50
                                                                                                        );
                                                                                                      },
                                                                                                      50
                                                                                                    );
                                                                                                  },
                                                                                                  50
                                                                                                );
                                                                                              },
                                                                                              50
                                                                                            );
                                                                                          },
                                                                                          50
                                                                                        );
                                                                                      },
                                                                                      50
                                                                                    );
                                                                                  },
                                                                                  50
                                                                                );
                                                                              },
                                                                              50
                                                                            );
                                                                          },
                                                                          50
                                                                        );
                                                                      },
                                                                      50
                                                                    );
                                                                  },
                                                                  50
                                                                );
                                                              }, 50);
                                                            }, 50);
                                                          }, 50);
                                                        }, 50);
                                                      }, 50);
                                                    }, 50);
                                                  }, 50);
                                                }, 50);
                                              }, 50);
                                            }, 50);
                                          }, 50);
                                        }, 50);
                                      }, 50);
                                    }, 50);
                                  }, 50);
                                }, 50);
                              }, 50);
                            }, 50);
                          }, 50);
                        }, 50);
                      }, 50);
                    }, 50);
                  }, 50);
                }, 50);
              }, 50);
            }, 50);
          }, 50);
        }, 50);
      }, 50);
    } else {
      DrawObject(CollectObjects[0]);
    }
  }
  
  // Restore canvas context after screen shake
  ctx.restore();
}
function DrawObject(object) {
  var playerWidth =
    (canvas.height / 5) *
    (player.image.naturalWidth / player.image.naturalHeight);
  var playerHeight =
    (canvas.height / 5) *
    (player.image.naturalWidth / player.image.naturalHeight);
  var barrierWidth = canvas.height / 3.5;
  var barrierHight =
    canvas.height /
    3.5 /
    (object.image.naturalWidth / object.image.naturalHeight);
  object.image.addEventListener(
    "load",
    ctx.drawImage(
      object.image,
      object.x,
      object.isPlayer ? object.y - jumpHeight : object.y,
      object.isPlayer ? playerWidth : barrierWidth * object.sizeCoef,
      object.isPlayer ? playerHeight : barrierHight * object.sizeCoef
    )
  );
}

function Resize() {
  canvas.width = wrapperBlock.offsetWidth;
  canvas.height = wrapperBlock.offsetHeight;
}

function RandomInteger(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}

window.onfocus = function () {
  if (!pageMuted) {
    soundOn();
  }
};
window.onblur = function () {
  soundOff();
};

// Expose game functions globally for HTML onclick handlers
console.log('🎮 === EXPOSING GAME FUNCTIONS GLOBALLY ===');
console.log('🎮 finalizeGameScore:', typeof finalizeGameScore);
console.log('🎮 claimLastRun:', typeof claimLastRun);
console.log('🎮 buyLifeLine:', typeof buyLifeLine);

window.finalizeGameScore = finalizeGameScore;
window.claimLastRun = claimLastRun;
window.buyLifeLine = buyLifeLine;

console.log('🎮 === GAME FUNCTIONS EXPOSED ===');
console.log('🎮 window.finalizeGameScore:', typeof window.finalizeGameScore);
console.log('🎮 window.claimLastRun:', typeof window.claimLastRun);
console.log('🎮 window.buyLifeLine:', typeof window.buyLifeLine);
