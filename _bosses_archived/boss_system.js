/**
 * BOSS SYSTEM - ARCHIVED
 * Extraído de index.html el 2026-02-12
 *
 * Este código contiene el sistema completo de bosses de Stellar Swarm.
 * Se archivó para posible reimplementación futura con un sistema
 * diferente de progresión (no ligado a desbloqueo de armas).
 */

// ============================================================
// SECTION 1: Arena + Boss Constants + Boss State Variables
// (Originally lines 988-1045 of index.html)
// ============================================================

        // Arena system (boss fights)
        let arenaActive = false;
        let arenaCenter = { x: 0, y: 0 };
        const ARENA_RADIUS = 1200;
        const ARENA_START_RADIUS = 5000;
        const ARENA_CLOSE_SPEED = 900;
        let arenaCurrentRadius = ARENA_RADIUS;
        let arenaSpawnPaused = false;

        // ============================================================
        // BOSS SYSTEM
        // ============================================================
        const BOSS_SPAWN_LEVELS = [8, 14, 20, 27, 35];
        const BOSS_TYPES = ['orbitalGuardian', 'missileTitan', 'lightningNexus', 'plasmaOverlord', 'swarmMother'];
        const BOSS_NAMES = ['ORBITAL GUARDIAN', 'MISSILE TITAN', 'LIGHTNING NEXUS', 'PLASMA OVERLORD', 'SWARM MOTHER'];
        const BOSS_COLORS = ['#00DFFF', '#FFD93D', '#9F7AEA', '#FF6600', '#39FF14'];
        const BOSS_BASE_HP = [2000, 6000, 8000, 11000, 15000];
        const BOSS_WEAPON_UNLOCK = ['orbital_shield', 'missile_launcher', 'lightning_ray', 'plasma_field', 'alien_drone'];

        // Boss projectile constants
        const BOSS_PROJ_SPEED = 350;
        const BOSS_PROJ_DAMAGE = 1;
        const BOSS_PROJ_HP = 3;
        const BOSS_PROJ_RADIUS = 8;
        const BOSS_PROJ_LIFETIME = 12;

        let currentBoss = null;
        let bossProjectiles = [];
        let bossPhase = 1;
        let bossPatternTimer = 0;
        let bossDefeated = false;
        let bossesDefeatedThisRun = [];
        let bossHealthBarDisplayHP = 0;
        let bossIncoming = null; // { bossIndex, timer } — pending boss during arena close

        // Boss victory screen
        let bossVictoryScreen = null; // null | 'weaponUnlock' | 'bossDefeated'
        let bossVictoryTimer = 0;
        let bossVictoryData = null; // { bossName, bossColor, weaponName, weaponColor, weaponIcon, levelsGranted, xpGranted, combatTime, bossMaxHp, bossX, bossY }
        const BOSS_VICTORY_DURATION = 4.5;
        const BOSS_VICTORY_MIN_SKIP = 1.5;
        let bossVictoryParticles = [];

        // Orbital Guardian sphere system
        let bossSpheres = [];

        // Missile Titan homing missiles
        let bossHomingMissiles = [];
        let bossMTCannonTimer = 0; // tracks cannon reload visual

        // Lightning Nexus systems
        let bossLightningStrikes = []; // { startX, startY, endX, endY, phase, timer, zigzag }
        let bossTrailNodes = [];    // { x, y, radius, maxRadius, growing, growTimer, maxGrowTime, active }
        let bossTrailRays = [];     // { startX, startY, endX, endY }
        let bossTrailTimer = 0;     // countdown to spawn next node

        // Plasma Overlord systems
        let bossPlasmaRings = []; // { centerX, centerY, innerRadius, outerRadius, phase, timer, delay, expanding, expandSpeed, maxOuterRadius, thickness }

// ============================================================
// SECTION 2: Arena Functions + Boss Functions + Boss Patterns
// + Boss Renderers + All 5 Boss-Specific Systems
// (Originally lines 3491-6996 of index.html)
// ============================================================

        // ARENA SYSTEM (Boss Fights)
        // ============================================================

        function activateArena(centerX, centerY) {
            arenaActive = true;
            arenaCenter = { x: centerX, y: centerY };
            arenaCurrentRadius = ARENA_START_RADIUS;
            arenaSpawnPaused = true;

            // Clear all enemies WITHOUT giving XP/score (but show death explosion)
            for (let i = enemies.length - 1; i >= 0; i--) {
                const e = enemies[i];
                const config = ENEMY_TYPES[e.type];
                spawnRing(e.x, e.y, config.color, 40);
                pools.enemy.release(e);
            }
            enemies.length = 0;

            // Clear enemy bullets
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                pools.enemyBullet.release(enemyBullets[i]);
            }
            enemyBullets.length = 0;

            spawnFloatingText(player.x, player.y - 50, 'ARENA ACTIVATED', '#00CCFF');
            spawnFloatingText(player.x, player.y, 'BOSS FIGHT', '#00CCFF');
        }

        function deactivateArena() {
            arenaActive = false;
            arenaSpawnPaused = false;
            spawnFloatingText(player.x, player.y - 50, 'ARENA CLEARED', '#39FF14');
        }

        function enforceArenaBoundary() {
            if (!player || !arenaActive) return;

            const dx = player.x - arenaCenter.x;
            const dy = player.y - arenaCenter.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const maxDist = arenaCurrentRadius - 30;

            if (dist > maxDist) {
                // Push player back to boundary
                const nx = dx / dist;
                const ny = dy / dist;
                player.x = arenaCenter.x + nx * maxDist;
                player.y = arenaCenter.y + ny * maxDist;

                // Bounce velocity inward
                player.vx *= -0.3;
                player.vy *= -0.3;

                // Deal damage to player
                if (player.invulnerable <= 0) {
                    damagePlayer();
                }
            }
        }

        // ============================================================
        // BOSS FUNCTIONS
        // ============================================================

        function calculateBossHP(bossIndex) {
            const baseHP = BOSS_BASE_HP[bossIndex];
            const levelMultiplier = Math.max(0.5, 1 + (playerLevel - BOSS_SPAWN_LEVELS[bossIndex]) * 0.15);
            const prog = loadProgression();
            const numWeapons = WEAPON_IDS.filter(wid => prog.unlockedWeapons[wid]).length;
            const weaponMultiplier = 1 + (numWeapons * 0.20);
            return Math.max(baseHP, Math.floor(baseHP * levelMultiplier * weaponMultiplier));
        }

        function spawnBoss(bossIndex) {
            if (currentBoss || bossIncoming) return;

            activateArena(player.x, player.y);
            bossIncoming = { bossIndex: bossIndex, timer: 0 };

            triggerFlash('#FF0000', 0.3, 300);
            triggerSlowmo(500);
            spawnFloatingText(player.x, player.y - 60, '\u26A0 BOSS INCOMING \u26A0', BOSS_COLORS[bossIndex]);
        }

        function materializeBoss() {
            if (!bossIncoming) return;
            const bossIndex = bossIncoming.bossIndex;
            bossIncoming = null;

            const calculatedHP = calculateBossHP(bossIndex);
            currentBoss = {
                type: BOSS_TYPES[bossIndex],
                index: bossIndex,
                name: BOSS_NAMES[bossIndex],
                color: BOSS_COLORS[bossIndex],
                x: arenaCenter.x,
                y: arenaCenter.y,
                hp: calculatedHP,
                maxHp: calculatedHP,
                phase: 1,
                rotation: 0,
                patternTimer: 0,
                currentPattern: null,
                oscillationTimer: 0,
                size: 80 + bossIndex * 15,
                weaponUnlock: BOSS_WEAPON_UNLOCK[bossIndex],
                combatStartTime: gameTime,
                sides: bossIndex % 2 === 0 ? 8 : 6,
                flashTimer: 0
            };
            bossPhase = 1;
            bossPatternTimer = 0;
            bossDefeated = false;
            bossHealthBarDisplayHP = calculatedHP;

            triggerFlash('#FFFFFF', 0.5, 400);
            triggerShake(10, 600);
            triggerSlowmo(400);
            spawnFloatingText(arenaCenter.x, arenaCenter.y - 80, currentBoss.name, currentBoss.color);

            // Reset pattern state
            bossPatternIndex = 0;
            bossPatternCooldown = 2.5;
            bossPatternActive = false;
            bossPatternState = null;

            // Initialize Orbital Guardian spheres
            if (currentBoss.type === 'orbitalGuardian') {
                initBossSpheres();
            }

            // Initialize Missile Titan state — starts with missiles immediately
            if (currentBoss.type === 'missileTitan') {
                bossHomingMissiles = [];
                bossMTCannonTimer = 0;
                currentBoss.cannonCount = 8;
                currentBoss.missileChargeTimer = 0;
                // Override: first pattern is homing missile, fires at 0.5s
                bossPatternCooldown = 0.5;
                bossPatternIndex = 1; // will pick index 1 (homingMissile) from sequence
            }

            // Initialize Lightning Nexus state
            if (currentBoss.type === 'lightningNexus') {
                bossLightningStrikes = [];
                bossTrailNodes = [];
                bossTrailRays = [];
                bossTrailTimer = 1.5; // first trail node spawns 1.5s after boss appears
                currentBoss.arcOffsets = []; // random zigzag offsets for vertex arcs
                for (let i = 0; i < 8; i++) {
                    currentBoss.arcOffsets.push(Math.random() * 20 - 10);
                }
                bossPatternCooldown = 1.5;
            }

            // Initialize Plasma Overlord state
            if (currentBoss.type === 'plasmaOverlord') {
                bossPlasmaRings = [];
                bossPatternCooldown = 2.0;
            }

            // Initialize Swarm Mother state
            if (currentBoss.type === 'swarmMother') {
                bossBroodExplosions = [];
                bossBroodCooldown = 0;
                bossPatternCooldown = 2.0;
            }

            // Spawn ring burst at boss position
            for (let i = 0; i < 12; i++) {
                spawnRing(arenaCenter.x + (Math.random() - 0.5) * 60, arenaCenter.y + (Math.random() - 0.5) * 60, currentBoss.color, 50);
            }
        }

        function checkBossSpawn() {
            if (currentBoss || bossIncoming) return;
            for (let i = 0; i < BOSS_SPAWN_LEVELS.length; i++) {
                if (playerLevel >= BOSS_SPAWN_LEVELS[i] && !bossesDefeatedThisRun.includes(i)) {
                    spawnBoss(i);
                    break;
                }
            }
        }

        function updateBoss(dt) {
            if (!currentBoss) return;

            const boss = currentBoss;

            // Boss stays fixed at arena center
            boss.x = arenaCenter.x;
            boss.y = arenaCenter.y;

            // Rotation (degrees)
            if (boss.phaseSpinRemaining && boss.phaseSpinRemaining > 0) {
                const spinSpeed = 720; // degrees per second (720° in 1s)
                const spinThisFrame = spinSpeed * dt;
                boss.rotation += spinThisFrame;
                boss.phaseSpinRemaining -= spinThisFrame;
                if (boss.phaseSpinRemaining <= 0) boss.phaseSpinRemaining = 0;
            } else {
                boss.rotation += 60 * dt;
            }

            // Flash timer decay
            if (boss.flashTimer > 0) {
                boss.flashTimer -= dt;
            }

            // Orbital Guardian spheres
            updateBossSpheres(dt);

            // Missile Titan homing missiles
            updateHomingMissiles(dt);

            // Missile charge visual timer
            if (boss.missileChargeTimer !== undefined && boss.missileChargeTimer > 0) {
                boss.missileChargeTimer -= dt;
            }

            // Lightning Nexus systems
            updateLightningStrikes(dt);
            updateTrailNodes(dt);

            // Plasma Overlord systems
            updatePlasmaRings(dt);

            // Swarm Mother systems
            updateBroodExplosions(dt);

            // Boss attack patterns
            updateBossPatterns(dt);

            // Update boss projectiles
            updateBossProjectiles(dt);

            // Phase transition check
            if (boss.hp <= boss.maxHp * 0.5 && boss.phase === 1) {
                triggerPhaseTransition();
            }

            // Death check
            if (boss.hp <= 0) {
                onBossDefeated();
            }
        }

        function triggerPhaseTransition() {
            if (!currentBoss) return;
            currentBoss.phase = 2;
            bossPhase = 2;

            if (currentBoss.type === 'orbitalGuardian') {
                // White flash (0.3s)
                triggerFlash('#FFFFFF', 0.7, 300);
                triggerSlowmo(500);
                triggerShake(12, 800);

                // 720° spin over 1s (stored as target, applied in updateBoss)
                currentBoss.phaseSpinRemaining = 720;

                // Rage RingWave - burst of projectiles
                const count = 32;
                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 / count) * i;
                    spawnBossProjectile(currentBoss.x, currentBoss.y, angle, BOSS_PROJ_SPEED * 0.8, {
                        color: '#FFFFFF',
                        radius: 6
                    });
                }

                // Reset pattern to start phase 2 sequence fresh
                bossPatternIndex = 0;
                bossPatternActive = false;
                bossPatternCooldown = 1.5;
                bossPatternState = null;

                spawnFloatingText(currentBoss.x, currentBoss.y - currentBoss.size, 'PHASE 2', '#FF4444');
                spawnFloatingText(currentBoss.x, currentBoss.y, 'ENRAGED', '#FF4444');

                // Ring burst
                for (let i = 0; i < 8; i++) {
                    spawnRing(currentBoss.x + (Math.random() - 0.5) * 40, currentBoss.y + (Math.random() - 0.5) * 40, '#FFFFFF', 80);
                }
            } else if (currentBoss.type === 'missileTitan') {
                // Strong screen shake + shockwave
                triggerFlash('#FFD93D', 0.8, 500);
                triggerSlowmo(600);
                triggerShake(20, 1200);

                // 720° rage spin
                currentBoss.phaseSpinRemaining = 720;

                // Shockwave: expanding ring of projectiles
                const count = 28;
                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 / count) * i;
                    spawnBossProjectile(currentBoss.x, currentBoss.y, angle, BOSS_PROJ_SPEED * 1.2, {
                        color: '#FFD93D',
                        radius: 10,
                        hp: 2
                    });
                }

                // Ring burst visuals
                for (let i = 0; i < 12; i++) {
                    spawnRing(currentBoss.x + (Math.random() - 0.5) * 60, currentBoss.y + (Math.random() - 0.5) * 60, '#FFD93D', 100);
                }

                // Reset pattern sequence
                bossPatternIndex = 0;
                bossPatternActive = false;
                bossPatternCooldown = 1.0;
                bossPatternState = null;

                spawnFloatingText(currentBoss.x, currentBoss.y - currentBoss.size, 'PHASE 2', '#FF4444');
                spawnFloatingText(currentBoss.x, currentBoss.y, 'FULL ARSENAL', '#FFD93D');
            } else if (currentBoss.type === 'lightningNexus') {
                // Purple flash + electric shockwave
                triggerFlash('#9F7AEA', 0.8, 500);
                triggerSlowmo(600);
                triggerShake(18, 1000);

                // 720° rage spin
                currentBoss.phaseSpinRemaining = 720;

                // Electric shockwave: 24 projectiles in ring
                const count = 24;
                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 / count) * i;
                    spawnBossProjectile(currentBoss.x, currentBoss.y, angle, BOSS_PROJ_SPEED * 1.1, {
                        color: '#00FFFF',
                        radius: 8,
                        hp: 2
                    });
                }

                // Ring burst visuals
                for (let i = 0; i < 10; i++) {
                    spawnRing(currentBoss.x + (Math.random() - 0.5) * 60, currentBoss.y + (Math.random() - 0.5) * 60, '#9F7AEA', 90);
                }

                // Reset pattern sequence
                bossPatternIndex = 0;
                bossPatternActive = false;
                bossPatternCooldown = 1.0;
                bossPatternState = null;
                bossLightningStrikes = [];
                bossTrailNodes = [];
                bossTrailRays = [];
                bossTrailTimer = 1.0; // restart faster in P2

                spawnFloatingText(currentBoss.x, currentBoss.y - currentBoss.size, 'PHASE 2', '#FF4444');
                spawnFloatingText(currentBoss.x, currentBoss.y, 'OVERCHARGED', '#00FFFF');
            } else if (currentBoss.type === 'plasmaOverlord') {
                // Orange-red flash + plasma pincer shockwave
                triggerFlash('#FF4400', 0.8, 500);
                triggerSlowmo(600);
                triggerShake(18, 1000);

                // 720° rage spin
                currentBoss.phaseSpinRemaining = 720;

                // Ring burst visuals
                for (let i = 0; i < 12; i++) {
                    spawnRing(currentBoss.x + (Math.random() - 0.5) * 60, currentBoss.y + (Math.random() - 0.5) * 60, '#FF4400', 100);
                }

                // Reset pattern sequence and clear rings
                bossPatternIndex = 0;
                bossPatternActive = false;
                bossPatternCooldown = 1.0;
                bossPatternState = null;
                bossPlasmaRings = [];

                // Pincer shockwave: inner ring expands to half, outer ring telegraphs
                const R = ARENA_RADIUS;
                const t = R * 0.08;
                bossPlasmaRings.push({
                    centerX: currentBoss.x, centerY: currentBoss.y,
                    innerRadius: 80, outerRadius: 80 + t,
                    phase: 'fire', timer: 0, delay: 0,
                    expanding: false, expandInFire: true, expandSpeed: 500, maxOuterRadius: R * 0.5, thickness: t
                });
                bossPlasmaRings.push({
                    centerX: currentBoss.x, centerY: currentBoss.y,
                    innerRadius: R * 0.7, outerRadius: R * 0.7 + t,
                    phase: 'telegraph', timer: 0, delay: 0,
                    expanding: false, expandInFire: false, expandSpeed: 0, maxOuterRadius: R * 0.7 + t, thickness: t
                });

                spawnFloatingText(currentBoss.x, currentBoss.y - currentBoss.size, 'PHASE 2', '#FF4444');
                spawnFloatingText(currentBoss.x, currentBoss.y, 'MELTDOWN', '#FFAA00');
            } else if (currentBoss.type === 'swarmMother') {
                // Green flash + swarm shockwave
                triggerFlash('#39FF14', 0.8, 500);
                triggerSlowmo(600);
                triggerShake(20, 1200);

                // 720° rage spin
                currentBoss.phaseSpinRemaining = 720;

                // Massive shockwave: 36 green projectiles
                const count = 36;
                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 / count) * i;
                    spawnBossProjectile(currentBoss.x, currentBoss.y, angle, BOSS_PROJ_SPEED * 1.0, {
                        color: '#39FF14',
                        radius: 8,
                        hp: 2
                    });
                }

                // Ring burst visuals
                for (let i = 0; i < 14; i++) {
                    spawnRing(currentBoss.x + (Math.random() - 0.5) * 80, currentBoss.y + (Math.random() - 0.5) * 80, '#39FF14', 120);
                }

                // Reset pattern sequence
                bossPatternIndex = 0;
                bossPatternActive = false;
                bossPatternCooldown = 1.0;
                bossPatternState = null;
                bossBroodExplosions = [];
                bossBroodCooldown = 0;

                spawnFloatingText(currentBoss.x, currentBoss.y - currentBoss.size, 'PHASE 2', '#FF4444');
                spawnFloatingText(currentBoss.x, currentBoss.y, 'HIVE UNLEASHED', '#39FF14');
            } else {
                triggerFlash(currentBoss.color, 0.4, 400);
                triggerSlowmo(300);
                triggerShake(8, 500);
                spawnFloatingText(currentBoss.x, currentBoss.y - currentBoss.size, 'PHASE 2', currentBoss.color);
                spawnFloatingText(currentBoss.x, currentBoss.y, 'ENRAGED', currentBoss.color);
            }
        }

        function damageBoss(amount) {
            if (!currentBoss) return;
            currentBoss.hp -= amount;
            if (currentBoss.hp < 0) currentBoss.hp = 0;
            currentBoss.flashTimer = 0.1;

            spawnFloatingText(currentBoss.x, currentBoss.y - currentBoss.size, amount.toString(), '#FFFFFF');
        }

        function onBossDefeated() {
            if (!currentBoss) return;

            const boss = currentBoss;
            bossesDefeatedThisRun.push(boss.index);
            bossDefeated = true;

            // Determine first vs repeat defeat
            const prog = loadProgression();
            const isFirstDefeat = !prog.bossDefeats[boss.type] || prog.bossDefeats[boss.type] === 0;

            // Save progression
            prog.unlockedWeapons[boss.weaponUnlock] = true;
            if (!prog.bossDefeats[boss.type]) {
                prog.bossDefeats[boss.type] = 0;
            }
            prog.bossDefeats[boss.type]++;
            prog.stats.totalBossDefeats++;
            saveProgression(prog);

            // Unlock weapon in current run
            if (!unlockedSkills.includes(boss.weaponUnlock)) {
                unlockedSkills.push(boss.weaponUnlock);
            }

            // Weapon display info lookup
            const WEAPON_DISPLAY = {
                'orbital_shield': { name: 'ORBITAL SHIELD', color: '#00DFFF', icon: 'orbital' },
                'missile_launcher': { name: 'MISSILE LAUNCHER', color: '#FFD93D', icon: 'rocket' },
                'lightning_ray': { name: 'LIGHTNING RAY', color: '#9F7AEA', icon: 'lightning' },
                'plasma_field': { name: 'PLASMA FIELD', color: '#7FDBFF', icon: 'aura' },
                'alien_drone': { name: 'ALIEN DRONE', color: '#39FF14', icon: 'drone' }
            };
            const weaponInfo = WEAPON_DISPLAY[boss.weaponUnlock] || { name: boss.weaponUnlock.replace(/_/g, ' ').toUpperCase(), color: boss.color, icon: 'laser' };

            // Calculate rewards
            const levelsGranted = isFirstDefeat ? 3 : 2;
            const xpGranted = Math.floor(xpToNextLevel * levelsGranted);
            const combatTime = boss.combatStartTime ? (gameTime - boss.combatStartTime) : 0;

            // Visual effects
            triggerFlash('#FFFFFF', 0.8, 600);
            triggerSlowmo(1000);
            triggerShake(20, 1000);

            // Epic particle explosion at boss position
            for (let i = 0; i < 60; i++) {
                spawnRing(boss.x + (Math.random() - 0.5) * boss.size * 1.5, boss.y + (Math.random() - 0.5) * boss.size * 1.5, boss.color, 80 + Math.random() * 40);
            }
            for (let i = 0; i < 30; i++) {
                spawnRing(boss.x + (Math.random() - 0.5) * boss.size, boss.y + (Math.random() - 0.5) * boss.size, '#FFFFFF', 50 + Math.random() * 30);
            }

            // Grant XP (this may trigger levelUp/skill tree)
            collectXP(xpGranted);

            // Clear boss projectiles, pattern state, spheres, missiles, lightning, and plasma
            bossProjectiles.length = 0;
            bossPatternActive = false;
            bossPatternState = null;
            bossSpheres = [];
            bossHomingMissiles = [];
            bossLightningStrikes = [];
            bossTrailNodes = [];
            bossTrailRays = [];
            bossPlasmaRings = [];
            bossBroodExplosions = [];

            // Kill all boss-spawned enemies on defeat
            for (let i = enemies.length - 1; i >= 0; i--) {
                if (enemies[i].noXP) {
                    spawnRing(enemies[i].x, enemies[i].y, '#39FF14', 30);
                    pools.enemy.release(enemies[i]);
                    fastRemove(enemies, i);
                }
            }

            // Set up victory screen (freeze game, show overlay)
            bossVictoryScreen = isFirstDefeat ? 'weaponUnlock' : 'bossDefeated';
            bossVictoryTimer = 0;
            bossVictoryData = {
                bossName: boss.name,
                bossColor: boss.color,
                weaponName: weaponInfo.name,
                weaponColor: weaponInfo.color,
                weaponIcon: weaponInfo.icon,
                levelsGranted: levelsGranted,
                xpGranted: xpGranted,
                combatTime: combatTime,
                bossMaxHp: boss.maxHp,
                bossX: boss.x,
                bossY: boss.y
            };
            // Spawn golden victory particles
            bossVictoryParticles = [];
            for (let i = 0; i < 30; i++) {
                bossVictoryParticles.push({
                    x: Math.random() * CANVAS_WIDTH,
                    y: Math.random() * CANVAS_HEIGHT,
                    vx: (Math.random() - 0.5) * 60,
                    vy: -30 - Math.random() * 80,
                    size: 2 + Math.random() * 4,
                    alpha: 0.5 + Math.random() * 0.5,
                    color: isFirstDefeat ? '#FFD700' : boss.color
                });
            }

            // Don't deactivate arena or clear boss yet — wait for victory screen to finish
        }

        function dismissBossVictory() {
            bossVictoryScreen = null;
            bossVictoryTimer = 0;
            bossVictoryData = null;
            bossVictoryParticles = [];
            deactivateArena();
            currentBoss = null;
        }

        function renderBoss() {
            if (!currentBoss || bossVictoryScreen) return;

            const boss = currentBoss;

            if (boss.type === 'missileTitan') {
                renderMissileTitan();
                return;
            }

            if (boss.type === 'lightningNexus') {
                renderLightningNexus();
                return;
            }

            if (boss.type === 'plasmaOverlord') {
                renderPlasmaOverlord();
                return;
            }

            if (boss.type === 'swarmMother') {
                renderSwarmMother();
                return;
            }

            ctx.save();
            ctx.translate(boss.x, boss.y);
            ctx.rotate(boss.rotation * Math.PI / 180);

            const sides = boss.sides;
            const size = boss.size;

            // Outer glow ring
            ctx.beginPath();
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
                const px = Math.cos(angle) * (size + 10);
                const py = Math.sin(angle) * (size + 10);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.strokeStyle = boss.color;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3 + Math.sin(gameTime * 4) * 0.15;
            setGlow(ctx, boss.color, 20);
            ctx.stroke();
            clearGlow(ctx);
            ctx.globalAlpha = 1;

            // Main body polygon
            ctx.beginPath();
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
                const px = Math.cos(angle) * size;
                const py = Math.sin(angle) * size;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();

            // Fill with gradient
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
            const baseColor = boss.color;
            gradient.addColorStop(0, baseColor);
            gradient.addColorStop(0.5, baseColor + '88');
            gradient.addColorStop(1, baseColor + '22');
            ctx.fillStyle = gradient;
            ctx.globalAlpha = boss.phase === 2 ? 0.7 : 0.5;
            ctx.fill();
            ctx.globalAlpha = 1;

            // Border
            ctx.strokeStyle = boss.color;
            ctx.lineWidth = boss.phase === 2 ? 3 : 2;
            ctx.stroke();

            // Flash white on damage
            if (boss.flashTimer > 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, ' + Math.min(boss.flashTimer / 0.1, 0.6) + ')';
                ctx.fill();
            }

            // Pulsating center core
            const coreSize = 12 + Math.sin(gameTime * 6) * 4;
            ctx.beginPath();
            ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 0.6 + Math.sin(gameTime * 8) * 0.3;
            ctx.fill();
            ctx.globalAlpha = 1;

            // Inner ring
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
            ctx.strokeStyle = boss.color;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Phase 2: extra visual (inner polygon spinning opposite)
            if (boss.phase === 2) {
                ctx.save();
                ctx.rotate(-boss.rotation * 2 * Math.PI / 180);
                ctx.beginPath();
                for (let i = 0; i < sides; i++) {
                    const angle = (Math.PI * 2 / sides) * i;
                    const px = Math.cos(angle) * (size * 0.55);
                    const py = Math.sin(angle) * (size * 0.55);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.strokeStyle = boss.color;
                ctx.lineWidth = 1.5;
                ctx.globalAlpha = 0.5;
                ctx.stroke();
                ctx.globalAlpha = 1;
                ctx.restore();
            }

            ctx.restore();
        }

        function renderMissileTitan() {
            const boss = currentBoss;
            const sides = boss.sides; // 6 (hexagon)
            const size = boss.size;

            ctx.save();
            ctx.translate(boss.x, boss.y);
            ctx.rotate(boss.rotation * Math.PI / 180);

            // Outer glow ring — gold
            ctx.beginPath();
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
                const px = Math.cos(angle) * (size + 14);
                const py = Math.sin(angle) * (size + 14);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.strokeStyle = '#FFD93D';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.3 + Math.sin(gameTime * 3) * 0.15;
            setGlow(ctx, '#FFD93D', 20);
            ctx.stroke();
            clearGlow(ctx);
            ctx.globalAlpha = 1;

            // Main body — metallic grey hexagon
            ctx.beginPath();
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
                const px = Math.cos(angle) * size;
                const py = Math.sin(angle) * size;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();

            // Metallic gradient: grey center, darker edges
            const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
            bodyGrad.addColorStop(0, '#A0A0A0');
            bodyGrad.addColorStop(0.4, '#808080');
            bodyGrad.addColorStop(0.8, '#505050');
            bodyGrad.addColorStop(1, '#303030');
            ctx.fillStyle = bodyGrad;
            ctx.globalAlpha = boss.phase === 2 ? 0.85 : 0.7;
            ctx.fill();
            ctx.globalAlpha = 1;

            // Gold border
            ctx.strokeStyle = '#FFD93D';
            ctx.lineWidth = boss.phase === 2 ? 3.5 : 2.5;
            ctx.stroke();

            // Gold accent lines (inner hexagonal pattern)
            ctx.beginPath();
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
                const px = Math.cos(angle) * (size * 0.6);
                const py = Math.sin(angle) * (size * 0.6);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.strokeStyle = '#FFD93D';
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.35;
            ctx.stroke();
            ctx.globalAlpha = 1;

            // 8 vertex accent dots on the perimeter
            const cannonCount = 8;
            for (let i = 0; i < cannonCount; i++) {
                const cAngle = (Math.PI * 2 / cannonCount) * i;
                const cx = Math.cos(cAngle) * size;
                const cy = Math.sin(cAngle) * size;

                // Small gold dot at each vertex
                ctx.beginPath();
                ctx.arc(cx, cy, 4, 0, Math.PI * 2);
                ctx.fillStyle = '#FFD93D';
                ctx.globalAlpha = 0.6 + Math.sin(gameTime * 4 + i * 0.8) * 0.3;
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            // Flash white on damage
            if (boss.flashTimer > 0) {
                ctx.beginPath();
                for (let i = 0; i < sides; i++) {
                    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
                    const px = Math.cos(angle) * size;
                    const py = Math.sin(angle) * size;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fillStyle = 'rgba(255, 255, 255, ' + Math.min(boss.flashTimer / 0.1, 0.6) + ')';
                ctx.fill();
            }

            // Center core — pulsating gold
            const coreSize = 14 + Math.sin(gameTime * 5) * 5;
            ctx.beginPath();
            ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
            const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
            coreGrad.addColorStop(0, '#FFFFFF');
            coreGrad.addColorStop(0.5, '#FFD93D');
            coreGrad.addColorStop(1, '#FF880044');
            ctx.fillStyle = coreGrad;
            ctx.globalAlpha = 0.7 + Math.sin(gameTime * 7) * 0.2;
            ctx.fill();
            ctx.globalAlpha = 1;

            // Missile reload lines (flash before missile launch)
            if (boss.missileChargeTimer > 0) {
                const chargeAlpha = Math.min(boss.missileChargeTimer / 0.4, 1.0);
                const pulseRate = 20;
                const pulse = 0.5 + Math.sin(gameTime * pulseRate) * 0.5;

                for (let i = 0; i < 6; i++) {
                    const lineAngle = (Math.PI * 2 / 6) * i;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(lineAngle) * (size * 0.3), Math.sin(lineAngle) * (size * 0.3));
                    ctx.lineTo(Math.cos(lineAngle) * (size * 0.9), Math.sin(lineAngle) * (size * 0.9));
                    ctx.strokeStyle = '#FF4400';
                    ctx.lineWidth = 2;
                    ctx.globalAlpha = chargeAlpha * pulse;
                    setGlow(ctx, '#FF4400', 8);
                    ctx.stroke();
                    clearGlow(ctx);
                }
                ctx.globalAlpha = 1;
            }

            // Phase 2: inner hexagon spinning opposite + extra glow
            if (boss.phase === 2) {
                ctx.save();
                ctx.rotate(-boss.rotation * 2 * Math.PI / 180);
                ctx.beginPath();
                for (let i = 0; i < sides; i++) {
                    const angle = (Math.PI * 2 / sides) * i;
                    const px = Math.cos(angle) * (size * 0.45);
                    const py = Math.sin(angle) * (size * 0.45);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.strokeStyle = '#FFD93D';
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.5;
                ctx.stroke();
                ctx.globalAlpha = 1;
                ctx.restore();
            }

            ctx.restore();
        }

        function renderBossHealthBar() {
            if (!currentBoss || bossVictoryScreen) return;

            const boss = currentBoss;
            const barWidth = 400;
            const barHeight = 16;
            const barX = (CANVAS_WIDTH - barWidth) / 2;
            const barY = 90;

            // Smooth HP interpolation
            const hpDiff = boss.hp - bossHealthBarDisplayHP;
            bossHealthBarDisplayHP += hpDiff * 0.1;
            if (Math.abs(hpDiff) < 1) bossHealthBarDisplayHP = boss.hp;

            const hpRatio = Math.max(0, bossHealthBarDisplayHP / boss.maxHp);

            // Boss name
            ctx.save();
            ctx.textAlign = 'center';
            ctx.font = 'bold 14px "Segoe UI", sans-serif';
            ctx.fillStyle = boss.color;
            setGlow(ctx, boss.color, 10);
            ctx.fillText(boss.name, CANVAS_WIDTH / 2, barY - 8);
            clearGlow(ctx);

            // Phase indicator
            ctx.font = '10px "Segoe UI", sans-serif';
            ctx.fillStyle = boss.phase === 2 ? '#FF4444' : '#AAAAAA';
            ctx.fillText('PHASE ' + boss.phase, CANVAS_WIDTH / 2, barY + barHeight + 16);

            // Bar background
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.beginPath();
            ctx.roundRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4, 4);
            ctx.fill();

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.roundRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4, 4);
            ctx.stroke();

            // HP fill with gradient
            if (hpRatio > 0) {
                const fillWidth = barWidth * hpRatio;
                const hpGradient = ctx.createLinearGradient(barX, 0, barX + fillWidth, 0);

                if (boss.phase === 1) {
                    hpGradient.addColorStop(0, '#39FF14');
                    hpGradient.addColorStop(1, '#FFD93D');
                } else {
                    hpGradient.addColorStop(0, '#FF4444');
                    hpGradient.addColorStop(1, '#FF8800');
                }

                ctx.fillStyle = hpGradient;
                ctx.beginPath();
                ctx.roundRect(barX, barY, fillWidth, barHeight, 3);
                ctx.fill();

                // Shine on top
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                ctx.beginPath();
                ctx.roundRect(barX, barY, fillWidth, barHeight / 2, [3, 3, 0, 0]);
                ctx.fill();
            }

            // HP text
            ctx.font = 'bold 10px "Segoe UI", sans-serif';
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 0.8;
            ctx.fillText(Math.ceil(bossHealthBarDisplayHP) + ' / ' + boss.maxHp, CANVAS_WIDTH / 2, barY + barHeight - 3);
            ctx.globalAlpha = 1;

            ctx.restore();
        }

        // --- Boss Projectile System ---

        function spawnBossProjectile(x, y, angle, speed, options) {
            options = options || {};
            const s = speed || BOSS_PROJ_SPEED;
            bossProjectiles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * s,
                vy: Math.sin(angle) * s,
                hp: options.hp || BOSS_PROJ_HP,
                damage: options.damage || BOSS_PROJ_DAMAGE,
                radius: options.radius || BOSS_PROJ_RADIUS,
                life: options.life || BOSS_PROJ_LIFETIME,
                color: options.color || (currentBoss ? currentBoss.color : '#FF0000'),
                type: options.type || 'normal',
                trail: []
            });
        }

        function updateBossProjectiles(dt) {
            for (let i = bossProjectiles.length - 1; i >= 0; i--) {
                const bp = bossProjectiles[i];

                // Store trail position
                bp.trail.push({ x: bp.x, y: bp.y });
                if (bp.trail.length > 4) bp.trail.shift();

                bp.x += bp.vx * dt;
                bp.y += bp.vy * dt;
                bp.life -= dt;

                // Remove if expired, destroyed, or outside arena
                let remove = bp.life <= 0 || bp.hp <= 0;
                if (!remove && arenaActive) {
                    const dx = bp.x - arenaCenter.x;
                    const dy = bp.y - arenaCenter.y;
                    if (dx * dx + dy * dy > (ARENA_RADIUS + 100) * (ARENA_RADIUS + 100)) {
                        remove = true;
                    }
                }
                if (remove) {
                    bossProjectiles.splice(i, 1);
                }
            }
        }

        function renderBossProjectiles() {
            for (let i = 0; i < bossProjectiles.length; i++) {
                const bp = bossProjectiles[i];

                // Trail
                for (let t = 0; t < bp.trail.length; t++) {
                    const alpha = (t + 1) / (bp.trail.length + 1) * 0.4;
                    const trailRadius = bp.radius * (t + 1) / (bp.trail.length + 1);
                    ctx.beginPath();
                    ctx.arc(bp.trail[t].x, bp.trail[t].y, trailRadius, 0, Math.PI * 2);
                    ctx.fillStyle = bp.color;
                    ctx.globalAlpha = alpha;
                    ctx.fill();
                }
                ctx.globalAlpha = 1;

                // Glow
                setGlow(ctx, bp.color, 12);

                if (bp.type === 'diamond') {
                    // Diamond shape
                    ctx.save();
                    ctx.translate(bp.x, bp.y);
                    ctx.rotate(Math.atan2(bp.vy, bp.vx));
                    ctx.beginPath();
                    ctx.moveTo(bp.radius * 1.4, 0);
                    ctx.lineTo(0, bp.radius * 0.7);
                    ctx.lineTo(-bp.radius * 0.8, 0);
                    ctx.lineTo(0, -bp.radius * 0.7);
                    ctx.closePath();
                    ctx.fillStyle = bp.color;
                    ctx.globalAlpha = 0.9;
                    ctx.fill();
                    ctx.beginPath();
                    ctx.moveTo(bp.radius * 0.6, 0);
                    ctx.lineTo(0, bp.radius * 0.3);
                    ctx.lineTo(-bp.radius * 0.3, 0);
                    ctx.lineTo(0, -bp.radius * 0.3);
                    ctx.closePath();
                    ctx.fillStyle = '#FFFFFF';
                    ctx.globalAlpha = 0.7;
                    ctx.fill();
                    ctx.globalAlpha = 1;
                    ctx.restore();
                } else {
                    // Main circle
                    ctx.beginPath();
                    ctx.arc(bp.x, bp.y, bp.radius, 0, Math.PI * 2);
                    ctx.fillStyle = bp.color;
                    ctx.globalAlpha = 0.9;
                    ctx.fill();

                    // Bright center
                    ctx.beginPath();
                    ctx.arc(bp.x, bp.y, bp.radius * 0.4, 0, Math.PI * 2);
                    ctx.fillStyle = '#FFFFFF';
                    ctx.globalAlpha = 0.8;
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }

                clearGlow(ctx);
            }
        }

        // --- Boss Attack Patterns ---

        let bossPatternState = null;

        function bossPattern_SpiralOutward(dt) {
            if (!currentBoss) return true;
            const state = bossPatternState;
            state.elapsed += dt;
            state.fireTimer += dt;

            const fireInterval = 0.15;
            if (state.fireTimer >= fireInterval) {
                state.fireTimer -= fireInterval;
                const speed = currentBoss.phase === 2 ? BOSS_PROJ_SPEED * 1.4 : BOSS_PROJ_SPEED;
                spawnBossProjectile(currentBoss.x, currentBoss.y, state.angle, speed);
                state.angle += 20 * Math.PI / 180;
            }

            return state.elapsed >= 3;
        }

        function bossPattern_CornerBarrage(dt) {
            if (!currentBoss) return true;
            const state = bossPatternState;
            state.elapsed += dt;
            state.fireTimer += dt;

            const maxBursts = state.maxBursts || 8;
            const isDouble = state.double || false;
            const fireInterval = isDouble ? 0.35 : 0.5;
            if (state.fireTimer >= fireInterval && state.bursts < maxBursts) {
                state.fireTimer -= fireInterval;
                state.bursts++;
                const boss = currentBoss;
                const sides = boss.sides;
                const speed = boss.phase === 2 ? BOSS_PROJ_SPEED * 1.4 : BOSS_PROJ_SPEED;
                for (let i = 0; i < sides; i++) {
                    const vertexAngle = (Math.PI * 2 / sides) * i + boss.rotation * Math.PI / 180;
                    const spawnX = boss.x + Math.cos(vertexAngle) * boss.size;
                    const spawnY = boss.y + Math.sin(vertexAngle) * boss.size;
                    spawnBossProjectile(spawnX, spawnY, vertexAngle, speed);
                    if (isDouble) {
                        // Second projectile slightly offset angle
                        spawnBossProjectile(spawnX, spawnY, vertexAngle + 10 * Math.PI / 180, speed * 0.85);
                    }
                }
            }

            return state.bursts >= maxBursts;
        }

        function bossPattern_RingWave(dt) {
            if (!currentBoss) return true;
            const state = bossPatternState;
            if (!state.fired) {
                state.fired = true;
                const count = 24;
                const speed = currentBoss.phase === 2 ? BOSS_PROJ_SPEED * 1.4 : BOSS_PROJ_SPEED;
                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 / count) * i;
                    spawnBossProjectile(currentBoss.x, currentBoss.y, angle, speed);
                }
            }
            state.elapsed += dt;
            return state.elapsed >= 0.5;
        }

        function bossPattern_TargetedBurst(dt) {
            if (!currentBoss || !player) return true;
            const state = bossPatternState;
            state.elapsed += dt;
            state.fireTimer += dt;

            const fireInterval = 0.8;
            if (state.fireTimer >= fireInterval && state.bursts < 3) {
                state.fireTimer -= fireInterval;
                state.bursts++;
                const boss = currentBoss;
                const dx = player.x - boss.x;
                const dy = player.y - boss.y;
                const baseAngle = Math.atan2(dy, dx);
                const spreadAngle = 15 * Math.PI / 180;
                const speed = boss.phase === 2 ? BOSS_PROJ_SPEED * 1.4 : BOSS_PROJ_SPEED;
                for (let j = -2; j <= 2; j++) {
                    spawnBossProjectile(boss.x, boss.y, baseAngle + spreadAngle * j, speed);
                }
            }

            return state.bursts >= 3;
        }

        // Pattern selection and scheduling
        const BOSS_PATTERNS = [bossPattern_SpiralOutward, bossPattern_CornerBarrage, bossPattern_RingWave, bossPattern_TargetedBurst];
        let bossPatternIndex = 0;
        let bossPatternCooldown = 2.5;
        let bossPatternActive = false;

        function updateBossPatterns(dt) {
            if (!currentBoss) return;

            if (bossPatternActive) {
                const done = currentBoss.currentPattern(dt);
                if (done) {
                    bossPatternActive = false;
                    // Set cooldown based on boss type and phase
                    if (currentBoss.type === 'orbitalGuardian') {
                        const seq = currentBoss.phase === 2 ? OG_PHASE2_SEQUENCE : OG_PHASE1_SEQUENCE;
                        const prevIndex = (bossPatternIndex - 1 + seq.length) % seq.length;
                        bossPatternCooldown = seq[prevIndex].pause;
                    } else if (currentBoss.type === 'missileTitan') {
                        const seq = currentBoss.phase === 2 ? MT_PHASE2_SEQUENCE : MT_PHASE1_SEQUENCE;
                        const prevIndex = (bossPatternIndex - 1 + seq.length) % seq.length;
                        bossPatternCooldown = seq[prevIndex].pause;
                    } else if (currentBoss.type === 'lightningNexus') {
                        const seq = currentBoss.phase === 2 ? LN_PHASE2_SEQUENCE : LN_PHASE1_SEQUENCE;
                        const prevIndex = (bossPatternIndex - 1 + seq.length) % seq.length;
                        bossPatternCooldown = seq[prevIndex].pause;
                    } else if (currentBoss.type === 'plasmaOverlord') {
                        const seq = currentBoss.phase === 2 ? PO_PHASE2_SEQUENCE : PO_PHASE1_SEQUENCE;
                        const prevIndex = (bossPatternIndex - 1 + seq.length) % seq.length;
                        bossPatternCooldown = seq[prevIndex].pause;
                    } else if (currentBoss.type === 'swarmMother') {
                        const seq = currentBoss.phase === 2 ? SM_PHASE2_SEQUENCE : SM_PHASE1_SEQUENCE;
                        const prevIndex = (bossPatternIndex - 1 + seq.length) % seq.length;
                        bossPatternCooldown = seq[prevIndex].pause;
                    } else {
                        bossPatternCooldown = currentBoss.phase === 2 ? 1.5 : 2.5;
                    }
                    bossPatternState = null;
                }
            } else {
                bossPatternCooldown -= dt;
                if (bossPatternCooldown <= 0) {
                    bossPatternActive = true;
                    if (currentBoss.type === 'orbitalGuardian') {
                        const seq = currentBoss.phase === 2 ? OG_PHASE2_SEQUENCE : OG_PHASE1_SEQUENCE;
                        const entry = seq[bossPatternIndex % seq.length];
                        currentBoss.currentPattern = getOGPattern(entry.pattern);
                        // For cornerBarrageDouble, use modified init state
                        if (entry.pattern === 'cornerBarrageDouble') {
                            bossPatternState = { elapsed: 0, fireTimer: 0, angle: 0, bursts: 0, fired: false, maxBursts: 8, double: true };
                        } else {
                            bossPatternState = { elapsed: 0, fireTimer: 0, angle: 0, bursts: 0, fired: false };
                        }
                    } else if (currentBoss.type === 'missileTitan') {
                        const seq = currentBoss.phase === 2 ? MT_PHASE2_SEQUENCE : MT_PHASE1_SEQUENCE;
                        const entry = seq[bossPatternIndex % seq.length];
                        currentBoss.currentPattern = getMTPattern(entry.pattern);
                        bossPatternState = getMTPatternState(entry.pattern);
                    } else if (currentBoss.type === 'lightningNexus') {
                        const seq = currentBoss.phase === 2 ? LN_PHASE2_SEQUENCE : LN_PHASE1_SEQUENCE;
                        const entry = seq[bossPatternIndex % seq.length];
                        currentBoss.currentPattern = getLNPattern(entry.pattern);
                        bossPatternState = getLNPatternState(entry);
                    } else if (currentBoss.type === 'plasmaOverlord') {
                        const seq = currentBoss.phase === 2 ? PO_PHASE2_SEQUENCE : PO_PHASE1_SEQUENCE;
                        const entry = seq[bossPatternIndex % seq.length];
                        currentBoss.currentPattern = getPOPattern(entry.pattern);
                        bossPatternState = getPOPatternState(entry);
                    } else if (currentBoss.type === 'swarmMother') {
                        const seq = currentBoss.phase === 2 ? SM_PHASE2_SEQUENCE : SM_PHASE1_SEQUENCE;
                        const entry = seq[bossPatternIndex % seq.length];
                        currentBoss.currentPattern = getSMPattern(entry.pattern);
                        bossPatternState = getSMPatternState(entry);
                    } else {
                        currentBoss.currentPattern = BOSS_PATTERNS[bossPatternIndex % BOSS_PATTERNS.length];
                        bossPatternState = { elapsed: 0, fireTimer: 0, angle: 0, bursts: 0, fired: false };
                    }
                    bossPatternIndex++;
                }
            }
        }

        // --- Orbital Guardian: Sphere System ---

        function initBossSpheres() {
            bossSpheres = [];
            const sphereColor = '#00DFFF';
            const R = 166;
            // Inner ring: 3 spheres, orbit 280px, clockwise
            for (let i = 0; i < 3; i++) {
                bossSpheres.push({
                    ring: 0,
                    angle: (Math.PI * 2 / 3) * i,
                    orbitRadius: 280,
                    speed: 0.4,
                    radius: R,
                    color: sphereColor,
                    x: 0, y: 0
                });
            }
            // Middle ring: 3 spheres, orbit 660px, counter-clockwise
            for (let i = 0; i < 3; i++) {
                bossSpheres.push({
                    ring: 1,
                    angle: (Math.PI * 2 / 3) * i + Math.PI / 3,
                    orbitRadius: 660,
                    speed: -0.25,
                    radius: R,
                    color: sphereColor,
                    x: 0, y: 0
                });
            }
            // Outer ring: 3 spheres, orbit 1020px, clockwise
            for (let i = 0; i < 3; i++) {
                bossSpheres.push({
                    ring: 2,
                    angle: (Math.PI * 2 / 3) * i,
                    orbitRadius: 1020,
                    speed: 0.175,
                    radius: R,
                    color: sphereColor,
                    x: 0, y: 0
                });
            }
        }

        function updateBossSpheres(dt) {
            if (!currentBoss || currentBoss.type !== 'orbitalGuardian') return;

            const speedMult = currentBoss.phase === 2 ? 1.5 : 1;

            for (let i = 0; i < bossSpheres.length; i++) {
                const s = bossSpheres[i];
                s.angle += s.speed * speedMult * dt;
                s.x = currentBoss.x + Math.cos(s.angle) * s.orbitRadius;
                s.y = currentBoss.y + Math.sin(s.angle) * s.orbitRadius;
            }
        }

        function renderBossSpheres() {
            if (!currentBoss || currentBoss.type !== 'orbitalGuardian') return;

            const boss = currentBoss;

            // Orbit path rings (smooth visible circles)
            for (const ringRadius of [280, 660, 1020]) {
                ctx.beginPath();
                ctx.arc(boss.x, boss.y, ringRadius, 0, Math.PI * 2);
                ctx.strokeStyle = boss.color;
                ctx.lineWidth = 1.5;
                ctx.globalAlpha = 0.15;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }

            // Energy lines connecting spheres to boss
            for (let i = 0; i < bossSpheres.length; i++) {
                const s = bossSpheres[i];
                ctx.beginPath();
                ctx.moveTo(boss.x, boss.y);
                ctx.lineTo(s.x, s.y);
                ctx.strokeStyle = s.color;
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.15 + Math.sin(gameTime * 6 + i) * 0.08;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }

            // Spheres — outline with inner radial fade
            for (let i = 0; i < bossSpheres.length; i++) {
                const s = bossSpheres[i];

                // Inner radial fade fill
                const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius);
                grad.addColorStop(0, 'rgba(0, 223, 255, 0.12)');
                grad.addColorStop(0.6, 'rgba(0, 223, 255, 0.05)');
                grad.addColorStop(1, 'rgba(0, 223, 255, 0)');
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                ctx.fillStyle = grad;
                ctx.fill();

                // Outline ring
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
                ctx.strokeStyle = s.color;
                ctx.lineWidth = 3;
                ctx.stroke();
            }
        }

        // --- Orbital Guardian: Shield Projection Barrage ---

        function bossPattern_ShieldProjectionBarrage(dt) {
            if (!currentBoss) return true;
            const state = bossPatternState;
            state.elapsed += dt;
            state.fireTimer += dt;

            const totalWaves = currentBoss.phase === 2 ? 4 : 3;
            const fireInterval = 0.6;

            if (state.fireTimer >= fireInterval && state.bursts < totalWaves) {
                state.fireTimer -= fireInterval;
                const waveIndex = state.bursts;
                state.bursts++;

                const count = 16;
                const rotationOffset = waveIndex * 22.5 * Math.PI / 180;
                const speed = 280;

                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 / count) * i + rotationOffset;
                    spawnBossProjectile(currentBoss.x, currentBoss.y, angle, speed, {
                        hp: 5,
                        radius: 10,
                        type: 'diamond',
                        color: currentBoss.color
                    });
                }
            }

            return state.bursts >= totalWaves && state.elapsed >= totalWaves * fireInterval + 0.3;
        }

        // --- Orbital Guardian: Attack Sequences ---

        const OG_PHASE1_SEQUENCE = [
            { pattern: 'spiralOutward', pause: 3 },
            { pattern: 'shieldBarrage', pause: 3 },
            { pattern: 'cornerBarrage', pause: 3 }
        ];
        const OG_PHASE2_SEQUENCE = [
            { pattern: 'cornerBarrageDouble', pause: 1.5 },
            { pattern: 'shieldBarrage', pause: 1.5 },
            { pattern: 'ringWave', pause: 1.5 }
        ];

        function getOGPattern(name) {
            switch (name) {
                case 'spiralOutward': return bossPattern_SpiralOutward;
                case 'shieldBarrage': return bossPattern_ShieldProjectionBarrage;
                case 'cornerBarrage': return bossPattern_CornerBarrage;
                case 'cornerBarrageDouble': return bossPattern_CornerBarrage;
                case 'ringWave': return bossPattern_RingWave;
                default: return bossPattern_SpiralOutward;
            }
        }

        // --- Missile Titan: Homing Missile System ---

        function spawnHomingMissile(x, y) {
            if (!currentBoss || !player) return;
            // Spawn facing AWAY from player in a random 180° arc
            const toPlayerAngle = Math.atan2(player.y - y, player.x - x);
            const awayAngle = toPlayerAngle + Math.PI; // opposite direction
            const angle = awayAngle + (Math.random() - 0.5) * Math.PI; // ±90° spread
            bossHomingMissiles.push({
                x: x,
                y: y,
                angle: angle,
                speed: 900,
                radius: 20,
                hp: 500,
                maxHp: 500,
                damage: 18,
                life: 10,
                trail: [],
                trailTimer: 0,
                straightTimer: 0.5
            });
            // Missile charge visual
            if (currentBoss) currentBoss.missileChargeTimer = 0;
            // Thruster burst at launch
            for (let i = 0; i < 6; i++) {
                const a = angle + Math.PI + (Math.random() - 0.5) * 1.2;
                const sp = 150 + Math.random() * 100;
                const colors = ['#FF4400', '#FF6600', '#FFD93D'];
                const p = pools.particle.acquire();
                p.x = x; p.y = y;
                p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp;
                p.life = 0.2 + Math.random() * 0.2; p.maxLife = 0.5;
                p.size = 10 + Math.random() * 8;
                p.color = colors[Math.floor(Math.random() * colors.length)];
                p.type = 'thruster';
                p.rotation = Math.random() * Math.PI * 2;
                p.rotationSpeed = (Math.random() - 0.5) * 2;
                particles.push(p);
            }
        }

        function explodeHomingMissile(m) {
            // 12 projectiles in a circle
            for (let j = 0; j < 12; j++) {
                const expAngle = (Math.PI * 2 / 12) * j;
                spawnBossProjectile(m.x, m.y, expAngle, BOSS_PROJ_SPEED * 0.9, {
                    color: '#FF6600',
                    radius: 6,
                    hp: 2,
                    life: 4
                });
            }
            // Single expanding ring (like enemy death / player missile impact)
            spawnRing(m.x, m.y, '#FF6600', 60);
            triggerShake(6, 200);
        }

        function updateHomingMissiles(dt) {
            if (!currentBoss || currentBoss.type !== 'missileTitan') return;

            const maxTurnRateSlow = 120 * Math.PI / 180; // 120 deg/s at min speed
            const maxTurnRateFast = 25 * Math.PI / 180;  // 25 deg/s at max speed
            const minSpeed = 250;
            const maxSpeed = 900;
            const accel = 400;  // speed gained per second when straight
            const decel = 1200; // speed lost per second when turning hard

            for (let i = bossHomingMissiles.length - 1; i >= 0; i--) {
                const m = bossHomingMissiles[i];

                // Turn rate scales down with speed: slow = agile, fast = stiff
                const speedFactor = (m.speed - minSpeed) / (maxSpeed - minSpeed);
                const currentTurnRate = maxTurnRateSlow + (maxTurnRateFast - maxTurnRateSlow) * speedFactor;

                // Fly straight for initial period, then steer toward player
                let turnFactor = 0; // 0 = straight, 1 = max turn
                if (m.straightTimer > 0) {
                    m.straightTimer -= dt;
                } else if (player) {
                    const dx = player.x - m.x;
                    const dy = player.y - m.y;
                    const desiredAngle = Math.atan2(dy, dx);
                    let angleDiff = desiredAngle - m.angle;
                    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                    // How hard are we turning (0-1)
                    turnFactor = Math.min(1, Math.abs(angleDiff) / (Math.PI * 0.5));
                    // Clamp turn rate (reduced at high speed)
                    const maxTurn = currentTurnRate * dt;
                    if (angleDiff > maxTurn) angleDiff = maxTurn;
                    else if (angleDiff < -maxTurn) angleDiff = -maxTurn;
                    m.angle += angleDiff;
                }

                // Speed: decelerate when turning, accelerate when straight
                const targetSpeed = maxSpeed - (maxSpeed - minSpeed) * turnFactor;
                if (m.speed < targetSpeed) {
                    m.speed = Math.min(targetSpeed, m.speed + accel * dt);
                } else {
                    m.speed = Math.max(targetSpeed, m.speed - decel * dt);
                }

                // Move in direction of rotation
                m.x += Math.cos(m.angle) * m.speed * dt;
                m.y += Math.sin(m.angle) * m.speed * dt;
                m.life -= dt;

                // Thruster triangle trail particles (like player thruster)
                m.trailTimer += dt;
                if (m.trailTimer >= 0.04) {
                    m.trailTimer -= 0.04;
                    const trailAngle = m.angle + Math.PI + (Math.random() - 0.5) * 0.3;
                    const trailSpeed = 200 + Math.random() * 80;
                    const colors = ['#FF4400', '#FF6600', '#FF8800', '#FFD93D'];
                    const p = pools.particle.acquire();
                    p.x = m.x - Math.cos(m.angle) * 15;
                    p.y = m.y - Math.sin(m.angle) * 15;
                    p.vx = Math.cos(trailAngle) * trailSpeed;
                    p.vy = Math.sin(trailAngle) * trailSpeed;
                    p.life = 0.15 + Math.random() * 0.15;
                    p.maxLife = 0.5;
                    p.size = 8 + Math.random() * 10;
                    p.color = colors[Math.floor(Math.random() * colors.length)];
                    p.type = 'thruster';
                    p.rotation = Math.random() * Math.PI * 2;
                    p.rotationSpeed = (Math.random() - 0.5) * 2;
                    particles.push(p);
                }

                // Trail positions for rendering (fading line like player rockets)
                m.trail.push({ x: m.x, y: m.y });
                if (m.trail.length > 16) m.trail.shift();

                // Remove if expired or outside arena
                let remove = m.life <= 0 || m.hp <= 0;
                if (!remove && arenaActive) {
                    const adx = m.x - arenaCenter.x;
                    const ady = m.y - arenaCenter.y;
                    if (adx * adx + ady * ady > (ARENA_RADIUS + 200) * (ARENA_RADIUS + 200)) {
                        remove = true;
                    }
                }

                if (remove) {
                    explodeHomingMissile(m);
                    bossHomingMissiles.splice(i, 1);
                }
            }
        }

        function renderHomingMissiles() {
            if (!currentBoss || currentBoss.type !== 'missileTitan') return;

            for (let i = 0; i < bossHomingMissiles.length; i++) {
                const m = bossHomingMissiles[i];

                // Fading line trail (like player rockets)
                if (m.trail.length > 1) {
                    for (let t = 0; t < m.trail.length - 1; t++) {
                        const alpha = 1 - (t / m.trail.length);
                        const width = 3 * (1 - t / m.trail.length);
                        ctx.strokeStyle = 'rgba(255, 102, 0, ' + (alpha * 0.6) + ')';
                        ctx.lineWidth = width;
                        ctx.beginPath();
                        ctx.moveTo(m.trail[t].x, m.trail[t].y);
                        ctx.lineTo(m.trail[t + 1].x, m.trail[t + 1].y);
                        ctx.stroke();
                    }
                }

                // Missile body
                ctx.save();
                ctx.translate(m.x, m.y);
                ctx.rotate(m.angle);

                // Main body (compact shape, same nose)
                setGlow(ctx, '#FF4400', 15);
                ctx.beginPath();
                ctx.moveTo(m.radius * 1.5, 0);            // nose (unchanged)
                ctx.lineTo(m.radius * 0.4, -m.radius * 0.45); // top wing
                ctx.lineTo(-m.radius * 0.25, -m.radius * 0.3); // top back
                ctx.lineTo(-m.radius * 0.15, 0);           // tail center
                ctx.lineTo(-m.radius * 0.25, m.radius * 0.3);  // bottom back
                ctx.lineTo(m.radius * 0.4, m.radius * 0.45);  // bottom wing
                ctx.closePath();

                // Solid fill with subtle metallic tone
                ctx.fillStyle = '#808080';
                ctx.fill();

                // Outline
                ctx.strokeStyle = '#FFD93D';
                ctx.lineWidth = 2;
                ctx.stroke();
                clearGlow(ctx);

                ctx.restore();
            }
        }

        // --- Missile Titan: Attack Patterns ---

        function bossPattern_HomingMissileBarrage(dt) {
            if (!currentBoss) return true;
            const state = bossPatternState;
            state.elapsed += dt;
            state.fireTimer += dt;

            const missileCount = currentBoss.phase === 2 ? 3 : 1;
            const burstInterval = 0.25;

            if (!state.fired) {
                state.fired = true;
                state.missilesLaunched = 0;
                // Charge-up visual
                if (currentBoss) currentBoss.missileChargeTimer = 0.5;
            }

            // Fire missiles one by one in burst after 0.5s charge
            if (state.elapsed >= 0.5 && state.missilesLaunched < missileCount) {
                if (state.fireTimer >= burstInterval) {
                    state.fireTimer -= burstInterval;
                    state.missilesLaunched++;
                    const boss = currentBoss;
                    // Spawn from a random point on boss perimeter
                    const spawnAngle = Math.random() * Math.PI * 2;
                    const sx = boss.x + Math.cos(spawnAngle) * (boss.size + 30);
                    const sy = boss.y + Math.sin(spawnAngle) * (boss.size + 30);
                    spawnHomingMissile(sx, sy);
                    triggerShake(4, 150);
                    // Small thruster burst per missile
                    for (let i = 0; i < 4; i++) {
                        const a = Math.random() * Math.PI * 2;
                        const sp = 80 + Math.random() * 60;
                        const colors = ['#FF4400', '#FF6600', '#FFD93D'];
                        const p = pools.particle.acquire();
                        p.x = sx; p.y = sy;
                        p.vx = Math.cos(a) * sp; p.vy = Math.sin(a) * sp;
                        p.life = 0.2; p.maxLife = 0.4;
                        p.size = 8 + Math.random() * 6;
                        p.color = colors[Math.floor(Math.random() * colors.length)];
                        p.type = 'thruster';
                        p.rotation = Math.random() * Math.PI * 2;
                        p.rotationSpeed = (Math.random() - 0.5) * 2;
                        particles.push(p);
                    }
                }
            }

            const totalDuration = 0.5 + missileCount * burstInterval + 0.3;
            return state.elapsed >= totalDuration;
        }

        function bossPattern_BarrageCannon(dt) {
            if (!currentBoss) return true;
            const state = bossPatternState;
            state.elapsed += dt;
            state.fireTimer += dt;

            const boss = currentBoss;
            const cannonCount = boss.phase === 2 ? 8 : 4;
            const burstCount = 3;
            const burstInterval = 0.2;
            const duration = boss.phase === 2 ? 3.5 : 2.5;
            const totalBursts = Math.floor(duration / burstInterval);

            if (state.fireTimer >= burstInterval && state.bursts < totalBursts) {
                state.fireTimer -= burstInterval;
                state.bursts++;

                const speed = boss.phase === 2 ? BOSS_PROJ_SPEED * 1.3 : BOSS_PROJ_SPEED;

                for (let c = 0; c < cannonCount; c++) {
                    const cannonAngle = (Math.PI * 2 / cannonCount) * c + boss.rotation * Math.PI / 180;
                    const sx = boss.x + Math.cos(cannonAngle) * boss.size;
                    const sy = boss.y + Math.sin(cannonAngle) * boss.size;

                    // Aim generally toward player with some spread from cannon position
                    const toPlayerAngle = Math.atan2(player.y - sy, player.x - sx);
                    const spread = 8 * Math.PI / 180;

                    for (let b = 0; b < burstCount; b++) {
                        const bulletAngle = toPlayerAngle + (b - 1) * spread;
                        spawnBossProjectile(sx, sy, bulletAngle, speed, {
                            radius: 6,
                            hp: 2,
                            color: '#FFD93D'
                        });
                    }
                }
            }

            return state.elapsed >= duration + 0.3;
        }

        // --- Missile Titan: Attack Sequences ---

        const MT_PHASE1_SEQUENCE = [
            { pattern: 'cornerBarrage4', pause: 2 },
            { pattern: 'homingMissile', pause: 1.5 },
            { pattern: 'barrageCannon', pause: 2 },
            { pattern: 'homingMissile', pause: 1.5 },
            { pattern: 'ringWave', pause: 2 }
        ];
        const MT_PHASE2_SEQUENCE = [
            { pattern: 'cornerBarrage8Fast', pause: 1 },
            { pattern: 'homingMissile', pause: 1 },
            { pattern: 'barrageCannon', pause: 1 },
            { pattern: 'homingMissile', pause: 1 },
            { pattern: 'ringWaveCornerCombo', pause: 1.5 }
        ];

        function getMTPattern(name) {
            switch (name) {
                case 'cornerBarrage4': return bossPattern_CornerBarrage;
                case 'cornerBarrage8Fast': return bossPattern_CornerBarrage;
                case 'homingMissile': return bossPattern_HomingMissileBarrage;
                case 'barrageCannon': return bossPattern_BarrageCannon;
                case 'ringWave': return bossPattern_RingWave;
                case 'ringWaveCornerCombo': return bossPattern_RingWaveCornerCombo;
                default: return bossPattern_SpiralOutward;
            }
        }

        function getMTPatternState(name) {
            const base = { elapsed: 0, fireTimer: 0, angle: 0, bursts: 0, fired: false, launched: false };
            switch (name) {
                case 'cornerBarrage4':
                    return { ...base, maxBursts: 4, double: false };
                case 'cornerBarrage8Fast':
                    return { ...base, maxBursts: 8, double: true };
                case 'ringWaveCornerCombo':
                    return { ...base, comboPhase: 0 };
                default:
                    return base;
            }
        }

        // Combined RingWave + CornerBarrage for phase 2 combo
        function bossPattern_RingWaveCornerCombo(dt) {
            if (!currentBoss) return true;
            const state = bossPatternState;
            state.elapsed += dt;

            // Fire ring wave immediately
            if (!state.ringFired) {
                state.ringFired = true;
                const count = 24;
                const speed = BOSS_PROJ_SPEED * 1.4;
                for (let i = 0; i < count; i++) {
                    const angle = (Math.PI * 2 / count) * i;
                    spawnBossProjectile(currentBoss.x, currentBoss.y, angle, speed);
                }
            }

            // Fire corner barrage 0.3s later
            if (state.elapsed >= 0.3) {
                state.fireTimer += dt;
                const fireInterval = 0.35;
                if (state.fireTimer >= fireInterval && state.bursts < 6) {
                    state.fireTimer -= fireInterval;
                    state.bursts++;
                    const boss = currentBoss;
                    const sides = boss.sides;
                    const speed = BOSS_PROJ_SPEED * 1.4;
                    for (let i = 0; i < sides; i++) {
                        const vertexAngle = (Math.PI * 2 / sides) * i + boss.rotation * Math.PI / 180;
                        const spawnX = boss.x + Math.cos(vertexAngle) * boss.size;
                        const spawnY = boss.y + Math.sin(vertexAngle) * boss.size;
                        spawnBossProjectile(spawnX, spawnY, vertexAngle, speed);
                    }
                }
            }

            return state.elapsed >= 2.5;
        }

        // --- Lightning Nexus: Grid Lightning Strike System ---

        // Compute line-circle intersection: line at given angle through arena center + perpendicular offset
        function computeLineEndpoints(angle, offset) {
            const cx = arenaCenter.x;
            const cy = arenaCenter.y;
            const R = ARENA_RADIUS;

            // Line direction vector
            const dirX = Math.cos(angle);
            const dirY = Math.sin(angle);

            // Perpendicular offset from center
            const perpX = -dirY;
            const perpY = dirX;

            // Point on line closest to center
            const px = cx + perpX * offset;
            const py = cy + perpY * offset;

            // Half-length of chord: sqrt(R^2 - offset^2)
            const offsetSq = offset * offset;
            if (offsetSq >= R * R) return null;
            const halfChord = Math.sqrt(R * R - offsetSq);

            return {
                startX: px - dirX * halfChord,
                startY: py - dirY * halfChord,
                endX: px + dirX * halfChord,
                endY: py + dirY * halfChord
            };
        }

        // Generate N evenly spaced offsets across the arena diameter
        function computeEvenOffsets(count) {
            const offsets = [];
            for (let i = 0; i < count; i++) {
                offsets.push(ARENA_RADIUS * ((i + 1) / (count + 1) * 2 - 1));
            }
            return offsets;
        }

        function initLightningLines(patternType) {
            bossLightningStrikes = [];
            const lineDefs = []; // { angle, offset }

            if (patternType === 'gridVH') {
                // 3 vertical + 3 horizontal
                const offsets3 = computeEvenOffsets(3);
                for (const d of offsets3) lineDefs.push({ angle: Math.PI / 2, offset: d });
                for (const d of offsets3) lineDefs.push({ angle: 0, offset: d });
            } else if (patternType === 'singleDiagonal') {
                // X cross: both diagonals through center
                lineDefs.push({ angle: Math.PI / 4, offset: 0 });
                lineDefs.push({ angle: 3 * Math.PI / 4, offset: 0 });
            } else if (patternType === 'gridDiag3') {
                const offsets3 = computeEvenOffsets(3);
                for (const d of offsets3) lineDefs.push({ angle: Math.PI / 4, offset: d });
                for (const d of offsets3) lineDefs.push({ angle: 3 * Math.PI / 4, offset: d });
            } else if (patternType === 'vertical5') {
                const offsets5 = computeEvenOffsets(5);
                for (const d of offsets5) lineDefs.push({ angle: Math.PI / 2, offset: d });
            } else if (patternType === 'horizontal5') {
                const offsets5 = computeEvenOffsets(5);
                for (const d of offsets5) lineDefs.push({ angle: 0, offset: d });
            } else if (patternType === 'gridDiag5') {
                const offsets5 = computeEvenOffsets(5);
                for (const d of offsets5) lineDefs.push({ angle: Math.PI / 4, offset: d });
                for (const d of offsets5) lineDefs.push({ angle: 3 * Math.PI / 4, offset: d });
            }

            for (const def of lineDefs) {
                const ep = computeLineEndpoints(def.angle, def.offset);
                if (!ep) continue;
                const strike = {
                    startX: ep.startX,
                    startY: ep.startY,
                    endX: ep.endX,
                    endY: ep.endY,
                    phase: 'telegraph',
                    timer: 0,
                    zigzag: []
                };
                for (let j = 0; j < 12; j++) {
                    strike.zigzag.push((Math.random() - 0.5) * 30);
                }
                bossLightningStrikes.push(strike);
            }
        }

        function updateLightningStrikes(dt) {
            if (!currentBoss || currentBoss.type !== 'lightningNexus') return;
            if (bossLightningStrikes.length === 0) return;

            let allDone = true;
            for (const s of bossLightningStrikes) {
                s.timer += dt;

                if (s.phase === 'telegraph') {
                    if (s.timer >= 1.5) {
                        s.phase = 'fire';
                        s.timer = 0;
                        triggerShake(6, 200);
                        for (let j = 0; j < s.zigzag.length; j++) {
                            s.zigzag[j] = (Math.random() - 0.5) * 40;
                        }
                    }
                    allDone = false;
                } else if (s.phase === 'fire') {
                    if (Math.random() < 0.5) {
                        for (let j = 0; j < s.zigzag.length; j++) {
                            s.zigzag[j] = (Math.random() - 0.5) * 40;
                        }
                    }
                    if (s.timer >= 0.5) {
                        s.phase = 'cooldown';
                        s.timer = 0;
                    }
                    allDone = false;
                } else if (s.phase === 'cooldown') {
                    if (s.timer < 1.0) {
                        allDone = false;
                    }
                }
            }

            if (allDone) {
                bossLightningStrikes = [];
            }
        }

        function checkLightningStrikeCollisions() {
            if (!currentBoss || currentBoss.type !== 'lightningNexus') return;
            if (player.invulnerable > 0) return;

            for (const s of bossLightningStrikes) {
                if (s.phase !== 'fire') continue;

                // Line-vs-circle collision using stored endpoints
                const dx = s.endX - s.startX;
                const dy = s.endY - s.startY;
                const lenSq = dx * dx + dy * dy;
                let t = ((player.x - s.startX) * dx + (player.y - s.startY) * dy) / lenSq;
                t = Math.max(0, Math.min(1, t));
                const closestX = s.startX + t * dx;
                const closestY = s.startY + t * dy;
                const distX = player.x - closestX;
                const distY = player.y - closestY;
                const dist = Math.sqrt(distX * distX + distY * distY);

                if (dist < 12.5 + PLAYER_COLLISION_RADIUS) {
                    damagePlayer();
                    triggerShake(8, 200);
                    triggerFlash('#9F7AEA', 0.3, 150);
                    spawnRing(player.x, player.y, '#9F7AEA', 30);
                    break;
                }
            }
        }

        function renderLightningStrikes() {
            if (!currentBoss || currentBoss.type !== 'lightningNexus') return;
            if (bossLightningStrikes.length === 0) return;

            for (const s of bossLightningStrikes) {
                if (s.phase === 'telegraph') {
                    const blink = Math.sin(s.timer * 12) > 0 ? 0.4 : 0.15;
                    ctx.save();
                    ctx.beginPath();
                    ctx.moveTo(s.startX, s.startY);
                    ctx.lineTo(s.endX, s.endY);
                    ctx.strokeStyle = '#FFD700';
                    ctx.lineWidth = 3;
                    ctx.globalAlpha = blink;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                    ctx.restore();
                } else if (s.phase === 'fire') {
                    ctx.save();
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';

                    const dx = s.endX - s.startX;
                    const dy = s.endY - s.startY;
                    const len = Math.sqrt(dx * dx + dy * dy);
                    const perpX = -dy / len;
                    const perpY = dx / len;
                    const segments = s.zigzag.length;

                    // 3 layers on the same zigzag path (like player lightning)
                    for (let layer = 2; layer >= 0; layer--) {
                        ctx.beginPath();
                        ctx.moveTo(s.startX, s.startY);
                        for (let i = 1; i < segments; i++) {
                            const t = i / segments;
                            const bx = s.startX + dx * t;
                            const by = s.startY + dy * t;
                            ctx.lineTo(bx + perpX * s.zigzag[i], by + perpY * s.zigzag[i]);
                        }
                        ctx.lineTo(s.endX, s.endY);

                        if (layer === 0) {
                            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
                            ctx.lineWidth = 2;
                        } else if (layer === 1) {
                            ctx.strokeStyle = 'rgba(159, 122, 234, 0.7)';
                            ctx.lineWidth = 5;
                        } else {
                            ctx.strokeStyle = 'rgba(99, 179, 237, 0.4)';
                            ctx.lineWidth = 10;
                        }
                        ctx.stroke();
                    }

                    ctx.restore();
                }
            }
        }

        // Lightning Lines pattern function — fires lightning + projectiles simultaneously
        function bossPattern_LightningLines(dt) {
            if (!currentBoss) return true;
            const state = bossPatternState;
            state.elapsed += dt;
            state.fireTimer += dt;

            if (!state.initialized) {
                state.initialized = true;
                initLightningLines(state.lineType);
            }

            // Simultaneous projectile fire during the pattern
            const boss = currentBoss;
            const projType = state.projType || 'spiral';
            const isP2 = boss.phase === 2;
            const speed = isP2 ? BOSS_PROJ_SPEED * 1.4 : BOSS_PROJ_SPEED;

            if (projType === 'spiral') {
                // Continuous spiral fire throughout the pattern
                const interval = isP2 ? 0.08 : 0.12;
                if (state.fireTimer >= interval) {
                    state.fireTimer -= interval;
                    if (!state.spiralAngle) state.spiralAngle = 0;
                    spawnBossProjectile(boss.x, boss.y, state.spiralAngle, speed);
                    if (isP2) {
                        // Double spiral in P2
                        spawnBossProjectile(boss.x, boss.y, state.spiralAngle + Math.PI, speed);
                    }
                    state.spiralAngle += 15 * Math.PI / 180;
                }
            } else if (projType === 'burst') {
                // Repeated ring bursts
                const interval = isP2 ? 0.7 : 1.0;
                const count = isP2 ? 32 : 20;
                if (state.fireTimer >= interval && state.bursts < (isP2 ? 4 : 3)) {
                    state.fireTimer -= interval;
                    state.bursts++;
                    const offset = state.bursts * (Math.PI / count);
                    for (let i = 0; i < count; i++) {
                        const angle = (Math.PI * 2 / count) * i + offset;
                        spawnBossProjectile(boss.x, boss.y, angle, speed);
                    }
                }
            } else if (projType === 'corner') {
                // Corner barrage from vertices
                const interval = isP2 ? 0.25 : 0.4;
                const maxBursts = isP2 ? 10 : 6;
                if (state.fireTimer >= interval && state.bursts < maxBursts) {
                    state.fireTimer -= interval;
                    state.bursts++;
                    const sides = boss.sides;
                    for (let i = 0; i < sides; i++) {
                        const vAngle = (Math.PI * 2 / sides) * i + boss.rotation * Math.PI / 180;
                        const sx = boss.x + Math.cos(vAngle) * boss.size;
                        const sy = boss.y + Math.sin(vAngle) * boss.size;
                        spawnBossProjectile(sx, sy, vAngle, speed);
                        if (isP2) {
                            spawnBossProjectile(sx, sy, vAngle + 12 * Math.PI / 180, speed * 0.85);
                            spawnBossProjectile(sx, sy, vAngle - 12 * Math.PI / 180, speed * 0.85);
                        }
                    }
                }
            }

            // Total duration: 1.5 (telegraph) + 0.5 (fire) + 1.0 (cooldown) = 3.0s
            return state.elapsed >= 3.0;
        }

        // --- Lightning Nexus: Chasing Electric Trail ---

        function spawnTrailNode() {
            if (!currentBoss || !player) return;
            const isP2 = currentBoss.phase === 2;
            bossTrailNodes.push({
                x: player.x,
                y: player.y,
                radius: 0,
                maxRadius: 48,
                growing: true,
                growTimer: 0,
                maxGrowTime: isP2 ? 1.0 : 1.5,
                active: false,
                hp: 1066,
                maxHp: 1066
            });
        }

        function destroyTrailNode(nodeIndex) {
            const node = bossTrailNodes[nodeIndex];
            if (!node) return;

            // Find incoming ray (ends at this node) and outgoing ray (starts from this node)
            let incomingIdx = -1;
            let outgoingIdx = -1;
            for (let i = 0; i < bossTrailRays.length; i++) {
                const r = bossTrailRays[i];
                if (r.endX === node.x && r.endY === node.y) incomingIdx = i;
                if (r.startX === node.x && r.startY === node.y) outgoingIdx = i;
            }

            // Merge rays: outgoing ray's start becomes incoming ray's start
            if (incomingIdx !== -1 && outgoingIdx !== -1) {
                bossTrailRays[outgoingIdx].startX = bossTrailRays[incomingIdx].startX;
                bossTrailRays[outgoingIdx].startY = bossTrailRays[incomingIdx].startY;
                bossTrailRays.splice(incomingIdx, 1);
            } else if (incomingIdx !== -1) {
                // Last node in chain — just remove incoming ray
                bossTrailRays.splice(incomingIdx, 1);
            } else if (outgoingIdx !== -1) {
                // First node — reconnect outgoing to boss
                bossTrailRays[outgoingIdx].startX = currentBoss ? currentBoss.x : bossTrailRays[outgoingIdx].startX;
                bossTrailRays[outgoingIdx].startY = currentBoss ? currentBoss.y : bossTrailRays[outgoingIdx].startY;
            }

            // Death shockwave — 12 projectiles from node edges
            const bossColor = currentBoss ? currentBoss.color : '#9F7AEA';
            for (let j = 0; j < 12; j++) {
                const expAngle = (Math.PI * 2 / 12) * j;
                const edgeX = node.x + Math.cos(expAngle) * node.radius;
                const edgeY = node.y + Math.sin(expAngle) * node.radius;
                spawnBossProjectile(edgeX, edgeY, expAngle, BOSS_PROJ_SPEED * 0.9, {
                    color: bossColor,
                    radius: 6,
                    hp: 2,
                    life: 4
                });
            }
            spawnRing(node.x, node.y, bossColor, 40);
            spawnRing(node.x, node.y, bossColor, 60);
            triggerShake(6, 200);

            bossTrailNodes.splice(nodeIndex, 1);
        }

        function updateTrailNodes(dt) {
            if (!currentBoss || currentBoss.type !== 'lightningNexus') return;
            const isP2 = currentBoss.phase === 2;

            // Spawn new nodes on timer
            bossTrailTimer -= dt;
            if (bossTrailTimer <= 0) {
                spawnTrailNode();
                bossTrailTimer = isP2 ? 2.0 : 3.0;
            }

            // Update growing nodes
            for (const node of bossTrailNodes) {
                if (!node.growing) continue;
                node.growTimer += dt;
                node.radius = node.maxRadius * Math.min(1, node.growTimer / node.maxGrowTime);

                // Growth complete — activate and create connecting ray
                if (node.growTimer >= node.maxGrowTime) {
                    node.growing = false;
                    node.active = true;

                    // Find previous active node for ray connection
                    let prevX = currentBoss.x;
                    let prevY = currentBoss.y;
                    const activeNodes = bossTrailNodes.filter(n => n.active && n !== node);
                    if (activeNodes.length > 0) {
                        const prev = activeNodes[activeNodes.length - 1];
                        prevX = prev.x;
                        prevY = prev.y;
                    }

                    bossTrailRays.push({
                        startX: prevX,
                        startY: prevY,
                        endX: node.x,
                        endY: node.y
                    });
                }
            }

            // Cap at 10 nodes — remove oldest node + its incoming ray, reconnect next ray
            while (bossTrailNodes.length > 10) {
                bossTrailNodes.shift();
                if (bossTrailRays.length > 0) bossTrailRays.shift();
                // Reconnect the next ray's start to the boss (since its previous start node was removed)
                if (bossTrailRays.length > 0) {
                    bossTrailRays[0].startX = currentBoss.x;
                    bossTrailRays[0].startY = currentBoss.y;
                }
            }
        }

        function checkTrailCollisions() {
            if (!currentBoss || currentBoss.type !== 'lightningNexus') return;
            if (player.invulnerable > 0) return;
            if (player._bossDmgCooldown > 0) return;

            // Check circle borders (ring collision)
            for (const node of bossTrailNodes) {
                if (!node.active) continue; // only damage when fully grown
                const dx = player.x - node.x;
                const dy = player.y - node.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const ringDist = Math.abs(dist - node.radius);
                if (ringDist < 15 + PLAYER_COLLISION_RADIUS) {
                    player._bossDmgCooldown = 0.12;
                    damagePlayer();
                    triggerShake(6, 150);
                    triggerFlash('#9F7AEA', 0.3, 150);
                    spawnRing(player.x, player.y, '#00FFFF', 25);
                    return;
                }
            }

            // Check rays (line segment collision)
            for (const ray of bossTrailRays) {
                const dx = ray.endX - ray.startX;
                const dy = ray.endY - ray.startY;
                const lenSq = dx * dx + dy * dy;
                if (lenSq === 0) continue;
                let t = ((player.x - ray.startX) * dx + (player.y - ray.startY) * dy) / lenSq;
                t = Math.max(0, Math.min(1, t));
                const closestX = ray.startX + t * dx;
                const closestY = ray.startY + t * dy;
                const distX = player.x - closestX;
                const distY = player.y - closestY;
                const dist = Math.sqrt(distX * distX + distY * distY);

                if (dist < 12.5 + PLAYER_COLLISION_RADIUS) {
                    player._bossDmgCooldown = 0.12;
                    damagePlayer();
                    triggerShake(6, 150);
                    triggerFlash('#9F7AEA', 0.3, 150);
                    spawnRing(player.x, player.y, '#9F7AEA', 25);
                    return;
                }
            }
        }

        function renderTrailNodes() {
            if (!currentBoss || currentBoss.type !== 'lightningNexus') return;

            // Render rays (lightning bolts between nodes)
            for (const ray of bossTrailRays) {
                const dx = ray.endX - ray.startX;
                const dy = ray.endY - ray.startY;
                const len = Math.sqrt(dx * dx + dy * dy);
                if (len < 1) continue;
                const perpX = -dy / len;
                const perpY = dx / len;
                const segments = Math.max(8, Math.floor(len / 40));

                // Single zigzag path, regenerated each frame
                const zigzag = [];
                for (let i = 0; i <= segments; i++) {
                    zigzag.push(i === 0 || i === segments ? 0 : (Math.random() - 0.5) * 25);
                }

                ctx.save();
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                // 3 layers on the same zigzag (like player lightning)
                for (let layer = 2; layer >= 0; layer--) {
                    ctx.beginPath();
                    for (let i = 0; i <= segments; i++) {
                        const frac = i / segments;
                        const x = ray.startX + dx * frac + perpX * zigzag[i];
                        const y = ray.startY + dy * frac + perpY * zigzag[i];
                        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
                    }

                    if (layer === 0) {
                        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
                        ctx.lineWidth = 1.5;
                    } else if (layer === 1) {
                        ctx.strokeStyle = 'rgba(159, 122, 234, 0.6)';
                        ctx.lineWidth = 3;
                    } else {
                        ctx.strokeStyle = 'rgba(99, 179, 237, 0.35)';
                        ctx.lineWidth = 6;
                    }
                    ctx.stroke();
                }

                ctx.restore();
            }

            // Render nodes (electrified circles)
            for (const node of bossTrailNodes) {
                if (node.radius < 2) continue;

                ctx.save();
                ctx.translate(node.x, node.y);

                if (node.growing) {
                    // Growing: pulsing electric circle with crackling border
                    const pulse = 0.6 + 0.4 * Math.sin(gameTime * 12);
                    const blink = Math.sin(gameTime * 20) > 0 ? 1.0 : 0.5;

                    // Outer electric glow
                    setGlow(ctx, '#00FFFF', 12);
                    ctx.beginPath();
                    ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(0, 255, 255, ${0.4 * blink * pulse})`;
                    ctx.lineWidth = 4;
                    ctx.stroke();
                    clearGlow(ctx);

                    // Inner purple ring
                    ctx.beginPath();
                    ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(159, 122, 234, ${0.6 * pulse})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();

                    // Electric crackle sparks along circumference
                    const sparkCount = 6;
                    for (let i = 0; i < sparkCount; i++) {
                        const angle = (Math.PI * 2 / sparkCount) * i + gameTime * 3;
                        const sx = Math.cos(angle) * node.radius;
                        const sy = Math.sin(angle) * node.radius;
                        const jx = (Math.random() - 0.5) * 12;
                        const jy = (Math.random() - 0.5) * 12;
                        ctx.beginPath();
                        ctx.moveTo(sx, sy);
                        ctx.lineTo(sx + jx, sy + jy);
                        ctx.strokeStyle = `rgba(0, 255, 255, ${0.8 * blink})`;
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                } else {
                    // Active: solid electric circle — flickers when damaged
                    const hpRatio = node.hp / node.maxHp;
                    const damaged = hpRatio < 1;
                    const flicker = damaged ? (Math.sin(gameTime * 25) > 0 ? 1.0 : 0.4) : 1.0;
                    const baseAlpha = damaged ? (0.3 + 0.5 * hpRatio) : 0.5;

                    setGlow(ctx, damaged ? '#FF4444' : '#9F7AEA', 8);
                    ctx.beginPath();
                    ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(${damaged ? '255, 68, 68' : '159, 122, 234'}, ${baseAlpha * flicker})`;
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    clearGlow(ctx);

                    // Subtle cyan inner ring
                    ctx.beginPath();
                    ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(0, 255, 255, ${0.2 * flicker})`;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();

                    // Faint fill
                    ctx.beginPath();
                    ctx.arc(0, 0, node.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(${damaged ? '255, 68, 68' : '159, 122, 234'}, 0.05)`;
                    ctx.fill();

                    // Damage sparks when low HP
                    if (hpRatio < 0.4) {
                        for (let i = 0; i < 3; i++) {
                            const angle = Math.random() * Math.PI * 2;
                            const sx = Math.cos(angle) * node.radius;
                            const sy = Math.sin(angle) * node.radius;
                            ctx.beginPath();
                            ctx.moveTo(sx, sy);
                            ctx.lineTo(sx + (Math.random() - 0.5) * 16, sy + (Math.random() - 0.5) * 16);
                            ctx.strokeStyle = `rgba(255, 68, 68, ${0.8 * flicker})`;
                            ctx.lineWidth = 2;
                            ctx.stroke();
                        }
                    }
                }

                ctx.restore();
            }
        }

        // --- Lightning Nexus: Custom Renderer ---

        function renderLightningNexus() {
            const boss = currentBoss;
            const sides = 8; // octagon
            const size = boss.size;

            ctx.save();
            ctx.translate(boss.x, boss.y);
            ctx.rotate(boss.rotation * Math.PI / 180);

            // Pulsating aura
            const auraPulse = Math.sin(gameTime * 5) * 0.15 + 0.25;
            ctx.beginPath();
            ctx.arc(0, 0, size + 25 + Math.sin(gameTime * 3) * 8, 0, Math.PI * 2);
            ctx.fillStyle = '#9F7AEA';
            ctx.globalAlpha = auraPulse * (boss.phase === 2 ? 1.4 : 1);
            ctx.fill();
            ctx.globalAlpha = 1;

            // Outer glow ring
            ctx.beginPath();
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
                const px = Math.cos(angle) * (size + 10);
                const py = Math.sin(angle) * (size + 10);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.strokeStyle = '#9F7AEA';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.4 + Math.sin(gameTime * 4) * 0.2;
            setGlow(ctx, '#9F7AEA', 20);
            ctx.stroke();
            clearGlow(ctx);
            ctx.globalAlpha = 1;

            // Main body octagon
            const vertices = [];
            ctx.beginPath();
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
                const px = Math.cos(angle) * size;
                const py = Math.sin(angle) * size;
                vertices.push({ x: px, y: py });
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();

            // Fill with purple gradient
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
            gradient.addColorStop(0, '#9F7AEA');
            gradient.addColorStop(0.5, '#9F7AEA88');
            gradient.addColorStop(1, '#9F7AEA22');
            ctx.fillStyle = gradient;
            ctx.globalAlpha = boss.phase === 2 ? 0.7 : 0.5;
            ctx.fill();
            ctx.globalAlpha = 1;

            // Border
            ctx.strokeStyle = '#9F7AEA';
            ctx.lineWidth = boss.phase === 2 ? 3 : 2;
            ctx.stroke();

            // Flash white on damage
            if (boss.flashTimer > 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, ' + Math.min(boss.flashTimer / 0.1, 0.6) + ')';
                ctx.fill();
            }

            // Electric arcs between vertices — single zigzag, 3 layers
            const arcCount = sides;
            for (let i = 0; i < arcCount; i++) {
                const v1 = vertices[i];
                const v2 = vertices[(i + 1) % sides];
                const arcDx = v2.x - v1.x;
                const arcDy = v2.y - v1.y;
                const arcLen = Math.sqrt(arcDx * arcDx + arcDy * arcDy);
                if (arcLen < 1) continue;
                const arcPerpX = -arcDy / arcLen;
                const arcPerpY = arcDx / arcLen;

                // Generate single zigzag path
                const segCount = 5;
                const zigzag = [];
                for (let s = 0; s <= segCount; s++) {
                    zigzag.push(s === 0 || s === segCount ? 0 : (Math.random() - 0.5) * 14);
                }

                const isP2 = boss.phase === 2;
                for (let layer = 2; layer >= 0; layer--) {
                    ctx.beginPath();
                    for (let s = 0; s <= segCount; s++) {
                        const t = s / segCount;
                        const bx = v1.x + arcDx * t + arcPerpX * zigzag[s];
                        const by = v1.y + arcDy * t + arcPerpY * zigzag[s];
                        if (s === 0) ctx.moveTo(bx, by); else ctx.lineTo(bx, by);
                    }

                    if (layer === 0) {
                        ctx.strokeStyle = `rgba(255, 255, 255, ${isP2 ? 0.8 : 0.5})`;
                        ctx.lineWidth = 1;
                    } else if (layer === 1) {
                        ctx.strokeStyle = `rgba(0, 255, 255, ${isP2 ? 0.6 : 0.35})`;
                        ctx.lineWidth = 2;
                    } else {
                        ctx.strokeStyle = `rgba(159, 122, 234, ${isP2 ? 0.3 : 0.15})`;
                        ctx.lineWidth = 4;
                    }
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.stroke();
                }
            }

            // Pulsating center core
            const coreSize = 14 + Math.sin(gameTime * 6) * 5;
            ctx.beginPath();
            ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
            ctx.fillStyle = '#FFFFFF';
            ctx.globalAlpha = 0.7 + Math.sin(gameTime * 8) * 0.3;
            ctx.fill();
            ctx.globalAlpha = 1;

            // Inner electric ring
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
            ctx.strokeStyle = '#00FFFF';
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.3 + Math.sin(gameTime * 7) * 0.15;
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Phase 2: inner octagon spinning opposite + constant spark particles
            if (boss.phase === 2) {
                ctx.save();
                ctx.rotate(-boss.rotation * 2 * Math.PI / 180);
                ctx.beginPath();
                for (let i = 0; i < sides; i++) {
                    const angle = (Math.PI * 2 / sides) * i;
                    const px = Math.cos(angle) * (size * 0.55);
                    const py = Math.sin(angle) * (size * 0.55);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.strokeStyle = '#00FFFF';
                ctx.lineWidth = 1.5;
                ctx.globalAlpha = 0.5;
                ctx.stroke();
                ctx.globalAlpha = 1;
                ctx.restore();
            }

            ctx.restore();

            // Phase 2 constant spark particles (outside translate/rotate context)
            if (boss.phase === 2 && Math.random() < 0.4) {
                const sparkAngle = Math.random() * Math.PI * 2;
                const sparkDist = boss.size + Math.random() * 30;
                const sx = boss.x + Math.cos(sparkAngle) * sparkDist;
                const sy = boss.y + Math.sin(sparkAngle) * sparkDist;
                const p = pools.particle.acquire();
                p.x = sx; p.y = sy;
                p.vx = (Math.random() - 0.5) * 80;
                p.vy = (Math.random() - 0.5) * 80;
                p.life = 0.25; p.maxLife = 0.25;
                p.size = 3 + Math.random() * 4;
                p.color = Math.random() < 0.5 ? '#9F7AEA' : '#00FFFF';
                p.type = 'spark';
                particles.push(p);
            }
        }

        // --- Lightning Nexus: Attack Sequences ---

        const LN_PHASE1_SEQUENCE = [
            { pattern: 'gridVH', proj: 'spiral', pause: 2 },
            { pattern: 'singleDiagonal', proj: 'corner', pause: 2 },
            { pattern: 'gridDiag3', proj: 'burst', pause: 2 }
        ];
        const LN_PHASE2_SEQUENCE = [
            { pattern: 'vertical5', proj: 'corner', pause: 1 },
            { pattern: 'horizontal5', proj: 'burst', pause: 1 },
            { pattern: 'gridDiag5', proj: 'spiral', pause: 1 }
        ];

        function getLNPattern(name) {
            return bossPattern_LightningLines;
        }

        function getLNPatternState(entry) {
            return {
                elapsed: 0, fireTimer: 0, angle: 0, bursts: 0, fired: false,
                initialized: false, lineType: entry.pattern, projType: entry.proj
            };
        }

        // --- Plasma Overlord (Boss 3) ---

        function initPlasmaRings(patternType) {
            bossPlasmaRings = [];
            const cx = arenaCenter.x;
            const cy = arenaCenter.y;
            const R = ARENA_RADIUS; // 1200

            if (patternType === 'singleDonut') {
                // One big donut at ~55% arena radius, 120px thick
                bossPlasmaRings.push({
                    centerX: cx, centerY: cy,
                    innerRadius: R * 0.5, outerRadius: R * 0.6,
                    phase: 'telegraph', timer: 0, delay: 0,
                    expanding: false, expandSpeed: 0, maxOuterRadius: R * 0.6, thickness: R * 0.1
                });
            } else if (patternType === 'concentricTriple') {
                // 3 concentric donuts spanning most of the arena
                const radii = [R * 0.25, R * 0.5, R * 0.8];
                const thicknesses = [R * 0.08, R * 0.1, R * 0.1];
                for (let i = 0; i < 3; i++) {
                    const half = thicknesses[i] / 2;
                    bossPlasmaRings.push({
                        centerX: cx, centerY: cy,
                        innerRadius: radii[i] - half, outerRadius: radii[i] + half,
                        phase: 'waiting', timer: 0, delay: i * 0.3,
                        expanding: false, expandSpeed: 0, maxOuterRadius: radii[i] + half, thickness: thicknesses[i]
                    });
                }
            } else if (patternType === 'pincerWave') {
                // Inner ring: expands from boss to half arena (deals damage while moving)
                const t = R * 0.08;
                bossPlasmaRings.push({
                    centerX: cx, centerY: cy,
                    innerRadius: 80, outerRadius: 80 + t,
                    phase: 'fire', timer: 0, delay: 0,
                    expanding: false, expandInFire: true, expandSpeed: 500, maxOuterRadius: R * 0.5, thickness: t
                });
                // Outer ring: telegraphs at ~75% arena, fires when inner arrives
                bossPlasmaRings.push({
                    centerX: cx, centerY: cy,
                    innerRadius: R * 0.7, outerRadius: R * 0.7 + t,
                    phase: 'telegraph', timer: 0, delay: 0,
                    expanding: false, expandInFire: false, expandSpeed: 0, maxOuterRadius: R * 0.7 + t, thickness: t
                });
            }
        }

        function updatePlasmaRings(dt) {
            if (!currentBoss || currentBoss.type !== 'plasmaOverlord') return;
            if (bossPlasmaRings.length === 0) return;

            let allDone = true;
            for (const r of bossPlasmaRings) {
                // Handle delayed start
                if (r.phase === 'waiting') {
                    r.delay -= dt;
                    if (r.delay <= 0) {
                        r.phase = 'telegraph';
                        r.timer = 0;
                    }
                    allDone = false;
                    continue;
                }

                r.timer += dt;

                if (r.phase === 'telegraph') {
                    // Static expanding donuts snap to final position for telegraph
                    if (r.expanding && r.outerRadius < r.maxOuterRadius) {
                        r.outerRadius = r.maxOuterRadius;
                        r.innerRadius = r.maxOuterRadius - r.thickness;
                        r.expanding = false;
                    }
                    if (r.timer >= 1.2) {
                        r.phase = 'fire';
                        r.timer = 0;
                        triggerShake(5, 150);
                    }
                    allDone = false;
                } else if (r.phase === 'fire') {
                    // expandInFire rings grow outward during fire (shockwave)
                    if (r.expandInFire && r.outerRadius < r.maxOuterRadius) {
                        r.innerRadius += r.expandSpeed * dt;
                        r.outerRadius += r.expandSpeed * dt;
                        if (r.outerRadius >= r.maxOuterRadius) {
                            r.outerRadius = r.maxOuterRadius;
                            r.innerRadius = r.maxOuterRadius - r.thickness;
                        }
                    }
                    // expandInFire rings end when they reach max; static rings use 0.7s
                    const fireDone = r.expandInFire ? (r.outerRadius >= r.maxOuterRadius) : (r.timer >= 0.7);
                    if (fireDone) {
                        r.phase = 'cooldown';
                        r.timer = 0;
                    }
                    allDone = false;
                } else if (r.phase === 'cooldown') {
                    if (r.timer < 0.8) {
                        allDone = false;
                    }
                }
            }

            if (allDone) {
                bossPlasmaRings = [];
            }
        }

        function checkPlasmaRingCollisions() {
            if (!currentBoss || currentBoss.type !== 'plasmaOverlord') return;
            if (player.invulnerable > 0) return;

            for (const r of bossPlasmaRings) {
                if (r.phase !== 'fire') continue;

                const dx = player.x - r.centerX;
                const dy = player.y - r.centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Player is inside the donut band if dist is between innerRadius and outerRadius
                if (dist >= r.innerRadius - PLAYER_COLLISION_RADIUS && dist <= r.outerRadius + PLAYER_COLLISION_RADIUS) {
                    damagePlayer();
                    triggerShake(8, 200);
                    triggerFlash('#FF6600', 0.3, 150);
                    spawnRing(player.x, player.y, '#FF6600', 30);
                    break;
                }
            }
        }

        function renderPlasmaRings() {
            if (!currentBoss || currentBoss.type !== 'plasmaOverlord') return;
            if (bossPlasmaRings.length === 0) return;

            for (const r of bossPlasmaRings) {
                if (r.phase === 'waiting') continue;

                if (r.phase === 'telegraph') {
                    // Blinking semitransparent orange/red donut
                    const blink = Math.sin(r.timer * 14) > 0 ? 0.35 : 0.1;
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(r.centerX, r.centerY, (r.innerRadius + r.outerRadius) / 2, 0, Math.PI * 2);
                    ctx.lineWidth = r.outerRadius - r.innerRadius;
                    ctx.strokeStyle = '#FF4400';
                    ctx.globalAlpha = blink;
                    ctx.stroke();
                    // Inner edge line
                    ctx.beginPath();
                    ctx.arc(r.centerX, r.centerY, r.innerRadius, 0, Math.PI * 2);
                    ctx.lineWidth = 1.5;
                    ctx.strokeStyle = '#FF6600';
                    ctx.globalAlpha = blink * 0.8;
                    ctx.stroke();
                    // Outer edge line
                    ctx.beginPath();
                    ctx.arc(r.centerX, r.centerY, r.outerRadius, 0, Math.PI * 2);
                    ctx.lineWidth = 1.5;
                    ctx.strokeStyle = '#FF6600';
                    ctx.globalAlpha = blink * 0.8;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                    ctx.restore();
                } else if (r.phase === 'fire') {
                    // Solid plasma donut with fire effect
                    const midRadius = (r.innerRadius + r.outerRadius) / 2;
                    const width = r.outerRadius - r.innerRadius;
                    ctx.save();

                    // Outer glow layer
                    ctx.beginPath();
                    ctx.arc(r.centerX, r.centerY, midRadius, 0, Math.PI * 2);
                    ctx.lineWidth = width + 16;
                    ctx.strokeStyle = 'rgba(255, 60, 0, 0.25)';
                    setGlow(ctx, '#FF4400', 15);
                    ctx.stroke();
                    clearGlow(ctx);

                    // Main plasma band
                    ctx.beginPath();
                    ctx.arc(r.centerX, r.centerY, midRadius, 0, Math.PI * 2);
                    ctx.lineWidth = width;
                    ctx.strokeStyle = '#FF5500';
                    ctx.globalAlpha = 0.7 + Math.sin(gameTime * 10) * 0.15;
                    ctx.stroke();

                    // Inner bright core
                    ctx.beginPath();
                    ctx.arc(r.centerX, r.centerY, midRadius, 0, Math.PI * 2);
                    ctx.lineWidth = width * 0.4;
                    ctx.strokeStyle = '#FFAA00';
                    ctx.globalAlpha = 0.6 + Math.sin(gameTime * 12 + 1) * 0.2;
                    ctx.stroke();

                    // Wavy fire texture — draw small arcs with varying radius
                    const segments = 24;
                    ctx.beginPath();
                    for (let i = 0; i <= segments; i++) {
                        const a = (Math.PI * 2 / segments) * i;
                        const waveOuter = r.outerRadius + Math.sin(a * 6 + gameTime * 8) * 6;
                        const px = r.centerX + Math.cos(a) * waveOuter;
                        const py = r.centerY + Math.sin(a) * waveOuter;
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.strokeStyle = '#FF8800';
                    ctx.lineWidth = 2;
                    ctx.globalAlpha = 0.5;
                    ctx.stroke();

                    ctx.globalAlpha = 1;
                    ctx.restore();
                } else if (r.phase === 'cooldown') {
                    // Fading residual
                    const fade = Math.max(0, 1 - r.timer / 0.8);
                    if (fade <= 0) continue;
                    const midRadius = (r.innerRadius + r.outerRadius) / 2;
                    const width = r.outerRadius - r.innerRadius;
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(r.centerX, r.centerY, midRadius, 0, Math.PI * 2);
                    ctx.lineWidth = width;
                    ctx.strokeStyle = '#FF4400';
                    ctx.globalAlpha = fade * 0.3;
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                    ctx.restore();
                }
            }
        }

        // Plasma Overlord pattern: Telegraph Plasma Rings
        function bossPattern_PlasmaRings(dt) {
            if (!currentBoss) return true;
            const state = bossPatternState;
            state.elapsed += dt;
            state.fireTimer += dt;

            if (!state.initialized) {
                state.initialized = true;
                initPlasmaRings(state.ringType);
            }

            // Optional simultaneous projectile fire
            const boss = currentBoss;
            const projType = state.projType || 'none';
            const isP2 = boss.phase === 2;
            const speed = isP2 ? BOSS_PROJ_SPEED * 1.4 : BOSS_PROJ_SPEED;

            if (projType === 'spiral') {
                const interval = isP2 ? 0.08 : 0.12;
                if (state.fireTimer >= interval) {
                    state.fireTimer -= interval;
                    if (!state.spiralAngle) state.spiralAngle = 0;
                    spawnBossProjectile(boss.x, boss.y, state.spiralAngle, speed);
                    if (isP2) {
                        spawnBossProjectile(boss.x, boss.y, state.spiralAngle + Math.PI, speed);
                    }
                    state.spiralAngle += 15 * Math.PI / 180;
                }
            } else if (projType === 'corner') {
                const interval = isP2 ? 0.25 : 0.4;
                const maxBursts = isP2 ? 10 : 6;
                if (state.fireTimer >= interval && state.bursts < maxBursts) {
                    state.fireTimer -= interval;
                    state.bursts++;
                    const sides = boss.sides;
                    for (let i = 0; i < sides; i++) {
                        const vAngle = (Math.PI * 2 / sides) * i + boss.rotation * Math.PI / 180;
                        const sx = boss.x + Math.cos(vAngle) * boss.size;
                        const sy = boss.y + Math.sin(vAngle) * boss.size;
                        spawnBossProjectile(sx, sy, vAngle, speed);
                        if (isP2) {
                            spawnBossProjectile(sx, sy, vAngle + 12 * Math.PI / 180, speed * 0.85);
                        }
                    }
                }
            }

            // Total duration depends on ring type
            // static: telegraph(1.2) + fire(0.7) + cooldown(0.8) = 2.7
            // concentric: + max delay(0.6) = 3.3
            // pincerWave: inner expands ~1.1s fire + outer telegraph(1.2)+fire(0.7)+cooldown(0.8) = 2.7 → ~3.0
            let totalDuration = 2.7;
            if (state.ringType === 'concentricTriple') totalDuration = 3.3;
            else if (state.ringType === 'pincerWave') totalDuration = 3.5;

            return state.elapsed >= totalDuration;
        }

        // Plasma Overlord pattern: Donut Eruption
        function bossPattern_DonutEruption(dt) {
            if (!currentBoss) return true;
            const state = bossPatternState;
            state.elapsed += dt;

            if (!state.launched) state.launched = 0;
            if (!state.launchTimer) state.launchTimer = 0;
            state.launchTimer += dt;

            const cx = arenaCenter.x;
            const cy = arenaCenter.y;
            const R = ARENA_RADIUS;
            // 6 static donuts at different radii across the arena, with gaps between them
            const radii = [R * 0.15, R * 0.3, R * 0.45, R * 0.58, R * 0.7, R * 0.83];
            const thickness = R * 0.06;

            // Launch donuts in rapid sequence (0.25s apart)
            while (state.launched < 6 && state.launchTimer >= state.launched * 0.25) {
                const i = state.launched;
                const half = thickness / 2;
                bossPlasmaRings.push({
                    centerX: cx, centerY: cy,
                    innerRadius: radii[i] - half, outerRadius: radii[i] + half,
                    phase: 'telegraph', timer: 0, delay: 0,
                    expanding: false, expandInFire: false, expandSpeed: 0, maxOuterRadius: radii[i] + half, thickness: thickness
                });
                state.launched++;
                triggerShake(4, 100);
            }

            // 6 * 0.25s launch + telegraph(1.2) + fire(0.7) + cooldown(0.8)
            return state.elapsed >= 4.2;
        }

        // Plasma Overlord custom render
        function renderPlasmaOverlord() {
            if (!currentBoss) return;
            const boss = currentBoss;

            ctx.save();
            ctx.translate(boss.x, boss.y);
            ctx.rotate(boss.rotation * Math.PI / 180);

            const sides = 6;
            const size = boss.size;

            // Heat wave distortion — wavy lines radiating outward
            ctx.save();
            ctx.rotate(-boss.rotation * Math.PI / 180); // counter-rotate so waves stay fixed
            const waveCount = 8;
            for (let i = 0; i < waveCount; i++) {
                const baseAngle = (Math.PI * 2 / waveCount) * i;
                ctx.beginPath();
                for (let d = size + 15; d < size + 80; d += 4) {
                    const waveOffset = Math.sin(d * 0.05 + gameTime * 4 + i) * 8;
                    const a = baseAngle + waveOffset * 0.005;
                    const px = Math.cos(a) * d;
                    const py = Math.sin(a) * d;
                    if (d === size + 15) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.strokeStyle = '#FF4400';
                ctx.lineWidth = 1.5;
                ctx.globalAlpha = 0.15 + Math.sin(gameTime * 3 + i) * 0.08;
                ctx.stroke();
            }
            ctx.globalAlpha = 1;
            ctx.restore();

            // Outer glow ring
            ctx.beginPath();
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
                const px = Math.cos(angle) * (size + 12);
                const py = Math.sin(angle) * (size + 12);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.strokeStyle = '#FF6600';
            ctx.lineWidth = 2.5;
            ctx.globalAlpha = 0.35 + Math.sin(gameTime * 4) * 0.15;
            setGlow(ctx, '#FF4400', 20);
            ctx.stroke();
            clearGlow(ctx);
            ctx.globalAlpha = 1;

            // Main body — gradient from red (#FF0000) to orange (#FF6600)
            ctx.beginPath();
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
                const px = Math.cos(angle) * size;
                const py = Math.sin(angle) * size;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
            gradient.addColorStop(0, '#FF6600');
            gradient.addColorStop(0.5, '#FF3300AA');
            gradient.addColorStop(1, '#FF000033');
            ctx.fillStyle = gradient;
            ctx.globalAlpha = boss.phase === 2 ? 0.75 : 0.55;
            ctx.fill();
            ctx.globalAlpha = 1;

            // Sharp border
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = boss.phase === 2 ? 3.5 : 2.5;
            ctx.stroke();

            // Spike accents on each vertex — aggressive look
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
                const vx = Math.cos(angle) * size;
                const vy = Math.sin(angle) * size;
                const spikeLen = 18 + Math.sin(gameTime * 6 + i * 2) * 5;
                const sx = Math.cos(angle) * (size + spikeLen);
                const sy = Math.sin(angle) * (size + spikeLen);
                ctx.beginPath();
                ctx.moveTo(vx, vy);
                ctx.lineTo(sx, sy);
                ctx.strokeStyle = '#FF6600';
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.7;
                ctx.stroke();
            }
            ctx.globalAlpha = 1;

            // Flash white on damage
            if (boss.flashTimer > 0) {
                ctx.beginPath();
                for (let i = 0; i < sides; i++) {
                    const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
                    const px = Math.cos(angle) * size;
                    const py = Math.sin(angle) * size;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fillStyle = 'rgba(255, 255, 255, ' + Math.min(boss.flashTimer / 0.1, 0.6) + ')';
                ctx.fill();
            }

            // Pulsating yellow center sphere
            const coreSize = 16 + Math.sin(gameTime * 7) * 6;
            const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
            coreGradient.addColorStop(0, '#FFFF00');
            coreGradient.addColorStop(0.5, '#FFAA00');
            coreGradient.addColorStop(1, '#FF440000');
            ctx.beginPath();
            ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
            ctx.fillStyle = coreGradient;
            ctx.globalAlpha = 0.8 + Math.sin(gameTime * 9) * 0.15;
            ctx.fill();
            ctx.globalAlpha = 1;

            // Inner ring
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.4, 0, Math.PI * 2);
            ctx.strokeStyle = '#FF6600';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.3;
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Phase 2: inner hexagon spinning opposite + plasma tendrils
            if (boss.phase === 2) {
                ctx.save();
                ctx.rotate(-boss.rotation * 2 * Math.PI / 180);
                ctx.beginPath();
                for (let i = 0; i < sides; i++) {
                    const angle = (Math.PI * 2 / sides) * i;
                    const px = Math.cos(angle) * (size * 0.55);
                    const py = Math.sin(angle) * (size * 0.55);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.strokeStyle = '#FFAA00';
                ctx.lineWidth = 2;
                ctx.globalAlpha = 0.5;
                ctx.stroke();
                ctx.globalAlpha = 1;
                ctx.restore();

                // Spark particles in P2
                if (Math.random() < 0.4) {
                    const sparkAngle = Math.random() * Math.PI * 2;
                    const sparkDist = size * (0.6 + Math.random() * 0.5);
                    const p = pools.particle.acquire();
                    if (p) {
                        p.x = boss.x + Math.cos(sparkAngle) * sparkDist;
                        p.y = boss.y + Math.sin(sparkAngle) * sparkDist;
                        p.vx = (Math.random() - 0.5) * 60;
                        p.vy = (Math.random() - 0.5) * 60;
                        p.life = 0.3 + Math.random() * 0.3;
                        p.maxLife = p.life;
                        p.radius = 2 + Math.random() * 2;
                        p.color = Math.random() < 0.5 ? '#FF6600' : '#FFAA00';
                        p.type = 'spark';
                        particles.push(p);
                    }
                }
            }

            ctx.restore();
        }

        // --- Plasma Overlord: Attack Sequences ---

        const PO_PHASE1_SEQUENCE = [
            { pattern: 'plasmaRing', ringType: 'singleDonut', proj: 'spiral', pause: 2 },
            { pattern: 'ringWave', pause: 1.5 },
            { pattern: 'plasmaRing', ringType: 'concentricTriple', proj: 'corner', pause: 2 },
            { pattern: 'spiralOutward', pause: 1.5 }
        ];
        const PO_PHASE2_SEQUENCE = [
            { pattern: 'plasmaRing', ringType: 'pincerWave', proj: 'spiral', pause: 1 },
            { pattern: 'donutEruption', pause: 1 },
            { pattern: 'plasmaRing', ringType: 'pincerWave', proj: 'corner', pause: 1 }
        ];

        // Plasma Overlord heavy spiral: double spiral, faster fire rate, longer duration
        function bossPattern_POSpiralOutward(dt) {
            if (!currentBoss) return true;
            const state = bossPatternState;
            state.elapsed += dt;
            state.fireTimer += dt;

            const isP2 = currentBoss.phase === 2;
            const fireInterval = isP2 ? 0.06 : 0.09;
            if (state.fireTimer >= fireInterval) {
                state.fireTimer -= fireInterval;
                const speed = isP2 ? BOSS_PROJ_SPEED * 1.5 : BOSS_PROJ_SPEED * 1.1;
                // Double spiral
                spawnBossProjectile(currentBoss.x, currentBoss.y, state.angle, speed);
                spawnBossProjectile(currentBoss.x, currentBoss.y, state.angle + Math.PI, speed);
                if (isP2) {
                    // Triple spiral in P2
                    spawnBossProjectile(currentBoss.x, currentBoss.y, state.angle + Math.PI * 2 / 3, speed);
                }
                state.angle += 12 * Math.PI / 180;
            }

            return state.elapsed >= (isP2 ? 3.5 : 3);
        }

        // Plasma Overlord heavy ring wave: multiple waves, more projectiles
        function bossPattern_PORingWave(dt) {
            if (!currentBoss) return true;
            const state = bossPatternState;
            state.elapsed += dt;
            state.fireTimer += dt;

            const isP2 = currentBoss.phase === 2;
            const waveCount = isP2 ? 4 : 3;
            const projCount = isP2 ? 36 : 28;
            const waveInterval = isP2 ? 0.5 : 0.7;

            if (state.fireTimer >= waveInterval && state.bursts < waveCount) {
                state.fireTimer -= waveInterval;
                state.bursts++;
                const speed = isP2 ? BOSS_PROJ_SPEED * 1.4 : BOSS_PROJ_SPEED * 1.1;
                const offset = state.bursts * (Math.PI / projCount);
                for (let i = 0; i < projCount; i++) {
                    const angle = (Math.PI * 2 / projCount) * i + offset;
                    spawnBossProjectile(currentBoss.x, currentBoss.y, angle, speed);
                }
            }

            return state.bursts >= waveCount;
        }

        function getPOPattern(name) {
            switch (name) {
                case 'plasmaRing': return bossPattern_PlasmaRings;
                case 'donutEruption': return bossPattern_DonutEruption;
                case 'ringWave': return bossPattern_PORingWave;
                case 'spiralOutward': return bossPattern_POSpiralOutward;
                case 'cornerBarrage': return bossPattern_CornerBarrage;
                default: return bossPattern_POSpiralOutward;
            }
        }

        function getPOPatternState(entry) {
            if (entry.pattern === 'plasmaRing') {
                return {
                    elapsed: 0, fireTimer: 0, angle: 0, bursts: 0, fired: false,
                    initialized: false, ringType: entry.ringType, projType: entry.proj || 'none'
                };
            } else if (entry.pattern === 'donutEruption') {
                return {
                    elapsed: 0, launched: 0, launchTimer: 0
                };
            } else {
                return { elapsed: 0, fireTimer: 0, angle: 0, bursts: 0, fired: false };
            }
        }

        // ============================================================
        // SWARM MOTHER (Boss 4) — Hive Spawn + Brood Explosion
        // ============================================================

        let bossBroodExplosions = [];
        let bossBroodCooldown = 0;

        // --- Hive Spawn: spawns aliens from center + scouts/kamikazes from border ---
        function bossPattern_HiveSpawn(dt) {
            if (!currentBoss) return true;
            const state = bossPatternState;
            if (!state.fired) {
                state.fired = true;
                const isP2 = currentBoss.phase === 2;
                const bx = currentBoss.x;
                const by = currentBoss.y;
                const hpMultiplier = 1 + (playerLevel - 1) * 0.40;

                // --- Center spawn: 5 aliens (10 in P2) ---
                const alienConfig = ENEMY_TYPES['ALIEN'];
                const scaledAlienHp = Math.ceil(alienConfig.hp * hpMultiplier);
                const alienCount = isP2 ? 10 : 5;
                for (let i = 0; i < alienCount; i++) {
                    const angle = (Math.PI * 2 / alienCount) * i + Math.random() * 0.3;
                    const dist = 60 + Math.random() * 40;
                    const alien = pools.enemy.acquire();
                    alien.x = bx + Math.cos(angle) * dist;
                    alien.y = by + Math.sin(angle) * dist;
                    alien.vx = Math.cos(angle) * alienConfig.speed;
                    alien.vy = Math.sin(angle) * alienConfig.speed;
                    alien.angle = angle * 180 / Math.PI;
                    alien.type = 'ALIEN';
                    alien.hp = scaledAlienHp;
                    alien.maxHp = scaledAlienHp;
                    alien.fireTimer = 0;
                    alien.burstCooldown = 0;
                    alien.spawnTime = gameTime;
                    alien.offScreenTime = 0;
                    alien.noXP = true;
                    enemies.push(alien);
                }

                // --- Border spawn: 4 points, 30 enemies each (mix scout/kamikaze) ---
                const borderCount = 30;
                for (let p = 0; p < 4; p++) {
                    const pointAngle = (Math.PI * 2 / 4) * p;
                    const spawnX = arenaCenter.x + Math.cos(pointAngle) * (ARENA_RADIUS - 50);
                    const spawnY = arenaCenter.y + Math.sin(pointAngle) * (ARENA_RADIUS - 50);
                    const angleToCenter = Math.atan2(arenaCenter.y - spawnY, arenaCenter.x - spawnX);

                    for (let j = 0; j < borderCount; j++) {
                        const isKamikaze = Math.random() < 0.4;
                        const type = isKamikaze ? 'KAMIKAZE' : 'SCOUT';
                        const config = ENEMY_TYPES[type];
                        const scaledHp = Math.ceil(config.hp * hpMultiplier);
                        const spread = (Math.random() - 0.5) * 0.8;
                        const spawnDist = Math.random() * 80;

                        const e = pools.enemy.acquire();
                        e.x = spawnX + Math.cos(pointAngle + Math.PI / 2) * spawnDist * (Math.random() - 0.5) * 2;
                        e.y = spawnY + Math.sin(pointAngle + Math.PI / 2) * spawnDist * (Math.random() - 0.5) * 2;
                        e.vx = Math.cos(angleToCenter + spread) * config.speed;
                        e.vy = Math.sin(angleToCenter + spread) * config.speed;
                        e.angle = (angleToCenter + spread) * 180 / Math.PI;
                        e.type = type;
                        e.hp = scaledHp;
                        e.maxHp = scaledHp;
                        e.fireTimer = config.fireRate || 0;
                        e.burstCooldown = 0;
                        e.spawnTime = gameTime;
                        e.offScreenTime = 0;
                        e.noXP = true;
                        enemies.push(e);
                    }
                }

                // Visual burst
                for (let i = 0; i < 8; i++) {
                    spawnRing(bx + (Math.random() - 0.5) * 60, by + (Math.random() - 0.5) * 60, '#39FF14', 60);
                }
                spawnFloatingText(bx, by - currentBoss.size - 20, 'HIVE SPAWN', '#39FF14');
            }
            state.elapsed += dt;
            return state.elapsed > 0.5;
        }

        // --- Brood Explosion: knockback shockwave ---
        function bossPattern_BroodExplosion(dt) {
            if (!currentBoss) return true;
            const state = bossPatternState;
            if (!state.fired) {
                // Only fire if enough enemies present and cooldown expired
                const enemyCount = enemies.length;
                if (enemyCount < 8 || bossBroodCooldown > 0) {
                    return true; // Skip pattern
                }
                state.fired = true;
                bossBroodCooldown = currentBoss.phase === 2 ? 4 : 8;

                const bx = currentBoss.x;
                const by = currentBoss.y;
                const explosionRadius = ARENA_RADIUS * 0.5;

                // Start explosion visual
                bossBroodExplosions.push({
                    x: bx, y: by,
                    radius: 0,
                    maxRadius: explosionRadius,
                    timer: 0,
                    duration: 0.6,
                    damageDealt: false
                });

                // Knockback all enemies outward
                for (let i = 0; i < enemies.length; i++) {
                    const e = enemies[i];
                    const dx = e.x - bx;
                    const dy = e.y - by;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < explosionRadius && dist > 0) {
                        const nx = dx / dist;
                        const ny = dy / dist;
                        e.vx += nx * 500;
                        e.vy += ny * 500;
                    }
                }

                // Damage player if in range
                if (player) {
                    const pdx = player.x - bx;
                    const pdy = player.y - by;
                    if (Math.sqrt(pdx * pdx + pdy * pdy) < explosionRadius) {
                        damagePlayer();
                        damagePlayer();
                    }
                }

                // Particles
                for (let i = 0; i < 20; i++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = Math.random() * explosionRadius * 0.5;
                    spawnRing(bx + Math.cos(angle) * dist, by + Math.sin(angle) * dist, '#39FF14', 50);
                }
                spawnFloatingText(bx, by - currentBoss.size - 20, 'BROOD EXPLOSION', '#FF4444');
            }
            state.elapsed += dt;
            return state.elapsed > 0.3;
        }

        function updateBroodExplosions(dt) {
            if (!currentBoss || currentBoss.type !== 'swarmMother') return;

            // Update brood cooldown
            if (bossBroodCooldown > 0) {
                bossBroodCooldown -= dt;
                if (bossBroodCooldown < 0) bossBroodCooldown = 0;
            }

            // Update active explosions
            for (let i = bossBroodExplosions.length - 1; i >= 0; i--) {
                const exp = bossBroodExplosions[i];
                exp.timer += dt;
                exp.radius = (exp.timer / exp.duration) * exp.maxRadius;
                if (exp.timer >= exp.duration) {
                    bossBroodExplosions.splice(i, 1);
                }
            }
        }

        function renderBroodExplosions() {
            if (!currentBoss || currentBoss.type !== 'swarmMother') return;

            for (const exp of bossBroodExplosions) {
                const progress = exp.timer / exp.duration;
                const alpha = 0.5 * (1 - progress);
                ctx.save();

                // Expanding circle
                ctx.beginPath();
                ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
                ctx.strokeStyle = '#39FF14';
                ctx.lineWidth = 4 * (1 - progress);
                ctx.globalAlpha = alpha;
                setGlow(ctx, '#39FF14', 15);
                ctx.stroke();
                clearGlow(ctx);

                // Fill
                ctx.fillStyle = '#39FF14';
                ctx.globalAlpha = alpha * 0.15;
                ctx.fill();

                ctx.globalAlpha = 1;
                ctx.restore();
            }
        }

        // --- Swarm Mother Custom Renderer ---
        function renderSwarmMother() {
            const boss = currentBoss;
            const sides = boss.sides;
            const size = boss.size;

            ctx.save();
            ctx.translate(boss.x, boss.y);
            ctx.rotate(boss.rotation * Math.PI / 180);

            const isP2 = boss.phase === 2;
            const pulse = Math.sin(gameTime * 3) * 0.08;

            // Outer aura glow
            ctx.beginPath();
            ctx.arc(0, 0, size + 25 + Math.sin(gameTime * 2) * 8, 0, Math.PI * 2);
            ctx.strokeStyle = '#39FF14';
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.15 + Math.sin(gameTime * 4) * 0.08;
            setGlow(ctx, '#39FF14', 25);
            ctx.stroke();
            clearGlow(ctx);
            ctx.globalAlpha = 1;

            // Main octagon body with membrane pulsation
            ctx.beginPath();
            for (let i = 0; i < sides; i++) {
                const angle = (Math.PI * 2 / sides) * i - Math.PI / 2;
                const membranePulse = Math.sin(gameTime * 4 + i * 1.3) * 5;
                const r = size + membranePulse;
                const px = Math.cos(angle) * r;
                const py = Math.sin(angle) * r;
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();

            // Fill dark green
            const bodyGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
            bodyGrad.addColorStop(0, '#2A8C2A');
            bodyGrad.addColorStop(0.6, '#1A5C1A');
            bodyGrad.addColorStop(1, '#0D3B0D');
            ctx.fillStyle = bodyGrad;
            ctx.globalAlpha = isP2 ? 0.85 : 0.7;
            ctx.fill();
            ctx.globalAlpha = 1;

            // Neon border
            ctx.strokeStyle = '#39FF14';
            ctx.lineWidth = isP2 ? 3.5 : 2.5;
            setGlow(ctx, '#39FF14', isP2 ? 12 : 6);
            ctx.stroke();
            clearGlow(ctx);

            // Flash white on damage
            if (boss.flashTimer > 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, ' + Math.min(boss.flashTimer / 0.1, 0.6) + ')';
                ctx.fill();
            }

            // Internal honeycomb pattern (hexagonal grid)
            ctx.strokeStyle = '#39FF14';
            ctx.lineWidth = 0.8;
            ctx.globalAlpha = isP2 ? 0.35 : 0.2;
            const hexSize = 22;
            const hexH = hexSize * Math.sqrt(3);
            for (let row = -3; row <= 3; row++) {
                for (let col = -3; col <= 3; col++) {
                    const cx = col * hexSize * 1.5;
                    const cy = row * hexH + (col % 2 !== 0 ? hexH / 2 : 0);
                    const dist = Math.sqrt(cx * cx + cy * cy);
                    if (dist > size * 0.8) continue;

                    ctx.beginPath();
                    for (let k = 0; k < 6; k++) {
                        const a = (Math.PI / 3) * k + Math.PI / 6;
                        const hx = cx + Math.cos(a) * (hexSize * 0.5);
                        const hy = cy + Math.sin(a) * (hexSize * 0.5);
                        if (k === 0) ctx.moveTo(hx, hy);
                        else ctx.lineTo(hx, hy);
                    }
                    ctx.closePath();
                    ctx.stroke();
                }
            }
            ctx.globalAlpha = 1;

            // Brood chamber center (red pulsating)
            const coreSize = 20 + Math.sin(gameTime * 5) * 5;
            const coreGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
            coreGrad.addColorStop(0, '#FF2222');
            coreGrad.addColorStop(0.5, '#CC0000');
            coreGrad.addColorStop(1, 'rgba(100, 0, 0, 0)');
            ctx.beginPath();
            ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
            ctx.fillStyle = coreGrad;
            ctx.globalAlpha = 0.7 + Math.sin(gameTime * 6) * 0.2;
            ctx.fill();
            ctx.globalAlpha = 1;

            // Inner ring
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
            ctx.strokeStyle = '#39FF14';
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.25;
            ctx.stroke();
            ctx.globalAlpha = 1;

            // Phase 2: extra inner octagon spinning opposite + spark particles
            if (isP2) {
                ctx.save();
                ctx.rotate(-boss.rotation * 2.5 * Math.PI / 180);
                ctx.beginPath();
                for (let i = 0; i < sides; i++) {
                    const angle = (Math.PI * 2 / sides) * i;
                    const px = Math.cos(angle) * (size * 0.6);
                    const py = Math.sin(angle) * (size * 0.6);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.strokeStyle = '#39FF14';
                ctx.lineWidth = 1.5;
                ctx.globalAlpha = 0.5;
                ctx.stroke();
                ctx.globalAlpha = 1;
                ctx.restore();
            }

            ctx.restore();
        }

        // --- Swarm Mother Phase Sequences ---
        const SM_PHASE1_SEQUENCE = [
            { pattern: 'hiveSpawn', pause: 1 },
            { pattern: 'ringWave', pause: 2 },
            { pattern: 'hiveSpawn', pause: 1 },
            { pattern: 'spiralOutward', pause: 1 },
            { pattern: 'broodExplosion', pause: 1 }
        ];

        const SM_PHASE2_SEQUENCE = [
            { pattern: 'hiveSpawn', pause: 0.5 },
            { pattern: 'cornerBarrage', pause: 1 },
            { pattern: 'hiveSpawn', pause: 0.5 },
            { pattern: 'broodExplosion', pause: 0.5 },
            { pattern: 'spiralOutward', pause: 0.5 },
            { pattern: 'targetedBurst', pause: 0.5 }
        ];

        function getSMPattern(name) {
            switch (name) {
                case 'hiveSpawn': return bossPattern_HiveSpawn;
                case 'broodExplosion': return bossPattern_BroodExplosion;
                case 'ringWave': return bossPattern_RingWave;
                case 'spiralOutward': return bossPattern_SpiralOutward;
                case 'cornerBarrage': return bossPattern_CornerBarrage;
                case 'targetedBurst': return bossPattern_TargetedBurst;
                default: return bossPattern_HiveSpawn;
            }
        }

        function getSMPatternState(entry) {
            return { elapsed: 0, fireTimer: 0, angle: 0, bursts: 0, fired: false };
        }


// ============================================================
// SECTION 3: Arena Rendering
// (Originally lines 9148-9291 of index.html)
// ============================================================


        // ============================================================
        // ARENA RENDERING
        // ============================================================

        function renderArena() {
            if (!arenaActive) return;

            const r = arenaCurrentRadius;
            const pulse = 0.6 + 0.4 * Math.sin(gameTime * 3);
            const cx = arenaCenter.x;
            const cy = arenaCenter.y;

            ctx.save();

            // Dark overlay OUTSIDE the arena ring
            ctx.save();
            ctx.beginPath();
            ctx.rect(cx - 6000, cy - 6000, 12000, 12000);
            ctx.arc(cx, cy, r, 0, Math.PI * 2, true);
            ctx.closePath();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fill();
            ctx.restore();

            // Radial energy lines every 15 degrees
            ctx.save();
            ctx.globalAlpha = pulse * 0.4;
            ctx.strokeStyle = '#0088CC';
            ctx.lineWidth = 1;
            for (let angle = 0; angle < 360; angle += 15) {
                const rad = angle * Math.PI / 180 + gameTime * 0.2;
                const innerR = r - 25;
                const outerR = r + 5;
                ctx.beginPath();
                ctx.moveTo(cx + Math.cos(rad) * innerR, cy + Math.sin(rad) * innerR);
                ctx.lineTo(cx + Math.cos(rad) * outerR, cy + Math.sin(rad) * outerR);
                ctx.stroke();
            }
            ctx.restore();

            // Main arena ring with glow
            ctx.save();
            ctx.globalAlpha = pulse;

            ctx.shadowColor = '#00CCFF';
            ctx.shadowBlur = 20;

            const gradient = ctx.createLinearGradient(
                cx - r, cy,
                cx + r, cy
            );
            gradient.addColorStop(0, '#00CCFF');
            gradient.addColorStop(0.5, '#0066FF');
            gradient.addColorStop(1, '#00CCFF');

            ctx.strokeStyle = gradient;
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();

            // Inner subtle ring
            ctx.shadowBlur = 0;
            ctx.globalAlpha = pulse * 0.3;
            ctx.strokeStyle = '#00CCFF';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, r - 15, 0, Math.PI * 2);
            ctx.stroke();

            ctx.restore();

            // Boss incoming warning marker at arena center
            if (bossIncoming) {
                const bi = bossIncoming;
                const bossColor = BOSS_COLORS[bi.bossIndex];
                const t = gameTime;
                const warnPulse = 0.4 + 0.6 * Math.abs(Math.sin(t * 5));

                ctx.save();
                ctx.translate(cx, cy);

                // Pulsating concentric rings converging inward
                for (let ring = 0; ring < 3; ring++) {
                    const ringPhase = (t * 2 + ring * 0.7) % 2;
                    const ringRadius = 120 * (1 - ringPhase / 2);
                    const ringAlpha = (1 - ringPhase / 2) * 0.5;
                    ctx.beginPath();
                    ctx.arc(0, 0, ringRadius, 0, Math.PI * 2);
                    ctx.strokeStyle = bossColor;
                    ctx.lineWidth = 2;
                    ctx.globalAlpha = ringAlpha;
                    ctx.stroke();
                }

                // Crosshair lines
                ctx.globalAlpha = warnPulse * 0.6;
                ctx.strokeStyle = bossColor;
                ctx.lineWidth = 1.5;
                const crossLen = 40;
                ctx.beginPath();
                ctx.moveTo(-crossLen, 0); ctx.lineTo(crossLen, 0);
                ctx.moveTo(0, -crossLen); ctx.lineTo(0, crossLen);
                ctx.stroke();

                // Rotating corner brackets
                ctx.rotate(t * 1.5);
                ctx.globalAlpha = warnPulse * 0.7;
                ctx.lineWidth = 2.5;
                const bSize = 30;
                const bLen = 12;
                for (let corner = 0; corner < 4; corner++) {
                    ctx.save();
                    ctx.rotate(corner * Math.PI / 2);
                    ctx.beginPath();
                    ctx.moveTo(bSize, bSize - bLen);
                    ctx.lineTo(bSize, bSize);
                    ctx.lineTo(bSize - bLen, bSize);
                    ctx.stroke();
                    ctx.restore();
                }

                // Boss name text
                ctx.rotate(-t * 1.5); // undo rotation for text
                ctx.globalAlpha = warnPulse;
                ctx.textAlign = 'center';
                ctx.font = 'bold 16px "Segoe UI", sans-serif';
                ctx.fillStyle = bossColor;
                ctx.fillText(BOSS_NAMES[bi.bossIndex], 0, -70);

                // "WARNING" blinking text
                if (Math.sin(t * 8) > 0) {
                    ctx.font = 'bold 12px "Segoe UI", sans-serif';
                    ctx.fillStyle = '#FF4444';
                    ctx.fillText('WARNING', 0, 70);
                }

                ctx.globalAlpha = 1;
                ctx.restore();
            }

            ctx.restore();
        }

// ============================================================
// SECTION 4: Boss Victory Screen Rendering
// (Originally lines 10299-10465 of index.html)
// ============================================================

        function renderBossVictoryScreen() {
            if (!bossVictoryScreen || !bossVictoryData) return;

            const t = bossVictoryTimer;
            const d = bossVictoryData;
            const cx = CANVAS_WIDTH / 2;
            const cy = CANVAS_HEIGHT / 2;

            // Fade-in for dark overlay (0 → 0.8 over 0.5s)
            const overlayAlpha = Math.min(t / 0.5, 1) * 0.8;
            // Fade-out in last 0.5s
            const fadeOut = t > BOSS_VICTORY_DURATION - 0.5 ? (BOSS_VICTORY_DURATION - t) / 0.5 : 1;
            const masterAlpha = fadeOut;

            ctx.save();

            // Dark overlay
            ctx.fillStyle = `rgba(0, 0, 0, ${overlayAlpha * masterAlpha})`;
            ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

            // Victory particles
            for (const p of bossVictoryParticles) {
                ctx.globalAlpha = p.alpha * masterAlpha;
                ctx.fillStyle = p.color;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }

            // Content appears after 0.3s
            const contentAlpha = Math.max(0, Math.min((t - 0.3) / 0.4, 1)) * masterAlpha;
            if (contentAlpha <= 0) { ctx.restore(); return; }

            ctx.globalAlpha = contentAlpha;
            ctx.textAlign = 'center';

            if (bossVictoryScreen === 'weaponUnlock') {
                // === WEAPON UNLOCK SCREEN ===

                // Title zoom-in effect (scale from 1.5 to 1.0 over 0.5s)
                const titleProgress = Math.min((t - 0.3) / 0.5, 1);
                const titleScale = 1 + (1 - titleProgress) * 0.5;

                ctx.save();
                ctx.translate(cx, cy - 140);
                ctx.scale(titleScale, titleScale);

                // "WEAPON UNLOCKED!" title
                ctx.font = 'bold 52px "Segoe UI", sans-serif';
                ctx.fillStyle = '#FFD700';
                if (ENABLE_GLOW_EFFECTS) {
                    ctx.shadowColor = '#FFD700';
                    ctx.shadowBlur = 20;
                }
                ctx.fillText('WEAPON UNLOCKED!', 0, 0);
                ctx.shadowBlur = 0;
                ctx.restore();

                // Boss name subtitle
                ctx.font = '18px "Segoe UI", sans-serif';
                ctx.fillStyle = d.bossColor;
                ctx.fillText(d.bossName + ' DEFEATED', cx, cy - 90);

                // Weapon icon (large, centered)
                const iconSize = 35;
                const iconY = cy - 20;

                // Icon circle background
                ctx.beginPath();
                ctx.arc(cx, iconY, iconSize + 10, 0, Math.PI * 2);
                ctx.strokeStyle = d.weaponColor;
                ctx.lineWidth = 3;
                if (ENABLE_GLOW_EFFECTS) {
                    ctx.shadowColor = d.weaponColor;
                    ctx.shadowBlur = 15;
                }
                ctx.stroke();
                ctx.shadowBlur = 0;

                // Pulsating glow behind icon
                const pulse = 0.7 + Math.sin(t * 4) * 0.3;
                ctx.beginPath();
                ctx.arc(cx, iconY, iconSize + 5, 0, Math.PI * 2);
                ctx.fillStyle = d.weaponColor;
                ctx.globalAlpha = contentAlpha * pulse * 0.15;
                ctx.fill();
                ctx.globalAlpha = contentAlpha;

                drawWeaponIconAt(cx, iconY, d.weaponIcon, d.weaponColor, iconSize);

                // Weapon name
                ctx.font = 'bold 36px "Segoe UI", sans-serif';
                ctx.fillStyle = d.weaponColor;
                if (ENABLE_GLOW_EFFECTS) {
                    ctx.shadowColor = d.weaponColor;
                    ctx.shadowBlur = 10;
                }
                ctx.fillText(d.weaponName, cx, iconY + 65);
                ctx.shadowBlur = 0;

                // Subtitle
                ctx.font = '16px "Segoe UI", sans-serif';
                ctx.fillStyle = 'rgba(200, 200, 220, 0.8)';
                ctx.fillText('Available in future runs', cx, iconY + 95);

                // Stats
                const statsY = iconY + 140;
                ctx.font = '14px "Segoe UI", sans-serif';
                ctx.fillStyle = 'rgba(180, 180, 200, 0.6)';
                const minutes = Math.floor(d.combatTime / 60);
                const seconds = Math.floor(d.combatTime % 60);
                const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
                ctx.fillText(`Combat time: ${timeStr}  ·  Boss HP: ${d.bossMaxHp.toLocaleString()}`, cx, statsY);

                // Rewards
                ctx.font = 'bold 22px "Segoe UI", sans-serif';
                ctx.fillStyle = '#FFD700';
                ctx.fillText(`+${d.levelsGranted} LEVELS  ·  +${d.xpGranted.toLocaleString()} XP`, cx, statsY + 35);

            } else {
                // === BOSS DEFEATED (repeat) SCREEN ===

                // Title
                const titleProgress = Math.min((t - 0.3) / 0.5, 1);
                const titleScale = 1 + (1 - titleProgress) * 0.3;

                ctx.save();
                ctx.translate(cx, cy - 80);
                ctx.scale(titleScale, titleScale);

                ctx.font = 'bold 46px "Segoe UI", sans-serif';
                ctx.fillStyle = '#39FF14';
                if (ENABLE_GLOW_EFFECTS) {
                    ctx.shadowColor = '#39FF14';
                    ctx.shadowBlur = 15;
                }
                ctx.fillText('BOSS DEFEATED!', 0, 0);
                ctx.shadowBlur = 0;
                ctx.restore();

                // Boss name
                ctx.font = '20px "Segoe UI", sans-serif';
                ctx.fillStyle = d.bossColor;
                ctx.fillText(d.bossName, cx, cy - 25);

                // Level reward
                ctx.font = 'bold 38px "Segoe UI", sans-serif';
                ctx.fillStyle = '#FFD700';
                ctx.fillText(`+${d.levelsGranted} LEVELS`, cx, cy + 30);

                // XP reward
                ctx.font = 'bold 22px "Segoe UI", sans-serif';
                ctx.fillStyle = '#AAFFAA';
                ctx.fillText(`+${d.xpGranted.toLocaleString()} XP`, cx, cy + 65);
            }

            // Skip hint (appears after min skip time)
            if (t >= BOSS_VICTORY_MIN_SKIP) {
                const hintAlpha = Math.min((t - BOSS_VICTORY_MIN_SKIP) / 0.3, 1) * 0.5 * masterAlpha;
                ctx.globalAlpha = hintAlpha;
                ctx.font = '13px "Segoe UI", sans-serif';
                ctx.fillStyle = '#AAAAAA';
                ctx.fillText('Press any key to continue', cx, CANVAS_HEIGHT - 60);
            }

            ctx.restore();
        }

// ============================================================
// SECTION 5: Arsenal Gallery (with padlock logic)
// (Originally lines 10526-10649 of index.html)
// ============================================================

        function renderArsenalGallery() {
            const prog = loadProgression();
            const mobile = isMobile();

            const ARSENAL_WEAPONS = [
                { id: 'laser_cannon', name: 'LASER CANNON', icon: 'laser', color: '#FF6B5B', bossLvl: 0 },
                { id: 'orbital_shield', name: 'ORBITAL SHIELD', icon: 'orbital', color: '#00DFFF', bossLvl: 8 },
                { id: 'missile_launcher', name: 'MISSILE LAUNCHER', icon: 'rocket', color: '#FFD93D', bossLvl: 14 },
                { id: 'lightning_ray', name: 'LIGHTNING RAY', icon: 'lightning', color: '#9F7AEA', bossLvl: 20 },
                { id: 'plasma_field', name: 'PLASMA FIELD', icon: 'aura', color: '#7FDBFF', bossLvl: 27 },
                { id: 'alien_drone', name: 'ALIEN DRONE', icon: 'drone', color: '#39FF14', bossLvl: 35 }
            ];

            const cols = mobile ? 2 : 3;
            const rows = mobile ? 3 : 2;
            const cardW = mobile ? 140 : 200;
            const cardH = mobile ? 100 : 120;
            const gap = mobile ? 12 : 16;

            const gridW = cols * cardW + (cols - 1) * gap;
            const gridX = (CANVAS_WIDTH - gridW) / 2;
            const titleY = mobile ? 680 : 560;
            const gridStartY = titleY + 30;

            // Title
            ctx.save();
            ctx.textAlign = 'center';
            ctx.font = 'bold 18px "Segoe UI", sans-serif';
            ctx.fillStyle = COLORS.HUD_CYAN;
            ctx.fillText('ARSENAL', CANVAS_WIDTH / 2, titleY);

            // Underline
            const lineW = 60;
            ctx.strokeStyle = 'rgba(127, 219, 255, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(CANVAS_WIDTH / 2 - lineW, titleY + 8);
            ctx.lineTo(CANVAS_WIDTH / 2 + lineW, titleY + 8);
            ctx.stroke();

            const now = Date.now();

            for (let i = 0; i < ARSENAL_WEAPONS.length; i++) {
                const weapon = ARSENAL_WEAPONS[i];
                const col = i % cols;
                const row = Math.floor(i / cols);
                const cx = gridX + col * (cardW + gap);
                const cy = gridStartY + row * (cardH + gap);
                const unlocked = prog.unlockedWeapons[weapon.id];

                // Card background
                ctx.fillStyle = unlocked ? 'rgba(10, 20, 40, 0.7)' : 'rgba(10, 10, 15, 0.6)';
                ctx.beginPath();
                ctx.roundRect(cx, cy, cardW, cardH, 6);
                ctx.fill();

                // Card border
                if (unlocked) {
                    const pulse = Math.sin(now / 800 + i * 1.2) * 0.25 + 0.75;
                    ctx.strokeStyle = weapon.color;
                    ctx.globalAlpha = pulse;
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.roundRect(cx, cy, cardW, cardH, 6);
                    ctx.stroke();
                    ctx.globalAlpha = 1;
                } else {
                    ctx.strokeStyle = 'rgba(100, 100, 120, 0.35)';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.roundRect(cx, cy, cardW, cardH, 6);
                    ctx.stroke();
                }

                // Icon area
                const iconX = cx + cardW / 2;
                const iconY = cy + (mobile ? 30 : 36);

                if (unlocked) {
                    // Draw weapon icon scaled up
                    ctx.save();
                    ctx.translate(iconX, iconY);
                    ctx.scale(1.8, 1.8);
                    drawSkillIcon(ctx, weapon.icon, 0, 0, weapon.color);
                    ctx.restore();

                    // Checkmark
                    ctx.strokeStyle = '#39FF14';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(cx + cardW - 18, cy + 10);
                    ctx.lineTo(cx + cardW - 14, cy + 15);
                    ctx.lineTo(cx + cardW - 8, cy + 7);
                    ctx.stroke();
                } else {
                    // Locked icon (padlock)
                    ctx.strokeStyle = 'rgba(100, 100, 120, 0.5)';
                    ctx.fillStyle = 'rgba(100, 100, 120, 0.5)';
                    ctx.lineWidth = 1.5;
                    // Lock body
                    ctx.fillRect(iconX - 6, iconY - 2, 12, 10);
                    // Lock shackle
                    ctx.beginPath();
                    ctx.arc(iconX, iconY - 4, 5, Math.PI, 0);
                    ctx.stroke();
                }

                // Weapon name
                ctx.textAlign = 'center';
                const nameY = cy + (mobile ? 62 : 76);
                ctx.font = `bold ${mobile ? 9 : 11}px "Segoe UI", sans-serif`;
                ctx.fillStyle = unlocked ? weapon.color : 'rgba(130, 130, 150, 0.6)';
                ctx.fillText(weapon.name, cx + cardW / 2, nameY);

                // Boss level requirement (locked only)
                if (!unlocked) {
                    ctx.font = `${mobile ? 8 : 9}px "Segoe UI", sans-serif`;
                    ctx.fillStyle = 'rgba(150, 150, 170, 0.5)';
                    ctx.fillText('BOSS LVL ' + weapon.bossLvl, cx + cardW / 2, nameY + (mobile ? 13 : 15));
                }
            }

            ctx.restore();
        }
