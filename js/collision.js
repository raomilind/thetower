// The Tower - Collision Detection

import { TILE_SIZE, GAME_AREA_Y, ROOM_COLS, ROOM_ROWS } from './constants.js';

// Axis-aligned bounding box collision
export function aabbCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// Check if entity overlaps with any wall tile
export function collidesWithWalls(entity, roomLayout) {
    const left = Math.floor(entity.x / TILE_SIZE);
    const right = Math.floor((entity.x + entity.width - 1) / TILE_SIZE);
    const top = Math.floor((entity.y - GAME_AREA_Y) / TILE_SIZE);
    const bottom = Math.floor((entity.y + entity.height - 1 - GAME_AREA_Y) / TILE_SIZE);

    for (let row = top; row <= bottom; row++) {
        for (let col = left; col <= right; col++) {
            if (row < 0 || row >= ROOM_ROWS || col < 0 || col >= ROOM_COLS) {
                return true; // Out of bounds = wall
            }
            if (roomLayout[row] && roomLayout[row][col] === 1) {
                return true; // 1 = wall tile
            }
        }
    }
    return false;
}

// Distance between centers of two entities
export function distanceBetween(a, b) {
    const ax = a.x + a.width / 2;
    const ay = a.y + a.height / 2;
    const bx = b.x + b.width / 2;
    const by = b.y + b.height / 2;
    return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

// Angle from entity a to entity b
export function angleBetween(a, b) {
    const ax = a.x + a.width / 2;
    const ay = a.y + a.height / 2;
    const bx = b.x + b.width / 2;
    const by = b.y + b.height / 2;
    return Math.atan2(by - ay, bx - ax);
}

// Check if point is near entity (for heart pickup)
export function isNearEntity(pointEntity, targetEntity, range) {
    return distanceBetween(pointEntity, targetEntity) < range;
}
