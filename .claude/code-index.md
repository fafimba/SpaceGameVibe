# index.html Code Index (~12158 lines)

Last updated: 2026-03-10

## File Structure
```
Lines 1-113:    HTML + CSS (styles, canvas, touch controls, upgradeCanvas)
Lines 114-119:  HTML body (canvas#game, canvas#upgradeCanvas, joystick)
Lines 120-12158: JavaScript IIFE
```

---

## 1. HTML/CSS (1-119)
- L12-113: `<style>` — CSS for body, canvas, touch controls, joystick, upgradeCanvas overlay
- L44-52: `#upgradeCanvas` — absolute positioned overlay canvas (display:none, pointer-events:none)
- L117-119: `<body>` — gameContainer, canvas#game, canvas#upgradeCanvas, touchControls

## 2. CONSTANTS (128-608)
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
- L201-206: `ENEMY_TYPES` — SCOUT, KAMIKAZE, TANK, ALIEN, BERSERKER, LEVIATHAN
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
- L608: `STARTING_WEAPON_IDS` — computed from WEAPONS (isStartingWeapon: true)

## 3. GAME STATE & VARIABLES (610-621)
- L614-617: Canvas (`ctx`), upgradeCanvas (`uCtx`), gameState (`menu | playing | paused | gameOver | skilltree | tutorial | shop | demoEnd`)

## 4. AUDIO SYSTEM (622-814)
- L628-662: `SOUND_DEFS` — sound definitions (playerShoot, enemyDeath, xpPickup, levelUp, playerHit)
- L664-814: `AudioManager` singleton — Web Audio API synth engine, volume/mute (localStorage), cooldowns, play(soundId)

## 5. GAME STATE VARIABLES continued (815-955)
- L815-819: Timing — `lastTime`, `deltaTime`, `timeScale`, `gameTime`, `totalKills`
- L823-827: Wave alert system

## 6. META-PROGRESSION (830-1106)
- L831: `PROGRESSION_SAVE_KEY`
- L832: `WEAPON_IDS` array
- L834: `calculateSkillFactor(runHistory)` — computes 0.75-1.25 factor from last 5 runs
- L856: `getDiffMultipliers()` — uses `playerSkillFactor` for enemyHP, speed, spawnRate, crystals, xp
- L868-875: `PERMANENT_UPGRADES`
- L876: `getUpgradeCost(upgradeKey, currentLevel)`
- L886: `createDefaultProgression()` — stats includes `bestKills: 0`
- L915: `loadProgression()` — includes `bestKills` migration (backfills from runHistory)
- L951: `saveProgression()`
- L960-979: **Full version flag**
- L981-1106: **Digital Goods API / Play Billing**
- L1164: `setGlow()` / L1171: `clearGlow()`
- L1098: **`drawShipPath(c, weaponId)`** — draws ship outline path (3 variants)
- L1126: **`drawShipUpgradeIcon(ctx, weaponId, cx, cy, scale, color)`**

## 7. GAME STATE VARIABLES continued (1153-1426)
- L1198-1270: Cheat codes — includes `skip` (+20 waves), `dead` (trigger game over), `cheat` (show cheat overlay)
- L1269-1272: Touch state
- L1275: Player
- L1277-1292: Entity arrays
- L1295-1308: Fusion beam state, Weapon state vars
- L1310-1318: Sentry turret state + `gameOverAnimStart` + `lastRunIsNewRecord` + `lastRunBestKills` + `showCheatOverlay`
- L1320-1323: Pause menu state — `currentPauseButtons`, `HAMBURGER_BTN`
- L1325-1336: Camera system
- L1335-1357: Upgrade state + `upgradeOverlay` object
- L1364: Performance — `separationFrame`
- L1377-1383: Effects — shake, flash, slowmo vars
- L1397: `shieldBreakState`, L1400: `lifeGainState`
- L1404: **Menu intro animation** vars

## 8. PERFORMANCE OPTIMIZATIONS (1427-1627)
- L1431-1499: Spatial grid
- L1540-1599: **Object pools**
- L1603-1612: `CULLING_DISTANCES`
- L1614: `lerpColor()`
- L1621: `fastRemove(array, index)`
- L1628-1699: Performance monitor, debug overlay

## 9. INITIALIZATION (1699-2179)
- L1699: `initBackgroundCache()`
- L1759: `resetMenuAnimation()`
- L1836: `updateMenuAnimation(dt)`
- L1942: `init()` — calls resizeCanvas(), `applyWeaponTheme()`, sets up upgradeCanvas
- L1962: `resizeCanvas()` — also sets `upgradeCanvas.width/height`
- L1983: `generateBackground()`
- L1998: `startGame()`
- L2016: `finishMenuExit()`
- L2052: `resetGame()` — calls `applyWeaponTheme(selectedStartingWeapon)`, resets `lastRunIsNewRecord`/`lastRunBestKills`

## 10. INPUT HANDLING (2231-2538)
- L2234: `setupInput()` — includes AudioManager.init() on first keydown, cheat overlay dismissal, canvas click handler; weapon cycling calls `applyWeaponTheme()`
- L2355: `updateInput()`
- L2370: `setupTouchControls()` — AudioManager.init() on first touch, routes touch to `handleUpgradeClick()` during skilltree

## 11. COORDINATE SYSTEM (2538-2574)
- L2539: `worldToScreen()`
- L2547: `screenToWorld()`
- L2555: `isInView()`
- L2564: `shouldRenderEntity()`

## 12. SECTOR BOUNDARY SYSTEM (2575-2705)
- L2575: `checkSectorBoundary()`
- L2609: `transportEntities()`

## 13. CAMERA UPDATE (2706-2719)
- L2706: `updateCamera()`

## 14. GAME LOOP (2720-2856)
- L2720: `gameLoop(timestamp)` — updates upgradeOverlay.animTime during skilltree state
- L2771: `update(rawDt)`

## 15. SHIELD ARC STATE MACHINE (2857-2922)
- L2857: `updateShieldArcState(deltaTime)`

## 16. PLAYER SYSTEM (2923-4043)
- L2923: `updatePlayer()` — includes shield recharge animation logic
- L3082: `getWeaponStats()` — **cached per frame** via `_cachedStats`/`_statsFrameId`/`_frameCounter`; `invalidateStatsCache()` to force recalc
- L3438: `hasEnemyInAimCone()`
- L3460: `fireBullet()` — plays `playerShoot` sound
- L3597: `fireNovaBeam()`
- L3651: `fireRocket()`
- L3742: `fireArmageddonMissile()`
- L3806: `fireLightning()`
- L3932: `spawnAlienDrone()`
- L3967: `spawnThrusterParticle()`

## 17. BULLETS (4044-4183)
- L4044: `updateBullets()`

## 18. ALIEN DRONES (4184-4341)
- L4184: `updateDrones()`

## 19. ENEMIES (4342-4901)
- L4342: `updateOverwhelmCheck()` — mid-run safety valve
- L4355: `updateSpawnSystem()`
- L4398: `spawnWave()`
- L4474: `getSpawnType()` — BERSERKER from 8min, LEVIATHAN from 12min
- L4522: `spawnEnemy()` — resets all debuff properties
- L4578: `updateEnemies()` — slow applied to target speed (not velocity), BERSERKER has push immunity + slow resistance + trail
- L4737: `updateEnemyBullets()`
- L4762: `killEnemy(enemy)` — plays `enemyDeath` sound, **mark-and-sweep**, LEVIATHAN→4 ALIENs, ALIEN→5 TANKs, TANK→2 SCOUTs
- L4886: `sweepDeadEnemies()`

## 20. PICKUPS (4902-5011)
- L4902: `spawnPickup()`
- L4925: `updatePickups()` — plays `xpPickup` sound on collection

## 21. XP & LEVEL SYSTEM (5012-5747)
- L5012: `collectXP(amount)`
- L5047: `levelUp(levelsGained)` — plays `levelUp` sound
- L5064: `getAvailableUpgrades()`
- L5122: `allSkillsUnlocked()`
- L5141: `generateUpgradeOptions()`
- L5149: `drawSkillIcon(ctx, icon, cx, cy, color)` — large icon library (~500 lines)

## 22. CANVAS UPGRADE OVERLAY (5747-6419) — Two-Canvas Architecture
- L5747: `easeOutCubic()`, `easeOutQuart()` — easing functions
- L5751: `showUpgradePanel()`
- L5809: `renderUpgradeOverlay()`
- L5950: `drawUpgradeConnectionLine()`
- L6022: `drawUpgradePartialPath()`
- L6042: `getUpgradePathPoint()`
- L6058: `renderWeaponInventoryBar()`
- L6149: `renderUpgradeCard()`
- L6353: `handleUpgradeClick()`
- L6369: `selectUpgrade(option)`
- L6419: `hideUpgradePanel()`

## 23. WEAPON SYSTEMS (6436-6690)
- L6436: `updateWeapons()`
- L6473: `updateLightningEffects()`
- L6484: `updateNovaBeamEffects()`
- L6494: `updateOrbitals()`
- L6558: `updateAura()`
- L6621: `triggerAnnihilationExplosion()`

## 24. VOID BLADE SYSTEM (6690-6884)
- L6690: `updateVoidBlade()`
- L6765: `performBlastDamage()`
- L6834: `updateRiftZones()`
- L6866: `updateSlashEffects()`

## 25. WARP SNARE SYSTEM (6884-7082)
- L6884: `updateWarpSnares()`

## 26. GRAVITY MINES SYSTEM (7082-7245)
- L7082: `updateGravityMines()`

## 27. SENTRY TURRET SYSTEM (7245-7438)
- L7245: `updateSentryTurrets()`

## 28. FUSION BEAM SYSTEM (7438-7628)
- L7438: `updateFusionBeam()` — chain beams use sequential nearest-enemy logic
- L7597: `handleBeamKill(enemy, stats)`

## 29. ROCKET EXPLOSION (7628-7711)
- L7628: `explodePlayerRocket()`

## 30. COLLISIONS (7711-7889)
- L7711: `lineCircleCollision()`
- L7749: `checkCollisions()`

## 31. PLAYER DAMAGE & DEATH (7889-8224)
- L7890: `damagePlayer()` — plays `playerHit` sound, shield set to 0 on break
- L7926: `triggerShieldBreak()`
- L7950: `updateShieldBreakSequence(rawDt)` — lifeslots phase 0.95s with pop animation timeline
- L8047: `triggerLifeGain()`
- L8059: `updateLifeGainAnimation(rawDt)`
- L8087: `triggerNearMiss()`
- L8107: `gameOver()` — tracks `bestKills`, saves `lastRunIsNewRecord`/`lastRunBestKills`, closes upgrade panel, saves run history, sets `gameOverAnimStart`
- L8181: `spawnDeathExplosion()`

## 32. PARTICLES & EFFECTS (8224-8344)
- L8225: `spawnRing(x, y, color, maxSize)`
- L8241: `spawnFloatingText()`
- L8253: `updateParticles()`
- L8286: `updateFloatingTexts()`
- L8300: `updateEffects()`
- L8321: `triggerShake()`
- L8327: `triggerFlash()`
- L8334: `triggerSlowmo()`

## 33. RENDERING (8345-10119)
- L8345: `render()` — during skilltree: early return, calls `renderUpgradeOverlay()` directly on uCtx
- L8422: `renderBackground()`
- L8497: `renderShieldArc()` — **segmented bars**
- L8559: `renderShieldBreakEffects()`
- L8653: `renderLifeGainEffects()`
- L8721: `renderPlayer()` — uses `drawShipPath(ctx, selectedStartingWeapon)`
- L8803: `renderAura()`
- L8862: `renderFusionBeam()`
- L9023: `renderOrbitals()`
- L9053: `renderLightning()`
- L9093: `renderNovaBeam()`
- L9125: `renderBullets()` — rockets use capsule shape + detached trail
- L9374: `renderEnemyBullets()`
- L9392: `renderDrones()`
- L9489: `renderEnemies()` — batch renders SCOUT, KAMIKAZE, TANK, ALIEN, BERSERKER, LEVIATHAN
- L9737: `renderPickups()`
- L9781: `renderParticles()`
- L9867: `renderFloatingTexts()`
- L9891: `renderTurrets()`
- L9987: `renderMines()`
- L10119: `renderSnares()` — per-hex scale animation
- L10299: `renderSlashEffects()`
- L10350: `renderRiftZones()`
- L10378: `drawUpgradeIcon(ctx, upgradeKey, cx, cy, color, size)`
- L10444: `drawVerticalProgressBars()`
- L10453: `drawWeaponIconAt()`

## 34. UI RENDERING (10617-11939)
- L10617: `renderUI()` — renders cheat overlay on top when `showCheatOverlay` is true
- L10640: `renderMenu()` — includes inline shop, best kills record display, uses `drawShipPath` for ship
- L11096: `renderArsenalGallery()` — uses dynamic `WEAPONS[id].color`
- L11177: `renderControlsHelp(startY)`
- L11213: `renderHUD()` — hamburger menu (top-left), kills counter (center), life icons (right), level inside XP bar
- L11425: `renderTutorial()`
- L11536: `handleMenuClick(clickX, clickY)` — weapon cycling calls `applyWeaponTheme()`
- L11584: `renderDemoEnd()`
- L11688: `handleDemoEndClick(clickX, clickY)`
- L11706: `handlePauseClick(clickX, clickY)` — handles pause menu button clicks
- L11728: `renderPauseWeaponInventory(cx, y)` — draws weapon inventory slots on main ctx
- L11791: `renderPauseOverlay()` — panel with weapon inventory + RESUME/RESTART/EXIT buttons
- L11869: **`renderCheatOverlay()`** — modal listing all cheat codes with descriptions, neon style
- L11939: `renderGameOver()` — animated panel: kills as hero stat (54px, glow), NEW RECORD celebration, secondary stats row (level/wave/crystals)

## 35. UTILITIES (12137)
- L12137: `normalizeAngle(angle)`

## 36. START GAME (12139-12158)
- L12147: `init()` call
