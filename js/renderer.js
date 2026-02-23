// The Tower - Renderer

import { NATIVE_WIDTH, NATIVE_HEIGHT, SCALE, TILE_SIZE, GAME_AREA_Y, ROOM_COLS, ROOM_ROWS, BOSS_HP, PLAYER_MAX_LIVES, MAX_AMMO, STATE, DIR, ROOMS_PER_FLOOR, TOTAL_FLOORS } from './constants.js';
import { getSpriteImage, PLAYER_SPRITES, HEART_SPRITE, HEART_SMALL, HEART_EMPTY, BULLET_SPRITE, BOSS_BULLET_SPRITE, BULLET_PACK_SPRITE, PRINCESS_SPRITE, makeWallTile, makeFloorTile, makeDoorTile } from './sprites.js';
import { player } from './player.js';
import { bullets } from './bullet.js';
import { monsters } from './monster.js';
import { boss } from './boss.js';
import { heart } from './heart.js';
import { bulletPacks } from './bulletpack.js';
import { getMonsterSprites, getBossSprite } from './sprites.js';
import { getCurrentFloor, getCurrentFloorIndex, getCurrentRoom, gameProgress, isBossRoom } from './floor.js';

let canvas, ctx;
let nativeCanvas, nativeCtx;

// Tile caches per floor
let wallTileCache = null;
let floorTileCache = null;
let doorTileCache = null;
let currentFloorCacheIdx = -1;

export function initRenderer() {
    canvas = document.getElementById('gameCanvas');
    canvas.width = NATIVE_WIDTH * SCALE;
    canvas.height = NATIVE_HEIGHT * SCALE;
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Native resolution offscreen canvas
    nativeCanvas = document.createElement('canvas');
    nativeCanvas.width = NATIVE_WIDTH;
    nativeCanvas.height = NATIVE_HEIGHT;
    nativeCtx = nativeCanvas.getContext('2d');
    nativeCtx.imageSmoothingEnabled = false;
}

function updateTileCache() {
    const floorIdx = getCurrentFloorIndex();
    if (floorIdx === currentFloorCacheIdx) return;
    currentFloorCacheIdx = floorIdx;

    const floor = getCurrentFloor();
    wallTileCache = getSpriteImage(makeWallTile(floor.colors.wall, floor.colors.accent));
    floorTileCache = getSpriteImage(makeFloorTile(floor.colors.floor));
    doorTileCache = getSpriteImage(makeDoorTile(floor.colors.wall));
}

export function render(gameState, stateData) {
    nativeCtx.fillStyle = '#000000';
    nativeCtx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

    switch (gameState) {
        case STATE.TITLE:
            renderTitle();
            break;
        case STATE.DIFFICULTY_SELECT:
            renderDifficultySelect(stateData);
            break;
        case STATE.FLOOR_INTRO:
            renderFloorIntro(stateData);
            break;
        case STATE.PLAYING:
            renderGame();
            break;
        case STATE.ROOM_TRANSITION:
            renderTransition(stateData);
            break;
        case STATE.BOSS_INTRO:
            renderBossIntro(stateData);
            break;
        case STATE.GAME_OVER:
            renderGameOver(stateData);
            break;
        case STATE.FLOOR_CLEAR:
            renderFloorClear(stateData);
            break;
        case STATE.WIN:
            renderWin(stateData);
            break;
    }

    // Scale to display
    ctx.drawImage(nativeCanvas, 0, 0, NATIVE_WIDTH * SCALE, NATIVE_HEIGHT * SCALE);
}

// =====================
// GAME RENDERING
// =====================

function renderGame() {
    updateTileCache();
    renderRoom(gameProgress._roomLayout);
    renderEntities();
    renderHUD();
}

function renderRoom(layout) {
    if (!layout) return;

    for (let r = 0; r < ROOM_ROWS; r++) {
        for (let c = 0; c < ROOM_COLS; c++) {
            const x = c * TILE_SIZE;
            const y = r * TILE_SIZE + GAME_AREA_Y;

            if (layout[r][c] === 1) {
                nativeCtx.drawImage(wallTileCache, x, y);
            } else {
                nativeCtx.drawImage(floorTileCache, x, y);
            }
        }
    }

    // Draw door indicator on right wall opening if room is cleared
    if (gameProgress.roomCleared) {
        const midRow = Math.floor(ROOM_ROWS / 2);
        for (let r = midRow - 2; r <= midRow + 1; r++) {
            const x = (ROOM_COLS - 1) * TILE_SIZE;
            const y = r * TILE_SIZE + GAME_AREA_Y;
            nativeCtx.drawImage(floorTileCache, x, y);
            // Draw arrow indicator
            if (r === midRow - 1 || r === midRow) {
                nativeCtx.fillStyle = '#ffff00';
                nativeCtx.globalAlpha = 0.5 + Math.sin(Date.now() * 0.005) * 0.3;
                // Arrow shape
                const ax = x + 4;
                const ay = y + 4;
                nativeCtx.beginPath();
                nativeCtx.moveTo(ax, ay);
                nativeCtx.lineTo(ax + 8, ay + 4);
                nativeCtx.lineTo(ax, ay + 8);
                nativeCtx.fill();
                nativeCtx.globalAlpha = 1;
            }
        }
    }
}

function renderEntities() {
    // Bullet packs
    const packImg = getSpriteImage(BULLET_PACK_SPRITE);
    for (const pack of bulletPacks) {
        if (!pack.active) continue;
        nativeCtx.drawImage(packImg, Math.floor(pack.x), Math.floor(pack.y + (pack.bobOffset || 0)));
    }

    // Heart
    if (heart.active) {
        const img = getSpriteImage(HEART_SPRITE);
        nativeCtx.drawImage(img, Math.floor(heart.x), Math.floor(heart.y + heart.bobOffset));

        // "PRESS SPACE" indicator
        nativeCtx.fillStyle = '#ffffff';
        nativeCtx.font = '5px monospace';
        nativeCtx.textAlign = 'center';
        nativeCtx.fillText('SPACE', heart.x + 8, heart.y - 4);
        nativeCtx.textAlign = 'left';
    }

    // Monsters
    const floorIdx = getCurrentFloorIndex();
    const monsterSprites = getMonsterSprites(floorIdx);
    for (const m of monsters) {
        if (!m.active) continue;
        const sprite = monsterSprites[m.type];
        if (m.hitFlash > 0) {
            nativeCtx.fillStyle = '#ffffff';
            nativeCtx.fillRect(Math.floor(m.x), Math.floor(m.y), m.width, m.height);
        } else {
            const img = getSpriteImage(sprite);
            nativeCtx.drawImage(img, Math.floor(m.x), Math.floor(m.y));
        }
    }

    // Boss
    if (boss.active) {
        const bossSprite = getBossSprite(floorIdx);
        if (boss.hitFlash > 0) {
            nativeCtx.fillStyle = '#ffffff';
            nativeCtx.fillRect(Math.floor(boss.x), Math.floor(boss.y), boss.width, boss.height);
        } else {
            const img = getSpriteImage(bossSprite);
            nativeCtx.drawImage(img, Math.floor(boss.x), Math.floor(boss.y));
        }
    }

    // Bullets
    for (const b of bullets) {
        if (b.isPlayerBullet) {
            const img = getSpriteImage(BULLET_SPRITE);
            nativeCtx.drawImage(img, Math.floor(b.x), Math.floor(b.y));
        } else {
            const img = getSpriteImage(BOSS_BULLET_SPRITE);
            nativeCtx.drawImage(img, Math.floor(b.x), Math.floor(b.y));
        }
    }

    // Player
    if (player.active) {
        // Flicker during invincibility
        if (player.invincibility > 0 && Math.floor(player.invincibility / 4) % 2 === 0) {
            return; // Skip rendering for flicker effect
        }
        const spriteData = PLAYER_SPRITES[player.direction];
        const img = getSpriteImage(spriteData);
        nativeCtx.drawImage(img, Math.floor(player.x), Math.floor(player.y));
    }
}

function renderHUD() {
    // HUD background
    nativeCtx.fillStyle = '#111111';
    nativeCtx.fillRect(0, 0, NATIVE_WIDTH, GAME_AREA_Y);

    // Row 1 (y=2): Lives - small hearts (top-left)
    const heartFull = getSpriteImage(HEART_SMALL);
    const heartEmpty = getSpriteImage(HEART_EMPTY);
    for (let i = 0; i < PLAYER_MAX_LIVES; i++) {
        const img = i < player.lives ? heartFull : heartEmpty;
        nativeCtx.drawImage(img, 2 + i * 9, 2);
    }

    // Row 2 (y=12): Ammo - bullet icon + count bar (bottom-left)
    // Small yellow bullet icon
    nativeCtx.fillStyle = '#FFD700';
    nativeCtx.fillRect(2, 13, 4, 2);  // bullet tip
    nativeCtx.fillRect(1, 12, 6, 5);  // bullet body
    nativeCtx.fillStyle = '#8B6914';
    nativeCtx.fillRect(1, 16, 6, 1);  // casing base

    // Ammo count as segmented bar (25 max = 25 tiny segments)
    const ammo = player.ammo;
    for (let i = 0; i < MAX_AMMO; i++) {
        const bx = 10 + i * 4;
        const by = 13;
        nativeCtx.fillStyle = i < ammo ? '#FFD700' : '#333333';
        nativeCtx.fillRect(bx, by, 3, 5);
    }

    // Ammo number label
    nativeCtx.fillStyle = '#ffffff';
    nativeCtx.font = '5px monospace';
    nativeCtx.textAlign = 'right';
    nativeCtx.fillText(`${ammo}/${MAX_AMMO}`, NATIVE_WIDTH - 2, 19);
    nativeCtx.textAlign = 'left';

    // Boss HP (top-right, row 1)
    if (boss.active) {
        const barWidth = 60;
        const barHeight = 6;
        const barX = NATIVE_WIDTH - barWidth - 4;
        const barY = 2;

        nativeCtx.fillStyle = '#333333';
        nativeCtx.fillRect(barX, barY, barWidth, barHeight);
        nativeCtx.fillStyle = '#ff0000';
        nativeCtx.fillRect(barX, barY, (boss.hp / boss.maxHp) * barWidth, barHeight);
        nativeCtx.strokeStyle = '#ffffff';
        nativeCtx.lineWidth = 0.5;
        nativeCtx.strokeRect(barX, barY, barWidth, barHeight);

        nativeCtx.fillStyle = '#ffffff';
        nativeCtx.font = '5px monospace';
        nativeCtx.textAlign = 'right';
        nativeCtx.fillText(`HP:${boss.hp}`, barX - 2, barY + 5);
        nativeCtx.textAlign = 'left';
    }

    // Floor/Room indicator (center, between the two rows)
    nativeCtx.fillStyle = '#aaaaaa';
    nativeCtx.font = '5px monospace';
    nativeCtx.textAlign = 'center';
    const floor = getCurrentFloor();
    nativeCtx.fillText(`F${getCurrentFloorIndex() + 1}:${floor.name}  R${getCurrentRoom() + 1}/${ROOMS_PER_FLOOR}`, NATIVE_WIDTH / 2, 9);
    nativeCtx.textAlign = 'left';
}

// =====================
// MENU SCREENS
// =====================

function renderTitle() {
    // Background
    nativeCtx.fillStyle = '#0a0a1a';
    nativeCtx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

    // Tower graphic
    nativeCtx.fillStyle = '#333355';
    nativeCtx.fillRect(88, 40, 80, 140);
    nativeCtx.fillStyle = '#444466';
    nativeCtx.fillRect(92, 44, 72, 132);
    // Windows
    for (let i = 0; i < 5; i++) {
        nativeCtx.fillStyle = '#aaaa44';
        nativeCtx.fillRect(104, 50 + i * 26, 8, 12);
        nativeCtx.fillRect(144, 50 + i * 26, 8, 12);
    }
    // Top
    nativeCtx.fillStyle = '#333355';
    nativeCtx.beginPath();
    nativeCtx.moveTo(88, 40);
    nativeCtx.lineTo(128, 15);
    nativeCtx.lineTo(168, 40);
    nativeCtx.fill();

    // Title
    nativeCtx.fillStyle = '#FFD700';
    nativeCtx.font = 'bold 16px monospace';
    nativeCtx.textAlign = 'center';
    nativeCtx.fillText('THE TOWER', NATIVE_WIDTH / 2, 210);

    // Subtitle
    nativeCtx.fillStyle = '#aaaaaa';
    nativeCtx.font = '6px monospace';
    nativeCtx.fillText('PRESS SPACE TO START', NATIVE_WIDTH / 2, 228);
    nativeCtx.textAlign = 'left';

    // Blink effect
    if (Math.floor(Date.now() / 500) % 2 === 0) {
        nativeCtx.fillStyle = '#aaaaaa';
        nativeCtx.font = '6px monospace';
        nativeCtx.textAlign = 'center';
        nativeCtx.fillText('PRESS SPACE TO START', NATIVE_WIDTH / 2, 228);
        nativeCtx.textAlign = 'left';
    }
}

function renderDifficultySelect(stateData) {
    nativeCtx.fillStyle = '#0a0a1a';
    nativeCtx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

    nativeCtx.fillStyle = '#FFD700';
    nativeCtx.font = 'bold 10px monospace';
    nativeCtx.textAlign = 'center';
    nativeCtx.fillText('SELECT DIFFICULTY', NATIVE_WIDTH / 2, 60);

    const options = ['EASY', 'NORMAL', 'HARD'];
    const selected = stateData.selected || 0;

    for (let i = 0; i < 3; i++) {
        const y = 100 + i * 30;
        if (i === selected) {
            nativeCtx.fillStyle = '#FFD700';
            nativeCtx.fillText('> ' + options[i] + ' <', NATIVE_WIDTH / 2, y);
        } else {
            nativeCtx.fillStyle = '#888888';
            nativeCtx.fillText(options[i], NATIVE_WIDTH / 2, y);
        }
    }

    nativeCtx.fillStyle = '#666666';
    nativeCtx.font = '5px monospace';
    nativeCtx.fillText('UP/DOWN to select, SPACE to confirm', NATIVE_WIDTH / 2, 200);
    nativeCtx.textAlign = 'left';
}

function renderFloorIntro(stateData) {
    const floor = getCurrentFloor();
    const timer = stateData.timer || 0;
    const alpha = Math.min(1, timer / 30);

    nativeCtx.fillStyle = '#0a0a1a';
    nativeCtx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

    nativeCtx.globalAlpha = alpha;

    // Floor theme color accent
    nativeCtx.fillStyle = floor.colors.accent;
    nativeCtx.fillRect(40, 80, NATIVE_WIDTH - 80, 2);
    nativeCtx.fillRect(40, 160, NATIVE_WIDTH - 80, 2);

    nativeCtx.fillStyle = '#FFD700';
    nativeCtx.font = 'bold 12px monospace';
    nativeCtx.textAlign = 'center';
    nativeCtx.fillText(`FLOOR ${getCurrentFloorIndex() + 1}`, NATIVE_WIDTH / 2, 110);

    nativeCtx.fillStyle = floor.colors.accent;
    nativeCtx.font = 'bold 10px monospace';
    nativeCtx.fillText(floor.name.toUpperCase(), NATIVE_WIDTH / 2, 135);

    nativeCtx.fillStyle = '#888888';
    nativeCtx.font = '5px monospace';
    nativeCtx.fillText(`Monsters: ${floor.monsters.join(' & ')}`, NATIVE_WIDTH / 2, 150);

    nativeCtx.globalAlpha = 1;
    nativeCtx.textAlign = 'left';
}

function renderTransition(stateData) {
    updateTileCache();
    // Slide effect
    const progress = stateData.progress || 0; // 0 to 1
    const offset = Math.floor(progress * NATIVE_WIDTH);

    // Current room slides left
    nativeCtx.save();
    nativeCtx.translate(-offset, 0);
    renderRoom(stateData.oldLayout);
    nativeCtx.restore();

    // New room slides in from right
    nativeCtx.save();
    nativeCtx.translate(NATIVE_WIDTH - offset, 0);
    renderRoom(stateData.newLayout);
    nativeCtx.restore();

    // Player
    if (player.active) {
        const spriteData = PLAYER_SPRITES[player.direction];
        const img = getSpriteImage(spriteData);
        nativeCtx.drawImage(img, Math.floor(player.x), Math.floor(player.y));
    }

    renderHUD();
}

function renderBossIntro(stateData) {
    updateTileCache();
    renderRoom(gameProgress._roomLayout);
    renderHUD();

    const timer = stateData.timer || 0;
    const floor = getCurrentFloor();

    // Dark overlay
    nativeCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    nativeCtx.fillRect(0, GAME_AREA_Y, NATIVE_WIDTH, NATIVE_HEIGHT - GAME_AREA_Y);

    // Boss name
    if (timer > 30) {
        nativeCtx.fillStyle = '#ff4444';
        nativeCtx.font = 'bold 10px monospace';
        nativeCtx.textAlign = 'center';
        nativeCtx.fillText('BOSS', NATIVE_WIDTH / 2, 100);
        nativeCtx.fillStyle = '#FFD700';
        nativeCtx.fillText(floor.boss.toUpperCase(), NATIVE_WIDTH / 2, 120);
        nativeCtx.textAlign = 'left';
    }

    // Player standing ready
    if (player.active) {
        const spriteData = PLAYER_SPRITES[player.direction];
        const img = getSpriteImage(spriteData);
        nativeCtx.drawImage(img, Math.floor(player.x), Math.floor(player.y));
    }
}

function renderGameOver(stateData) {
    nativeCtx.fillStyle = '#1a0000';
    nativeCtx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

    nativeCtx.fillStyle = '#ff0000';
    nativeCtx.font = 'bold 14px monospace';
    nativeCtx.textAlign = 'center';
    nativeCtx.fillText('GAME OVER', NATIVE_WIDTH / 2, 100);

    nativeCtx.fillStyle = '#aaaaaa';
    nativeCtx.font = '6px monospace';
    const floor = getCurrentFloor();
    nativeCtx.fillText(`Defeated on Floor ${getCurrentFloorIndex() + 1}: ${floor.name}`, NATIVE_WIDTH / 2, 130);

    if ((stateData.timer || 0) > 60) {
        nativeCtx.fillStyle = '#888888';
        nativeCtx.font = '6px monospace';
        nativeCtx.fillText('PRESS SPACE TO RETRY FLOOR', NATIVE_WIDTH / 2, 180);
    }

    nativeCtx.textAlign = 'left';
}

function renderFloorClear(stateData) {
    const floor = getCurrentFloor();

    nativeCtx.fillStyle = '#001a00';
    nativeCtx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

    nativeCtx.fillStyle = '#00ff00';
    nativeCtx.font = 'bold 12px monospace';
    nativeCtx.textAlign = 'center';
    nativeCtx.fillText('FLOOR CLEARED!', NATIVE_WIDTH / 2, 90);

    nativeCtx.fillStyle = floor.colors.accent;
    nativeCtx.font = '8px monospace';
    nativeCtx.fillText(`${floor.name} conquered!`, NATIVE_WIDTH / 2, 115);

    if ((stateData.timer || 0) > 90) {
        nativeCtx.fillStyle = '#888888';
        nativeCtx.font = '6px monospace';
        nativeCtx.fillText('PRESS SPACE TO CONTINUE', NATIVE_WIDTH / 2, 170);
    }

    nativeCtx.textAlign = 'left';
}

function renderWin(stateData) {
    nativeCtx.fillStyle = '#1a0a2a';
    nativeCtx.fillRect(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

    const timer = stateData.timer || 0;

    // Princess
    if (timer > 30) {
        const img = getSpriteImage(PRINCESS_SPRITE);
        const scale = 3;
        const px = NATIVE_WIDTH / 2 - 24;
        const py = 50;
        // Draw scaled princess
        for (let y = 0; y < PRINCESS_SPRITE.length; y++) {
            for (let x = 0; x < PRINCESS_SPRITE[y].length; x++) {
                const color = PRINCESS_SPRITE[y][x];
                if (color && color !== 0) {
                    nativeCtx.fillStyle = color;
                    nativeCtx.fillRect(px + x * scale, py + y * scale, scale, scale);
                }
            }
        }
    }

    if (timer > 60) {
        nativeCtx.fillStyle = '#FFD700';
        nativeCtx.font = 'bold 10px monospace';
        nativeCtx.textAlign = 'center';
        nativeCtx.fillText('PRINCESS RESCUED!', NATIVE_WIDTH / 2, 120);
    }

    if (timer > 90) {
        nativeCtx.fillStyle = '#ffffff';
        nativeCtx.font = '7px monospace';
        nativeCtx.textAlign = 'center';
        nativeCtx.fillText('CONGRATULATIONS!', NATIVE_WIDTH / 2, 145);
        nativeCtx.fillText('YOU CONQUERED THE TOWER!', NATIVE_WIDTH / 2, 160);
    }

    if (timer > 150) {
        nativeCtx.fillStyle = '#FFD700';
        nativeCtx.font = 'bold 14px monospace';
        nativeCtx.textAlign = 'center';
        nativeCtx.fillText('THE TOWER', NATIVE_WIDTH / 2, 195);

        nativeCtx.fillStyle = '#888888';
        nativeCtx.font = '5px monospace';
        nativeCtx.fillText('PRESS SPACE TO PLAY AGAIN', NATIVE_WIDTH / 2, 220);
    }

    nativeCtx.textAlign = 'left';
}
