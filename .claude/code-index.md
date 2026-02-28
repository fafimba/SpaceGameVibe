# index.html Code Index (~10360 lines)

Last updated: 2026-02-28

## File Structure
```
Lines 1-356:    HTML + CSS (styles, canvas, touch controls, upgrade panel)
Lines 357-373:  HTML body (canvas, joystick, upgradePanel with weapon inventory)
Lines 374-10360: JavaScript IIFE
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

## 4. META-PROGRESSION (876-1098)
- L874: `PROGRESSION_SAVE_KEY`
- L875: `WEAPON_IDS` array
- L881: `getDiffMultipliers()` — returns fixed values (all 1, no difficulty system)
- L882-887: `PERMANENT_UPGRADES` — 5 types (powerCore, hullPlating, engineBoost, xpAmplifier, crystalAttractor)
- L894: `getUpgradeCost(upgradeKey, currentLevel)`
- L904: `createDefaultProgression()` — all weapons unlocked, crystals: 0, permanentUpgrades, tutorialDone, stats
- L932: `loadProgression()` — migration sets all weapons to true
- L959: `saveProgression()`
- L968-986: **Full version flag** — `isFullVersion`, `loadFullVersion()`, `saveFullVersion(val)` (separate localStorage key for IAP)
- L989-1085: **Digital Goods API / Play Billing** — `digitalGoodsService`, `cachedProductPrice`, `PRODUCT_ID='full_game_unlock'`, `initDigitalGoods()`, `checkExistingPurchases()`, `purchaseFullGame()`
- L1098: `setGlow()` / L1105: `clearGlow()` helpers

## 5. GAME STATE VARIABLES continued (1110-1318)
- L1138-1192: Cheat codes — per-weapon, 'wipe', 'full', 'unlock' (full version), 'demo' (revert to demo)
- L1194-1197: Touch state
- L1199-1200: Player
- L1202-1215: Entity arrays — bullets, enemies, enemyBullets, particles, floatingTexts, pickups, orbitals, lightningEffects, novaBeamEffects, drones, snares, slashEffects, riftZones
- L1216-1225: Fusion beam state, Weapon state vars
- L1227-1234: Camera system
- L1264: Performance — `separationFrame`
- L1298: **Menu intro animation** vars

## 6. PERFORMANCE OPTIMIZATIONS (1336-1538)
- L1336-1404: Spatial grid — **numeric keys** (`_key(cx,cy)` returns integer), periodic Map rebuild every 120 frames
- L1406-1502: **Object pools** — bullet, enemy (with `dead` flag), particle, enemyBullet, floatingText, pickup, drone, snare, mine, turret
- L1505-1514: `CULLING_DISTANCES`
- L1525: `lerpColor()`
- L1532: `fastRemove(array, index)`
- L1538-1604: Performance monitor, debug overlay

## 7. INITIALIZATION (1607-2018)
- L1610: `initBackgroundCache()`
- L1670: `resetMenuAnimation()` — resets menu intro animation state
- L1700: `updateMenuAnimation(dt)` — 3-phase menu anim (entry → idle → exit with deceleration)
- L1778: `init()` — calls `loadFullVersion()` + `initDigitalGoods()`, visibilitychange re-checks purchases
- L1823: `resizeCanvas()`
- L1842: `generateBackground()`
- L1857: `startGame()` — triggers menu exit transition (menuAnimPhase='exit'), guards against double-start
- L1867: `finishMenuExit()` — stores bgOffset for parallax continuity, then resetGame + set playing
- L1884: `resetGame()` — includes turrets, lastTurretX/Y (set to player spawn), combatStationDmgTimer reset

## 8. INPUT HANDLING (2017-2278)
- L2020: `setupInput()` — left/right arrows in menu cycle starting weapon, demoEnd ESC handler
- L2150: `updateInput()`
- L2165: `setupTouchControls()` — includes demoEnd touch handler

## 9. COORDINATE SYSTEM (2277-2313)
- L2281: `worldToScreen()`
- L2289: `screenToWorld()`
- L2297: `isInView()`
- L2306: `shouldRenderEntity()`

## 10. SECTOR BOUNDARY SYSTEM (2314-2444)
- L2317: `checkSectorBoundary()`
- L2351: `transportEntities()`

## 11. CAMERA UPDATE (2445-2458)
- L2448: `updateCamera()`

## 12. GAME LOOP (2459-2505)
- L2462: `gameLoop(timestamp)` — includes menu animation update + joystick visibility toggle
- L2506: `update()` — calls `sweepDeadEnemies()` after `checkCollisions()`

## 13. SHIELD ARC STATE MACHINE (2586-2654)
- L2589: `updateShieldArcState(deltaTime)`

## 14. PLAYER SYSTEM (2655-3695)
- L2655: `updatePlayer()`
- L2790: `getWeaponStats()` — single weapon level per weapon (0-10), evolution flags at level 10
- L3141: `hasEnemyInAimCone()`
- L3163: `fireBullet()`
- L3300: `fireNovaBeam()`
- L3355: `fireRocket()`
- L3446: `fireArmageddonMissile()`
- L3510: `fireLightning()`
- L3636: `spawnAlienDrone()`
- L3671: `spawnThrusterParticle()`

## 15. BULLETS (3696-3832)
- L3696: `updateBullets()`

## 16. ALIEN DRONES (3833-3989)
- L3836: `updateDrones()`

## 17. ENEMIES (3990-4450)
- L3990: `updateSpawnSystem()` — decay spawn interval, spawn groups, wave system (clusters from level 2+)
- L4027: `spawnWave()` — 3-6 clusters of enemies around player (Vampire Survivors style), 20-80 enemies per wave
- L4100: `getSpawnType()` — time-based enemy type progression (scouts→kamikazes→tanks→aliens)
- L4133: `spawnEnemy()` — spawns mini-groups of 3-5 enemies from same direction
- L4181: `updateEnemies()` — kamikaze bulldozer physics, kamikaze trail (push+reuse oldest)
- L4338: `updateEnemyBullets()`
- L4360: `killEnemy(enemy)` — **mark-and-sweep**: sets `enemy.dead = true`, handles XP/effects/splits (no array removal)
- L4438: `sweepDeadEnemies()` — single reverse pass releasing all dead enemies (called once per frame in `update()`)

## 18. PICKUPS (4451-4558)
- L4451: `spawnPickup()`
- L4474: `updatePickups()`

## 19. XP & LEVEL SYSTEM (4559-5416)
- L4559: `collectXP(amount)` — **demo limit check**: stops at DEMO_MAX_LEVEL, triggers demoEnd state
- L4593: `levelUp(levelsGained)`
- L4611: `getAvailableUpgrades()` — starting weapons mutually exclusive via isStartingWeapon check
- L4669: `allSkillsUnlocked()`
- L4688: `generateUpgradeOptions()` — picks 3 random from available
- L4696: `drawSkillIcon(ctx, icon, cx, cy, color)` — all weapon/evolution icons
- L5229: `showUpgradePanel()` — vertical cards layout, weapon inventory bar, badge system
- L5359: `selectUpgrade(option)` — types: weapon_activation, upgrade, bonus (sets lastTurretX/Y on sentry_turret activation)
- L5408: `hideUpgradePanel()`

## 20. WEAPON SYSTEMS (5417-5670)
- L5420: `updateWeapons()`
- L5457: `updateLightningEffects()`
- L5468: `updateNovaBeamEffects()`
- L5478: `updateOrbitals()`
- L5542: `updateAura()`
- L5605: `triggerAnnihilationExplosion()`

## 21. VOID BLADE SYSTEM (5671-5864)
- L5674: `updateVoidBlade()` — forward-projected shotgun blast, simultaneous fan pattern, tracks player
- L5749: `performBlastDamage()` — two-zone: inner (damage+knockback), outer (knockback only with falloff at 1.4× radius)
- L5818: `updateRiftZones()`
- L5850: `updateSlashEffects()` — tracks player position for blast visual

## 22. WARP SNARE SYSTEM (5865-5999)
- L5868: `updateWarpSnares()` — deploys snares in pairs (180° apart) at 250px around player, rotating clockwise

## 23. GRAVITY MINES SYSTEM (6000-6225)
- L6066: `updateGravityMines()` — speed-dependent trail spawning (no spawn when still, 0.4s at max speed), mines spawn 100px behind player in ±30° cone

## 24. SENTRY TURRET SYSTEM (6226-6418)
- L6229: `updateSentryTurrets()` — distance-based deploy (lastTurretX/Y), machine gun fire (0.06-0.10s), bullet spread ±3.4°, 720°/s cannon tracking

## 25. FUSION BEAM SYSTEM (6419-6579)
- L6422: `updateFusionBeam()`
- L6556: `handleBeamKill(enemy, stats)` — no index param, uses mark-and-sweep

## 26. ROCKET EXPLOSION (6580-6660)
- L6583: `explodePlayerRocket()`

## 27. COLLISIONS (6661-6839)
- L6666: `lineCircleCollision()`
- L6699: `checkCollisions()` — uses `killEnemy(e)` (mark-and-sweep), kamikaze contact sets `e.dead = true`

## 28. PLAYER DAMAGE & DEATH (6840-6959)
- L6840: `damagePlayer()`
- L6868: `triggerNearMiss()` — visual only, shows "NEAR MISS" text + slowmo + particles
- L6888: `gameOver()` — crystal calculation (killBonus + crystalsThisRun)
- L6923: `spawnDeathExplosion()` — uses pool-based particles

## 29. PARTICLES & EFFECTS (6960-7084)
- L6963-6964: `MAX_PARTICLES = 600`, `MAX_FLOATING_TEXTS = 150` — hard caps
- L6967: `spawnRing(x, y, color, maxSize)` — early return if at particle cap
- L6983: `spawnFloatingText()` — early return if at floating text cap
- L6995: `updateParticles()`
- L7027: `updateFloatingTexts()`
- L7040: `updateEffects()`
- L7061: `triggerShake()`
- L7067: `triggerFlash()`
- L7074: `triggerSlowmo()`

## 30. RENDERING (7085-8830)
- L7085: `render()` — entities rendered for playing/paused/gameOver/demoEnd states
- L7152: `renderBackground()` — menu-aware parallax (uses menuCameraY when gameState=menu)
- L7227: `renderShieldArc()`
- L7302: `renderPlayer()`
- L7342: `renderAura()`
- L7402: `renderFusionBeam()`
- L7529: `renderOrbitals()`
- L7550: `renderLightning()`
- L7590: `renderNovaBeam()`
- L7622: `renderBullets()` — trail rendering uses push order (trail[0]=oldest, trail[end]=newest)
- L7847: `renderEnemyBullets()`
- L7865: `renderDrones()`
- L7962: `renderEnemies()` — kamikaze trail rendering (push order, alpha = (t+1)/length)
- L8107: `renderPickups()`
- L8151: `renderParticles()`
- L8229: `renderFloatingTexts()`
- L8253: `renderTurrets()` — cyan color, muzzle flash 0.02s/3px
- L8347: `renderMines()`
- L8468: `renderSnares()`
- L8532: `renderSlashEffects()` — instant blast visual: outer arc + white flash + radial spread lines
- L8583: `renderRiftZones()`
- L8611: `drawUpgradeIcon(ctx, upgradeKey, cx, cy, color, size)` — geometric icons for permanent upgrades
- L8677: `drawVerticalProgressBars(ctx, x, y, width, height, level, maxLevel, color)` — 10 vertical bar segments
- L8686: `drawWeaponIconAt()`

## 31. UI RENDERING (8831-10341)
- L8831: `renderUI()` — routes to render functions by gameState (includes demoEnd)
- L8853: `renderMenu()` — animated intro + "FREE VERSION" indicator in demo mode + branches on menuMode
- L9203: `renderArsenalGallery()`
- L9291: `renderControlsHelp(startY)`
- L9327: `renderHUD()` — demo mode shows "Lv X/10" in hexagon badge
- L9767: `renderTutorial()`
- L9868: `renderShop()` — standalone shop with icon-only cards and vertical progress bars
- L10063: `handleShopClick(clickX, clickY)` — standalone shop click handler (whole card clickable)
- L10098: `handleMenuClick(clickX, clickY)` — handles play, shop, exit, back, upgrade, prevWeapon, nextWeapon
- L10137: `renderDemoEnd()` — "DEMO COMPLETE" overlay with run stats + unlock/back buttons (shows cached product price)
- L10224: `handleDemoEndClick(clickX, clickY)` — calls `purchaseFullGame()` for billing flow, back returns to menu
- L10242: `renderPauseOverlay()`
- L10257: `renderGameOver()`

## 32. UTILITIES (10342-10352)
- L10345: `normalizeAngle(angle)`

## 33. START GAME (10352-10360)
- L10356: `init()` call
