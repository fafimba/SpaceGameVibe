# index.html Code Index (~10535 lines)

Last updated: 2026-03-02

## File Structure
```
Lines 1-113:    HTML + CSS (styles, canvas, touch controls, upgradeCanvas)
Lines 114-119:  HTML body (canvas#game, canvas#upgradeCanvas, joystick)
Lines 120-10535: JavaScript IIFE
```

---

## 1. HTML/CSS (1-119)
- L12-113: `<style>` — CSS for body, canvas, touch controls, joystick, upgradeCanvas overlay
- L44-52: `#upgradeCanvas` — absolute positioned overlay canvas (display:none, pointer-events:none)
- L117-119: `<body>` — gameContainer, canvas#game, canvas#upgradeCanvas, touchControls

## 2. CONSTANTS (128-560)
- L131-132: `CANVAS_WIDTH/HEIGHT` — 1920x1080
- L135: `isMobile()` — device detection
- L139-148: Physics — ROTATION_SPEED, THRUST_ACCEL, MAX_SPEED, DRAG_FACTOR, BULLET_SPEED, ORBITAL_*
- L150-153: Aura constants — AURA_BASE_RADIUS, DAMAGE, TICK_RATE
- L156: `BEAM_ORIGIN_RADIUS` — fusion beam circle radius (35px)
- L158-163: Annihilation constants
- L165-176: Drone constants (including Hive Mind)
- L178-185: Player constants — PLAYER_SIZE, COLLISION_RADIUS, MAX_HP, PIVOT_OFFSET, MASS
- L188: `PICKUP_MAGNET_RADIUS`
- L190-194: Shield constants
- L196-199: `AUTO_FIRE_INTERVAL`, `BULLET_LIFETIME`, `MAX_ACTIVE_WEAPONS` (4 = 1 starting + 3)
- L201-206: `ENEMY_TYPES` — SCOUT, KAMIKAZE, TANK, ALIEN
- L210-218: Spawn config
- L220-221: Near-miss
- L390-391: **Demo/Full version** — `DEMO_MAX_LEVEL = 10`, `FULLVERSION_SAVE_KEY`
- L393-398: Shake/slowmo constants
- L401-466: `COLORS` — full color palette
- L440-449: Shield arc constants
- L451-465: **Segmented shield display** + **Shield break sequence** + **Life slots overlay** constants
- L466-468: XP formula
- L470-473: Joystick config
- L475-477: Auto-aim
- L479-482: Enemy spawn offset
- L492-505: Wave system
- L507-521: Sector/world
- L528-555: **`WEAPONS`** object — 11 weapons x 10 linear levels (level 10 = evolution)
- L555: `STARTING_WEAPON_IDS` — computed from WEAPONS (isStartingWeapon: true)

## 3. GAME STATE & VARIABLES (557-740)
- L577-580: Canvas (`ctx`), upgradeCanvas (`uCtx`), gameState (`menu | playing | paused | gameOver | skilltree | tutorial | shop | demoEnd`)
- L571-575: Timing — `lastTime`, `deltaTime`, `timeScale`, `gameTime`, `totalKills`
- L577-582: Wave alert system

## 4. META-PROGRESSION (589-810)
- L587: `PROGRESSION_SAVE_KEY`
- L588: `WEAPON_IDS` array
- L594: `getDiffMultipliers()`
- L595-600: `PERMANENT_UPGRADES`
- L607: `getUpgradeCost(upgradeKey, currentLevel)`
- L617: `createDefaultProgression()`
- L645: `loadProgression()`
- L672: `saveProgression()`
- L681-699: **Full version flag**
- L702-798: **Digital Goods API / Play Billing**
- L811: `setGlow()` / L818: `clearGlow()`

## 5. GAME STATE VARIABLES continued (823-1040)
- L851-905: Cheat codes
- L907-910: Touch state
- L912-913: Player
- L915-928: Entity arrays
- L929-938: Fusion beam state, Weapon state vars
- L940-947: Camera system
- L966-975: Upgrade state + `upgradeOverlay` object (no hoveredCard, no blurCanvas)
- L982: Performance — `separationFrame`
- L991-995: Effects — shake, flash, slowmo vars
- L996: `currentSlowmoFactor`
- L998: `shieldBreakState`
- L1013: **Menu intro animation** vars

## 6. PERFORMANCE OPTIMIZATIONS (1049-1251)
- L1049-1117: Spatial grid
- L1119-1215: **Object pools**
- L1218-1227: `CULLING_DISTANCES`
- L1238: `lerpColor()`
- L1245: `fastRemove(array, index)`
- L1251-1317: Performance monitor, debug overlay

## 7. INITIALIZATION (1320-1748)
- L1323: `initBackgroundCache()`
- L1380: `resetMenuAnimation()`
- L1418: `updateMenuAnimation(dt)`
- L1498: `init()` — calls resizeCanvas(), sets up upgradeCanvas dimensions
- L1543: `resizeCanvas()` — also sets `upgradeCanvas.width/height`
- L1562: `generateBackground()`
- L1577: `startGame()`
- L1595: `finishMenuExit()`
- L1612: `resetGame()` — includes upgradeOverlay reset

## 8. INPUT HANDLING (1750-2018)
- L1763: `setupInput()` — includes canvas click handler for skilltree (no hover)
- L1910: `updateInput()`
- L1925: `setupTouchControls()` — routes touch to `handleUpgradeClick()` during skilltree (L1976)

## 9. COORDINATE SYSTEM (2018-2054)
- L2022: `worldToScreen()`
- L2030: `screenToWorld()`
- L2038: `isInView()`
- L2047: `shouldRenderEntity()`

## 10. SECTOR BOUNDARY SYSTEM (2055-2185)
- L2058: `checkSectorBoundary()`
- L2092: `transportEntities()`

## 11. CAMERA UPDATE (2186-2208)
- L2189: `updateCamera()`

## 12. GAME LOOP (2209-2341)
- L2220: `gameLoop(timestamp)` — updates upgradeOverlay.animTime during skilltree state
- L2269: `update(rawDt)`

## 13. SHIELD ARC STATE MACHINE (2344-2409)
- L2347: `updateShieldArcState(deltaTime)`

## 14. PLAYER SYSTEM (2410-3460)
- L2421: `updatePlayer()`
- L2556: `getWeaponStats()`
- L2907: `hasEnemyInAimCone()`
- L2929: `fireBullet()`
- L3066: `fireNovaBeam()`
- L3121: `fireRocket()`
- L3212: `fireArmageddonMissile()`
- L3276: `fireLightning()`
- L3402: `spawnAlienDrone()`
- L3437: `spawnThrusterParticle()`

## 15. BULLETS (3460-3600)
- L3462: `updateBullets()`

## 16. ALIEN DRONES (3600-3754)
- L3602: `updateDrones()`

## 17. ENEMIES (3754-4215)
- L3756: `updateSpawnSystem()`
- L3793: `spawnWave()`
- L3866: `getSpawnType()`
- L3899: `spawnEnemy()`
- L3947: `updateEnemies()`
- L4104: `updateEnemyBullets()`
- L4126: `killEnemy(enemy)` — **mark-and-sweep**
- L4204: `sweepDeadEnemies()`

## 18. PICKUPS (4215-4323)
- L4217: `spawnPickup()`
- L4240: `updatePickups()`

## 19. XP & LEVEL SYSTEM (4323-5001)
- L4325: `collectXP(amount)`
- L4359: `levelUp(levelsGained)`
- L4377: `getAvailableUpgrades()`
- L4435: `allSkillsUnlocked()`
- L4454: `generateUpgradeOptions()`
- L4471: `drawSkillIcon(ctx, icon, cx, cy, color)` — large icon library (~500 lines), takes ctx as parameter

## 20. CANVAS UPGRADE OVERLAY (5003-5607) — Two-Canvas Architecture
- L5008: `easeOutCubic()`, `easeOutQuart()` — easing functions
- L5012: `showUpgradePanel()` — generates options, calculates card positions, applies CSS blur on game canvas, shows upgradeCanvas
- L5056: `renderUpgradeOverlay()` — draws on `uCtx` (overlay canvas): ship, lines, cards. Called directly from render() during skilltree
- L5207: `drawUpgradeConnectionLine()` — animated blueprint-style lines (uCtx)
- L5279: `drawUpgradePartialPath()` — partial path drawing helper (uCtx)
- L5299: `getUpgradePathPoint()` — point along path helper
- L5315: `renderWeaponInventoryBar()` — active weapons display in header (uCtx)
- L5378: `renderUpgradeCard()` — vertical card layout, unified for all screens (uCtx)
- L5531: `handleUpgradeClick()` — click/tap on cards
- L5547: `selectUpgrade(option)` — applies upgrade, celebration particles
- L5596: `hideUpgradePanel()` — removes CSS filter, hides overlay canvas, resumes game

## 21. WEAPON SYSTEMS (5608-5877)
- L5612: `updateWeapons()`
- L5663: `updateLightningEffects()`
- L5674: `updateNovaBeamEffects()`
- L5684: `updateOrbitals()`
- L5748: `updateAura()`
- L5811: `triggerAnnihilationExplosion()`

## 22. VOID BLADE SYSTEM (5877-6070)
- L5880: `updateVoidBlade()`
- L5955: `performBlastDamage()`
- L6024: `updateRiftZones()`
- L6056: `updateSlashEffects()`

## 23. WARP SNARE SYSTEM (6071-6205)
- L6074: `updateWarpSnares()`

## 24. GRAVITY MINES SYSTEM (6206-6431)
- L6272: `updateGravityMines()`

## 25. SENTRY TURRET SYSTEM (6432-6624)
- L6435: `updateSentryTurrets()`

## 26. FUSION BEAM SYSTEM (6625-6786)
- L6628: `updateFusionBeam()`
- L6762: `handleBeamKill(enemy, stats)`

## 27. ROCKET EXPLOSION (6786-6866)
- L6789: `explodePlayerRocket()`

## 28. COLLISIONS (6867-7043)
- L6872: `lineCircleCollision()`
- L6905: `checkCollisions()`

## 29. PLAYER DAMAGE & DEATH (7043-7296)
- L7046: `damagePlayer()`
- L7074: `triggerShieldBreak()`
- L7098: `updateShieldBreakSequence(rawDt)`
- L7191: `triggerNearMiss()`
- L7211: `gameOver()`
- L7257: `spawnDeathExplosion()`

## 30. PARTICLES & EFFECTS (7294-7416)
- L7297-7298: `MAX_PARTICLES = 600`, `MAX_FLOATING_TEXTS = 150`
- L7301: `spawnRing(x, y, color, maxSize)`
- L7317: `spawnFloatingText()`
- L7329: `updateParticles()`
- L7362: `updateFloatingTexts()`
- L7376: `updateEffects()`
- L7397: `triggerShake()`
- L7403: `triggerFlash()`
- L7410: `triggerSlowmo()`

## 31. RENDERING (7403-9227)
- L7407: `render()` — during skilltree: early return, calls `renderUpgradeOverlay()` directly on uCtx (game canvas stays frozen with CSS blur)
- L7483: `renderBackground()`
- L7558: `renderShieldArc()` — **segmented bars**
- L7620: `renderShieldBreakEffects()`
- L7701: `renderPlayer()`
- L7741: `renderAura()`
- L7801: `renderFusionBeam()`
- L7928: `renderOrbitals()`
- L7949: `renderLightning()`
- L7989: `renderNovaBeam()`
- L8021: `renderBullets()`
- L8246: `renderEnemyBullets()`
- L8264: `renderDrones()`
- L8361: `renderEnemies()`
- L8506: `renderPickups()`
- L8550: `renderParticles()`
- L8628: `renderFloatingTexts()`
- L8652: `renderTurrets()`
- L8746: `renderMines()`
- L8867: `renderSnares()`
- L8931: `renderSlashEffects()`
- L8982: `renderRiftZones()`
- L9010: `drawUpgradeIcon(ctx, upgradeKey, cx, cy, color, size)`
- L9076: `drawVerticalProgressBars()`
- L9085: `drawWeaponIconAt()`

## 32. UI RENDERING (9230-10514)
- L9230: `renderUI()` — calls `renderUpgradeOverlay()` during skilltree (but render() now calls it directly instead)
- L9254: `renderMenu()`
- L9604: `renderArsenalGallery()`
- L9692: `renderControlsHelp(startY)`
- L9728: `renderHUD()`
- L9935: `renderTutorial()`
- L10036: `renderShop()`
- L10231: `handleShopClick(clickX, clickY)`
- L10266: `handleMenuClick(clickX, clickY)`
- L10312: `renderDemoEnd()`
- L10399: `handleDemoEndClick(clickX, clickY)`
- L10417: `renderPauseOverlay()`
- L10432: `renderGameOver()`

## 33. UTILITIES (10513-10524)
- L10514: `normalizeAngle(angle)`

## 34. START GAME (10524-10535)
- L10524: `init()` call
