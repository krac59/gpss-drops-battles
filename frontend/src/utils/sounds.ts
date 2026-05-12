const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

const playBeep = (frequency: number, duration: number) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.frequency.value = frequency;
  gainNode.gain.value = 0.1;
  oscillator.start();
  setTimeout(() => oscillator.stop(), duration);
};

export const playSound = (type: 'spin' | 'win' | 'bet' | 'tap') => {
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
  switch (type) {
    case 'spin':
      playBeep(880, 200);
      break;
    case 'win':
      playBeep(440, 300);
      playBeep(880, 300);
      break;
    case 'bet':
      playBeep(660, 150);
      break;
    case 'tap':
      playBeep(220, 50);
      break;
  }
};