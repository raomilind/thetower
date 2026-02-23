// The Tower - Main Game Loop

import { initInput, clearJustPressed } from './input.js';
import { initRenderer, render } from './renderer.js';
import { initAudio } from './audio.js';
import { getCurrentState, getStateData, updateState } from './state.js';

let lastTime = 0;
const TARGET_FPS = 60;
const FRAME_TIME = 1000 / TARGET_FPS;

function init() {
    initInput();
    initRenderer();
    initAudio();
    requestAnimationFrame(gameLoop);
}

function gameLoop(timestamp) {
    const delta = timestamp - lastTime;

    if (delta >= FRAME_TIME) {
        lastTime = timestamp - (delta % FRAME_TIME);

        // Update
        updateState();

        // Render
        render(getCurrentState(), getStateData());

        // Clear just-pressed keys after frame
        clearJustPressed();
    }

    requestAnimationFrame(gameLoop);
}

// Start when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
