# Stellar Swarm — Adaptive Difficulty System Spec

## 1. Design Philosophy

The core engagement driver is the player wanting to beat their personal best (measured in total kills). The difficulty system must serve this goal by creating a natural arc: steady progression toward the record, then escalating pressure as the player approaches and surpasses it.

### Key Principles

- **Chase the Record:** Difficulty stays moderate until the player reaches ~70-80% of their `bestKills`. Every run feels like meaningful progress, not a grind.
- **Kill Rate as the True Signal:** Instead of relying only on time or level for scaling, measure what the player is actually doing — how efficiently they kill. A player with overpowered weapons who kills everything without moving should face faster scaling.
- **Two Axes of Pressure:** Spawn rate (more enemies) and enemy HP (tougher enemies) are independent scaling axes. Before the record: primarily more spawn. After the record: primarily more HP.
- **No Hard Caps:** The current `playerSkillFactor` cap (1.25) and HP scaling limits are removed post-record. If a player is dominating, difficulty keeps rising. The game always wins eventually.
- **First Run Grace Period:** New players (no history) get a gentle ramp that lets them reach level 5-6, experience 2-3 weapon upgrades, and understand the core loop before pressure increases.

---

## 2. Current System (Reference)

### playerSkillFactor (meta-progression)
- Calculated from last 5 runs: survival time, wave reached, level reached
- Range: 0.75 (struggling) to 1.25 (skilled)
- Affects: enemy HP, speed, spawn rate, crystal/XP rewards (inverse)

### Spawn System
- `spawnInterval` starts at 1.3s, decays by 3.5% every 15s, minimum 0.20s
- Wave system: periodic large enemy groups (15-60 enemies)
- Max enemies: 500 base, +5 per wave, hard cap 1500

### HP Scaling
- Formula: `1.09^(playerLevel - 1) * diffMult.enemyHP`
- `diffMult.enemyHP` ranges 0.75x to 1.25x (capped by `playerSkillFactor`)

### Overwhelm Check
- Every 10s: if player took 3+ hits AND >40 enemies, reduce spawn rate (up to 50%)
- Recovers when player takes 1 or fewer hits

### What We Already Track
- `bestKills`: all-time best total kills (in progression)
- `runHistory`: last 10 runs with survivalTime, waveReached, levelReached, totalKills, weapon, deathCause
- `totalKills`: real-time kill counter during gameplay

---

## 3. New System: Adaptive Kill-Rate Scaling

### 3.1 Kill Rate Tracker (NEW)

Add a sliding window that measures the player's kill efficiency in real time.

**New variables:**
```javascript
let recentKillTimestamps = [];     // timestamps of recent kills
const KILL_WINDOW = 12;            // seconds to look back
let killRate = 0;                  // kills per second (updated each frame)
let killEfficiency = 0;            // killRate relative to spawn pressure
```

**Kill rate calculation (per frame):**
```javascript
// On every enemy kill:
recentKillTimestamps.push(gameTime);

// Per frame update:
// Remove timestamps older than KILL_WINDOW
while (recentKillTimestamps.length > 0
       && recentKillTimestamps[0] < gameTime - KILL_WINDOW) {
    recentKillTimestamps.shift();
}
killRate = recentKillTimestamps.length / KILL_WINDOW;

// Kill efficiency: how well the player handles current pressure
// > 1.0 = dominating, < 0.5 = struggling
const expectedKillRate = enemies.length > 0
    ? Math.min(enemies.length / 8, 15) : 1;
killEfficiency = killRate / expectedKillRate;
```

`killEfficiency` is the key signal. Above 1.0 = killing faster than enemies accumulate. Below 0.5 = overwhelmed.

---

### 3.2 Record-Relative Scaling (NEW)

The distance to the player's `bestKills` modulates how aggressively difficulty scales.

**Record progress:**
```javascript
const bestKills = cachedProgression.stats.bestKills || 0;

// recordProgress: 0.0 = start, 1.0 = at record, >1.0 = beyond record
let recordProgress = bestKills > 0
    ? totalKills / bestKills
    : Math.min(totalKills / 150, 2.0);  // first run: use 150 as virtual target
```

**Scaling phases:**

| Phase | recordProgress | Spawn Pressure | HP Scaling |
|-------|---------------|----------------|------------|
| **Cruise** | 0% - 70% | Base rate. Kill efficiency gently accelerates spawn if player is dominating. | Normal (`1.09^level * skillFactor`). No extra scaling. |
| **Approach** | 70% - 100% | Spawn ramps up. High kill efficiency accelerates faster. | Starts increasing beyond base. Scales with proximity to record. |
| **Beyond** | > 100% | Near maximum. Still reacts to kill efficiency. | Unlimited scaling. Every kill beyond record raises HP further. No cap. |

**Core formula:**
```javascript
function getAdaptiveMultipliers() {
    const rp = recordProgress;  // 0.0 to infinity
    const ke = killEfficiency;   // 0.0 to ~2.0+

    // --- SPAWN PRESSURE ---
    let spawnMult = 1.0;
    if (rp < 0.7) {
        // Cruise: mild acceleration if dominating
        spawnMult = 1.0 + Math.max(0, (ke - 1.0)) * 0.3;
    } else if (rp < 1.0) {
        // Approach: ramp up, amplified by kill efficiency
        const approach = (rp - 0.7) / 0.3;  // 0 to 1
        spawnMult = 1.0 + approach * 0.6
                       + Math.max(0, (ke - 0.8)) * 0.4;
    } else {
        // Beyond: near max spawn, slight ke boost
        spawnMult = 1.6 + Math.min((rp - 1.0) * 0.3, 0.6)
                       + Math.max(0, (ke - 0.8)) * 0.3;
    }

    // --- HP SCALING ---
    let hpMult = 1.0;
    if (rp < 0.7) {
        // Cruise: standard HP from level scaling only
        hpMult = 1.0;
    } else if (rp < 1.0) {
        // Approach: gentle HP increase
        const approach = (rp - 0.7) / 0.3;
        hpMult = 1.0 + approach * 0.3;
    } else {
        // Beyond: unlimited HP scaling
        // Each 10% beyond record = +20% HP, no cap
        hpMult = 1.3 + (rp - 1.0) * 2.0;
    }

    return { spawnMult, hpMult };
}
```

---

### 3.3 First Run Experience

When `bestKills === 0` and `runHistory` is empty, the player has never played before.

**Goals:**
- Reach level 5-6 comfortably (experience 2-3 weapon upgrade choices)
- Feel the core loop: kill, collect XP, level up, choose upgrade, get stronger
- Game gets challenging around level 6-7, death around level 7-9 for average players
- Leave the player wanting to try again, curious about weapons they didn't pick

**Implementation:**
```javascript
const isFirstRun = bestKills === 0 && runHistory.length === 0;

if (isFirstRun) {
    // Use a virtual bestKills target of 150
    // This means 'cruise' phase lasts until ~105 kills (70% of 150)
    // With reduced base spawn, this gives the player time to level up

    // Override playerSkillFactor to 0.85 (gentle)
    playerSkillFactor = 0.85;

    // Grace period: first 90 seconds use even softer spawn
    if (gameTime < 90) {
        spawnMult *= 0.7;  // 30% less enemies
    }
}
```

With `playerSkillFactor` at 0.85, the player gets more crystals and XP (inverse scaling), enemies are softer, and the virtual target of 150 kills gives a natural 2-3 minute cruise before things heat up. Enough to hit level 5-6 and taste the upgrade system.

---

### 3.4 Integration with Existing Systems

**Where the new multipliers apply:**

| System | Current | New |
|--------|---------|-----|
| **Spawn Timer** | `spawnInterval / (spawnRateMult * (1 - overwhelmReduction))` | Same, but multiply denominator by `adaptive.spawnMult` |
| **Enemy HP** | `1.09^(level-1) * diffMult.enemyHP` | Same, but multiply by `adaptive.hpMult` |
| **Wave Size** | `15 + floor(level * 3)`, cap 60 | Multiply by `adaptive.spawnMult` (cap raised to 80) |
| **Overwhelm Check** | Reduces spawn if 3+ hits in 10s | Unchanged. Acts as safety net on top of adaptive system. |
| **playerSkillFactor** | 0.75 - 1.25, affects all `getDiffMultipliers()` | Keep as base. Adaptive multipliers are layered on top, not replacing it. |

**What to remove or modify:**
- **Remove:** The 1.25 cap on `playerSkillFactor` for HP. Let `hpMult` scale freely in "Beyond" phase.
- **Remove:** Any implicit difficulty plateau. The `spawnInterval` minimum (0.20s) can stay as a floor, but `adaptive.spawnMult` effectively bypasses it by scaling wave size and spawn frequency together.
- **Keep:** `overwhelmReduction` as a safety valve. It only activates when the player is truly struggling (3+ hits), which is the right behavior.
- **Keep:** `spawnRateMult` from `getDiffMultipliers()`. The adaptive system multiplies on top of it, not replacing it.

---

### 3.5 Expected Behavior Examples

**Scenario A: First-Time Player**
- bestKills: 0, no runHistory
- Virtual target: 150 kills. playerSkillFactor: 0.85
- First 90s: reduced spawn (0.7x), enemies have low HP
- Reaches level 5-6 by ~100 kills, picks 2-3 upgrades
- Difficulty ramps at 105 kills (70% of 150)
- Dies around 150-250 kills at level 7-9
- Sees "NEW RECORD!" Always. Wants to try again.

**Scenario B: Returning Player, Mediocre Weapons**
- bestKills: 800, runHistory avg: moderate
- Cruise until ~560 kills (70%), comfortable progression
- Kill efficiency around 0.7-0.9 (not dominating)
- Spawn scales gently, HP barely increases
- Reaches record around minute 5-6, dies shortly after
- Feels like progress was steady, death was fair

**Scenario C: Skilled Player, Overpowered Build**
- bestKills: 1200, picks laser + plasma (strong combo)
- Kill efficiency 1.5+ in cruise phase (dominating)
- System detects domination: spawn accelerates early
- More spawn = more kills = more XP = faster levels = reaches record faster
- At record: HP starts climbing sharply
- The overpowered build is challenged because HP keeps scaling
- Dies at 1400 kills. Game always wins, but player went further

**Scenario D: Player Barely Moving (AFK-ish)**
- Strong weapons kill everything, player doesn't move much
- Kill efficiency 2.0+: system responds aggressively
- Spawn ramps fast, pushing toward record quickly
- HP starts climbing even before record (kill efficiency boost)
- Enemies become tanky enough that stationary play fails
- Forces engagement or death. No infinite idle runs.

---

## 4. Implementation Milestones

Ordered by dependency. Each milestone is a self-contained, testable unit.

---

### Milestone 1: Kill Rate Tracker

**Scope:** Add `recentKillTimestamps`, `killRate`, `killEfficiency` variables and update logic.

**Tasks:**
1. **Add variables** in game state section (~L1691-1700): `recentKillTimestamps[]`, `killRate`, `killEfficiency`
2. **Track kills:** In every location where an enemy dies (collision kills, weapon kills, explosion kills), push `gameTime` to `recentKillTimestamps`
3. **Per-frame update:** In `updateSpawnSystem()` or `gameLoop()`, prune old timestamps from `recentKillTimestamps`, compute `killRate` and `killEfficiency`
4. **Reset on game start:** Clear all kill tracking vars in `resetGame()`
5. **No transport needed:** `recentKillTimestamps` is time-based, not position-based

**Validation:** Add temporary HUD display showing `killRate` and `killEfficiency`. Play a round and verify: killRate spikes during heavy combat, killEfficiency > 1.0 when dominating, < 0.5 when overwhelmed. Remove debug HUD after validation.

---

### Milestone 2: Record Progress Tracker

**Scope:** Add `recordProgress` variable that tracks how close the player is to their `bestKills`.

**Tasks:**
1. **Add variable:** `recordProgress` (initialized 0 in `resetGame`)
2. **Update per frame:** In gameLoop or `updateSpawnSystem`, calculate `recordProgress = totalKills / bestKills` (or virtual target for first run)
3. **First run detection:** If `bestKills === 0` AND `runHistory.length === 0`, use 150 as virtual bestKills target
4. **Cache bestKills:** Load bestKills from `cachedProgression` in `resetGame()` into a local variable (don't read localStorage every frame)
5. **Minimum effective target:** `effectiveBestKills = Math.max(bestKills, 100)` to prevent ultra-short cruise phases for players with very low records

**Validation:** Debug HUD showing `recordProgress`. Should read 0.0 at start, approach 1.0 near record, exceed 1.0 after record.

---

### Milestone 3: getAdaptiveMultipliers()

**Scope:** The core function that computes `spawnMult` and `hpMult` based on `recordProgress` and `killEfficiency`.

**Tasks:**
1. **Create function:** `getAdaptiveMultipliers()` returning `{ spawnMult, hpMult }` as specified in section 3.2
2. **Place it:** Near `getDiffMultipliers()` for code organization
3. **First run logic:** Inside the function, detect first run and apply grace period modifiers (0.7x spawn in first 90s, playerSkillFactor override to 0.85)

**Validation:** Unit-style test: call function with various recordProgress/killEfficiency combinations, log results. Verify cruise phase returns ~1.0, approach ramps up, beyond scales without limit.

---

### Milestone 4: Integrate Spawn Scaling

**Scope:** Wire `adaptive.spawnMult` into the spawn system.

**Files:** `index.html` — `updateSpawnSystem()`, `spawnWave()`

**Tasks:**
1. **Spawn timer:** In the spawn timer calculation (~L5123-5127), multiply the denominator by `adaptive.spawnMult`. Result: `spawnTimer = (spawnInterval + random) / (spawnRateMult * (1 - overwhelmReduction) * adaptive.spawnMult)`
2. **Wave size:** In `spawnWave()` (~L5159-5160), multiply `baseCount` by `adaptive.spawnMult`. Raise cap from 60 to 80.
3. **Cache the multipliers:** Call `getAdaptiveMultipliers()` once per frame (or once per spawn cycle), not per-enemy. Store in a local variable.

**Validation:** Play two runs: (1) Intentionally play poorly (low kill efficiency) and verify spawns stay moderate. (2) Use a strong build and dominate — verify spawn rate noticeably accelerates mid-run.

---

### Milestone 5: Integrate HP Scaling

**Scope:** Wire `adaptive.hpMult` into enemy HP calculation. Remove old caps.

**Tasks:**
1. **Enemy HP:** Where `hpMultiplier` is calculated (~L5285-5286 for normal spawns, ~L5164 for wave spawns), multiply by `adaptive.hpMult`
2. **Remove SF cap:** In `calculatePlayerSkillFactor()`, remove the `Math.min(..., 1.25)` cap on the final value. The adaptive system handles throttling now.
3. **Verify exponential isn't insane:** Add a sanity log: if `hpMult > 5.0`, log a warning. This shouldn't happen in normal play but protects against formula bugs.

**Validation:** Play a run past the record. Verify enemies get noticeably tankier. Check that a 2x record run has enemies with clearly higher HP than at 1x record.

---

### Milestone 6: First Run Polish

**Scope:** Fine-tune the first-run experience.

**Tasks:**
1. **Grace period:** Implement the first 90s reduced spawn for first-run players (check `isFirstRun` flag)
2. **playerSkillFactor override:** Set to 0.85 when `isFirstRun` is true
3. **Virtual target tuning:** Playtest with virtual bestKills = 150. Adjust if first run feels too short or too long. Target: death around level 7-9, 2-3 minutes.
4. **Ensure NEW RECORD shows:** First run always sets a new bestKills, so the game over screen should always show the record banner.

**Validation:** Clear localStorage, play fresh. Should reach level 5-6 comfortably, see 2-3 upgrade choices, feel challenged by level 7, die around level 8. "NEW RECORD" should appear.

---

### Milestone 7: Cleanup & Tuning

**Scope:** Remove debug HUD, finalize constants, balance pass.

**Tasks:**
1. **Remove debug displays:** Remove any temporary killRate/recordProgress HUD elements
2. **Constants review:** Collect all new magic numbers into named constants near the top of the file:
   - `KILL_WINDOW = 12`
   - `FIRST_RUN_VIRTUAL_TARGET = 150`
   - `FIRST_RUN_GRACE_SECONDS = 90`
   - `FIRST_RUN_GRACE_MULT = 0.7`
   - `FIRST_RUN_SKILL_FACTOR = 0.85`
   - `RECORD_CRUISE_THRESHOLD = 0.7`
   - `WAVE_SIZE_CAP = 80`
3. **Update code index:** Update `.claude/code-index.md` with new functions, variables, and line numbers
4. **Playtest matrix:** Test these combinations and note results:
   - First run (no history)
   - Low skill player (bestKills ~200)
   - Medium skill (bestKills ~600)
   - High skill (bestKills ~1500)
   - Overpowered build (laser + plasma)
   - Weak build (verify game isn't brutal)
5. **Tune constants:** Adjust values based on playtest results

**Validation:** All scenarios produce satisfying runs where the player feels engaged and the difficulty feels fair. No scenario produces a boring infinite run or a frustratingly short one.

---

## 5. New Constants Reference

| Constant | Value | Purpose |
|----------|-------|---------|
| `KILL_WINDOW` | 12 | Seconds of kill history to consider for kill rate |
| `FIRST_RUN_VIRTUAL_TARGET` | 150 | Virtual bestKills for players with no history |
| `FIRST_RUN_GRACE_SECONDS` | 90 | Reduced spawn period at start of first run |
| `FIRST_RUN_GRACE_MULT` | 0.7 | Spawn multiplier during grace period |
| `FIRST_RUN_SKILL_FACTOR` | 0.85 | playerSkillFactor override for first run |
| `RECORD_CRUISE_THRESHOLD` | 0.7 | recordProgress below this = cruise phase |
| `WAVE_SIZE_CAP` | 80 | New max wave size (was 60) |

All values are initial recommendations. Expect to tune them during Milestone 7 playtesting.

---

## 6. Risks & Edge Cases

**Player with very high record (bestKills 5000+):** Cruise phase lasts until 3500 kills. This is intentional — a skilled player has earned a long comfortable run. Kill efficiency system still accelerates spawn if they're dominating, so it won't feel boring.

**Player resets progression:** If localStorage is cleared, treated as first-run again. Correct behavior — they've lost upgrades too.

**Very short records (bestKills ~30):** Cruise phase ends almost immediately. Fix: `effectiveBestKills = Math.max(bestKills, 100)` ensures minimum cruise duration.

**Kill rate manipulation:** A player could intentionally not kill to keep killEfficiency low. Self-limiting: no kills = no XP = no levels = no upgrades. Time-based spawn decay still applies regardless. No fix needed.

**Performance with high spawn:** Adaptive spawnMult could push enemy counts high. The existing `HARD_MAX_ENEMIES` (1500) cap protects against this. Spawning should pause when approaching the hard max regardless of spawnMult.
