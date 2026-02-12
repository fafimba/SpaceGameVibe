# PROMPT: Extraer y eliminar sistema de bosses de index.html

## CONTEXTO

Stellar Swarm es un space shooter tipo Vampire Survivors (~11,200 líneas en un solo `index.html`). Actualmente tiene un sistema de bosses que bloquea el desbloqueo de armas: para obtener cada arma nueva, el jugador debe derrotar a un boss específico. Este sistema se va a eliminar porque:

1. Bloquear armas tras bosses aburre a los jugadores en las primeras partidas
2. Cada arma nueva requiere un boss nuevo (no escala)
3. Se va a reemplazar por un sistema de meta-progresión con cristales y tienda (ver `WEAPON_EVOLUTION_DESIGN.md`)

**OBJETIVO:** Extraer TODO el código del sistema de bosses a un archivo separado (`_bosses_archived/boss_system.js`) y eliminar toda referencia a bosses de `index.html`, asegurando que el juego funcione correctamente sin bosses y con TODAS las armas disponibles desde el inicio.

---

## FASE 1: EXTRAER CÓDIGO DE BOSSES A ARCHIVO SEPARADO

Crear `_bosses_archived/boss_system.js` con todo el código extraído, organizado y comentado para posible reimplementación futura. Incluir al inicio del archivo un comentario:

```javascript
/**
 * BOSS SYSTEM - ARCHIVED
 * Extraído de index.html el [fecha]
 *
 * Este código contiene el sistema completo de bosses de Stellar Swarm.
 * Se archivó para posible reimplementación futura con un sistema
 * diferente de progresión (no ligado a desbloqueo de armas).
 *
 * Para reimplementar, ver _bosses_archived/README.md
 */
```

### Código a extraer (copiar al archivo, luego eliminar de index.html):

#### 1.1 Constantes de bosses (~línea 997-1005)
```
const BOSS_SPAWN_LEVELS = [8, 14, 20, 27, 35];
const BOSS_TYPES = ['orbitalGuardian', 'missileTitan', 'lightningNexus', 'plasmaOverlord', 'swarmMother'];
const BOSS_NAMES = [...]
const BOSS_COLORS = [...]
const BOSS_BASE_HP = [2000, 6000, 8000, 11000, 15000];
const BOSS_WEAPON_UNLOCK = ['orbital_shield', 'missile_launcher', 'lightning_ray', 'plasma_field', 'alien_drone'];
```
Bloque completo: sección `// BOSS SYSTEM` desde línea 997 hasta fin de constantes.

#### 1.2 Constantes de proyectiles de boss (~línea 1007-1012)
```
const BOSS_PROJ_SPEED, BOSS_PROJ_DAMAGE, BOSS_PROJ_HP, BOSS_PROJ_RADIUS, BOSS_PROJ_LIFETIME
```

#### 1.3 Variables de estado de boss (~línea 1014-1055)
Todas estas variables globales:
- `currentBoss`, `bossProjectiles`, `bossPhase`, `bossPatternTimer`
- `bossDefeated`, `bossesDefeatedThisRun`, `bossHealthBarDisplayHP`
- `bossIncoming`
- `bossVictoryScreen`, `bossVictoryTimer`, `bossVictoryData`
- `BOSS_VICTORY_DURATION`, `BOSS_VICTORY_MIN_SKIP`, `bossVictoryParticles`
- `bossSpheres` (Orbital Guardian)
- `bossHomingMissiles`, `bossMTCannonTimer` (Missile Titan)
- `bossLightningStrikes`, `bossTrailNodes`, `bossTrailRays`, `bossTrailTimer` (Lightning Nexus)
- `bossPlasmaRings` (Plasma Overlord)
- `bossPatternActive`, `bossPatternState`, `bossPatternIndex`, `bossPatternCooldown` (declaradas implícitamente, reseteadas en resetGame líneas 1419-1422)
- `bossBroodExplosions`, `bossBroodCooldown` (~línea 6637-6638, Swarm Mother brood system)

#### 1.4 Sistema de arena (~líneas 988-995, 3494-3540)
Variables:
- `arenaActive`, `arenaCenter`, `ARENA_RADIUS`, `ARENA_START_RADIUS`, `ARENA_CLOSE_SPEED`
- `arenaCurrentRadius`, `arenaSpawnPaused`

Funciones:
- `activateArena(centerX, centerY)` (~línea 3494)
- `deactivateArena()` (~línea 3519)
- `enforceArenaBoundary()` (~línea 3525)

#### 1.5 Funciones principales de boss (~líneas 3555-4055)
Todo el bloque de funciones de boss:
- `calculateBossHP()` - cálculo de HP con escalado
- `spawnBoss(bossIndex)` - invocación de boss
- `materializeBoss()` - creación del objeto boss
- `updateBoss(dt)` - actualización cada frame
- `damageBoss(amount)` - aplicar daño
- `onBossDefeated()` - **CRÍTICO: contiene la lógica de desbloqueo de armas**
- Dismiss de victory screen

#### 1.6 Patrones de ataque de boss (~líneas 4626-4700+)
Todas las funciones de patrones de ataque:
- Secuencias de patrones (`OG_PHASE1_SEQUENCE`, `MT_PHASE1_SEQUENCE`, etc.)
- Funciones de ataque individuales por tipo de boss
- `updateBossPatterns(dt)`, `updateBossProjectiles(dt)`
- Funciones específicas: `updateBossSpheres(dt)`, `updateHomingMissiles(dt)`, etc.

#### 1.7 Renderizado de boss
- `renderBoss()` - dibujado del boss
- `renderBossSpheres()` - esferas del Orbital Guardian
- `renderBossHealthBar()` - barra de vida (~líneas 4340-4416)
- `renderBossVictoryScreen()` - pantalla de victoria (~líneas 10299-10467)
- Warning de boss incoming (~líneas 9222-9285)
- Renderizado de proyectiles, misiles homing, trail nodes, plasma rings, lightning strikes

#### 1.8 Swarm Mother brood system (~líneas 6637-6638, 6726-6815)
Variables: `bossBroodExplosions`, `bossBroodCooldown`
Funciones: lógica de spawn de brood en `updateBoss()` (~líneas 6726-6788), `renderBroodExplosions()` (~línea 6802)

#### 1.9 Arsenal Gallery con lógica de candados (~líneas 10526-10649)
Función `renderArsenalGallery()` - copiar la versión actual al archivo (tiene padlocks y "BOSS LVL X")

---

## FASE 2: ELIMINAR REFERENCIAS A BOSSES DE INDEX.HTML

### 2.1 Eliminar bloques puros de boss
Eliminar todos los bloques listados en Fase 1 de `index.html`.

### 2.2 Limpiar `resetGame()` (~línea 1404)
**ELIMINAR** las líneas 1405-1432 (reset de arena y boss state):
```javascript
// ELIMINAR todo esto:
arenaActive = false;
arenaCurrentRadius = ARENA_RADIUS;
arenaSpawnPaused = false;
currentBoss = null;
bossIncoming = null;
bossProjectiles = [];
bossPhase = 1;
bossPatternTimer = 0;
bossDefeated = false;
bossesDefeatedThisRun = [];
bossHealthBarDisplayHP = 0;
bossPatternIndex = 0;
bossPatternCooldown = 2.5;
bossPatternActive = false;
bossPatternState = null;
bossSpheres = [];
bossHomingMissiles = [];
bossLightningStrikes = [];
bossTrailNodes = [];
bossTrailRays = [];
bossPlasmaRings = [];
bossVictoryScreen = null;
bossVictoryTimer = 0;
bossVictoryData = null;
bossVictoryParticles = [];
```
**TAMBIÉN** buscar resets de `bossBroodExplosions = []` y `bossBroodCooldown = 0` en otras partes del código (líneas 3654-3655, 3914-3915, 4003) y eliminarlos.

### 2.3 Limpiar cheat codes (~líneas 824-921)
**ELIMINAR** los cheats que invocan bosses:
- `'arena'` (toggle arena) - línea 887
- `'boss'` (spawnBoss(0)) - línea 895
- `'titan'` (spawnBoss(1)) - línea 898
- `'nexus'` (spawnBoss(2)) - línea 901
- `'plasma'` (spawnBoss(3)) - línea 904
- `'swarm'` (spawnBoss(4)) - línea 907
- `'wipe'` (wipe progression) - línea 914

**MANTENER** los cheats de armas (siguen siendo útiles para debug):
- `'rocket'`, `'orbit'`, `'chain'`, `'drone'`, `'full'`
- `'reset'`

### 2.4 Limpiar game loop / update (~línea 1908+)
Buscar y eliminar en la función principal `update()`:
- Bloque de `bossVictoryScreen` update (~línea 1908-1932), incluyendo el loop de `bossVictoryParticles` (~líneas 1912-1921)
- Bloque de `bossIncoming` update (~línea 1978)
- Llamada a `checkBossSpawn()` (buscar en update loop, ~línea 2001)
- Llamada a `updateBoss(deltaTime)` (buscar en update loop, ~línea 2001)
- Bloque de arena closing animation + `enforceArenaBoundary()` (~línea 1971-1982)
- Check de `arenaSpawnPaused` que bloquea spawns (~línea 1986) — cambiar a que siempre spawnee

### 2.5 Limpiar sistema de colisiones (CUIDADO - código MIXTO)
El sistema de colisiones tiene checks contra boss intercalados con checks contra enemigos normales. **NO eliminar funciones enteras**, solo las partes que referencian boss:

**Buscar y eliminar cada ocurrencia de estos patrones:**

a) **Bullets vs Boss** - Buscar bloques tipo:
```javascript
if (currentBoss) {
    // ... collision check with currentBoss
}
```

b) **Boss projectiles vs Player** - Buscar bloques que iteran `bossProjectiles`:
```javascript
for (const bp of bossProjectiles) { ... }
```

c) **Homing missiles** - Buscar bloques que iteran `bossHomingMissiles`:
```javascript
for (const hm of bossHomingMissiles) { ... }
```

d) **Trail nodes** - Buscar bloques que iteran `bossTrailNodes`:
```javascript
for (const tn of bossTrailNodes) { ... }
```

e) **Boss spheres vs player** - Buscar `bossSpheres` collision checks

f) **Boss body vs player** - Buscar collision con `currentBoss.x/y` y `currentBoss.size`

g) **Lightning strikes, plasma rings** - Buscar `bossLightningStrikes`, `bossPlasmaRings`

**IMPORTANTE:** Hay múltiples ubicaciones donde las armas verifican si pueden dañar al boss. Buscar TODAS las llamadas a `damageBoss()`:
- Lightning chain: ~línea 2839-2894 (buscar `damageBoss` en lightning code)
- Drones: ~línea 3400-3463 (collision + explosión)
- Orbital shield: ~línea 8220-8230
- Plasma field aura: ~línea 8276-8285
- Missile explosion: ~línea 8326-8333
- Bullets directos: ~línea 8500-8540

Para cada uno: eliminar el `if (currentBoss)` block o la llamada `damageBoss()` pero **MANTENER** la lógica de daño a enemigos normales intacta.

### 2.6 Limpiar input handlers (~líneas 1541-1649)
Buscar los handlers de keydown/touch que dismiss la victory screen:
```javascript
if (bossVictoryScreen) {
    if (bossVictoryTimer >= BOSS_VICTORY_MIN_SKIP) {
        // ...dismiss
    }
}
```
Eliminar estos bloques.

### 2.7 Limpiar renderizado
Eliminar llamadas a funciones de render de boss en la función principal de render:
- `renderBoss()`
- `renderBossHealthBar()`
- `renderBossVictoryScreen()`
- Boss incoming warning
- Renderizado de `bossProjectiles`, `bossHomingMissiles`, `bossLightningStrikes`, `bossTrailNodes`, `bossPlasmaRings`, `bossSpheres`, `bossBroodExplosions`
- Llamadas en render principal (~líneas 9329-9335): `renderBossSpheres()`, `renderBossProjectiles()`, `renderHomingMissiles()`, `renderLightningStrikes()`, `renderPlasmaRings()`, `renderBroodExplosions()`, `renderTrailNodes()`

### 2.8 Limpiar targeting de armas que buscan al boss
Varias armas (lightning, drones, orbital, plasma) buscan al boss como target. Buscar bloques como:
```javascript
if (currentBoss) {
    const dx = currentBoss.x - player.x;
    const dy = currentBoss.y - player.y;
    // ...
    nearbyEnemies.push(currentBoss);
}
```
Eliminar estos bloques. Las armas deben seguir funcionando contra enemigos normales.

---

## FASE 3: MODIFICAR SISTEMA DE DESBLOQUEO DE ARMAS

**Esta es la parte más crítica.** Actualmente las armas están bloqueadas hasta que derrotas al boss correspondiente. Sin bosses, TODAS las armas deben estar disponibles.

### 3.1 Modificar `createDefaultProgression()` (~línea 736)
**ANTES:**
```javascript
function createDefaultProgression() {
    const unlockedWeapons = {};
    for (const wid of WEAPON_IDS) {
        unlockedWeapons[wid] = (wid === 'laser_cannon');
    }
    return {
        unlockedWeapons,
        bossDefeats: {},
        stats: { totalBossDefeats: 0, totalRuns: 0 }
    };
}
```

**DESPUÉS:**
```javascript
function createDefaultProgression() {
    const unlockedWeapons = {};
    for (const wid of WEAPON_IDS) {
        unlockedWeapons[wid] = true; // Todas las armas disponibles
    }
    return {
        unlockedWeapons,
        stats: { totalRuns: 0 }
    };
}
```
- Eliminar `bossDefeats` del objeto
- Eliminar `totalBossDefeats` de stats
- Todas las armas `= true`

### 3.2 Modificar `loadProgression()` (~línea 748)
Eliminar las líneas que inicializan campos de boss Y añadir migración para saves existentes:
```javascript
// ELIMINAR estas líneas:
if (!data.bossDefeats) data.bossDefeats = {};
if (data.stats.totalBossDefeats === undefined) data.stats.totalBossDefeats = 0;

// AÑADIR migración de saves antiguos:
// Jugadores que ya tenían el juego pueden tener armas bloqueadas en su save.
// Con la eliminación de bosses, todas deben estar desbloqueadas.
for (const wid of WEAPON_IDS) {
    data.unlockedWeapons[wid] = true; // Desbloquear todas las armas en saves antiguos
}
// Limpiar datos obsoletos de boss del save
delete data.bossDefeats;
if (data.stats) delete data.stats.totalBossDefeats;
```
Esto garantiza que jugadores existentes con saves antiguos no queden con armas bloqueadas.

### 3.3 Simplificar `canUnlockSkill()` (~línea 7727)
**ANTES:**
```javascript
function canUnlockSkill(skillId) {
    if (unlockedSkills.includes(skillId)) return false;
    if (skillPoints < SKILL_TREE[skillId].cost) return false;

    // BLOQUEO POR ARMAS NO DESBLOQUEADAS
    if (WEAPON_IDS.includes(skillId) && !currentRunUnlockedWeapons.includes(skillId)) return false;
    for (const wid of WEAPON_IDS) {
        if (WEAPON_UPGRADES[wid] && WEAPON_UPGRADES[wid].includes(skillId) && !currentRunUnlockedWeapons.includes(wid)) return false;
    }

    // Check prerequisites
    // ...
}
```

**DESPUÉS:**
```javascript
function canUnlockSkill(skillId) {
    if (unlockedSkills.includes(skillId)) return false;
    if (skillPoints < SKILL_TREE[skillId].cost) return false;

    // Check prerequisites
    const skill = SKILL_TREE[skillId];
    for (const prereq of skill.prereqs) {
        if (!unlockedSkills.includes(prereq)) return false;
    }
    return true;
}
```
**Eliminar** las dos comprobaciones de `currentRunUnlockedWeapons`. Ahora todas las armas y sus upgrades están siempre disponibles si cumplen prerrequisitos.

### 3.4 Simplificar `resetGame()` skill init (~línea 1501-1504)
**ANTES:**
```javascript
currentRunUnlockedWeapons = getUnlockedWeaponsForRun();
unlockedSkills = ['arsenal', 'laser_cannon'];
```

**DESPUÉS:**
```javascript
unlockedSkills = ['arsenal', 'laser_cannon'];
```
Eliminar la línea de `currentRunUnlockedWeapons` ya que ya no es necesaria.

### 3.5 Eliminar variable y función obsoletas
- Eliminar `let currentRunUnlockedWeapons = ['laser_cannon'];` (~línea 785)
- Eliminar `function getUnlockedWeaponsForRun()` (~línea 780-783)
- Mantener `WEAPON_IDS`, `WEAPON_UPGRADES`, `loadProgression()`, `saveProgression()` - siguen siendo necesarios para el futuro sistema de tienda

### 3.6 Reescribir `renderArsenalGallery()` (~línea 10526)
Eliminar toda la lógica de candados/locked. Ahora todas las armas se muestran como desbloqueadas:

**Cambios clave:**
- Eliminar propiedad `bossLvl` de `ARSENAL_WEAPONS`
- Eliminar el `if (!unlocked)` que dibuja el padlock y "BOSS LVL X"
- Simplificar: `const unlocked = true;` (o eliminar la variable y asumir siempre unlocked)
- Quitar la llamada a `loadProgression()` para check de armas (ya no necesario aquí)

---

## FASE 4: VERIFICACIÓN

Después de todos los cambios, verificar:

### 4.1 Buscar referencias residuales
Hacer grep/búsqueda en index.html por CADA uno de estos términos y confirmar CERO resultados:
```
currentBoss
bossIncoming
bossProjectiles
bossSpheres
bossHomingMissiles
bossLightningStrikes
bossTrailNodes
bossTrailRays
bossPlasmaRings
bossVictoryScreen
bossVictoryTimer
bossVictoryData
bossVictoryParticles
bossPatternTimer
bossPatternActive
bossPatternState
bossPatternIndex
bossPatternCooldown
bossDefeated
bossesDefeatedThisRun
bossHealthBarDisplayHP
bossPhase
bossMTCannonTimer
bossTrailTimer
bossBroodExplosions
bossBroodCooldown
bossMTCannonTimer
BOSS_SPAWN_LEVELS
BOSS_TYPES
BOSS_NAMES
BOSS_COLORS
BOSS_BASE_HP
BOSS_WEAPON_UNLOCK
BOSS_PROJ_SPEED
BOSS_PROJ_DAMAGE
BOSS_PROJ_HP
BOSS_PROJ_RADIUS
BOSS_PROJ_LIFETIME
BOSS_VICTORY_DURATION
BOSS_VICTORY_MIN_SKIP
arenaActive
arenaCenter
arenaCurrentRadius
arenaSpawnPaused
ARENA_RADIUS
ARENA_START_RADIUS
ARENA_CLOSE_SPEED
activateArena
deactivateArena
enforceArenaBoundary
damageBoss
spawnBoss
materializeBoss
updateBoss
checkBossSpawn
onBossDefeated
renderBoss
renderBossHealthBar
renderBossVictoryScreen
renderBossProjectiles
renderHomingMissiles
renderLightningStrikes
renderPlasmaRings
renderTrailNodes
renderBossSpheres
renderBroodExplosions
calculateBossHP
currentRunUnlockedWeapons
getUnlockedWeaponsForRun
bossDefeats
totalBossDefeats
weaponUnlock
bossLvl
padlock
```

Los ÚNICOS que pueden seguir existiendo son:
- `bossDefeats` SOLO si aparece en migración de datos de localStorage (para no romper saves existentes)
- `WEAPON_IDS` - se mantiene (no es de bosses)
- `WEAPON_UPGRADES` - se mantiene (no es de bosses)

### 4.2 Verificar funcionalidad
Verificar que se puede:
1. Iniciar el juego sin errores en consola
2. Las 6 armas aparecen en el pool de upgrades al subir de nivel
3. Elegir cualquier arma y sus upgrades funciona
4. Los enemigos normales siguen spawneando correctamente (sin `arenaSpawnPaused` bloqueando)
5. El game over screen muestra el Arsenal con todas las armas desbloqueadas
6. Los cheats de armas (`rocket`, `orbit`, `chain`, `drone`, `full`) siguen funcionando
7. `localStorage` se guarda/carga sin errores

### 4.3 Contar líneas eliminadas
El archivo debería reducirse significativamente. Reportar:
- Líneas antes: ~11,205
- Líneas después: (estimar ~8,500-9,000)
- Líneas del archivo boss_system.js extraído

---

## RESUMEN DE ARCHIVOS

| Acción | Archivo |
|--------|---------|
| CREAR | `_bosses_archived/boss_system.js` (código extraído) |
| MODIFICAR | `index.html` (eliminar bosses, liberar armas) |

## ORDEN DE EJECUCIÓN RECOMENDADO

1. **Primero:** Crear `boss_system.js` copiando todo el código de boss
2. **Segundo:** Modificar el sistema de progresión (Fase 3) - esto es lo más delicado
3. **Tercero:** Eliminar bloques puros de boss (Fase 2.1-2.4)
4. **Cuarto:** Limpiar colisiones y targeting (Fase 2.5, 2.8) - con mucho cuidado
5. **Quinto:** Limpiar renderizado (Fase 2.7)
6. **Sexto:** Limpiar input handlers y cheats (Fase 2.6, 2.3)
7. **Séptimo:** Verificación completa (Fase 4)

**PRECAUCIÓN:** No eliminar código sin antes haberlo copiado al archivo de respaldo. Trabajar bloque por bloque, no todo a la vez.
