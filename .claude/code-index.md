# index.html Code Index (~10759 lines)

Last updated: 2026-03-04

## File Structure
```
Lines 1-113:    HTML + CSS (styles, canvas, touch controls, upgradeCanvas)
Lines 114-119:  HTML body (canvas#game, canvas#upgradeCanvas, joystick)
Lines 120-10407: JavaScript IIFE
```

---

## 1. HTML/CSS (1-119)
- L12-113: `<style>` — CSS for body, canvas, touch controls, joystick, upgradeCanvas overlay
- L44-52: `#upgradeCanvas` — absolute positioned overlay canvas (display:none, pointer-events:none)
- L117-119: `<body>` — gameContainer, canvas#game, canvas#upgradeCanvas, touchControls

## 2. CONSTANTS (128-600)
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
- L245-280: `COLORS` — full color palette (mutable properties, updated by `applyWeaponTheme()`)
- L283-287: **`WEAPON_THEMES`** — color palettes per starting weapon (laser_cannon, void_blade, fusion_beam)
- L289-294: `hexToRGBA(hex, alpha)` — converts hex color + alpha to rgba string
- L296-312: **`applyWeaponTheme(weaponId)`** — updates COLORS + all WEAPONS colors to match starting weapon theme
- L314-332: Shield arc constants
- L333-350: Segmented shield display + Shield break sequence + Life slots overlay constants
- L390-391: **Demo/Full version** — `DEMO_MAX_LEVEL = 10`, `FULLVERSION_SAVE_KEY`
- L393-398: Shake/slowmo constants
- L467-469: XP formula
- L471-474: Joystick config
- L476-478: Auto-aim
- L480-483: Enemy spawn offset
- L493-506: Wave system
- L508-522: Sector/world
- L559-598: **`WEAPONS`** object — 11 weapons x 10 linear levels (level 10 = evolution)
- L600: `STARTING_WEAPON_IDS` — computed from WEAPONS (isStartingWeapon: true)

## 3. GAME STATE & VARIABLES (602-770)
- L610-613: Canvas (`ctx`), upgradeCanvas (`uCtx`), gameState (`menu | playing | paused | gameOver | skilltree | tutorial | shop | demoEnd`)
- L604-608: Timing — `lastTime`, `deltaTime`, `timeScale`, `gameTime`, `totalKills`

## 4. META-PROGRESSION (620-845)
- L620: `PROGRESSION_SAVE_KEY`
- L621: `WEAPON_IDS` array
- L627: `getDiffMultipliers()`
- L628-633: `PERMANENT_UPGRADES`
- L640: `getUpgradeCost(upgradeKey, currentLevel)`
- L650: `createDefaultProgression()`
- L678: `loadProgression()`
- L705: `saveProgression()`
- L714-732: **Full version flag**
- L735-831: **Digital Goods API / Play Billing**
- L844: `setGlow()` / L851: `clearGlow()`
- L850: **`drawShipPath(c, weaponId)`** — draws ship outline path (3 variants: laser_cannon=sharp, fusion_beam=rounded, void_blade=truncated)
- L878: **`drawShipUpgradeIcon(ctx, weaponId, cx, cy, scale, color)`** — draws ship pointing up + upward arrow (for upgrade UI)

## 5. GAME STATE VARIABLES continued (905-1121)
- L913-967: Cheat codes
- L969-972: Touch state
- L974-975: Player
- L977-990: Entity arrays
- L991-1000: Fusion beam state, Weapon state vars
- L1002-1009: Camera system
- L1028-1037: Upgrade state + `upgradeOverlay` object
- L1044: Performance — `separationFrame`
- L1053-1057: Effects — shake, flash, slowmo vars
- L1075: **Menu intro animation** vars

## 6. PERFORMANCE OPTIMIZATIONS (1112-1314)
- L1112-1180: Spatial grid
- L1182-1278: **Object pools**
- L1281-1290: `CULLING_DISTANCES`
- L1301: `lerpColor()`
- L1308: `fastRemove(array, index)`
- L1314-1380: Performance monitor, debug overlay

## 7. INITIALIZATION (1383-1811)
- L1386: `initBackgroundCache()`
- L1443: `resetMenuAnimation()`
- L1481: `updateMenuAnimation(dt)`
- L1591: `init()` — calls resizeCanvas(), `applyWeaponTheme()`, sets up upgradeCanvas
- L1636: `resizeCanvas()` — also sets `upgradeCanvas.width/height`
- L1655: `generateBackground()`
- L1666: `startGame()`
- L1688: `finishMenuExit()`
- L1701: `resetGame()` — calls `applyWeaponTheme(selectedStartingWeapon)`, includes upgradeOverlay reset

## 8. INPUT HANDLING (1813-2081)
- L1826: `setupInput()` — includes canvas click handler for skilltree (no hover); weapon cycling calls `applyWeaponTheme()`
- L1973: `updateInput()`
- L1988: `setupTouchControls()` — routes touch to `handleUpgradeClick()` during skilltree

## 9. COORDINATE SYSTEM (2081-2117)
- L2085: `worldToScreen()`
- L2093: `screenToWorld()`
- L2101: `isInView()`
- L2110: `shouldRenderEntity()`

## 10. SECTOR BOUNDARY SYSTEM (2118-2248)
- L2121: `checkSectorBoundary()`
- L2155: `transportEntities()`

## 11. CAMERA UPDATE (2249-2271)
- L2252: `updateCamera()`

## 12. GAME LOOP (2272-2404)
- L2283: `gameLoop(timestamp)` — updates upgradeOverlay.animTime during skilltree state
- L2332: `update(rawDt)`

## 13. SHIELD ARC STATE MACHINE (2407-2472)
- L2428: `updateShieldArcState(deltaTime)`

## 14. PLAYER SYSTEM (2473-3539)
- L2485: `updatePlayer()` — includes shield recharge animation logic
- L2637: `getWeaponStats()`
- L2978: `hasEnemyInAimCone()`
- L3000: `fireBullet()`
- L3137: `fireNovaBeam()`
- L3192: `fireRocket()`
- L3283: `fireArmageddonMissile()`
- L3347: `fireLightning()`
- L3473: `spawnAlienDrone()`
- L3508: `spawnThrusterParticle()`

## 15. BULLETS (3539-3681)
- L3543: `updateBullets()`

## 16. ALIEN DRONES (3681-3835)
- L3683: `updateDrones()`

## 17. ENEMIES (3835-4296)
- L3837: `updateSpawnSystem()`
- L3874: `spawnWave()`
- L3947: `getSpawnType()`
- L3980: `spawnEnemy()`
- L4028: `updateEnemies()`
- L4185: `updateEnemyBullets()`
- L4207: `killEnemy(enemy)` — **mark-and-sweep**
- L4285: `sweepDeadEnemies()`

## 18. PICKUPS (4296-4404)
- L4298: `spawnPickup()`
- L4321: `updatePickups()`

## 19. XP & LEVEL SYSTEM (4404-5082)
- L4406: `collectXP(amount)`
- L4440: `levelUp(levelsGained)`
- L4577: `getAvailableUpgrades()`
- L4635: `allSkillsUnlocked()`
- L4654: `generateUpgradeOptions()`
- L4662: `drawSkillIcon(ctx, icon, cx, cy, color)` — large icon library (~500 lines), takes ctx as parameter

## 20. CANVAS UPGRADE OVERLAY (5194-5828) — Two-Canvas Architecture
- L5199: `easeOutCubic()`, `easeOutQuart()` — easing functions
- L5203: `showUpgradePanel()` — guards for dead player, generates options, calculates card positions, applies CSS blur on game canvas, shows upgradeCanvas
- L5249: `renderUpgradeOverlay()` — draws on `uCtx` (overlay canvas): ship (via `drawShipPath`), lines, cards
- L5393: `drawUpgradeConnectionLine()` — animated blueprint-style lines (uCtx)
- L5465: `drawUpgradePartialPath()` — partial path drawing helper (uCtx)
- L5485: `getUpgradePathPoint()` — point along path helper
- L5501: `renderWeaponInventoryBar()` — **two-row layout**: ship slot on top (44px, uses `drawShipUpgradeIcon`), 3 weapon slots below (34px) (uCtx)
- L5599: `renderUpgradeCard()` — vertical card layout, starting weapon shows ship icon + "Upgrade Ship" name (uCtx)
- L5751: `handleUpgradeClick()` — click/tap on cards
- L5767: `selectUpgrade(option)` — applies upgrade, celebration particles
- L5816: `hideUpgradePanel()` — removes CSS filter, hides overlay canvas, resumes game

## 21. WEAPON SYSTEMS (5832-6085)
- L5832: `updateWeapons()`
- L5883: `updateLightningEffects()`
- L5894: `updateNovaBeamEffects()`
- L5904: `updateOrbitals()`
- L5968: `updateAura()`
- L6031: `triggerAnnihilationExplosion()`

## 22. VOID BLADE SYSTEM (6086-6279)
- L6086: `updateVoidBlade()`
- L6161: `performBlastDamage()`
- L6232: `updateRiftZones()`
- L6264: `updateSlashEffects()`

## 23. WARP SNARE SYSTEM (6280-6414)
- L6280: `updateWarpSnares()`

## 24. GRAVITY MINES SYSTEM (6478-6640)
- L6478: `updateGravityMines()`

## 25. SENTRY TURRET SYSTEM (6641-6833)
- L6641: `updateSentryTurrets()`

## 26. FUSION BEAM SYSTEM (6834-6995)
- L6834: `updateFusionBeam()`
- L6968: `handleBeamKill(enemy, stats)`

## 27. ROCKET EXPLOSION (6995-7075)
- L6995: `explodePlayerRocket()`

## 28. COLLISIONS (7076-7236)
- L7080: `lineCircleCollision()`
- L7111: `checkCollisions()`

## 29. PLAYER DAMAGE & DEATH (7236-7532)
- L7252: `damagePlayer()` — shield set to 0 on break (recharge animation fills it)
- L7280: `triggerShieldBreak()`
- L7304: `updateShieldBreakSequence(rawDt)` — lifeslots phase 0.95s with pop animation timeline
- L7399: `triggerNearMiss()`
- L7422: `gameOver()` — closes upgrade panel if open, prevents level-up during death
- L7473: `spawnDeathExplosion()`

## 30. PARTICLES & EFFECTS (7532-7652)
- L7535-7536: `MAX_PARTICLES = 600`, `MAX_FLOATING_TEXTS = 150`
- L7539: `spawnRing(x, y, color, maxSize)`
- L7555: `spawnFloatingText()`
- L7567: `updateParticles()`
- L7600: `updateFloatingTexts()`
- L7614: `updateEffects()`
- L7635: `triggerShake()`
- L7641: `triggerFlash()`
- L7648: `triggerSlowmo()`

## 31. RENDERING (7636-9587)
- L7636: `render()` — during skilltree: early return, calls `renderUpgradeOverlay()` directly on uCtx
- L7712: `renderBackground()`
- L7787: `renderShieldArc()` — **segmented bars**, guards for shieldRechargeTimer
- L7849: `renderShieldBreakEffects()` — pop animation on lost life slot (uses `drawShipPath`)
- L7934: `renderPlayer()` — uses `drawShipPath(ctx, selectedStartingWeapon)`
- L8016: `renderAura()`
- L8075: `renderFusionBeam()` — uses `COLORS.PLAYER` (dynamic via theme)
- L8209: `renderOrbitals()`
- L8230: `renderLightning()` — mid/outer layers use `hexToRGBA(COLORS.PLAYER, ...)`
- L8270: `renderNovaBeam()`
- L8302: `renderBullets()` — rockets use capsule shape + detached trail with width ramp + pulsating center light
- L8595: `renderEnemyBullets()`
- L8613: `renderDrones()`
- L8710: `renderEnemies()`
- L8855: `renderPickups()`
- L8899: `renderParticles()`
- L8985: `renderFloatingTexts()`
- L9009: `renderTurrets()`
- L9103: `renderMines()`
- L9224: `renderSnares()`
- L9288: `renderSlashEffects()` — gradient uses `hexToRGBA(COLORS.PLAYER, ...)`
- L9339: `renderRiftZones()` — uses `COLORS.PLAYER` (dynamic via theme)
- L9367: `drawUpgradeIcon(ctx, upgradeKey, cx, cy, color, size)`
- L9433: `drawVerticalProgressBars()`
- L9442: `drawWeaponIconAt()`

## 32. UI RENDERING (9587-10687)
- L9587: `renderUI()`
- L9609: `renderMenu()` — includes inline shop (`menuMode === 'shop'`), uses `drawShipPath` for ship
- L10058: `renderArsenalGallery()` — uses dynamic `WEAPONS[id].color`
- L10139: `renderControlsHelp(startY)`
- L10175: `renderHUD()` — life icons via `drawShipPath`
- L10377: `renderTutorial()`
- L10488: `handleMenuClick(clickX, clickY)` — weapon cycling calls `applyWeaponTheme()`
- L10536: `renderDemoEnd()`
- L10623: `handleDemoEndClick(clickX, clickY)`
- L10641: `renderPauseOverlay()`
- L10656: `renderGameOver()`

## 33. UTILITIES (10738-10747)
- L10738: `normalizeAngle(angle)`

## 34. START GAME (10748-10759)
- L10748: `init()` call
