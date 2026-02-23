// The Tower - 8-Bit Audio (Web Audio API)

let audioCtx = null;
let masterGain = null;

export function initAudio() {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.3;
    masterGain.connect(audioCtx.destination);
}

export function resumeAudio() {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playTone(freq, duration, type = 'square', volume = 0.3) {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + duration);
}

function playNotes(notes, baseTime = 0) {
    if (!audioCtx) return;
    const t = audioCtx.currentTime + baseTime;
    notes.forEach(([freq, start, duration, type, volume]) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type || 'square';
        osc.frequency.value = freq;
        gain.gain.value = volume || 0.2;
        gain.gain.exponentialRampToValueAtTime(0.001, t + start + duration);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(t + start);
        osc.stop(t + start + duration);
    });
}

// Sound effects
export function sfxShoot() {
    playTone(880, 0.08, 'square', 0.15);
    playTone(1100, 0.05, 'square', 0.1);
}

export function sfxMonsterDeath() {
    playNotes([
        [400, 0, 0.08, 'square', 0.2],
        [300, 0.05, 0.08, 'square', 0.15],
        [200, 0.1, 0.12, 'square', 0.1],
    ]);
}

export function sfxBossHit() {
    playNotes([
        [150, 0, 0.1, 'sawtooth', 0.25],
        [100, 0.05, 0.15, 'sawtooth', 0.2],
    ]);
}

export function sfxBossDeath() {
    playNotes([
        [300, 0, 0.15, 'sawtooth', 0.3],
        [250, 0.1, 0.15, 'sawtooth', 0.25],
        [200, 0.2, 0.15, 'sawtooth', 0.2],
        [150, 0.3, 0.2, 'square', 0.2],
        [100, 0.4, 0.3, 'square', 0.15],
        [80, 0.5, 0.4, 'sawtooth', 0.1],
    ]);
}

export function sfxPlayerHit() {
    playNotes([
        [100, 0, 0.15, 'sawtooth', 0.3],
        [80, 0.1, 0.2, 'sawtooth', 0.2],
    ]);
}

export function sfxHeartPickup() {
    playNotes([
        [523, 0, 0.1, 'square', 0.2],
        [659, 0.08, 0.1, 'square', 0.2],
        [784, 0.16, 0.15, 'square', 0.2],
    ]);
}

export function sfxRoomClear() {
    playNotes([
        [523, 0, 0.12, 'square', 0.25],
        [659, 0.1, 0.12, 'square', 0.25],
        [784, 0.2, 0.12, 'square', 0.25],
        [1047, 0.3, 0.2, 'square', 0.3],
    ]);
}

export function sfxFloorClear() {
    playNotes([
        [523, 0, 0.15, 'square', 0.3],
        [659, 0.12, 0.15, 'square', 0.3],
        [784, 0.24, 0.15, 'square', 0.3],
        [1047, 0.36, 0.2, 'square', 0.3],
        [1175, 0.5, 0.15, 'square', 0.3],
        [1319, 0.62, 0.15, 'square', 0.3],
        [1568, 0.74, 0.3, 'square', 0.35],
    ]);
}

export function sfxGameOver() {
    playNotes([
        [400, 0, 0.2, 'square', 0.25],
        [350, 0.2, 0.2, 'square', 0.25],
        [300, 0.4, 0.2, 'square', 0.25],
        [250, 0.6, 0.3, 'sawtooth', 0.2],
        [200, 0.8, 0.4, 'sawtooth', 0.15],
    ]);
}

export function sfxVictory() {
    playNotes([
        [523, 0, 0.15, 'square', 0.3],
        [523, 0.15, 0.15, 'square', 0.3],
        [523, 0.3, 0.15, 'square', 0.3],
        [659, 0.45, 0.3, 'square', 0.3],
        [784, 0.75, 0.15, 'square', 0.3],
        [784, 0.9, 0.15, 'square', 0.3],
        [880, 1.05, 0.15, 'square', 0.3],
        [784, 1.2, 0.3, 'square', 0.3],
        [1047, 1.5, 0.5, 'square', 0.35],
    ]);
}

export function sfxSelect() {
    playTone(660, 0.08, 'square', 0.15);
}

export function sfxBossShoot() {
    playNotes([
        [200, 0, 0.1, 'sawtooth', 0.15],
        [250, 0.05, 0.08, 'sawtooth', 0.1],
    ]);
}
