// The Tower - Monster Entity

import { MONSTER_SIZE, MONSTER_BASE_SPEED, GAME_AREA_Y, TILE_SIZE, NATIVE_WIDTH, NATIVE_HEIGHT } from './constants.js';
import { collidesWithWalls } from './collision.js';

export const monsters = [];

export function spawnMonsters(count, roomLayout, floorIndex) {
    monsters.length = 0;

    for (let i = 0; i < count; i++) {
        let x, y, valid;
        let attempts = 0;

        // Find a valid spawn position (not on walls, not too close to player start)
        do {
            x = TILE_SIZE * 2 + Math.random() * (NATIVE_WIDTH - TILE_SIZE * 6);
            y = GAME_AREA_Y + TILE_SIZE * 2 + Math.random() * (NATIVE_HEIGHT - GAME_AREA_Y - TILE_SIZE * 5);
            valid = !collidesWithWalls({ x, y, width: MONSTER_SIZE, height: MONSTER_SIZE }, roomLayout);
            // Don't spawn too close to left side where player starts
            if (x < 80) valid = false;
            attempts++;
        } while (!valid && attempts < 100);

        monsters.push({
            x,
            y,
            width: MONSTER_SIZE,
            height: MONSTER_SIZE,
            type: Math.random() < 0.5 ? 0 : 1, // type 0 or 1 for the floor
            speed: MONSTER_BASE_SPEED,
            active: true,
            moveTimer: Math.random() * 60,
            wanderAngle: Math.random() * Math.PI * 2,
            hitFlash: 0,
        });
    }
}

export function updateMonsters(player, speedMult, roomLayout) {
    for (const m of monsters) {
        if (!m.active) continue;

        m.moveTimer++;

        // Chase player with some randomness
        const dx = player.x - m.x;
        const dy = player.y - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let moveX, moveY;

        if (dist > 0) {
            // Mix between direct chase and wander
            const chaseRatio = 0.7;
            const wanderRatio = 0.3;

            // Update wander angle periodically
            if (m.moveTimer % 60 === 0) {
                m.wanderAngle += (Math.random() - 0.5) * Math.PI;
            }

            moveX = (dx / dist) * chaseRatio + Math.cos(m.wanderAngle) * wanderRatio;
            moveY = (dy / dist) * chaseRatio + Math.sin(m.wanderAngle) * wanderRatio;

            // Normalize
            const mag = Math.sqrt(moveX * moveX + moveY * moveY);
            if (mag > 0) {
                moveX = (moveX / mag) * m.speed * speedMult;
                moveY = (moveY / mag) * m.speed * speedMult;
            }
        } else {
            moveX = 0;
            moveY = 0;
        }

        // Try to move
        const newX = m.x + moveX;
        const newY = m.y + moveY;

        const testX = { x: newX, y: m.y, width: m.width, height: m.height };
        if (newX > 0 && newX < NATIVE_WIDTH - m.width && !collidesWithWalls(testX, roomLayout)) {
            m.x = newX;
        } else {
            m.wanderAngle += Math.PI / 2; // bounce wander angle
        }

        const testY = { x: m.x, y: newY, width: m.width, height: m.height };
        if (newY > GAME_AREA_Y && newY < NATIVE_HEIGHT - m.height && !collidesWithWalls(testY, roomLayout)) {
            m.y = newY;
        } else {
            m.wanderAngle -= Math.PI / 2;
        }

        if (m.hitFlash > 0) m.hitFlash--;
    }
}

export function killMonster(monster) {
    monster.active = false;
}

export function getActiveMonsters() {
    return monsters.filter(m => m.active);
}

export function clearMonsters() {
    monsters.length = 0;
}
