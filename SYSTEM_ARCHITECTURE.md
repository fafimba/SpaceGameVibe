# Stellar Swarm - System Architecture & Diagrams

## 1. Weapon Tree Hierarchy

```
                    SHIP ARSENAL (root)
                           |
        ___________|___________|___________|___________|
        |          |          |          |          |
      LASER     MISSILE    ORBITAL   LIGHTNING  PLASMA   ALIEN
     CANNON    LAUNCHER    SHIELD      RAY      FIELD    DRONE
     #FF6B5B   #FFD93D    #00DFFF    #9F7AEA   #7FDBFF  #39FF14
        |          |          |          |          |          |
      __|__      __|__      __|__      __|__      __|__      __|__
     |  |  |    |  |  |    |  |  |    |  |  |    |  |  |    |  |  |
     1  2  3    4  5  6    7  8  9   10 11 12   13 14 15   16 17 18

UPGRADES:
1=rapid_fire          7=regen_capacitors    13=field_expansion
2=piercing_lens       8=shockwave_emitter   14=field_intensity
3=beam_splitter       9=energy_absorption   15=field_pulse
4=homing_guidance    10=chain_amplifier    16=drone_duo
5=cluster_payload    11=rapid_discharge    17=drone_duration
6=armor_piercing     12=extended_arc       18=drone_explosion
```

## 2. Progression System Flow

```
START GAME
    |
    v
MENU STATE
  - Display high score (from localStorage)
  - Wait for ENTER / TAP
    |
    v
RESET GAME
  - playerLevel = 1
  - playerXP = 0
  - unlockedSkills = ['arsenal', 'laser_cannon']
  - skillPoints = 0
  - score = 0
    |
    v
PLAYING STATE
    |
    +---> ENEMY KILL
    |       |
    |       +---> addXP(1)
    |       |
    |       +---> playerXP += 1
    |       |
    |       +---> Check: playerXP >= xpToNextLevel?
    |            |
    |            YES (can be multiple levels at once)
    |            |
    |            +---> playerLevel++
    |            +---> xpToNextLevel = 25 * 1.4^(level-1)
    |            +---> skillPoints++
    |            +---> triggerFlash(), triggerSlowmo()
    |            |
    |            +---> Check: allSkillsUnlocked()?
    |                 |
    |                 NO
    |                 |
    |                 +---> gameState = 'skilltree'
    |                 +---> showUpgradePanel()
    |                 +---> upgradeOptions = generateUpgradeOptions()
    |                       (3 random unlockable skills)
    |                 |
    |                 +---> WAIT FOR PLAYER SELECTION
    |                 |
    |                 +---> selectUpgrade(skillId)
    |                 |       |
    |                 |       +---> unlockedSkills.push(skillId)
    |                 |       +---> skillPoints--
    |                 |       +---> triggerUnlockEffect(skillId)
    |                 |             (e.g., unlock weapon icon)
    |                 |
    |                 +---> gameState = 'playing'
    |
    +---> PLAYER DIES
             |
             +---> gameState = 'gameOver'
             +---> Save high score if score > highScore
             +---> Wait for RETRY (R / TAP)
             +---> Reset game loop
```

## 3. Game Loop Timing Diagram

```
60 FPS TARGET (16.67 ms per frame)

Frame N:
┌─────────────────────────────────────────┐
│ gameLoop(timestamp)                     │
├─────────────────────────────────────────┤
│ Calculate deltaTime (capped at 0.1s)    │
│ Apply timeScale (for slowmo)            │
├─────────────────────────────────────────┤
│ if (gameState === 'playing'):           │
│   ├─ updateInput()                      │
│   ├─ updatePlayer()                     │
│   ├─ updateCamera()                     │
│   ├─ checkSectorBoundary()              │
│   ├─ updateSpawnSystem()                │
│   ├─ updateBullets()                    │
│   ├─ updateDrones()                     │
│   ├─ updateEnemies()                    │
│   ├─ updateEnemyBullets()               │
│   ├─ updateParticles()                  │
│   ├─ updateFloatingTexts()              │
│   ├─ updatePickups()                    │
│   ├─ updateWeapons()                    │
│   ├─ checkCollisions()                  │
│   ├─ updateEffects()                    │
│   └─ checkMilestones()                  │
├─────────────────────────────────────────┤
│ render()                                 │
│ ├─ Apply screen shake                   │
│ ├─ renderBackground()                   │
│ ├─ [Apply camera transform]             │
│ ├─ renderPickups()                      │
│ ├─ renderEnemies()                      │
│ ├─ renderBullets()                      │
│ ├─ renderDrones()                       │
│ ├─ renderEnemyBullets()                 │
│ ├─ renderAura()                         │
│ ├─ renderPlayer()                       │
│ ├─ renderShieldArc()                    │
│ ├─ renderOrbitals()                     │
│ ├─ renderLightning()                    │
│ ├─ renderParticles()                    │
│ ├─ renderFloatingTexts()                │
│ ├─ [Remove camera transform]            │
│ ├─ renderFlashOverlay()                 │
│ └─ renderUI()                           │
├─────────────────────────────────────────┤
│ requestAnimationFrame(gameLoop)         │
└─────────────────────────────────────────┘

Frame N+1: (repeat)
```

## 4. Collision Detection Pipeline

```
checkCollisions()
│
├─ Rebuild spatial grid
│  └─ for each enemy: insert(enemy, config.radius + 100)
│
├─ PHASE 1: Bullet vs Enemy
│  ├─ for each bullet:
│  │  ├─ Get nearby enemies via spatialGrid.queryRadius()
│  │  ├─ for each nearby enemy:
│  │  │  ├─ lineCircleCollision(prevX,Y, curX,Y, enemyX,Y, radius)
│  │  │  ├─ if hit:
│  │  │  │  ├─ enemy.hp -= bullet.damage
│  │  │  │  ├─ spawnFloatingText(damage)
│  │  │  │  ├─ if enemy.hp <= 0: killEnemy()
│  │  │  │  ├─ if bullet.piercing:
│  │  │  │  │  └─ bullet.hitEnemies.add(enemy)
│  │  │  │  └─ else:
│  │  │  │     └─ bulletDestroyed = true
│  │  │  └─ if rocket explosion:
│  │  │     ├─ Get enemies in explosionRadius
│  │  │     ├─ for each: apply damageWithFalloff()
│  │  │     └─ if hasRicochet: spawn 2 mini-rockets
│  │  └─ Remove bullet if destroyed
│  │
├─ PHASE 2: Enemy vs Player
│  ├─ Get nearby enemies within 100px of player
│  ├─ for each nearby enemy:
│  │  ├─ Calculate distance to player
│  │  ├─ if distSq < collisionDistSq:
│  │  │  ├─ player.shield -= SHIELD_DAMAGE_ABSORPTION
│  │  │  ├─ Apply knockback
│  │  │  └─ Set invulnerability timer
│  │  ├─ else if within nearMissRadius:
│  │  │  └─ triggerNearMiss() [+5 points]
│  │  └─ Trigger effects (shake, flash)
│  │
├─ PHASE 3: Enemy Bullet vs Player
│  ├─ for each enemy bullet:
│  │  ├─ if distance to player < collisionRadius:
│  │  │  ├─ player.shield -= damage
│  │  │  ├─ Apply knockback
│  │  │  └─ bulletDestroyed = true
│  │  └─ Remove bullet if destroyed/expired
│  │
├─ PHASE 4: Drone vs Enemy
│  ├─ for each drone:
│  │  ├─ Get nearby enemies
│  │  ├─ if collides with enemy:
│  │  │  ├─ enemy.hp -= drone.damage
│  │  │  ├─ if drone.hasExplosion:
│  │  │  │  └─ Explode with AoE damage
│  │  │  └─ droneDestroyed = true
│  │  └─ Remove drone if hit
│  │
└─ PHASE 5: Pickup vs Player
   ├─ for each pickup:
   │  ├─ Check magnetism (150px pull)
   │  ├─ if distance < pickup.radius + player.radius:
   │  │  └─ collectPickup(pickup)
   │  └─ Remove if collected
```

## 5. Enemy Spawning Architecture

```
updateSpawnSystem()
│
├─ CONTINUOUS SPAWN (single enemies)
│  ├─ spawnTimer -= deltaTime
│  ├─ if spawnTimer <= 0:
│  │  ├─ spawnEnemy()
│  │  │  ├─ Determine type (SCOUT 85%, KAMIKAZE 10%, TANK 5%)
│  │  │  ├─ Calculate spawn position (edge of viewport)
│  │  │  ├─ Create enemy from pool
│  │  │  └─ Add to enemies array
│  │  ├─ spawnTimer = spawnInterval
│  │  └─ Decay spawn rate every 10 seconds
│  │     └─ spawnInterval = max(0.03, spawnInterval - 0.05)
│  │
├─ WAVE SYSTEM (coordinated spawn pattern)
│  ├─ waveTimer -= deltaTime
│  ├─ if waveTimer <= 0:
│  │  ├─ Pick random pattern (not same as last)
│  │  ├─ Calculate count = 15 + 4*playerLevel (cap 60)
│  │  ├─ Calculate spawn positions based on pattern:
│  │  │  ├─ ARC: arc around player
│  │  │  ├─ SIDE: wall from one direction
│  │  │  ├─ PINCER: two opposite sides
│  │  │  ├─ CIRCLE: hexagon staggered pattern
│  │  │  ├─ LINE: diagonal line
│  │  │  ├─ CLUSTER: tight group
│  │  │  ├─ SPIRAL: converging spiral
│  │  │  ├─ CORNERS: all 4 corners
│  │  │  ├─ RUSH: dense column
│  │  │  ├─ SCATTER: random all around
│  │  │  └─ V_FORMATION: V-shape
│  │  ├─ Spawn enemies at calculated positions
│  │  ├─ Trigger wave alert (2.5 sec)
│  │  ├─ waveNumber++
│  │  └─ waveTimer = 2.5 + random(1.5)
│  │
└─ Limits
   ├─ MAX_ENEMIES = 500 (or 200 on low-perf)
   └─ Stop spawning if reached
```

## 6. Weapon System Data Flow

```
getWeaponStats()
│
├─ LASER CANNON
│  ├─ baseStats = {damage: 10, fireRate: 0.35, pierce: false, ...}
│  ├─ if rapid_fire:
│  │  └─ fireRate = 0.25
│  ├─ if piercing_lens:
│  │  └─ pierce = true
│  ├─ if beam_splitter:
│  │  └─ spreadCount = 3
│  └─ return laserStats
│
├─ MISSILE LAUNCHER
│  ├─ baseStats = {hasRockets: true, rocketCount: 3, rocketDamage: 22, ...}
│  ├─ if homing_guidance:
│  │  └─ rocketBurstCount = 6
│  ├─ if cluster_payload:
│  │  ├─ hasRicochet = true
│  │  └─ rocketCount = 2 (mini-rockets per impact)
│  ├─ if armor_piercing:
│  │  └─ rocketDamage += 12, explosionDamage += 8
│  └─ return missileStats
│
├─ [Similar chains for ORBITAL, LIGHTNING, PLASMA, DRONE]
│
└─ updateWeapons() uses these stats
   ├─ Check fire timers
   ├─ Fire based on remaining ammo/cooldown
   └─ Create bullets from pool
```

## 7. State Machine Diagram

```
             START
              |
              v
        ┌─────────────┐
        │   MENU      │
 ┌──────→│   STATE    │←────┐
 │       │             │     │
 │       └──────┬──────┘     │
 │              │ ENTER/TAP  │
 │              v            │
 │       ┌─────────────────────────┐
 │       │   INITIALIZE GAME       │
 │       │   (resetGame())         │
 │       └──────┬──────────────────┘
 │              │
 │              v
 │       ┌──────────────────┐
 │       │   PLAYING STATE  │
 │       │                  │
 │       │ (main game loop) │
 │       └───┬──────────┬───┘
 │           │          │
 │       P/ESC          │ player.hp <= 0
 │           │          │
 │           v          v
 │      ┌────────┐  ┌──────────────┐
 │      │ PAUSED │  │  GAME OVER   │
 │      │ STATE  │  │   STATE      │
 │      └────┬───┘  └──────┬───────┘
 │         P/ESC           │ R/TAP
 │           │             │
 │           └──────┬──────┘
 │                  │
 └──────────────────┘

Special: SKILLTREE state (overlay, pause during upgrade selection)
    PLAYING → SKILLTREE (on level up) → PLAYING (on upgrade select)
```

## 8. Entity Pool Architecture

```
ObjectPool (Generic)
├─ factory: () => object
├─ resetFn: (obj) => void
├─ capacity: number
├─ available: [] (stack of unused objects)
│
└─ Methods:
   ├─ acquire(): get object (create if pool empty)
   ├─ release(obj): return to pool if space
   └─ releaseAll(array): return all + clear array

Pools Used:
├─ bullet pool (500 capacity)
├─ enemy pool (400 capacity)
├─ particle pool (400 capacity)
├─ enemyBullet pool (300 capacity)
├─ floatingText pool (100 capacity)
├─ pickup pool (50 capacity)
└─ drone pool (100 capacity)

Memory Benefit:
- Avoids garbage collection pauses
- Predictable memory usage
- Fast reuse (no allocation)
```

## 9. Spatial Grid for Collision Optimization

```
SPATIAL_GRID_CELL_SIZE = 250 px

World Space:           Grid Cells:
┌───────────┐          ┌─┬─┬─┐
│ E    E    │          │ │ │ │
│  B     E  │    →     ├─┼─┼─┤
│ E        E│          │ │ │ │
└───────────┘          ├─┼─┼─┤
                       │ │ │ │
                       └─┴─┴─┘

Each bullet/enemy inserted into cells it overlaps with:
- 250px radius entity → overlaps up to 9 cells (3x3)
- Query(x, y, radius) collects all entities in overlapping cells
- Result: O(1) collision candidates instead of O(n) full scan

Example: Bullet at (1500, 1500) with 100px radius
- Cells occupied: (5,5), (5,6), (6,5), (6,6)
- Query returns only entities in those 4 cells
- Much faster than checking all enemies
```

## 10. Camera Follow System

```
World Coordinates        Screen Coordinates
┌─────────────────┐      ┌────────────────┐
│                 │      │                │
│   Player  (P)   │      │   Player (C)   │
│                 │      │                │
│                 │      │                │
└─────────────────┘      └────────────────┘

worldToScreen(worldX, worldY):
  screenX = worldX - camera.x + CANVAS_WIDTH/2
  screenY = worldY - camera.y + CANVAS_HEIGHT/2

screenToWorld(screenX, screenY):
  worldX = screenX + camera.x - CANVAS_WIDTH/2
  worldY = screenY + camera.y - CANVAS_HEIGHT/2

updateCamera():
  camera.targetX = player.x
  camera.targetY = player.y
  camera.x += (targetX - x) * easing (0.1)  // Smooth follow
  camera.y += (targetY - y) * easing
```

## 11. Shield System State Machine

```
SHIELD_STATE_MACHINE:

┌────────────────────┐
│   IDLE STATE       │
│  (low opacity)     │
│  shield full or    │
│  regen in progress │
└────────┬───────────┘
         │
         │ DAMAGE TAKEN
         │ (shield < prev_value)
         v
┌────────────────────┐
│   HIT STATE        │
│  (full opacity)    │
│  shieldArcOpacity  │
│  ramps up to 1.0   │
└────────┬───────────┘
         │
         │ REGEN_DELAY (2.5s) passed
         │ & shield not at max
         v
┌────────────────────┐
│  REGEN STATE       │
│  (medium opacity)  │
│  shieldArcOpacity  │
│  ramps to 0.6      │
└────────┬───────────┘
         │
         │ Shield full
         │
         v
┌────────────────────┐
│ FADE OUT           │
│  (opacity → 0)     │
│  after 2s idle     │
└────────┬───────────┘
         │
         v
    IDLE STATE
```

## 12. Rendering Layer Order

```
Screen Space (fixed position):
  └─ Background gradient
  └─ Parallax grid (2 layers)
  └─ CRT scanlines

World Space (camera-relative):
  └─ Pickups
  └─ Enemies
  └─ Bullets
  └─ Drones
  └─ Enemy Bullets
  └─ Plasma Aura
  └─ Player
  └─ Shield Arc
  └─ Orbitals
  └─ Lightning Effects
  └─ Particles
  └─ Floating Texts

Screen Space (overlays):
  └─ Flash overlay (damage/effect)
  └─ Pause overlay
  └─ HUD
    ├─ Kills & Score (top-left)
    ├─ Level & XP (top-center)
    ├─ Weapons (top-right)
    ├─ Health & Shield (bottom-right)
    ├─ Wave Alert (center-top)
    ├─ Skill Points Indicator
    └─ Debug Overlay (if enabled)
  └─ Upgrade Panel (if level up)
```

## 13. XP & Leveling Curve

```
Level    XP Required    Cumulative XP    Time (est.)
 1→2          25              25          15 sec
 2→3          35              60          30 sec
 3→4          49             109          50 sec
 4→5          68             177          70 sec
 5→6          96             273         100 sec
 6→7         134             407         140 sec
 7→8         188             595         190 sec
 8→9         263             858         260 sec
 9→10        368            1226         360 sec

Formula: XP(n) = 25 * 1.4^(n-1)
(Exponential growth - 40% more each level)

Time estimates assume:
- Constant 1 XP per enemy kill
- 1-2 enemies killed per second on average
```

## 14. Performance Monitoring

```
perfMonitor Object:
├─ frameTimeAccum: accumulated frame times (ms)
├─ frameCount: frames in current window
├─ avgFrameTime: computed average
├─ fps: computed frames per second
├─ entityCounts:
│  ├─ bullets: current count
│  ├─ enemies: current count
│  ├─ particles: current count
│  ├─ enemyBullets: current count
│  └─ pickups: current count
└─ optimizationStats:
   ├─ spatialGridCells: active grid cells
   └─ entitiesCulled: entities not rendered

Computed every 30 frames:
- If avgFrameTime > 40ms → lowPerfMode = true
  - Disables grid effects
  - Disables glow effects
  - Disables scanlines
  - Reduces particles
```

## 15. Input Handling Pipeline

```
Input Event
│
├─ Keyboard
│  ├─ W/↑: thrust
│  ├─ S/↓: reverse
│  ├─ A/←: rotate left
│  ├─ D/→: rotate right
│  ├─ P/ESC: pause toggle
│  ├─ R: restart
│  ├─ Tab: show upgrades
│  ├─ 1-3: select upgrade
│  └─ B: debug toggle
│
├─ Touch/Mobile
│  ├─ Joystick zone (bottom-center)
│  │  ├─ Magnitude 0-38px
│  │  ├─ Angle controls rotation
│  │  ├─ >0.3 magnitude = thrust
│  │  └─ Deadzone: 0px
│  │
│  └─ Fire zone (right side)
│     └─ Auto-fires based on input
│
└─ Update State
   ├─ player.angle updated
   ├─ Thrust/reverse flags set
   ├─ getWeaponStats() called for fire rate
   └─ Fire bullets if timer ready
```

---

This architecture is designed for:
- **Extensibility:** Easy to add boss encounters, new weapons, etc.
- **Performance:** Spatial grid, pooling, culling
- **Responsiveness:** Delta-time based updates, smooth camera follow
- **Balance:** Scaling enemy HP/damage with player level
