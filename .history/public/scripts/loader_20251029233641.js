var loader = new PxLoader();

var highScore;
localStorage.getItem('HI') > 0 ? highScore = localStorage.getItem('HI') : highScore = 0;

var myCoins;
localStorage.getItem('myCoins') > 0 ? myCoins = localStorage.getItem('myCoins') : myCoins = 0;

var numberOfJumps;
localStorage.getItem('jumps') > 0 ? numberOfJumps = localStorage.getItem('jumps') : numberOfJumps = 0;

var numberOfDeaths;
localStorage.getItem('deaths') > 0 ? numberOfDeaths = localStorage.getItem('deaths') : numberOfDeaths = 0;

var numberOfslides;
localStorage.getItem('slides') > 0 ? numberOfslides = localStorage.getItem('slides') : numberOfslides = 0;

var shieldLevel;
localStorage.getItem('shieldLevel') > 1 ? shieldLevel = localStorage.getItem('shieldLevel') : shieldLevel = 1;

var boosterLevel;
localStorage.getItem('boosterLevel') > 1 ? boosterLevel = localStorage.getItem('boosterLevel') : boosterLevel = 1;

var pageMuted;
if (typeof localStorage.getItem('pageMuted') === 'undefined' || localStorage.getItem('pageMuted') === null){
  localStorage.setItem('pageMuted', '')
  pageMuted = false
} else{
  pageMuted = Boolean(localStorage.getItem('pageMuted'))
}
const runSprites = [];
for (let i = 1; i < 9; i += 1) {
	runSprites.push(loader.addImage('assets/sprites/run/' + i + '.png'));
}
const slideSprites = [];
for (let i = 1; i < 7; i += 1) {
	slideSprites.push(loader.addImage('assets/sprites/slide/' + i + '.png'));
}
const jumpSprites = [];
for (let i = 1; i < 7; i += 1) {
	jumpSprites.push(loader.addImage('assets/sprites/jump/' + i + '.png'));
}
const deathSprites = [];
for (let i = 1; i < 5; i += 1) {
	deathSprites.push(loader.addImage('assets/sprites/death/' + i + '.png'));
}
const barriersSprites = [];
for (let i = 1; i < 8; i += 1) {
	barriersSprites.push(loader.addImage('assets/sprites/barriers/' + i + '.png'));
}
// Make these globally accessible for game.js
window.bgSprites = [];
for (let i = 1; i < 9; i += 1) {
	window.bgSprites.push(loader.addImage('assets/bg/' + i + '.png'));
}
window.fgSprites = [];
for (let i = 1; i < 3; i += 1) {
	window.fgSprites.push(loader.addImage('assets/fg/' + i + '.png'));
}
// Also create local references for this file
const bgSprites = window.bgSprites;
const fgSprites = window.fgSprites;
const CollectSprites  = [];
CollectSprites.push(loader.addImage('assets/sprites/collect/shield.png'));
CollectSprites.push(loader.addImage('assets/sprites/collect/shieldIcon.png'));
CollectSprites.push(loader.addImage('assets/sprites/collect/boosterIcon.png'));
CollectSprites.push(loader.addImage('assets/sprites/collect/coin.png'));
// New power-up sprites
CollectSprites.push(loader.addImage('assets/sprites/collect/magnet.png'));
CollectSprites.push(loader.addImage('assets/sprites/collect/doublescores.png')); // Note: using 'doublescores' as per your file
CollectSprites.push(loader.addImage('assets/sprites/collect/invincibility.png'));
CollectSprites.push(loader.addImage('assets/sprites/collect/slowmotion.png'));
CollectSprites.push(loader.addImage('assets/sprites/collect/coinrain.png'));

var audioArr = []

var bgMusic = new Howl({
  src: ['assets/audio/bgMusic.mp3'],
  loop: true,
  volume: 0.05
});
audioArr.push(bgMusic)

var clickSound = new Howl({
  src: ['assets/audio/click.mp3'],
  volume: 0.4
});
audioArr.push(clickSound)

var notEnough = new Howl({
  src: ['assets/audio/notEnough.mp3'],
  volume: 0.4
});
audioArr.push(notEnough)


var coinSound  = new Howl({
  src: ['assets/audio/coin.mp3'],
  volume: 0.6
});
audioArr.push(coinSound)

var gameOverSound  = new Howl({
  src: ['assets/audio/gameOver.wav'],
  volume: 0.8
});
audioArr.push(gameOverSound)

var storeSound  = new Howl({
  src: ['assets/audio/store.mp3'],
  volume: 0.1
});
audioArr.push(storeSound)

loader.start();

if ('mediaSession' in navigator) {
}
loader.addCompletionListener(() => {
  console.log('🎮 Loader completed, starting initialization...');
  
  // Start our slow loading simulation instead of immediately hiding
  if (typeof simulateLoadingProgress === 'function') {
    console.log('✅ Starting simulateLoadingProgress...');
    simulateLoadingProgress();
  } else {
    console.log('⚠️ simulateLoadingProgress not found, using fallback...');
    // Fallback to original behavior if our function isn't available
    window.addEventListener('load', function () {
      console.log('🎮 Fallback loader initialization...');
      
      if (pageMuted){
        autoMute()
      }
      if (( 'ontouchstart' in window ) ||
      ( navigator.maxTouchPoints > 0 ) ||
      ( navigator.msMaxTouchPoints > 0 )){
        rightButtonsBlock.classList.remove('hide')
        leftButtonsBlock.classList.remove('hide')
      }
      for (var i = 0; i < mainBgBlocks.length; i += 1){
        mainBgBlocks[i].style.backgroundImage = 'stuff/bg.png'
      }
      for (var i = 0; i < smallBtnBlocks.length; i += 1){
        smallBtnBlocks[i].style.backgroundImage = 'stuff/bg.png'
      }    
      // Show main menu and hide loader (don't toggle, set explicitly)
      if (typeof mainMenuBlock !== 'undefined') {
        mainMenuBlock.classList.remove('hide');
        console.log('✅ Main menu shown via fallback');
      }
      if (typeof loaderBlock !== 'undefined') {
        loaderBlock.classList.add('hide');
        console.log('✅ Loader hidden via fallback');
      }
      if (typeof controlBlock !== 'undefined') {
        controlBlock.classList.add('hide');
      }
      bgRatio = bgSprites[0].naturalWidth / bgSprites[0].naturalHeight;
      
      // Initialize game components after sprites are loaded
      initializeGameComponents();
      
      gameInit()
    }) 
  }
})