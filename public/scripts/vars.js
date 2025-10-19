// Wait for DOM to be ready before initializing canvas-dependent variables
function initializeCanvasVariables() {
  var canvas = document.getElementById("canvas");
  if (!canvas) {
    console.error("Canvas element not found!");
    return false;
  }
  
  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var ctx = canvas.getContext("2d");
  var wrapperBlock = document.getElementsByClassName("wrapper")[0];
  
  // Make these variables globally accessible
  window.canvas = canvas;
  window.audioCtx = audioCtx;
  window.ctx = ctx;
  window.wrapperBlock = wrapperBlock;
  
  // Call Resize after canvas is ready
  if (typeof Resize === 'function') {
    Resize();
  }
  
  return true;
}

// Initialize immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeCanvasVariables);
} else {
  initializeCanvasVariables();
}

// Keep the original variable declarations for backward compatibility
var canvas = window.canvas;
var audioCtx = window.audioCtx;
var ctx = window.ctx;
var wrapperBlock = window.wrapperBlock;

var creditsBlock = document.getElementsByClassName("credits")[0];
var storeBlock = document.getElementsByClassName("store")[0];
var storeCoinsText = document.getElementsByClassName("storeCoinsText")[0];
var achivesBlock = document.getElementsByClassName("achives")[0];
var achivesBlocks = document.getElementsByClassName("achiveBlock")

var pauseBlock = document.getElementsByClassName("pause")[0];
var pauseButton = document.getElementsByClassName("pauseButton")[0];
var gameOverBlock = document.getElementsByClassName("gameOver")[0];
var mainMenuBlock = document.getElementsByClassName("mainMenu")[0];
var controlBlock = document.getElementsByClassName("controlBlock")[0];
var rewardsBlock = document.getElementsByClassName("rewards")[0];
var lastCoinsText = document.getElementById("lastCoinsText");
var lastScoreText = document.getElementById("lastScoreText");
var settingsPanel = document.getElementsByClassName("settingsPanel")[0];
var walletArea = document.getElementById("walletArea");
// walletAddressDisplay removed from main menu center

var scoreBlock = document.getElementsByClassName("score")[0];
var highScoreBlock = document.getElementsByClassName("HighScoreBlock")[0];

var coinsBlock = document.getElementsByClassName('coins')[0];
var mainCoinBlock = document.getElementsByClassName('mainCoinsText')[0];
var coinsText = document.getElementsByClassName('coinsText')[0];
var gameOverCoinsBlock =document.getElementsByClassName('gameOverCoins')[0];

var GameOverScoreBlock = document.getElementsByClassName("score")[1];
var HIandRecord = document.getElementsByClassName("HIandRecord")[0];
var soundBtn = document.getElementsByClassName("soundBtn")[0];
var rightButtonsBlock = document.getElementsByClassName('rightButtonsBlock')[0]
var leftButtonsBlock = document.getElementsByClassName('leftButtonsBlock')[0]
var loaderBlock = document.getElementsByClassName('loader')[0]
var mainBgBlocks =  document.getElementsByClassName('mainBg');
var smallBtnBlocks = document.getElementsByClassName('smallBtn');

var boosterLevels = document.getElementsByClassName('boosterLevel');
var shieldLevels = document.getElementsByClassName('shieldLevel');

var boosterCost = document.getElementsByClassName('boosterCost')[0];
var shieldCost = document.getElementsByClassName('shieldCost')[0];

var saveMeBlock = document.getElementsByClassName('saveMeHolder')[0];


var normalSpeed
var speed;
var bgRatio;
var leftPressed = false;
var rightPressed = false;
var upPressed = false;
var downPressed = false;
var slideing = 0;
var jumping = false;
var jumpCount = 0;
var jumpLength = 50;
var jumpHeight = 0;
var overIndex = 1;
var fpsInterval, startTime, now, then, elapsed;
var frameCount = 0;
var frameNumber = 1;
var stopGame = false;
var score = 0;
var pause = false
var gameOver = false
var coins = 0
var player;
var activeTime; 
const toggleHide = (block) => block.classList.toggle('hide')