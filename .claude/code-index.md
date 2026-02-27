# index.html Code Index (~10252 lines)

Last updated: 2026-02-27

## File Structure
```
Lines 1-356:    HTML + CSS (styles, canvas, touch controls, upgrade panel)
Lines 357-373:  HTML body (canvas, joystick, upgradePanel with weapon inventory)
Lines 374-10252: JavaScript IIFE
```

---

## 1. HTML/CSS (1-373)
- L10-355: `<style>` — CSS for body, canvas, touch controls, joystick, upgrade panel (vertical cards, weapon inventory bar, badges)
- L357-372: `<body>` — gameContainer, canvas#game, touchControls, upgradePanel (title, subtitle, weaponInventory, upgradeCards)

## 2. CONSTANTS (383-842)
- L266-267: `CANVAS_WIDTH/HEIGHT` — 1920x1080
- L270: `isMobile()` — device detection
- L274-283: Physics — ROTATION_SPEED, THRUST_ACCEL, MAX_SPEED, DRAG_FACTOR, BULLET_SPEED, ORBITAL_*
- L285-288: Aura constants — AURA_BASE_RADIUS, DAMAGE, TICK_RATE
- L291: `BEAM_ORIGIN_RADIUS` — fusion beam circle radius (35px)
- L293-298: Annihilation constants
- L300-311: Drone constants (including Hive Mind)
- L313-320: Player constants — PLAYER_SIZE, COLLISION_RADIUS, MAX_HP, PIVOT_OFFSET, MASS
- L323: `PICKUP_MAGNET_RADIUS`
- L325-329: Shield constants
- L331-334: `AUTO_FIRE_INTERVAL`, `BULLET_LIFETIME`, `MAX_ACTIVE_WEAPONS` (4 = 1 starting + 3)
- L336-341: `ENEMY_TYPES` — SCOUT, KAMIKAZE, TANK, ALIEN
- L345-353: Spawn config — `INITIAL_SPAWN_INTERVAL_MIN=0.6`, `MAX=1.0`, `MIN=0.15`, `HARD_MAX_ENEMIES = 1500`
- L355-356: Near-miss — `NEAR_MISS_RADIUS = 12` (no score, just visual)
- L525-526: **Demo/Full version** — `DEMO_MAX_LEVEL = 10`, `FULLVERSION_SAVE_KEY`
- L528-533: Shake/slowmo constants
- L536-601: `COLORS` — full color palette
- L603-413: Shield arc constants
- L414-416: XP formula
- L418-421: Joystick config
- L423-425: Auto-aim
- L427-430: Enemy spawn offset
- L599-604: Wave system — `WAVE_INTERVAL_BASE=2.5`, `WAVE_SPAWN_DIST_MIN=1000`, `WAVE_SPAWN_DIST_MAX=1200`, `WAVE_CLUSTER_RADIUS=60`
- L606-620: Sector/world
- L627-840: **`WEAPONS`** object — 11 weapons x 10 linear levels (level 10 = evolution):
  - `laser_cannon` (isStartingWeapon, 10 levels + Nova Beam evo)
  - `missile_launcher` (10 levels + Armageddon evo)
  - `orbital_shield` (10 levels + Singularity evo)
  - `lightning_ray` (10 levels + Storm Nexus evo)
  - `plasma_field` (10 levels + Annihilation evo)
  - `alien_drone` (10 levels + Hive Mind evo)
  - `void_blade` (isStartingWeapon, 10 levels + Dimensional Rift evo)
  - `warp_snare` (10 levels + Temporal Cage evo)
  - `fusion_beam` (isStartingWeapon, 10 levels + Siphon Nexus evo)
  - `gravity_mines` (10 levels + Black Hole evo)
  - `sentry_turret` (10 levels + Combat Station evo)
- L842: `STARTING_WEAPON_IDS` — computed from WEAPONS (isStartingWeapon: true)

## 3. GAME STATE & VARIABLES (844-1010)
- L849: Canvas, ctx, gameState (`menu | playing | paused | gameOver | skilltree | tutorial | shop | demoEnd`)
- L858-862: Timing — `lastTime`, `deltaTime`, `timeScale`, `gameTime`, `totalKills`
- L864-869: Wave alert system

## 4. META-PROGRESSION (876-990)
- L874: `PROGRESSION_SAVE_KEY`
- L875: `WEAPON_IDS` array
- L881: `getDiffMultipliers()` — returns fixed values (all 1, no difficulty system)
- L882-887: `PERMANENT_UPGRADES` — 5 types (powerCore, hullPlating, engineBoost, xpAmplifier, crystalAttractor)
- L894: `getUpgradeCost(upgradeKey, currentLevel)`
- L904: `createDefaultProgression()` — all weapons unlocked, crystals: 0, permanentUpgrades, tutorialDone, stats
- L932: `loadProgression()` — migration sets all weapons to true
- L959: `saveProgression()`
- L968-986: **Full version flag** — `isFullVersion`, `loadFullVersion()`, `saveFullVersion(val)` (separate localStorage key for IAP)
- L998: `setGlow()` / L1005: `clearGlow()` helpers

## 5. GAME STATE VARIABLES continued (1010-1210)
- L1030-1084: Cheat codes — per-weapon, 'wipe', 'full', 'unlock' (full version), 'demo' (revert to demo)
- L1086-1089: Touch state
- L1091-1092: Player
- L1094-1107: Entity arrays — bullets, enemies, enemyBullets, particles, floatingTexts, pickups, orbitals, lightningEffects, novaBeamEffects, drones, snares, slashEffects, riftZones
- L1108-1117: Fusion beam state, Weapon state vars
- L1119-1126: Camera system
- L1156: Performance — `separationFrame`
- L1190: **Menu intro animation** vars

## 6. PERFORMANCE OPTIMIZATIONS (1228-1430)
- L1228-1296: Spatial grid — **numeric keys** (`_key(cx,cy)` returns integer), periodic Map rebuild every 120 frames
- L1298-1394: **Object pools** — bullet, enemy (with `dead` flag), particle, enemyBullet, floatingText, pickup, drone, snare, mine, turret
- L1397-1406: `CULLING_DISTANCES`
- L1417: `lerpColor()`
- L1424: `fastRemove(array, index)`
- L1430-1496: Performance monitor, debug overlay

## 7. INITIALIZATION (1499-1910)
- L1502: `initBackgroundCache()`
- L1562: `resetMenuAnimation()` — resets menu intro animation state
- L1592: `updateMenuAnimation(dt)` — 3-phase menu anim (entry → idle → exit with deceleration)
- L1679: `init()` — calls `loadFullVersion()` first
- L1715: `resizeCanvas()`
- L1734: `generateBackground()`
- L1749: `startGame()` — triggers menu exit transition (menuAnimPhase='exit'), guards against double-start
- L1759: `finishMenuExit()` — stores bgOffset for parallax continuity, then resetGame + set playing
- L1776: `resetGame()` — includes turrets, lastTurretX/Y (set to player spawn), combatStationDmgTimer reset

## 8. INPUT HANDLING (1909-2170)
- L1912: `setupInput()` — left/right arrows in menu cycle starting weapon, demoEnd ESC handler
- L2042: `updateInput()`
- L2057: `setupTouchControls()` — includes demoEnd touch handler

## 9. COORDINATE SYSTEM (2169-2205)
- L2173: `worldToScreen()`
- L2181: `screenToWorld()`
- L2189: `isInView()`
- L2198: `shouldRenderEntity()`

## 10. SECTOR BOUNDARY SYSTEM (2206-2336)
- L2209: `checkSectorBoundary()`
- L2243: `transportEntities()`

## 11. CAMERA UPDATE (2337-2350)
- L2340: `updateCamera()`

## 12. GAME LOOP (2351-2397)
- L2354: `gameLoop(timestamp)` — includes menu animation update + joystick visibility toggle
- L2398: `update()` — calls `sweepDeadEnemies()` after `checkCollisions()`

## 13. SHIELD ARC STATE MACHINE (2478-2546)
- L2481: `updateShieldArcState(deltaTime)`

## 14. PLAYER SYSTEM (2547-3587)
- L2547: `updatePlayer()`
- L2682: `getWeaponStats()` — single weapon level per weapon (0-10), evolution flags at level 10
- L3033: `hasEnemyInAimCone()`
- L3055: `fireBullet()`
- L3192: `fireNovaBeam()`
- L3247: `fireRocket()`
- L3338: `fireArmageddonMissile()`
- L3402: `fireLightning()`
- L3528: `spawnAlienDrone()`
- L3563: `spawnThrusterParticle()`

## 15. BULLETS (3588-3724)
- L3588: `updateBullets()`

## 16. ALIEN DRONES (3725-3881)
- L3728: `updateDrones()`

## 17. ENEMIES (3882-4342)
- L3882: `updateSpawnSystem()` — decay spawn interval, spawn groups, wave system (clusters from level 2+)
- L3919: `spawnWave()` — 3-6 clusters of enemies around player (Vampire Survivors style), 20-80 enemies per wave
- L3992: `getSpawnType()` — time-based enemy type progression (scouts→kamikazes→tanks→aliens)
- L4025: `spawnEnemy()` — spawns mini-groups of 3-5 enemies from same direction
- L4073: `updateEnemies()` — kamikaze bulldozer physics, kamikaze trail (push+reuse oldest)
- L4230: `updateEnemyBullets()`
- L4252: `killEnemy(enemy)` — **mark-and-sweep**: sets `enemy.dead = true`, handles XP/effects/splits (no array removal)
- L4330: `sweepDeadEnemies()` — single reverse pass releasing all dead enemies (called once per frame in `update()`)

## 18. PICKUPS (4343-4450)
- L4343: `spawnPickup()`
- L4366: `updatePickups()`

## 19. XP & LEVEL SYSTEM (4451-5308)
- L4451: `collectXP(amount)` — **demo limit check**: stops at DEMO_MAX_LEVEL, triggers demoEnd state
- L4485: `levelUp(levelsGained)`
- L4503: `getAvailableUpgrades()` — starting weapons mutually exclusive via isStartingWeapon check
- L4561: `allSkillsUnlocked()`
- L4580: `generateUpgradeOptions()` — picks 3 random from available
- L4588: `drawSkillIcon(ctx, icon, cx, cy, color)` — all weapon/evolution icons
- L5121: `showUpgradePanel()` — vertical cards layout, weapon inventory bar, badge system
- L5251: `selectUpgrade(option)` — types: weapon_activation, upgrade, bonus (sets lastTurretX/Y on sentry_turret activation)
- L5300: `hideUpgradePanel()`

## 20. WEAPON SYSTEMS (5309-5562)
- L5312: `updateWeapons()`
- L5349: `updateLightningEffects()`
- L5360: `updateNovaBeamEffects()`
- L5370: `updateOrbitals()`
- L5434: `updateAura()`
- L5497: `triggerAnnihilationExplosion()`

## 21. VOID BLADE SYSTEM (5563-5756)
- L5566: `updateVoidBlade()` — forward-projected shotgun blast, simultaneous fan pattern, tracks player
- L5641: `performBlastDamage()` — two-zone: inner (damage+knockback), outer (knockback only with falloff at 1.4× radius)
- L5710: `updateRiftZones()`
- L5742: `updateSlashEffects()` — tracks player position for blast visual

## 22. WARP SNARE SYSTEM (5757-5891)
- L5760: `updateWarpSnares()` — deploys snares in pairs (180° apart) at 250px around player, rotating clockwise

## 23. GRAVITY MINES SYSTEM (5892-6117)
- L5958: `updateGravityMines()` — speed-dependent trail spawning (no spawn when still, 0.4s at max speed), mines spawn 100px behind player in ±30° cone

## 24. SENTRY TURRET SYSTEM (6118-6310)
- L6121: `updateSentryTurrets()` — distance-based deploy (lastTurretX/Y), machine gun fire (0.06-0.10s), bullet spread ±3.4°, 720°/s cannon tracking

## 25. FUSION BEAM SYSTEM (6311-6471)
- L6314: `updateFusionBeam()`
- L6448: `handleBeamKill(enemy, stats)` — no index param, uses mark-and-sweep

## 26. ROCKET EXPLOSION (6472-6552)
- L6475: `explodePlayerRocket()`

## 27. COLLISIONS (6553-6731)
- L6558: `lineCircleCollision()`
- L6591: `checkCollisions()` — uses `killEnemy(e)` (mark-and-sweep), kamikaze contact sets `e.dead = true`

## 28. PLAYER DAMAGE & DEATH (6732-6851)
- L6732: `damagePlayer()`
- L6760: `triggerNearMiss()` — visual only, shows "NEAR MISS" text + slowmo + particles
- L6780: `gameOver()` — crystal calculation (killBonus + crystalsThisRun)
- L6815: `spawnDeathExplosion()` — uses pool-based particles

## 29. PARTICLES & EFFECTS (6852-6976)
- L6855-6856: `MAX_PARTICLES = 600`, `MAX_FLOATING_TEXTS = 150` — hard caps
- L6859: `spawnRing(x, y, color, maxSize)` — early return if at particle cap
- L6875: `spawnFloatingText()` — early return if at floating text cap
- L6887: `updateParticles()`
- L6919: `updateFloatingTexts()`
- L6932: `updateEffects()`
- L6953: `triggerShake()`
- L6959: `triggerFlash()`
- L6966: `triggerSlowmo()`

## 30. RENDERING (6977-8722)
- L6977: `render()` — entities rendered for playing/paused/gameOver/demoEnd states
- L7044: `renderBackground()` — menu-aware parallax (uses menuCameraY when gameState=menu)
- L7119: `renderShieldArc()`
- L7194: `renderPlayer()`
- L7234: `renderAura()`
- L7294: `renderFusionBeam()`
- L7421: `renderOrbitals()`
- L7442: `renderLightning()`
- L7482: `renderNovaBeam()`
- L7514: `renderBullets()` — trail rendering uses push order (trail[0]=oldest, trail[end]=newest)
- L7739: `renderEnemyBullets()`
- L7757: `renderDrones()`
- L7854: `renderEnemies()` — kamikaze trail rendering (push order, alpha = (t+1)/length)
- L7999: `renderPickups()`
- L8043: `renderParticles()`
- L8121: `renderFloatingTexts()`
- L8145: `renderTurrets()` — cyan color, muzzle flash 0.02s/3px
- L8239: `renderMines()`
- L8360: `renderSnares()`
- L8424: `renderSlashEffects()` — instant blast visual: outer arc + white flash + radial spread lines
- L8475: `renderRiftZones()`
- L8503: `drawUpgradeIcon(ctx, upgradeKey, cx, cy, color, size)` — geometric icons for permanent upgrades
- L8569: `drawVerticalProgressBars(ctx, x, y, width, height, level, maxLevel, color)` — 10 vertical bar segments
- L8578: `drawWeaponIconAt()`

## 31. UI RENDERING (8723-10233)
- L8723: `renderUI()` — routes to render functions by gameState (includes demoEnd)
- L8745: `renderMenu()` — animated intro + "FREE VERSION" indicator in demo mode + branches on menuMode
- L9095: `renderArsenalGallery()`
- L9183: `renderControlsHelp(startY)`
- L9219: `renderHUD()` — demo mode shows "Lv X/10" in hexagon badge
- L9659: `renderTutorial()`
- L9760: `renderShop()` — standalone shop with icon-only cards and vertical progress bars
- L9955: `handleShopClick(clickX, clickY)` — standalone shop click handler (whole card clickable)
- L9990: `handleMenuClick(clickX, clickY)` — handles play, shop, exit, back, upgrade, prevWeapon, nextWeapon
- L10036: `renderDemoEnd()` — "DEMO COMPLETE" overlay with run stats + unlock/back buttons
- L10120: `handleDemoEndClick(clickX, clickY)` — unlock sets full version + resumes, back returns to menu
- L10140: `renderPauseOverlay()`
- L10155: `renderGameOver()`

## 32. UTILITIES (10234-10244)
- L10237: `normalizeAngle(angle)`

## 33. START GAME (10244-10252)
- L10248: `init()` call
