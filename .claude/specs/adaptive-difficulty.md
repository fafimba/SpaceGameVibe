# Adaptive Difficulty System — Development Specs

## Problem Analysis

### Current System Pain Points

The difficulty escalation is too aggressive in several compounding ways:

1. **Spawn interval decays too fast**: Every 10s (`SPAWN_DECAY_INTERVAL`), the spawn interval shrinks by 5% (`SPAWN_DECAY_RATE`). After 60s the interval is already ~73% of original, and each spawn creates 3-5 enemies (`spawnEnemy()` groups).

2. **Waves start too early and too frequently**: Waves begin at level 2 with a base interval of only 2.5s (`WAVE_INTERVAL_BASE`). Each wave drops 20+ enemies in tight clusters. At level 5+, there's a 40% chance of spawning 2 waves simultaneously.

3. **Wave size scales steeply**: `baseCount = 20 + playerLevel * 4`, so at level 5 you're getting waves of 40 enemies. Combined with the 2-wave simultaneous chance, that's potentially 80 enemies in one burst.

4. **HP scaling is exponential**: `Math.pow(1.12, playerLevel - 1)` means at level 10, enemies have 2.77x HP. At level 15, 4.84x. This compounds with the quantity increase to create overwhelming situations.

5. **No breathing room**: There's no concept of "calm periods" between waves. The constant spawn + wave system means pressure never lets up.

6. **No player skill adaptation**: A veteran and a first-timer get identical difficulty curves. No mechanism to ease up on struggling players or challenge skilled ones.

---

## Feature 1: Softer Base Difficulty Curve

### Goal
Reduce the feeling of being overwhelmed in early-mid game while keeping the late-game intense.

### Changes

#### A. Spawn System Tweaks
```
CURRENT → NEW
INITIAL_SPAWN_INTERVAL_MIN: 0.6 → 0.8
INITIAL_SPAWN_INTERVAL_MAX: 1.0 → 1.3
MIN_SPAWN_INTERVAL: 0.15 → 0.20
SPAWN_DECAY_RATE: 0.05 → 0.035
SPAWN_DECAY_INTERVAL: 10 → 15
spawnEnemy() group size: 3-5 → 2-4
```

#### B. Wave System Tweaks
```
CURRENT → NEW
WAVE_INTERVAL_BASE: 2.5 → 4.0
WAVE_INTERVAL_VARIANCE: 1.5 → 2.0
Wave start: level 2 → level 3
Simultaneous waves: level 5 (40%) → level 8 (30%)
Wave base count: 20 + level*4 → 15 + level*3
Wave max: 80 → 60
levelSpeedBonus cap: 1.8 → 1.2
Min wave interval: 1.2 → 2.0
```

#### C. HP Scaling Reduction
```
CURRENT → NEW
HP multiplier base: 1.12 → 1.09
```
This changes level 10 from 2.77x → 2.17x, level 15 from 4.84x → 3.34x. Still challenging but less spongy.

#### D. Breathing Room (New Mechanic)
After each wave, add a brief "calm window" where no new regular spawns occur:
```javascript
let waveCalm = 0; // seconds of calm remaining after a wave
// In spawnWave(): set waveCalm = 1.5 + wave_size/40 (bigger waves = more calm)
// In updateSpawnSystem(): skip regular spawn if waveCalm > 0
```

---

## Feature 2: Adaptive Difficulty Based on Run History

### Goal
Track player performance across runs and dynamically adjust the next run's difficulty to maintain engagement. Struggling players get gentler curves; skilled players get pushed harder.

### Data Model — Run History

Store in `progression` (localStorage), alongside existing data:

```javascript
// Inside progression object:
runHistory: [
    {
        timestamp: 1709900000000,
        survivalTime: 185,      // seconds survived
        waveReached: 12,        // highest wave number
        levelReached: 8,        // highest player level
        totalKills: 342,
        weapon: 'laser_cannon', // starting weapon
        deathCause: 'damage'    // 'damage' | 'overwhelm' (died with >30 enemies on screen)
    },
    // ... keep last 10 runs
]
```

**Save point**: In `gameOver()`, push run data before saving crystals.
**Cleanup**: Keep only last 10 runs (`runHistory.slice(-10)`).

### Adaptive Difficulty Multiplier

Calculate a `playerSkillFactor` at run start from the last 5 runs (or fewer if not enough data):

```javascript
function calculateSkillFactor(runHistory) {
    if (!runHistory || runHistory.length === 0) return 1.0; // default

    const recent = runHistory.slice(-5);

    // Average survival time (target: 180-300s for "normal" skill)
    const avgSurvival = recent.reduce((s, r) => s + r.survivalTime, 0) / recent.length;

    // Average wave reached (target: 10-18 for "normal")
    const avgWave = recent.reduce((s, r) => s + r.waveReached, 0) / recent.length;

    // Average level reached (target: 6-12 for "normal")
    const avgLevel = recent.reduce((s, r) => s + r.levelReached, 0) / recent.length;

    // Composite score (0-100 scale)
    const survivalScore = Math.min(avgSurvival / 300, 1.0) * 40;  // 40 points max
    const waveScore = Math.min(avgWave / 18, 1.0) * 30;           // 30 points max
    const levelScore = Math.min(avgLevel / 12, 1.0) * 30;         // 30 points max
    const compositeScore = survivalScore + waveScore + levelScore;

    // Map to difficulty multiplier (0.75 - 1.25 range)
    // Score 0-30: struggling → 0.75-0.90 (easier)
    // Score 30-60: normal → 0.90-1.10 (standard)
    // Score 60-100: skilled → 1.10-1.25 (harder)
    if (compositeScore < 30) {
        return 0.75 + (compositeScore / 30) * 0.15;  // 0.75 → 0.90
    } else if (compositeScore < 60) {
        return 0.90 + ((compositeScore - 30) / 30) * 0.20;  // 0.90 → 1.10
    } else {
        return 1.10 + ((compositeScore - 60) / 40) * 0.15;  // 1.10 → 1.25
    }
}
```

### How the Factor Applies

The `playerSkillFactor` modifies difficulty through `getDiffMultipliers()`:

```javascript
function getDiffMultipliers() {
    const sf = playerSkillFactor; // set at run start
    return {
        enemyHP: sf,                              // more/less HP
        enemySpeed: 0.9 + sf * 0.1,              // subtle speed change
        spawnRate: 0.85 + sf * 0.15,             // spawn frequency
        crystals: 1 + (1 - sf) * 0.3,           // struggling → more crystals (compensate)
        xp: 1 + (1 - sf) * 0.2                  // struggling → more XP (level up faster)
    };
}
```

Key design principle: **struggling players get both easier enemies AND more rewards**, creating a positive feedback loop that helps them progress faster.

### Additional Adaptive Tweaks

Beyond `getDiffMultipliers()`, the skill factor also adjusts:

```javascript
// In updateSpawnSystem():
// Wave start level shifts based on skill
const waveStartLevel = sf < 0.9 ? 4 : (sf > 1.1 ? 2 : 3);

// Simultaneous wave threshold shifts
const dualWaveLevel = sf < 0.9 ? 10 : (sf > 1.1 ? 6 : 8);

// Wave calm duration inversely scales with skill
const calmDuration = (1.5 + waveSize/40) * (2 - sf); // struggling = longer calm
```

---

## Feature 3: "Overwhelm" Detection (Mid-Run Safety Valve)

### Goal
If the player is clearly struggling mid-run, temporarily reduce pressure instead of letting them die in frustration.

### Implementation

```javascript
// Track recent damage
let recentDamageEvents = 0; // reset every 10s
let overwhelmReduction = 0; // 0-0.5, applied to spawn rate

function updateOverwhelmCheck() {
    // Every 10 seconds, evaluate
    if (Math.floor(gameTime) % 10 === 0 && Math.floor(gameTime) !== lastOverwhelmCheck) {
        lastOverwhelmCheck = Math.floor(gameTime);

        // If player took 3+ hits in the last 10s AND enemies > 40 on screen
        if (recentDamageEvents >= 3 && enemies.length > 40) {
            overwhelmReduction = Math.min(overwhelmReduction + 0.15, 0.5);
            // Quietly: skip next wave, give calm period
            waveCalm = Math.max(waveCalm, 3.0);
        } else if (recentDamageEvents <= 1) {
            // Player is doing fine, reduce the safety valve
            overwhelmReduction = Math.max(overwhelmReduction - 0.1, 0);
        }
        recentDamageEvents = 0;
    }
}
```

This is **invisible to the player** — no UI indication. The game just subtly eases off when they're getting pummeled.

---

## Migration & Compatibility

### localStorage Migration
```javascript
// In loadProgression(), add:
if (!data.runHistory) data.runHistory = [];
```

The system gracefully handles 0 runs (returns factor 1.0), so existing players start at normal difficulty and it adapts from there.

---

## Development Milestones

### Milestone 1: Softer Base Curve (Quick Win)
**Scope**: Adjust constants only, no new systems.
**Changes**:
- Update spawn constants (intervals, decay rate, group size)
- Update wave constants (interval, start level, size scaling, simultaneous threshold)
- Reduce HP scaling exponent (1.12 → 1.09)
- Add breathing room (`waveCalm` variable + skip spawns during calm)
**Test**: Play a full run. First 2 minutes should feel manageable. Intensity should ramp but not spike.
**Lines affected**: ~L220-228 (spawn constants), ~L367-371 (wave constants), ~L4005-4040 (updateSpawnSystem), ~L4042-4053 (spawnWave), ~L4148-4162 (spawnEnemy)

### Milestone 2: Run History Tracking
**Scope**: Save/load run data, no gameplay effect yet.
**Changes**:
- Add `runHistory` to `createDefaultProgression()`
- Add migration in `loadProgression()` for existing saves
- In `gameOver()`: capture run stats, push to `runHistory`, trim to 10
- Add `deathCause` detection (count enemies on screen at death)
**Test**: Play 3 runs, verify `localStorage` has `runHistory` with correct data.
**Lines affected**: ~L670-696 (createDefaultProgression), ~L698-723 (loadProgression), ~L7467-7496 (gameOver)

### Milestone 3: Adaptive Difficulty Engine
**Scope**: Calculate skill factor, wire into gameplay.
**Changes**:
- Add `calculateSkillFactor()` function
- Add `playerSkillFactor` game state variable
- In `resetGame()`: compute factor from stored history
- Update `getDiffMultipliers()` to use the factor
- Wire wave start level, dual-wave threshold, calm duration to factor
**Test**: Artificially set `runHistory` with low-skill data (short runs), verify the next run feels easier. Set high-skill data, verify it's harder.
**Lines affected**: ~L647-649 (getDiffMultipliers), ~L1901-1932 (resetGame), ~L4026-4039 (wave system)

### Milestone 4: Overwhelm Safety Valve
**Scope**: Mid-run dynamic adjustment.
**Changes**:
- Add `recentDamageEvents` counter (increment in `damagePlayer()`)
- Add `overwhelmReduction` variable
- Add `updateOverwhelmCheck()` called from `update()`
- Apply `overwhelmReduction` to spawn timer calculation
- When overwhelm triggers: force calm period, reduce spawn for 10s
**Test**: Stand still and take hits. Game should ease off after several rapid hits instead of continuing to pile on.
**Lines affected**: ~L2332 (update), ~L4020-4023 (spawn timer), ~L7268 (damagePlayer)

### Milestone 5: Polish & Balance
**Scope**: Playtesting and fine-tuning.
**Changes**:
- Playtest extensively at each skill tier (new player, average, veteran)
- Tune the composite score thresholds and factor ranges
- Tune overwhelm detection sensitivity
- Verify crystal/XP compensation feels right for struggling players
- Ensure late-game (5min+) still gets intense for skilled players
- Optional: add subtle HUD indicator for skill factor during development (remove before release)
**Test**: Multiple runs with different play styles. Session length should average 3-8 min across skill levels.
