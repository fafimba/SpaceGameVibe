# Stellar Swarm - Boss System Integration Guide

This document provides code templates for integrating a boss system.

---

## Step 1: Add Boss to Enemy Types

```javascript
// Add to ENEMY_TYPES constant
const ENEMY_TYPES = {
    SCOUT: { /* ... */ },
    TANK: { /* ... */ },
    // ... existing types

    BOSS: {
        radius: 40,              // Large collision radius
        speed: 80,               // Slower than normal enemies
        turnRate: 45,            // Limited agility
        hp: 200,                 // Much higher HP
        points: 5000,            // High reward
        color: '#FF00FF',        // Magenta
        outline: '#AA00AA'
    }
};
```

---

## Step 2: Add Boss Spawn Logic

Insert into `updateSpawnSystem()` function:

```javascript
function updateSpawnSystem() {
    // ... existing spawn timer code ...

    // Check for boss spawn condition
    if (!bossSpawned && (playerLevel >= 5 || score >= 10000)) {
        spawnBoss();
        bossSpawned = true;
    }
}

function spawnBoss() {
    if (!player) return;

    const config = ENEMY_TYPES['BOSS'];
    const angleToPlayer = Math.atan2(player.y - player.y, player.x - (player.x + 1200));

    const boss = pools.enemy.acquire();
    boss.x = player.x + Math.cos(angleToPlayer) * 1200;
    boss.y = player.y + Math.sin(angleToPlayer) * 1200;
    boss.vx = 0;
    boss.vy = 0;
    boss.angle = angleToPlayer * 180 / Math.PI;
    boss.type = 'BOSS';
    boss.hp = config.hp;
    boss.maxHp = config.hp;
    boss.fireTimer = 0;
    boss.burstCooldown = 0;
    boss.spawnTime = gameTime;
    boss.offScreenTime = 0;
    boss.phase = 1;              // Boss phase tracking
    boss.phaseTimer = 0;         // Time in current phase
    boss.patternTimer = 0;       // Attack pattern timer
    boss.patternIndex = 0;       // Which attack pattern

    // Trigger wave alert
    waveAlertActive = true;
    waveAlertTimer = 0;
    waveAlertNumber = 'BOSS!';
    waveAlertSubtitle = 'INCOMING!';

    enemies.push(boss);
}
```

---

## Step 3: Add Boss AI to updateEnemies()

Add this case to the enemy type checks in `updateEnemies()`:

```javascript
// In updateEnemies() function, add after TANK handling:

if (e.type === 'BOSS') {
    updateBossAI(e);
}

function updateBossAI(boss) {
    if (!player) return;

    const config = ENEMY_TYPES['BOSS'];
    const dx = player.x - boss.x;
    const dy = player.y - boss.y;
    const distToPlayer = Math.sqrt(dx * dx + dy * dy);
    const targetAngle = Math.atan2(dy, dx) * 180 / Math.PI;

    // Phase progression (HP-based)
    if (boss.hp < boss.maxHp * 0.5 && boss.phase === 1) {
        boss.phase = 2;
        boss.phaseTimer = 0;
        triggerFlash(COLORS.RARE, 0.3, 300);  // Phase transition flash
    }

    // Maintain distance from player
    const desiredDistance = 300;
    if (distToPlayer < desiredDistance) {
        // Back away
        boss.vx = Math.cos(targetAngle) * -200;
        boss.vy = Math.sin(targetAngle) * -200;
    } else if (distToPlayer > desiredDistance + 100) {
        // Move closer
        boss.vx = Math.cos(targetAngle) * 150;
        boss.vy = Math.sin(targetAngle) * 150;
    } else {
        // Strafe
        const strafeAngle = targetAngle + (boss.phase === 1 ? 90 : -90);
        boss.vx = Math.cos(strafeAngle) * 100;
        boss.vy = Math.sin(strafeAngle) * 100;
    }

    // Rotate toward player
    const angleDiff = normalizeAngle(targetAngle - boss.angle);
    const maxTurn = config.turnRate * deltaTime;
    if (Math.abs(angleDiff) > maxTurn) {
        boss.angle += Math.sign(angleDiff) * maxTurn;
    } else {
        boss.angle = targetAngle;
    }

    // Boss attack patterns
    boss.patternTimer -= deltaTime;
    if (boss.patternTimer <= 0) {
        const pattern = boss.phase === 1 ?
            ['straight', 'spread', 'circle'][boss.patternIndex % 3] :
            ['circle', 'spiral', 'burst'][boss.patternIndex % 3];

        fireBossAttack(boss, pattern);
        boss.patternIndex++;
        boss.patternTimer = boss.phase === 1 ? 2.0 : 1.5;  // Faster in phase 2
    }

    // Apply movement
    boss.x += boss.vx * deltaTime;
    boss.y += boss.vy * deltaTime;
}

function fireBossAttack(boss, pattern) {
    const numBullets = boss.phase === 1 ? 6 : 8;
    const startAngle = Math.atan2(player.y - boss.y, player.x - boss.x) * 180 / Math.PI;

    if (pattern === 'straight') {
        // 3 bullets in a line toward player
        for (let i = -1; i <= 1; i++) {
            const angle = startAngle + i * 15;
            spawnEnemyBullet(boss.x, boss.y, angle, 400);
        }
    } else if (pattern === 'spread') {
        // Spread pattern (wide cone)
        for (let i = 0; i < numBullets; i++) {
            const angle = startAngle - 45 + (i / (numBullets - 1)) * 90;
            spawnEnemyBullet(boss.x, boss.y, angle, 400);
        }
    } else if (pattern === 'circle') {
        // All directions
        for (let i = 0; i < numBullets; i++) {
            const angle = (i / numBullets) * 360;
            spawnEnemyBullet(boss.x, boss.y, angle, 350);
        }
    } else if (pattern === 'spiral') {
        // Spiral (only phase 2)
        for (let i = 0; i < numBullets; i++) {
            const angle = startAngle + (boss.patternIndex * 45) + (i * 360 / numBullets);
            spawnEnemyBullet(boss.x, boss.y, angle, 400);
        }
    } else if (pattern === 'burst') {
        // Rapid burst (only phase 2)
        for (let i = 0; i < numBullets; i++) {
            const angle = startAngle + (Math.random() - 0.5) * 60;
            spawnEnemyBullet(boss.x, boss.y, angle, 450);
        }
    }
}

function spawnEnemyBullet(x, y, angle, speed) {
    const angleRad = angle * Math.PI / 180;
    const bullet = pools.enemyBullet.acquire();
    bullet.x = x + Math.cos(angleRad) * 50;  // Spawn from edge
    bullet.y = y + Math.sin(angleRad) * 50;
    bullet.vx = Math.cos(angleRad) * speed;
    bullet.vy = Math.sin(angleRad) * speed;
    bullet.life = 3;  // Longer lifetime
    bullet.nearMissTriggered = false;
    enemyBullets.push(bullet);
}
```

---

## Step 4: Add Boss-Specific Rendering

Add to `updateEnemies()` rendering section or create separate `renderBoss()`:

```javascript
function renderBoss() {
    // Find boss in enemies array
    for (const enemy of enemies) {
        if (enemy.type !== 'BOSS') continue;

        const config = ENEMY_TYPES[enemy.type];
        const x = worldToScreen(enemy.x, enemy.y).x;
        const y = worldToScreen(enemy.x, enemy.y).y;

        // Draw boss main body
        ctx.fillStyle = config.color;
        ctx.beginPath();
        ctx.arc(x, y, config.radius, 0, Math.PI * 2);
        ctx.fill();

        // Draw outline
        ctx.strokeStyle = config.outline;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw boss health bar (screen-space)
        const healthPercent = enemy.hp / enemy.maxHp;
        const barWidth = 200;
        const barHeight = 20;
        const barX = CANVAS_WIDTH / 2 - barWidth / 2;
        const barY = 50;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Health fill (color based on phase)
        const healthColor = enemy.phase === 1 ? '#00FF00' : '#FF0000';
        ctx.fillStyle = healthColor;
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);

        // Border
        ctx.strokeStyle = healthColor;
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // HP text
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('BOSS: ' + Math.ceil(enemy.hp) + ' / ' + enemy.maxHp,
                    CANVAS_WIDTH / 2, barY + 35);

        // Phase indicator
        ctx.fillStyle = '#FFD700';
        ctx.fillText('PHASE ' + enemy.phase, CANVAS_WIDTH / 2, barY - 10);

        // Draw phase 2 visual effect (red glow)
        if (enemy.phase === 2) {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(x, y, config.radius + 20, 0, Math.PI * 2);
            ctx.stroke();
        }

        // Draw attack telegraph (show upcoming attack direction)
        if (player) {
            const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
            ctx.strokeStyle = 'rgba(255, 100, 100, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * 150, y + Math.sin(angle) * 150);
            ctx.stroke();
        }
    }
}

// Call in render() function AFTER renderEnemies():
function render() {
    // ... existing render code ...

    // In the game entity rendering section (inside camera transform):
    if (enemies.some(e => e.type === 'BOSS')) {
        renderBoss();  // Draw boss on top
    }

    // ... rest of render code ...
}
```

---

## Step 5: Update killEnemy() for Boss Rewards

Modify the `killEnemy()` function to handle boss differently:

```javascript
function killEnemy(enemy, index) {
    const config = ENEMY_TYPES[enemy.type];

    // Boss-specific handling
    if (enemy.type === 'BOSS') {
        // Huge reward
        addXP(50);
        score += config.points;
        spawnFloatingText(enemy.x, enemy.y, 'BOSS DEFEATED!', COLORS.RARE);
        triggerFlash(COLORS.RARE, 0.4, 500);
        triggerSlowmo(300);

        // Create explosion effect
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            spawnRing(enemy.x + Math.cos(angle) * 30,
                     enemy.y + Math.sin(angle) * 30,
                     COLORS.RARE);
        }

        // Spawn extra pickups
        for (let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            spawnPickup(enemy.x + Math.cos(angle) * 100,
                       enemy.y + Math.sin(angle) * 100);
        }

        bossSpawned = false;  // Allow respawn after delay
    } else {
        // Regular enemy reward
        addXP(1);
        score += config.points;
        spawnFloatingText(enemy.x, enemy.y - config.radius,
                         config.points.toString(), COLORS.GOLD);
        spawnRing(enemy.x, enemy.y, config.color);
    }

    // Spawn drones if unlocked
    if (unlockedSkills.includes('alien_drone')) {
        spawnDronesOnKill(enemy.x, enemy.y);
    }

    // Remove enemy
    pools.enemy.release(enemy);
    fastRemove(enemies, index);
    totalKills++;
}
```

---

## Step 6: Add Global Variables

Add at the top of game state declarations:

```javascript
let bossSpawned = false;
let bosses = [];  // Optional: separate array if you want multiple boss types
```

---

## Step 7: Update Reset Logic

Add to `resetGame()` function:

```javascript
function resetGame() {
    player = { /* ... */ };
    // ... existing reset code ...

    bossSpawned = false;
    bosses = [];

    // ... rest of reset ...
}
```

---

## Step 8: Add Boss Skill Tree Node (Optional)

Add to SKILL_TREE:

```javascript
const SKILL_TREE = {
    // ... existing skills ...

    'boss_slayer': {
        name: 'BOSS SLAYER',
        description: 'Deal 50% bonus damage to bosses',
        prereqs: ['arsenal'],
        cost: 1,
        color: '#FF1493',
        icon: 'boss',
        nodeType: 'rectangle'
    },
    'boss_shield': {
        name: 'Reinforced Hull',
        description: '+50 max shield when boss appears',
        prereqs: ['boss_slayer'],
        cost: 1,
        color: '#FF1493',
        icon: 'shield',
        nodeType: 'circle'
    },
    'boss_awareness': {
        name: 'Threat Alert',
        description: 'See boss telegraph attacks further',
        prereqs: ['boss_slayer'],
        cost: 1,
        color: '#FF1493',
        icon: 'alert',
        nodeType: 'circle'
    }
};

// Add to WEAPON_UPGRADES (if boss_slayer is a weapon):
// 'boss_slayer': ['boss_shield', 'boss_awareness']
```

Then integrate the boss_slayer bonus:

```javascript
function getWeaponStats() {
    let damage = 10;
    // ... existing code ...

    // Add boss slayer bonus
    if (unlockedSkills.includes('boss_slayer')) {
        stats.bossDamageBonus = 1.5;  // 50% bonus
    }

    return { /* ... */, bossDamageBonus };
}

// In bullet collision code:
if (e.type === 'BOSS' && stats.bossDamageBonus) {
    const damage = Math.ceil(b.damage * stats.bossDamageBonus);
    e.hp -= damage;
    // ... rest of damage code
} else {
    e.hp -= b.damage;
}
```

---

## Attack Pattern Examples

### Pattern 1: Circular Wave (All Directions)
```javascript
for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    spawnEnemyBullet(boss.x, boss.y, angle * 180 / Math.PI, 400);
}
```

### Pattern 2: Spiral (Rotating)
```javascript
const baseAngle = (gameTime * 180) % 360;  // Rotates over time
for (let i = 0; i < 12; i++) {
    const angle = baseAngle + (i / 12) * 360;
    spawnEnemyBullet(boss.x, boss.y, angle, 400);
}
```

### Pattern 3: Cone Toward Player
```javascript
const angleToPlayer = Math.atan2(player.y - boss.y,
                                 player.x - boss.x) * 180 / Math.PI;
for (let i = -2; i <= 2; i++) {
    const angle = angleToPlayer + i * 15;
    spawnEnemyBullet(boss.x, boss.y, angle, 400);
}
```

### Pattern 4: Expanding Ring
```javascript
const radius = 200;
for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const x = boss.x + Math.cos(angle) * radius;
    const y = boss.y + Math.sin(angle) * radius;
    // Spawn bullet at radius pointing outward
    spawnEnemyBullet(x, y, angle * 180 / Math.PI, 500);
}
```

---

## Difficulty Scaling

Add to boss initialization:

```javascript
// Scale boss difficulty with level
boss.hp = config.hp * (1 + (playerLevel - 5) * 0.3);
boss.maxHp = boss.hp;

// Faster attack patterns at higher levels
const patternSpeed = 2.0 - (playerLevel - 5) * 0.1;
boss.patternTimer = Math.max(1.0, patternSpeed);
```

---

## Testing Checklist

- [ ] Boss spawns at correct level/score
- [ ] Boss health bar displays correctly
- [ ] Boss moves and avoids player appropriately
- [ ] Boss attack patterns vary and don't overlap
- [ ] Phase transition triggers at 50% health
- [ ] Phase 2 is visibly more difficult
- [ ] Boss defeat rewards are appropriate
- [ ] No collision detection issues with large radius
- [ ] Boss rendering doesn't interfere with HUD
- [ ] Boss bullets collide with player shield correctly
- [ ] Multiple boss encounters work properly
- [ ] Boss can be killed by all weapon types

---

## Performance Considerations

1. **Enemy Pool Size:** May need to increase `enemy` pool capacity if spawning boss + adds
2. **Bullet Pool:** Boss spawns many bullets; verify pool size is adequate (500+ recommended)
3. **Spatial Grid:** Large boss radius may occupy multiple cells; ensure performance acceptable
4. **Rendering:** Boss rendering is additive; profile on target devices
5. **Collision:** Boss collision detection scales linearly with bullet/drone counts

Recommended pool adjustments for boss support:
```javascript
enemy: new ObjectPool(..., 450),      // 400 → 450 for boss
bullet: new ObjectPool(..., 600),     // 500 → 600 for boss bullets
```
