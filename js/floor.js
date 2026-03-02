// The Tower - Floor Management

import { FLOORS, TOTAL_FLOORS, PATH_CONFIG } from './constants.js';

export const gameProgress = {
    currentFloor: 0,
    currentRoom: 0,
    difficulty: 'normal',
    roomCleared: false,
    heartCollected: false,
    visitedRooms: {}, // keyed by room index — stores snapshots of each visited room
    // Path branching
    selectedPath: null,    // 'short' | 'medium' | 'long' — null until player chooses in crossroads
    pathRooms: 0,          // number of rooms in the chosen path (8, 16, or 24)
    pathAssignment: {},    // { right: 'short', up: 'medium', down: 'long' } — randomised each floor
};

export function getCurrentFloor() {
    return FLOORS[gameProgress.currentFloor];
}

export function getCurrentFloorIndex() {
    return gameProgress.currentFloor;
}

export function getCurrentRoom() {
    return gameProgress.currentRoom;
}

export function isBossRoom() {
    return gameProgress.selectedPath !== null && gameProgress.currentRoom === gameProgress.pathRooms;
}

export function isCrossroadsRoom() {
    return gameProgress.currentRoom === 0;
}

// Total rooms in the chosen path (not counting crossroads room 0)
export function getRoomsPerFloor() {
    return gameProgress.pathRooms;
}

// Randomly assign short/medium/long paths to the three exits; call at the start of each floor
export function initFloorPaths() {
    const paths = ['short', 'medium', 'long'];
    // Fisher-Yates shuffle
    for (let i = paths.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [paths[i], paths[j]] = [paths[j], paths[i]];
    }
    gameProgress.pathAssignment = { right: paths[0], up: paths[1], down: paths[2] };
    gameProgress.selectedPath = null;
    gameProgress.pathRooms = 0;
}

// Called when the player commits to a path exit ('right' | 'up' | 'down')
export function selectPath(exit) {
    const pathName = gameProgress.pathAssignment[exit];
    gameProgress.selectedPath = pathName;
    gameProgress.pathRooms = PATH_CONFIG[pathName].rooms;
}

export function isLastFloor() {
    return gameProgress.currentFloor === TOTAL_FLOORS - 1;
}

export function advanceRoom() {
    gameProgress.currentRoom++;
    gameProgress.roomCleared = false;
    gameProgress.heartCollected = false;
    return gameProgress.currentRoom > gameProgress.pathRooms;
}

export function advanceFloor() {
    gameProgress.currentFloor++;
    gameProgress.currentRoom = 0;
    gameProgress.roomCleared = false;
    gameProgress.heartCollected = false;
    gameProgress.visitedRooms = {};
    gameProgress.selectedPath = null;
    gameProgress.pathRooms = 0;
    gameProgress.pathAssignment = {};
    return gameProgress.currentFloor >= TOTAL_FLOORS;
}

export function restartFloor() {
    gameProgress.currentRoom = 0;
    gameProgress.roomCleared = false;
    gameProgress.heartCollected = false;
    gameProgress.visitedRooms = {};
    gameProgress.selectedPath = null;
    gameProgress.pathRooms = 0;
    gameProgress.pathAssignment = {};
}

export function resetProgress() {
    gameProgress.currentFloor = 0;
    gameProgress.currentRoom = 0;
    gameProgress.difficulty = 'normal';
    gameProgress.roomCleared = false;
    gameProgress.heartCollected = false;
    gameProgress.visitedRooms = {};
    gameProgress.selectedPath = null;
    gameProgress.pathRooms = 0;
    gameProgress.pathAssignment = {};
}

export function setDifficulty(diff) {
    gameProgress.difficulty = diff;
}

export function markRoomCleared() {
    gameProgress.roomCleared = true;
}

export function markHeartCollected() {
    gameProgress.heartCollected = true;
}

// --- Back-navigation helpers ---

export function canGoBack() {
    return gameProgress.currentRoom > 0;
}

export function goBackRoom() {
    gameProgress.currentRoom--;
}

export function saveRoomState(roomIdx, state) {
    gameProgress.visitedRooms[roomIdx] = state;
}

export function getRoomState(roomIdx) {
    return gameProgress.visitedRooms[roomIdx] || null;
}
