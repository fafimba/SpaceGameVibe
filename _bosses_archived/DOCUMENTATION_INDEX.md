# Stellar Swarm - Documentation Index

Complete technical documentation for the Stellar Swarm game codebase.

---

## 📚 Documentation Files

### 1. **CODEBASE_ANALYSIS.md** (43 KB)
**Comprehensive system breakdown with code snippets**

The primary reference document covering:
- **Weapon System** (Section 1): All 6 weapons, upgrade trees, fire rates
- **Enemy System** (Section 2): Types, spawning, scaling, wave patterns
- **Level/XP System** (Section 3): Progression curve, upgrade offering
- **Progression & Persistence** (Section 4): Game states, localStorage, meta-progression
- **HUD & UI** (Section 5): Canvas dimensions, element placement, color scheme
- **Game States** (Section 6): State machine, transitions, variables
- **Main Menu** (Section 7): Display elements, controls reference
- **Canvas Rendering** (Section 8): Camera system, world coordinates, background
- **Object Pools** (Section 9): Memory optimization, culling distances
- **Physics & Collision** (Section 10): Movement formulas, swept collision detection
- **Special Systems** (Section 11): Shield mechanics, orbital shields, lightning, drones, aura
- **Data Structures** (Section 12): Player, enemy, bullet, skill tree objects
- **Game Loop & Timing** (Section 13): Frame timing, deltaTime usage, performance
- **Boss Integration Notes** (Section 14): Template for boss system design
- **Input System** (Section 15): Keyboard, touch, cheat codes
- **Performance Characteristics** (Section 16): Entity limits, optimization modes
- **Key Constants Reference** (Section 17): Quick lookup table

**Use this for:** Understanding individual systems, code patterns, data structures

---

### 2. **INTEGRATION_GUIDE.md** (15 KB)
**Step-by-step boss system implementation guide**

Ready-to-use code templates for:
- **Step 1:** Add BOSS to ENEMY_TYPES
- **Step 2:** Boss spawn logic and conditions
- **Step 3:** Boss AI with phase transitions
- **Step 4:** Boss-specific rendering with health bar
- **Step 5:** Update killEnemy() for boss rewards
- **Step 6:** Add global variables
- **Step 7:** Update reset logic
- **Step 8:** Optional boss skill tree
- **Attack Patterns:** 4 example implementations (circular, spiral, cone, ring)
- **Difficulty Scaling:** Level-based adjustments
- **Testing Checklist:** 12-item validation list
- **Performance Considerations:** Pool size recommendations

**Use this for:** Implementing a boss encounter feature

---

### 3. **SYSTEM_ARCHITECTURE.md** (20 KB)
**Visual diagrams and architectural overview**

Contains 15 ASCII diagrams and flowcharts:
1. **Weapon Tree Hierarchy** - Visual tree of all skills and upgrades
2. **Progression System Flow** - Complete state transitions
3. **Game Loop Timing Diagram** - Frame-by-frame update order
4. **Collision Detection Pipeline** - 5-phase collision checking
5. **Enemy Spawning Architecture** - Continuous spawn vs wave system
6. **Weapon System Data Flow** - Stats calculation for each weapon
7. **State Machine Diagram** - Game states and transitions
8. **Entity Pool Architecture** - Memory pooling system
9. **Spatial Grid for Collision Optimization** - Grid-based collision lookup
10. **Camera Follow System** - World/screen coordinate transformations
11. **Shield System State Machine** - Shield visual states
12. **Rendering Layer Order** - Drawing order priority
13. **XP & Leveling Curve** - Level progression table
14. **Performance Monitoring** - FPS tracking and optimization
15. **Input Handling Pipeline** - Keyboard, touch, and special inputs

**Use this for:** High-level understanding, system interactions, visual reference

---

### 4. **PROJECT_OVERVIEW.md** (Existing)
General project structure and goals.

---

## 🎯 Quick Reference by Topic

### **I want to understand...**

#### Weapons & Combat
→ **CODEBASE_ANALYSIS.md** Section 1 (Weapon System)
→ **SYSTEM_ARCHITECTURE.md** Section 6 (Weapon Data Flow)
→ **INTEGRATION_GUIDE.md** (Attack patterns)

#### Enemy Behavior
→ **CODEBASE_ANALYSIS.md** Section 2 (Enemy System)
→ **SYSTEM_ARCHITECTURE.md** Section 5 (Enemy Spawning)

#### Progression System
→ **CODEBASE_ANALYSIS.md** Sections 3-4 (Level/XP, Persistence)
→ **SYSTEM_ARCHITECTURE.md** Section 2 (Progression Flow)

#### Rendering & Graphics
→ **CODEBASE_ANALYSIS.md** Section 8 (Canvas Rendering)
→ **SYSTEM_ARCHITECTURE.md** Section 12 (Rendering Layers)

#### Game States & Transitions
→ **CODEBASE_ANALYSIS.md** Section 6 (Game States)
→ **SYSTEM_ARCHITECTURE.md** Section 7 (State Machine)

#### Performance & Optimization
→ **CODEBASE_ANALYSIS.md** Section 9 (Object Pools)
→ **CODEBASE_ANALYSIS.md** Section 16 (Performance)
→ **SYSTEM_ARCHITECTURE.md** Section 8-9 (Pooling & Spatial Grid)

#### Collision Detection
→ **CODEBASE_ANALYSIS.md** Section 10 (Physics)
→ **SYSTEM_ARCHITECTURE.md** Section 4 (Collision Pipeline)

#### Input Handling
→ **CODEBASE_ANALYSIS.md** Section 15 (Input System)
→ **SYSTEM_ARCHITECTURE.md** Section 15 (Input Pipeline)

#### Add a Boss
→ **INTEGRATION_GUIDE.md** (Steps 1-8)
→ **CODEBASE_ANALYSIS.md** Section 14 (Boss Notes)

---

## 📊 Key Numbers Reference

### Canvas & World
- **Canvas:** 1920x1080 (responsive to 720x1280 mobile)
- **World Size:** 11520 x 6480 px (3x3 sector grid)
- **Viewport Parallax:** Multi-layer grid effect

### Player
- **Max HP:** 3
- **Max Shield:** 400
- **Shield Regen:** 50 pts/sec (after 2.5 sec delay)
- **Player Size:** 48px radius (collision: 20px)

### Combat
- **Laser Fire Rate:** 0.35 sec (rapid fire: 0.25 sec)
- **Laser Damage:** 10 (no upgrades), scaling with pierce/spread
- **Missile Damage:** 22 (explosion: 30)
- **Bullet Speed:** 2000 px/sec
- **Bullet Lifetime:** 1.2 sec

### Enemies
- **Max Enemies:** 500 (200 on low-perf)
- **Spawn Rate:** 0.35→0.03 sec (decaying)
- **SCOUT:** 4 HP, 120 px/sec, +10 points
- **TANK:** 12 HP, 70 px/sec, +75 points
- **KAMIKAZE:** 4 HP, 180 px/sec, +25 points
- **SPINNER:** 4 HP, 90 px/sec, fires bullets, +40 points

### Progression
- **Level 1→2:** 25 XP required
- **Exponential Curve:** 25 * 1.4^(level-1)
- **Skill Points:** 1 per level
- **Upgrade Cost:** 1 skill point each
- **Total Skills:** 24 (1 root + 6 main weapons + 17 upgrades)

### Effects
- **Screen Shake:** 6-12 intensity, 220-420 ms
- **Slow-Mo:** 45% time scale, 180 ms
- **Flash Overlay:** Configurable color/opacity/duration
- **Wave Alert:** 2.5 sec display

### Optimization
- **Spatial Grid:** 250px cells
- **Entity Pools:** 500 bullets, 400 enemies, 400 particles, etc.
- **Culling Distance:** 3000-6000px (type-dependent)
- **Low-Perf Threshold:** <25 FPS triggers mode switch

---

## 🔧 File Structure

```
SpaceGameVibe/
├── index.html                          (233 KB - main game)
├── DOCUMENTATION_INDEX.md              (this file)
├── CODEBASE_ANALYSIS.md               (comprehensive reference)
├── INTEGRATION_GUIDE.md                (boss implementation)
├── SYSTEM_ARCHITECTURE.md              (diagrams & flows)
├── PROJECT_OVERVIEW.md                 (project goals)
├── game-design/                        (design documents)
├── svg-graphics/                       (vector assets)
├── ui-ux-design/                       (UI mockups)
└── weapon-ability-generator/           (generator tools)
```

---

## 🎮 Game States Diagram

```
Menu (Start) → Playing (Main) → Game Over (Death)
               ↑        ↓
               └────Pause────┘

Upgrade Overlay (appears on level up)
```

**Detailed transitions in SYSTEM_ARCHITECTURE.md Section 7**

---

## 💾 Persistent Data

**Only Data Stored:** High Score (localStorage key: `StellarSwarm_highscore_v1`)

**Not Persisted:**
- Player progression (levels reset each run)
- Unlocked weapons (reset each run)
- Game state (no save/load feature)

---

## 🚀 Performance Profile

**Target:** 60 FPS
**Typical Performance:** 50-60 FPS on modern browsers
**Low-Perf Mode:** Activates at <25 FPS

**Entity Counts at Mid-Game:**
- Enemies: 50-200
- Bullets: 20-100
- Particles: 50-200
- Drones: 5-30

**Memory Usage:** ~5-15 MB (depending on platform)

---

## 📋 Development Notes

### Architecture Strengths
✅ Clean separation of concerns (physics, rendering, logic)
✅ Object pooling reduces garbage collection
✅ Spatial grid optimizes collision detection
✅ Flexible weapon/upgrade system
✅ Responsive touch controls
✅ Performance monitoring built-in
✅ Well-commented source code

### Extensibility Points
- Add weapon types → Extend SKILL_TREE + weapon stats calculation
- Add enemy types → Extend ENEMY_TYPES + AI logic
- Add visual effects → Use particle pool + effect system
- Add levels/bosses → Extend spawn/update logic

### Known Limitations
- Single-file HTML (easier deployment, harder to maintain at scale)
- No audio system implemented
- No networking/multiplayer
- No level editor or procedural generation
- Fixed world size (wrapping instead of infinite)

---

## 🎓 Learning Path

**New to codebase?**
1. Start: SYSTEM_ARCHITECTURE.md (visual overview)
2. Read: CODEBASE_ANALYSIS.md Sections 1-2 (weapons, enemies)
3. Study: index.html around line 1657 (main game loop)
4. Trace: updateEnemies() → updatePlayer() → checkCollisions()

**Want to add a feature?**
1. Check: CODEBASE_ANALYSIS.md (find related systems)
2. Reference: INTEGRATION_GUIDE.md (if boss-related)
3. Diagram: SYSTEM_ARCHITECTURE.md (understand flow)
4. Code: Look for `// TODO` comments in index.html

**Need performance tips?**
1. Read: CODEBASE_ANALYSIS.md Section 9 (pooling)
2. Study: spatialGrid implementation (line 917)
3. Monitor: perfMonitor object (line 1085)

---

## 📞 Quick Code Location Guide

| Feature | Location (approx line) |
|---------|------------------------|
| Game Loop | 1657 |
| Player Update | 1830 |
| Enemy Update | 3092 |
| Collision Detection | 3990 |
| Weapon Firing | 1962 (laser), 1984 (missiles) |
| Wave Spawning | 2782 |
| Upgrade System | 3411 (levelUp), 3464 (generateUpgradeOptions) |
| Rendering | 4443 (render), 4503 (background) |
| HUD | 5346 (renderHUD) |
| Menu | 5273 (renderMenu) |
| Object Pools | 1020 |
| Spatial Grid | 915 |

---

## 🔍 Version Info

- **Game:** Stellar Swarm
- **Built:** Single HTML5 Canvas file
- **Framework:** Vanilla JavaScript (no dependencies)
- **Browser Support:** Modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile:** Touch-optimized with virtual joystick
- **Documentation Generated:** February 7, 2025

---

**Happy developing!** Use these guides to understand, extend, and improve the Stellar Swarm codebase.
