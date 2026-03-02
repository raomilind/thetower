// The Tower - Boss Entity

import { BOSS_SIZE, BOSS_HP, BOSS_BASE_SPEED, BOSS_DODGE_RANGE, BOSS_DODGE_SPEED_MULT, BOSS_DODGE_DURATION, BOSS_DODGE_COOLDOWN, BOSS_SWORD_DODGE_RANGE, BOSS_PREFERRED_RANGE_MIN, BOSS_PREFERRED_RANGE_MAX, BOSS_PREDICT_FRAMES, GAME_AREA_Y, TILE_SIZE, NATIVE_WIDTH, NATIVE_HEIGHT } from './constants.js';
import { createBullet, bullets } from './bullet.js';
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
    // Dodge state
    dodgeCooldown: 0,
    dodgeTimer: 0,
    dodgeDirX: 0,
    dodgeDirY: 0,
    dodgeSide: false, // alternates each dodge so the boss doesn't always go the same way
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
    boss.dodgeCooldown = 0;
    boss.dodgeTimer = 0;
    boss.dodgeDirX = 0;
    boss.dodgeDirY = 0;
    boss.dodgeSide = false;
}

export function updateBoss(player, speedMult, shootInterval, roomLayout) {
    if (!boss.active) return;

    boss.speedMult = speedMult;
    boss.shootInterval = shootInterval;
    boss.phaseTimer++;

    // --- Phase transitions and shooting (always run, even while dodging) ---
    switch (boss.phase) {
        case 'chase':
            if (boss.phaseTimer > 120) {
                boss.phase = 'shoot';
                boss.phaseTimer = 0;
            }
            break;

        case 'shoot':
            boss.shootTimer++;
            if (boss.shootTimer >= Math.floor(shootInterval / 3)) {
                shootAtPlayer(player);
                boss.shootTimer = 0;
            }
            if (boss.phaseTimer > 90) {
                boss.phase = 'move';
                boss.phaseTimer = 0;
                boss.targetX = TILE_SIZE * 2 + Math.random() * (NATIVE_WIDTH - TILE_SIZE * 4 - BOSS_SIZE);
                boss.targetY = GAME_AREA_Y + TILE_SIZE * 2 + Math.random() * (NATIVE_HEIGHT - GAME_AREA_Y - TILE_SIZE * 4 - BOSS_SIZE);
            }
            break;

        case 'move':
            if (boss.phaseTimer > 90 || atTarget()) {
                boss.phase = 'chase';
                boss.phaseTimer = 0;
            }
            break;
    }

    // --- Dodge cooldown tick ---
    if (boss.dodgeCooldown > 0) boss.dodgeCooldown--;

    // --- Movement: dodge takes priority, then normal phase movement ---
    if (boss.dodgeTimer > 0) {
        boss.dodgeTimer--;
        const dodgeSpeed = BOSS_BASE_SPEED * speedMult * BOSS_DODGE_SPEED_MULT;
        tryMove(boss.dodgeDirX * dodgeSpeed, boss.dodgeDirY * dodgeSpeed, roomLayout);
    } else {
        // Check if a bullet or sword swing is about to hit us
        if (boss.dodgeCooldown <= 0) {
            attemptDodge();
            attemptSwordDodge(player);
        }
        // Normal phase movement
        if (boss.phase === 'chase') {
            chaseBoss(player, roomLayout, speedMult);
        } else if (boss.phase === 'move') {
            moveToTarget(roomLayout, speedMult);
        } else if (boss.phase === 'shoot') {
            strafeWhileShooting(player, roomLayout, speedMult);
        }
    }

    if (boss.hitFlash > 0) boss.hitFlash--;
}

function chaseBoss(player, roomLayout, speedMult) {
    const dx = (player.x + player.width / 2) - (boss.x + boss.width / 2);
    const dy = (player.y + player.height / 2) - (boss.y + boss.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 5) return;

    const speed = BOSS_BASE_SPEED * speedMult;
    let moveX, moveY;

    if (dist < BOSS_PREFERRED_RANGE_MIN) {
        // Too close — retreat directly away from player
        moveX = -(dx / dist) * speed;
        moveY = -(dy / dist) * speed;
    } else if (dist > BOSS_PREFERRED_RANGE_MAX) {
        // Too far — advance toward player
        moveX = (dx / dist) * speed;
        moveY = (dy / dist) * speed;
    } else {
        // In preferred range — strafe perpendicular (alternate direction every 60 frames)
        const side = Math.floor(boss.phaseTimer / 60) % 2 === 0;
        moveX = side ? (-dy / dist) * speed : (dy / dist) * speed;
        moveY = side ? (dx / dist) * speed : (-dx / dist) * speed;
    }

    tryMove(moveX, moveY, roomLayout);
}

function strafeWhileShooting(player, roomLayout, speedMult) {
    const dx = (player.x + player.width / 2) - (boss.x + boss.width / 2);
    const dy = (player.y + player.height / 2) - (boss.y + boss.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return;

    // Strafe perpendicular to player at 70% speed, switching direction every 45 frames
    const side = Math.floor(boss.phaseTimer / 45) % 2 === 0;
    const speed = BOSS_BASE_SPEED * speedMult * 0.7;
    const perpX = side ? -dy / dist : dy / dist;
    const perpY = side ? dx / dist : -dx / dist;
    tryMove(perpX * speed, perpY * speed, roomLayout);
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

// Dash away when player swings sword within range
function attemptSwordDodge(player) {
    if (player.weapon !== 'sword' || player.swordSwing <= 0) return;
    const bossCX = boss.x + boss.width / 2;
    const bossCY = boss.y + boss.height / 2;
    const dx = bossCX - (player.x + player.width / 2);
    const dy = bossCY - (player.y + player.height / 2);
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > BOSS_SWORD_DODGE_RANGE || dist === 0) return;
    const normX = dx / dist;
    const normY = dy / dist;
    boss.dodgeSide = !boss.dodgeSide;
    boss.dodgeDirX = boss.dodgeSide ? -normY : normY;
    boss.dodgeDirY = boss.dodgeSide ? normX : -normX;
    boss.dodgeTimer = BOSS_DODGE_DURATION;
    boss.dodgeCooldown = BOSS_DODGE_COOLDOWN;
}

// Scan active player bullets — if one is heading for the boss, dash perpendicular to it
function attemptDodge() {
    const bossCX = boss.x + boss.width / 2;
    const bossCY = boss.y + boss.height / 2;

    for (const b of bullets) {
        if (!b.isPlayerBullet) continue;

        // Vector from bullet to boss centre
        const toBossX = bossCX - b.x;
        const toBossY = bossCY - b.y;
        const dist = Math.sqrt(toBossX * toBossX + toBossY * toBossY);

        if (dist > BOSS_DODGE_RANGE) continue;

        // Only dodge if bullet is actually heading toward the boss
        // (positive dot product between bullet velocity and the to-boss vector)
        const dot = b.dx * toBossX + b.dy * toBossY;
        if (dot <= 0) continue;

        // Normalise bullet direction
        const bLen = Math.sqrt(b.dx * b.dx + b.dy * b.dy);
        if (bLen === 0) continue;
        const bDirX = b.dx / bLen;
        const bDirY = b.dy / bLen;

        // Perpendicular to bullet: two options, alternate each dodge
        boss.dodgeSide = !boss.dodgeSide;
        boss.dodgeDirX = boss.dodgeSide ? -bDirY : bDirY;
        boss.dodgeDirY = boss.dodgeSide ? bDirX : -bDirX;
        boss.dodgeTimer = BOSS_DODGE_DURATION;
        boss.dodgeCooldown = BOSS_DODGE_COOLDOWN;
        break; // one bullet is enough to trigger a dodge
    }
}

function shootAtPlayer(player) {
    const cx = boss.x + boss.width / 2;
    const cy = boss.y + boss.height / 2;
    // Lead the shot based on player velocity
    const px = (player.x + player.width / 2) + player.vx * BOSS_PREDICT_FRAMES;
    const py = (player.y + player.height / 2) + player.vy * BOSS_PREDICT_FRAMES;
    const angle = Math.atan2(py - cy, px - cx);

    // Shoot 3 bullets in a spread
    const spread = 0.3;
    for (let i = -1; i <= 1; i++) {
        const a = angle + i * spread;
        createBullet(cx, cy, Math.cos(a), Math.sin(a), false);
    }
    sfxBossShoot();
}

export function damageBoss(damage = 1) {
    boss.hp -= damage;
    boss.hitFlash = 8;
    return boss.hp <= 0;
}

export function clearBoss() {
    boss.active = false;
}
