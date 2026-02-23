// The Tower - Room Management

import { ROOM_COLS, ROOM_ROWS, ROOMS_PER_FLOOR } from './constants.js';

// Room layout: 0 = floor, 1 = wall
// Layout is ROOM_ROWS x ROOM_COLS (14 x 16)

// Generate a room layout with walls around edges and some interior walls
export function generateRoomLayout(floorIndex, roomIndex) {
    const layout = [];

    // Fill with floor
    for (let r = 0; r < ROOM_ROWS; r++) {
        layout[r] = [];
        for (let c = 0; c < ROOM_COLS; c++) {
            layout[r][c] = 0;
        }
    }

    // Walls on top and bottom
    for (let c = 0; c < ROOM_COLS; c++) {
        layout[0][c] = 1;
        layout[ROOM_ROWS - 1][c] = 1;
    }

    // Walls on left
    for (let r = 0; r < ROOM_ROWS; r++) {
        layout[r][0] = 1;
    }

    // Right wall - with opening if room is cleared (handled in rendering)
    // Always draw right wall; the opening is managed by game state
    for (let r = 0; r < ROOM_ROWS; r++) {
        layout[r][ROOM_COLS - 1] = 1;
    }

    // Add interior obstacles based on a seed from floor+room
    const seed = floorIndex * 100 + roomIndex;
    const rng = seededRandom(seed);

    // Different room patterns
    const pattern = roomIndex % 4;

    if (roomIndex === ROOMS_PER_FLOOR - 1) {
        // Boss room - more open, just some pillars
        addPillars(layout, rng);
    } else {
        switch (pattern) {
            case 0:
                addCornerWalls(layout, rng);
                break;
            case 1:
                addCenterBlock(layout, rng);
                break;
            case 2:
                addHorizontalWalls(layout, rng);
                break;
            case 3:
                addPillars(layout, rng);
                break;
        }
    }

    return layout;
}

// Open the right wall for passage (called when room is cleared)
export function openRightWall(layout) {
    // Open a gap in the middle of the right wall
    const midRow = Math.floor(ROOM_ROWS / 2);
    for (let r = midRow - 2; r <= midRow + 1; r++) {
        if (r >= 0 && r < ROOM_ROWS) {
            layout[r][ROOM_COLS - 1] = 0;
        }
    }
}

// Simple seeded random number generator
function seededRandom(seed) {
    let s = seed;
    return function() {
        s = (s * 1103515245 + 12345) & 0x7fffffff;
        return s / 0x7fffffff;
    };
}

function addCornerWalls(layout, rng) {
    // L-shaped walls in corners
    const size = 2 + Math.floor(rng() * 2);

    // Top-left corner extension
    for (let r = 1; r < 1 + size; r++) {
        for (let c = 1; c < 1 + size; c++) {
            if (r < ROOM_ROWS && c < ROOM_COLS) layout[r][c] = 1;
        }
    }

    // Bottom-right corner extension
    for (let r = ROOM_ROWS - 1 - size; r < ROOM_ROWS - 1; r++) {
        for (let c = ROOM_COLS - 1 - size; c < ROOM_COLS - 1; c++) {
            if (r >= 0 && c >= 0) layout[r][c] = 1;
        }
    }
}

function addCenterBlock(layout, rng) {
    // Block in the center
    const cx = Math.floor(ROOM_COLS / 2);
    const cy = Math.floor(ROOM_ROWS / 2);
    const size = 1 + Math.floor(rng() * 2);

    for (let r = cy - size; r <= cy + size; r++) {
        for (let c = cx - size; c <= cx + size; c++) {
            if (r > 0 && r < ROOM_ROWS - 1 && c > 0 && c < ROOM_COLS - 1) {
                layout[r][c] = 1;
            }
        }
    }
}

function addHorizontalWalls(layout, rng) {
    // Two horizontal walls with gaps
    const r1 = 3 + Math.floor(rng() * 2);
    const r2 = ROOM_ROWS - 4 - Math.floor(rng() * 2);
    const gap1 = 2 + Math.floor(rng() * (ROOM_COLS - 6));
    const gap2 = 2 + Math.floor(rng() * (ROOM_COLS - 6));

    for (let c = 2; c < ROOM_COLS - 2; c++) {
        if (Math.abs(c - gap1) > 1) layout[r1][c] = 1;
        if (Math.abs(c - gap2) > 1) layout[r2][c] = 1;
    }
}

function addPillars(layout, rng) {
    // 4 pillars (2x2 blocks)
    const positions = [
        [3, 4], [3, ROOM_COLS - 6],
        [ROOM_ROWS - 5, 4], [ROOM_ROWS - 5, ROOM_COLS - 6]
    ];

    for (const [pr, pc] of positions) {
        if (rng() < 0.7) { // 70% chance for each pillar
            for (let r = pr; r < pr + 2; r++) {
                for (let c = pc; c < pc + 2; c++) {
                    if (r > 0 && r < ROOM_ROWS - 1 && c > 0 && c < ROOM_COLS - 1) {
                        layout[r][c] = 1;
                    }
                }
            }
        }
    }
}
