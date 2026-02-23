// The Tower - Bullet Pack Pickup

export const bulletPacks = [];

export function spawnBulletPack(x, y) {
    bulletPacks.push({
        x: x - 8,
        y: y - 8,
        width: 16,
        height: 16,
        active: true,
        bobTimer: Math.random() * Math.PI * 2, // stagger bob so packs don't all sync
    });
}

export function updateBulletPacks() {
    for (const p of bulletPacks) {
        if (!p.active) continue;
        p.bobTimer++;
        p.bobOffset = Math.sin(p.bobTimer * 0.12) * 2;
    }
}

export function getActiveBulletPacks() {
    return bulletPacks.filter(p => p.active);
}

export function collectBulletPack(pack) {
    pack.active = false;
}

export function clearBulletPacks() {
    bulletPacks.length = 0;
}
