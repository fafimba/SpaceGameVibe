# index.html Code Index (~10983 lines)

Last updated: 2026-03-05

## File Structure
```
Lines 1-113:    HTML + CSS (styles, canvas, touch controls, upgradeCanvas)
Lines 114-119:  HTML body (canvas#game, canvas#upgradeCanvas, joystick)
Lines 120-10645: JavaScript IIFE
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
- L735-875: **Digital Goods API / Play Billing** — `initDigitalGoods()`, `checkExistingPurchases()`, `purchaseFullGame()`, `demoEndStatusText`, `cachedProduct`/`cachedProductPrice`/`billingError` state
- L946: `setGlow()` / L953: `clearGlow()`
- L880: **`drawShipPath(c, weaponId)`** — draws ship outline path (3 variants: laser_cannon=sharp, fusion_beam=rounded, void_blade=truncated)
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
- L1053-1057: Effects — shake, flash, slowmo vars + `gameOverAnimStart`
- L1076: **Menu intro animation** vars

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
- L2637: `getWeaponStats()` — **cached per frame** via `_cachedStats`/`_statsFrameId`/`_frameCounter`; `invalidateStatsCache()` to force recalc
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

## 20. CANVAS UPGRADE OVERLAY (5194-5829) — Two-Canvas Architecture
- L5221: `easeOutCubic()`, `easeOutQuart()` — easing functions
- L5229: `showUpgradePanel()` — generates options, calculates card positions (cardH=420, gap=14, bottom margin 60)
- L5276: `renderUpgradeOverlay()` — draws on `uCtx`: LEVEL UP title (44px), horizontal inventory bar at y=150, ship, connection lines, cards (no subtitle)
- L5408: `drawUpgradeConnectionLine()` — animated blueprint-style lines (uCtx)
- L5480: `drawUpgradePartialPath()` — partial path drawing helper (uCtx)
- L5500: `getUpgradePathPoint()` — point along path helper
- L5516: `renderWeaponInventoryBar()` — **horizontal single row**: 4 slots (50px each), ship + 3 weapons side by side (uCtx)
- L5593: `renderUpgradeCard()` — badge on every card (NEW/UPGRADE/EVOLUTION/BONUS), icon 42px, name 22px, desc 18px, 10-segment progress bar (uCtx)
- L5752: `handleUpgradeClick()` — click/tap on cards
- L5768: `selectUpgrade(option)` — applies upgrade, celebration particles
- L5817: `hideUpgradePanel()` — restores canvas opacity, hides overlay canvas, resumes game

## 21. WEAPON SYSTEMS (5833-6086)
- L5833: `updateWeapons()`
- L5870: `updateLightningEffects()`
- L5881: `updateNovaBeamEffects()`
- L5891: `updateOrbitals()`
- L5955: `updateAura()`
- L6018: `triggerAnnihilationExplosion()`

## 22. VOID BLADE SYSTEM (6087-6280)
- L6087: `updateVoidBlade()`
- L6162: `performBlastDamage()`
- L6231: `updateRiftZones()`
- L6263: `updateSlashEffects()`

## 23. WARP SNARE SYSTEM (6281-6478)
- L6281: `updateWarpSnares()`

## 24. GRAVITY MINES SYSTEM (6479-6641)
- L6479: `updateGravityMines()`

## 25. SENTRY TURRET SYSTEM (6642-6834)
- L6642: `updateSentryTurrets()`

## 26. FUSION BEAM SYSTEM (6835-6995)
- L6835: `updateFusionBeam()`
- L6969: `handleBeamKill(enemy, stats)`

## 27. ROCKET EXPLOSION (6996-7078)
- L6996: `explodePlayerRocket()`

## 28. COLLISIONS (7079-7237)
- L7079: `lineCircleCollision()`
- L7112: `checkCollisions()`

## 29. PLAYER DAMAGE & DEATH (7252-7535)
- L7268: `damagePlayer()` — shield set to 0 on break (recharge animation fills it)
- L7296: `triggerShieldBreak()`
- L7320: `updateShieldBreakSequence(rawDt)` — lifeslots phase 0.95s with pop animation timeline
- L7417: `triggerNearMiss()`
- L7437: `gameOver()` — closes upgrade panel if open, sets `gameOverAnimStart`, prevents level-up during death
- L7489: `spawnDeathExplosion()`

## 30. PARTICLES & EFFECTS (7535-7652)
- L7529-7530: `MAX_PARTICLES = 600`, `MAX_FLOATING_TEXTS = 150`
- L7533: `spawnRing(x, y, color, maxSize)`
- L7549: `spawnFloatingText()`
- L7561: `updateParticles()`
- L7594: `updateFloatingTexts()`
- L7608: `updateEffects()`
- L7629: `triggerShake()`
- L7635: `triggerFlash()`
- L7642: `triggerSlowmo()`

## 31. RENDERING (7653-9601)
- L7653: `render()` — during skilltree: early return, calls `renderUpgradeOverlay()` directly on uCtx
- L7729: `renderBackground()`
- L7804: `renderShieldArc()` — **segmented bars**, guards for shieldRechargeTimer
- L7866: `renderShieldBreakEffects()` — pop animation on lost life slot (uses `drawShipPath`)
- L7951: `renderPlayer()` — uses `drawShipPath(ctx, selectedStartingWeapon)`
- L8033: `renderAura()`
- L8092: `renderFusionBeam()` — uses `COLORS.PLAYER` (dynamic via theme)
- L8226: `renderOrbitals()`
- L8247: `renderLightning()` — mid/outer layers use `hexToRGBA(COLORS.PLAYER, ...)`
- L8287: `renderNovaBeam()`
- L8319: `renderBullets()` — rockets use capsule shape + detached trail with width ramp + pulsating center light
- L8568: `renderEnemyBullets()`
- L8586: `renderDrones()`
- L8683: `renderEnemies()`
- L8828: `renderPickups()`
- L8872: `renderParticles()`
- L8958: `renderFloatingTexts()`
- L8982: `renderTurrets()`
- L9076: `renderMines()`
- L9197: `renderSnares()`
- L9261: `renderSlashEffects()` — gradient uses `hexToRGBA(COLORS.PLAYER, ...)`
- L9312: `renderRiftZones()` — uses `COLORS.PLAYER` (dynamic via theme)
- L9362: `drawUpgradeIcon(ctx, upgradeKey, cx, cy, color, size)`
- L9428: `drawVerticalProgressBars()`
- L9437: `drawWeaponIconAt()`

## 32. UI RENDERING (9601-10960)
- L9601: `renderUI()`
- L9623: `renderMenu()` — includes inline shop (`menuMode === 'shop'`), uses `drawShipPath` for ship
- L10072: `renderArsenalGallery()` — uses dynamic `WEAPONS[id].color`
- L10153: `renderControlsHelp(startY)`
- L10189: `renderHUD()` — life icons via `drawShipPath`
- L10391: `renderTutorial()`
- L10502: `handleMenuClick(clickX, clickY)` — weapon cycling calls `applyWeaponTheme()`
- L10550: `renderDemoEnd()`
- L10637: `handleDemoEndClick(clickX, clickY)`
- L10655: `renderPauseOverlay()`
- L10670: `renderGameOver()` — animated panel with entry animation, ship+weapons display, count-up stats, crystal breakdown

## 33. UTILITIES (10962-10966)
- L10962: `normalizeAngle(angle)`

## 34. START GAME (10972-10983)
- L10972: `init()` call
