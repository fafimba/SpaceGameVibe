# index.html Code Index (~13520 lines)

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

## 5. ADAPTIVE DIFFICULTY & GAME STATE (1397-1416)
- L1397-1405: Adaptive difficulty constants — `KILL_WINDOW`, `FIRST_RUN_VIRTUAL_TARGET`, `MIN_EFFECTIVE_BEST_KILLS`, `RECORD_CRUISE_THRESHOLD`, `FIRST_RUN_GRACE_SECONDS`, `FIRST_RUN_GRACE_MULT`, `FIRST_RUN_SKILL_FACTOR`, `WAVE_SIZE_CAP`
- L1407-1412: Adaptive difficulty state — `recentKillTimestamps`, `killRate`, `killEfficiency`, `effectiveBestKills`, `recordProgress`, `isFirstRun`
- L1413: `playerSkillFactor`
- L1415+: Timing — `lastTime`, `deltaTime`, `timeScale`, `gameTime`

## 5B. DIFFICULTY FUNCTIONS (1451-1504)
- L1451: `getDiffMultipliers()` — base difficulty from playerSkillFactor
- L1462: `getAdaptiveMultipliers()` — returns `{ spawnMult, hpMult }` based on recordProgress + killEfficiency + first-run grace

## 6. META-PROGRESSION (1468-1751)
- L1468: `PROGRESSION_SAVE_KEY`
- L1469: `WEAPON_IDS` array

## 7. GAME STATE VARIABLES continued (1751-2074)
- Cheat codes, Touch state, Player, Entity arrays, Weapon state, Camera, Upgrade state, Effects

## 8. PERFORMANCE OPTIMIZATIONS (2074-2279)
- Spatial grid, Object pools, CULLING_DISTANCES, lerpColor, fastRemove, Performance monitor

## 9. INITIALIZATION (2282-2900)
- L2608: `init()`
- L2689: `startGame()` — plays `gameStart` sound, sets DroneEngine to playing_calm
- L2725: `resetGame()` — calls `AudioManager.stopAllLoops()`, resets kill rate + record progress, caches bestKills

## 10. INPUT HANDLING (2885-3248)
- L2885: `_initAudioOnInteraction()` — shared helper: AudioManager.init() + resume() + DroneEngine.init()/start()
- L2897: `setupInput()` — global touchstart listener (once) + keydown/click init audio, pauseIn/pauseOut sounds on Escape
- L3054-3134: Volume slider drag support (SFX + Music sliders, mouse + touch)

## 11. COORDINATE SYSTEM (3240-3276)
- L3247: `worldToScreen()`

## 12. SECTOR BOUNDARY SYSTEM (3276-3413)
- L3283: `checkSectorBoundary()`

## 13. CAMERA UPDATE (3413-3427)
- L3420: `updateCamera()`

## 14. GAME LOOP (3427-3578)
- L3434: `gameLoop(timestamp)` — includes volume ducking, drone state sync, stopAllLoops on pause/skilltree

## 15. SHIELD ARC STATE MACHINE (3578-3644)
- L3593: `updateShieldArcState(deltaTime)`

## 16. PLAYER SYSTEM (3644-4771)
- L3659: `updatePlayer()` — shieldRecharge sound on full shield
- L3819: `getWeaponStats()`
- L4197: `fireBullet()` — plays `playerShoot`

## 17. BULLETS (4771-4911)
- L4786: `updateBullets()`

## 18. ALIEN DRONES (4911-5069)
- L4926: `updateDrones()`

## 19. ENEMIES (5066-5653)
- L5081: `updateOverwhelmCheck()` — mid-run safety valve
- L5094: `updateSpawnSystem()` — caches adaptive multipliers, applies adaptive.spawnMult to spawn timer
- L5237: `spawnWave()` — applies adaptive.spawnMult to wave size (WAVE_SIZE_CAP), adaptive.hpMult to wave enemy HP
- L5377: `spawnEnemy()` — applies adaptiveMult.hpMult to normal spawn HP
- L5605: `killEnemy(enemy)` — tracks kill timestamps for adaptive difficulty

## 20. PICKUPS (5656-5759)

## 21. XP & LEVEL SYSTEM (5759-6459)
- L5774: `collectXP(amount)`
- L5809: `levelUp(levelsGained)` — plays `levelUp`

## 22. CANVAS UPGRADE OVERLAY (6459-7145) — Two-Canvas Architecture
- L6474: `showUpgradePanel()`

## 23. WEAPON SYSTEMS (7145-7402)
- L7162: `updateWeapons()`

## 24. VOID BLADE SYSTEM (7402-7597)
- L7419: `updateVoidBlade()` — plays `voidSlash`

## 25. WARP SNARE SYSTEM (7597-7798)
- L7614: `updateWarpSnares()`

## 26. GRAVITY MINES SYSTEM (7798-8003)
- L7857: `updateGravityMines()`

## 27. SENTRY TURRET SYSTEM (8003-8197)
- L8020: `updateSentryTurrets()` — plays `turretFire` on bullet fire

## 28. FUSION BEAM SYSTEM (8197-8394)
- L8214: `updateFusionBeam()` — starts/stops `fusionBeamLoop` looping sound based on active targets
- L8361: `handleBeamKill(enemy, stats)`

## 29. ROCKET EXPLOSION (8394-8478)
- L8411: `explodePlayerRocket()` — plays `rocketExplode` or `armageddonExplode`

## 30. COLLISIONS (8478-8652)
- L8528: `checkCollisions()`

## 31. PLAYER DAMAGE & DEATH (8652-8991)
- L8669: `damagePlayer()` — plays `playerHit`
- L8888: `gameOver()` — calls `AudioManager.stopAllLoops()`, plays `playerDeath`, sets DroneEngine to gameOver

## 32. PARTICLES & EFFECTS (8991-9111)
- L9009: `spawnRing(x, y, color, maxSize)`

## 33. RENDERING (9111-10886)
- L9129: `render()`

## 34. UI RENDERING (11447-13037)
- L11447: `renderUI()`
- L11470: `renderMenu()` — main menu; `menuMode='settings'` renders sound sliders via `currentPauseButtons`
- L12610: `handleMenuClick()` — handles play, shop, settings, back, upgrade, weapon arrows
- L12785: `handlePauseClick()` — volume/music sliders, mute toggles, resume/restart/exit
- L12897: `renderPauseOverlay()` — SFX + Music volume sliders + action buttons

## 35. UTILITIES (13453)
- L13453: `normalizeAngle(angle)`

## 36. START GAME (13466+)
- `init()` call
