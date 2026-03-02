// The Tower - Monster Entity

import { MONSTER_SIZE, MONSTER_BASE_SPEED, MONSTER_HP, MONSTER_CLOSE_RANGE, MONSTER_CLOSE_SPEED_MULT, MONSTER_SEPARATION_RANGE, MONSTER_SEPARATION_FORCE, MONSTER_PREDICT_FRAMES, MONSTER_STRIKER_RANGE, MONSTER_SWORD_DODGE_RANGE, MONSTER_SWORD_DODGE_SPEED, MONSTER_SWORD_DODGE_FRAMES, MONSTER_SHOOT_INTERVAL, GAME_AREA_Y, TILE_SIZE, NATIVE_WIDTH, NATIVE_HEIGHT } from './constants.js';
import { collidesWithWalls } from './collision.js';
import { createMonsterBullet } from './bullet.js';

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
            hp: MONSTER_HP,
            active: true,
            moveTimer: Math.random() * 60,
            wanderAngle: Math.random() * Math.PI * 2,
            hitFlash: 0,
            swordDodgeTimer: 0,
            swordDodgeAngle: 0,
            flankOffset: (Math.random() - 0.5) * Math.PI, // personal approach angle offset
            shootTimer: Math.floor(Math.random() * MONSTER_SHOOT_INTERVAL), // stagger first shots
        });
    }
}

export function updateMonsters(player, speedMult, roomLayout, activated = true) {
    if (!activated) {
        // Idle wander — monsters haven't noticed the player yet
        for (const m of monsters) {
            if (!m.active) continue;
            m.moveTimer++;
            // Pick a new random direction every 40 frames, or when hitting a wall
            if (m.moveTimer % 40 === 0) {
                m.wanderAngle = Math.random() * Math.PI * 2;
            }
            const moveX = Math.cos(m.wanderAngle) * m.speed * speedMult * 0.3;
            const moveY = Math.sin(m.wanderAngle) * m.speed * speedMult * 0.3;
            const newX = m.x + moveX;
            const newY = m.y + moveY;
            const testX = { x: newX, y: m.y, width: m.width, height: m.height };
            if (newX > 0 && newX < NATIVE_WIDTH - m.width && !collidesWithWalls(testX, roomLayout)) {
                m.x = newX;
            } else {
                m.wanderAngle = Math.random() * Math.PI * 2;
            }
            const testY = { x: m.x, y: newY, width: m.width, height: m.height };
            if (newY > GAME_AREA_Y && newY < NATIVE_HEIGHT - m.height && !collidesWithWalls(testY, roomLayout)) {
                m.y = newY;
            } else {
                m.wanderAngle = Math.random() * Math.PI * 2;
            }
            if (m.hitFlash > 0) m.hitFlash--;
        }
        return;
    }

    // Count monsters currently in striker range (close enough to be "attacking")
    let strikerCount = 0;
    for (const m of monsters) {
        if (!m.active) continue;
        const adx = player.x - m.x, ady = player.y - m.y;
        if (Math.sqrt(adx * adx + ady * ady) < MONSTER_STRIKER_RANGE) strikerCount++;
    }

    for (const m of monsters) {
        if (!m.active) continue;

        m.moveTimer++;

        // Actual distance to player (for dodge checks and close-burst)
        const adx = player.x - m.x;
        const ady = player.y - m.y;
        const actualDist = Math.sqrt(adx * adx + ady * ady);

        // Predicted player position
        const targetX = player.x + player.vx * MONSTER_PREDICT_FRAMES;
        const targetY = player.y + player.vy * MONSTER_PREDICT_FRAMES;
        const pdx = targetX - m.x;
        const pdy = targetY - m.y;
        const predDist = Math.sqrt(pdx * pdx + pdy * pdy);

        let moveX, moveY;

        // --- Sword dodge: circle around the sword arc ---
        const swordActive = player.weapon === 'sword' && player.swordSwing > 0;
        if (swordActive && m.swordDodgeTimer <= 0 && actualDist <= MONSTER_SWORD_DODGE_RANGE) {
            const sx = m.x - player.x;
            const sy = m.y - player.y;
            const side = Math.random() < 0.5 ? 1 : -1;
            m.swordDodgeAngle = Math.atan2(side * sx, -side * sy);
            m.swordDodgeTimer = MONSTER_SWORD_DODGE_FRAMES;
        }

        if (m.swordDodgeTimer > 0) {
            // Dodge takes full priority
            m.swordDodgeTimer--;
            moveX = Math.cos(m.swordDodgeAngle) * m.speed * speedMult * MONSTER_SWORD_DODGE_SPEED;
            moveY = Math.sin(m.swordDodgeAngle) * m.speed * speedMult * MONSTER_SWORD_DODGE_SPEED;
        } else {
            const isStriker = actualDist < MONSTER_STRIKER_RANGE;
            const holdBack = strikerCount > 0 && !isStriker;

            if (holdBack && actualDist > 0) {
                // --- Coordinate attack: non-strikers circle and wait ---
                const circleDir = m.moveTimer % 120 < 60 ? 1 : -1;
                // Perpendicular to player direction (orbit)
                moveX = circleDir * (-ady / actualDist) * m.speed * speedMult * 0.5;
                moveY = circleDir * (adx / actualDist) * m.speed * speedMult * 0.5;
            } else if (predDist > 0) {
                // --- Chase predicted position with flanking ---
                const chaseRatio = 0.88;
                const wanderRatio = 0.12;

                if (m.moveTimer % 60 === 0) {
                    m.wanderAngle += (Math.random() - 0.5) * Math.PI;
                }

                // Flanking angle fades out as monster closes in
                const flankInfluence = Math.max(0, 1 - actualDist / 120);
                const chaseAngle = Math.atan2(pdy, pdx) + m.flankOffset * flankInfluence;

                moveX = Math.cos(chaseAngle) * chaseRatio + Math.cos(m.wanderAngle) * wanderRatio;
                moveY = Math.sin(chaseAngle) * chaseRatio + Math.sin(m.wanderAngle) * wanderRatio;

                const mag = Math.sqrt(moveX * moveX + moveY * moveY);
                const closeMult = actualDist < MONSTER_CLOSE_RANGE ? MONSTER_CLOSE_SPEED_MULT : 1;
                if (mag > 0) {
                    moveX = (moveX / mag) * m.speed * speedMult * closeMult;
                    moveY = (moveY / mag) * m.speed * speedMult * closeMult;
                }
            } else {
                moveX = 0;
                moveY = 0;
            }

            // --- Separation: push away from nearby monsters ---
            for (const other of monsters) {
                if (other === m || !other.active) continue;
                const sdx = m.x - other.x;
                const sdy = m.y - other.y;
                const sdist = Math.sqrt(sdx * sdx + sdy * sdy);
                if (sdist < MONSTER_SEPARATION_RANGE && sdist > 0) {
                    const strength = (MONSTER_SEPARATION_RANGE - sdist) / MONSTER_SEPARATION_RANGE;
                    moveX += (sdx / sdist) * strength * MONSTER_SEPARATION_FORCE;
                    moveY += (sdy / sdist) * strength * MONSTER_SEPARATION_FORCE;
                }
            }
        }

        // Try to move (wall collision always runs)
        const newX = m.x + moveX;
        const newY = m.y + moveY;

        const testX = { x: newX, y: m.y, width: m.width, height: m.height };
        if (newX > 0 && newX < NATIVE_WIDTH - m.width && !collidesWithWalls(testX, roomLayout)) {
            m.x = newX;
        } else {
            m.wanderAngle += Math.PI / 2;
        }

        const testY = { x: m.x, y: newY, width: m.width, height: m.height };
        if (newY > GAME_AREA_Y && newY < NATIVE_HEIGHT - m.height && !collidesWithWalls(testY, roomLayout)) {
            m.y = newY;
        } else {
            m.wanderAngle -= Math.PI / 2;
        }

        // Monster shoots a fireball toward the player
        m.shootTimer++;
        if (m.shootTimer >= MONSTER_SHOOT_INTERVAL) {
            m.shootTimer = 0;
            const fdx = (player.x + player.width / 2) - (m.x + m.width / 2);
            const fdy = (player.y + player.height / 2) - (m.y + m.height / 2);
            const fdist = Math.sqrt(fdx * fdx + fdy * fdy);
            if (fdist > 0) {
                createMonsterBullet(m.x + m.width / 2, m.y + m.height / 2, fdx / fdist, fdy / fdist);
            }
        }

        if (m.hitFlash > 0) m.hitFlash--;
    }
}

export function killMonster(monster) {
    monster.hp = 0;
    monster.active = false;
}

// Returns true if the monster died from this damage
export function damageMonster(monster, amount) {
    monster.hp -= amount;
    monster.hitFlash = 8;
    if (monster.hp <= 0) {
        monster.active = false;
        return true;
    }
    return false;
}

export function getActiveMonsters() {
    return monsters.filter(m => m.active);
}

export function clearMonsters() {
    monsters.length = 0;
}
