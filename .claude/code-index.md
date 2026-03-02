# index.html Code Index (~10374 lines)

Last updated: 2026-03-02

## File Structure
```
Lines 1-113:    HTML + CSS (styles, canvas, touch controls, upgradeCanvas)
Lines 114-119:  HTML body (canvas#game, canvas#upgradeCanvas, joystick)
Lines 120-10366: JavaScript IIFE
```

---

## 1. HTML/CSS (1-119)
- L12-113: `<style>` — CSS for body, canvas, touch controls, joystick, upgradeCanvas overlay
- L44-52: `#upgradeCanvas` — absolute positioned overlay canvas (display:none, pointer-events:none)
- L117-119: `<body>` — gameContainer, canvas#game, canvas#upgradeCanvas, touchControls

## 2. CONSTANTS (128-561)
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
- L401-467: `COLORS` — full color palette
- L440-449: Shield arc constants
- L451-466: **Segmented shield display** + **Shield break sequence** + **Life slots overlay** constants
- L307: `SHIELD_RECHARGE_DURATION` — shield refill time after break (1.0s game-time)
- L467-469: XP formula
- L471-474: Joystick config
- L476-478: Auto-aim
- L480-483: Enemy spawn offset
- L493-506: Wave system
- L508-522: Sector/world
- L529-556: **`WEAPONS`** object — 11 weapons x 10 linear levels (level 10 = evolution)
- L556: `STARTING_WEAPON_IDS` — computed from WEAPONS (isStartingWeapon: true)

## 3. GAME STATE & VARIABLES (558-741)
- L578-581: Canvas (`ctx`), upgradeCanvas (`uCtx`), gameState (`menu | playing | paused | gameOver | skilltree | tutorial | shop | demoEnd`)
- L572-576: Timing — `lastTime`, `deltaTime`, `timeScale`, `gameTime`, `totalKills`
- L578-583: Wave alert system

## 4. META-PROGRESSION (590-811)
- L588: `PROGRESSION_SAVE_KEY`
- L589: `WEAPON_IDS` array
- L595: `getDiffMultipliers()`
- L596-601: `PERMANENT_UPGRADES`
- L608: `getUpgradeCost(upgradeKey, currentLevel)`
- L618: `createDefaultProgression()`
- L646: `loadProgression()`
- L673: `saveProgression()`
- L682-700: **Full version flag**
- L703-799: **Digital Goods API / Play Billing**
- L812: `setGlow()` / L819: `clearGlow()`

## 5. GAME STATE VARIABLES continued (824-1042)
- L852-906: Cheat codes
- L908-911: Touch state
- L913-914: Player
- L916-929: Entity arrays
- L930-939: Fusion beam state, Weapon state vars
- L941-948: Camera system
- L967-976: Upgrade state + `upgradeOverlay` object (no hoveredCard, no blurCanvas)
- L983: Performance — `separationFrame`
- L992-996: Effects — shake, flash, slowmo vars
- L997: `currentSlowmoFactor`
- L1038: `shieldBreakState`
- L1039: `shieldRechargeTimer`
- L1014: **Menu intro animation** vars

## 6. PERFORMANCE OPTIMIZATIONS (1051-1253)
- L1051-1119: Spatial grid
- L1121-1217: **Object pools**
- L1220-1229: `CULLING_DISTANCES`
- L1240: `lerpColor()`
- L1247: `fastRemove(array, index)`
- L1253-1319: Performance monitor, debug overlay

## 7. INITIALIZATION (1322-1750)
- L1325: `initBackgroundCache()`
- L1382: `resetMenuAnimation()`
- L1420: `updateMenuAnimation(dt)`
- L1500: `init()` — calls resizeCanvas(), sets up upgradeCanvas dimensions
- L1545: `resizeCanvas()` — also sets `upgradeCanvas.width/height`
- L1564: `generateBackground()`
- L1579: `startGame()`
- L1597: `finishMenuExit()`
- L1642: `resetGame()` — includes upgradeOverlay reset, shieldRechargeTimer reset

## 8. INPUT HANDLING (1752-2020)
- L1765: `setupInput()` — includes canvas click handler for skilltree (no hover)
- L1912: `updateInput()`
- L1927: `setupTouchControls()` — routes touch to `handleUpgradeClick()` during skilltree (L1978)

## 9. COORDINATE SYSTEM (2020-2056)
- L2024: `worldToScreen()`
- L2032: `screenToWorld()`
- L2040: `isInView()`
- L2049: `shouldRenderEntity()`

## 10. SECTOR BOUNDARY SYSTEM (2057-2187)
- L2060: `checkSectorBoundary()`
- L2094: `transportEntities()`

## 11. CAMERA UPDATE (2188-2210)
- L2191: `updateCamera()`

## 12. GAME LOOP (2211-2343)
- L2222: `gameLoop(timestamp)` — updates upgradeOverlay.animTime during skilltree state
- L2271: `update(rawDt)`

## 13. SHIELD ARC STATE MACHINE (2346-2411)
- L2367: `updateShieldArcState(deltaTime)`

## 14. PLAYER SYSTEM (2412-3468)
- L2433: `updatePlayer()` — includes shield recharge animation logic (L2493-2502)
- L2564: `getWeaponStats()`
- L2915: `hasEnemyInAimCone()`
- L2937: `fireBullet()`
- L3074: `fireNovaBeam()`
- L3129: `fireRocket()`
- L3220: `fireArmageddonMissile()`
- L3284: `fireLightning()`
- L3410: `spawnAlienDrone()`
- L3445: `spawnThrusterParticle()`

## 15. BULLETS (3468-3608)
- L3470: `updateBullets()`

## 16. ALIEN DRONES (3608-3762)
- L3610: `updateDrones()`

## 17. ENEMIES (3762-4223)
- L3764: `updateSpawnSystem()`
- L3801: `spawnWave()`
- L3874: `getSpawnType()`
- L3907: `spawnEnemy()`
- L3955: `updateEnemies()`
- L4112: `updateEnemyBullets()`
- L4134: `killEnemy(enemy)` — **mark-and-sweep**
- L4212: `sweepDeadEnemies()`

## 18. PICKUPS (4223-4331)
- L4225: `spawnPickup()`
- L4248: `updatePickups()`

## 19. XP & LEVEL SYSTEM (4331-5009)
- L4333: `collectXP(amount)`
- L4367: `levelUp(levelsGained)`
- L4385: `getAvailableUpgrades()`
- L4443: `allSkillsUnlocked()`
- L4462: `generateUpgradeOptions()`
- L4479: `drawSkillIcon(ctx, icon, cx, cy, color)` — large icon library (~500 lines), takes ctx as parameter

## 20. CANVAS UPGRADE OVERLAY (5011-5615) — Two-Canvas Architecture
- L5016: `easeOutCubic()`, `easeOutQuart()` — easing functions
- L5020: `showUpgradePanel()` — generates options, calculates card positions, applies CSS blur on game canvas, shows upgradeCanvas
- L5064: `renderUpgradeOverlay()` — draws on `uCtx` (overlay canvas): ship, lines, cards. Called directly from render() during skilltree
- L5215: `drawUpgradeConnectionLine()` — animated blueprint-style lines (uCtx)
- L5287: `drawUpgradePartialPath()` — partial path drawing helper (uCtx)
- L5307: `getUpgradePathPoint()` — point along path helper
- L5323: `renderWeaponInventoryBar()` — active weapons display in header (uCtx)
- L5386: `renderUpgradeCard()` — vertical card layout, unified for all screens (uCtx)
- L5539: `handleUpgradeClick()` — click/tap on cards
- L5555: `selectUpgrade(option)` — applies upgrade, celebration particles
- L5604: `hideUpgradePanel()` — removes CSS filter, hides overlay canvas, resumes game

## 21. WEAPON SYSTEMS (5616-5885)
- L5620: `updateWeapons()`
- L5671: `updateLightningEffects()`
- L5682: `updateNovaBeamEffects()`
- L5692: `updateOrbitals()`
- L5756: `updateAura()`
- L5819: `triggerAnnihilationExplosion()`

## 22. VOID BLADE SYSTEM (5885-6078)
- L5888: `updateVoidBlade()`
- L5963: `performBlastDamage()`
- L6032: `updateRiftZones()`
- L6064: `updateSlashEffects()`

## 23. WARP SNARE SYSTEM (6079-6213)
- L6082: `updateWarpSnares()`

## 24. GRAVITY MINES SYSTEM (6214-6439)
- L6280: `updateGravityMines()`

## 25. SENTRY TURRET SYSTEM (6440-6632)
- L6443: `updateSentryTurrets()`

## 26. FUSION BEAM SYSTEM (6633-6794)
- L6636: `updateFusionBeam()`
- L6770: `handleBeamKill(enemy, stats)`

## 27. ROCKET EXPLOSION (6794-6874)
- L6797: `explodePlayerRocket()`

## 28. COLLISIONS (6875-7035)
- L6880: `lineCircleCollision()`
- L6913: `checkCollisions()`

## 29. PLAYER DAMAGE & DEATH (7035-7310)
- L7037: `damagePlayer()` — shield set to 0 on break (recharge animation fills it)
- L7065: `triggerShieldBreak()`
- L7089: `updateShieldBreakSequence(rawDt)` — lifeslots phase 0.95s with pop animation timeline
- L7184: `triggerNearMiss()`
- L7204: `gameOver()`
- L7250: `spawnDeathExplosion()`

## 30. PARTICLES & EFFECTS (7308-7430)
- L7311-7312: `MAX_PARTICLES = 600`, `MAX_FLOATING_TEXTS = 150`
- L7315: `spawnRing(x, y, color, maxSize)`
- L7331: `spawnFloatingText()`
- L7343: `updateParticles()`
- L7376: `updateFloatingTexts()`
- L7390: `updateEffects()`
- L7411: `triggerShake()`
- L7417: `triggerFlash()`
- L7424: `triggerSlowmo()`

## 31. RENDERING (7414-9243)
- L7414: `render()` — during skilltree: early return, calls `renderUpgradeOverlay()` directly on uCtx (game canvas stays frozen with CSS blur)
- L7497: `renderBackground()`
- L7565: `renderShieldArc()` — **segmented bars**, guards for shieldRechargeTimer
- L7627: `renderShieldBreakEffects()` — pop animation on lost life slot (scale up → shrink + fade to red)
- L7717: `renderPlayer()`
- L7757: `renderAura()`
- L7817: `renderFusionBeam()`
- L7944: `renderOrbitals()`
- L7965: `renderLightning()`
- L8005: `renderNovaBeam()`
- L8037: `renderBullets()`
- L8262: `renderEnemyBullets()`
- L8280: `renderDrones()`
- L8377: `renderEnemies()`
- L8522: `renderPickups()`
- L8566: `renderParticles()`
- L8644: `renderFloatingTexts()`
- L8668: `renderTurrets()`
- L8762: `renderMines()`
- L8883: `renderSnares()`
- L8947: `renderSlashEffects()`
- L8998: `renderRiftZones()`
- L9026: `drawUpgradeIcon(ctx, upgradeKey, cx, cy, color, size)`
- L9092: `drawVerticalProgressBars()`
- L9101: `drawWeaponIconAt()`

## 32. UI RENDERING (9246-10320)
- L9246: `renderUI()`
- L9270: `renderMenu()` — includes inline shop (`menuMode === 'shop'`)
- L9666: `renderArsenalGallery()`
- L9754: `renderControlsHelp(startY)`
- L9790: `renderHUD()` — life icons with lineWidth 3
- L9997: `renderTutorial()`
- L10119: `handleMenuClick(clickX, clickY)`
- L10165: `renderDemoEnd()`
- L10252: `handleDemoEndClick(clickX, clickY)`
- L10270: `renderPauseOverlay()`
- L10285: `renderGameOver()`

## 33. UTILITIES (10367-10376)
- L10367: `normalizeAngle(angle)`

## 34. START GAME (10376-10388)
- L10376: `init()` call
