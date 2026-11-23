export type SoundType =
  | 'swing'
  | 'punch'
  | 'kick'
  | 'block'
  | 'parry'
  | 'guard_break'
  | 'dash'
  | 'tech'
  | 'throw'
  | 'ex'
  | 'thunder'
  | 'explosion'
  | 'laser'
  | 'clash'
  | 'special'
  | 'cinematic'
  | 'final_rush'
  | 'shield'
  | 'victory'
  | 'ko';

const AudioContextClass =
  typeof window !== 'undefined'
    ? window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    : undefined;

let audioCtx: AudioContext | null = null;
let softNoiseBuffer: AudioBuffer | null = null;

function ensureAudioContext(): AudioContext | null {
  if (!AudioContextClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioContextClass();
    const bufferSize = audioCtx.sampleRate * 0.5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = (lastOut + 0.04 * white) / 1.04;
      lastOut = data[i];
      data[i] *= 2.5;
    }
    softNoiseBuffer = buffer;
  }
  return audioCtx;
}

export function playSound(type: SoundType, isMuted: boolean): void {
  if (isMuted) return;
  try {
    const ctx = ensureAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      void ctx.resume();
    }
    const now = ctx.currentTime;

    if (type === 'swing' && softNoiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = softNoiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(380, now);
      filter.frequency.exponentialRampToValueAtTime(110, now + 0.14);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.14);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.14);
    } else if (type === 'dash' && softNoiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = softNoiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, now);
      filter.frequency.exponentialRampToValueAtTime(220, now + 0.16);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.16);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.16);
    } else if (type === 'punch' || type === 'kick' || type === 'throw') {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = type === 'throw' ? 'triangle' : 'sine';
      const startFreq = type === 'throw' ? 140 : type === 'kick' ? 98 : 122;
      const dur = type === 'throw' ? 0.22 : 0.15;
      osc.frequency.setValueAtTime(startFreq, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + dur);
      oscGain.gain.setValueAtTime(type === 'throw' ? 0.34 : 0.3, now);
      oscGain.gain.exponentialRampToValueAtTime(0.005, now + dur);
      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + dur);
    } else if (type === 'block') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.1);
      gain.gain.setValueAtTime(0.19, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'parry') {
      [780, 1180].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.02);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.15, now + 0.22);
        gain.gain.setValueAtTime(0.14, now + idx * 0.02);
        gain.gain.exponentialRampToValueAtTime(0.004, now + 0.24);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.02);
        osc.stop(now + 0.25);
      });
    } else if (type === 'guard_break') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(65, now + 0.34);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.004, now + 0.34);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.34);
    } else if (type === 'tech' || type === 'shield') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(type === 'shield' ? 440 : 520, now);
      osc.frequency.exponentialRampToValueAtTime(type === 'shield' ? 660 : 880, now + 0.18);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.18);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.18);
    } else if (type === 'ex') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(640, now + 0.24);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.004, now + 0.24);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.24);
    } else if ((type === 'thunder' || type === 'explosion' || type === 'laser') && softNoiseBuffer) {
      const noise = ctx.createBufferSource();
      noise.buffer = softNoiseBuffer;
      const filter = ctx.createBiquadFilter();
      filter.type = type === 'laser' ? 'bandpass' : 'lowpass';
      filter.frequency.setValueAtTime(type === 'laser' ? 920 : 220, now);
      filter.frequency.exponentialRampToValueAtTime(type === 'laser' ? 340 : 50, now + 0.42);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.42);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.42);
    } else if (type === 'clash' || type === 'special' || type === 'cinematic') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(type === 'cinematic' ? 520 : 380, now + 0.35);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'final_rush') {
      [220, 330].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + idx * 0.14 + 0.12);
        gain.gain.setValueAtTime(0.14, now + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.004, now + idx * 0.14 + 0.13);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.13);
      });
    } else if (type === 'victory') {
      [392, 493.88, 587.33, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        const start = now + idx * 0.09;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.004, start + 0.38);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.38);
      });
    } else if (type === 'ko') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(110, now);
      osc.frequency.exponentialRampToValueAtTime(28, now + 0.65);
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.005, now + 0.65);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.65);
    }
  } catch {
    // Ignore Web Audio errors prior to user interaction
  }
}
