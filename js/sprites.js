// The Tower - Pixel Sprite Data
// Each sprite is a 2D array of hex color strings (or 0 for transparent)

const spriteCache = new Map();

// Draw a sprite data array to an offscreen canvas and cache it
export function getSpriteImage(spriteData, scale = 1) {
    const key = spriteData.toString() + scale;
    if (spriteCache.has(key)) return spriteCache.get(key);

    const h = spriteData.length;
    const w = spriteData[0].length;
    const canvas = document.createElement('canvas');
    canvas.width = w * scale;
    canvas.height = h * scale;
    const ctx = canvas.getContext('2d');

    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const color = spriteData[y][x];
            if (color && color !== 0) {
                ctx.fillStyle = color;
                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
        }
    }

    spriteCache.set(key, canvas);
    return canvas;
}

// Helper: create a mirrored version of sprite data
export function mirrorSprite(data) {
    return data.map(row => [...row].reverse());
}

// =====================
// PLAYER SPRITES (16x16)
// =====================
const P = '#4488ff'; // blue uniform
const Pd = '#2255aa'; // dark blue
const Sk = '#ffcc99'; // skin
const Sd = '#cc9966'; // skin dark
const H = '#333333'; // hair
const G = '#666666'; // gun metal
const Gd = '#444444'; // gun dark
const B = '#8B4513'; // boots
const Bd = '#5a2d0e'; // boots dark
const _ = 0;

export const PLAYER_DOWN = [
    [_, _, _, _, _, H, H, H, H, H, H, _, _, _, _, _],
    [_, _, _, _, H, H, H, H, H, H, H, H, _, _, _, _],
    [_, _, _, _, H, Sk, Sk, Sk, Sk, Sk, Sk, H, _, _, _, _],
    [_, _, _, _, H, Sk, '#000', Sk, Sk, '#000', Sk, H, _, _, _, _],
    [_, _, _, _, _, Sk, Sk, Sk, Sk, Sk, Sk, _, _, _, _, _],
    [_, _, _, _, _, Sk, Sd, Sk, Sk, Sd, Sk, _, _, _, _, _],
    [_, _, _, _, _, _, Sk, Sk, Sk, Sk, _, _, _, _, _, _],
    [_, _, _, _, P, P, P, P, P, P, P, P, _, _, _, _],
    [_, _, _, P, P, P, P, P, P, P, P, P, P, _, _, _],
    [_, _, _, P, Pd, P, P, P, P, P, P, Pd, P, _, _, _],
    [_, _, _, Sk, _, P, P, P, P, P, P, _, Sk, _, _, _],
    [_, _, _, _, _, P, P, P, P, P, P, _, _, _, _, _],
    [_, _, _, _, _, P, P, _, _, P, P, _, _, _, _, _],
    [_, _, _, _, _, B, B, _, _, B, B, _, _, _, _, _],
    [_, _, _, _, _, B, B, _, _, B, B, _, _, _, _, _],
    [_, _, _, _, _, Bd, Bd, _, _, Bd, Bd, _, _, _, _, _],
];

export const PLAYER_UP = [
    [_, _, _, _, _, H, H, H, H, H, H, _, _, _, _, _],
    [_, _, _, _, H, H, H, H, H, H, H, H, _, _, _, _],
    [_, _, _, _, H, H, H, H, H, H, H, H, _, _, _, _],
    [_, _, _, _, H, H, H, H, H, H, H, H, _, _, _, _],
    [_, _, _, _, _, H, H, H, H, H, H, _, _, _, _, _],
    [_, _, _, _, _, Sk, H, H, H, H, Sk, _, _, _, _, _],
    [_, _, _, _, _, _, Sk, Sk, Sk, Sk, _, _, _, _, _, _],
    [_, _, _, _, P, P, P, P, P, P, P, P, _, _, _, _],
    [_, _, _, P, P, P, P, P, P, P, P, P, P, _, _, _],
    [_, _, _, P, Pd, P, P, P, P, P, P, Pd, P, _, _, _],
    [_, _, _, Sk, _, P, P, P, P, P, P, _, Sk, _, _, _],
    [_, _, _, _, _, P, P, P, P, P, P, _, _, _, _, _],
    [_, _, _, _, _, P, P, _, _, P, P, _, _, _, _, _],
    [_, _, _, _, _, B, B, _, _, B, B, _, _, _, _, _],
    [_, _, _, _, _, B, B, _, _, B, B, _, _, _, _, _],
    [_, _, _, _, _, Bd, Bd, _, _, Bd, Bd, _, _, _, _, _],
];

export const PLAYER_RIGHT = [
    [_, _, _, _, _, H, H, H, H, H, _, _, _, _, _, _],
    [_, _, _, _, H, H, H, H, H, H, H, _, _, _, _, _],
    [_, _, _, _, H, H, H, H, Sk, Sk, H, _, _, _, _, _],
    [_, _, _, _, _, H, H, Sk, '#000', Sk, Sk, _, _, _, _, _],
    [_, _, _, _, _, H, H, Sk, Sk, Sk, Sk, _, _, _, _, _],
    [_, _, _, _, _, _, Sk, Sk, Sd, Sk, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, Sk, Sk, _, _, _, _, _, _, _],
    [_, _, _, _, _, P, P, P, P, P, G, _, _, _, _, _],
    [_, _, _, _, P, P, P, P, P, P, G, G, _, _, _, _],
    [_, _, _, _, P, P, P, P, P, P, P, G, _, _, _, _],
    [_, _, _, _, _, P, P, P, P, P, Sk, _, _, _, _, _],
    [_, _, _, _, _, P, P, P, P, P, _, _, _, _, _, _],
    [_, _, _, _, _, _, P, P, P, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, B, B, B, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, B, B, B, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, Bd, _, Bd, _, _, _, _, _, _, _],
];

export const PLAYER_LEFT = mirrorSprite(PLAYER_RIGHT);

export const PLAYER_SPRITES = [PLAYER_UP, PLAYER_RIGHT, PLAYER_DOWN, PLAYER_LEFT];

// =====================
// HEART SPRITE (16x16)
// =====================
const R = '#ff0000';
const Rd = '#cc0000';
const Rl = '#ff4444';

export const HEART_SPRITE = [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, R, R, _, _, _, _, _, _, R, R, _, _, _],
    [_, _, R, Rl, R, R, _, _, _, _, R, Rl, R, R, _, _],
    [_, R, Rl, Rl, R, R, R, _, _, R, R, Rl, R, R, R, _],
    [_, R, Rl, R, R, R, R, R, R, R, R, R, R, R, R, _],
    [_, R, R, R, R, R, R, R, R, R, R, R, R, R, R, _],
    [_, R, R, R, R, R, R, R, R, R, R, R, R, R, R, _],
    [_, _, R, R, R, R, R, R, R, R, R, R, R, R, _, _],
    [_, _, _, R, R, R, R, R, R, R, R, R, R, _, _, _],
    [_, _, _, _, R, R, R, R, R, R, R, R, _, _, _, _],
    [_, _, _, _, _, R, R, R, R, R, R, _, _, _, _, _],
    [_, _, _, _, _, _, R, R, R, R, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, Rd, Rd, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// Small heart for HUD (8x8)
export const HEART_SMALL = [
    [_, R, R, _, _, R, R, _],
    [R, Rl, R, R, R, Rl, R, R],
    [R, R, R, R, R, R, R, R],
    [R, R, R, R, R, R, R, R],
    [_, R, R, R, R, R, R, _],
    [_, _, R, R, R, R, _, _],
    [_, _, _, R, R, _, _, _],
    [_, _, _, _, _, _, _, _],
];

// Empty heart for HUD (8x8)
export const HEART_EMPTY = [
    [_, '#444', '#444', _, _, '#444', '#444', _],
    ['#444', '#333', '#444', '#444', '#444', '#333', '#444', '#444'],
    ['#444', '#333', '#333', '#333', '#333', '#333', '#333', '#444'],
    ['#444', '#333', '#333', '#333', '#333', '#333', '#333', '#444'],
    [_, '#444', '#333', '#333', '#333', '#333', '#444', _],
    [_, _, '#444', '#333', '#333', '#444', _, _],
    [_, _, _, '#444', '#444', _, _, _],
    [_, _, _, _, _, _, _, _],
];

// =====================
// BULLET PACK SPRITE (16x16) - ammo crate
// =====================
const W = '#8B6914'; // wood dark
const Wl = '#C8A028'; // wood light
const Wm = '#A07820'; // wood mid
const Am = '#FFD700'; // ammo yellow
const Ab = '#DAA520'; // ammo dark

export const BULLET_PACK_SPRITE = [
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, W, W, W, W, W, W, W, W, W, W, W, W, W, W, _],
    [_, W, Wl, Wl, Wl, Wl, Wl, Wl, Wl, Wl, Wl, Wl, Wl, Wl, W, _],
    [_, W, Wl, W, W, W, W, W, W, W, W, W, W, Wl, W, _],
    [_, W, Wl, W, Am, Am, Am, Am, Am, Am, Am, Am, W, Wl, W, _],
    [_, W, Wl, W, Ab, Ab, Am, Ab, Ab, Am, Ab, Ab, W, Wl, W, _],
    [_, W, Wl, W, Ab, Am, Am, Am, Am, Am, Am, Ab, W, Wl, W, _],
    [_, W, Wm, W, Am, Am, Am, Am, Am, Am, Am, Am, W, Wm, W, _],
    [_, W, Wm, W, Ab, Ab, Am, Ab, Ab, Am, Ab, Ab, W, Wm, W, _],
    [_, W, Wm, W, Ab, Am, Am, Am, Am, Am, Am, Ab, W, Wm, W, _],
    [_, W, Wm, W, Am, Am, Am, Am, Am, Am, Am, Am, W, Wm, W, _],
    [_, W, Wm, W, W, W, W, W, W, W, W, W, W, Wm, W, _],
    [_, W, Wm, Wm, Wm, Wm, Wm, Wm, Wm, Wm, Wm, Wm, Wm, Wm, W, _],
    [_, W, W, W, W, W, W, W, W, W, W, W, W, W, W, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _, _, _, _, _, _, _, _, _],
];

// =====================
// BULLET SPRITES
// =====================
export const BULLET_SPRITE = [
    ['#ffff00', '#ffff88'],
    ['#ffff88', '#ffff00'],
];

export const BOSS_BULLET_SPRITE = [
    [_, '#ff0066', '#ff0066', _],
    ['#ff0066', '#ff4488', '#ff4488', '#ff0066'],
    ['#ff0066', '#ff4488', '#ff4488', '#ff0066'],
    [_, '#ff0066', '#ff0066', _],
];

// =====================
// MONSTER SPRITES (16x16) - Per theme
// =====================

// Generate a simple monster sprite from a template with color palette
function makeMonsterSprite(template, colors) {
    return template.map(row => row.map(pixel => {
        if (pixel === 0) return 0;
        return colors[pixel] || pixel;
    }));
}

// Monster templates (using color indices 1-5)
const TEMPLATE_SMALL = [ // rat/small creature
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0],
    [0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0],
    [0,0,1,2,1,1,1,1,1,1,1,1,2,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,3,1,1,3,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,0,1,0,0,1,0,1,0,0,0,0],
    [0,0,0,0,1,0,1,0,0,1,0,1,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const TEMPLATE_FLYING = [ // bat/flying creature
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,1,1,0,0,0,0,0,0,0,0,0,0,1,1,0],
    [1,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1],
    [1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,1,1,2,1,1,1,1,2,1,1,0,0,0],
    [0,0,0,0,1,1,1,3,3,1,1,1,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const TEMPLATE_HUMANOID = [ // goblin/knight/guard
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,0,1,2,1,1,1,1,2,1,0,0,0,0],
    [0,0,0,0,1,1,1,3,3,1,1,1,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,4,4,4,4,4,4,4,4,4,4,0,0,0],
    [0,0,0,4,4,4,4,4,4,4,4,4,4,0,0,0],
    [0,0,0,5,0,4,4,4,4,4,4,0,5,0,0,0],
    [0,0,0,0,0,4,4,4,4,4,4,0,0,0,0,0],
    [0,0,0,0,0,4,4,0,0,4,4,0,0,0,0,0],
    [0,0,0,0,0,5,5,0,0,5,5,0,0,0,0,0],
    [0,0,0,0,0,5,5,0,0,5,5,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const TEMPLATE_BLOB = [ // slime/elemental
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,1,2,1,1,1,1,2,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,3,3,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
    [0,1,4,1,1,1,1,1,1,1,1,1,1,4,1,0],
    [0,0,4,4,1,1,1,1,1,1,1,1,4,4,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

const TEMPLATE_SNAKE = [ // snake/serpent
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,1,2,1,1,2,1,0,0,0,0,0,0,0],
    [0,0,0,1,1,3,3,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,1,1,0,0,1,1,1,0,0,0,0,0,0],
    [0,0,1,1,0,0,0,0,1,1,1,1,1,0,0,0],
    [0,1,1,0,0,0,0,0,0,0,1,1,1,1,0,0],
    [0,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Boss template (32x32)
const TEMPLATE_BOSS_LARGE = [
    [0,0,0,0,0,0,0,0,0,0,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0],
    [0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0],
    [0,0,0,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,2,2,2,2,1,1,1,1,1,1,1,1,2,2,2,2,1,1,1,1,1,0,0,0],
    [0,0,1,1,1,1,1,1,2,2,2,2,1,1,1,1,1,1,1,1,2,2,2,2,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,1,1,1,2,2,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,1,1,1,1,1,1,1,1,1,1,1,3,3,3,3,3,3,1,1,1,1,1,1,1,1,1,1,1,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,1,3,3,3,3,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0],
    [0,0,0,0,1,1,1,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,1,1,1,0,0,0,0],
    [0,0,0,0,1,1,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,4,4,4,4,1,1,0,0,0,0],
    [0,0,0,0,0,1,4,4,4,4,1,1,1,1,1,1,1,1,1,1,1,1,4,4,4,4,1,0,0,0,0,0],
    [0,0,0,0,0,1,1,4,4,1,1,1,1,1,1,1,1,1,1,1,1,1,1,4,4,1,1,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,1,1,1,5,5,1,1,1,1,1,1,5,5,1,1,1,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,1,5,5,5,5,1,1,1,1,5,5,5,5,1,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,5,5,5,5,0,0,0,0,5,5,5,5,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,5,5,5,5,0,0,0,0,5,5,5,5,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,5,5,0,0,0,0,0,0,5,5,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// Color palettes for each floor's monsters: { 1: body, 2: eyes, 3: mouth/detail, 4: secondary, 5: feet/hands }
const FLOOR_PALETTES = [
    // Floor 1: Dungeon - Rat & Bat
    [
        { 1: '#8B7355', 2: '#ff0000', 3: '#ffcccc', 4: '#6B5335', 5: '#4a3a2a' },
        { 1: '#4a3a4a', 2: '#ff4444', 3: '#aa3333', 4: '#3a2a3a', 5: '#2a1a2a' },
    ],
    // Floor 2: Sewers - Slime & Croc
    [
        { 1: '#44aa44', 2: '#ffffff', 3: '#226622', 4: '#338833', 5: '#227722' },
        { 1: '#556b2f', 2: '#ffff00', 3: '#ffffff', 4: '#3a4a1f', 5: '#2a3a0f' },
    ],
    // Floor 3: Forest - Wolf & Goblin
    [
        { 1: '#888888', 2: '#ffff00', 3: '#ffffff', 4: '#666666', 5: '#444444' },
        { 1: '#228B22', 2: '#ff0000', 3: '#ffcc00', 4: '#8B4513', 5: '#654321' },
    ],
    // Floor 4: Graveyard - Skeleton & Zombie
    [
        { 1: '#dddddd', 2: '#000000', 3: '#aaaaaa', 4: '#cccccc', 5: '#bbbbbb' },
        { 1: '#5a7a5a', 2: '#ff0000', 3: '#3a5a3a', 4: '#4a6a4a', 5: '#3a4a3a' },
    ],
    // Floor 5: Ice Cave - Ice Elem & Frost Wolf
    [
        { 1: '#aaddff', 2: '#0000ff', 3: '#88bbee', 4: '#77aadd', 5: '#5599cc' },
        { 1: '#ccddee', 2: '#4444ff', 3: '#ffffff', 4: '#aabbcc', 5: '#8899aa' },
    ],
    // Floor 6: Volcano - Fire Imp & Lava Snake
    [
        { 1: '#ff4400', 2: '#ffff00', 3: '#ff8800', 4: '#cc3300', 5: '#aa2200' },
        { 1: '#ff6600', 2: '#ffff00', 3: '#ff0000', 4: '#cc4400', 5: '#aa3300' },
    ],
    // Floor 7: Swamp - Bog Creature & Toxic Frog
    [
        { 1: '#5a6a3a', 2: '#ccff00', 3: '#4a5a2a', 4: '#3a4a1a', 5: '#2a3a0a' },
        { 1: '#00cc44', 2: '#ff0000', 3: '#00aa33', 4: '#009922', 5: '#008811' },
    ],
    // Floor 8: Sky Castle - Harpy & Cloud Spirit
    [
        { 1: '#dda0dd', 2: '#ff00ff', 3: '#ffccdd', 4: '#cc90cc', 5: '#bb80bb' },
        { 1: '#e0e8ff', 2: '#4444ff', 3: '#c0c8ee', 4: '#b0b8dd', 5: '#a0a8cc' },
    ],
    // Floor 9: Shadow Realm - Dark Knight & Wraith
    [
        { 1: '#333344', 2: '#ff0000', 3: '#555566', 4: '#222233', 5: '#111122' },
        { 1: '#442266', 2: '#ff44ff', 3: '#551177', 4: '#331155', 5: '#220044' },
    ],
    // Floor 10: Throne Room - Elite Guard & Dark Wizard
    [
        { 1: '#C0C0C0', 2: '#ff0000', 3: '#A0A0A0', 4: '#DAA520', 5: '#8B6914' },
        { 1: '#4B0082', 2: '#00ff00', 3: '#6A0DAD', 4: '#3a006a', 5: '#2a004a' },
    ],
];

// Boss palettes
const BOSS_PALETTES = [
    { 1: '#333333', 2: '#ff0000', 3: '#ff4444', 4: '#222222', 5: '#111111' }, // Giant Spider
    { 1: '#4a6a2a', 2: '#ffff00', 3: '#ffffff', 4: '#3a5a1a', 5: '#2a4a0a' }, // Sewer Beast
    { 1: '#5a3a1a', 2: '#00ff00', 3: '#3a8a2a', 4: '#4a2a0a', 5: '#3a1a00' }, // Treant
    { 1: '#6a4a8a', 2: '#00ffff', 3: '#aa66cc', 4: '#5a3a7a', 5: '#4a2a6a' }, // Lich
    { 1: '#8899bb', 2: '#0044ff', 3: '#aabbdd', 4: '#6677aa', 5: '#556699' }, // Frost Giant
    { 1: '#cc2200', 2: '#ffff00', 3: '#ff6600', 4: '#aa1100', 5: '#880000' }, // Fire Dragon
    { 1: '#3a5a2a', 2: '#ccff00', 3: '#5a7a3a', 4: '#2a4a1a', 5: '#1a3a0a' }, // Swamp Hydra
    { 1: '#888899', 2: '#ffff00', 3: '#aaaacc', 4: '#666677', 5: '#555566' }, // Storm Eagle
    { 1: '#220033', 2: '#ff00ff', 3: '#440066', 4: '#110022', 5: '#000011' }, // Shadow Lord
    { 1: '#aa0000', 2: '#ffcc00', 3: '#ff4444', 4: '#880000', 5: '#660000' }, // Dark King
];

// Templates per floor: [monsterType1Template, monsterType2Template]
const FLOOR_TEMPLATES = [
    [TEMPLATE_SMALL, TEMPLATE_FLYING],       // Dungeon: Rat, Bat
    [TEMPLATE_BLOB, TEMPLATE_SNAKE],         // Sewers: Slime, Croc
    [TEMPLATE_SMALL, TEMPLATE_HUMANOID],     // Forest: Wolf, Goblin
    [TEMPLATE_HUMANOID, TEMPLATE_HUMANOID],  // Graveyard: Skeleton, Zombie
    [TEMPLATE_BLOB, TEMPLATE_SMALL],         // Ice Cave: Ice Elem, Frost Wolf
    [TEMPLATE_HUMANOID, TEMPLATE_SNAKE],     // Volcano: Fire Imp, Lava Snake
    [TEMPLATE_BLOB, TEMPLATE_SMALL],         // Swamp: Bog Thing, Toxic Frog
    [TEMPLATE_FLYING, TEMPLATE_BLOB],        // Sky Castle: Harpy, Cloud Spirit
    [TEMPLATE_HUMANOID, TEMPLATE_FLYING],    // Shadow Realm: Dark Knight, Wraith
    [TEMPLATE_HUMANOID, TEMPLATE_HUMANOID],  // Throne Room: Elite Guard, Dark Wizard
];

// Pre-generate all monster sprites
export function getMonsterSprites(floorIndex) {
    const templates = FLOOR_TEMPLATES[floorIndex];
    const palettes = FLOOR_PALETTES[floorIndex];
    return [
        makeMonsterSprite(templates[0], palettes[0]),
        makeMonsterSprite(templates[1], palettes[1]),
    ];
}

export function getBossSprite(floorIndex) {
    return makeMonsterSprite(TEMPLATE_BOSS_LARGE, BOSS_PALETTES[floorIndex]);
}

// =====================
// TILE SPRITES
// =====================
export function makeWallTile(color, accent) {
    const c = color;
    const a = accent;
    const d = darkenColor(color, 0.7);
    return [
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,a],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,a],
        [c,c,d,c,c,c,c,d,c,c,c,c,d,c,c,a],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,a],
        [a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,a],
        [c,c,c,c,d,c,c,c,c,c,d,c,c,c,c,a],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,a],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,a],
        [a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,a],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,a],
        [c,d,c,c,c,c,d,c,c,c,c,c,c,d,c,a],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,a],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,a],
        [a,a,a,a,a,a,a,a,a,a,a,a,a,a,a,a],
    ];
}

export function makeFloorTile(color) {
    const c = color;
    const l = lightenColor(color, 1.15);
    const d = darkenColor(color, 0.85);
    return [
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,c],
        [c,l,c,c,c,c,c,c,c,c,c,c,c,c,c,c],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,c],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,c],
        [c,c,c,c,d,c,c,c,c,c,c,c,c,c,c,c],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,c],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,c],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,c],
        [c,c,c,c,c,c,c,c,c,l,c,c,c,c,c,c],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,c],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,c],
        [c,c,c,c,c,c,c,c,c,c,c,c,d,c,c,c],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,c],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,c],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,c],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,c],
    ];
}

// Door sprite (16x16)
export function makeDoorTile(color) {
    const c = color;
    const d = darkenColor(color, 0.6);
    return [
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,c],
        [c,d,d,d,d,d,d,d,d,d,d,d,d,d,d,c],
        [c,d,d,d,d,d,d,d,d,d,d,d,d,d,d,c],
        [c,d,d,c,c,c,c,c,c,c,c,c,c,d,d,c],
        [c,d,d,c,d,d,d,d,d,d,d,d,c,d,d,c],
        [c,d,d,c,d,d,d,d,d,d,d,d,c,d,d,c],
        [c,d,d,c,d,d,d,d,d,d,d,d,c,d,d,c],
        [c,d,d,c,d,d,d,d,d,d,d,d,c,d,d,c],
        [c,d,d,c,d,d,d,d,d,d,d,d,c,d,d,c],
        [c,d,d,c,d,d,d,'#DAA520',d,d,d,d,c,d,d,c],
        [c,d,d,c,d,d,d,d,d,d,d,d,c,d,d,c],
        [c,d,d,c,d,d,d,d,d,d,d,d,c,d,d,c],
        [c,d,d,c,d,d,d,d,d,d,d,d,c,d,d,c],
        [c,d,d,c,c,c,c,c,c,c,c,c,c,d,d,c],
        [c,d,d,d,d,d,d,d,d,d,d,d,d,d,d,c],
        [c,c,c,c,c,c,c,c,c,c,c,c,c,c,c,c],
    ];
}

// Princess sprite (16x16)
export const PRINCESS_SPRITE = [
    [_,_,_,_,_,'#FFD700','#FFD700','#FFD700','#FFD700','#FFD700','#FFD700',_,_,_,_,_],
    [_,_,_,_,'#FFD700','#FFD700','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FFD700','#FFD700',_,_,_,_],
    [_,_,_,_,'#FFD700','#8B6914','#8B6914','#8B6914','#8B6914','#8B6914','#8B6914','#FFD700',_,_,_,_],
    [_,_,_,_,_,'#8B6914','#8B6914','#8B6914','#8B6914','#8B6914','#8B6914',_,_,_,_,_],
    [_,_,_,_,_,Sk,Sk,Sk,Sk,Sk,Sk,_,_,_,_,_],
    [_,_,_,_,_,Sk,'#0000aa',Sk,Sk,'#0000aa',Sk,_,_,_,_,_],
    [_,_,_,_,_,Sk,Sk,Sk,Sk,Sk,Sk,_,_,_,_,_],
    [_,_,_,_,_,_,Sk,'#ff6688',Sk,_,_,_,_,_,_,_],
    [_,_,_,'#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4',_,_,_,_],
    [_,_,'#FF69B4','#FF69B4','#FF1493','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF1493','#FF69B4','#FF69B4',_,_,_],
    [_,_,'#FF69B4','#FF1493','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF1493','#FF69B4',_,_,_],
    [_,_,_,'#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4',_,_,_,_],
    [_,_,_,'#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4',_,_,_,_],
    [_,_,_,_,'#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4','#FF69B4',_,_,_,_],
    [_,_,_,_,_,'#FF69B4','#FF69B4',_,_,'#FF69B4','#FF69B4',_,_,_,_,_],
    [_,_,_,_,_,'#FF1493','#FF1493',_,_,'#FF1493','#FF1493',_,_,_,_,_],
];

// =====================
// COLOR HELPERS
// =====================
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b].map(x => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

export function darkenColor(hex, factor) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(r * factor, g * factor, b * factor);
}

export function lightenColor(hex, factor) {
    const { r, g, b } = hexToRgb(hex);
    return rgbToHex(Math.min(255, r * factor), Math.min(255, g * factor), Math.min(255, b * factor));
}
