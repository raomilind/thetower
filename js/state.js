// The Tower - Game State Machine

import { STATE, DIFFICULTY, PATH_CONFIG, PLAYER_MAX_LIVES, GAME_AREA_Y, NATIVE_WIDTH, TILE_SIZE, BULLET_PACK_DROP_CHANCE, BULLET_PACK_AMMO, STARTING_AMMO, SWORD_RANGE } from './constants.js';
import { isActionPressed, isKeyJustPressed, isKeyDown } from './input.js';
import { player, resetPlayer, updatePlayer, damagePlayer, damagePlayerDouble, healPlayer, isPlayerAtRightEdge, isPlayerAtLeftEdge, isPlayerAtTopEdge, isPlayerAtBottomEdge, addAmmo, ensureMinAmmo } from './player.js';
import { bulletPacks, spawnBulletPack, updateBulletPacks, getActiveBulletPacks, collectBulletPack, clearBulletPacks } from './bulletpack.js';
import { bullets, updateBullets, clearBullets, removeBullet } from './bullet.js';
import { monsters, spawnMonsters, updateMonsters, killMonster, damageMonster, getActiveMonsters, clearMonsters } from './monster.js';
import { boss, spawnBoss, updateBoss, damageBoss, clearBoss } from './boss.js';
import { heart, spawnHeart, updateHeart, collectHeart, clearHeart } from './heart.js';
import { generateRoomLayout, generateCrossroadsLayout, openRightWall, openLeftWall, closeTopWall, closeBottomWall } from './room.js';
import { gameProgress, getCurrentFloor, getCurrentFloorIndex, getCurrentRoom, isBossRoom, isCrossroadsRoom, isLastFloor, advanceRoom, advanceFloor, restartFloor, resetProgress, setDifficulty, markRoomCleared, markHeartCollected, canGoBack, goBackRoom, saveRoomState, getRoomState, initFloorPaths, selectPath } from './floor.js';
import { aabbCollision, isNearEntity, distanceBetween } from './collision.js';
import { sfxMonsterDeath, sfxBossHit, sfxBossDeath, sfxHeartPickup, sfxRoomClear, sfxFloorClear, sfxGameOver, sfxVictory, sfxSelect, resumeAudio } from './audio.js';

let currentState = STATE.TITLE;
let stateData = {};
let lastKilledPos = { x: 0, y: 0 };

// Monster activation — monsters wander until player moves 5 tiles from room entry
let monstersActivated = false;
let monstersEnraged  = false; // true if player attacked before activation (3× speed, sword useless)
let playerEntryX = 0;
let playerEntryY = 0;

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

    // Capture attack state BEFORE player update (to detect early attacks)
    const prevShootCooldown = player.shootCooldown;
    const prevSwordSwing    = player.swordSwing;

    // Update player
    updatePlayer(layout, gameProgress.roomCleared);

    // Update bullets
    updateBullets();

    // Update monsters (skip crossroads — no enemies there)
    if (!bossRoom && !isCrossroadsRoom()) {
        if (!monstersActivated) {
            // Check if player attacked early — instant enrage at 3× speed
            const shotFired = player.shootCooldown > prevShootCooldown;
            const swordSwung = prevSwordSwing === 0 && player.swordSwing > 0;
            if (shotFired || swordSwung) {
                monstersActivated = true;
                monstersEnraged = true;
            } else {
                // Normal activation: walked 5 tiles from entry
                const adx = player.x - playerEntryX;
                const ady = player.y - playerEntryY;
                if (Math.sqrt(adx * adx + ady * ady) >= TILE_SIZE * 5) {
                    monstersActivated = true;
                }
            }
        }
        const pathSpeedBonus = gameProgress.selectedPath ? PATH_CONFIG[gameProgress.selectedPath].speedBonus : 0;
        const enrageMult = monstersEnraged ? 3.0 : 1.0;
        updateMonsters(player, (diff.monsterSpeedMult + pathSpeedBonus) * enrageMult, layout, monstersActivated);
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

    // Monsters touching player (disabled during grace period)
    if (!bossRoom && monstersActivated) {
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

    // Enemy bullets hitting player (boss = 1 life, monster fireball = 2 lives)
    for (const b of [...bullets]) {
        if (b.isPlayerBullet) continue;
        if (!aabbCollision(b, player)) continue;
        removeBullet(b);
        const hit = b.isMonsterBullet ? damagePlayerDouble() : damagePlayer();
        if (hit && player.lives <= 0) {
            onPlayerDeath();
            return;
        }
    }

    // Sword attack
    if (player.swordSwing > 0 && !player.swordHit) {
        player.swordHit = true;
        if (!bossRoom) {
            for (const m of [...monsters]) {
                if (!m.active) continue;
                if (distanceBetween(player, m) <= SWORD_RANGE) {
                    if (monstersEnraged) continue; // sword useless against enraged monsters
                    const dead = damageMonster(m, 1); // sword does 1 of 2 HP
                    if (dead) {
                        lastKilledPos = { x: m.x + m.width / 2, y: m.y + m.height / 2 };
                        sfxMonsterDeath();
                        if (Math.random() < BULLET_PACK_DROP_CHANCE) {
                            spawnBulletPack(lastKilledPos.x, lastKilledPos.y);
                        }
                    }
                }
            }
        }
        if (bossRoom && boss.active) {
            if (distanceBetween(player, boss) <= SWORD_RANGE) {
                const dead = damageBoss(0.5); // sword does half gun damage
                if (dead) {
                    sfxBossDeath();
                    clearBoss();
                    onBossDefeated();
                    return;
                } else {
                    sfxBossHit();
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

    // Check if room is cleared (crossroads never auto-clears — player walks to an exit instead)
    if (!gameProgress.roomCleared) {
        if (bossRoom) {
            // Boss room cleared when boss is dead (handled in onBossDefeated)
        } else if (!isCrossroadsRoom()) {
            const alive = getActiveMonsters();
            if (alive.length === 0) {
                onRoomCleared(lastKilledPos.x, lastKilledPos.y);
            }
        }
    }

    // Heart pickup (press E when nearby)
    if (heart.active && isNearEntity(player, heart, 20) && isKeyJustPressed('KeyE')) {
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

    // Crossroads path selection — player walks to one of the three exits
    if (isCrossroadsRoom() && !gameProgress.selectedPath) {
        if (isPlayerAtRightEdge())  { choosePath('right'); return; }
        if (isPlayerAtTopEdge())    { choosePath('up');    return; }
        if (isPlayerAtBottomEdge()) { choosePath('down');  return; }
    }

    // Room transition - walk to right edge after room is cleared
    if (gameProgress.roomCleared && isPlayerAtRightEdge()) {
        startRoomTransition();
        return;
    }

    // Return to previous room - walk to left edge (not in boss rooms)
    if (!bossRoom && canGoBack() && isPlayerAtLeftEdge()) {
        startBackTransition();
    }
}

function updateTransition() {
    stateData.progress = (stateData.progress || 0) + 0.02;

    const direction = stateData.direction || 'forward';

    // Keep player pinned to correct side during animation
    player.x = direction === 'backward' ? NATIVE_WIDTH - player.width - 8 : 8;

    if (stateData.progress >= 1) {
        clearBullets();

        const rs = stateData.restoredState;

        if (rs) {
            // Restore a previously saved room (forward revisit OR backward)
            gameProgress._roomLayout = rs.layout;
            gameProgress.roomCleared = rs.cleared;
            gameProgress.heartCollected = rs.heartCollected;

            monsters.length = 0;
            for (const m of rs.monsters) monsters.push({ ...m });

            bulletPacks.length = 0;
            for (const p of rs.bulletPacks) bulletPacks.push({ ...p });

            Object.assign(heart, rs.heart);

            player.x = direction === 'backward' ? NATIVE_WIDTH - player.width - 30 : 20;
            player.y = GAME_AREA_Y + 96;
            monstersActivated = true; // player has been here before — no grace period
            setState(STATE.PLAYING);
        } else {
            // Fresh forward room
            gameProgress._roomLayout = stateData.newLayout;
            gameProgress.roomCleared = false;
            gameProgress.heartCollected = false;
            player.x = 20;
            player.y = GAME_AREA_Y + 96;
            // Grace period: monsters wait until player moves 5 tiles in
            monstersActivated = false;
            monstersEnraged   = false;
            playerEntryX = player.x;
            playerEntryY = player.y;
            clearHeart();
            clearBulletPacks();
            // Open left wall if this room has a previous room
            if (canGoBack()) openLeftWall(gameProgress._roomLayout);
            setupRoomEntities(); // may set BOSS_INTRO for the last room
            if (getCurrentState() !== STATE.BOSS_INTRO) {
                setState(STATE.PLAYING);
            }
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
        player.ammo = STARTING_AMMO; // reset bullets to 10 on death
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
    initFloorPaths(); // randomise path assignments for this floor
    clearBullets();
    clearMonsters();
    clearBoss();
    clearHeart();
    clearBulletPacks();
    setState(STATE.FLOOR_INTRO, { timer: 0 });
}

function setupRoom() {
    const layout = isCrossroadsRoom()
        ? generateCrossroadsLayout()
        : generateRoomLayout(getCurrentFloorIndex(), getCurrentRoom());
    gameProgress._roomLayout = layout;
    gameProgress.roomCleared = false;
    gameProgress.heartCollected = false;

    resetPlayer(false);
    clearBullets();
    clearHeart();

    // Monsters wait until player moves into the room
    monstersActivated = false;
    monstersEnraged   = false;
    playerEntryX = player.x;
    playerEntryY = player.y;

    setupRoomEntities();
}

function setupRoomEntities() {
    const diff = DIFFICULTY[gameProgress.difficulty];
    const bossRoom = isBossRoom();
    const crossroads = isCrossroadsRoom();

    clearMonsters();
    clearBoss();
    clearBullets();

    if (crossroads) {
        // No enemies in the crossroads — player just picks a path
        return;
    }

    if (bossRoom) {
        spawnBoss(getCurrentFloorIndex());
        setState(STATE.BOSS_INTRO, { timer: 0 });
    } else {
        const pathBonus = gameProgress.selectedPath ? PATH_CONFIG[gameProgress.selectedPath].monsterBonus : 0;
        spawnMonsters(diff.monstersPerRoom + pathBonus, gameProgress._roomLayout, getCurrentFloorIndex());
    }
}

// Called when the player commits to a crossroads exit
function choosePath(exit) {
    selectPath(exit); // sets gameProgress.selectedPath and pathRooms
    const layout = gameProgress._roomLayout;
    // Always close top and bottom — they were selection tools, the real exit is right
    closeTopWall(layout);
    closeBottomWall(layout);
    // Right wall is already open from generateCrossroadsLayout; leave it open
    markRoomCleared();
    startRoomTransition(); // save crossroads state and advance to room 1
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

// Snapshot the current room's entity state so it can be restored later
function saveCurrentRoomState() {
    saveRoomState(gameProgress.currentRoom, {
        layout: gameProgress._roomLayout,
        monsters: monsters.map(m => ({ ...m })),
        bulletPacks: bulletPacks.map(p => ({ ...p })),
        heart: { ...heart },
        cleared: gameProgress.roomCleared,
        heartCollected: gameProgress.heartCollected,
    });
}

function startRoomTransition() {
    // Freeze the current room before leaving
    saveCurrentRoomState();

    const oldLayout = gameProgress._roomLayout;
    const nextRoomIdx = gameProgress.currentRoom + 1;

    // Advance to next room
    const floorDone = advanceRoom();

    if (floorDone) {
        sfxFloorClear();
        setState(STATE.FLOOR_CLEAR, { timer: 0 });
        return;
    }

    // Use saved state if player has been here before, otherwise generate fresh
    const savedState = getRoomState(nextRoomIdx);
    const newLayout = savedState ? savedState.layout : generateRoomLayout(getCurrentFloorIndex(), getCurrentRoom());

    setState(STATE.ROOM_TRANSITION, {
        progress: 0,
        oldLayout,
        newLayout,
        direction: 'forward',
        restoredState: savedState,
    });
}

function startBackTransition() {
    // Freeze the current room before leaving
    saveCurrentRoomState();

    const oldLayout = gameProgress._roomLayout;
    const prevRoomIdx = gameProgress.currentRoom - 1;

    goBackRoom(); // currentRoom decrements to prevRoomIdx

    const prevState = getRoomState(prevRoomIdx); // always exists — we saved it when we left

    setState(STATE.ROOM_TRANSITION, {
        progress: 0,
        oldLayout,
        newLayout: prevState.layout,
        direction: 'backward',
        restoredState: prevState,
    });
}
