# Stellar Swarm - Comprehensive Codebase Analysis

> **NOTA (2026-02-12):** Este análisis describe el código tal como está actualmente en index.html, incluyendo el sistema de bosses. El sistema de bosses ha sido **archivado** y será extraído del código principal. El nuevo sistema de progresión (upgrades multi-nivel, moneda persistente, tienda) se documenta en `WEAPON_EVOLUTION_DESIGN.md`. Las secciones de este documento que referencian bosses reflejan el estado del código antes de la refactorización.

## Overview
Stellar Swarm is a Vampire Survivors-style space shooter built in vanilla JavaScript with Canvas 2D rendering. The game features a modular weapon system, dynamic wave spawning, progression through leveling and skill trees, and extensive optimization for performance.

**Canvas Size:** 1920x1080 (responsive to 720x1280 on mobile)
**Game World:** 11520 x 6480 px (3x3 sector grid, each 3840x2160)
**Main File:** `/index.html` (233KB single-file game)

---

## 1. WEAPON SYSTEM

### 1.1 Weapon Types & Initial State

```javascript
const SKILL_TREE = {
    'arsenal': {
        name: 'SHIP ARSENAL',
        description: 'Your ship\'s weapon systems',
        prereqs: [],
        cost: 0,
        color: '#00DFFF',
        icon: 'arsenal',
        nodeType: 'hexagon'
    },
    'laser_cannon': {
        name: 'LASER CANNON',
        description: 'High-powered energy weapon',
        prereqs: ['arsenal'],
        cost: 1,
        color: '#FF6B5B',
        icon: 'laser',
        nodeType: 'rectangle'
    },
    // ... 6 main weapons total
};
```

**Initial Laser (Always Unlocked):**
- `laser_cannon` - Auto-fires at player's facing direction with auto-aim cone
- Cost: 1 skill point (but starts free)
- Starts disabled but auto-fires when upgrades are purchased
- Auto-aim detection: 30° cone, 700px max range

### 1.2 All Weapons (6 Main + 1 Plasma Field = 7 Total)

1. **LASER CANNON** (Red/Coral #FF6B5B)
   - Auto-fires straight ahead
   - 3 upgrades: `rapid_fire`, `piercing_lens`, `beam_splitter`

2. **MISSILE LAUNCHER** (Yellow/Gold #FFD93D)
   - Homing missiles with auto-aim
   - 3 upgrades: `homing_guidance` (6x salvo), `cluster_payload` (ricochet), `armor_piercing` (damage)

3. **ORBITAL SHIELD** (Cyan/Teal #00DFFF)
   - 3 rotating orbs around player that damage enemies
   - 3 upgrades: `regen_capacitors` (+2 orbs=5 total), `shockwave_emitter` (+50% size), `energy_absorption` (+16 dmg)

4. **LIGHTNING RAY** (Purple #9F7AEA)
   - Auto-fires chain lightning at nearby enemies
   - 3 upgrades: `chain_amplifier` (+6 bounces=12 total), `rapid_discharge` (+50% fire rate), `extended_arc` (+50% range)

5. **PLASMA FIELD** (Cyan #7FDBFF)
   - Damage aura around player
   - 3 upgrades: `field_expansion` (+50% radius), `field_intensity` (+8 dmg), `field_pulse` (+50% tick rate)

6. **ALIEN DRONE** (Lime #39FF14)
   - Spawn kamikaze drones on enemy kills
   - 3 upgrades: `drone_duo` (2 drones), `drone_duration` (2x lifetime), `drone_explosion` (AoE on impact)

### 1.3 Weapon Upgrade System

```javascript
const WEAPON_UPGRADES = {
    'laser_cannon': ['rapid_fire', 'piercing_lens', 'beam_splitter'],
    'missile_launcher': ['homing_guidance', 'cluster_payload', 'armor_piercing'],
    'orbital_shield': ['regen_capacitors', 'shockwave_emitter', 'energy_absorption'],
    'lightning_ray': ['chain_amplifier', 'rapid_discharge', 'extended_arc'],
    'plasma_field': ['field_expansion', 'field_intensity', 'field_pulse'],
    'alien_drone': ['drone_duo', 'drone_duration', 'drone_explosion']
};
```

**Weapon Upgrade Mechanics:**
- Each main weapon has 3 child upgrade nodes
- Upgrades require prerequisite (parent weapon unlocked)
- Each upgrade costs 1 skill point
- All upgrades can be obtained (no hard limits, but gated by level progression)
- Upgrades are displayed as dots under weapon icons in HUD

### 1.4 Weapon Stats Calculation

```javascript
function getWeaponStats() {
    let damage = 10;              // Laser base
    let fireRate = 0.35;
    let pierce = false;
    let spreadCount = 1;
    let hasRockets = false;
    let rocketCount = 3;
    let rocketDamage = 22;
    let hasLaser = unlockedSkills.includes('laser_cannon');
    let rocketBurstCount = 3;
    let rocketExplosionDamage = 30;
    let rocketExplosionRadius = 120;
    let rocketRicochet = false;

    // Laser upgrades
    if (unlockedSkills.includes('rapid_fire')) {
        fireRate = 0.25; // 40% faster
    }
    if (unlockedSkills.includes('piercing_lens')) {
        pierce = true;   // Bullets pass through
    }
    if (unlockedSkills.includes('beam_splitter')) {
        spreadCount = 3; // 3-way spread
    }

    // Similar chains for missile, shield, lightning, aura, drones...

    return { damage, fireRate, pierce, spreadCount, hasRockets, rocketCount,
             rocketDamage, hasLaser, rocketBurstCount, rocketExplosionDamage,
             rocketExplosionRadius, rocketRicochet, hasLightning,
             lightningBounces, lightningCadence, lightningRange,
             lightningChainRange, lightningDamage, hasAura, auraRadius,
             auraDamage, auraTickRate, hasDrones, droneCount, droneLifetime,
             droneHasExplosion };
}
```

### 1.5 Fire Rate & Auto-Aim

```javascript
const AUTO_FIRE_INTERVAL = 0.35;      // Seconds between laser shots
const AUTO_AIM_CONE_DEGREES = 30;     // ±30° = 60° total cone
const AUTO_AIM_MAX_DISTANCE = 700;    // px - max range for laser auto-aim
```

**Auto-Aim Logic:**
- Player direction + cone detection for targets within 700px
- Adjusts fire direction smoothly toward nearest enemy
- Independent from player manual rotation

---

## 2. ENEMY SYSTEM

### 2.1 Enemy Types & Stats

```javascript
const ENEMY_TYPES = {
    SCOUT: {
        radius: 10,
        speed: 120,
        turnRate: 90,
        hp: 4,
        points: 10,
        color: '#FF6B6B',
        outline: '#C04848'
    },
    KAMIKAZE: {
        radius: 10,
        speed: 180,
        turnRate: 60,
        hp: 4,
        points: 25,
        color: '#FF9A6B',
        outline: '#D86A3A'
    },
    SPINNER: {
        radius: 14,
        speed: 90,
        turnRate: 60,
        hp: 4,
        points: 40,
        color: '#3A9AD9',
        outline: '#1E6F9A',
        fireRate: 1.2
    },
    TANK: {
        radius: 22,
        speed: 70,
        turnRate: 45,
        hp: 12,
        points: 75,
        color: '#C792FF',
        outline: '#8A5DBF'
    }
};
```

**Enemy Spawning Rules:**
```javascript
function spawnEnemy() {
    let type = 'SCOUT';
    const r = Math.random();

    if (score > 5000 && r < 0.08) {
        type = 'TANK';           // 8% chance when score > 5000
    } else if (waveNumber >= 10 && r < 0.20) {
        type = 'KAMIKAZE';       // 20% chance after wave 10
    }

    // Spawn at edges of viewport relative to player
    const spawnDistance = CANVAS_WIDTH / 2 + offset;
    // ... position calculation from 4 sides
}
```

### 2.2 Enemy Scaling with Levels

```javascript
const hpMultiplier = 1 + (playerLevel - 1) * 0.40;  // +40% HP per level
const scaledHp = Math.ceil(config.hp * hpMultiplier);
```

**Behavior per Type:**
- **SCOUT:** Seeks player, no special abilities
- **KAMIKAZE:** Faster, aggressive, no special abilities
- **SPINNER:** Shoots bullets in circle pattern (fireRate: 1.2 sec)
- **TANK:** Slow but tanky (12 HP base), bursts toward player when close

### 2.3 Enemy Spawning System

```javascript
const INITIAL_SPAWN_INTERVAL_MIN = 0.15;
const INITIAL_SPAWN_INTERVAL_MAX = 0.35;
const MIN_SPAWN_INTERVAL = 0.03;
const SPAWN_DECAY_RATE = 0.05;
const SPAWN_DECAY_INTERVAL = 10;  // Decay every 10 seconds
const MAX_ENEMIES = 500;

function updateSpawnSystem() {
    if (enemies.length >= MAX_ENEMIES) return;

    spawnTimer -= deltaTime;
    if (spawnTimer <= 0) {
        spawnEnemy();
        spawnTimer = spawnInterval;

        // Gradually increase spawn rate every 10 seconds
        if (gameTime - lastSpawnDecayTime >= SPAWN_DECAY_INTERVAL) {
            spawnInterval = Math.max(MIN_SPAWN_INTERVAL,
                                     spawnInterval - SPAWN_DECAY_RATE);
            lastSpawnDecayTime = gameTime;
        }
    }
}
```

### 2.4 Wave System (Vampire Survivors Style)

```javascript
const WAVE_INTERVAL_BASE = 2.5;           // Base seconds between waves
const WAVE_INTERVAL_VARIANCE = 1.5;       // Random variance
const WAVE_SPAWN_DISTANCE = 850;          // Distance from player

const WAVE_PATTERNS = [
    'arc',           // Enemies in an arc
    'side',          // All from one side
    'pincer',        // From two opposite sides
    'circle',        // Hexagonal staggered pattern
    'line',          // Horizontal or vertical line
    'cluster',       // Tight cluster
    'spiral',        // Spiral pattern
    'corners',       // From all 4 corners
    'rush',          // Dense column
    'scatter',       // Random positions
    'v_formation'    // V-shape
];

function spawnWave() {
    const baseCount = 15 + Math.floor(playerLevel * 4);  // More at higher levels
    const count = Math.min(baseCount, 60);               // Cap at 60 per wave

    let pattern;
    do {
        pattern = WAVE_PATTERNS[Math.floor(Math.random() * WAVE_PATTERNS.length)];
    } while (pattern === lastWavePattern && WAVE_PATTERNS.length > 1);

    // ... Calculate spawn positions based on pattern
    // ... Create enemies at those positions
}
```

**Wave Alert Display:**
- Shows "WAVE X" with pattern subtitle for 2.5 seconds
- Triggers visual flash and slowmo effect

---

## 3. LEVEL & XP SYSTEM

### 3.1 XP & Level Progression

```javascript
const XP_PER_LEVEL_BASE = 25;
const XP_PER_LEVEL_GROWTH = 1.4;  // Exponential curve

let playerLevel = 1;
let playerXP = 0;
let xpToNextLevel = XP_PER_LEVEL_BASE;  // 25 XP for level 2

function addXP(amount) {
    playerXP += amount;

    while (playerXP >= xpToNextLevel) {
        playerXP -= xpToNextLevel;
        playerLevel++;
        xpToNextLevel = Math.floor(XP_PER_LEVEL_BASE *
                       Math.pow(XP_PER_LEVEL_GROWTH, playerLevel - 1));
        skillPoints++;
        levelUp(1);
    }
}
```

**XP Curve Example:**
- Level 1→2: 25 XP
- Level 2→3: 35 XP (25 * 1.4)
- Level 3→4: 49 XP (35 * 1.4)
- Level 4→5: 68 XP
- Growing exponentially: Y = 25 * (1.4)^(level-1)

### 3.2 Enemy XP Drops

Enemies grant XP on kill:
```javascript
function killEnemy(enemy, index) {
    const config = ENEMY_TYPES[enemy.type];
    addXP(1);  // Each enemy gives 1 XP (consistent)
    // ... other kill effects
}
```

### 3.3 Level-Up Mechanics

```javascript
function levelUp(levelsGained = 1) {
    if (!allSkillsUnlocked()) {
        showUpgradePanel();  // Open upgrade selection UI
    }

    // Visual effects
    const intensity = Math.min(levelsGained, 3);
    triggerFlash(COLORS.XP, 0.2 + intensity * 0.1, 200);
    triggerSlowmo(100 * intensity);

    if (levelsGained > 1) {
        spawnFloatingText(player.x, player.y - 40,
                         'LEVEL UP x' + levelsGained + '!', COLORS.XP);
    }
}
```

### 3.4 Upgrade Offering & Selection

```javascript
let skillPoints = 0;
let upgradeOptions = [];
let upgradeSelectionActive = false;

function generateUpgradeOptions() {
    const available = getAvailableSkills();
    if (available.length <= 3) return [...available];

    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);  // Always offer exactly 3 (or less if fewer available)
}

function getAvailableSkills() {
    const available = [];
    for (const skillId of Object.keys(SKILL_TREE)) {
        if (canUnlockSkill(skillId)) {
            available.push(skillId);
        }
    }
    return available;
}

function canUnlockSkill(skillId) {
    if (unlockedSkills.includes(skillId)) return false;
    if (skillPoints < SKILL_TREE[skillId].cost) return false;

    const skill = SKILL_TREE[skillId];
    for (const prereq of skill.prereqs) {
        if (!unlockedSkills.includes(prereq)) return false;
    }
    return true;
}

function selectUpgrade(skillId) {
    if (!canUnlockSkill(skillId)) return;

    unlockedSkills.push(skillId);
    skillPoints -= SKILL_TREE[skillId].cost;
    upgradeSelectionActive = false;
    gameState = 'playing';

    // Trigger unlock effects (e.g., unlock weapon pickups)
    triggerUnlockEffect(skillId);
}
```

**Skill Point Awards:**
- 1 skill point per level gained
- Multi-level gains award multiple points and can trigger multiple upgrade panels

---

## 4. PROGRESSION & PERSISTENCE

### 4.1 Game State Management

```javascript
let gameState = 'menu';  // Possible states:
                         // 'menu', 'playing', 'paused', 'skilltree', 'gameOver'
```

**State Transitions:**
- `menu` → `playing` (press ENTER or TAP)
- `playing` → `paused` (press P or ESC)
- `paused` → `playing` (press P or ESC)
- `playing` → `skilltree` (level up)
- `skilltree` → `playing` (select upgrade)
- `playing` → `gameOver` (player dies)
- `gameOver` → `playing` (press R or TAP)

### 4.2 Persistent Data (localStorage)

```javascript
let highScore = 0;

// Load on startup (wrapped in try-catch)
try {
    highScore = parseInt(localStorage.getItem('StellarSwarm_highscore_v1')) || 0;
} catch (e) {
    console.warn('localStorage not available:', e);
    highScore = 0;
}

// Save on new high score
if (score > highScore) {
    highScore = Math.floor(score);
    try {
        localStorage.setItem('StellarSwarm_highscore_v1', Math.floor(score).toString());
    } catch (e) {
        console.warn('Could not save high score to localStorage:', e);
    }
}
```

**Persistent Data:**
- Only high score is saved
- Key: `StellarSwarm_highscore_v1`
- Value: Integer score
- No session/run data persists between games

### 4.3 Meta-Progression

**None implemented** - Every run starts fresh:
- Level 1
- laser_cannon only unlocked
- No skill points
- No arsenal progress across runs

Progression is purely within-run: Unlock weapons → Level up → Unlock more weapons → Survive longer

---

## 5. HUD & UI SYSTEM

### 5.1 Canvas Dimensions

```javascript
let CANVAS_WIDTH = 1920;
let CANVAS_HEIGHT = 1080;

// Responsive (mobile)
if (window.innerWidth < 900) {
    CANVAS_WIDTH = 720;
    CANVAS_HEIGHT = 1280;
}
```

### 5.2 HUD Elements (Game State: Playing)

**Top-Left: Kills & Score**
```javascript
// "KILLS" label + count (large)
// "SCORE" label + count (smaller, accumulated over time)
const HUD_PADDING = 16;
```

**Top-Center: Level & XP**
```javascript
// "LEVEL" label + hexagon badge with level number
// XP bar showing progress to next level
// Display: "X / Y XP"
```

**Top-Right: Weapons & Upgrades**
```javascript
// Icons for each unlocked weapon
// Small dots under each weapon showing upgrade status
// Only active (unlocked) weapons shown
```

**Bottom-Right: Health & Shield**
```javascript
// Health display (red) "HP: X/3"
// Shield bar (cyan) "SHIELD: XXXXX/400"
// Shield regeneration indicator
```

**Bottom-Center: Skill Points Indicator**
```javascript
if (skillPoints > 0) {
    "SKILL POINTS: X (Press TAB)"  // Pulsing when available
}
```

**Wave Alert (Center-Top)**
```javascript
// Shows for 2.5 seconds when wave spawns
// "WAVE X"
// Subtitle: pattern name (e.g., "ARC FORMATION")
```

### 5.3 HUD Color Scheme

```javascript
const COLORS = {
    HUD_CYAN: '#7FDBFF',
    HUD_CYAN_DIM: '#3A9AD9',
    HUD_RED: '#FF6B6B',
    HUD_GOLD: '#FFDD57',
    HUD_GREEN: '#00FFAA',
    HUD_PURPLE: '#9F7AEA',
    HUD_SHIELD: '#44C8FF',
    HUD_WARNING: '#FF8844',
    HUD_TEXT_PRIMARY: '#E8F0FF',
    HUD_TEXT_SECONDARY: 'rgba(200, 215, 240, 0.55)',
    HUD_PANEL_BG: 'rgba(5, 12, 30, 0.85)',
    HUD_PANEL_BORDER: 'rgba(127, 219, 255, 0.15)'
};
```

### 5.4 Main Menu Rendering

```javascript
function renderMenu() {
    // Darkened background
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Title: "STELLAR SWARM" (64px, cyan)
    // Tagline: "Drift. Survive. Swarm the stars." (18px)
    // High Score: "HIGH SCORE: XXXXX" (gold, 20px)
    // Start Prompt: "Press ENTER or TAP to Start" (pulsing, 24px)
    // Controls help (14px, two columns)
    // Touch note: "Touch: Use joystick to move"
}
```

### 5.5 Game Over Screen

```javascript
function renderGameOver() {
    // Dark overlay
    // "GAME OVER" title (48px)
    // "KILLS: XXXXX" (24px)
    // "SCORE: XXXXX" (24px)
    // "★ NEW HIGH SCORE! ★" OR "BEST: XXXXX" (20px, conditional)
    // Survival time (14px) "Time: XmYs"
    // Retry prompt (24px) "Press R or TAP to Retry"
}
```

### 5.6 Pause Overlay

```javascript
function renderPauseOverlay() {
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);  // Dark overlay

    // "PAUSED" title
    // "Press P or ESC to Resume"
    // "Press R to Restart"
}
```

---

## 6. GAME STATES & STATE MACHINE

### 6.1 State Diagram

```
┌─────────────────────────────────────┐
│            MENU STATE               │
│  - Display high score                │
│  - Show controls help                │
│  - Animate background                │
│  - Wait for ENTER or TAP             │
└──────────────┬──────────────────────┘
               │ ENTER / TAP
               ▼
┌─────────────────────────────────────┐
│          PLAYING STATE               │
│  - Update player & enemies            │
│  - Handle weapons & effects            │
│  - Render HUD                          │
│  - Manage levels/upgrades              │
│  - Handle P/ESC for pause              │
└────┬────────────────────────┬────────┘
     │ P/ESC                  │ Player dies
     ▼                        ▼
 ┌─────────────────┐   ┌──────────────┐
 │  PAUSED STATE   │   │ GAMEOVER     │
 │                 │   │ STATE        │
 └─────────────────┘   └──────────────┘
     │                      │
     │ P/ESC                │ R/TAP
     └──────────┬───────────┘
                │
                ▼
          RESET → MENU or PLAYING
```

### 6.2 Level-Up State Flow

When `playerLevel` increases:
1. `playerLevel++`
2. Check if all skills unlocked
3. If NO: Open upgrade panel (HTML overlay)
   - gameState = 'skilltree'
   - Display 3 random skill options
   - Wait for selection
4. Player selects upgrade
5. `selectUpgrade(skillId)` called
6. gameState = 'playing'
7. Continue game

### 6.3 State Variables

```javascript
let gameState = 'menu';
let playerLevel = 1;
let playerXP = 0;
let xpToNextLevel = 25;
let skillPoints = 0;
let unlockedSkills = ['arsenal', 'laser_cannon'];  // Always start with these
let upgradeOptions = [];
let upgradeSelectionActive = false;

let score = 0;
let highScore = 0;
let totalKills = 0;
let gameTime = 0;
```

---

## 7. MAIN MENU & STARTUP

### 7.1 Menu Display

```javascript
function renderMenu() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Title (64px, bold, cyan #7FDBFF)
    ctx.fillText('STELLAR SWARM', CANVAS_WIDTH / 2, 140);

    // Tagline (18px, secondary color)
    ctx.fillText('Drift. Survive. Swarm the stars.', CANVAS_WIDTH / 2, 175);

    // High score (20px, gold #FFDD57)
    ctx.fillText('HIGH SCORE: ' + highScore, CANVAS_WIDTH / 2, 220);

    // Start prompt (24px, bold, pulsing animation)
    const pulse = Math.sin(Date.now() / 300) * 0.3 + 0.7;
    ctx.globalAlpha = pulse;
    ctx.fillText('Press ENTER or TAP to Start', CANVAS_WIDTH / 2, 280);
    ctx.globalAlpha = 1;

    // Controls help section
    renderControlsHelp(340);
}
```

### 7.2 Controls Display

```javascript
const controls = [
    ['W / ↑', 'Thrust'],
    ['S / ↓', 'Reverse'],
    ['A / ←', 'Rotate Left'],
    ['D / →', 'Rotate Right'],
    ['P / ESC', 'Pause']
];
```

Also displays touch joystick note for mobile devices.

---

## 8. CANVAS RENDERING & CAMERA SYSTEM

### 8.1 Canvas Setup

```javascript
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const container = document.getElementById('gameContainer');

// Adjust size based on window
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
```

### 8.2 Render Order (Each Frame)

```javascript
function render() {
    // 1. Apply screen shake
    ctx.save();
    // ... translate for shake

    // 2. Render background (no camera)
    renderBackground();

    // 3. Apply camera transform
    ctx.save();
    const cameraOffset = worldToScreen(0, 0);
    ctx.translate(cameraOffset.x, cameraOffset.y);

    // 4. Render game entities (world-space)
    if (gameState === 'playing' || gameState === 'paused' || gameState === 'gameOver') {
        renderPickups();
        renderEnemies();
        renderBullets();
        renderDrones();
        renderEnemyBullets();
        if (player && gameState !== 'gameOver') {
            renderAura();
            renderPlayer();
            renderShieldArc();
            renderOrbitals();
            renderLightning();
        }
        renderParticles();
        renderFloatingTexts();
    }

    ctx.restore();  // Remove camera transform
    ctx.restore();  // Remove shake

    // 5. Flash overlay (screen-space)
    // 6. UI overlay (screen-space)
    renderUI();
}
```

### 8.3 Camera System

```javascript
const camera = {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
    targetX: WORLD_WIDTH / 2,
    targetY: WORLD_HEIGHT / 2
};

function updateCamera() {
    // Smoothly follow player with easing
    const easing = 0.1;
    camera.targetX = player.x;
    camera.targetY = player.y;

    camera.x += (camera.targetX - camera.x) * easing;
    camera.y += (camera.targetY - camera.y) * easing;
}

function worldToScreen(worldX, worldY) {
    return {
        x: worldX - camera.x + CANVAS_WIDTH / 2,
        y: worldY - camera.y + CANVAS_HEIGHT / 2
    };
}

function screenToWorld(screenX, screenY) {
    return {
        x: screenX + camera.x - CANVAS_WIDTH / 2,
        y: screenY + camera.y - CANVAS_HEIGHT / 2
    };
}
```

### 8.4 World Bounds & Sector System

```javascript
const SECTOR_WIDTH = 3840;       // 2x viewport width
const SECTOR_HEIGHT = 2160;      // 2x viewport height
const GRID_SIZE = 3;             // 3x3 grid
const WORLD_WIDTH = 11520;       // SECTOR_WIDTH * 3
const WORLD_HEIGHT = 6480;       // SECTOR_HEIGHT * 3

// Player wrapped at boundaries
function checkSectorBoundary() {
    if (player.x < 0) player.x += WORLD_WIDTH;
    if (player.x >= WORLD_WIDTH) player.x -= WORLD_WIDTH;
    if (player.y < 0) player.y += WORLD_HEIGHT;
    if (player.y >= WORLD_HEIGHT) player.y -= WORLD_HEIGHT;
}
```

### 8.5 Background Rendering

```javascript
function renderBackground() {
    // Gradient fill
    ctx.fillStyle = cachedBgGradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Parallax grid (2 layers)
    // Far layer: 120px spacing, slow parallax, dim
    // Near layer: 400px spacing, faster parallax, brighter

    // CRT scanlines overlay (cached pattern)
}
```

---

## 9. OBJECT POOLS & OPTIMIZATION

### 9.1 Object Pool Implementation

```javascript
class ObjectPool {
    constructor(factory, resetFn, capacity) {
        this.factory = factory;
        this.resetFn = resetFn;
        this.capacity = capacity;
        this.available = [];
    }

    acquire() {
        let obj = this.available.pop();
        if (!obj) {
            obj = this.factory();
        }
        return obj;
    }

    release(obj) {
        if (this.available.length < this.capacity) {
            this.resetFn(obj);
            this.available.push(obj);
        }
    }

    releaseAll(array) {
        for (const obj of array) {
            this.release(obj);
        }
        array.length = 0;
    }
}
```

### 9.2 Pooled Entity Types

```javascript
const pools = {
    bullet: ObjectPool(..., capacity: 500),
    enemy: ObjectPool(..., capacity: 400),
    particle: ObjectPool(..., capacity: 400),
    enemyBullet: ObjectPool(..., capacity: 300),
    floatingText: ObjectPool(..., capacity: 100),
    pickup: ObjectPool(..., capacity: 50),
    drone: ObjectPool(..., capacity: 100)
};
```

### 9.3 Spatial Grid for Collision Optimization

```javascript
const SPATIAL_GRID_CELL_SIZE = 250;

const spatialGrid = {
    cellSize: SPATIAL_GRID_CELL_SIZE,
    cells: new Map(),

    clear() {
        this.cells.clear();
    },

    insert(entity, radius) {
        const minCellX = Math.floor((entity.x - radius) / this.cellSize);
        const maxCellX = Math.floor((entity.x + radius) / this.cellSize);
        const minCellY = Math.floor((entity.y - radius) / this.cellSize);
        const maxCellY = Math.floor((entity.y + radius) / this.cellSize);

        for (let x = minCellX; x <= maxCellX; x++) {
            for (let y = minCellY; y <= maxCellY; y++) {
                const key = `${x},${y}`;
                if (!this.cells.has(key)) {
                    this.cells.set(key, []);
                }
                this.cells.get(key).push(entity);
            }
        }
    },

    queryRadius(x, y, radius) {
        const entities = new Set();
        const minCellX = Math.floor((x - radius) / this.cellSize);
        const maxCellX = Math.floor((x + radius) / this.cellSize);
        // ... iterate cells and collect entities
        return Array.from(entities);
    }
};
```

### 9.4 Entity Culling

```javascript
const CULLING_DISTANCES = {
    enemies: 6000,
    particles: 4000,
    pickups: 5000,
    floatingTexts: 3000,
    bullets: 5760,
    enemyBullets: 5760,
    drones: 5000
};

// Entities beyond culling distance are removed from rendering
```

---

## 10. PHYSICS & COLLISION

### 10.1 Player Physics

```javascript
const ROTATION_SPEED = 300;        // deg/sec
const THRUST_ACCEL = 2200;         // px/sec²
const REVERSE_ACCEL = 450;         // px/sec²
const MAX_SPEED = 600;             // px/sec
const DRAG_FACTOR = 0.5;           // Friction
const PLAYER_MASS = 2.5;           // Inertia

function updatePlayer() {
    // Rotation
    const targetRotation = /* calculated from input */ ;
    player.angle += targetRotation * deltaTime;

    // Thrust
    const rad = player.angle * Math.PI / 180;
    const accel = /* THRUST_ACCEL or REVERSE_ACCEL */ ;
    player.vx += Math.cos(rad) * accel * deltaTime / PLAYER_MASS;
    player.vy += Math.sin(rad) * accel * deltaTime / PLAYER_MASS;

    // Drag
    const dragMult = Math.exp(-DRAG_FACTOR * deltaTime);
    player.vx *= dragMult;
    player.vy *= dragMult;

    // Clamp speed
    const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy);
    if (speed > MAX_SPEED) {
        player.vx = (player.vx / speed) * MAX_SPEED;
        player.vy = (player.vy / speed) * MAX_SPEED;
    }

    // Update position
    player.x += player.vx * deltaTime;
    player.y += player.vy * deltaTime;
}
```

### 10.2 Bullet Physics

```javascript
const BULLET_SPEED = 2000;         // px/sec
const BULLET_LIFETIME = 1.2;       // seconds

// Laser bullets: straight line
bullet.vx = Math.cos(angle) * BULLET_SPEED;
bullet.vy = Math.sin(angle) * BULLET_SPEED;
bullet.life = BULLET_LIFETIME;

// Homing rockets: accelerate toward target
bullet.turnRate = 250;             // deg/sec
bullet.targetSpeed = 1200;         // px/sec
bullet.currentSpeed = 600;         // px/sec (ramp up)
```

### 10.3 Collision Detection

```javascript
function checkCollisions() {
    // Bullet vs Enemy
    for (const bullet of bullets) {
        const nearbyEnemies = spatialGrid.queryRadius(bullet.x, bullet.y, searchRadius);
        for (const enemy of nearbyEnemies) {
            if (lineCircleCollision(prevX, prevY, bullet.x, bullet.y,
                                    enemy.x, enemy.y, collisionDist)) {
                // Hit!
                enemy.hp -= bullet.damage;
                if (enemy.hp <= 0) killEnemy(enemy);

                if (!bullet.piercing) {
                    bulletDestroyed = true;
                }
            }
        }
    }

    // Enemy vs Player
    const nearbyEnemies = spatialGrid.queryRadius(player.x, player.y, 100);
    for (const enemy of nearbyEnemies) {
        const distSq = distance_squared(player, enemy);
        if (distSq < collisionDistSq) {
            player.shield -= SHIELD_DAMAGE_ABSORPTION;
            // ... knockback, invulnerability
        }
    }

    // Enemy Bullet vs Player
    // Similar to bullet vs enemy, but damages shield
}
```

---

## 11. SPECIAL SYSTEMS

### 11.1 Shield & Damage System

```javascript
const PLAYER_MAX_HP = 3;
const PLAYER_MAX_SHIELD = 400;
const SHIELD_REGEN_RATE = 50;      // Points/sec
const SHIELD_REGEN_DELAY = 2.5;    // Sec before regen starts
const SHIELD_DAMAGE_ABSORPTION = 25;  // Damage per hit

// Shield always absorbs damage first
if (player.shield > 0) {
    player.shield -= SHIELD_DAMAGE_ABSORPTION;
} else {
    player.hp -= 1;  // Direct HP damage if shield depleted
    player.invulnerable = 0.5;  // 0.5 sec invulnerability
}

// Shield regenerates after 2.5 sec of not taking damage
if (player.shieldRegenTimer >= SHIELD_REGEN_DELAY) {
    player.shield = Math.min(PLAYER_MAX_SHIELD,
                             player.shield + SHIELD_REGEN_RATE * deltaTime);
}
```

### 11.2 Shield Arc Display

Visual arc around player indicating shield status:
```javascript
const SHIELD_ARC_RADIUS = 42;
const SHIELD_ARC_IDLE_OPACITY = 0;
const SHIELD_ARC_HIT_OPACITY = 1.0;
const SHIELD_ARC_REGEN_OPACITY = 0.6;
const SHIELD_ARC_LOW_THRESHOLD = 0.25;  // <25% shield = red

// Arc appears on damage, fades when idle
// Color: cyan when healthy, red when low
```

### 11.3 Orbital Shield (Weapon)

```javascript
const ORBITAL_RADIUS = 130;        // px distance from player
const ORBITAL_SIZE = 26;           // px radius of each orb
const ORBITAL_SPEED = 3;           // rad/sec rotation speed

// Base: 3 orbs rotating around player
// Upgrade 1: +2 orbs (5 total)
// Upgrade 2: +50% size (39px)
// Upgrade 3: +16 damage

let orbitals = [];
// Spawn 3 orbs at 120° intervals around player
```

### 11.4 Lightning Ray System

```javascript
const lightningBounces = 6;        // Base bounces (upgraded to 12)
const lightningCadence = 1.2;      // Sec between strikes
const lightningRange = 225;        // Detection range
const lightningChainRange = 350;   // Range to next target

function fireChainLightning() {
    let currentTarget = findNearbyEnemy(player.x, player.y, lightningRange);

    while (currentTarget && bounceCount < lightningBounces) {
        // Damage target
        currentTarget.hp -= lightningDamage;

        // Find next target within chainRange but not already hit
        const nextTarget = findNearestUnhitEnemy(currentTarget, lightningChainRange);
        bounceCount++;
        currentTarget = nextTarget;
    }

    // Draw zigzag lightning visual
    drawLightningPath(chain);
}
```

### 11.5 Alien Drone System

```javascript
const DRONE_SPEED = 450;           // px/sec
const DRONE_BASE_DAMAGE = 1;       // On impact
const DRONE_EXPLOSION_RADIUS = 80; // px
const DRONE_EXPLOSION_DAMAGE = 1;  // AoE
const DRONE_TURN_RATE = 360;       // deg/sec
const DRONE_SIZE = 5;              // px

// Spawn on enemy death
function spawnDroneOnKill(x, y, count) {
    for (let i = 0; i < count; i++) {
        const drone = pools.drone.acquire();
        drone.x = x;
        drone.y = y;
        drone.life = stats.droneLifetime;  // 1.5 or 3 sec
        drone.damage = DRONE_BASE_DAMAGE;
        drone.hasExplosion = stats.droneHasExplosion;
        // ...
        drones.push(drone);
    }
}
```

### 11.6 Plasma Field (Aura)

```javascript
const AURA_BASE_RADIUS = 100;      // px
const AURA_BASE_DAMAGE = 4;        // Per tick
const AURA_BASE_TICK_RATE = 0.5;   // Sec between ticks

// Deals damage to all enemies in radius every tick
// Upgrades:
// - field_expansion: +50% radius (150px)
// - field_intensity: +8 damage (12 total)
// - field_pulse: +50% tick rate (0.25 sec)
```

### 11.7 Effects System

**Screen Shake:**
```javascript
const SHAKE_INTENSITY_HIT = 6;
const SHAKE_INTENSITY_DEATH = 12;
const SHAKE_DURATION_HIT = 220;    // ms
const SHAKE_DURATION_DEATH = 420;  // ms
```

**Slow-Motion (Bullet Time):**
```javascript
const SLOWMO_FACTOR = 0.45;        // 45% speed
const SLOWMO_DURATION = 180;       // ms

// Triggered on level-up, wave start
timeScale = SLOWMO_FACTOR;  // All deltaTime multiplied
```

**Screen Flash:**
```javascript
// Colored flash overlay on damage/effect
triggerFlash(color, opacity, duration);
```

---

## 12. KEY DATA STRUCTURES

### 12.1 Player Object

```javascript
player = {
    x, y,                          // World position
    vx, vy,                        // Velocity
    angle,                         // Facing direction (-90 = up)
    hp,                            // 1-3 health points
    shield,                        // 0-400 shield points
    shieldRegenTimer,              // Delay before regen starts
    shieldFlashTimer,              // Visual flash effect
    fireTimer,                     // Laser fire cooldown
    invulnerable,                  // Damage invulnerability duration
    thrusterScale,                 // Visual animation 0-1
    thrusterParticleTimer,         // Particle emission
    bobOffset, bobTimer,           // Idle bobbing animation

    // Shield arc display
    shieldArcOpacity,
    shieldArcTargetOpacity,
    shieldArcIdleTimer,
    shieldArcFlashTimer,
    shieldArcFlashColor,
    shieldArcPulsePhase,
    shieldArcLastValue
};
```

### 12.2 Enemy Object

```javascript
enemy = {
    x, y,                          // World position
    vx, vy,                        // Velocity
    angle,                         // Facing direction
    type,                          // 'SCOUT', 'KAMIKAZE', 'SPINNER', 'TANK'
    hp, maxHp,                     // Current & max health
    fireTimer,                     // For SPINNER shooting
    burstCooldown,                 // For TANK burst attack
    spawnTime,                     // When spawned (for cleanup)
    offScreenTime,                 // Duration off-screen
    nearMissTriggered              // For near-miss scoring
};
```

### 12.3 Bullet Object

```javascript
bullet = {
    x, y,                          // World position
    vx, vy,                        // Velocity
    prevX, prevY,                  // Previous frame (for swept collision)
    life,                          // Time remaining
    damage,                        // Damage to enemies
    type,                          // 'laser', 'rocket', 'mini_rocket'
    color,                         // Render color
    piercing,                      // Can hit multiple enemies
    hitEnemies,                    // Set of enemies already hit (piercing)

    // Homing rocket specific
    turnRate,                      // deg/sec
    targetSpeed,                   // Desired speed
    currentSpeed,                  // Actual speed (ramps up)
    explosionRadius,               // AoE radius on impact
    explosionDamage,               // AoE damage
    hasRicochet,                   // Spawns mini-rockets

    // Visual
    trail,                         // Array of previous positions
    size                           // Scale 0.6-1.0
};
```

### 12.4 Skill Tree Node

```javascript
SKILL_TREE[skillId] = {
    name,                          // Display name
    description,                   // Flavor text
    prereqs,                       // Array of required unlocked skills
    cost,                          // Skill points (usually 1)
    color,                         // HUD color
    icon,                          // Icon type (for drawSkillIcon)
    nodeType                       // 'hexagon', 'rectangle', 'circle'
};
```

---

## 13. GAME LOOP & TIMING

### 13.1 Main Loop Flow

```javascript
function gameLoop(timestamp) {
    // Calculate deltaTime (capped at 0.1 to prevent large jumps)
    const rawDt = (timestamp - lastTime) / 1000;
    deltaTime = Math.min(rawDt, 0.1) * timeScale;  // Apply slow-mo

    // Performance monitoring (auto-switch to low-perf mode if <25 FPS)
    if (avgFrameTime > 40) lowPerfMode = true;

    // Update based on game state
    if (gameState === 'playing') {
        update();  // All game logic
    }

    // Always render (even when paused)
    render();

    requestAnimationFrame(gameLoop);
}

function update() {
    updateInput();                 // Player controls
    updatePlayer();                // Physics & position
    updateCamera();                // Follow player
    checkSectorBoundary();         // Wrap world
    updateSpawnSystem();           // Enemy spawning
    updateBullets();               // Projectile movement & lifetime
    updateDrones();                // Kamikaze drone AI
    updateEnemies();               // Enemy AI & seeking
    updateEnemyBullets();          // Enemy projectiles
    updateParticles();             // Visual effects
    updateFloatingTexts();         // Damage numbers
    updatePickups();               // Item magnetism
    updateWeapons();               // Weapon fire
    checkCollisions();             // All collision detection
    updateEffects();               // Shake, flash, slowmo
    checkMilestones();             // Score milestones
}
```

### 13.2 deltaTime Usage

- All physics/movement: `position += velocity * deltaTime`
- Rotation: `angle += rotationSpeed * deltaTime`
- Duration tracking: `timer -= deltaTime`
- Animations: `phase += speed * deltaTime`

### 13.3 Frame Rate Target

- Target: 60 FPS (16.67ms per frame)
- Low performance mode: Disables fancy effects if <25 FPS
- Mobile detection: Caps at 30 FPS

---

## 14. BOSS SYSTEM INTEGRATION NOTES

For planning a boss system, consider these integration points:

### 14.1 Enemy Pool Extension
```javascript
// Extend ENEMY_TYPES with boss variants
const ENEMY_TYPES = {
    // ... existing types
    BOSS: {
        radius: 40,        // Much larger
        speed: 100,
        turnRate: 45,
        hp: 150,           // Much tankier
        points: 500,       // High reward
        color: '#FF00FF',
        outline: '#AA00AA'
    }
};
```

### 14.2 Boss Spawn Trigger
```javascript
// Could spawn after reaching level 5, or score milestone
function checkBossSpawn() {
    if (playerLevel >= 5 && !bossSpawned) {
        spawnBoss();
        bossSpawned = true;
    }
}
```

### 14.3 Boss State Machine
Bosses would benefit from phase-based systems:
- Idle/approaching
- Attack pattern 1
- Phase transition
- Attack pattern 2
- Defeat

### 14.4 Special Rendering
Bosses need:
- Larger health bar overlay
- Special visual effects (glow, aura)
- Attack indicator (telegraph)
- Phase transition effect

### 14.5 Skill Tree Extension
Could add boss-specific upgrades:
```javascript
'boss_slayer': {
    name: 'BOSS SLAYER',
    description: 'Deal bonus damage to bosses',
    prereqs: ['arsenal'],
    cost: 1,
    color: '#FF1493'
}
```

### 14.6 Score & XP for Boss Defeats
```javascript
const BOSS_BASE_POINTS = 5000;
const BOSS_BASE_XP = 50;  // Much more than regular enemies
```

---

## 15. INPUT SYSTEM

### 15.1 Keyboard Controls

```javascript
const keys = {};

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;

    // Special actions
    if (e.code === 'KeyP') togglePause();
    if (e.code === 'KeyR') restart();
    if (e.code === 'KeyB') toggleDebugOverlay();
    if (e.code === 'Tab') showUpgradePanel();
    if (e.code === 'Digit1-3') selectUpgrade();
});
```

### 15.2 Touch/Mobile Controls

```javascript
const JOYSTICK_MAX_DISTANCE = 38;
const JOYSTICK_DEADZONE = 0;

// Virtual joystick at bottom-center of screen
// Position: bottom: 140px, left: 50%
// Size: 80px diameter, knob: 56px

// Thrust when joystick > 0.3 magnitude
// Rotation from angle
```

### 15.3 Cheat Codes (Debug)

```javascript
const CHEAT_CODES = {
    'skill_points': () => skillPoints += 10,
    'level_up': () => addXP(xpToNextLevel),
    'unlock_all': () => unlockedSkills = [...Object.keys(SKILL_TREE)],
    'money': () => score += 10000,
    // ... etc
};
```

---

## 16. AUDIO & VISUAL EFFECTS

No audio system implemented - game is silent.

Visual effects include:
- **Particles:** Small circular/trail effects on bullet hits
- **Floating Text:** Damage numbers, "+XP", kill text
- **Screen Shake:** On damage, level-up, wave start
- **Flash Overlay:** Color flash on events
- **Ring Effects:** Expanding circles at collision points
- **Lightning Zigzag:** Drawn paths between chain bounces
- **Trail Effects:** Drone trail, bullet trails
- **Slowmo:** 45% time scale on level-up

---

## 17. PERFORMANCE CHARACTERISTICS

### 17.1 Entity Limits
- Max enemies: 500 (200 on low-perf mode)
- Max bullets: 500 (pooled)
- Max particles: 400 (pooled)
- Max drones: 100 (pooled)

### 17.2 Culling Strategy
- Entities beyond screen+padding are not rendered
- Culling distance: 6000px max
- Improves FPS significantly on populated maps

### 17.3 Optimization Modes
- **Low Performance Mode:** Triggered when FPS < 25
  - Disables grid effects
  - Disables glow effects
  - Disables scanlines
  - Reduced particle counts

### 17.4 Performance Monitoring
```javascript
perfMonitor.fps              // Current FPS
perfMonitor.avgFrameTime     // Milliseconds
perfMonitor.entityCounts     // Breakdown of entities
perfMonitor.optimizationStats // Grid cells used
```

---

## 18. KEY CONSTANTS REFERENCE

```javascript
// Player
PLAYER_MAX_HP = 3
PLAYER_MAX_SHIELD = 400
PLAYER_SIZE = 48

// Movement
ROTATION_SPEED = 300 deg/sec
THRUST_ACCEL = 2200 px/sec²
MAX_SPEED = 600 px/sec

// Combat
BULLET_SPEED = 2000 px/sec
BULLET_LIFETIME = 1.2 sec
AUTO_FIRE_INTERVAL = 0.35 sec

// Enemies
MAX_ENEMIES = 500
SPAWN_INTERVAL = 0.15-0.35 sec (decaying)
WAVE_INTERVAL = 2.5 sec (base)

// XP/Levels
XP_PER_LEVEL_BASE = 25
XP_PER_LEVEL_GROWTH = 1.4 (exponential)

// World
WORLD_WIDTH = 11520 px
WORLD_HEIGHT = 6480 px
CANVAS_WIDTH = 1920 px
CANVAS_HEIGHT = 1080 px

// Effects
SCREEN_SHAKE_DURATION = 220-420 ms
SLOWMO_DURATION = 180 ms
SLOWMO_FACTOR = 0.45 (45% speed)
```

---

## Summary for Boss Design

**Integration Checklist:**
- [ ] Add boss to ENEMY_TYPES with high HP/radius
- [ ] Implement boss spawn condition (level/score milestone)
- [ ] Create boss phase/state machine (separate from regular enemy AI)
- [ ] Design special boss attacks (pattern telegraph, AoE, summons)
- [ ] Add boss-specific rendering (health bar, phase indicator)
- [ ] Balance reward (points, XP) proportional to difficulty
- [ ] Consider boss-slaying upgrade tree branch
- [ ] Test collision detection at boss scale
- [ ] Optimize rendering for boss visual effects
- [ ] Add audio/visual feedback for boss phases
- [ ] Create wave alert for boss spawn ("BOSS INCOMING!")

The game architecture is well-suited for boss encounters due to:
1. Flexible enemy type system (can extend ENEMY_TYPES)
2. Spatial grid collision detection (scales well)
3. Strong visual effects pipeline (particles, screen shake, flash)
4. Modular weapon system (testing against bosses is straightforward)
5. Object pooling (bosses can spawn projectiles efficiently)
