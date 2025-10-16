let ysdk;

// Guard: only initialize Yandex SDK when actually embedded in a Yandex container/iframe
function isYandexContainer() {
  try {
    const hasParent = typeof window !== 'undefined' && window.parent && window.parent !== window;
    const ref = (typeof document !== 'undefined' && document.referrer) ? document.referrer : '';
    const onYandexHost = /yandex\./i.test(ref) || /yandex\./i.test(location.hostname || '');
    const hasSDK = typeof window !== 'undefined' && typeof window.YaGames !== 'undefined';
    return hasSDK && (hasParent || onYandexHost);
  } catch (_) {
    return false;
  }
}


function showFullAdd() {
  if (!ysdk || !ysdk.adv || typeof ysdk.adv.showFullscreenAdv !== 'function') {
    try { console.debug('[yandex] fullscreen adv skipped (SDK not available)'); } catch(_) {}
    return;
  }
  ysdk.adv.showFullscreenAdv({
    callbacks: {
      onClose: function (wasShown) {
        // some action after close
      },
      onError: function (error) {
        // some action on error
      }
    }
  })
}

function showRevawardVideo(getReward) {
  if (!ysdk || !ysdk.adv || typeof ysdk.adv.showRewardedVideo !== 'function') {
    try { console.debug('[yandex] rewarded video skipped (SDK not available)'); } catch(_) {}
    // Gracefully grant reward if desired in non-Yandex env; keep behavior as-is for now
    return;
  }
  ysdk.adv.showRewardedVideo({
    callbacks: {
      onOpen: () => {
        
      },
      onRewarded: () => {
        
      },
      onClose: () => {
        getReward()
      },
      onError: (e) => {
        console.log('Error while open video ad:', e);
      }
    }
  })
}

const addCoins = () => {
  myCoins = Number(myCoins) + 100;
  localStorage.setItem('myCoins', myCoins)
  storeCoinsText.innerText = Number(myCoins);
  mainCoinBlock.innerText = Number(myCoins);

  coinSound.play()
}

const saveMe = () => {
  player.rise = true;
  gameOver = false;
  stopGame = false;
  player.dead = false;
  toggleHide(gameOverBlock)
  toggleHide(pauseButton)
  toggleHide(scoreBlock)
  toggleHide(coinsBlock)
  player.shield = true
  activeTime = 1;
  Start();
  canvas.focus()
  bgMusic.play()
}

function gameInit() {
  if (!isYandexContainer()) {
    // Not running inside Yandex container: skip SDK init to avoid postMessage errors
    return;
  }
  YaGames
    .init()
    .then(_sdk => {
      ysdk = _sdk;
      ysdk.features.LoadingAPI?.ready(); // Показываем SDK, что игра загрузилась и можно начинать играть
    })
    .catch(() => {
      // Swallow errors in non-Yandex environments
    })
}