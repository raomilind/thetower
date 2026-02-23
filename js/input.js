// The Tower - Input Handler

const keys = {};
const justPressed = {};

export function initInput() {
    window.addEventListener('keydown', (e) => {
        if (!keys[e.code]) {
            justPressed[e.code] = true;
        }
        keys[e.code] = true;
        // Prevent scrolling with arrow keys and space
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
            e.preventDefault();
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.code] = false;
    });
}

export function isKeyDown(code) {
    return !!keys[code];
}

export function isKeyJustPressed(code) {
    return !!justPressed[code];
}

export function clearJustPressed() {
    for (const key in justPressed) {
        delete justPressed[key];
    }
}

// Movement helpers
export function getMoveDir() {
    let dx = 0, dy = 0;
    if (isKeyDown('KeyW') || isKeyDown('ArrowUp')) dy = -1;
    if (isKeyDown('KeyS') || isKeyDown('ArrowDown')) dy = 1;
    if (isKeyDown('KeyA') || isKeyDown('ArrowLeft')) dx = -1;
    if (isKeyDown('KeyD') || isKeyDown('ArrowRight')) dx = 1;
    return { dx, dy };
}

export function isShootPressed() {
    return isKeyJustPressed('Space');
}

export function isActionPressed() {
    return isKeyJustPressed('Space');
}
