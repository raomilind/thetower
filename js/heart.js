// The Tower - Heart Pickup

import { GAME_AREA_Y, NATIVE_WIDTH, NATIVE_HEIGHT } from './constants.js';

export const heart = {
    x: 0,
    y: 0,
    width: 16,
    height: 16,
    active: false,
    bobTimer: 0,
    bobOffset: 0,
};

export function spawnHeart(x, y) {
    heart.x = x - 8;
    heart.y = y - 8;
    heart.active = true;
    heart.bobTimer = 0;
}

export function updateHeart() {
    if (!heart.active) return;
    heart.bobTimer++;
    heart.bobOffset = Math.sin(heart.bobTimer * 0.1) * 2;
}

export function collectHeart() {
    heart.active = false;
}

export function clearHeart() {
    heart.active = false;
}
