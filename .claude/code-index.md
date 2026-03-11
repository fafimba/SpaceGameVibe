# index.html Code Index (~13510 lines)

Last updated: 2026-03-11

## File Structure
```
Lines 1-145:    HTML + CSS (styles, canvas, touch controls, upgradeCanvas, landscape blocker)
Lines 146-157:  HTML body (landscapeBlocker, gameContainer, canvas#game, canvas#upgradeCanvas, joystick)
Lines 158-13510+: JavaScript IIFE
```

---

## 1. HTML/CSS (1-157)
- L12-143: `<style>` — CSS for body, canvas, touch controls, joystick, upgradeCanvas overlay, landscape blocker
- L44-52: `#upgradeCanvas` — absolute positioned overlay canvas (display:none, pointer-events:none)
- L108-142: `#landscapeBlocker` — CSS for mobile landscape orientation blocker overlay
- L146-157: `<body>` — landscapeBlocker, gameContainer, canvas#game, canvas#upgradeCanvas, touchControls

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

## 4B. MUSIC ENGINE — MIDI Melody Synthesizer (1158-1330)
- L1161-1172: `MUSIC_DATA` — parsed MIDI note arrays per song (menu: "Silent Orbits" 82.52 BPM 3 voices, calm: "Stellar Drift Loop" 110 BPM 5 voices)
- L1174-1330: `MusicEngine` singleton — schedules sine oscillators from MIDI data, 3 envelope types (plucked/balanced/pad), sub-octave bass, auto-loop, currentSongId tracking, music volume/mute controls (separate from SFX), localStorage persistence
  - `init(audioCtx)` — creates musicGain → destination, loads saved volume, creates masterGain
  - `setMusicVolume(v)` / `getMusicVolume()` / `toggleMusicMute()` / `isMusicMuted()` — music volume controls
  - `play(songId)` / `stop()` — start/stop song playback, tracks currentSongId
  - `_schedule()` — look-ahead scheduler (80ms interval, 500ms window)
  - `_playNote()` — generic note synth: plucked (fast attack, exp decay), balanced (moderate), pad (slow attack, detuned 2nd osc)

## 5. ADAPTIVE DIFFICULTY & GAME STATE (1332-1400)
- L1403: Adaptive difficulty constants — `KILL_WINDOW`, `FIRST_RUN_VIRTUAL_TARGET`, `MIN_EFFECTIVE_BEST_KILLS`, `RECORD_CRUISE_THRESHOLD`, `FIRST_RUN_GRACE_SECONDS`, `FIRST_RUN_GRACE_MULT`, `FIRST_RUN_SKILL_FACTOR`, `WAVE_SIZE_CAP`

## 5B. DIFFICULTY FUNCTIONS (1456-1480)
- L1456: `getDiffMultipliers()` — base difficulty from playerSkillFactor
- L1467: `getAdaptiveMultipliers()` — returns `{ spawnMult, hpMult }` based on recordProgress + killEfficiency + first-run grace

## 6. META-PROGRESSION (1429-1700)
- L1431: `PROGRESSION_SAVE_KEY`

## 7. GAME STATE VARIABLES continued (1700-2149)
- Cheat codes, Touch state, Player, Entity arrays, Weapon state, Camera, Upgrade state, Effects

## 8. PERFORMANCE OPTIMIZATIONS (2149-2420)
- Spatial grid, Object pools, CULLING_DISTANCES, lerpColor, fastRemove, Performance monitor

## 9. INITIALIZATION (2420-2924)
- L2723: `startGame()` — plays `gameStart` sound, starts MusicEngine 'calm'
- L2760: `resetGame()` — calls `AudioManager.stopAllLoops()`, resets kill rate + record progress, caches bestKills

## 10. INPUT HANDLING (2924-3330)
- L2927: `_initAudioOnInteraction()` — shared helper: AudioManager.init() + resume() + MusicEngine.init()/play('menu')
- Volume slider drag support (SFX + Music sliders, mouse + touch)

## 11. COORDINATE SYSTEM (3330-3367)

## 12. SECTOR BOUNDARY SYSTEM (3367-3504)

## 13. CAMERA UPDATE (3504-3518)

## 14. GAME LOOP (3518-3678)
- L3521: `gameLoop(timestamp)` — includes volume ducking, MusicEngine song sync (menu/calm/stop by state), stopAllLoops on pause/skilltree

## 15. SHIELD ARC STATE MACHINE (3678-3747)

## 16. PLAYER SYSTEM (3747-4871)
- L3747: `updatePlayer()` — shieldRecharge sound on full shield
- L3907: `getWeaponStats()`

## 17. BULLETS (4871-5011)

## 18. ALIEN DRONES (5011-5168)

## 19. ENEMIES (5168-5751)

## 20. PICKUPS (5751-5861)

## 21. XP & LEVEL SYSTEM (5861-6460)

## 22. CANVAS UPGRADE OVERLAY (6460-7150) — Two-Canvas Architecture

## 23. WEAPON SYSTEMS (7240-7497)
- L7240: `updateWeapons()`

## 24. VOID BLADE SYSTEM (7497-7692)

## 25. WARP SNARE SYSTEM (7692-7871)

## 26. GRAVITY MINES SYSTEM (7871-8104)

## 27. SENTRY TURRET SYSTEM (8104-8298)

## 28. FUSION BEAM SYSTEM (8298-8495)

## 29. ROCKET EXPLOSION (8495-8577)

## 30. COLLISIONS (8577-8760)

## 31. PLAYER DAMAGE & DEATH (8760-9092)
- `gameOver()` — calls `AudioManager.stopAllLoops()`, plays `playerDeath`, stops MusicEngine

## 32. PARTICLES & EFFECTS (9092-9216)

## 33. RENDERING (9216-10900)
- L9219: `render()`

## 34. UI RENDERING (11520-13100)
- L11520: `renderUI()`

## 35. UTILITIES (13522)
- L13525: `normalizeAngle(angle)`

## 36. START GAME (13532+)
- `init()` call
