# index.html Code Index (~13415 lines)

Last updated: 2026-03-10

## File Structure
```
Lines 1-113:    HTML + CSS (styles, canvas, touch controls, upgradeCanvas)
Lines 114-119:  HTML body (canvas#game, canvas#upgradeCanvas, joystick)
Lines 120-12700+: JavaScript IIFE
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

## 4. AUDIO SYSTEM (622-1155)
- L627-817: `SOUND_DEFS` — full sound catalog (33 sounds, modern neon minimalist style)
- L820-826: `SOUND_LIMITS` — max simultaneous instances per sound type (rate limiting)
- L827-832: `SOUND_COOLDOWNS` — per-sound cooldown overrides for high-frequency sounds
- L834-840: `SOUND_PRIORITY` — priority levels (critical sounds bypass rate limits)
- L842-1155: `AudioManager` singleton — Web Audio API synth engine, filter support, rate limiting, priority system, stereo panning (worldX), volume ducking (duck/unduck), volume/mute (localStorage), play(soundId, worldX), startLoop/stopLoop/stopAllLoops for continuous looping sounds (fusionBeamLoop)

## 4B. DRONE ENGINE — Adaptive Ambient Music (1157-1395)
- L1160-1167: `DRONE_STATES` — state presets (menu, playing_calm/tense/intense, skilltree, gameOver)
- L1169-1373: `DroneEngine` singleton — 3 oscillators (sine fundamental + fifth + triangle texture), LFO breathing, lowpass filter, adaptive states, music volume control (separate from SFX), localStorage persistence
  - `init(audioCtx, masterGain)` — creates audio node graph
  - `start()` / `stop()` — oscillator lifecycle + tension polling interval
  - `setState(state)` — smooth 2s transitions between drone states
  - `updateTension(value)` — maps 0-1 tension to playing sub-states
  - `setMusicVolume(v)` / `toggleMusicMute()` — independent music volume
- L1376-1395: `calculateMusicTension()` — enemy count, health ratio, time alive, wave number

## 5. GAME STATE VARIABLES continued (1397-1414)
- L1397-1402: Timing — `lastTime`, `deltaTime`, `timeScale`, `gameTime`, `totalKills`

## 6. META-PROGRESSION (1408-1691)
- L1408: `PROGRESSION_SAVE_KEY`
- L1409: `WEAPON_IDS` array

## 7. GAME STATE VARIABLES continued (1691-2014)
- Cheat codes, Touch state, Player, Entity arrays, Weapon state, Camera, Upgrade state, Effects

## 8. PERFORMANCE OPTIMIZATIONS (2014-2219)
- Spatial grid, Object pools, CULLING_DISTANCES, lerpColor, fastRemove, Performance monitor

## 9. INITIALIZATION (2219-2828)
- L2545: `init()`
- L2626: `startGame()` — plays `gameStart` sound, sets DroneEngine to playing_calm
- L2662: `resetGame()` — calls `AudioManager.stopAllLoops()`

## 10. INPUT HANDLING (2813-3174)
- L2813: `_initAudioOnInteraction()` — shared helper: AudioManager.init() + resume() + DroneEngine.init()/start()
- L2825: `setupInput()` — global touchstart listener (once) + keydown/click init audio, pauseIn/pauseOut sounds on Escape
- L2980-3060: Volume slider drag support (SFX + Music sliders, mouse + touch)

## 11. COORDINATE SYSTEM (3166-3202)
- L3173: `worldToScreen()`

## 12. SECTOR BOUNDARY SYSTEM (3202-3339)
- L3209: `checkSectorBoundary()`

## 13. CAMERA UPDATE (3339-3353)
- L3346: `updateCamera()`

## 14. GAME LOOP (3353-3504)
- L3360: `gameLoop(timestamp)` — includes volume ducking, drone state sync, stopAllLoops on pause/skilltree

## 15. SHIELD ARC STATE MACHINE (3504-3570)
- L3519: `updateShieldArcState(deltaTime)`

## 16. PLAYER SYSTEM (3570-4697)
- L3585: `updatePlayer()` — shieldRecharge sound on full shield
- L3745: `getWeaponStats()`
- L4123: `fireBullet()` — plays `playerShoot`

## 17. BULLETS (4697-4837)
- L4712: `updateBullets()`

## 18. ALIEN DRONES (4837-4995)
- L4852: `updateDrones()`

## 19. ENEMIES (4995-5567)
- L5010: `updateOverwhelmCheck()` — mid-run safety valve
- L5023: `updateSpawnSystem()`
- L5066: `spawnWave()` — plays `waveAlert`

## 20. PICKUPS (5567-5670)

## 21. XP & LEVEL SYSTEM (5670-6370)
- L5685: `collectXP(amount)`
- L5720: `levelUp(levelsGained)` — plays `levelUp`

## 22. CANVAS UPGRADE OVERLAY (6370-7056) — Two-Canvas Architecture
- L6385: `showUpgradePanel()`

## 23. WEAPON SYSTEMS (7056-7313)
- L7073: `updateWeapons()`

## 24. VOID BLADE SYSTEM (7313-7508)
- L7330: `updateVoidBlade()` — plays `voidSlash`

## 25. WARP SNARE SYSTEM (7508-7709)
- L7525: `updateWarpSnares()`

## 26. GRAVITY MINES SYSTEM (7709-7914)
- L7768: `updateGravityMines()`

## 27. SENTRY TURRET SYSTEM (7914-8108)
- L7931: `updateSentryTurrets()` — plays `turretFire` on bullet fire

## 28. FUSION BEAM SYSTEM (8108-8305)
- L8125: `updateFusionBeam()` — starts/stops `fusionBeamLoop` looping sound based on active targets
- L8272: `handleBeamKill(enemy, stats)`

## 29. ROCKET EXPLOSION (8305-8389)
- L8322: `explodePlayerRocket()` — plays `rocketExplode` or `armageddonExplode`

## 30. COLLISIONS (8389-8563)
- L8439: `checkCollisions()`

## 31. PLAYER DAMAGE & DEATH (8563-8902)
- L8580: `damagePlayer()` — plays `playerHit`
- L8799: `gameOver()` — calls `AudioManager.stopAllLoops()`, plays `playerDeath`, sets DroneEngine to gameOver

## 32. PARTICLES & EFFECTS (8902-9022)
- L8920: `spawnRing(x, y, color, maxSize)`

## 33. RENDERING (9022-10797)
- L9040: `render()`

## 34. UI RENDERING (11358-12948)
- L11358: `renderUI()`
- L11381: `renderMenu()` — main menu; `menuMode='settings'` renders sound sliders via `currentPauseButtons`
- L12521: `handleMenuClick()` — handles play, shop, settings, back, upgrade, weapon arrows
- L12696: `handlePauseClick()` — volume/music sliders, mute toggles, resume/restart/exit
- L12808: `renderPauseOverlay()` — SFX + Music volume sliders + action buttons

## 35. UTILITIES (13364)
- L13364: `normalizeAngle(angle)`

## 36. START GAME (13377+)
- `init()` call
