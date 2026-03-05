# Stellar Swarm — Claude Rules

## Rule 1: Use the Code Index Before Searching

Before searching or modifying `index.html`, **always read `.claude/code-index.md` first** to find the exact line range for what you need. Then read only that section of `index.html` instead of scanning the whole file.

Example workflow:
1. Need to modify enemy spawning? Read code-index → find "Enemies" section (L3197-3785) → read that range
2. Need to change weapon stats? Read code-index → find `getWeaponStats()` at L2265 → read from there

## Rule 2: Update the Code Index and Visual Catalog After Every Change

After **any** edit to `index.html`, you MUST update `.claude/code-index.md` immediately. A change is NOT complete until the index is updated.

Additionally, if the change involves **any visual element** (new entity, modified rendering, color change, new projectile type, new enemy, new effect, changed shape/stroke/glow), you MUST also update `visual-catalog.html` to reflect the change. The catalog must always match the game exactly.

What to update:
- **Added functions/constants** → add them to the index with their line number
- **Removed functions/constants** → remove them from the index
- **Line shifts** → update line numbers for the affected section AND all sections after it
- **Structural changes** → update section boundaries

Quick way: after editing, check the new line numbers of the section you modified and any section headers that follow it. Update those in the index.

## Rule 3: Use Skills for Specialized Tasks

When the task involves **visual/aesthetic changes** (UI panels, menus, colors, layouts, HUD design, animations, responsive design), use the `/ui-ux-design` skill before implementing.

When the task involves **gameplay mechanics or progression** (weapons, enemies, upgrades, balancing, difficulty, game loop, scoring, XP, crystal economy), use the `/game-design` skill before implementing.

When the task involves **gameplay implementation or optimization** (game loop, physics, collision detection, rendering, controls, audio, performance optimization, Canvas/WebGL, entity systems, spawning, movement), use the `/game-engine` skill (`.claude/skills/game-engine/SKILL.md`) before implementing.

## Rule 4: Visual Style — Neon Geometric Outline

The game has a strict visual identity. All new visual elements MUST follow it:

- **Outline-only rendering** — entities are empty shapes (stroke only, no fill). The neon color comes from the stroke itself, not gradients or fills. Inner detail strokes (thinner secondary outlines inside the shape, like scouts and tanks have) are encouraged for visual depth.
- **Simple geometric shapes** — triangles, circles, hexagons, diamonds. No complex sprites or detailed art.
- **No gradients on game entities** — flat neon colors with stroke. Background can use subtle gradients.
- **Glow (`shadowBlur`) is expensive** — only use it on elements that appear once or very few times (player ship, pickups). NEVER on enemies, bullets, or particles that appear in large quantities.
- **Minimal particles** — death effects use a simple expanding ring (circle stroke), not spark showers. Keep particle counts low. Prefer one clean ring over many small particles.
- **Color palette** defined in `COLORS` constant — cyan player, red enemies, gold UI, etc.
- **Visual clarity is critical** — hundreds of elements on screen at once, player navigating with physics. Must be instantly readable, never visually overwhelming:
  - **Friend/foe color coding**: everything player-related (ship, bullets, drones, orbitals, aura) shares the same cyan color. Enemies use warm/hostile tones (red, orange, magenta — derivados del rojo preferiblemente). This lets the player instantly distinguish threats from allies.
  - **Minimal pickups and clutter**: keep pickup types few and infrequent. Don't add floating items, collectibles, or visual noise that competes for attention with enemies and projectiles.
  - **Clean background**: keep backgrounds simple and dark. No detailed starfields, busy nebulae, or distracting background elements. The gameplay elements must pop against a quiet backdrop.

## Rule 5: Performance is a Priority

The game's identity is massive numbers of enemies and projectiles on screen simultaneously. Performance must be protected:

- **Particles**: minimize count. Prefer expanding ring (`spawnRing()`) over multiple small particles. No spark/shard explosions for frequent events.
- **Glow effects**: `shadowBlur` is the most expensive canvas operation. Banned on anything that appears >5 times on screen (enemies, bullets, enemy bullets, drones, particles). Only allowed on: player ship, pickups, HUD elements.
- **Batch rendering**: group entities by type in render functions (already done — maintain this pattern).
- **Spatial grid**: use `spatialGrid.queryRadius()` for all proximity checks, never iterate full arrays.
- **Object pools**: always use `pools.*` to acquire/release entities, never `new` or array push of plain objects.
- **Culling**: use `shouldRenderEntity()` / `CULLING_DISTANCES` to skip off-screen rendering.

## Rule 6: Sector Wrapping — New Entities Must Be Transported

The game uses an infinite world with sector wrapping. When the player crosses a sector boundary, `transportEntities()` offsets all entities to maintain continuity. **Any new entity array MUST be added to `transportEntities()`** or those entities will teleport away from the player on sector wrap.

Currently transported: `enemies`, `bullets`, `enemyBullets`, `particles`, `pickups`, `drones`, `floatingTexts`, `nebulas`, `lightningEffects`, `novaBeamEffects`.
**BUG — currently missing**: `orbitals`. *(Remove this line when fixed.)*

## Rule 7: Mobile Compatibility

The game supports both desktop (keyboard/mouse) and mobile (touch/joystick). Every new UI screen, button, or interaction MUST work on both:
- Use `isMobile()` to branch layouts when needed (shop and tutorial already do this)
- Click handlers must account for canvas scaling (`getBoundingClientRect` + scale factors)
- Touch-friendly hit targets (large enough buttons, no hover-only interactions)

## Rule 8: No Build System (Web) + TWA for Android

Single HTML file, no npm/bundler/tests. To verify web changes: open `index.html` in a browser.

### Android Distribution — TWA (Trusted Web Activity)

The game is packaged as a native Android app via **TWA** (not Capacitor). TWA wraps the GitHub Pages-hosted game (`https://fafimba.github.io/SpaceGameVibe/index.html`) inside Chrome, making it appear as a native app with no browser UI.

**Project structure**:
- `app/` — TWA project (the one we build and publish to Google Play)
- `android/` — Capacitor project (kept as backup, **not used** currently — ignore it)

**Key TWA files**:
- `app/build.gradle` — `twaManifest` config (host, colors, splash, signing)
- `app/src/main/AndroidManifest.xml` — activities, display mode (`immersive`), Digital Asset Links
- `app/src/main/java/io/github/fafimba/twa/LauncherActivity.java` — launch + fullscreen setup
- `.well-known/assetlinks.json` — Digital Asset Links (deployed to GitHub Pages, must match signing key fingerprint)
- `manifest.json` — PWA manifest (display: fullscreen, orientation: portrait)
- `keystore.properties` — signing credentials (references `stellar-swarm-release.keystore`)

**Building**:
```bash
./gradlew bundleRelease    # → app/build/outputs/bundle/release/app-release.aab
./gradlew assembleRelease  # → app/build/outputs/apk/release/app-release.apk
```

**IMPORTANT — Bump version before every build uploaded to Google Play**: Google Play rejects AABs with a previously used `versionCode`. Before building, increment `versionCode` (integer, must always go up) and `versionName` (display string) in `app/build.gradle` → `defaultConfig`.

**Game updates don't require a new APK** — just push to GitHub Pages. TWA loads the live website. Only rebuild the APK/AAB when changing native config (splash, icons, manifest, signing, etc.).

## Rule 9: Architecture Quick Reference

Single-file game: `index.html` (~7,500 lines). Canvas-based with camera system.

**Game States**: `menu` | `playing` | `paused` | `gameOver` | `skilltree` | `tutorial` | `shop`

**Entity Arrays**: `bullets`, `enemies`, `enemyBullets`, `particles`, `floatingTexts`, `pickups`, `orbitals`, `lightningEffects`, `novaBeamEffects`, `drones`

**Object Pools**: `pools.bullet`, `pools.enemy`, `pools.particle`, `pools.enemyBullet`, `pools.floatingText`, `pools.pickup`, `pools.drone`

**Weapon System**: 6 weapons × 3 branches × 3 levels + evolutions. `WEAPONS` object defines all. `activeWeapons[]` = weapons this run. `upgradeLevels{}` = branch upgrade levels. `getWeaponStats()` computes everything.

**Progression**: `loadProgression()`/`saveProgression()` for localStorage. `cachedProgression` loaded once per run in `resetGame()`. `PERMANENT_UPGRADES` (5 types, 0-10 levels). `WEAPON_PURCHASE_REQUIREMENTS` for shop.

**Coordinate System**: `worldToScreen()`/`screenToWorld()`. Render functions inside camera transform use world coords directly.

**Key Patterns**:
- `fastRemove(array, index)` for O(1) array removal
- `spatialGrid.queryRadius(x, y, radius)` for collision optimization
- `playerMaxHP` (runtime) vs `PLAYER_MAX_HP` (const base) — always use `playerMaxHP`
- HUD uses `hudWeapons` (local var) to avoid collision with global `activeWeapons`

## Known Incomplete Features *(remove items as they get implemented)*

- **Evolution system**: 6 evolutions defined in `WEAPONS` with flags in `getWeaponStats()` (hasNovaBeam, hasArmageddon, hasSingularity, hasStormNexus, hasAnnihilation, hasHiveMind). Implemented: Nova Beam (laser_cannon), Armageddon (missile_launcher), Annihilation Sphere (plasma_field), Hive Mind (alien_drone). Remaining: Singularity (orbital_shield), Storm Nexus (lightning_ray) — these have `TODO: EVOLUTION` comments at their weapon function locations.
