// The Tower - Player Entity

import { PLAYER_SIZE, PLAYER_SPEED, PLAYER_MAX_LIVES, SHOOT_COOLDOWN, INVINCIBILITY_FRAMES, DIR, DIR_VEC, GAME_AREA_Y, NATIVE_WIDTH, NATIVE_HEIGHT, STARTING_AMMO, MAX_AMMO } from './constants.js';
import { getMoveDir, isShootPressed } from './input.js';
import { createBullet } from './bullet.js';
import { collidesWithWalls } from './collision.js';
import { sfxShoot, sfxPlayerHit } from './audio.js';

export const player = {
    x: 32,
    y: GAME_AREA_Y + 96,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    direction: DIR.RIGHT,
    lives: PLAYER_MAX_LIVES,
    ammo: STARTING_AMMO,
    shootCooldown: 0,
    invincibility: 0,
    animFrame: 0,
    animTimer: 0,
    active: true,
};

export function resetPlayer(fullReset = false) {
    player.x = 32;
    player.y = GAME_AREA_Y + 96;
    player.direction = DIR.RIGHT;
    player.shootCooldown = 0;
    player.invincibility = 0;
    player.active = true;
    if (fullReset) {
        player.lives = PLAYER_MAX_LIVES;
    }
}

export function updatePlayer(roomLayout, roomCleared) {
    if (!player.active) return;

    // Movement
    const { dx, dy } = getMoveDir();

    if (dx !== 0 || dy !== 0) {
        // Update facing direction (prioritize last pressed)
        if (dx > 0) player.direction = DIR.RIGHT;
        else if (dx < 0) player.direction = DIR.LEFT;
        else if (dy < 0) player.direction = DIR.UP;
        else if (dy > 0) player.direction = DIR.DOWN;

        // Animation
        player.animTimer++;
        if (player.animTimer >= 8) {
            player.animTimer = 0;
            player.animFrame = (player.animFrame + 1) % 2;
        }

        // Try horizontal movement
        const newX = player.x + dx * PLAYER_SPEED;
        const testEntityX = { x: newX, y: player.y, width: player.width, height: player.height };
        // Boundary check
        const minX = 0;
        const maxX = NATIVE_WIDTH - player.width;
        if (newX >= minX && newX <= maxX && !collidesWithWalls(testEntityX, roomLayout)) {
            player.x = newX;
        }

        // Try vertical movement
        const newY = player.y + dy * PLAYER_SPEED;
        const testEntityY = { x: player.x, y: newY, width: player.width, height: player.height };
        const minY = GAME_AREA_Y;
        const maxY = NATIVE_HEIGHT - player.height;
        if (newY >= minY && newY <= maxY && !collidesWithWalls(testEntityY, roomLayout)) {
            player.y = newY;
        }
    }

    // Shooting
    if (player.shootCooldown > 0) {
        player.shootCooldown--;
    }

    if (isShootPressed() && player.shootCooldown <= 0 && player.ammo > 0) {
        const vec = DIR_VEC[player.direction];
        const cx = player.x + player.width / 2;
        const cy = player.y + player.height / 2;
        createBullet(cx, cy, vec.x, vec.y, true);
        player.ammo--;
        player.shootCooldown = SHOOT_COOLDOWN;
        sfxShoot();
    }

    // Invincibility countdown
    if (player.invincibility > 0) {
        player.invincibility--;
    }
}

export function damagePlayer() {
    if (player.invincibility > 0) return false;
    player.lives--;
    player.invincibility = INVINCIBILITY_FRAMES;
    sfxPlayerHit();
    return true;
}

export function healPlayer() {
    if (player.lives < PLAYER_MAX_LIVES) {
        player.lives++;
        return true;
    }
    return false;
}

export function addAmmo(amount) {
    if (player.ammo >= MAX_AMMO) return false;
    player.ammo = Math.min(MAX_AMMO, player.ammo + amount);
    return true;
}

export function ensureMinAmmo(min) {
    if (player.ammo < min) player.ammo = min;
}

// Check if player is at the right edge (for room transition)
export function isPlayerAtRightEdge() {
    return player.x >= NATIVE_WIDTH - player.width - 2;
}
