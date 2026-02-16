# index.html Code Index (~10646 lines)

Last updated: 2026-02-16

## File Structure
```
Lines 1-356:    HTML + CSS (styles, canvas, touch controls, upgrade panel)
Lines 357-373:  HTML body (canvas, joystick, upgradePanel with weapon inventory)
Lines 374-10646: JavaScript IIFE
```

---

## 1. HTML/CSS (1-373)
- L10-355: `<style>` — CSS for body, canvas, touch controls, joystick, upgrade panel (vertical cards, weapon inventory bar, badges)
- L357-372: `<body>` — gameContainer, canvas#game, touchControls, upgradePanel (title, subtitle, weaponInventory, upgradeCards)

## 2. CONSTANTS (383-869)
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
- L336-342: `ENEMY_TYPES` — SCOUT, KAMIKAZE, SPINNER, TANK, ALIEN
- L345-353: Spawn config — includes `HARD_MAX_ENEMIES = 1500`, `ENEMY_WRAP_THRESHOLD = 0.52`
- L355-356: Near-miss — `NEAR_MISS_RADIUS = 12` (no score, just visual)
- L358-363: Shake/slowmo constants
- L365-401: `COLORS` — full color palette
- L403-413: Shield arc constants
- L414-416: XP formula
- L418-421: Joystick config
- L423-425: Auto-aim
- L427-430: Enemy spawn offset
- L432-448: Wave system
- L450-462: Sector/world
- L464-465: `JOYSTICK_ROTATION_THRESHOLD`
- L468-867: **`WEAPONS`** object — 12 weapons x 10 linear levels (level 10 = evolution):
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
- L869: `STARTING_WEAPON_IDS` — computed from WEAPONS (isStartingWeapon: true)

## 3. GAME STATE & VARIABLES (871-1032)
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

## 5. GAME STATE VARIABLES continued (850-1032)
- L850-857: Input state (`keys`, `input`)
- L859-908: Cheat codes — set `upgradeLevels[weaponId] = 10` per weapon
- L910-913: Touch state
- L915-916: Player
- L918-941: Entity arrays — bullets, enemies, enemyBullets, particles, floatingTexts, pickups, orbitals, lightningEffects, novaBeamEffects, drones, snares, slashEffects, riftZones
- L936-941: Fusion beam state
- L942-959: Weapon state vars (shardFireTimer, bladeTimer, riftTimer, snareDeployTimer, mines, radiationFields, mineDeployTimer, turrets, turretDeployTimer, combatStationDmgTimer)
- L961-968: Camera system
- L971-995: XP/Level/Upgrade state — `upgradeLevels = {}` at L979, `crystalsThisRun`, `playerMaxHP`, perm multipliers
- L997-998: Performance — `separationFrame`
- L1000-1008: Spawn & wave system
- L1010-1019: Effects (shake, flash, slowmo)
- L1022-1031: Background & idle state
- L1200-1222: **Menu intro animation** vars — menuAnimPhase ('entry'|'idle'|'exit'), menuShipY, menuThrusterScale, menuParticles, menuUIAlpha, menuCameraY, menuWeaponIndex, menuWeaponAlpha, menuExitTimer, MENU_EXIT_DURATION, menuMode ('main'|'shop'), bgOffsetX, bgOffsetY

## 6. PERFORMANCE OPTIMIZATIONS (1216-1405)
- L1220-1320: Spatial grid
- L1323-1383: **Object pools** — bullet, enemy, particle, enemyBullet, floatingText, pickup, drone, snare, mine, turret
- L1385-1394: `CULLING_DISTANCES`
- L1396: `lerpColor()`
- L1403: `fastRemove(array, index)`
- L1410-1477: Performance monitor, debug overlay

## 7. INITIALIZATION (1478-1834)
- L1481: `initBackgroundCache()`
- L1523: `resetMenuAnimation()` — resets menu intro animation state
- L1566: `updateMenuAnimation(dt)` — 3-phase menu anim (entry → idle → exit with deceleration)
- L1653: `init()`
- L1638: `resizeCanvas()`
- L1657: `generateBackground()`
- L1675: `selectedStartingWeapon` variable
- L1721: `startGame()` — triggers menu exit transition (menuAnimPhase='exit'), guards against double-start
- L1736: `finishMenuExit()` — stores bgOffset for parallax continuity, then resetGame + set playing
- L1753: `resetGame()` — includes turrets, turretDeployTimer, combatStationDmgTimer reset

## 8. INPUT HANDLING (1834-2088)
- L1834: `setupInput()` — left/right arrows in menu cycle starting weapon
- L1958: `updateInput()`
- L1973: `setupTouchControls()`

## 9. COORDINATE SYSTEM (2089-2124)
- L2089: `worldToScreen()`
- L2097: `screenToWorld()`
- L2105: `isInView()`
- L2114: `shouldRenderEntity()`

## 10. SECTOR BOUNDARY SYSTEM (2125-2253)
- L2125: `checkSectorBoundary()`
- L2159: `transportEntities()`

## 11. CAMERA UPDATE (2254-2267)
- L2254: `updateCamera()`

## 12. GAME LOOP (2268-2314)
- L2268: `gameLoop(timestamp)` — includes menu animation update + joystick visibility toggle
- L2312: `update()`

## 13. SHIELD ARC STATE MACHINE (2391-2456)
- L2391: `updateShieldArcState(deltaTime)`

## 14. PLAYER SYSTEM (2457-3536)
- L2457: `updatePlayer()`
- L2592: `getWeaponStats()` — single weapon level per weapon (0-10), evolution flags at level 10
- L2977: `hasEnemyInAimCone()`
- L2999: `fireBullet()`
- L3136: `fireNovaBeam()`
- L3193: `fireRocket()`
- L3284: `fireArmageddonMissile()`
- L3348: `fireLightning()`
- L3477: `spawnAlienDrone()`
- L3512: `spawnThrusterParticle()`

## 15. BULLETS (3537-3673)
- L3537: `updateBullets()`

## 16. ALIEN DRONES (3674-3834)
- L3674: `updateDrones()`

## 17. ENEMIES (3835-4461)
- L3835: `updateSpawnSystem()`
- L3872: `getWaveSubtitle(pattern)`
- L3889: `spawnWave()`
- L4144: `spawnEnemy()` — tank gated on `gameTime > 90`
- L4207: `updateEnemies()`
- L4346: `fireSpinnerBullets()`
- L4361: `updateEnemyBullets()`
- L4383: `killEnemy()`

## 18. PICKUPS (4462-4569)
- L4462: `spawnPickup()`
- L4485: `updatePickups()`

## 19. XP & LEVEL SYSTEM (4570-5444)
- L4570: `collectXP(amount)`
- L4588: `levelUp(levelsGained)`
- L4601: `getAvailableUpgrades()` — starting weapons mutually exclusive via isStartingWeapon check
- L4659: `allSkillsUnlocked()`
- L4685: `generateUpgradeOptions()` — picks 3 random from available
- L4693: `drawSkillIcon(ctx, icon, cx, cy, color)` — all weapon/evolution icons
- L5258: `showUpgradePanel()` — vertical cards layout, weapon inventory bar, badge system
- L5388: `selectUpgrade(option)` — types: weapon_activation, upgrade, bonus
- L5433: `hideUpgradePanel()`

## 20. WEAPON SYSTEMS (5445-5710)
- L5445: `updateWeapons()`
- L5486: `updateLightningEffects()`
- L5497: `updateNovaBeamEffects()`
- L5507: `updateOrbitals()`
- L5574: `updateAura()`
- L5640: `triggerAnnihilationExplosion()`

## 21. PHASE SHARD SYSTEM (5711-5897)
- L5711: `firePhaseShards(stats)`
- L5767: `handleShardBounce()`
- L5854: `shatterEntropyShard()`

## 22. VOID BLADE SYSTEM (5898-6081)
- L5898: `updateVoidBlade()`
- L5968: `performSlashDamage()`
- L6034: `updateRiftZones()`
- L6069: `updateSlashEffects()`

## 23. WARP SNARE SYSTEM (6082-6276)
- L6082: `updateWarpSnares()`

## 24. GRAVITY MINES SYSTEM (6277-6428)
- L6277: `updateGravityMines()`

## 25. SENTRY TURRET SYSTEM (6429-6659)
- L6429: `updateSentryTurrets()`

## 26. FUSION BEAM SYSTEM (6660-6842)
- L6660: `updateFusionBeam()`
- L6815: `handleBeamKill()`

## 27. ROCKET EXPLOSION (6843-6928)
- L6843: `explodePlayerRocket()`

## 28. COLLISIONS (6929-7126)
- L6929: `lineCircleCollision()`
- L6962: `checkCollisions()`

## 29. PLAYER DAMAGE & DEATH (7127-7251)
- L7127: `damagePlayer()`
- L7155: `triggerNearMiss()` — visual only, shows "NEAR MISS" text + slowmo + particles
- L7176: `gameOver()` — crystal calculation (killBonus + crystalsThisRun)
- L7211: `spawnDeathExplosion()`

## 30. PARTICLES & EFFECTS (7252-7367)
- L7252: `spawnRing(x, y, color, maxSize)`
- L7267: `spawnFloatingText()`
- L7278: `updateParticles()`
- L7310: `updateFloatingTexts()`
- L7323: `updateEffects()`
- L7344: `triggerShake()`
- L7350: `triggerFlash()`
- L7357: `triggerSlowmo()`

## 31. RENDERING (7368-9235)
- L7368: `render()`
- L7435: `renderBackground()` — menu-aware parallax (uses menuCameraY when gameState=menu)
- L7504-7588: Shield arc rendering section
- L7514: `renderShieldArc()`
- L7589: `renderPlayer()`
- L7629: `renderAura()`
- L7689: `renderFusionBeam()`
- L7816: `renderOrbitals()`
- L7837: `renderLightning()`
- L7877: `renderNovaBeam()`
- L7909: `renderBullets()`
- L8208: `renderEnemyBullets()`
- L8226: `renderDrones()`
- L8324: `renderEnemies()`
- L8487: `renderPickups()`
- L8531: `renderParticles()`
- L8609: `renderFloatingTexts()`
- L8629-8750: Turret rendering section
- L8633: `renderTurrets()`
- L8751: `renderMines()`
- L8849-8971: Snare/Slash/Rift rendering section
- L8853: `renderSnares()`
- L8917: `renderSlashEffects()`
- L8944: `renderRiftZones()`
- L9017: `drawUpgradeIcon(ctx, upgradeKey, cx, cy, color, size)` — geometric icons for permanent upgrades (powerCore=lightning, hullPlating=hexagon, engineBoost=chevrons, xpAmplifier=star, crystalAttractor=diamond)
- L9083: `drawVerticalProgressBars(ctx, x, y, width, height, level, maxLevel, color)` — 10 vertical bar segments for upgrade progress
- L9092: `drawWeaponIconAt()`

## 32. UI RENDERING (9237-10646)
- L9237: `renderUI()`
- L9256: `renderMenu()` — animated intro + branches on menuMode: 'main' (PLAY/SHOP buttons) or 'shop' (icon-only upgrade cards with vertical progress bars + BACK)
- L10259: `renderShop()` — standalone shop with icon-only cards and vertical progress bars
- L10453: `handleShopClick(clickX, clickY)` — standalone shop click handler (whole card clickable)
- L10488: `handleMenuClick(clickX, clickY)` — handles play, shop, exit, back, upgrade, prevWeapon, nextWeapon

## 33. UTILITIES (10631-10635)
- L10631: `normalizeAngle(angle)`

## 34. START GAME (10637-10646)
- L10641: `init()` call
