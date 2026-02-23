# The Tower

> *A soldier. A princess. Ten floors of monsters standing in the way.*

**The Tower** is a browser-based 8-bit top-down shooter inspired by the original Legend of Zelda. Fight your way through a 10-floor tower packed with themed dungeons, deadly monsters, and brutal boss fights — all rendered in classic pixel art with chiptune sound effects, built entirely from scratch with no libraries or external assets.

---

## Screenshots / Gameplay

| Title Screen | Dungeon Floor | Boss Fight |
|---|---|---|
| Classic 8-bit tower intro | Room-by-room monster clearing | 10-hit boss encounters |

---

## Features

- **10 uniquely themed floors** — Dungeon, Sewers, Forest, Graveyard, Ice Cave, Volcano, Swamp, Sky Castle, Shadow Realm, and Throne Room — each with its own color palette, monster types, and boss
- **80 rooms total** — 8 rooms per floor, each procedurally laid out with different obstacle patterns
- **Boss battles** — every floor ends with a boss that chases you, repositions, and fires spread-shot bullet patterns. Takes 10 hits to bring down
- **Ammo system** — start each floor with 10 bullets. Enemies randomly drop ammo crates worth +5 bullets. Max capacity of 25. Manage your shots carefully
- **Lives & hearts** — 10 lives per floor. Hearts drop after clearing each room; walk up and press Space to collect one and restore a life
- **3 difficulty modes** — Easy, Normal, and Hard scale monster count, movement speed, and boss aggression
- **Zelda-style room transitions** — screen slides left as you walk through the exit, just like the classic
- **Programmatic pixel art** — every sprite is drawn in code as a 16×16 color array, no image files
- **8-bit audio** — all sound effects generated at runtime using the Web Audio API oscillators

---

## How to Play

### Goal
Clear all 8 rooms on each of the 10 floors. Defeat the boss on room 8 of every floor. Reach the top — rescue the princess.

### Controls

| Action | Keys |
|---|---|
| Move | `W A S D` or `↑ ↓ ← →` |
| Shoot | `Space` — fires in the direction you're facing |
| Pick up heart | Stand near it and press `Space` |
| Pick up ammo | Walk over the crate — auto collected |

### Tips
- You can't move to the next room until every monster is dead
- Bosses have 3 phases: chase, spread-shot, and reposition — learn the pattern
- Ammo carries over between floors (minimum 10 guaranteed at each new floor)
- Lose all 10 lives and you restart the current floor — not the whole game

---

## Running the Game

The game uses ES Modules, so it must be served over HTTP — it won't work by double-clicking `index.html`.

**Option 1 — PowerShell (included, no install needed):**
```powershell
powershell -ExecutionPolicy Bypass -File server.ps1
```
Then open **http://localhost:8080** in your browser.

**Option 2 — Python:**
```bash
python -m http.server 8080
```

**Option 3 — Node.js / npx:**
```bash
npx serve .
```

---

## Tech Stack

| | |
|---|---|
| Language | Vanilla JavaScript (ES Modules) |
| Rendering | HTML5 Canvas API |
| Audio | Web Audio API (no audio files) |
| Art | Programmatic pixel sprites (no image files) |
| Dependencies | **Zero** |
| Build tools | **None** |

Everything — sprites, sounds, collision, AI, menus — is written from scratch in plain JavaScript. Open `index.html` and the game runs.

---

## Project Structure

```
the-tower/
├── index.html
├── server.ps1          # Local dev server (PowerShell)
├── css/
│   └── style.css
└── js/
    ├── main.js         # Game loop
    ├── state.js        # Game state machine
    ├── renderer.js     # All canvas rendering
    ├── sprites.js      # Pixel art data
    ├── audio.js        # 8-bit sound effects
    ├── player.js       # Player entity
    ├── monster.js      # Monster AI
    ├── boss.js         # Boss AI & shooting patterns
    ├── bullet.js       # Projectile system
    ├── heart.js        # Heart pickup
    ├── bulletpack.js   # Ammo pickup
    ├── room.js         # Room generation
    ├── floor.js        # Floor progression
    ├── collision.js    # AABB collision
    ├── input.js        # Keyboard handling
    └── constants.js    # Game configuration
```

---

*Built with HTML5 Canvas + pure JavaScript. No frameworks. No build step. Just open and play.*
