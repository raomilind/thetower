// The Tower - Game Constants

// Canvas
export const NATIVE_WIDTH = 256;
export const NATIVE_HEIGHT = 248; // 24px HUD + 224px game area
export const SCALE = 3;
export const DISPLAY_WIDTH = NATIVE_WIDTH * SCALE;
export const DISPLAY_HEIGHT = NATIVE_HEIGHT * SCALE;

// HUD
export const HUD_HEIGHT = 24; // 24px: row 1 = lives, row 2 = ammo
export const GAME_AREA_Y = HUD_HEIGHT;
export const GAME_AREA_HEIGHT = NATIVE_HEIGHT - HUD_HEIGHT; // 224px, same as before

// Tiles
export const TILE_SIZE = 16;
export const ROOM_COLS = 16; // 256 / 16
export const ROOM_ROWS = 14; // 224 / 16 (game area)

// Player
export const PLAYER_SIZE = 16;
export const PLAYER_SPEED = 1.5;
export const PLAYER_MAX_LIVES = 10;
export const SHOOT_COOLDOWN = 15; // frames
export const INVINCIBILITY_FRAMES = 60;

// Ammo
export const STARTING_AMMO = 10;
export const MAX_AMMO = 25;
export const BULLET_PACK_AMMO = 5;
export const BULLET_PACK_DROP_CHANCE = 0.3; // 30% chance on monster kill

// Sword
export const SWORD_RANGE = 40;       // pixels, melee reach
export const SWORD_COOLDOWN = 20;    // frames between swings
export const SWORD_SWING_FRAMES = 10; // frames the swing is visually active

// Bullets
export const BULLET_SPEED = 3;
export const BULLET_SIZE = 4;
export const BOSS_BULLET_SPEED = 1.8;
export const BOSS_BULLET_SIZE = 6;
export const MONSTER_BULLET_SPEED = 1.35;   // 75% of BOSS_BULLET_SPEED
export const MONSTER_BULLET_SIZE = 5;
export const MONSTER_SHOOT_INTERVAL = 200;  // frames between monster shots (~3.3s at 60fps)

// Monsters
export const MONSTER_SIZE = 16;
export const MONSTER_BASE_SPEED = 1.6;          // 2× previous speed
export const MONSTER_HP = 2; // Gun kills in 1 shot (2 dmg), sword takes 2 hits (1 dmg each)
export const MONSTER_CLOSE_RANGE = 50;          // px — burst range
export const MONSTER_CLOSE_SPEED_MULT = 1.5;    // speed multiplier when within close range
export const MONSTER_SEPARATION_RANGE = 20;     // px — push apart if within this range
export const MONSTER_SEPARATION_FORCE = 0.8;   // separation push strength per frame
export const MONSTER_PREDICT_FRAMES = 10;       // frames ahead to predict player position
export const MONSTER_STRIKER_RANGE = 32;        // px — monster this close = others circle and wait
export const MONSTER_SWORD_DODGE_RANGE  = 56;  // px — react if within this distance of player
export const MONSTER_SWORD_DODGE_SPEED  = 2.5; // multiplier when fleeing
export const MONSTER_SWORD_DODGE_FRAMES = 12;  // frames of dodge movement

// Boss
export const BOSS_SIZE = 32;
export const BOSS_HP = 10;
export const BOSS_SWORD_DODGE_RANGE = 60; // px — boss reacts to sword within this radius
export const BOSS_BASE_SPEED = 1.2;            // 2× previous speed
export const BOSS_PREFERRED_RANGE_MIN = 72;    // px — retreat if closer than this
export const BOSS_PREFERRED_RANGE_MAX = 130;   // px — advance if farther than this
export const BOSS_PREDICT_FRAMES = 15;         // frames ahead for bullet leading
export const BOSS_DODGE_RANGE = 80;        // px — bullet detection radius
export const BOSS_DODGE_SPEED_MULT = 2.8;  // how much faster the boss moves while dodging
export const BOSS_DODGE_DURATION = 18;     // frames the dodge lasts
export const BOSS_DODGE_COOLDOWN = 48;     // frames before the boss can dodge again

// Difficulty settings
export const DIFFICULTY = {
    easy: {
        monstersPerRoom: 3,
        monsterSpeedMult: 0.7,
        bossShootInterval: 180, // 3 seconds at 60fps
        bossSpeedMult: 0.6
    },
    normal: {
        monstersPerRoom: 4,
        monsterSpeedMult: 1.0,
        bossShootInterval: 120, // 2 seconds
        bossSpeedMult: 1.0
    },
    hard: {
        monstersPerRoom: 5,
        monsterSpeedMult: 1.4,
        bossShootInterval: 72, // 1.2 seconds
        bossSpeedMult: 1.3
    }
};

// Game states
export const STATE = {
    TITLE: 'title',
    DIFFICULTY_SELECT: 'difficulty',
    FLOOR_INTRO: 'floorIntro',
    PLAYING: 'playing',
    ROOM_TRANSITION: 'roomTransition',
    BOSS_INTRO: 'bossIntro',
    GAME_OVER: 'gameOver',
    FLOOR_CLEAR: 'floorClear',
    WIN: 'win'
};

// Directions
export const DIR = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3
};

// Direction vectors
export const DIR_VEC = {
    [DIR.UP]: { x: 0, y: -1 },
    [DIR.RIGHT]: { x: 1, y: 0 },
    [DIR.DOWN]: { x: 0, y: 1 },
    [DIR.LEFT]: { x: -1, y: 0 }
};

// Floor themes
export const FLOORS = [
    { name: 'Dungeon', colors: { wall: '#555555', floor: '#3a3a3a', accent: '#8B6914' }, monsters: ['Rat', 'Bat'], boss: 'Giant Spider' },
    { name: 'Sewers', colors: { wall: '#2d4a2d', floor: '#1a2e1a', accent: '#5c4033' }, monsters: ['Slime', 'Croc'], boss: 'Sewer Beast' },
    { name: 'Forest', colors: { wall: '#2d5a1e', floor: '#1a3a10', accent: '#8B4513' }, monsters: ['Wolf', 'Goblin'], boss: 'Treant' },
    { name: 'Graveyard', colors: { wall: '#4a3a5c', floor: '#2a1a3c', accent: '#808080' }, monsters: ['Skeleton', 'Zombie'], boss: 'Lich' },
    { name: 'Ice Cave', colors: { wall: '#7ab8cc', floor: '#4a88aa', accent: '#ffffff' }, monsters: ['Ice Elem', 'Frost Wolf'], boss: 'Frost Giant' },
    { name: 'Volcano', colors: { wall: '#8B2500', floor: '#4a1a00', accent: '#FF4500' }, monsters: ['Fire Imp', 'Lava Snake'], boss: 'Fire Dragon' },
    { name: 'Swamp', colors: { wall: '#3a5a2a', floor: '#2a3a1a', accent: '#6B8E23' }, monsters: ['Bog Thing', 'Toxic Frog'], boss: 'Swamp Hydra' },
    { name: 'Sky Castle', colors: { wall: '#b0c4de', floor: '#87CEEB', accent: '#F0F8FF' }, monsters: ['Harpy', 'Cloud Spirit'], boss: 'Storm Eagle' },
    { name: 'Shadow Realm', colors: { wall: '#2a1a3a', floor: '#1a0a2a', accent: '#9400D3' }, monsters: ['Dark Knight', 'Wraith'], boss: 'Shadow Lord' },
    { name: 'Throne Room', colors: { wall: '#DAA520', floor: '#8B0000', accent: '#4169E1' }, monsters: ['Elite Guard', 'Dark Wizard'], boss: 'Dark King' }
];

export const ROOMS_PER_FLOOR = 8; // legacy default — paths are now dynamic
export const TOTAL_FLOORS = 10;

// Path branching system
export const PATH_CONFIG = {
    short:  { rooms: 8,  monsterBonus: 0, speedBonus: 0   },
    medium: { rooms: 16, monsterBonus: 2, speedBonus: 0.3 },
    long:   { rooms: 24, monsterBonus: 4, speedBonus: 0.6 },
};
