# PROMPT: Implementar Torreta Centinela (Sentry Turret)

## Contexto



Necesito implementar la **TORRETA CENTINELA**: una torreta fija que el jugador despliega automáticamente cada X segundos. La torreta dispara al enemigo más cercano dentro de su radio durante un tiempo limitado y luego desaparece.


## Especificación de la TORRETA CENTINELA

### Configuración en WEAPONS

```javascript
'sentry_turret': {
    name: 'SENTRY TURRET',
    color: '#FF8C00',
    icon: 'turret',
    description: 'Deploys auto-firing sentry turrets',
    shopPrice: 250,
    branches: {
        'mass_production': {
            name: 'Mass Production',
            icon: 'production',
            levels: [
                { description: 'Max: 2 turrets, deploy: 7s', effect: { turretMaxCount: 2, turretCooldown: 7 } },
                { description: 'Max: 3, deploy: 5.5s', effect: { turretMaxCount: 3, turretCooldown: 5.5 } },
                { description: 'Max: 5, deploy: 4s, life: 12s', effect: { turretMaxCount: 5, turretCooldown: 4, turretLifetime: 12 } }
            ]
        },
        'fortress': {
            name: 'Fortress',
            icon: 'regen',
            levels: [
                { description: 'Range: 400px, life: 14s', effect: { turretRange: 400, turretLifetime: 14 } },
                { description: 'Range: 500px, turret shield: 30 HP', effect: { turretRange: 500, turretShieldHP: 30 } },
                { description: 'Range: 600px, shield: 60 HP (5/s regen), 15% slow', effect: { turretRange: 600, turretShieldHP: 60, turretShieldRegen: 5, turretSlow: 0.15 } }
            ]
        },
        'heavy_armament': {
            name: 'Heavy Armament',
            icon: 'damage',
            levels: [
                { description: 'Damage: 13, fire rate: 0.4s', effect: { turretDamage: 13, turretFireRate: 0.4 } },
                { description: 'Damage: 18, rate: 0.35s, pierce 1', effect: { turretDamage: 18, turretFireRate: 0.35, turretPierce: 1 } },
                { description: 'Damage: 24, rate: 0.3s, every 5th shot: mini-rocket', effect: { turretDamage: 24, turretFireRate: 0.3, turretRocketEvery: 5, turretRocketDamage: 15, turretRocketRadius: 60 } }
            ]
        }
    },
    evolution: {
        name: 'COMBAT STATION',
        icon: 'station',
        description: 'Turrets link with laser beams that damage enemies. +30% fire rate per nearby turret.',
        effect: { combatStation: true }
    }
}
```

### Stats Base

| Propiedad | Valor |
|-----------|-------|
| `turretCooldown` | 8s (despliegue automático) |
| `turretMaxCount` | 1 |
| `turretLifetime` | 10s |
| `turretFireRate` | 0.5s |
| `turretDamage` | 8 |
| `turretRange` | 300px |
| `turretBulletSpeed` | 1500 px/sec |
| `turretSize` | 24px (visual) |
| `turretPierce` | 0 |
| `turretShieldHP` | 0 (sin escudo base) |
| `turretShieldRegen` | 0 |
| `turretSlow` | 0 |
| `turretRocketEvery` | 0 (desactivado) |
| `turretRocketDamage` | 0 |
| `turretRocketRadius` | 0 |

### getWeaponStats() — Bloque a añadir

```javascript
// === SENTRY TURRET ===
let hasTurrets = activeWeapons.includes('sentry_turret');
let turretCooldown = 8;
let turretMaxCount = 1;
let turretLifetime = 10;
let turretFireRate = 0.5;
let turretDamage = 8;
let turretRange = 300;
let turretBulletSpeed = 1500;
let turretPierce = 0;
let turretShieldHP = 0;
let turretShieldRegen = 0;
let turretSlow = 0;
let turretRocketEvery = 0;
let turretRocketDamage = 0;
let turretRocketRadius = 0;

if (hasTurrets) {
    const mpLvl = upgradeLevels['mass_production'] || 0;
    if (mpLvl >= 1) { turretMaxCount = 2; turretCooldown = 7; }
    if (mpLvl >= 2) { turretMaxCount = 3; turretCooldown = 5.5; }
    if (mpLvl >= 3) { turretMaxCount = 5; turretCooldown = 4; turretLifetime = 12; }

    const ftLvl = upgradeLevels['fortress'] || 0;
    if (ftLvl >= 1) { turretRange = 400; turretLifetime = Math.max(turretLifetime, 14); }
    if (ftLvl >= 2) { turretRange = 500; turretShieldHP = 30; }
    if (ftLvl >= 3) { turretRange = 600; turretShieldHP = 60; turretShieldRegen = 5; turretSlow = 0.15; }

    const haLvl = upgradeLevels['heavy_armament'] || 0;
    if (haLvl >= 1) { turretDamage = 13; turretFireRate = 0.4; }
    if (haLvl >= 2) { turretDamage = 18; turretFireRate = 0.35; turretPierce = 1; }
    if (haLvl >= 3) { turretDamage = 24; turretFireRate = 0.3; turretRocketEvery = 5; turretRocketDamage = 15; turretRocketRadius = 60; }
}
```

Añadir al return:
```javascript
// Sentry Turret
hasTurrets, turretCooldown, turretMaxCount, turretLifetime,
turretFireRate, turretDamage: Math.round(turretDamage * finalDamageMulti),
turretRange, turretBulletSpeed, turretPierce,
turretShieldHP, turretShieldRegen, turretSlow,
turretRocketEvery, turretRocketDamage: Math.round(turretRocketDamage * finalDamageMulti),
turretRocketRadius,
hasCombatStation: activeEvolutions.includes('sentry_turret'),
```

### Object Pool — Torretas

Añadir al objeto `pools`:
```javascript
turret: new ObjectPool(
    () => ({
        x: 0, y: 0, life: 0, maxLife: 10, fireTimer: 0, angle: 0,
        shotCount: 0, shieldCurrent: 0, targetEnemy: null
    }),
    (obj) => {
        obj.x = 0; obj.y = 0; obj.life = 0; obj.fireTimer = 0; obj.angle = 0;
        obj.shotCount = 0; obj.shieldCurrent = 0; obj.targetEnemy = null;
    },
    10
),
```

### Arrays y variables globales

```javascript
let turrets = [];
let turretDeployTimer = 0;
```

Resetear en `resetGame()`:
```javascript
pools.turret.releaseAll(turrets);
turrets = [];
turretDeployTimer = 0;
```

### Lógica de Update — función `updateSentryTurrets()`

Llamar desde `updateWeapons()`:
```javascript
if (activeWeapons.includes('sentry_turret')) {
    updateSentryTurrets();
}
```

Lógica de `updateSentryTurrets()`:

```
1. Obtener stats con getWeaponStats().
2. Si !stats.hasTurrets || !player → return.

3. DESPLIEGUE AUTOMÁTICO:
   - turretDeployTimer += deltaTime
   - Si turretDeployTimer >= stats.turretCooldown:
     - turretDeployTimer = 0
     - Si turrets.length >= stats.turretMaxCount: liberar la más antigua (pools.turret.release, splice)
     - Crear nueva torreta: pools.turret.acquire()
       - turret.x = player.x
       - turret.y = player.y
       - turret.life = stats.turretLifetime
       - turret.maxLife = stats.turretLifetime
       - turret.fireTimer = 0
       - turret.angle = player.angle
       - turret.shotCount = 0
       - turret.shieldCurrent = stats.turretShieldHP
     - Push a turrets[]
     - spawnRing(player.x, player.y, '#FF8C00', 30) (feedback visual de despliegue)

4. PARA CADA TORRETA (iterar reverse):
   a. Decrementar turret.life -= deltaTime
   b. Si turret.life <= 0: liberar (pools.turret.release, splice), continuar

   c. REGENERACIÓN DE ESCUDO:
      - Si stats.turretShieldHP > 0 y turret.shieldCurrent < stats.turretShieldHP:
        - turret.shieldCurrent = Math.min(turret.shieldCurrent + stats.turretShieldRegen * deltaTime, stats.turretShieldHP)

   d. BUSCAR TARGET:
      - Usar spatialGrid.queryRadius(turret.x, turret.y, stats.turretRange)
      - Encontrar el enemigo más cercano
      - Si hay target: rotar turret.angle hacia el enemigo (turnRate: 360°/sec)

   e. DISPARAR:
      - turret.fireTimer -= deltaTime
      - Si turret.fireTimer <= 0 y hay target en rango:
        - turret.fireTimer = stats.turretFireRate

        // Calcular fire rate bonus de evolución Combat Station
        - Si stats.hasCombatStation:
          - Contar torretas cercanas (< 500px)
          - Bonus = nearbyTurrets * 0.30
          - turret.fireTimer = stats.turretFireRate / (1 + bonus)

        - turret.shotCount++

        // Decidir si dispara mini-cohete
        - Si stats.turretRocketEvery > 0 y turret.shotCount % stats.turretRocketEvery === 0:
          → Disparar mini-cohete (ver abajo)
        - Si no:
          → Disparar bala normal (ver abajo)

   f. SLOW AURA (Fortress nivel 3):
      - Si stats.turretSlow > 0:
        - Buscar enemigos en stats.turretRange con spatialGrid
        - Para cada enemigo: aplicar slow multiplicativo a velocity
          enemy.vx *= (1 - stats.turretSlow * deltaTime)
          enemy.vy *= (1 - stats.turretSlow * deltaTime)
        - Nota: esto es slow por frame, usar deltaTime para que sea independiente del framerate

5. DISPARAR BALA NORMAL desde torreta:
   - Calcular ángulo desde torreta al target
   - const bullet = pools.bullet.acquire()
   - bullet.x = turret.x
   - bullet.y = turret.y
   - bullet.vx = Math.cos(angleRad) * stats.turretBulletSpeed
   - bullet.vy = Math.sin(angleRad) * stats.turretBulletSpeed
   - bullet.life = stats.turretRange / stats.turretBulletSpeed + 0.1 (vida suficiente para alcanzar el rango)
   - bullet.damage = stats.turretDamage
   - bullet.type = 'turret'
   - bullet.color = '#FF8C00'
   - bullet.piercing = stats.turretPierce > 0
   - bullet.pierceCount = stats.turretPierce
   - bullet.hitEnemies = stats.turretPierce > 0 ? new Set() : null
   - bullets.push(bullet)

6. DISPARAR MINI-COHETE desde torreta:
   - Similar a bala pero con: type = 'turret_rocket'
   - Velocidad: 800 px/sec
   - No homing (va recto hacia el target)
   - Al impactar (manejar en checkCollisions o updateBullets):
     - Explotar: buscar enemigos en stats.turretRocketRadius
     - Aplicar stats.turretRocketDamage a cada uno
     - spawnRing con color naranja

7. EVOLUCIÓN — COMBAT STATION (rayos entre torretas):
   - Si stats.hasCombatStation y turrets.length >= 2:
     - Para cada par de torretas a < 500px entre sí:
       - Almacenar el par para renderizado
       - Buscar enemigos cuya hitbox intersecte la línea entre las dos torretas
       - Aplicar 12 * deltaTime daño a cada enemigo intersectando
       - spawnFloatingText ocasional (no cada frame, cada 0.5s)
```

### Colisión de Bullets de Torreta

Los bullets de torreta (`type: 'turret'`) deben funcionar dentro del sistema existente de `checkCollisions()`. Verifica que la función de colisión bullet-enemy no filtre por tipo. Si lo hace, añadir `'turret'` a los tipos permitidos.

Para los mini-cohetes (`type: 'turret_rocket'`): en `updateBullets()` o `checkCollisions()`, cuando un bullet con `type === 'turret_rocket'` colisiona con un enemigo:
- En vez de solo dañar ese enemigo, buscar todos los enemigos en `stats.turretRocketRadius` del punto de impacto.
- Aplicar `stats.turretRocketDamage` a cada uno.
- Eliminar el bullet.
- spawnRing.

### Rendering — función `renderTurrets()`

Llamar desde `render()` DESPUÉS de `renderPickups()` y ANTES de `renderEnemies()`:

```
Para cada torreta en turrets[]:
  1. RANGO (círculo de alcance):
     - Dibujar círculo: `ctx.strokeStyle = '#FF8C00'`, alpha 0.08, lineWidth 1
     - Radio = stats.turretRange

  2. CUERPO DE LA TORRETA:
     - Base hexagonal: 6 lados, radio 24px, relleno '#1a1a2e' con borde '#FF8C00'
     - Borde con alpha basado en vida restante (más tenue al expirar)
     - Cañón: rectángulo rotado hacia turret.angle, largo 20px, ancho 6px, color '#FF8C00'
     - Centro: círculo 6px, color '#FF8C00'
     - Flash de disparo: cuando fireTimer acaba de resetear, flash blanco breve en la punta del cañón

  3. ESCUDO (si turretShieldHP > 0):
     - Círculo alrededor de la torreta, radio 30px
     - Color '#FF8C00', alpha proporcional a shieldCurrent/shieldHP (máx 0.3)
     - LineWidth 2

  4. INDICADOR DE VIDA:
     - Pequeña barra debajo de la torreta (40px ancho, 3px alto)
     - Relleno proporcional a turret.life / turret.maxLife
     - Color: verde > amarillo > rojo según porcentaje

  5. EVOLUCIÓN — RAYOS CONECTORES:
     - Si hasCombatStation: dibujar líneas '#FF8C00' con alpha 0.3 entre torretas cercanas
     - Líneas pulsantes (alpha oscila con sin(gameTime * 4))
     - Partículas pequeñas moviéndose a lo largo de la línea (opcional)

Para los bullets de torreta en la función renderBullets() existente:
  - Añadir case para type === 'turret':
    - Círculo pequeño 4px, color '#FF8C00'
  - Añadir case para type === 'turret_rocket':
    - Triángulo pequeño orientado en dirección del movimiento, color '#FF8C00'
    - Trail corto (2-3 partículas)
```

### Iconos

En `drawSkillIcon()`:
```javascript
} else if (icon === 'turret') {
    // Base con cañón
    ctx.fillRect(cx - 6, cy + 2, 12, 6);
    ctx.fillRect(cx - 2, cy - 6, 4, 8);
    ctx.beginPath();
    ctx.arc(cx, cy - 6, 3, 0, Math.PI * 2);
    ctx.fill();
} else if (icon === 'production') {
    // Múltiples torretas pequeñas (producción en serie)
    for (let i = -1; i <= 1; i++) {
        ctx.fillRect(cx + i * 7 - 2, cy + 1, 4, 4);
        ctx.fillRect(cx + i * 7 - 1, cy - 3, 2, 4);
    }
} else if (icon === 'station') {
    // Dos torretas conectadas
    ctx.fillRect(cx - 8, cy + 1, 5, 4);
    ctx.fillRect(cx + 3, cy + 1, 5, 4);
    ctx.beginPath();
    ctx.moveTo(cx - 3, cy + 3);
    ctx.lineTo(cx + 3, cy + 3);
    ctx.stroke();
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy - 4);
    ctx.lineTo(cx - 6, cy + 1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 6, cy - 4);
    ctx.lineTo(cx + 6, cy + 1);
    ctx.stroke();
}
```

En `drawWeaponIconAt()`:
```javascript
case 'turret':
    // Base rectangular con cañón circular
    ctx.fillRect(-s * 0.5, s * 0.1, s, s * 0.5);
    ctx.fillRect(-s * 0.15, -s * 0.6, s * 0.3, s * 0.7);
    ctx.beginPath();
    ctx.arc(0, -s * 0.6, s * 0.25, 0, Math.PI * 2);
    ctx.fill();
    break;
```

### Progresión

- Añadir `sentry_turret: false` en `createDefaultProgression().unlockedWeapons`.
- Añadir `'sentry_turret': 3` en `WEAPON_PURCHASE_REQUIREMENTS` (requiere haber comprado 3 armas antes).
- shopPrice: 250 cristales.

### Daño de Enemigos a la Torreta (Escudo)

Cuando una torreta tiene escudo (stats.turretShieldHP > 0), los enemigos que COLISIONAN con la torreta dañan su escudo en vez de pasar de largo:

En `updateSentryTurrets()`, para cada torreta:
```
- Si turret.shieldCurrent > 0:
  - Buscar enemigos dentro de 30px (radio de colisión de la torreta)
  - Para cada enemigo tocando:
    - turret.shieldCurrent -= 25 * deltaTime (daño por contacto)
    - Knockback ligero al enemigo (empujar hacia fuera)
  - Si turret.shieldCurrent <= 0:
    - turret.shieldCurrent = 0
    - turret.life = 0 (destruir torreta)
    - Efecto visual de destrucción (partículas, ring)
```

**NOTA IMPORTANTE:** Si la torreta NO tiene escudo (base), los enemigos simplemente la ignoran (pasan a través). Solo con la mejora Fortress se activa la colisión con enemigos.

