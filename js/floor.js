// The Tower - Floor Management

import { FLOORS, ROOMS_PER_FLOOR, TOTAL_FLOORS } from './constants.js';

export const gameProgress = {
    currentFloor: 0,
    currentRoom: 0,
    difficulty: 'normal',
    roomCleared: false,
    heartCollected: false,
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
    return gameProgress.currentRoom === ROOMS_PER_FLOOR - 1;
}

export function isLastFloor() {
    return gameProgress.currentFloor === TOTAL_FLOORS - 1;
}

export function advanceRoom() {
    gameProgress.currentRoom++;
    gameProgress.roomCleared = false;
    gameProgress.heartCollected = false;
    return gameProgress.currentRoom >= ROOMS_PER_FLOOR;
}

export function advanceFloor() {
    gameProgress.currentFloor++;
    gameProgress.currentRoom = 0;
    gameProgress.roomCleared = false;
    gameProgress.heartCollected = false;
    return gameProgress.currentFloor >= TOTAL_FLOORS;
}

export function restartFloor() {
    gameProgress.currentRoom = 0;
    gameProgress.roomCleared = false;
    gameProgress.heartCollected = false;
}

export function resetProgress() {
    gameProgress.currentFloor = 0;
    gameProgress.currentRoom = 0;
    gameProgress.difficulty = 'normal';
    gameProgress.roomCleared = false;
    gameProgress.heartCollected = false;
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
