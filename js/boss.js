// The Tower - Boss Entity

import { BOSS_SIZE, BOSS_HP, BOSS_BASE_SPEED, GAME_AREA_Y, TILE_SIZE, NATIVE_WIDTH, NATIVE_HEIGHT } from './constants.js';
import { createBullet } from './bullet.js';
import { collidesWithWalls } from './collision.js';
import { sfxBossShoot } from './audio.js';

export const boss = {
    x: 0,
    y: 0,
    width: BOSS_SIZE,
    height: BOSS_SIZE,
    hp: BOSS_HP,
    maxHp: BOSS_HP,
    active: false,
    speed: BOSS_BASE_SPEED,
    phase: 'chase', // chase, shoot, move
    phaseTimer: 0,
    shootTimer: 0,
    shootInterval: 120,
    targetX: 0,
    targetY: 0,
    hitFlash: 0,
    speedMult: 1,
};

export function spawnBoss(floorIndex) {
    boss.x = NATIVE_WIDTH - TILE_SIZE * 2 - BOSS_SIZE;
    boss.y = GAME_AREA_Y + (NATIVE_HEIGHT - GAME_AREA_Y) / 2 - BOSS_SIZE / 2;
    boss.hp = BOSS_HP;
    boss.maxHp = BOSS_HP;
    boss.active = true;
    boss.phase = 'chase';
    boss.phaseTimer = 0;
    boss.shootTimer = 0;
    boss.hitFlash = 0;
    boss.targetX = boss.x;
    boss.targetY = boss.y;
}

export function updateBoss(player, speedMult, shootInterval, roomLayout) {
    if (!boss.active) return;

    boss.speedMult = speedMult;
    boss.shootInterval = shootInterval;
    boss.phaseTimer++;

    switch (boss.phase) {
        case 'chase':
            // Move toward player
            chaseBoss(player, roomLayout, speedMult);
            if (boss.phaseTimer > 120) {
                boss.phase = 'shoot';
                boss.phaseTimer = 0;
            }
            break;

        case 'shoot':
            // Stop and shoot
            boss.shootTimer++;
            if (boss.shootTimer >= Math.floor(shootInterval / 3)) {
                shootAtPlayer(player);
                boss.shootTimer = 0;
            }
            if (boss.phaseTimer > 90) {
                boss.phase = 'move';
                boss.phaseTimer = 0;
                // Pick random target position
                boss.targetX = TILE_SIZE * 2 + Math.random() * (NATIVE_WIDTH - TILE_SIZE * 4 - BOSS_SIZE);
                boss.targetY = GAME_AREA_Y + TILE_SIZE * 2 + Math.random() * (NATIVE_HEIGHT - GAME_AREA_Y - TILE_SIZE * 4 - BOSS_SIZE);
            }
            break;

        case 'move':
            // Move to random position
            moveToTarget(roomLayout, speedMult);
            if (boss.phaseTimer > 90 || atTarget()) {
                boss.phase = 'chase';
                boss.phaseTimer = 0;
            }
            break;
    }

    if (boss.hitFlash > 0) boss.hitFlash--;
}

function chaseBoss(player, roomLayout, speedMult) {
    const dx = player.x - boss.x;
    const dy = player.y - boss.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 5) return;

    const speed = BOSS_BASE_SPEED * speedMult;
    const moveX = (dx / dist) * speed;
    const moveY = (dy / dist) * speed;

    tryMove(moveX, moveY, roomLayout);
}

function moveToTarget(roomLayout, speedMult) {
    const dx = boss.targetX - boss.x;
    const dy = boss.targetY - boss.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 5) return;

    const speed = BOSS_BASE_SPEED * speedMult * 1.5;
    const moveX = (dx / dist) * speed;
    const moveY = (dy / dist) * speed;

    tryMove(moveX, moveY, roomLayout);
}

function tryMove(moveX, moveY, roomLayout) {
    const newX = boss.x + moveX;
    const newY = boss.y + moveY;

    const testX = { x: newX, y: boss.y, width: boss.width, height: boss.height };
    if (newX > TILE_SIZE && newX < NATIVE_WIDTH - TILE_SIZE - boss.width && !collidesWithWalls(testX, roomLayout)) {
        boss.x = newX;
    }

    const testY = { x: boss.x, y: newY, width: boss.width, height: boss.height };
    if (newY > GAME_AREA_Y + TILE_SIZE && newY < NATIVE_HEIGHT - TILE_SIZE - boss.height && !collidesWithWalls(testY, roomLayout)) {
        boss.y = newY;
    }
}

function atTarget() {
    const dx = boss.targetX - boss.x;
    const dy = boss.targetY - boss.y;
    return Math.sqrt(dx * dx + dy * dy) < 10;
}

function shootAtPlayer(player) {
    const cx = boss.x + boss.width / 2;
    const cy = boss.y + boss.height / 2;
    const px = player.x + player.width / 2;
    const py = player.y + player.height / 2;
    const angle = Math.atan2(py - cy, px - cx);

    // Shoot 3 bullets in a spread
    const spread = 0.3;
    for (let i = -1; i <= 1; i++) {
        const a = angle + i * spread;
        createBullet(cx, cy, Math.cos(a), Math.sin(a), false);
    }
    sfxBossShoot();
}

export function damageBoss() {
    boss.hp--;
    boss.hitFlash = 8;
    return boss.hp <= 0;
}

export function clearBoss() {
    boss.active = false;
}
