# PROMPT: Implementar nuevo sistema de progresión (Upgrades Multi-Nivel + Cristales + Tienda + Dificultades)

## CONTEXTO

Stellar Swarm es un space shooter tipo Vampire Survivors (~6,000 líneas en `index.html` tras eliminar bosses). Este prompt implementa el nuevo sistema de progresión completo que reemplaza al sistema de bosses eliminado.

**Documento de referencia:** `WEAPON_EVOLUTION_DESIGN.md` contiene el diseño completo con todos los valores numéricos.

**Estado actual del código (post-eliminación de bosses):**
- `SKILL_TREE` es un objeto plano con ~25 nodos (6 armas + 18 upgrades + 1 arsenal)
- Cada upgrade es binario: lo tienes o no (no hay niveles)
- `unlockedSkills` = array de strings con IDs de skills desbloqueadas este run
- `getWeaponStats()` verifica `unlockedSkills.includes('skill_id')` para cada upgrade
- `canUnlockSkill()` verifica prerrequisitos y si ya está desbloqueada
- `generateUpgradeOptions()` genera 3 opciones aleatorias del pool disponible
- Todas las armas están desbloqueadas (ya no hay gate de bosses)
- `localStorage` guarda `unlockedWeapons` (todas true) y `stats.totalRuns`

**Lo que hay que implementar (en este orden):**
1. Upgrades multi-nivel (3 niveles por rama)
2. Sistema de cristales (moneda persistente)
3. Tienda entre runs (desbloqueo de armas + mejoras permanentes)
4. Sistema de dificultades
5. Evoluciones capstone (Prioridad baja - puede ser un prompt separado)

---

## FASE 1: REDISEÑAR SKILL_TREE PARA UPGRADES MULTI-NIVEL

### 1.1 Nueva estructura de datos

Reemplazar el `SKILL_TREE` actual (~línea 460-685) con una nueva estructura que soporte niveles. Cada upgrade ahora tiene 3 niveles con efectos acumulativos.

**ANTES (estructura actual):**
```javascript
const SKILL_TREE = {
    'arsenal': { name: 'ARSENAL', prereqs: [], cost: 0, ... },
    'laser_cannon': { name: 'LASER CANNON', prereqs: ['arsenal'], cost: 1, ... },
    'rapid_fire': { name: 'Rapid Fire', prereqs: ['laser_cannon'], cost: 1, ... },
    // ... etc, cada upgrade = 1 nodo binario
};
```

**DESPUÉS (nueva estructura):**
```javascript
// Nodo raíz (mantener tal cual)
const SKILL_TREE = {
    'arsenal': {
        name: 'ARSENAL',
        description: 'Base system',
        prereqs: [],
        cost: 0,
        color: '#FFFFFF',
        icon: 'arsenal',
        nodeType: 'hexagon',
        type: 'root'
    }
};

// Definición de armas con sus ramas de upgrades multi-nivel
const WEAPONS = {
    'laser_cannon': {
        name: 'LASER CANNON',
        color: '#FF6B5B',
        icon: 'laser',
        description: 'Auto-fire laser cannon',
        shopPrice: 0, // Gratis, siempre disponible
        branches: {
            'rapid_fire': {
                name: 'Rapid Fire',
                icon: 'rate',
                levels: [
                    { description: 'Fire rate: 0.35s → 0.28s (-20%)', effect: { fireRate: 0.28 } },
                    { description: 'Fire rate: 0.28s → 0.22s (-21%)', effect: { fireRate: 0.22 } },
                    { description: 'Fire rate: 0.22s → 0.16s (-27%)', effect: { fireRate: 0.16 } }
                ]
            },
            'beam_splitter': {
                name: 'Beam Splitter',
                icon: 'spread',
                levels: [
                    { description: '3 projectiles in cone', effect: { spreadCount: 3 } },
                    { description: '5 projectiles, wider cone', effect: { spreadCount: 5, spreadAngle: 15 } },
                    { description: '7 projectiles, wide cone', effect: { spreadCount: 7, spreadAngle: 30 } }
                ]
            },
            'piercing_lens': {
                name: 'Piercing Lens',
                icon: 'beam',
                levels: [
                    { description: 'Bullets pierce 1 extra enemy', effect: { pierce: 2 } },
                    { description: 'Damage: 10 → 14 (+40%)', effect: { pierce: 2, damage: 14 } },
                    { description: 'Unlimited pierce, Damage: 18', effect: { pierceInfinite: true, damage: 18 } }
                ]
            }
        },
        evolution: {
            name: 'NOVA BEAM',
            icon: 'nova',
            description: 'Every 5th shot fires a massive piercing cone beam (40 dmg, 30° cone, full viewport range)',
            effect: { novaBeam: true }
        }
    },

    'missile_launcher': {
        name: 'MISSILE LAUNCHER',
        color: '#FFD93D',
        icon: 'rocket',
        description: 'Homing missile system',
        shopPrice: 150,
        branches: {
            'barrage': {
                name: 'Barrage',
                icon: 'target',
                levels: [
                    { description: '3 → 4 missiles per burst', effect: { rocketBurstCount: 4 } },
                    { description: '4 → 5 missiles per burst', effect: { rocketBurstCount: 5 } },
                    { description: '5 → 7 missiles per burst', effect: { rocketBurstCount: 7 } }
                ]
            },
            'cluster_payload': {
                name: 'Cluster Payload',
                icon: 'cluster',
                levels: [
                    { description: 'Explosion radius: 120 → 160px', effect: { rocketExplosionRadius: 160 } },
                    { description: 'Explosion spawns 2 mini-missiles', effect: { rocketExplosionRadius: 160, rocketRicochetCount: 2 } },
                    { description: 'Explosion: 30 → 45 dmg, 3 mini-missiles', effect: { rocketExplosionDamage: 45, rocketRicochetCount: 3 } }
                ]
            },
            'heavy_payload': {
                name: 'Heavy Payload',
                icon: 'damage',
                levels: [
                    { description: 'Impact damage: 22 → 30', effect: { rocketDamage: 30 } },
                    { description: 'Impact damage: 30 → 40', effect: { rocketDamage: 40 } },
                    { description: 'Damage: 50 + 20% crit chance (×2)', effect: { rocketDamage: 50, rocketCritChance: 0.20 } }
                ]
            }
        },
        evolution: {
            name: 'ARMAGEDDON PROTOCOL',
            icon: 'armageddon',
            description: 'Every 8s, mega-missile: 300px explosion, 100 dmg, 10 homing mini-missiles',
            effect: { armageddon: true }
        }
    },

    'orbital_shield': {
        name: 'ORBITAL SHIELD',
        color: '#00DFFF',
        icon: 'orbital',
        description: '3 orbiting damage orbs',
        shopPrice: 150,
        branches: {
            'orbital_expansion': {
                name: 'Orbital Expansion',
                icon: 'regen',
                levels: [
                    { description: '3 → 4 orbs', effect: { orbCount: 4 } },
                    { description: '4 → 5 orbs', effect: { orbCount: 5 } },
                    { description: '5 → 7 orbs', effect: { orbCount: 7 } }
                ]
            },
            'shockwave': {
                name: 'Shockwave',
                icon: 'shockwave',
                levels: [
                    { description: 'Orb size +30%', effect: { orbSizeMulti: 1.3 } },
                    { description: 'Orb size +60%, light knockback', effect: { orbSizeMulti: 1.6, orbKnockback: 1 } },
                    { description: 'Orb size +100%, strong knockback', effect: { orbSizeMulti: 2.0, orbKnockback: 2 } }
                ]
            },
            'energy_absorption': {
                name: 'Energy Absorption',
                icon: 'absorb',
                levels: [
                    { description: 'Contact damage: 16 → 24 (+50%)', effect: { orbDamage: 24 } },
                    { description: 'Contact damage: 24 → 32', effect: { orbDamage: 32 } },
                    { description: 'Damage: 40 + enemies slowed 25% for 1s', effect: { orbDamage: 40, orbSlow: 0.25 } }
                ]
            }
        },
        evolution: {
            name: 'SINGULARITY CORE',
            icon: 'singularity',
            description: 'Gravity field: 40% slow + 15/s passive damage. Kills emit damage pulse.',
            effect: { singularity: true }
        }
    },

    'lightning_ray': {
        name: 'LIGHTNING RAY',
        color: '#9F7AEA',
        icon: 'lightning',
        description: 'Chain lightning between enemies',
        shopPrice: 200,
        branches: {
            'chain_amplifier': {
                name: 'Chain Amplifier',
                icon: 'chain',
                levels: [
                    { description: '6 → 8 chain bounces', effect: { lightningBounces: 8 } },
                    { description: '8 → 10 bounces', effect: { lightningBounces: 10 } },
                    { description: '10 → 14 bounces', effect: { lightningBounces: 14 } }
                ]
            },
            'rapid_discharge': {
                name: 'Rapid Discharge',
                icon: 'discharge',
                levels: [
                    { description: 'Cadence: 1.2s → 1.0s', effect: { lightningCadence: 1.0 } },
                    { description: 'Cadence: 1.0s → 0.8s', effect: { lightningCadence: 0.8 } },
                    { description: 'Cadence: 0.8s → 0.6s', effect: { lightningCadence: 0.6 } }
                ]
            },
            'extended_arc': {
                name: 'Extended Arc',
                icon: 'arc',
                levels: [
                    { description: 'Detection: 300px, Chain: 270px', effect: { lightningRange: 300, lightningChainRange: 270 } },
                    { description: 'Damage: 8 → 12', effect: { lightningRange: 300, lightningChainRange: 270, lightningDamage: 12 } },
                    { description: 'Detection: 400px, Chain: 350px, Damage: 16', effect: { lightningRange: 400, lightningChainRange: 350, lightningDamage: 16 } }
                ]
            }
        },
        evolution: {
            name: 'STORM NEXUS',
            icon: 'storm',
            description: 'Lightning leaves electric field for 2s. Enemies in field: 10/s damage + 0.5s stun on entry.',
            effect: { stormNexus: true }
        }
    },

    'plasma_field': {
        name: 'PLASMA FIELD',
        color: '#7FDBFF',
        icon: 'aura',
        description: 'Damage aura around the ship',
        shopPrice: 200,
        branches: {
            'field_expansion': {
                name: 'Field Expansion',
                icon: 'expand',
                levels: [
                    { description: 'Radius: 100 → 130px', effect: { auraRadius: 130 } },
                    { description: 'Radius: 130 → 170px', effect: { auraRadius: 170 } },
                    { description: 'Radius: 170 → 220px', effect: { auraRadius: 220 } }
                ]
            },
            'field_intensity': {
                name: 'Field Intensity',
                icon: 'damage',
                levels: [
                    { description: 'Damage: 8 → 12 per tick', effect: { auraDamage: 12 } },
                    { description: 'Damage: 12 → 17 per tick', effect: { auraDamage: 17 } },
                    { description: 'Damage: 24 + 20% slow in zone', effect: { auraDamage: 24, auraSlow: 0.20 } }
                ]
            },
            'rapid_pulse': {
                name: 'Rapid Pulse',
                icon: 'pulse',
                levels: [
                    { description: 'Tick rate: 0.50s → 0.40s', effect: { auraTickRate: 0.40 } },
                    { description: 'Tick rate: 0.40s → 0.30s', effect: { auraTickRate: 0.30 } },
                    { description: 'Tick rate: 0.30s → 0.22s', effect: { auraTickRate: 0.22 } }
                ]
            }
        },
        evolution: {
            name: 'ANNIHILATION SPHERE',
            icon: 'annihilation',
            description: 'Kills in field create 60px mini-explosions (20 dmg). Chain reaction on kills.',
            effect: { annihilation: true }
        }
    },

    'alien_drone': {
        name: 'ALIEN DRONE',
        color: '#39FF14',
        icon: 'drone',
        description: 'Kamikaze drones from killed enemies',
        shopPrice: 250,
        branches: {
            'drone_swarm': {
                name: 'Drone Swarm',
                icon: 'swarm',
                levels: [
                    { description: '1 drone + 30% chance 2nd drone', effect: { droneExtraChance: 0.30, droneExtraCount: 1 } },
                    { description: '1 drone + 60% chance 2nd drone', effect: { droneExtraChance: 0.60, droneExtraCount: 1 } },
                    { description: '2 drones + 40% chance 3rd', effect: { droneBaseCount: 2, droneExtraChance: 0.40, droneExtraCount: 1 } }
                ]
            },
            'drone_power': {
                name: 'Drone Power',
                icon: 'duration',
                levels: [
                    { description: 'Damage: 15 → 22', effect: { droneDamage: 22 } },
                    { description: 'Damage: 30, Range: 400 → 550px', effect: { droneDamage: 30, droneRange: 550 } },
                    { description: 'Damage: 40, Speed: +30%', effect: { droneDamage: 40, droneRange: 550, droneSpeedMulti: 1.3 } }
                ]
            },
            'volatile_core': {
                name: 'Volatile Core',
                icon: 'explosion',
                levels: [
                    { description: '30% chance explosion (60px, 12 dmg)', effect: { droneExplosionChance: 0.30, droneExplosionRadius: 60, droneExplosionDamage: 12 } },
                    { description: '55% chance explosion (80px, 18 dmg)', effect: { droneExplosionChance: 0.55, droneExplosionRadius: 80, droneExplosionDamage: 18 } },
                    { description: '80% chance explosion (100px, 25 dmg)', effect: { droneExplosionChance: 0.80, droneExplosionRadius: 100, droneExplosionDamage: 25 } }
                ]
            }
        },
        evolution: {
            name: 'HIVE MIND',
            icon: 'hive',
            description: 'Drones orbit and shoot mini-lasers (8 dmg, 0.5s). Last 5s. Explode on expiry. Max 8.',
            effect: { hiveMind: true }
        }
    }
};
```

### 1.2 Nuevo sistema de tracking de upgrades

Reemplazar el sistema de `unlockedSkills` (array de strings) con un sistema que soporte niveles.

**ANTES:**
```javascript
let unlockedSkills = ['arsenal', 'laser_cannon'];
// Verificar: unlockedSkills.includes('rapid_fire')
```

**DESPUÉS:**
```javascript
// Armas activadas este run
let activeWeapons = []; // ['laser_cannon', 'orbital_shield', ...]

// Niveles de upgrades este run: { branchId: nivel (0-3) }
// nivel 0 = no comprado, 1 = nivel I, 2 = nivel II, 3 = nivel III
let upgradelevels = {}; // { 'rapid_fire': 2, 'beam_splitter': 1, ... }

// Evoluciones desbloqueadas este run
let activeEvolutions = []; // ['laser_cannon', ...] (weaponId si evolución activa)
```

### 1.3 Reescribir `canUnlockSkill()` → `getAvailableUpgrades()`

La función actual `canUnlockSkill()` es binaria. Necesita reconstruirse para el sistema de niveles.

**Nueva función:**
```javascript
function getAvailableUpgrades() {
    const available = [];
    const prog = loadProgression();

    for (const [weaponId, weapon] of Object.entries(WEAPONS)) {
        // ¿Arma disponible en tienda?
        if (!prog.unlockedWeapons[weaponId]) continue;

        // Opción 1: Activar el arma (si no está activa este run)
        if (!activeWeapons.includes(weaponId)) {
            available.push({
                type: 'weapon_activation',
                id: weaponId,
                name: weapon.name,
                description: weapon.description,
                color: weapon.color,
                icon: weapon.icon
            });
            continue; // No ofrecer upgrades de un arma que no está activa
        }

        // Opción 2: Upgrades de ramas del arma activa
        for (const [branchId, branch] of Object.entries(weapon.branches)) {
            const currentLevel = upgradeLevels[branchId] || 0;
            if (currentLevel < 3) { // Aún quedan niveles
                const nextLevel = branch.levels[currentLevel];
                available.push({
                    type: 'upgrade',
                    id: branchId,
                    weaponId: weaponId,
                    name: branch.name + ' ' + ['I', 'II', 'III'][currentLevel],
                    description: nextLevel.description,
                    color: weapon.color,
                    icon: branch.icon,
                    level: currentLevel + 1
                });
            }
        }

        // Opción 3: Evolución (si las 3 ramas están a nivel III)
        if (!activeEvolutions.includes(weaponId)) {
            const branchIds = Object.keys(weapon.branches);
            const allMaxed = branchIds.every(bid => (upgradeLevels[bid] || 0) >= 3);
            if (allMaxed) {
                available.push({
                    type: 'evolution',
                    id: weaponId + '_evolution',
                    weaponId: weaponId,
                    name: weapon.evolution.name,
                    description: weapon.evolution.description,
                    color: weapon.color,
                    icon: weapon.evolution.icon,
                    isEvolution: true
                });
            }
        }
    }

    // Si no quedan upgrades, ofrecer bonificaciones de cristales
    if (available.length === 0) {
        available.push(
            { type: 'bonus', id: 'bonus_crystals', name: '+50 Cristales', description: 'Bonus de moneda persistente', color: '#E0F0FF', icon: 'crystal' },
            { type: 'bonus', id: 'bonus_heal', name: 'Full Heal', description: 'Restaura toda tu vida', color: '#39FF14', icon: 'heal' },
            { type: 'bonus', id: 'bonus_damage', name: 'Damage ×1.5', description: 'Daño aumentado 30 segundos', color: '#FF6B5B', icon: 'damage' }
        );
    }

    return available;
}
```

### 1.4 Reescribir `generateUpgradeOptions()`

```javascript
function generateUpgradeOptions() {
    const available = getAvailableUpgrades();
    if (available.length <= 3) return [...available];
    // Shuffle y tomar 3
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
}
```

### 1.5 Reescribir `selectUpgrade()`

```javascript
function selectUpgrade(option) {
    if (!upgradeSelectionActive) return;

    if (option.type === 'weapon_activation') {
        activeWeapons.push(option.id);
    } else if (option.type === 'upgrade') {
        upgradeLevels[option.id] = (upgradeLevels[option.id] || 0) + 1;
    } else if (option.type === 'evolution') {
        activeEvolutions.push(option.weaponId);
    } else if (option.type === 'bonus') {
        if (option.id === 'bonus_crystals') {
            crystalsThisRun += 50;
        } else if (option.id === 'bonus_heal') {
            player.hp = PLAYER_MAX_HP;
        } else if (option.id === 'bonus_damage') {
            tempDamageMultiplier = 1.5;
            tempDamageTimer = 30;
        }
    }

    skillPoints--;
    spawnFloatingText(player.x, player.y - 40, option.name + '!', option.color);

    // Partículas de celebración
    for (let i = 0; i < 15; i++) {
        const angle = Math.random() * Math.PI * 2;
        particles.push({
            x: player.x, y: player.y,
            vx: Math.cos(angle) * (80 + Math.random() * 60),
            vy: Math.sin(angle) * (80 + Math.random() * 60),
            life: 0.5, maxLife: 0.5,
            size: 4 + Math.random() * 4,
            color: option.color,
            type: 'levelup'
        });
    }

    hideUpgradePanel();

    if (skillPoints > 0) {
        setTimeout(() => showUpgradePanel(), 300);
    }
}
```

### 1.6 Reescribir `getWeaponStats()` completamente

La función actual (~línea 2024-2132) verifica `unlockedSkills.includes()` para cada upgrade. Debe reconstruirse para leer de `activeWeapons`, `upgradeLevels` y `activeEvolutions`.

**Nueva lógica:**
```javascript
function getWeaponStats() {
    const prog = loadProgression();

    // === LASER CANNON ===
    let hasLaser = activeWeapons.includes('laser_cannon');
    let damage = hasLaser ? 10 : 8; // 10 base con laser
    let fireRate = 0.35;
    let pierce = 0;
    let pierceInfinite = false;
    let spreadCount = 0;

    if (hasLaser) {
        const rfLvl = upgradeLevels['rapid_fire'] || 0;
        if (rfLvl >= 1) fireRate = 0.28;
        if (rfLvl >= 2) fireRate = 0.22;
        if (rfLvl >= 3) fireRate = 0.16;

        const bsLvl = upgradeLevels['beam_splitter'] || 0;
        if (bsLvl >= 1) spreadCount = 3;
        if (bsLvl >= 2) spreadCount = 5;
        if (bsLvl >= 3) spreadCount = 7;

        const plLvl = upgradeLevels['piercing_lens'] || 0;
        if (plLvl >= 1) pierce = 2;
        if (plLvl >= 2) damage = 14;
        if (plLvl >= 3) { pierceInfinite = true; damage = 18; }
    }

    // === MISSILE LAUNCHER ===
    let hasRockets = activeWeapons.includes('missile_launcher');
    let rocketBurstCount = 3;
    let rocketDamage = 22;
    let rocketExplosionDamage = 30;
    let rocketExplosionRadius = 120;
    let rocketRicochetCount = 0;
    let rocketCritChance = 0;

    if (hasRockets) {
        const baLvl = upgradeLevels['barrage'] || 0;
        if (baLvl >= 1) rocketBurstCount = 4;
        if (baLvl >= 2) rocketBurstCount = 5;
        if (baLvl >= 3) rocketBurstCount = 7;

        const cpLvl = upgradeLevels['cluster_payload'] || 0;
        if (cpLvl >= 1) rocketExplosionRadius = 160;
        if (cpLvl >= 2) rocketRicochetCount = 2;
        if (cpLvl >= 3) { rocketExplosionDamage = 45; rocketRicochetCount = 3; }

        const hpLvl = upgradeLevels['heavy_payload'] || 0;
        if (hpLvl >= 1) rocketDamage = 30;
        if (hpLvl >= 2) rocketDamage = 40;
        if (hpLvl >= 3) { rocketDamage = 50; rocketCritChance = 0.20; }
    }

    // === ORBITAL SHIELD ===
    let hasOrbit = activeWeapons.includes('orbital_shield');
    let orbCount = 3;
    let orbDamage = 16;
    let orbSizeMulti = 1.0;
    let orbKnockback = 0;
    let orbSlow = 0;

    if (hasOrbit) {
        const oeLvl = upgradeLevels['orbital_expansion'] || 0;
        if (oeLvl >= 1) orbCount = 4;
        if (oeLvl >= 2) orbCount = 5;
        if (oeLvl >= 3) orbCount = 7;

        const swLvl = upgradeLevels['shockwave'] || 0;
        if (swLvl >= 1) orbSizeMulti = 1.3;
        if (swLvl >= 2) { orbSizeMulti = 1.6; orbKnockback = 1; }
        if (swLvl >= 3) { orbSizeMulti = 2.0; orbKnockback = 2; }

        const eaLvl = upgradeLevels['energy_absorption'] || 0;
        if (eaLvl >= 1) orbDamage = 24;
        if (eaLvl >= 2) orbDamage = 32;
        if (eaLvl >= 3) { orbDamage = 40; orbSlow = 0.25; }
    }

    // === LIGHTNING RAY ===
    let hasLightning = activeWeapons.includes('lightning_ray');
    let lightningBounces = 6;
    let lightningCadence = 1.2;
    let lightningRange = 225;
    let lightningChainRange = 200;
    let lightningDamage = 8;

    if (hasLightning) {
        const caLvl = upgradeLevels['chain_amplifier'] || 0;
        if (caLvl >= 1) lightningBounces = 8;
        if (caLvl >= 2) lightningBounces = 10;
        if (caLvl >= 3) lightningBounces = 14;

        const rdLvl = upgradeLevels['rapid_discharge'] || 0;
        if (rdLvl >= 1) lightningCadence = 1.0;
        if (rdLvl >= 2) lightningCadence = 0.8;
        if (rdLvl >= 3) lightningCadence = 0.6;

        const exLvl = upgradeLevels['extended_arc'] || 0;
        if (exLvl >= 1) { lightningRange = 300; lightningChainRange = 270; }
        if (exLvl >= 2) { lightningDamage = 12; }
        if (exLvl >= 3) { lightningRange = 400; lightningChainRange = 350; lightningDamage = 16; }
    }

    // === PLASMA FIELD ===
    let hasAura = activeWeapons.includes('plasma_field');
    let auraRadius = 100;
    let auraDamage = 8;
    let auraTickRate = 0.50;
    let auraSlow = 0;

    if (hasAura) {
        const feLvl = upgradeLevels['field_expansion'] || 0;
        if (feLvl >= 1) auraRadius = 130;
        if (feLvl >= 2) auraRadius = 170;
        if (feLvl >= 3) auraRadius = 220;

        const fiLvl = upgradeLevels['field_intensity'] || 0;
        if (fiLvl >= 1) auraDamage = 12;
        if (fiLvl >= 2) auraDamage = 17;
        if (fiLvl >= 3) { auraDamage = 24; auraSlow = 0.20; }

        const rpLvl = upgradeLevels['rapid_pulse'] || 0;
        if (rpLvl >= 1) auraTickRate = 0.40;
        if (rpLvl >= 2) auraTickRate = 0.30;
        if (rpLvl >= 3) auraTickRate = 0.22;
    }

    // === ALIEN DRONE ===
    let hasDrones = activeWeapons.includes('alien_drone');
    let droneBaseCount = 1;
    let droneExtraChance = 0;
    let droneExtraCount = 0;
    let droneDamage = 15;
    let droneRange = 400;
    let droneSpeedMulti = 1.0;
    let droneLifetime = 1.5;
    let droneExplosionChance = 0;
    let droneExplosionRadius = 0;
    let droneExplosionDamage = 0;

    if (hasDrones) {
        const dsLvl = upgradeLevels['drone_swarm'] || 0;
        if (dsLvl >= 1) { droneExtraChance = 0.30; droneExtraCount = 1; }
        if (dsLvl >= 2) { droneExtraChance = 0.60; droneExtraCount = 1; }
        if (dsLvl >= 3) { droneBaseCount = 2; droneExtraChance = 0.40; droneExtraCount = 1; }

        const dpLvl = upgradeLevels['drone_power'] || 0;
        if (dpLvl >= 1) droneDamage = 22;
        if (dpLvl >= 2) { droneDamage = 30; droneRange = 550; }
        if (dpLvl >= 3) { droneDamage = 40; droneRange = 550; droneSpeedMulti = 1.3; }

        const vcLvl = upgradeLevels['volatile_core'] || 0;
        if (vcLvl >= 1) { droneExplosionChance = 0.30; droneExplosionRadius = 60; droneExplosionDamage = 12; }
        if (vcLvl >= 2) { droneExplosionChance = 0.55; droneExplosionRadius = 80; droneExplosionDamage = 18; }
        if (vcLvl >= 3) { droneExplosionChance = 0.80; droneExplosionRadius = 100; droneExplosionDamage = 25; }
    }

    // === MEJORAS PERMANENTES DE TIENDA ===
    const permPowerCore = prog.permanentUpgrades?.powerCore || 0;
    const permHullPlating = prog.permanentUpgrades?.hullPlating || 0;
    const permEngineBoost = prog.permanentUpgrades?.engineBoost || 0;
    const permXpAmplifier = prog.permanentUpgrades?.xpAmplifier || 0;

    const damageMultiplier = 1 + (permPowerCore * 0.03); // +3% por nivel
    const bonusHP = permHullPlating * 5; // +5 HP por nivel
    const speedMultiplier = 1 + (permEngineBoost * 0.02); // +2% por nivel
    const xpMultiplier = 1 + (permXpAmplifier * 0.05); // +5% por nivel

    // Buff temporal (de bonus_damage)
    const finalDamageMulti = damageMultiplier * (tempDamageMultiplier || 1);

    return {
        // Laser
        hasLaser, damage: Math.round(damage * finalDamageMulti), fireRate, pierce, pierceInfinite, spreadCount,
        // Missiles
        hasRockets, rocketBurstCount, rocketDamage: Math.round(rocketDamage * finalDamageMulti),
        rocketExplosionDamage: Math.round(rocketExplosionDamage * finalDamageMulti),
        rocketExplosionRadius, rocketRicochetCount, rocketCritChance,
        // Orbital
        hasOrbit, orbCount, orbDamage: Math.round(orbDamage * finalDamageMulti),
        orbSizeMulti, orbKnockback, orbSlow,
        // Lightning
        hasLightning, lightningBounces, lightningCadence,
        lightningRange, lightningChainRange,
        lightningDamage: Math.round(lightningDamage * finalDamageMulti),
        // Plasma
        hasAura, auraRadius, auraDamage: Math.round(auraDamage * finalDamageMulti),
        auraTickRate, auraSlow,
        // Drones
        hasDrones, droneBaseCount, droneExtraChance, droneExtraCount,
        droneDamage: Math.round(droneDamage * finalDamageMulti), droneRange,
        droneSpeedMulti, droneLifetime, droneExplosionChance,
        droneExplosionRadius, droneExplosionDamage: Math.round(droneExplosionDamage * finalDamageMulti),
        // Evolutions
        hasNovaBeam: activeEvolutions.includes('laser_cannon'),
        hasArmageddon: activeEvolutions.includes('missile_launcher'),
        hasSingularity: activeEvolutions.includes('orbital_shield'),
        hasStormNexus: activeEvolutions.includes('lightning_ray'),
        hasAnnihilation: activeEvolutions.includes('plasma_field'),
        hasHiveMind: activeEvolutions.includes('alien_drone'),
        // Permanent stats
        bonusHP, speedMultiplier, xpMultiplier,
        damageMultiplier: finalDamageMulti
    };
}
```

### 1.7 Actualizar `resetGame()`

En la función `resetGame()`, cambiar la inicialización de skills:

**ANTES:**
```javascript
unlockedSkills = ['arsenal', 'laser_cannon'];
upgradeOptions = [];
upgradeSelectionActive = false;
```

**DESPUÉS:**
```javascript
activeWeapons = ['laser_cannon']; // Laser siempre activo
upgradeLevels = {};
activeEvolutions = [];
crystalsThisRun = 0;
tempDamageMultiplier = 1;
tempDamageTimer = 0;
upgradeOptions = [];
upgradeSelectionActive = false;
```

### 1.8 Actualizar `showUpgradePanel()`

La función actual renderiza el panel HTML de upgrades. Debe adaptarse para mostrar:
- El nivel del upgrade (I, II, III) con indicador visual
- Si es una activación de arma (mostrar el nombre del arma y descripción base)
- Si es una evolución (presentación visual especial, dorado/brillante)
- Si es un bonus (cristales, heal, damage)

El panel ya usa HTML generado dinámicamente. Adaptar para usar los nuevos objetos de `generateUpgradeOptions()` que ahora devuelven objetos con `{type, id, name, description, color, icon, level}` en vez de simples strings.

### 1.9 Actualizar `allSkillsUnlocked()`

```javascript
function allSkillsUnlocked() {
    // Solo cuenta armas disponibles en tienda
    const prog = loadProgression();
    for (const [weaponId, weapon] of Object.entries(WEAPONS)) {
        if (!prog.unlockedWeapons[weaponId]) continue;
        if (!activeWeapons.includes(weaponId)) return false;
        for (const branchId of Object.keys(weapon.branches)) {
            if ((upgradeLevels[branchId] || 0) < 3) return false;
        }
        if (!activeEvolutions.includes(weaponId)) return false;
    }
    return true;
}
```

### 1.10 Eliminar código obsoleto

- Eliminar la constante `SKILL_TREE` completa (excepto 'arsenal' si se usa en algún sitio de UI)
- Eliminar `WEAPON_UPGRADES` (se reemplaza por `WEAPONS[id].branches`)
- Eliminar la variable `unlockedSkills` y todas sus referencias
- Buscar TODAS las ocurrencias de `unlockedSkills.includes(` y reemplazar por la lógica equivalente con `activeWeapons` y `upgradeLevels`
- Eliminar `currentRunUnlockedWeapons` y `getUnlockedWeaponsForRun()` si aún existían

### 1.11 Adaptar sistemas de armas que leen stats

Cada sistema de arma en el código lee stats de `getWeaponStats()`. Los nombres de algunas propiedades cambian:

| Antes | Después | Notas |
|-------|---------|-------|
| `stats.pierce` (boolean) | `stats.pierce` (number) + `stats.pierceInfinite` (boolean) | Ahora pierce es un contador de enemigos atravesados |
| `stats.spreadCount` | `stats.spreadCount` | Sin cambio de nombre pero los valores son 0,3,5,7 en vez de 0,3 |
| `stats.rocketCount` | ELIMINADO | Ya no existe, usar `rocketBurstCount` |
| `stats.rocketRicochet` (boolean) | `stats.rocketRicochetCount` (number) | Ahora es cantidad, no boolean |
| `stats.droneCount` | `stats.droneBaseCount` + `stats.droneExtraChance` | Sistema de probabilidad |
| `stats.droneLifetime` | `stats.droneLifetime` | Sin cambio |
| `stats.droneHasExplosion` (boolean) | `stats.droneExplosionChance` (0-1) | Probabilidad en vez de boolean |
| NUEVO | `stats.orbCount` | Cantidad de orbes orbital |
| NUEVO | `stats.orbDamage` | Daño de orbes |
| NUEVO | `stats.orbSizeMulti` | Multiplicador tamaño |
| NUEVO | `stats.orbKnockback` | Fuerza de knockback |
| NUEVO | `stats.rocketCritChance` | Chance de crítico |
| NUEVO | `stats.auraSlow` | Ralentización en zona |
| NUEVO | `stats.orbSlow` | Ralentización por golpe |
| NUEVO | `stats.bonusHP` | HP extra de tienda |
| NUEVO | `stats.speedMultiplier` | Velocidad de tienda |
| NUEVO | `stats.xpMultiplier` | XP de tienda |

**BUSCAR** todas las funciones que leen de `stats` y actualizar nombres. Las principales son:
- Disparo de láser (buscar `stats.damage`, `stats.fireRate`, `stats.pierce`, `stats.spreadCount`)
- Disparo de misiles (buscar `stats.hasRockets`, `stats.rocketBurstCount`, etc.)
- Lightning chain (buscar `stats.hasLightning`, `stats.lightningBounces`, etc.)
- Plasma aura (buscar `stats.hasAura`, `stats.auraRadius`, etc.)
- Drone spawn (buscar `stats.hasDrones`, `stats.droneCount`, etc.)
- Orbital shield (buscar donde se crean/actualizan los orbes)

**CUIDADO con el orbital shield:** Actualmente los orbes se crean con un número fijo. Ahora `orbCount` puede cambiar durante el run. Implementar lógica para añadir/quitar orbes cuando cambie el count.

---

## FASE 2: SISTEMA DE CRISTALES

### 2.1 Variables nuevas

```javascript
// En zona de variables globales
let crystalsThisRun = 0; // Cristales ganados este run (in-world pickups)
let crystalPickups = []; // Array de pickups de cristal en el mundo

// Buff temporal de bonus
let tempDamageMultiplier = 1;
let tempDamageTimer = 0;
```

### 2.2 Drop de cristales al matar enemigos

En la función que maneja la muerte de enemigos (buscar donde se hace `enemy.hp <= 0` y se spawnea XP), añadir:

```javascript
// Al matar un enemigo:
const isTank = (enemy.type === 'TANK'); // o como esté definido
const dropCrystal = isTank || (Math.random() < 0.05); // Tanks siempre, 5% el resto
if (dropCrystal) {
    crystalPickups.push({
        x: enemy.x,
        y: enemy.y,
        size: 8,
        lifetime: 15, // Segundos antes de desparecer
        magnetRange: 150 // Rango de atracción al jugador
    });
}
```

### 2.3 Pickup de cristales

Similar al sistema de XP orbs. Los cristales se mueven hacia el jugador cuando están cerca:

```javascript
function updateCrystalPickups(dt) {
    for (let i = crystalPickups.length - 1; i >= 0; i--) {
        const c = crystalPickups[i];
        c.lifetime -= dt;
        if (c.lifetime <= 0) { crystalPickups.splice(i, 1); continue; }

        // Magnetismo hacia el jugador
        const dx = player.x - c.x;
        const dy = player.y - c.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < c.magnetRange) {
            const speed = 300 * (1 - dist / c.magnetRange); // Más rápido cuanto más cerca
            c.x += (dx / dist) * speed * dt;
            c.y += (dy / dist) * speed * dt;
        }

        // Recoger
        if (dist < 25) {
            crystalsThisRun++;
            spawnFloatingText(c.x, c.y, '+1', '#E0F0FF');
            crystalPickups.splice(i, 1);
        }
    }
}
```

### 2.4 Renderizar cristales

Dibujar cristales como diamantes pequeños azul claro/blanco, con brillo sutil:

```javascript
function renderCrystalPickups() {
    for (const c of crystalPickups) {
        ctx.save();
        ctx.translate(c.x - camera.x, c.y - camera.y);
        // Diamante pequeño
        ctx.fillStyle = '#E0F0FF';
        ctx.globalAlpha = Math.min(1, c.lifetime * 2); // Fade out al final
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.lineTo(5, 0);
        ctx.lineTo(0, 6);
        ctx.lineTo(-5, 0);
        ctx.closePath();
        ctx.fill();
        // Brillo
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.globalAlpha *= 0.5;
        ctx.stroke();
        ctx.restore();
    }
}
```

### 2.5 Bonus de fin de run

Cuando el jugador muere (buscar donde se activa `gameState = 'gameover'`), calcular bonus:

```javascript
const killBonus = Math.floor(killCount / 50);
const scoreBonus = Math.floor(score / 1000);
const difficultyMultiplier = [1.0, 1.5, 2.0, 3.0][currentDifficulty || 0];
const totalCrystals = Math.round((crystalsThisRun + killBonus + scoreBonus) * difficultyMultiplier);

// Aplicar bonus de Crystal Attractor de tienda
const prog = loadProgression();
const attractorLevel = prog.permanentUpgrades?.crystalAttractor || 0;
const attractorBonus = 1 + (attractorLevel * 0.05);
const finalCrystals = Math.round(totalCrystals * attractorBonus);

// Guardar
prog.crystals = (prog.crystals || 0) + finalCrystals;
saveProgression(prog);
```

### 2.6 Mostrar cristales en HUD

Añadir contador de cristales en el HUD durante el gameplay (esquina, pequeño, no intrusivo):

```javascript
// En renderHUD(), añadir:
ctx.fillStyle = '#E0F0FF';
ctx.font = 'bold 14px "Segoe UI", sans-serif';
ctx.textAlign = 'right';
ctx.fillText('◆ ' + crystalsThisRun, CANVAS_WIDTH - 15, 60); // O posición apropiada
```

### 2.7 Mostrar resumen en game over

En la pantalla de game over, mostrar desglose de cristales:
- Cristales recogidos: X
- Bonus kills (kills/50): +Y
- Bonus score (score/1000): +Z
- Multiplicador dificultad: ×N
- Bonus Crystal Attractor: ×N
- **TOTAL: N cristales**

---

## FASE 3: TIENDA ENTRE RUNS

### 3.1 Modificar `loadProgression()` / `saveProgression()`

Ampliar la estructura de datos persistente:

```javascript
function createDefaultProgression() {
    return {
        unlockedWeapons: {
            laser_cannon: true,
            orbital_shield: false,
            missile_launcher: false,
            lightning_ray: false,
            plasma_field: false,
            alien_drone: false
        },
        crystals: 0,
        permanentUpgrades: {
            powerCore: 0,    // 0-10
            hullPlating: 0,  // 0-10
            engineBoost: 0,  // 0-10
            xpAmplifier: 0,  // 0-10
            crystalAttractor: 0 // 0-10
        },
        highScores: {
            normal: 0,
            hard: 0,
            extreme: 0,
            nightmare: 0
        },
        currentDifficulty: 0, // 0=Normal, 1=Hard, 2=Extreme, 3=Nightmare
        tutorialDone: false, // Ha elegido su 2ª arma gratis
        stats: {
            totalRuns: 0,
            totalKills: 0,
            totalCrystalsEarned: 0
        }
    };
}
```

**IMPORTANTE:** `unlockedWeapons` ahora vuelve a empezar con solo `laser_cannon: true`. Ya no está todo desbloqueado como tras quitar bosses. El desbloqueo viene de la tienda.

### 3.2 Tutorial de primera partida

En el primer run (`prog.tutorialDone === false`), antes de empezar:
- Mostrar un panel: "Elige tu segunda arma" con Orbital Shield y Missile Launcher como opciones gratuitas
- Al elegir, desbloquear esa arma en `prog.unlockedWeapons` y marcar `prog.tutorialDone = true`
- Esto asegura que el primer run tenga 2 armas en el pool

### 3.3 Pantalla de tienda

Crear una nueva pantalla accesible desde:
- El menú principal (botón "SHOP" o "TIENDA")
- La pantalla de game over (botón "SHOP" entre "RETRY" y "MENU")

La tienda tiene dos secciones:

#### Sección 1: Armas
Mostrar las 6 armas en cards. Para cada una:
- Si desbloqueada: checkmark verde, icono del arma coloreado
- Si bloqueada pero disponible: precio en cristales, botón "COMPRAR"
- Si bloqueada y no disponible (requisito de armas previas): candado + texto "Desbloquea X armas primero"

**Lógica de disponibilidad en tienda:** Las armas se desbloquean progresivamente según cuántas armas haya comprado el jugador (sin contar el láser gratuito):

```javascript
function canBuyWeapon(weaponId, prog) {
    if (prog.unlockedWeapons[weaponId]) return false; // Ya comprada

    const purchasedCount = Object.values(prog.unlockedWeapons).filter(v => v).length - 1; // -1 por laser

    const WEAPON_PURCHASE_REQUIREMENTS = {
        'laser_cannon': 0,       // Siempre gratis
        'orbital_shield': 0,     // Disponible desde el inicio
        'missile_launcher': 0,   // Disponible desde el inicio
        'lightning_ray': 1,      // Requiere 1 arma comprada
        'plasma_field': 2,       // Requiere 2 armas compradas
        'alien_drone': 3         // Requiere 3 armas compradas
    };

    const price = WEAPONS[weaponId].shopPrice;
    return purchasedCount >= WEAPON_PURCHASE_REQUIREMENTS[weaponId] && (prog.crystals || 0) >= price;
}
```

#### Sección 2: Mejoras Permanentes
5 barras de progreso (0/10 cada una). Para cada una:
- Nombre + descripción del efecto
- Barra visual con 10 segmentos (llenos = comprados)
- Precio del siguiente nivel
- Botón "COMPRAR" si tiene cristales suficientes

**Fórmula de coste:** `base × (1 + (nivel - 1) × 0.8)` donde nivel es el SIGUIENTE nivel a comprar

| Mejora | Base |
|--------|------|
| Power Core | 50 |
| Hull Plating | 40 |
| Engine Boost | 40 |
| XP Amplifier | 60 |
| Crystal Attractor | 80 |

### 3.4 Renderizar tienda

Puede ser HTML overlay (como el panel de upgrades actual) o dibujado en Canvas. Recomendación: **Canvas** para consistencia visual con el resto del juego. Crear un nuevo `gameState = 'shop'`.

---

## FASE 4: SISTEMA DE DIFICULTADES

### 4.1 Variable de dificultad

```javascript
// En progresión persistente:
currentDifficulty: 0 // 0=Normal, 1=Hard, 2=Extreme, 3=Nightmare
```

### 4.2 Desbloqueo por puntuación

```javascript
const DIFFICULTY_THRESHOLDS = [0, 5000, 15000, 40000];
const DIFFICULTY_NAMES = ['NORMAL', 'HARD', 'EXTREME', 'NIGHTMARE'];
const DIFFICULTY_COLORS = ['#4A90D9', '#9F7AEA', '#FF4444', '#39FF14'];
```

Al terminar un run, si `score > highScores[difficulty]`, actualizar. Si el nuevo highscore supera un threshold, mostrar "NEW DIFFICULTY UNLOCKED".

### 4.3 Multiplicadores de dificultad

```javascript
const DIFFICULTY_MULTIPLIERS = [
    { enemyHP: 1.0, enemySpeed: 1.0, spawnRate: 1.0, crystals: 1.0, xp: 1.0, score: 1.0 },     // Normal
    { enemyHP: 1.4, enemySpeed: 1.2, spawnRate: 1.3, crystals: 1.5, xp: 1.2, score: 1.5 },     // Hard
    { enemyHP: 2.0, enemySpeed: 1.4, spawnRate: 1.6, crystals: 2.0, xp: 1.5, score: 2.5 },     // Extreme
    { enemyHP: 3.0, enemySpeed: 1.6, spawnRate: 2.0, crystals: 3.0, xp: 2.0, score: 4.0 }      // Nightmare
];
```

### 4.4 Aplicar multiplicadores

Buscar donde se define:
- **HP de enemigos** al spawner (buscar `enemy.hp =` o `enemy.maxHp =`) → multiplicar por `DIFFICULTY_MULTIPLIERS[currentDifficulty].enemyHP`
- **Velocidad de enemigos** (buscar donde se asigna velocidad al spawn) → multiplicar por `.enemySpeed`
- **Spawn rate** (buscar intervalos de spawn, timers de oleadas) → dividir por `.spawnRate` (más alto = más frecuente)
- **XP ganada** al matar (buscar donde se añade XP) → multiplicar por `.xp`
- **Score ganado** → multiplicar por `.score`

### 4.5 Selector de dificultad

En el menú principal, añadir selector de dificultad:
- Solo muestra dificultades desbloqueadas
- Muestra el high score de cada dificultad
- Indica multiplicadores de recompensa (×1.5 cristales, etc.)
- Color de fondo del selector cambia según dificultad

### 4.6 Indicador en HUD

Mostrar un pequeño badge de dificultad en el HUD durante gameplay:
```javascript
// En renderHUD():
const diff = DIFFICULTY_MULTIPLIERS[currentDifficulty];
ctx.fillStyle = DIFFICULTY_COLORS[currentDifficulty];
ctx.font = 'bold 10px "Segoe UI", sans-serif';
ctx.fillText(DIFFICULTY_NAMES[currentDifficulty], 15, 20);
```

---

## FASE 5: EVOLUCIONES CAPSTONE (puede implementarse después)

Las evoluciones son mecánicas nuevas que requieren código custom por arma. Se recomienda implementar como un prompt separado, pero aquí va la estructura base:

### 5.1 Detección de evolución disponible

Ya cubierto en `getAvailableUpgrades()` - verifica que las 3 ramas estén a nivel III.

### 5.2 Flags en `getWeaponStats()`

Ya incluidos en la nueva `getWeaponStats()`:
- `hasNovaBeam`, `hasArmageddon`, `hasSingularity`, `hasStormNexus`, `hasAnnihilation`, `hasHiveMind`

### 5.3 Implementación de cada evolución

Cada una necesita su propia lógica. Marcar con `// TODO: EVOLUTION` en el código y dejar para prompt separado:
- **Nova Beam:** Cada 5 disparos, rayo cónico masivo
- **Armageddon Protocol:** Cada 8s, mega-misil con explosión masiva
- **Singularity Core:** Campo gravitacional continuo
- **Storm Nexus:** Campo eléctrico residual entre enemigos
- **Annihilation Sphere:** Mini-explosiones chain en kills
- **Hive Mind:** Drones orbitales con mini-láseres

---

## VERIFICACIÓN FINAL

### Checklist de funcionalidad

1. **Iniciar partida:** Laser siempre activo + armas desbloqueadas en tienda disponibles en pool
2. **Level up:** Aparecen 3 opciones: activar arma / subir nivel upgrade / evolución
3. **Seleccionar activar arma:** El arma se activa y sus upgrades empiezan a aparecer en pool
4. **Seleccionar upgrade nivel I:** El nivel sube a I, próxima vez aparece nivel II
5. **Seleccionar upgrade nivel III:** Rama completa, ya no aparece en pool
6. **3 ramas nivel III:** Aparece evolución capstone en pool
7. **Pool agotado:** Aparecen opciones de bonus (cristales, heal, damage)
8. **Cristales dropean:** Tanks siempre, 5% resto, pickup con magnetismo
9. **Game over:** Muestra desglose de cristales, total ganado
10. **Tienda:** Comprar armas, comprar mejoras permanentes, cristales se gastan
11. **Mejoras permanentes:** Aplican en todos los runs (daño, HP, velocidad, XP, cristales)
12. **Dificultad:** Selector funcional, multiplicadores aplican, high scores separados
13. **Tutorial:** Primera partida ofrece elegir 2ª arma gratis
14. **localStorage:** Todo persiste entre sesiones (cristales, armas, mejoras, scores, dificultad)

### Buscar errores comunes

- `unlockedSkills` no debe existir en ninguna parte del código
- `SKILL_TREE` solo debe contener 'arsenal' (o eliminarse si no se usa)
- `getWeaponStats()` retorna las nuevas propiedades
- Todas las armas empiezan bloqueadas en tienda (excepto laser)
- El panel de upgrades muestra niveles (I, II, III) correctamente
- Los cristales persisten entre runs
- La dificultad afecta spawns, HP, velocidad, y recompensas

---

## ORDEN DE EJECUCIÓN RECOMENDADO

1. **Primero:** Definir nuevas estructuras de datos (WEAPONS, variables de estado)
2. **Segundo:** Reescribir funciones core (getAvailableUpgrades, generateUpgradeOptions, selectUpgrade, getWeaponStats)
3. **Tercero:** Actualizar resetGame() y el panel de UI de upgrades
4. **Cuarto:** Adaptar todos los sistemas de armas que leen stats
5. **Quinto:** Implementar cristales (drop, pickup, persistencia)
6. **Sexto:** Crear tienda (progresión persistente, UI)
7. **Séptimo:** Sistema de dificultades
8. **Octavo:** Verificar TODO, corregir errores
9. **(Separado):** Evoluciones capstone (prompt aparte)

**IMPORTANTE:** Después de cada fase, verificar que el juego arranca sin errores en consola. Si una fase es demasiado grande, dividirla en sub-pasos.
