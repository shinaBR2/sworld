const playAudio = (player: HTMLAudioElement) => {
  if (player.paused) {
    player.play();

    return 'play';
  }

  player.pause();
  return 'pause';
};

const muteAudio = (player: HTMLAudioElement) => {
  if (player.muted) {
    player.muted = false;
    return 'unmute';
  }

  player.muted = true;
  return 'mute';
};

const loopAudio = (player: HTMLAudioElement) => {
  if (player.loop) {
    player.loop = false;
    return 'unloop';
  }

  player.loop = true;
  return 'loop';
};

const seek = (player: HTMLAudioElement, position: number) => {
  player.currentTime = position;
};

export { playAudio, muteAudio, loopAudio, seek };
