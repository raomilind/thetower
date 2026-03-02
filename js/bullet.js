// The Tower - Bullet System

import { BULLET_SPEED, BULLET_SIZE, BOSS_BULLET_SPEED, BOSS_BULLET_SIZE, MONSTER_BULLET_SPEED, MONSTER_BULLET_SIZE, NATIVE_WIDTH, NATIVE_HEIGHT } from './constants.js';

export const bullets = [];

export function createBullet(x, y, dx, dy, isPlayerBullet = true) {
    const speed = isPlayerBullet ? BULLET_SPEED : BOSS_BULLET_SPEED;
    const size = isPlayerBullet ? BULLET_SIZE : BOSS_BULLET_SIZE;
    bullets.push({
        x: x - size / 2,
        y: y - size / 2,
        width: size,
        height: size,
        dx: dx * speed,
        dy: dy * speed,
        isPlayerBullet,
        isMonsterBullet: false,
        active: true
    });
}

export function createMonsterBullet(x, y, dx, dy) {
    bullets.push({
        x: x - MONSTER_BULLET_SIZE / 2,
        y: y - MONSTER_BULLET_SIZE / 2,
        width: MONSTER_BULLET_SIZE,
        height: MONSTER_BULLET_SIZE,
        dx: dx * MONSTER_BULLET_SPEED,
        dy: dy * MONSTER_BULLET_SPEED,
        isPlayerBullet: false,
        isMonsterBullet: true,
        active: true
    });
}

export function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        b.x += b.dx;
        b.y += b.dy;

        // Remove if off screen
        if (b.x < -10 || b.x > NATIVE_WIDTH + 10 || b.y < -10 || b.y > NATIVE_HEIGHT + 10) {
            bullets.splice(i, 1);
        }
    }
}

export function clearBullets() {
    bullets.length = 0;
}

export function removeBullet(bullet) {
    bullet.active = false;
    const idx = bullets.indexOf(bullet);
    if (idx !== -1) bullets.splice(idx, 1);
}
