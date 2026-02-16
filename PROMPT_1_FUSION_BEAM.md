# PROMPT: Implementar Rayo de Fusión (Fusion Beam) — Arma Inicial Alternativa


## Especificación del FUSION BEAM

### Configuración en WEAPONS

```javascript
'fusion_beam': {
    name: 'FUSION BEAM',
    color: '#00FFCC',
    icon: 'fusionbeam',
    description: 'Continuous lock-on beam',
    shopPrice: 0,
    isStartingWeapon: true,
    excludes: 'laser_cannon',
    branches: {
        'forked_beam': {
            name: 'Forked Beam',
            icon: 'fork',
            levels: [
                { description: 'Beam splits: 2 targets', effect: { beamTargets: 2 } },
                { description: '3 simultaneous targets', effect: { beamTargets: 3 } },
                { description: '4 targets, full damage each', effect: { beamTargets: 4 } }
            ]
        },
        'intensification': {
            name: 'Intensification',
            icon: 'ramp',
            levels: [
                { description: 'Damage ramps +15%/s on same target (max +60%)', effect: { beamRampRate: 0.15, beamRampMax: 0.60 } },
                { description: 'Ramp +20%/s, max +100%', effect: { beamRampRate: 0.20, beamRampMax: 1.00 } },
                { description: 'Ramp +25%/s, max +150%, burn DoT on disconnect', effect: { beamRampRate: 0.25, beamRampMax: 1.50, beamBurnDamage: 5, beamBurnDuration: 2.0 } }
            ]
        },
        'expanding_ray': {
            name: 'Expanding Ray',
            icon: 'expand',
            levels: [
                { description: 'Range: 350 → 475px', effect: { beamRange: 475 } },
                { description: 'Range: 600px, Width: 14px (hits enemies in line)', effect: { beamRange: 600, beamWidth: 14 } },
                { description: 'Range: 700px, Width: 22px, pierces all enemies', effect: { beamRange: 700, beamWidth: 22, beamPierce: true } }
            ]
        }
    },
    evolution: {
        name: 'SIPHON NEXUS',
        icon: 'siphon',
        description: 'Killed enemies emit beams to 3 nearby enemies for 2s at 50% DPS',
        effect: { siphonNexus: true }
    }
}
```

### Stats Base

| Propiedad | Valor |
|-----------|-------|
| `beamDPS` | 26 dmg/sec |
| `beamTickRate` | 0.1s (daño por tick = 2.6) |
| `beamRange` | 350px |
| `beamWidth` | 6px (solo visual base, no colisión en línea) |
| `beamTargets` | 1 |
| `beamRampRate` | 0 (sin ramp base) |
| `beamRampMax` | 0 |
| `beamBurnDamage` | 0 |
| `beamBurnDuration` | 0 |
| `beamPierce` | false |

### getWeaponStats() — Bloque a añadir

```javascript
// === FUSION BEAM ===
let hasFusionBeam = activeWeapons.includes('fusion_beam');
let beamDPS = 26;
let beamTickRate = 0.1;
let beamRange = 350;
let beamWidth = 6;
let beamTargets = 1;
let beamRampRate = 0;
let beamRampMax = 0;
let beamBurnDamage = 0;
let beamBurnDuration = 0;
let beamPierce = false;

if (hasFusionBeam) {
    const fbLvl = upgradeLevels['forked_beam'] || 0;
    if (fbLvl >= 1) beamTargets = 2;
    if (fbLvl >= 2) beamTargets = 3;
    if (fbLvl >= 3) beamTargets = 4;

    const inLvl = upgradeLevels['intensification'] || 0;
    if (inLvl >= 1) { beamRampRate = 0.15; beamRampMax = 0.60; }
    if (inLvl >= 2) { beamRampRate = 0.20; beamRampMax = 1.00; }
    if (inLvl >= 3) { beamRampRate = 0.25; beamRampMax = 1.50; beamBurnDamage = 5; beamBurnDuration = 2.0; }

    const erLvl = upgradeLevels['expanding_ray'] || 0;
    if (erLvl >= 1) beamRange = 475;
    if (erLvl >= 2) { beamRange = 600; beamWidth = 14; }
    if (erLvl >= 3) { beamRange = 700; beamWidth = 22; beamPierce = true; }
}
```

Añadir al return de `getWeaponStats()`:
```javascript
// Fusion Beam
hasFusionBeam, beamDPS: Math.round(beamDPS * finalDamageMulti * 10) / 10,
beamTickRate, beamRange, beamWidth, beamTargets,
beamRampRate, beamRampMax, beamBurnDamage, beamBurnDuration, beamPierce,
hasSiphonNexus: activeEvolutions.includes('fusion_beam'),
```

### Estado del Beam (variables globales junto a `auraState`)

```javascript
let beamState = {
    targets: [],        // Array de { enemy, rampCurrent, tickTimer }
    burnEffects: []     // Array de { enemy, damagePerTick, tickTimer, duration }
};
```

Resetear en `resetGame()`:
```javascript
beamState = { targets: [], burnEffects: [] };
```

### Lógica de Update — función `updateFusionBeam()`

Llamar desde `updateWeapons()`:
```javascript
if (activeWeapons.includes('fusion_beam')) {
    updateFusionBeam();
}
```

Lógica de `updateFusionBeam()`:

1. Obtener stats con `getWeaponStats()`.
2. Si `!stats.hasFusionBeam || !player` → return.
3. Buscar los N enemigos más cercanos al jugador dentro de `stats.beamRange` usando `spatialGrid.queryRadius(player.x, player.y, stats.beamRange)`, ordenados por distancia, tomando `stats.beamTargets` máximo.
4. Para cada target:
   - Si el target ya estaba en `beamState.targets` (mismo enemy), mantener su `rampCurrent` e incrementar: `rampCurrent = Math.min(rampCurrent + stats.beamRampRate * deltaTime, stats.beamRampMax)`.
   - Si es un target nuevo, crear entrada con `rampCurrent: 0`.
   - Incrementar `tickTimer += deltaTime`. Cuando `tickTimer >= stats.beamTickRate`:
     - Calcular daño: `stats.beamDPS * stats.beamTickRate * (1 + rampCurrent)`.
     - Si `stats.beamPierce` y `stats.beamWidth > 6`: hacer colisión de línea (rectángulo rotado) desde el jugador hasta `beamRange` en dirección al target, dañando todos los enemigos cuya hitbox intersecte la línea de ancho `beamWidth`.
     - Si no pierce: solo dañar el target principal.
     - Aplicar daño: `enemy.hp -= damage`. Mostrar floating text con color `#00FFCC`.
     - Si `enemy.hp <= 0`: llamar a `killEnemy()`. Si tiene burn, aplicar burn effect al morir (para el DoT).
     - Reset tickTimer.
5. Limpiar targets que ya no están en rango o murieron.
6. Si un target fue desconectado y `stats.beamBurnDamage > 0`: añadir a `beamState.burnEffects` con el `beamBurnDamage` y `beamBurnDuration`.
7. Actualizar burn effects: aplicar daño cada 0.5s durante la duración. Eliminar los expirados.

### Rendering — función `renderFusionBeam()`

Llamar desde `render()` junto a `renderAura()`:
```javascript
renderFusionBeam();
```

Para cada target activo en `beamState.targets`:
- Dibujar línea desde el nose del jugador (calcular con `player.angle` igual que en `fireBullet()`) hasta la posición del enemigo.
- Línea principal: `ctx.strokeStyle = '#00FFCC'`, `ctx.lineWidth = stats.beamWidth`, `ctx.globalAlpha = 0.6`.
- Línea inner glow: misma línea con `lineWidth = stats.beamWidth * 0.4`, `color = '#FFFFFF'`, `globalAlpha = 0.8`.
- Si hay ramp > 0: hacer la línea ligeramente más brillante/ancha. Multiplicar width por `1 + rampCurrent * 0.3`.
- Añadir partícula de impacto en el punto del enemigo: pequeño flash pulsante.
- Para targets secundarios (beamTargets > 1): dibujar con `lineWidth * 0.5` y `globalAlpha = 0.4`.
- Para burn effects activos: dibujar un glow naranja pulsante alrededor del enemigo.

### Iconos

En `drawSkillIcon()` añadir:
```javascript
} else if (icon === 'fusionbeam') {
    // Rayo continuo: línea gruesa con punto en el extremo
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy);
    ctx.lineTo(cx + 8, cy);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 8, cy, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx - 8, cy, 2, 0, Math.PI * 2);
    ctx.fill();
} else if (icon === 'fork') {
    // Línea que se bifurca
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy);
    ctx.lineTo(cx, cy);
    ctx.lineTo(cx + 7, cy - 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 7, cy + 6);
    ctx.stroke();
} else if (icon === 'ramp') {
    // Flecha ascendente (rampa de daño)
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy + 6);
    ctx.lineTo(cx + 7, cy - 6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 2, cy - 6);
    ctx.lineTo(cx + 7, cy - 6);
    ctx.lineTo(cx + 7, cy - 1);
    ctx.stroke();
}
```

En `drawWeaponIconAt()` añadir case:
```javascript
case 'fusionbeam':
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-s, 0);
    ctx.lineTo(s, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(s, 0, s * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(-s, 0, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
    break;
```

### Sistema de Selección de Arma Inicial

**Necesitas crear una pantalla de selección que aparezca entre el menú y el juego** cuando el jugador tiene ambas armas desbloqueadas.

1. Añadir nuevo `gameState`: `'weaponSelect'`.
2. En el flujo de inicio de partida (cuando el jugador pulsa PLAY), si `progression.unlockedWeapons.fusion_beam === true`:
   - Cambiar a `gameState = 'weaponSelect'` en vez de ir directo a `'playing'`.
   - Mostrar pantalla con 2 opciones: Laser Cannon y Fusion Beam.
   - Al elegir, setear `activeWeapons = [selectedWeapon]` y luego `gameState = 'playing'`.
3. Si solo tiene una desbloqueada (al principio del juego), saltar directo.
4. Añadir `fusion_beam: false` en `createDefaultProgression().unlockedWeapons`.
5. Añadir `'fusion_beam': 0` en `WEAPON_PURCHASE_REQUIREMENTS` (gratis, se desbloquea tras completar 3 partidas o alcanzar score 5000).
6. En la shop, el Fusion Beam aparece con precio 0 cristales pero requiere el requisito anterior.

### Exclusión Mutua

En la función que genera opciones de upgrade al subir de nivel (buscar donde se filtran las armas disponibles para level-up), añadir:
- Si `activeWeapons` contiene `'fusion_beam'`, excluir `'laser_cannon'` del pool de opciones.
- Si `activeWeapons` contiene `'laser_cannon'`, excluir `'fusion_beam'` del pool de opciones.

Esto aplica tanto a las opciones de "activar arma nueva" como a las de "mejorar rama de arma".

### Cambios en el Auto-Fire

El Fusion Beam NO usa el sistema de auto-fire basado en `fireTimer` y `fireBullet()`. Es continuo. Solo hay que asegurarse de que si `hasFusionBeam` es true y `hasLaser` es false, el sistema de `fireTimer`/`fireBullet()` no se ejecute para el beam. El beam se actualiza en `updateFusionBeam()` dentro de `updateWeapons()`.

Sin embargo, el jugador puede tener OTRAS armas que sí usan el fireTimer (como missiles). El fireTimer/fireBullet debe seguir funcionando para el laser **solo si hasLaser es true**. Verifica que la condición de disparo en updatePlayer() sea:
```javascript
if (stats.hasLaser && player.fireTimer <= 0 && hasEnemyInAimCone()) {
    fireBullet();
    player.fireTimer = stats.fireRate;
}
```

## Tareas Ordenadas

1. Añadir `'fusion_beam'` a `WEAPONS` 
2. Añadir a `WEAPON_PURCHASE_REQUIREMENTS` 
3. Añadir a `createDefaultProgression().unlockedWeapons` 
4. Añadir bloque en `getWeaponStats()` y sus propiedades al return 
5. Añadir variables de estado `beamState` junto a `auraState` 
6. Resetear `beamState` en `resetGame()` (línea ~1478).
7. Crear función `updateFusionBeam()` y llamarla desde `updateWeapons()`
8. Crear función `renderFusionBeam()` y llamarla desde `render()` 
9. Añadir iconos en `drawSkillIcon()` (línea ~4011) y `drawWeaponIconAt()`
10. Implementar pantalla de selección de arma inicial (`gameState = 'weaponSelect'`).
11. Implementar exclusión mutua en el pool de upgrades de level-up.
12. Asegurar que `fireBullet()` solo se llame cuando `hasLaser` es true.
13. Testear: verificar DPS real (~26/s base), verificar ramp-up, verificar bifurcación, verificar pierce con ancho.
