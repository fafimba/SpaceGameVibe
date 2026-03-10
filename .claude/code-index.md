# index.html Code Index (~12348 lines)

Last updated: 2026-03-10

## File Structure
```
Lines 1-113:    HTML + CSS (styles, canvas, touch controls, upgradeCanvas)
Lines 114-119:  HTML body (canvas#game, canvas#upgradeCanvas, joystick)
Lines 120-12348: JavaScript IIFE
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

## 4. AUDIO SYSTEM (622-982)
- L628-816: `SOUND_DEFS` — full sound catalog (33 sounds): playerShoot, rocketFire, rocketExplode, lightningZap, voidSlash, fusionBeam, orbitalHit, auraHit, droneFire, turretFire, mineExplode, snareActivate, novaBeamFire, armageddonLaunch, armageddonExplode, annihilationPulse, hiveMindSpawn, playerHit, shieldBreak, shieldRecharge, playerDeath, nearMiss, xpPickup, healthPickup, levelUp, upgradeSelect, uiClick, gameStart, waveAlert, pauseIn, pauseOut, enemyDeath, enemyShoot, kamikazeCharge, leviathanSpawn, tankSplit
- L818-982: `AudioManager` singleton — Web Audio API synth engine with filter support (lowpass/highpass), volume/mute (localStorage), cooldowns, play(soundId), multi-note sounds

## 5. GAME STATE VARIABLES continued (983-990)
- L983-987: Timing — `lastTime`, `deltaTime`, `timeScale`, `gameTime`, `totalKills`

## 6. META-PROGRESSION (990-1268)
- L990: `PROGRESSION_SAVE_KEY`
- L991: `WEAPON_IDS` array
- L993: `calculateSkillFactor(runHistory)` — computes 0.75-1.25 factor from last 5 runs

## 7. GAME STATE VARIABLES continued (1268-1590)
- Cheat codes, Touch state, Player, Entity arrays, Weapon state, Camera, Upgrade state, Effects

## 8. PERFORMANCE OPTIMIZATIONS (1590-1795)
- Spatial grid, Object pools, CULLING_DISTANCES, lerpColor, fastRemove, Performance monitor

## 9. INITIALIZATION (1795-2394)
- L2128: `init()`
- L2204: `startGame()` — plays `gameStart` sound
- L2230: `finishMenuExit()`
- L2244: `resetGame()`

## 10. INPUT HANDLING (2394-2710)
- L2395: `setupInput()` — AudioManager.init() on first keydown, pauseIn/pauseOut sounds on Escape
- L2520: `updateInput()`
- L2535: `setupTouchControls()` — AudioManager.init() on first touch, pauseIn on hamburger

## 11. COORDINATE SYSTEM (2710-2746)
- L2711: `worldToScreen()`
- L2719: `screenToWorld()`
- L2727: `isInView()`
- L2736: `shouldRenderEntity()`

## 12. SECTOR BOUNDARY SYSTEM (2747-2877)
- L2747: `checkSectorBoundary()`
- L2781: `transportEntities()`

## 13. CAMERA UPDATE (2878-2891)
- L2878: `updateCamera()`

## 14. GAME LOOP (2880-3022)
- L2880: `gameLoop(timestamp)`
- L2937: `update(rawDt)`

## 15. SHIELD ARC STATE MACHINE (3023-3088)
- L3023: `updateShieldArcState(deltaTime)`

## 16. PLAYER SYSTEM (3089-4215)
- L3089: `updatePlayer()` — shieldRecharge sound on full shield
- L3249: `getWeaponStats()`
- L3627: `fireBullet()` — plays `playerShoot`
- L3760: `fireNovaBeam()` — plays `novaBeamFire`
- L3815: `fireRocket()` — plays `rocketFire`
- L3907: `fireArmageddonMissile()` — plays `armageddonLaunch`
- L3971: `fireLightning()` — plays `lightningZap`
- L4099: `spawnAlienDrone()` — plays `hiveMindSpawn`
- L4135: `spawnThrusterParticle()`

## 17. BULLETS (4216-4355)
- L4216: `updateBullets()`

## 18. ALIEN DRONES (4356-4513)
- L4356: `updateDrones()`

## 19. ENEMIES (4514-5078)
- L4514: `updateOverwhelmCheck()` — mid-run safety valve
- L4527: `updateSpawnSystem()`
- L4570: `spawnWave()` — plays `waveAlert`
- L4646: `getSpawnType()` — BERSERKER from 8min, LEVIATHAN from 12min
- L4694: `spawnEnemy()` — plays `leviathanSpawn` for LEVIATHAN type
- L4751: `updateEnemies()`
- L4909: `updateEnemyBullets()`
- L4936: `killEnemy(enemy)` — plays `enemyDeath`, `leviathanSpawn` on split, `tankSplit` on tank/alien split
- L5065: `sweepDeadEnemies()`

## 20. PICKUPS (5079-5188)
- L5079: `spawnPickup()`
- L5102: `updatePickups()` — plays `healthPickup` or `xpPickup` based on type

## 21. XP & LEVEL SYSTEM (5189-5884)
- L5189: `collectXP(amount)`
- L5224: `levelUp(levelsGained)` — plays `levelUp`
- L5241: `getAvailableUpgrades()`
- L5299: `allSkillsUnlocked()`
- L5318: `generateUpgradeOptions()`
- L5326: `drawSkillIcon(ctx, icon, cx, cy, color)` — large icon library (~500 lines)

## 22. CANVAS UPGRADE OVERLAY (5885-6574) — Two-Canvas Architecture
- L5885: `easeOutCubic()`, `easeOutQuart()`
- L5889: `showUpgradePanel()`
- L5947: `renderUpgradeOverlay()`
- L6491: `handleUpgradeClick()`
- L6507: `selectUpgrade(option)` — plays `upgradeSelect`
- L6558: `hideUpgradePanel()`

## 23. WEAPON SYSTEMS (6575-6831)
- L6575: `updateWeapons()`
- L6612: `updateLightningEffects()`
- L6623: `updateNovaBeamEffects()`
- L6633: `updateOrbitals()` — plays `orbitalHit` on enemy hit
- L6697: `updateAura()` — plays `auraHit` on damage tick
- L6747: `triggerAnnihilationExplosion()` — plays `annihilationPulse` on depth 0

## 24. VOID BLADE SYSTEM (6831-7026)
- L6832: `updateVoidBlade()` — plays `voidSlash`
- L6909: `performBlastDamage()`
- L6978: `updateRiftZones()`
- L7010: `updateSlashEffects()`

## 25. WARP SNARE SYSTEM (7026-7224)
- L7027: `updateWarpSnares()`

## 26. GRAVITY MINES SYSTEM (7224-7432)
- L7190: `detonateMine()` — plays `mineExplode`
- L7270: `updateGravityMines()`

## 27. SENTRY TURRET SYSTEM (7432-7626)
- L7433: `updateSentryTurrets()` — plays `turretFire` on bullet fire

## 28. FUSION BEAM SYSTEM (7626-7817)
- L7627: `updateFusionBeam()` — plays `fusionBeam` on damage tick
- L7786: `handleBeamKill(enemy, stats)`

## 29. ROCKET EXPLOSION (7817-7901)
- L7818: `explodePlayerRocket()` — plays `rocketExplode` or `armageddonExplode`

## 30. COLLISIONS (7901-8075)
- L7902: `lineCircleCollision()`
- L7935: `checkCollisions()`

## 31. PLAYER DAMAGE & DEATH (8075-8413)
- L8076: `damagePlayer()` — plays `playerHit`
- L8112: `triggerShieldBreak()` — plays `shieldBreak`
- L8138: `updateShieldBreakSequence(rawDt)`
- L8235: `triggerLifeGain()`
- L8247: `updateLifeGainAnimation(rawDt)`
- L8274: `triggerNearMiss()` — plays `nearMiss`
- L8295: `gameOver()` — plays `playerDeath`
- L8370: `spawnDeathExplosion()`

## 32. PARTICLES & EFFECTS (8413-8533)
- L8414: `spawnRing(x, y, color, maxSize)`
- L8430: `spawnFloatingText()`
- L8442: `updateParticles()`
- L8475: `updateFloatingTexts()`
- L8489: `updateEffects()`
- L8510: `triggerShake()`
- L8516: `triggerFlash()`
- L8523: `triggerSlowmo()`

## 33. RENDERING (8534-10308)
- L8534: `render()`
- L8611: `renderBackground()`
- L8686: `renderShieldArc()` — **segmented bars**
- L8748: `renderShieldBreakEffects()`
- L8842: `renderLifeGainEffects()`
- L8910: `renderPlayer()` — uses `drawShipPath(ctx, selectedStartingWeapon)`
- L8992: `renderAura()`
- L9051: `renderFusionBeam()`
- L9212: `renderOrbitals()`
- L9242: `renderLightning()`
- L9282: `renderNovaBeam()`
- L9314: `renderBullets()` — rockets use capsule shape + detached trail
- L9563: `renderEnemyBullets()`
- L9581: `renderDrones()`
- L9678: `renderEnemies()` — batch renders SCOUT, KAMIKAZE, TANK, ALIEN, BERSERKER, LEVIATHAN
- L9926: `renderPickups()`
- L9970: `renderParticles()`
- L10056: `renderFloatingTexts()`
- L10080: `renderTurrets()`
- L10176: `renderMines()`
- L10308: `renderSnares()` — per-hex scale animation

## 34. UI RENDERING (10778-12126)
- L10778: `renderUI()`
- L10801: `renderMenu()` — includes inline shop, best kills record display
- L11285: `renderArsenalGallery()`
- L11366: `renderControlsHelp(startY)`
- L11402: `renderHUD()` — hamburger menu, kills counter, life icons, level inside XP bar
- L11614: `renderTutorial()`
- L11690: `handleMenuClick(clickX, clickY)` — weapon cycling
- L11738: `renderDemoEnd()`
- L11842: `handleDemoEndClick(clickX, clickY)`
- L11863: `handlePauseClick(clickX, clickY)` — pauseOut on resume
- L11885: `renderPauseWeaponInventory(cx, y)`
- L11948: `renderPauseOverlay()`
- L12026: **`renderCheatOverlay()`**
- L12096: `renderGameOver()`

## 35. UTILITIES (12327)
- L12327: `normalizeAngle(angle)`

## 36. START GAME (12329-12348)
- L12337: `init()` call
