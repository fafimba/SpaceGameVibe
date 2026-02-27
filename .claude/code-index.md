# index.html Code Index (~10479 lines)

Last updated: 2026-02-18

## File Structure
```
Lines 1-356:    HTML + CSS (styles, canvas, touch controls, upgrade panel)
Lines 357-373:  HTML body (canvas, joystick, upgradePanel with weapon inventory)
Lines 374-10479: JavaScript IIFE
```

---

## 1. HTML/CSS (1-373)
- L10-355: `<style>` — CSS for body, canvas, touch controls, joystick, upgrade panel (vertical cards, weapon inventory bar, badges)
- L357-372: `<body>` — gameContainer, canvas#game, touchControls, upgradePanel (title, subtitle, weaponInventory, upgradeCards)

## 2. CONSTANTS (383-858)
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
- L358-363: Shake/slowmo constants
- L365-401: `COLORS` — full color palette
- L403-413: Shield arc constants
- L414-416: XP formula
- L418-421: Joystick config
- L423-425: Auto-aim
- L427-430: Enemy spawn offset
- L599-604: Wave system — `WAVE_INTERVAL_BASE=2.5`, `WAVE_SPAWN_DIST_MIN=1000`, `WAVE_SPAWN_DIST_MAX=1200`, `WAVE_CLUSTER_RADIUS=60`
- L606-620: Sector/world
- L468-856: **`WEAPONS`** object — 12 weapons x 10 linear levels (level 10 = evolution):
  - `laser_cannon` (isStartingWeapon, 10 levels + Nova Beam evo)
  - `missile_launcher` (10 levels + Armageddon evo)
  - `orbital_shield` (10 levels + Singularity evo)
  - `lightning_ray` (10 levels + Storm Nexus evo)
  - `plasma_field` (10 levels + Annihilation evo)
  - `alien_drone` (10 levels + Hive Mind evo)
  - `phase_shard` (10 levels + Shatter Storm evo)
  - `void_blade` (isStartingWeapon, 10 levels + Dimensional Rift evo)
  - `warp_snare` (10 levels + Temporal Cage evo)
  - `fusion_beam` (isStartingWeapon, 10 levels + Siphon Nexus evo)
  - `gravity_mines` (10 levels + Black Hole evo)
  - `sentry_turret` (10 levels + Combat Station evo)
- L858: `STARTING_WEAPON_IDS` — computed from WEAPONS (isStartingWeapon: true)

## 3. GAME STATE & VARIABLES (860-1020)
- L880: Canvas, ctx, gameState (`menu | playing | paused | gameOver | skilltree | tutorial | shop`)
- L718-722: Timing — `lastTime`, `deltaTime`, `timeScale`, `gameTime`, `totalKills`
- L724-729: Wave alert system

## 4. META-PROGRESSION (731-848)
- L734: `PROGRESSION_SAVE_KEY`
- L735: `WEAPON_IDS` array
- L737-738: `getDiffMultipliers()` — returns fixed values (all 1, no difficulty system)
- L742-748: `PERMANENT_UPGRADES` — 5 types (powerCore, hullPlating, engineBoost, xpAmplifier, crystalAttractor)
- L918: `getUpgradeCost(upgradeKey, currentLevel)`
- L928: `createDefaultProgression()` — all weapons unlocked, crystals: 0, permanentUpgrades, tutorialDone, stats
- L957: `loadProgression()` — migration sets all weapons to true
- L984: `saveProgression()`
- L825-833: Performance monitoring vars, `ENABLE_GLOW_EFFECTS = false`
- L1004: `setGlow()` / L1011: `clearGlow()` helpers

## 5. GAME STATE VARIABLES continued (850-1020)
- L850-857: Input state (`keys`, `input`)
- L859-913: Cheat codes — set `upgradeLevels[weaponId] = 10` per weapon, 'wipe' resets shop progression
- L910-913: Touch state
- L915-916: Player
- L918-941: Entity arrays — bullets, enemies, enemyBullets, particles, floatingTexts, pickups, orbitals, lightningEffects, novaBeamEffects, drones, snares, slashEffects, riftZones
- L936-941: Fusion beam state
- L942-959: Weapon state vars (shardFireTimer, bladeTimer, riftTimer, snareDeployTimer, mines, radiationFields, mineDeployTimer, turrets, lastTurretX/Y, combatStationDmgTimer)
- L961-968: Camera system
- L971-995: XP/Level/Upgrade state — `upgradeLevels = {}` at L979, `crystalsThisRun`, `playerMaxHP`, perm multipliers
- L997-998: Performance — `separationFrame`
- L1000-1007: Spawn & wave system (no lastWavePattern)
- L1009-1018: Effects (shake, flash, slowmo)
- L1020-1030: Background & idle state
- L1199-1221: **Menu intro animation** vars — menuAnimPhase, menuShipY, menuThrusterScale, menuParticles, menuUIAlpha, menuCameraY, menuWeaponIndex, menuWeaponAlpha, menuExitTimer, MENU_EXIT_DURATION, menuMode, bgOffsetX, bgOffsetY

## 6. PERFORMANCE OPTIMIZATIONS (1215-1404)
- L1219-1319: Spatial grid
- L1322-1382: **Object pools** — bullet, enemy, particle, enemyBullet, floatingText, pickup, drone, snare, mine, turret
- L1384-1393: `CULLING_DISTANCES`
- L1395: `lerpColor()`
- L1402: `fastRemove(array, index)`
- L1409-1476: Performance monitor, debug overlay

## 7. INITIALIZATION (1477-1833)
- L1480: `initBackgroundCache()`
- L1522: `resetMenuAnimation()` — resets menu intro animation state
- L1565: `updateMenuAnimation(dt)` — 3-phase menu anim (entry → idle → exit with deceleration)
- L1652: `init()`
- L1637: `resizeCanvas()`
- L1656: `generateBackground()`
- L1674: `selectedStartingWeapon` variable
- L1720: `startGame()` — triggers menu exit transition (menuAnimPhase='exit'), guards against double-start
- L1735: `finishMenuExit()` — stores bgOffset for parallax continuity, then resetGame + set playing
- L1752: `resetGame()` — includes turrets, lastTurretX/Y (set to player spawn), combatStationDmgTimer reset

## 8. INPUT HANDLING (1833-2087)
- L1833: `setupInput()` — left/right arrows in menu cycle starting weapon
- L1957: `updateInput()`
- L1972: `setupTouchControls()`

## 9. COORDINATE SYSTEM (2088-2123)
- L2088: `worldToScreen()`
- L2096: `screenToWorld()`
- L2104: `isInView()`
- L2113: `shouldRenderEntity()`

## 10. SECTOR BOUNDARY SYSTEM (2124-2252)
- L2124: `checkSectorBoundary()`
- L2158: `transportEntities()`

## 11. CAMERA UPDATE (2253-2266)
- L2253: `updateCamera()`

## 12. GAME LOOP (2267-2313)
- L2267: `gameLoop(timestamp)` — includes menu animation update + joystick visibility toggle
- L2311: `update()`

## 13. SHIELD ARC STATE MACHINE (2390-2455)
- L2390: `updateShieldArcState(deltaTime)`

## 14. PLAYER SYSTEM (2456-3535)
- L2456: `updatePlayer()`
- L2636: `getWeaponStats()` — single weapon level per weapon (0-10), evolution flags at level 10
- L2976: `hasEnemyInAimCone()`
- L2998: `fireBullet()`
- L3135: `fireNovaBeam()`
- L3192: `fireRocket()`
- L3283: `fireArmageddonMissile()`
- L3347: `fireLightning()`
- L3476: `spawnAlienDrone()`
- L3511: `spawnThrusterParticle()`

## 15. BULLETS (3536-3672)
- L3536: `updateBullets()`

## 16. ALIEN DRONES (3673-3873)
- L3673: `updateDrones()`

## 17. ENEMIES (3876-4319)
- L3876: `updateSpawnSystem()` — decay spawn interval, spawn groups, wave system (clusters from level 2+)
- L3913: `spawnWave()` — 3-6 clusters of enemies around player (Vampire Survivors style), 20-80 enemies per wave
- L3986: `getSpawnType()` — time-based enemy type progression (scouts→kamikazes→tanks→aliens)
- L4019: `spawnEnemy()` — spawns mini-groups of 3-5 enemies from same direction
- L4067: `updateEnemies()` — kamikaze bulldozer physics (immune to push except from other kamikazes, 2.5x push to others), kamikaze trail storage
- L4219: `updateEnemyBullets()`
- L4241: `killEnemy()`

## 18. PICKUPS (4320-4427)
- L4320: `spawnPickup()`
- L4343: `updatePickups()`

## 19. XP & LEVEL SYSTEM (4428-5300)
- L4428: `collectXP(amount)`
- L4446: `levelUp(levelsGained)`
- L4464: `getAvailableUpgrades()` — starting weapons mutually exclusive via isStartingWeapon check
- L4522: `allSkillsUnlocked()`
- L4541: `generateUpgradeOptions()` — picks 3 random from available
- L4549: `drawSkillIcon(ctx, icon, cx, cy, color)` — all weapon/evolution icons
- L5114: `showUpgradePanel()` — vertical cards layout, weapon inventory bar, badge system
- L5248: `selectUpgrade(option)` — types: weapon_activation, upgrade, bonus (sets lastTurretX/Y on sentry_turret activation)
- L5289: `hideUpgradePanel()`

## 20. WEAPON SYSTEMS (5305-5566)
- L5305: `updateWeapons()`
- L5346: `updateLightningEffects()`
- L5357: `updateNovaBeamEffects()`
- L5367: `updateOrbitals()`
- L5434: `updateAura()`
- L5500: `triggerAnnihilationExplosion()`

## 21. PHASE SHARD SYSTEM (5571-5753)
- L5571: `firePhaseShards(stats)`
- L5627: `handleShardBounce()`
- L5714: `shatterEntropyShard()`

## 22. VOID BLADE SYSTEM (5754-5957)
- L5758: `updateVoidBlade()` — forward-projected shotgun blast, simultaneous fan pattern, tracks player
- L5831: `performBlastDamage()` — two-zone: inner (damage+knockback), outer (knockback only with falloff at 1.4× radius)
- L5905: `updateRiftZones()`
- L5940: `updateSlashEffects()` — tracks player position for blast visual

## 23. WARP SNARE SYSTEM (5959-6168)
- L5963: `updateWarpSnares()` — deploys snares in pairs (180° apart) at 250px around player, rotating clockwise

## 24. GRAVITY MINES SYSTEM (6169-6331)
- L6169: `updateGravityMines()` — speed-dependent trail spawning (no spawn when still, 0.4s at max speed), mines spawn 100px behind player in ±30° cone

## 25. SENTRY TURRET SYSTEM (6332-6527)
- L6336: `updateSentryTurrets()` — distance-based deploy (lastTurretX/Y), machine gun fire (0.06-0.10s), bullet spread ±3.4°, 720°/s cannon tracking

## 26. FUSION BEAM SYSTEM (6528-6710)
- L6532: `updateFusionBeam()`
- L6687: `handleBeamKill()`

## 27. ROCKET EXPLOSION (6711-6800)
- L6715: `explodePlayerRocket()`

## 28. COLLISIONS (6801-6998)
- L6801: `lineCircleCollision()`
- L6834: `checkCollisions()`

## 29. PLAYER DAMAGE & DEATH (6999-7122)
- L6999: `damagePlayer()`
- L7027: `triggerNearMiss()` — visual only, shows "NEAR MISS" text + slowmo + particles
- L7047: `gameOver()` — crystal calculation (killBonus + crystalsThisRun)
- L7082: `spawnDeathExplosion()`

## 30. PARTICLES & EFFECTS (7123-7238)
- L7123: `spawnRing(x, y, color, maxSize)`
- L7138: `spawnFloatingText()`
- L7149: `updateParticles()`
- L7181: `updateFloatingTexts()`
- L7194: `updateEffects()`
- L7215: `triggerShake()`
- L7221: `triggerFlash()`
- L7228: `triggerSlowmo()`

## 31. RENDERING (7239-9069)
- L7239: `render()`
- L7306: `renderBackground()` — menu-aware parallax (uses menuCameraY when gameState=menu)
- L7381: `renderShieldArc()`
- L7456: `renderPlayer()`
- L7496: `renderAura()`
- L7556: `renderFusionBeam()`
- L7683: `renderOrbitals()`
- L7704: `renderLightning()`
- L7744: `renderNovaBeam()`
- L7776: `renderBullets()` — turret bullets: 3px cyan circles, turret rockets: cyan triangles
- L8075: `renderEnemyBullets()`
- L8093: `renderDrones()`
- L8191: `renderEnemies()` — kamikaze trail rendering (fading orange line behind each kamikaze)
- L8336: `renderPickups()`
- L8380: `renderParticles()`
- L8458: `renderFloatingTexts()`
- L8482: `renderTurrets()` — cyan color, muzzle flash 0.02s/3px
- L8588: `renderMines()`
- L8709: `renderSnares()`
- L8773: `renderSlashEffects()` — instant blast visual: outer arc + white flash + radial spread lines
- L8822: `renderRiftZones()`
- L8850: `drawUpgradeIcon(ctx, upgradeKey, cx, cy, color, size)` — geometric icons for permanent upgrades
- L8916: `drawVerticalProgressBars(ctx, x, y, width, height, level, maxLevel, color)` — 10 vertical bar segments
- L8925: `drawWeaponIconAt()`

## 32. UI RENDERING (9070-10479)
- L9070: `renderUI()`
- L9089: `renderMenu()` — animated intro + branches on menuMode: 'main' (PLAY/SHOP buttons) or 'shop'
- L9432: `renderArsenalGallery()`
- L9520: `renderControlsHelp(startY)`
- L9556: `renderHUD()`
- L9991: `renderTutorial()`
- L10092: `renderShop()` — standalone shop with icon-only cards and vertical progress bars
- L10286: `handleShopClick(clickX, clickY)` — standalone shop click handler (whole card clickable)
- L10321: `handleMenuClick(clickX, clickY)` — handles play, shop, exit, back, upgrade, prevWeapon, nextWeapon

## 33. UTILITIES (10460-10472)
- L10464: `normalizeAngle(angle)`

## 34. START GAME (10472-10479)
- L10475: `init()` call
