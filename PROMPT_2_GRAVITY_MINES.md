# PROMPT: Implementar Minas Gravitacionales (Gravity Mines)

## Contexto


Necesito implementar las **MINAS GRAVITACIONALES**: minas flotantes que el jugador suelta automáticamente a su paso, que atraen enemigos cercanos con un campo gravitatorio y detonan al contacto o al expirar.

## Especificación de las MINAS GRAVITACIONALES

### Configuración en WEAPONS

```javascript
'gravity_mines': {
    name: 'GRAVITY MINES',
    color: '#FF6EC7',
    icon: 'mine',
    description: 'Deploy mines that attract and detonate enemies',
    shopPrice: 200,
    branches: {
        'minefield': {
            name: 'Minefield',
            icon: 'minefield',
            levels: [
                { description: 'Interval: 2.5s → 2.0s, Max: 3 → 4', effect: { mineInterval: 2.0, mineMaxCount: 4 } },
                { description: 'Interval: 1.5s, Max: 6', effect: { mineInterval: 1.5, mineMaxCount: 6 } },
                { description: 'Interval: 1.0s, Max: 9', effect: { mineInterval: 1.0, mineMaxCount: 9 } }
            ]
        },
        'gravity_well': {
            name: 'Gravity Well',
            icon: 'gravity',
            levels: [
                { description: 'Pull radius: 170px, force: 120 px/s', effect: { mineGravityRadius: 170, mineGravityForce: 120 } },
                { description: 'Pull: 230px, 160 px/s, 20% slow on exit', effect: { mineGravityRadius: 230, mineGravityForce: 160, mineExitSlow: 0.20 } },
                { description: 'Pull: 300px, 220 px/s, event horizon at 80px', effect: { mineGravityRadius: 300, mineGravityForce: 220, mineEventHorizon: 80 } }
            ]
        },
        'volatile_charge': {
            name: 'Volatile Charge',
            icon: 'explosion',
            levels: [
                { description: 'Damage: 38, radius: 110px', effect: { mineDamage: 38, mineExplosionRadius: 110 } },
                { description: 'Damage: 50, radius: 130px, radiation zone (8 dps, 3s)', effect: { mineDamage: 50, mineExplosionRadius: 130, mineRadiationDPS: 8, mineRadiationDuration: 3.0 } },
                { description: 'Damage: 65, 150px, radiation 14dps 4s, chain detonation', effect: { mineDamage: 65, mineExplosionRadius: 150, mineRadiationDPS: 14, mineRadiationDuration: 4.0, mineChainDetonate: 200 } }
            ]
        }
    },
    evolution: {
        name: 'BLACK HOLE',
        icon: 'blackhole',
        description: 'Every 12s, a mine becomes a black hole: 500px pull, instant kill at center',
        effect: { blackHole: true }
    }
}
```

### Stats Base

| Propiedad | Valor |
|-----------|-------|
| `mineInterval` | 2.5s (despliegue automático) |
| `mineMaxCount` | 3 (simultáneas) |
| `mineLifetime` | 8s |
| `mineArmingDelay` | 0.8s (no detona antes) |
| `mineGravityRadius` | 120px |
| `mineGravityForce` | 80 px/sec |
| `mineExplosionRadius` | 90px |
| `mineDamage` | 25 |
| `mineSize` | 16px (visual) |
| `mineExitSlow` | 0 |
| `mineEventHorizon` | 0 (desactivado) |
| `mineRadiationDPS` | 0 |
| `mineRadiationDuration` | 0 |
| `mineChainDetonate` | 0 (desactivado) |

### getWeaponStats() — Bloque a añadir

```javascript
// === GRAVITY MINES ===
let hasMines = activeWeapons.includes('gravity_mines');
let mineInterval = 2.5;
let mineMaxCount = 3;
let mineLifetime = 8;
let mineArmingDelay = 0.8;
let mineGravityRadius = 120;
let mineGravityForce = 80;
let mineExplosionRadius = 90;
let mineDamage = 25;
let mineExitSlow = 0;
let mineEventHorizon = 0;
let mineRadiationDPS = 0;
let mineRadiationDuration = 0;
let mineChainDetonate = 0;

if (hasMines) {
    const mfLvl = upgradeLevels['minefield'] || 0;
    if (mfLvl >= 1) { mineInterval = 2.0; mineMaxCount = 4; }
    if (mfLvl >= 2) { mineInterval = 1.5; mineMaxCount = 6; }
    if (mfLvl >= 3) { mineInterval = 1.0; mineMaxCount = 9; }

    const gwLvl = upgradeLevels['gravity_well'] || 0;
    if (gwLvl >= 1) { mineGravityRadius = 170; mineGravityForce = 120; }
    if (gwLvl >= 2) { mineGravityRadius = 230; mineGravityForce = 160; mineExitSlow = 0.20; }
    if (gwLvl >= 3) { mineGravityRadius = 300; mineGravityForce = 220; mineEventHorizon = 80; }

    const vcLvl = upgradeLevels['volatile_charge'] || 0;
    if (vcLvl >= 1) { mineDamage = 38; mineExplosionRadius = 110; }
    if (vcLvl >= 2) { mineDamage = 50; mineExplosionRadius = 130; mineRadiationDPS = 8; mineRadiationDuration = 3.0; }
    if (vcLvl >= 3) { mineDamage = 65; mineExplosionRadius = 150; mineRadiationDPS = 14; mineRadiationDuration = 4.0; mineChainDetonate = 200; }
}
```

Añadir al return:
```javascript
// Gravity Mines
hasMines, mineInterval, mineMaxCount, mineLifetime, mineArmingDelay,
mineGravityRadius, mineGravityForce, mineExplosionRadius,
mineDamage: Math.round(mineDamage * finalDamageMulti),
mineExitSlow, mineEventHorizon,
mineRadiationDPS: Math.round(mineRadiationDPS * finalDamageMulti),
mineRadiationDuration, mineChainDetonate,
hasBlackHole: activeEvolutions.includes('gravity_mines'),
```

### Object Pool — Minas

Añadir al objeto `pools`:
```javascript
mine: new ObjectPool(
    () => ({
        x: 0, y: 0, life: 0, maxLife: 8, armed: false, armTimer: 0,
        pulsePhase: 0, detonating: false, isBlackHole: false, blackHoleTimer: 0
    }),
    (obj) => {
        obj.x = 0; obj.y = 0; obj.life = 0; obj.armed = false; obj.armTimer = 0;
        obj.pulsePhase = 0; obj.detonating = false; obj.isBlackHole = false; obj.blackHoleTimer = 0;
    },
    20
),
```

### Arrays globales (junto a `drones`, `orbitals`, etc.)

```javascript
let mines = [];
let radiationFields = [];  // { x, y, radius, dps, duration, timer, tickTimer }
```

Resetear en `resetGame()`:
```javascript
pools.mine.releaseAll(mines);
mines = [];
radiationFields = [];
```

Añadir release en `resetGame()` junto a los demás `pools.X.releaseAll()`.

### Estado del despliegue (junto a `auraState`)

```javascript
let mineDeployTimer = 0;
```

Resetear en `resetGame()`: `mineDeployTimer = 0;`

### Lógica de Update — función `updateGravityMines()`

Llamar desde `updateWeapons()`:
```javascript
if (activeWeapons.includes('gravity_mines')) {
    updateGravityMines();
}
```

Lógica de `updateGravityMines()`:

```
1. Obtener stats con getWeaponStats().
2. Si !stats.hasMines || !player → return.

3. DESPLIEGUE AUTOMÁTICO:
   - mineDeployTimer += deltaTime
   - Si mineDeployTimer >= stats.mineInterval:
     - mineDeployTimer = 0
     - Si mines.length >= stats.mineMaxCount: liberar la mina más antigua (pools.mine.release, splice)
     - Crear nueva mina: pools.mine.acquire()
       - mine.x = player.x, mine.y = player.y
       - mine.life = stats.mineLifetime
       - mine.maxLife = stats.mineLifetime
       - mine.armed = false
       - mine.armTimer = stats.mineArmingDelay
       - mine.pulsePhase = 0
     - Push a mines[]

4. PARA CADA MINA (iterar reverse para poder eliminar):
   a. Decrementar mine.life -= deltaTime
   b. Incrementar mine.pulsePhase += deltaTime * 4 (para animación)
   c. Si mine.armTimer > 0: decrementar, cuando llega a 0 → mine.armed = true
   d. CAMPO GRAVITATORIO (siempre activo, incluso sin armar):
      - Buscar enemigos con spatialGrid.queryRadius(mine.x, mine.y, stats.mineGravityRadius)
      - Para cada enemigo:
        - Calcular dirección hacia el centro de la mina
        - Calcular distancia
        - Aplicar fuerza: enemy.vx += (dx/dist) * stats.mineGravityForce * deltaTime
        - Si stats.mineEventHorizon > 0 y dist < stats.mineEventHorizon:
          - Aplicar fuerza mucho mayor: 500 * deltaTime (irresistible)
        - Si stats.mineExitSlow > 0: no aplicar aquí, aplicar en detonación
   e. DETONACIÓN:
      - Si mine.armed y hay enemigo dentro de mineExplosionRadius * 0.5 (contacto cercano):
        → DETONAR
      - Si mine.life <= 0:
        → DETONAR (por timeout)
   f. Si no detonó y mine.life <= 0: liberar mina sin explosión (no debería pasar, el timeout detona)

5. FUNCIÓN DETONAR MINA detonateMine(mine, index, stats):
   - Buscar enemigos en stats.mineExplosionRadius con spatialGrid.queryRadius
   - Para cada enemigo en radio:
     - Aplicar stats.mineDamage (daño completo en todo el radio, no falloff)
     - spawnFloatingText con color '#FF6EC7'
     - Si enemy.hp <= 0: killEnemy()
   - spawnRing(mine.x, mine.y, '#FF6EC7', stats.mineExplosionRadius)
   - Generar partículas de explosión (8-12 partículas radiales)
   - Si stats.mineRadiationDPS > 0:
     - Crear radiationField: { x: mine.x, y: mine.y, radius: stats.mineExplosionRadius * 0.7, dps: stats.mineRadiationDPS, duration: stats.mineRadiationDuration, timer: stats.mineRadiationDuration, tickTimer: 0 }
     - Push a radiationFields[]
   - Si stats.mineChainDetonate > 0:
     - Buscar otras minas dentro de stats.mineChainDetonate distancia
     - Marcarlas para detonar con un pequeño delay (0.15s)
     - Implementar con: mine.detonating = true, mine.detonateDelay = 0.15
   - Liberar mina: pools.mine.release(mine), splice del array

6. ACTUALIZAR RADIATION FIELDS:
   - Para cada field (iterar reverse):
     - field.timer -= deltaTime
     - field.tickTimer += deltaTime
     - Si field.tickTimer >= 0.5 (tick cada 0.5s):
       - field.tickTimer = 0
       - Buscar enemigos en field.radius con spatialGrid
       - Aplicar field.dps * 0.5 daño a cada uno
       - Si mineExitSlow > 0: enemy.vx *= (1 - mineExitSlow), enemy.vy *= (1 - mineExitSlow)
     - Si field.timer <= 0: eliminar
```

### Rendering — función `renderMines()`

Llamar desde `render()` ANTES de `renderEnemies()` (para que las minas estén debajo de los enemigos):

```
Para cada mina en mines[]:
  1. CAMPO GRAVITATORIO (si mina activa):
     - Dibujar círculo con gradiente radial: centro transparente, borde '#FF6EC7' con alpha 0.08
     - Radio = stats.mineGravityRadius
     - Línea punteada circular en el borde con alpha 0.15
     - Si mineEventHorizon > 0: círculo adicional interior con alpha 0.2

  2. CUERPO DE LA MINA:
     - Círculo principal: radio 16px, color '#FF6EC7'
     - Pulso: radio oscila entre 14-18px usando sin(mine.pulsePhase)
     - Si no armed: color más tenue (alpha 0.4), sin pulso
     - Si armed: glow exterior con shadow blur
     - Punto central brillante (blanco, 4px)

  3. INDICADOR DE ARMING:
     - Si mine.armTimer > 0: dibujar arco de progreso alrededor de la mina
     - Arc desde 0 hasta (1 - armTimer/armingDelay) * 2PI

Para cada radiationField:
  - Círculo con gradiente: centro '#FF6EC7' alpha 0.12, borde transparente
  - Radio pulsa ligeramente con sin(gameTime * 3)
  - Partículas pequeñas flotando dentro del campo (opcional, según rendimiento)
```

### Iconos

En `drawSkillIcon()`:
```javascript
} else if (icon === 'mine') {
    // Círculo con púas (mina)
    ctx.beginPath();
    ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 5, cy + Math.sin(a) * 5);
        ctx.lineTo(cx + Math.cos(a) * 9, cy + Math.sin(a) * 9);
        ctx.stroke();
    }
} else if (icon === 'minefield') {
    // Tres minas pequeñas
    for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.arc(cx + i * 7, cy + (i === 0 ? -3 : 3), 3, 0, Math.PI * 2);
        ctx.fill();
    }
} else if (icon === 'gravity') {
    // Espiral gravitatoria
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 5, cy - 5);
    ctx.lineTo(cx + 7, cy - 2);
    ctx.stroke();
}
```

En `drawWeaponIconAt()`:
```javascript
case 'mine':
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(Math.cos(a) * s * 0.4, Math.sin(a) * s * 0.4);
        ctx.lineTo(Math.cos(a) * s * 0.8, Math.sin(a) * s * 0.8);
        ctx.stroke();
    }
    break;
```

### Progresión

- Añadir `gravity_mines: false` en `createDefaultProgression().unlockedWeapons`.
- Añadir `'gravity_mines': 2` en `WEAPON_PURCHASE_REQUIREMENTS` (requiere haber comprado 2 armas antes).
- shopPrice: 200 cristales.

### Integración con killEnemy()

No se necesita integración especial con killEnemy(). Las minas son independientes del sistema de kills (a diferencia de los drones que spawnan on kill).

## Tareas Ordenadas

1. Añadir `'gravity_mines'` a `WEAPONS` (~línea 704, antes del cierre del objeto).
2. Añadir a `WEAPON_PURCHASE_REQUIREMENTS` (línea ~783).
3. Añadir a `createDefaultProgression().unlockedWeapons` (línea ~829).
4. Crear pool `mine` en `pools` (línea ~1163).
5. Añadir arrays `mines`, `radiationFields` y variable `mineDeployTimer` junto a las otras variables globales.
6. Añadir bloque en `getWeaponStats()` y propiedades al return (~línea 2244).
7. Resetear mines, radiationFields y mineDeployTimer en `resetGame()` (línea ~1460).
8. Crear función `updateGravityMines()` con toda la lógica de despliegue, gravedad, detonación y radiación.
9. Llamar `updateGravityMines()` desde `updateWeapons()` (línea ~4412).
10. Crear función `renderMines()` con renderizado de campos, minas y radiación.
11. Llamar `renderMines()` desde `render()` (línea ~5130, antes de `renderEnemies()`).
12. Añadir iconos en `drawSkillIcon()` (línea ~4011) y `drawWeaponIconAt()` (línea ~5993).
13. Testear: verificar que las minas se despliegan, que la gravedad atrae, que detonan al contacto, que la detonación en cadena funciona, que los campos de radiación se limpian correctamente.
