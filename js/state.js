// The Tower - Game State Machine

import { STATE, DIFFICULTY, ROOMS_PER_FLOOR, PLAYER_MAX_LIVES, GAME_AREA_Y, BULLET_PACK_DROP_CHANCE, BULLET_PACK_AMMO, STARTING_AMMO } from './constants.js';
import { isActionPressed, isKeyJustPressed, isKeyDown } from './input.js';
import { player, resetPlayer, updatePlayer, damagePlayer, healPlayer, isPlayerAtRightEdge, addAmmo, ensureMinAmmo } from './player.js';
import { bulletPacks, spawnBulletPack, updateBulletPacks, getActiveBulletPacks, collectBulletPack, clearBulletPacks } from './bulletpack.js';
import { bullets, updateBullets, clearBullets, removeBullet } from './bullet.js';
import { monsters, spawnMonsters, updateMonsters, killMonster, getActiveMonsters, clearMonsters } from './monster.js';
import { boss, spawnBoss, updateBoss, damageBoss, clearBoss } from './boss.js';
import { heart, spawnHeart, updateHeart, collectHeart, clearHeart } from './heart.js';
import { generateRoomLayout, openRightWall } from './room.js';
import { gameProgress, getCurrentFloor, getCurrentFloorIndex, getCurrentRoom, isBossRoom, isLastFloor, advanceRoom, advanceFloor, restartFloor, resetProgress, setDifficulty, markRoomCleared, markHeartCollected } from './floor.js';
import { aabbCollision, isNearEntity } from './collision.js';
import { sfxMonsterDeath, sfxBossHit, sfxBossDeath, sfxHeartPickup, sfxRoomClear, sfxFloorClear, sfxGameOver, sfxVictory, sfxSelect, resumeAudio } from './audio.js';

let currentState = STATE.TITLE;
let stateData = {};
let lastKilledPos = { x: 0, y: 0 };

export function getCurrentState() {
    return currentState;
}

export function getStateData() {
    return stateData;
}

function setState(newState, data = {}) {
    currentState = newState;
    stateData = data;
}

export function updateState() {
    switch (currentState) {
        case STATE.TITLE:
            updateTitle();
            break;
        case STATE.DIFFICULTY_SELECT:
            updateDifficultySelect();
            break;
        case STATE.FLOOR_INTRO:
            updateFloorIntro();
            break;
        case STATE.PLAYING:
            updatePlaying();
            break;
        case STATE.ROOM_TRANSITION:
            updateTransition();
            break;
        case STATE.BOSS_INTRO:
            updateBossIntro();
            break;
        case STATE.GAME_OVER:
            updateGameOver();
            break;
        case STATE.FLOOR_CLEAR:
            updateFloorClear();
            break;
        case STATE.WIN:
            updateWin();
            break;
    }
}

// =====================
// STATE UPDATES
// =====================

function updateTitle() {
    if (isActionPressed()) {
        resumeAudio();
        sfxSelect();
        setState(STATE.DIFFICULTY_SELECT, { selected: 1 }); // default Normal
    }
}

function updateDifficultySelect() {
    if (isKeyJustPressed('ArrowUp') || isKeyJustPressed('KeyW')) {
        stateData.selected = Math.max(0, (stateData.selected || 0) - 1);
        sfxSelect();
    }
    if (isKeyJustPressed('ArrowDown') || isKeyJustPressed('KeyS')) {
        stateData.selected = Math.min(2, (stateData.selected || 0) + 1);
        sfxSelect();
    }
    if (isActionPressed()) {
        const diffs = ['easy', 'normal', 'hard'];
        setDifficulty(diffs[stateData.selected]);
        resetProgress();
        sfxSelect();
        startFloor();
    }
}

function updateFloorIntro() {
    stateData.timer = (stateData.timer || 0) + 1;
    if (stateData.timer > 120 || (stateData.timer > 30 && isActionPressed())) {
        setupRoom();
        setState(STATE.PLAYING);
    }
}

function updatePlaying() {
    const layout = gameProgress._roomLayout;
    const diff = DIFFICULTY[gameProgress.difficulty];
    const bossRoom = isBossRoom();

    // Update player
    updatePlayer(layout, gameProgress.roomCleared);

    // Update bullets
    updateBullets();

    // Update monsters
    if (!bossRoom || !boss.active) {
        // Only update monsters in non-boss rooms (or if boss is dead for some reason)
    }
    if (!bossRoom) {
        updateMonsters(player, diff.monsterSpeedMult, layout);
    }

    // Update boss
    if (bossRoom && boss.active) {
        updateBoss(player, diff.bossSpeedMult, diff.bossShootInterval, layout);
    }

    // Update heart
    updateHeart();

    // ---- Collision detection ----

    // Player bullets vs monsters
    if (!bossRoom) {
        for (const b of [...bullets]) {
            if (!b.isPlayerBullet) continue;
            for (const m of monsters) {
                if (!m.active) continue;
                if (aabbCollision(b, m)) {
                    lastKilledPos = { x: m.x + m.width / 2, y: m.y + m.height / 2 };
                    killMonster(m);
                    removeBullet(b);
                    sfxMonsterDeath();
                    // 30% chance to drop a bullet pack
                    if (Math.random() < BULLET_PACK_DROP_CHANCE) {
                        spawnBulletPack(lastKilledPos.x, lastKilledPos.y);
                    }
                    break;
                }
            }
        }
    }

    // Player bullets vs boss
    if (bossRoom && boss.active) {
        for (const b of [...bullets]) {
            if (!b.isPlayerBullet) continue;
            if (aabbCollision(b, boss)) {
                removeBullet(b);
                const dead = damageBoss();
                if (dead) {
                    sfxBossDeath();
                    clearBoss();
                    onBossDefeated();
                } else {
                    sfxBossHit();
                }
                break;
            }
        }
    }

    // Monsters touching player
    if (!bossRoom) {
        for (const m of monsters) {
            if (!m.active) continue;
            if (aabbCollision(player, m)) {
                if (damagePlayer()) {
                    if (player.lives <= 0) {
                        onPlayerDeath();
                        return;
                    }
                }
            }
        }
    }

    // Boss touching player
    if (bossRoom && boss.active) {
        if (aabbCollision(player, boss)) {
            if (damagePlayer()) {
                if (player.lives <= 0) {
                    onPlayerDeath();
                    return;
                }
            }
        }
    }

    // Boss bullets hitting player
    for (const b of [...bullets]) {
        if (b.isPlayerBullet) continue;
        if (aabbCollision(b, player)) {
            removeBullet(b);
            if (damagePlayer()) {
                if (player.lives <= 0) {
                    onPlayerDeath();
                    return;
                }
            }
        }
    }

    // Remove bullets that hit walls
    for (const b of [...bullets]) {
        const col = Math.floor(b.x / 16);
        const row = Math.floor((b.y - GAME_AREA_Y) / 16);
        if (row >= 0 && row < layout.length && col >= 0 && col < layout[0].length) {
            if (layout[row][col] === 1) {
                removeBullet(b);
            }
        }
    }

    // Check if room is cleared
    if (!gameProgress.roomCleared) {
        if (bossRoom) {
            // Boss room cleared when boss is dead (handled in onBossDefeated)
        } else {
            const alive = getActiveMonsters();
            if (alive.length === 0) {
                onRoomCleared(lastKilledPos.x, lastKilledPos.y);
            }
        }
    }

    // Heart pickup
    if (heart.active && isNearEntity(player, heart, 20) && isActionPressed()) {
        if (healPlayer()) {
            collectHeart();
            markHeartCollected();
            sfxHeartPickup();
        }
    }

    // Bullet pack pickups (walk-over, no button needed)
    updateBulletPacks();
    for (const pack of getActiveBulletPacks()) {
        if (aabbCollision(player, pack)) {
            if (addAmmo(BULLET_PACK_AMMO)) {
                collectBulletPack(pack);
                sfxHeartPickup(); // reuse a pleasant pickup sound
            }
        }
    }

    // Room transition - walk to right edge
    if (gameProgress.roomCleared && isPlayerAtRightEdge()) {
        startRoomTransition();
    }
}

function updateTransition() {
    stateData.progress = (stateData.progress || 0) + 0.02;

    // Move player along with transition
    player.x = 8; // Player appears at left of new room

    if (stateData.progress >= 1) {
        // Transition complete
        gameProgress._roomLayout = stateData.newLayout;
        gameProgress.roomCleared = false;
        gameProgress.heartCollected = false;
        player.x = 20;
        player.y = GAME_AREA_Y + 96;
        clearBullets();
        clearHeart();
        clearBulletPacks();
        setupRoomEntities(); // This may set BOSS_INTRO state for room 8
        // Only set PLAYING if we didn't enter boss intro
        if (getCurrentState() !== STATE.BOSS_INTRO) {
            setState(STATE.PLAYING);
        }
    }
}

function updateBossIntro() {
    stateData.timer = (stateData.timer || 0) + 1;
    if (stateData.timer > 120 || (stateData.timer > 40 && isActionPressed())) {
        setState(STATE.PLAYING);
    }
}

function updateGameOver() {
    stateData.timer = (stateData.timer || 0) + 1;
    if (stateData.timer > 60 && isActionPressed()) {
        // Restart floor
        restartFloor();
        resetPlayer(true);
        startFloor();
    }
}

function updateFloorClear() {
    stateData.timer = (stateData.timer || 0) + 1;
    if (stateData.timer > 90 && isActionPressed()) {
        const gameWon = advanceFloor();
        if (gameWon) {
            sfxVictory();
            setState(STATE.WIN, { timer: 0 });
        } else {
            // Carry ammo to next floor, but always guarantee at least 10
            ensureMinAmmo(STARTING_AMMO);
            resetPlayer(true);
            startFloor();
        }
    }
}

function updateWin() {
    stateData.timer = (stateData.timer || 0) + 1;
    if (stateData.timer > 150 && isActionPressed()) {
        setState(STATE.TITLE);
    }
}

// =====================
// GAME FLOW HELPERS
// =====================

function startFloor() {
    clearBullets();
    clearMonsters();
    clearBoss();
    clearHeart();
    clearBulletPacks();
    setState(STATE.FLOOR_INTRO, { timer: 0 });
}

function setupRoom() {
    const layout = generateRoomLayout(getCurrentFloorIndex(), getCurrentRoom());
    gameProgress._roomLayout = layout;
    gameProgress.roomCleared = false;
    gameProgress.heartCollected = false;

    resetPlayer(false);
    clearBullets();
    clearHeart();

    setupRoomEntities();
}

function setupRoomEntities() {
    const diff = DIFFICULTY[gameProgress.difficulty];
    const bossRoom = isBossRoom();

    clearMonsters();
    clearBoss();
    clearBullets();

    if (bossRoom) {
        spawnBoss(getCurrentFloorIndex());
        // Show boss intro
        setState(STATE.BOSS_INTRO, { timer: 0 });
    } else {
        spawnMonsters(diff.monstersPerRoom, gameProgress._roomLayout, getCurrentFloorIndex());
    }
}

function onRoomCleared(x, y) {
    markRoomCleared();
    openRightWall(gameProgress._roomLayout);
    sfxRoomClear();

    if (!gameProgress.heartCollected) {
        spawnHeart(x, y);
    }
}

function onBossDefeated() {
    markRoomCleared();
    clearBullets();
    sfxFloorClear();

    // Floor cleared
    if (isLastFloor()) {
        sfxVictory();
        setState(STATE.WIN, { timer: 0 });
    } else {
        setState(STATE.FLOOR_CLEAR, { timer: 0 });
    }
}

function onPlayerDeath() {
    sfxGameOver();
    setState(STATE.GAME_OVER, { timer: 0 });
}

function startRoomTransition() {
    const oldLayout = gameProgress._roomLayout;

    // Advance to next room
    const floorDone = advanceRoom();

    if (floorDone) {
        // This shouldn't happen since boss room should handle floor advancement
        // But just in case
        sfxFloorClear();
        setState(STATE.FLOOR_CLEAR, { timer: 0 });
        return;
    }

    // Generate new room layout
    const newLayout = generateRoomLayout(getCurrentFloorIndex(), getCurrentRoom());

    setState(STATE.ROOM_TRANSITION, {
        progress: 0,
        oldLayout,
        newLayout
    });
}
