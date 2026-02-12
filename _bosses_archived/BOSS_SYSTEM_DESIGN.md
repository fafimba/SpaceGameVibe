# STELLAR SWARM - SISTEMA DE JEFES (BOSS SYSTEM)
## Documento de Diseño Completo

**Juego:** Stellar Swarm (Vampire Survivors + Space Shooter)
**Fecha:** 2026-02-07
**Autor:** Game Design
**Versión:** 1.0

---

## ÍNDICE
1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Sistema de Aparición de Jefes](#1-sistema-de-aparición-de-jefes)
3. [Sistema de Arena (Ring)](#2-sistema-de-arena-ring)
4. [Mecánicas Base de Jefes](#3-mecánicas-base-de-jefes)
5. [Habilidades Únicas por Jefe](#4-habilidades-únicas-por-jefe)
6. [Sistema de Meta-Progresión](#5-sistema-de-meta-progresión)
7. [Sistema de Recompensas](#6-sistema-de-recompensas)
8. [HUD de Barra de Salud](#7-hud-de-barra-de-salud)
9. [Pantalla de Victoria](#8-pantalla-de-victoria-celebración)
10. [Escalado de Dificultad](#9-escalado-de-dificultad)
11. [Casos Especiales](#10-casos-especiales)
12. [Tabla de Referencia Rápida](#tabla-de-referencia-rápida)

---

## RESUMEN EJECUTIVO

El Sistema de Jefes de Stellar Swarm proporciona progresión vertical a través del desbloqueo de armas permanentes. Cada uno de los 5 jefes (uno por arma no-Laser) aparece en intervalos de niveles específicos, crea una arena circular aislada, y ofrece patrones de ataque únicos temáticos con la mecánica del arma que desbloquea.

**Objetivos de Diseño:**
- Progresión de meta significativa (desbloqueo de armas permanente)
- Desafíos emocionantes y memorables cada ~3-4 niveles
- Dificultad escalada para mantener tensión durante toda la progresión
- Celebración clara del desbloqueo de armas para satisfacción del jugador
- Balance: primeros jefes con solo Laser Cannon, últimos jefes multiarma

---

## 1. SISTEMA DE APARICIÓN DE JEFES

### 1.1 Cronograma de Aparición

Basado en la curva XP (`25 * 1.4^(level-1)`), los jefes deben aparecer cuando el jugador ya está familiarizado con el combate pero aún es alcanzable:

| Jefe | Nivel de Aparición | Arma Desbloqueada | Justificación |
|------|-------------------|------------------|--|
| **ORBITAL GUARDIAN** | Nivel 8 | Orbital Shield | Early game, ~4 minutos. Asequible con solo Laser. |
| **MISSILE TITAN** | Nivel 14 | Missile Launcher | Mid-early, ~8 minutos. Jugador tiene shield + laser. |
| **LIGHTNING NEXUS** | Nivel 20 | Lightning Ray | Mid game, ~13 minutos. Jugador con varias armas. |
| **PLASMA OVERLORD** | Nivel 27 | Plasma Field | Mid-late, ~22 minutos. Jugador experimentado. |
| **SWARM MOTHER** | Nivel 35 | Alien Drone | Late game, ~45 minutos. Batalla épica final. |

### 1.2 Cálculo de Niveles

**XP requerido por nivel:** `25 * 1.4^(level-1)`

| Nivel | XP Acumulado | Tiempo Estimado (con spawns ~2.5s) | Enemigos |
|-------|--------------|--------------------------------|---------|
| 1 | 0 | 0s | 0 |
| 8 | 635 | ~4m | ~635 |
| 14 | 3,205 | ~8m | ~3,205 |
| 20 | 10,180 | ~13m | ~10,180 |
| 27 | 47,070 | ~22m | ~47,070 |
| 35 | 186,430 | ~45m | ~186,430 |

**Notas:**
- Los tiempos asumen ganancia de 1 XP por enemigo eliminado
- Los primeros jefes deben ser relativamente fáciles (jugador solo usa Laser)
- Los últimos jefes esperan que el jugador tenga múltiples armas desbloqueadas
- Gap de ~6 niveles entre jefes permite que el jugador mejore significativamente

### 1.3 Ajuste Dinámico

Si el jugador ya tiene un arma desbloqueada, los jefes posteriores pueden:
- **Sin cambios primaria:** El nivel de aparición es fijo
- **Opcionalidad:** Permitir al jugador "desafiar" bosses anteriores para obtener recompensas de XP
- **Progresión alternativa:** Los jefes sucesivos tienen HP aumentado si se enfrentan con más armas desbloqueadas

---

## 2. SISTEMA DE ARENA (RING)

### 2.1 Dimensiones y Posicionamiento

**Canvas:** 1920x1080
**Mundo:** 11520x6480

**Arena Ring:**
- **Radio Exterior:** 600px
- **Radio Interior:** 550px (grosor del anillo visual: 50px)
- **Centro del Anillo:** Centro del viewport actual del jugador (sigue dinámicamente si el jugador se mueve hacia los bordes)

```javascript
const ARENA_OUTER_RADIUS = 600;
const ARENA_INNER_RADIUS = 550;
const ARENA_THICKNESS = 50; // para visualización
const ARENA_CENTER = {
  x: player.x, // Dinámico: sigue la posición actual del jugador
  y: player.y
};
```

### 2.2 Diseño Visual del Anillo

**Componentes Visuales:**

1. **Borde Exterior (anillo gráfico):**
   - Gradiente: Azul brillante (#00CCFF) → Cian oscuro (#0066FF)
   - Grosor: 50px
   - Efecto de brillo: `box-shadow: 0 0 20px rgba(0, 204, 255, 0.8)`
   - Patrón: Pequeñas líneas radiales cada 15° para sugerir energía

2. **Efecto de Energía Pulsante:**
   - Pulsa cada 2 segundos, opacidad de 1.0 a 0.7
   - Líneas de energía verdes (#00FF00) atraviesan el anillo
   - Rotación lenta: 360° cada 20 segundos

3. **Punto de Advertencia (si jugador toca el borde):**
   - Destello rojo donde el jugador toca el límite
   - Efecto de vibración en pantalla (jitter)

### 2.3 Confinamiento del Jugador

**Sistema de Confinamiento (NO Daño, pero RESTRICCIÓN):**

```javascript
// Confinamiento físico - el jugador NO puede cruzar
function enforceArenaBoundary() {
  const distanceFromCenter = Math.hypot(
    player.x - ARENA_CENTER.x,
    player.y - ARENA_CENTER.y
  );

  if (distanceFromCenter > ARENA_OUTER_RADIUS) {
    // Empuja al jugador de vuelta hacia adentro
    const angle = Math.atan2(
      player.y - ARENA_CENTER.y,
      player.x - ARENA_CENTER.x
    );
    player.x = ARENA_CENTER.x + Math.cos(angle) * ARENA_OUTER_RADIUS;
    player.y = ARENA_CENTER.y + Math.sin(angle) * ARENA_OUTER_RADIUS;

    // Knockback visual
    player.velocityX *= -0.3;
    player.velocityY *= -0.3;
  }
}
```

**Razón: Invisible Wall vs Damage Wall**
- Invisible wall es menos frustante
- Permite que el jugador "sienta" el límite sin punición
- Los jefes pueden usar el borde como barrera estratégica

### 2.4 Posición del Jefe

**Posición:** Centro exacto del arena (ARENA_CENTER.x, ARENA_CENTER.y)

**Movimiento Mínimo:** Los jefes son principalmente estacionarios
- Movimiento leve oscilatorio (±50px) para evitar parecer pegados
- Patrón: `boss.centerOffsetX = Math.sin(bossTimer * 0.03) * 50`
- Esta micro-fluctuación hace que parezca "respirar" o vibrar levemente

**Rotación:**
- Todos los jefes rotan constantemente (~60° por segundo)
- Proporciona sentido de energía y peligro
- Ayuda a avisar nuevos patrones de ataque

### 2.5 Limpieza de Enemigos al Iniciar Boss

```javascript
function initiateBossFight(bossType) {
  // Detener spawning de enemigos
  waveSystem.paused = true;

  // Eliminar todos los enemigos activos
  enemies.forEach(enemy => {
    // SIN otorgar XP
    enemy.kill(grantXP = false);
  });
  enemies = [];

  // Limpiar proyectiles de enemigos
  enemyProjectiles = [];

  // Crear arena
  arena.active = true;
  arena.centerX = player.x;
  arena.centerY = player.y;

  // Spawnear jefe
  boss = new Boss(bossType);
  boss.x = arena.centerX;
  boss.y = arena.centerY;
}
```

---

## 3. MECÁNICAS BASE DE JEFES

### 3.1 Fórmula de HP Base

El HP de los jefes debe escalar con:
1. **Progresión del jugador:** Nivel actual
2. **Armas desbloqueadas:** Más armas = jugador más fuerte = jefe más fuerte
3. **Número de jefe:** Jefes posteriores son más duros

**Fórmula:**

```javascript
const HP_FORMULA = (bossIndex, playerLevel, unlockedWeaponCount) => {
  const baseHP = [200, 300, 450, 600, 800]; // Índices 0-4

  const levelMultiplier = 1 + (playerLevel - bossLevel) * 0.15;
  // Ej: Si estás en nivel 20 y aparece boss de nivel 8:
  // 1 + (20-8)*0.15 = 1 + 1.8 = 2.8x (mucho más fuerte)

  const weaponMultiplier = 1 + (unlockedWeaponCount * 0.20);
  // Cada arma desbloqueada = 20% HP extra
  // Ej: 3 armas = 1 + 0.60 = 1.6x

  return Math.floor(
    baseHP[bossIndex] * levelMultiplier * weaponMultiplier
  );
};
```

**Tabla de HP Esperado:**

| Boss | Nivel Aparición | HP Base | HP @Lv8 (0 armas) | HP @Lv14 (1 arma) | HP @Lv20 (2 armas) |
|-----|---|---|---|---|---|
| Orbital Guardian | 8 | 200 | 200 | 240 | 288 |
| Missile Titan | 14 | 300 | 432 | 360 | 504 |
| Lightning Nexus | 20 | 450 | 900 | 1,080 | 1,296 |
| Plasma Overlord | 27 | 600 | 1,800 | 2,160 | 2,592 |
| Swarm Mother | 35 | 800 | 3,200 | 3,840 | 4,608 |

### 3.2 Proyectiles Base del Jefe

Todos los jefes tienen estadísticas base para sus proyectiles:

```javascript
BOSS_PROJECTILE_STATS = {
  speed: 400, // px/s
  damage: 1, // impactos al jugador
  hp: 3, // pueden ser destruidos por armas del jugador
  radius: 8, // para colisiones
  lifetime: 15, // segundos
  destroyedByWeapons: ['laser', 'missile', 'lightning', 'plasma', 'drone']
};
```

**Notas:**
- Los proyectiles de jefe pueden ser **destruidos** como enemigos normales
- Cada proyectile destruido da **sin XP** pero **sí destruye** la amenaza
- Los proyectiles hacen 1 daño al escudo del jugador (no HP directo salvo penetración)

### 3.3 Patrones de Proyectiles Compartidos (4 patrones base)

Todos los jefes tienen acceso a estos patrones como variaciones:

#### **Patrón 1: SPIRAL_OUTWARD (Espiral Expansiva)**

```javascript
PATTERN_SPIRAL_OUTWARD = {
  name: 'Spiral Outward',
  duration: 3, // segundos
  description: 'Los proyectiles salen en espiral desde el jefe',

  execute: (boss) => {
    const projectileCount = 16;
    const angleStep = (Math.PI * 2) / projectileCount;
    const expandSpeed = 200; // px/s

    boss.burstTimer += game.deltaTime;
    const progress = boss.burstTimer / 3; // 0 to 1

    for (let i = 0; i < projectileCount; i++) {
      const angle = (i * angleStep) + (boss.burstTimer * 3);
      const distance = expandSpeed * progress;

      const projectile = {
        x: boss.x + Math.cos(angle) * distance * 0.5,
        y: boss.y + Math.sin(angle) * distance * 0.5,
        vx: Math.cos(angle) * expandSpeed,
        vy: Math.sin(angle) * expandSpeed,
        rotation: angle
      };

      bossProjectiles.push(projectile);
    }

    if (progress >= 1) {
      boss.currentPattern = null;
      boss.burstTimer = 0;
    }
  }
};
```

**Visualización ASCII:**
```
      ↗ ↗ ↗
    ↗       ↗
   ↗    [BOSS]   ↗
    ↗       ↗
      ↗ ↗ ↗
```

#### **Patrón 2: CORNER_BARRAGE (Andanada de Esquinas)**

```javascript
PATTERN_CORNER_BARRAGE = {
  name: 'Corner Barrage',
  duration: 4,
  description: 'Ráfagas simultáneas desde 4/8 esquinas del jefe',

  execute: (boss) => {
    const corners = 8; // Se vuelve dinámico: 4 early game, 8 late game
    const cornerAngles = [];
    for (let i = 0; i < corners; i++) {
      cornerAngles.push((Math.PI * 2 / corners) * i + boss.rotation);
    }

    // Ráfagas cada 0.5 segundos
    const burstInterval = 0.5;
    const burstNumber = Math.floor(boss.burstTimer / burstInterval);
    const isNewBurst = boss.burstTimer % burstInterval < game.deltaTime;

    if (isNewBurst && burstNumber < 8) {
      cornerAngles.forEach(angle => {
        const projectile = {
          x: boss.x + Math.cos(angle) * 80,
          y: boss.y + Math.sin(angle) * 80,
          vx: Math.cos(angle) * 350,
          vy: Math.sin(angle) * 350,
          rotation: angle,
          color: '#FF6600' // Naranja
        };
        bossProjectiles.push(projectile);
      });
    }

    boss.burstTimer += game.deltaTime;
    if (boss.burstTimer >= 4) {
      boss.currentPattern = null;
      boss.burstTimer = 0;
    }
  }
};
```

**Visualización ASCII:**
```
   ↙   ↓   ↘
   ←  [B]  →
   ↖   ↑   ↗
```

#### **Patrón 3: RING_WAVE (Onda Anular)**

```javascript
PATTERN_RING_WAVE = {
  name: 'Ring Wave',
  duration: 3,
  description: 'Proyectiles se expanden en forma de anillo perfecto',

  execute: (boss) => {
    const projectileCount = 24;
    const angleStep = (Math.PI * 2) / projectileCount;
    const waveSpeed = 450;

    if (boss.burstTimer < 3) {
      // Una sola emisión del anillo
      if (boss.burstTimer < game.deltaTime) {
        for (let i = 0; i < projectileCount; i++) {
          const angle = i * angleStep;
          const projectile = {
            x: boss.x,
            y: boss.y,
            vx: Math.cos(angle) * waveSpeed,
            vy: Math.sin(angle) * waveSpeed,
            rotation: angle,
            color: '#00FF00'
          };
          bossProjectiles.push(projectile);
        }
      }
    }

    boss.burstTimer += game.deltaTime;
    if (boss.burstTimer >= 3) {
      boss.currentPattern = null;
      boss.burstTimer = 0;
    }
  }
};
```

**Visualización ASCII:**
```
        ↑ ↑ ↑
      ↖     ↗
    ←  [BOSS]  →
      ↙     ↘
        ↓ ↓ ↓
```

#### **Patrón 4: TELEGRAPH_LASER (Rayo Telegrafíado)**

```javascript
PATTERN_TELEGRAPH_LASER = {
  name: 'Telegraph Laser',
  duration: 3,
  description: 'Línea telegrafíada que se convierte en rayo dañino',

  execute: (boss) => {
    const phases = {
      telegraph: { duration: 1.5, opacity: 0.3 }, // Advertencia parpadeante
      fire: { duration: 0.3, opacity: 1.0 },      // Fuego real
      cooldown: { duration: 1.2, opacity: 0 }     // Espera
    };

    const totalDuration = 3;
    const cycleTime = boss.burstTimer % totalDuration;

    let currentPhase = 'telegraph';
    if (cycleTime > 1.5 && cycleTime < 1.8) {
      currentPhase = 'fire';
    } else if (cycleTime > 1.8) {
      currentPhase = 'cooldown';
    }

    // 4 rayos direccionales (arriba, abajo, izq, der)
    const directions = [
      { x: 0, y: -1, color: '#FF0000' },   // Arriba (rojo)
      { x: 0, y: 1, color: '#FF0000' },    // Abajo
      { x: -1, y: 0, color: '#FF0000' },   // Izquierda
      { x: 1, y: 0, color: '#FF0000' }     // Derecha
    ];

    directions.forEach(dir => {
      const telegraphLine = {
        x: boss.x,
        y: boss.y,
        dx: dir.x,
        dy: dir.y,
        length: 1000,
        thickness: 15,
        opacity: phases[currentPhase].opacity,
        color: dir.color,
        isDamaging: currentPhase === 'fire'
      };

      // Guardar para renderizar y colisión
      boss.telegraphLines.push(telegraphLine);

      // Si está en fase de fuego, crear hitbox
      if (telegraphLine.isDamaging) {
        // Los rayos infligen daño como si fueran proyectiles persistentes
        telegraphLine.damagePerFrame = 0.5;
      }
    });

    boss.burstTimer += game.deltaTime;
  }
};
```

**Visualización ASCII:**
```
        ◄───→ (telegraph rojo)
          │
          │
      ◄───●───►
          │
          │
        ◄───→
```

### 3.4 Transiciones de Fase

**Sistema de Fases:**

Todos los jefes tienen **2 fases** basadas en HP:

| Fase | Rango HP | Cambios |
|------|----------|---------|
| **Fase 1 (Normal)** | 100% - 50% | Patrones base, velocidad normal, color base |
| **Fase 2 (Enraged)** | 49% - 0% | Patrones más rápidos, más proyectiles, colores más intensos |

```javascript
function updateBossPhase() {
  const healthPercentage = boss.hp / boss.maxHp;

  if (healthPercentage > 0.5) {
    boss.currentPhase = 1;
    boss.patternCooldown = 2.5; // Segundos entre patrones
    boss.projectileSpeed = 350;
    boss.attackIntensity = 1.0;
  } else {
    boss.currentPhase = 2;
    // Fase 2: 40% más rápido, proyectiles más denssos
    boss.patternCooldown = 1.5;
    boss.projectileSpeed = 490;
    boss.attackIntensity = 1.4;

    // Parpadeante rojo
    if (Math.floor(game.time * 10) % 2 === 0) {
      boss.colorOverlay = 'rgba(255, 0, 0, 0.15)';
    }
  }
}
```

**Transición Visual:**

Cuando HP cae a 50%:
- Flash de pantalla blanca (0.2s)
- Boss gira 360° rápidamente (0.5s)
- Emite proyectiles en todas direcciones como "grito de rabia"
- Sonido de "power up" distorsionado

### 3.5 Movimiento del Jefe

**Patrón de Movimiento Base:**

```javascript
function updateBossMovement() {
  // Oscilación suave - no es persecución
  const oscillationSpeed = 0.03;
  const oscillationRange = 50;

  const offsetX = Math.sin(bossTimer * oscillationSpeed) * oscillationRange;
  const offsetY = Math.cos(bossTimer * oscillationSpeed * 0.7) * oscillationRange;

  boss.visualX = boss.centerX + offsetX;
  boss.visualY = boss.centerY + offsetY;

  // Rotación constante
  boss.rotation += 1.5; // degrees per frame (~60°/s)
}
```

**Rotación:** Todos los jefes rotan sobre su eje a ~60°/segundo para:
- Indicar estado de energía
- Proporcionar avisos de nuevos patrones de ataque
- Hacer que parezca menos estático

---

## 4. HABILIDADES ÚNICAS POR JEFE

Cada jefe tiene un tema visual y mecánicas únicas que reflejan el arma que desbloquea.

---

### JEFE 1: ORBITAL GUARDIAN
**Nivel de Aparición:** 8
**Arma Desbloqueada:** Orbital Shield
**HP Base:** 200
**Tema:** Defensa orbital, escudos giratorios, energía protectora

#### Apariencia Visual

```
          ▲
        ◆ ▪ ◆
       ◆  ●  ◆
        ◆ ▪ ◆
          ▼
```

- **Forma:** Hexágono regular (6 lados)
- **Tamaño:** 80px de ancho (circumradius)
- **Color Base:** Azul cian (#00CCFF) degradado a azul oscuro (#0066FF)
- **Centro:** Óvalo brillante blanco (#FFFFFF) pulsante
- **Detalles:** 6 esferas pequeñas (30px diameter) que orbitan alrededor a 2 revoluciones/segundo
  - Esfera 1: Verde (#00FF00)
  - Esfera 2: Cian (#00FFFF)
  - Esfera 3: Magenta (#FF00FF)
  - Esfera 4: Rojo (#FF0000)
  - Esfera 5: Amarillo (#FFFF00)
  - Esfera 6: Blanco (#FFFFFF)

#### Habilidad Única 1: ORBITAL SHIELD DANCE

**Mecánica:**
Las 6 esferas orbitan el jefe en dos anillos que giran en direcciones opuestas. El jugador puede destruir estas esferas para debilitar al jefe, pero se regeneran.

**Detalles:**
```javascript
ABILITY_ORBITAL_SHIELD_DANCE = {
  name: 'Orbital Shield Dance',

  orbits: {
    inner: {
      radius: 120,
      speed: 2.0, // revoluciones/segundo
      direction: 'clockwise', // CW
      sphereCount: 3,
      sphereHealth: 15,
      sphereColor: ['#00FF00', '#FF00FF', '#FFFF00']
    },
    outer: {
      radius: 180,
      speed: 1.3,
      direction: 'counterclockwise', // CCW
      sphereCount: 3,
      sphereHealth: 15,
      sphereColor: ['#00FFFF', '#FF0000', '#FFFFFF']
    }
  },

  mechanics: {
    shieldRegenTime: 8, // segundos después de destruida la última esfera
    damageReduction: {
      withAllShields: 0.3, // Jefe recibe 30% daño (70% reducción)
      withoutShields: 1.0  // Daño normal
    },
    sphereRespawnAnimation: 0.8 // segundos de animación
  }
};
```

**Implementación:**

```javascript
class OrbitalShield {
  constructor(boss) {
    this.boss = boss;
    this.spheres = [];
    this.lastSphereDestroyedTime = 0;

    // Generar esferas
    for (let orbit of ['inner', 'outer']) {
      const config = ABILITY_ORBITAL_SHIELD_DANCE.orbits[orbit];
      for (let i = 0; i < config.sphereCount; i++) {
        const sphere = {
          orbitType: orbit,
          index: i,
          health: config.sphereHealth,
          maxHealth: config.sphereHealth,
          color: config.sphereColor[i],
          radius: 15,
          isDestroyed: false,
          destroyedTime: 0
        };
        this.spheres.push(sphere);
      }
    }
  }

  update(deltaTime) {
    this.spheres.forEach(sphere => {
      if (sphere.isDestroyed) {
        sphere.destroyedTime += deltaTime;
        if (sphere.destroyedTime > 8) {
          // Regenerar
          sphere.isDestroyed = false;
          sphere.destroyedTime = 0;
          sphere.health = sphere.maxHealth;
          // Animación de aparición
          this.playRespawnEffect(sphere);
        }
      }
    });
  }

  render(ctx, bossX, bossY, bossRotation) {
    this.spheres.forEach(sphere => {
      if (sphere.isDestroyed) return;

      const config = ABILITY_ORBITAL_SHIELD_DANCE.orbits[sphere.orbitType];
      const angle = (sphere.index / config.sphereCount) * Math.PI * 2 +
                    (game.time * config.speed * Math.PI * 2) *
                    (config.direction === 'clockwise' ? 1 : -1);

      const sphereX = bossX + Math.cos(angle) * config.radius;
      const sphereY = bossY + Math.sin(angle) * config.radius;

      // Dibujar esfera
      ctx.fillStyle = sphere.color;
      ctx.beginPath();
      ctx.arc(sphereX, sphereY, sphere.radius, 0, Math.PI * 2);
      ctx.fill();

      // Brillo
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }
}
```

**Comportamiento del Jugador Esperado:**
- Debe destruir las esferas para hacer el jefe vulnerable
- Esto añade un elemento de "rompimiento de defensa"
- Las esferas no son inmediatamente regenerables (8s cooldown)

#### Habilidad Única 2: SHIELD PROJECTION BARRAGE

**Mecánica:**
El jefe dispara proyectiles en forma de proyecciones escudo (cuadrados rotados/diamantes) en patrones anulares múltiples. Estos proyectiles son más lentos pero resisten más impactos.

**Detalles:**

```javascript
ABILITY_SHIELD_PROJECTION_BARRAGE = {
  name: 'Shield Projection Barrage',

  projectileStats: {
    speed: 280, // Más lento que normal
    health: 5, // Puede recibir más daño
    radius: 12,
    color: '#00CCFF',
    shape: 'diamond', // Rotated square
    lifetime: 12
  },

  pattern: {
    waves: 3,
    waveDelay: 0.6, // segundos entre olas
    projectilesPerWave: 16,
    angleOffset: 22.5 // Cada ola desplazada 22.5°
  }
};
```

**Visualización:**
```
Onda 1:  ◇ ◇ ◇ ◇     (16 diamantes)
           ◇ ◇
Onda 2:    ◇ ◇       (16 diamantes, rotado)
           ◇ ◇
Onda 3:  ◇ ◇ ◇ ◇     (16 diamantes)
```

#### Progresión de Ataques

**Fase 1 (100%-50%):**
1. **0s:** Orbital Shield Dance (esferas orbitan pasivamente)
2. **4s:** Disparo Spiral Outward (16 proyectiles)
3. **8s:** Shield Projection Barrage (3 olas)
4. **13s:** Volver a Orbital Shield Dance
5. **Repetir**

**Fase 2 (49%-0%):**
1. **0s:** Orbital Shield Dance (esferas orbitan 1.5x más rápido)
2. **3s:** Corner Barrage (8 esquinas, doble ráfagas)
3. **6s:** Shield Projection Barrage (4 olas en lugar de 3)
4. **12s:** Volver a Orbital Shield Dance
5. **Repetir**

#### Consideraciones de Dificultad

**Fortalezas:**
- Escudos hacen que sea resistente al principio
- Proyectiles lentos = tiempo para esquivar
- Primer jefe: asequible con solo Laser

**Debilidades:**
- Las esferas orbitan predeciblemente (patrón circular)
- Proyectiles lentos son fáciles de esquivar
- Sin persecución del jefe (movimiento mínimo)

**Balance para Primeras Apariciones:**
- Los jugadores con SOLO Laser deben poder ganar en ~1.5-2 minutos
- Las esferas dan un objetivo secundario interesante
- Proyectiles destruibles enseñan mecánica de "destrucción de proyectiles"

---

### JEFE 2: MISSILE TITAN
**Nivel de Aparición:** 14
**Arma Desbloqueada:** Missile Launcher
**HP Base:** 300
**Tema:** Armas pesadas, misiles guiados, carga mecánica

#### Apariencia Visual

```
      ║╔════╗║
      ║║ ◆◆ ║║
      ║║ ▲▲ ║║
      ║║ ●● ║║
      ║╚════╝║
```

- **Forma:** Octágono irregular (8 lados, como una torreta)
- **Tamaño:** 100px de ancho
- **Color Base:** Gris metálico (#808080) con acentos rojos (#FF3333)
- **Centro:** Óvalo pulsante rojo brillante (#FF0000)
- **Detalles:**
  - 8 puntos de cañón alrededor del perímetro (similar a esquinas)
  - Líneas de "recarga" visibles que parpadean cuando prepara misiles
  - Vapor/humo visual que sale cuando dispara

#### Habilidad Única 1: HOMING MISSILE BARRAGE

**Mecánica:**
El jefe dispara 1-2 enormes misiles guiados que persiguen al jugador. Estos misiles son lentos pero:
- Hacen mucho daño (3 daño al impactar)
- Tienen mucha salud (25 HP cada uno, requieren esfuerzo para destruir)
- Explotan al ser destruidos, creando una onda de choque

**Detalles:**

```javascript
ABILITY_HOMING_MISSILE_BARRAGE = {
  name: 'Homing Missile Barrage',

  missileStats: {
    speed: 200, // Lento pero implacable
    acceleration: 50, // Persigue
    maxTurnRate: 45, // degrees/segundo de viraje
    health: 25,
    radius: 20,
    damage: 3,
    lifetime: 20,
    colors: ['#FF3333', '#FF6600'],

    explosionOnDestroy: {
      radius: 150,
      projectileCount: 12,
      projectileSpeed: 400,
      projectileColor: '#FF9900'
    }
  },

  pattern: {
    misilesPerWave: 2,
    waveDelay: 3.5,
    leadingFactor: 0.3 // Dispara 30% adelante de la posición del jugador
  }
};
```

**Comportamiento:**

```javascript
class HomingMissile {
  constructor(startX, startY, targetPlayer) {
    this.x = startX;
    this.y = startY;
    this.target = targetPlayer;
    this.vx = 0;
    this.vy = 0;
    this.speed = 200;
    this.acceleration = 50;
    this.maxTurnRate = 45 * Math.PI / 180; // radianes/segundo
    this.health = 25;
    this.rotation = 0;
    this.trailParticles = [];
  }

  update(deltaTime) {
    // Cálculo de dirección hacia objetivo
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const distance = Math.hypot(dx, dy);
    const desiredAngle = Math.atan2(dy, dx);

    // Ajuste gradual de dirección (no gira instantáneamente)
    let angleDiff = desiredAngle - this.rotation;
    // Normalizar ángulo [-PI, PI]
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    const maxTurn = this.maxTurnRate * deltaTime;
    this.rotation += Math.sign(angleDiff) * Math.min(Math.abs(angleDiff), maxTurn);

    // Acelerar en dirección de rotación actual
    this.vx += Math.cos(this.rotation) * this.acceleration * deltaTime;
    this.vy += Math.sin(this.rotation) * this.acceleration * deltaTime;

    // Limitar velocidad
    const currentSpeed = Math.hypot(this.vx, this.vy);
    if (currentSpeed > this.speed) {
      this.vx = (this.vx / currentSpeed) * this.speed;
      this.vy = (this.vy / currentSpeed) * this.speed;
    }

    this.x += this.vx * deltaTime;
    this.y += this.vy * deltaTime;

    // Crear partículas de estela
    if (Math.random() < 0.3) {
      this.trailParticles.push({
        x: this.x,
        y: this.y,
        life: 0.5,
        color: '#FF6600'
      });
    }
  }

  explode() {
    const projectiles = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      projectiles.push({
        x: this.x,
        y: this.y,
        vx: Math.cos(angle) * 400,
        vy: Math.sin(angle) * 400,
        color: '#FF9900',
        damage: 1,
        lifetime: 4
      });
    }
    return projectiles;
  }
}
```

**Visualización del Comportamiento:**

```
Turno 0-3s:  Misil vuela lentamente hacia el jugador
            [Misil]
                    →
                        [Jugador]

Turno 3s:   Misil se acerca, jugador se mueve
            [Misil gira]
                        [Jugador se mueve]

Impacto:    EXPLOSIÓN ◉
                   ◇◇◇
                  ◇   ◇
                 ◇◇◇◇◇
```

#### Habilidad Única 2: BARRAGE CANNON

**Mecánica:**
El jefe dispara rápidamente desde múltiples ángulos simultáneamente, creando un patrón de fuego intenso que requiere esquivas precisas.

**Detalles:**

```javascript
ABILITY_BARRAGE_CANNON = {
  name: 'Barrage Cannon',

  pattern: {
    phase1: {
      cannonsActive: 4, // Esquinas del octágono
      projectilesPerCannon: 3,
      fireRate: 0.2, // segundos entre ráfagas
      duration: 2.5
    },
    phase2: {
      cannonsActive: 8, // Todos los lados
      projectilesPerCannon: 2,
      fireRate: 0.15,
      duration: 3.5
    }
  },

  projectileStats: {
    speed: 380,
    damage: 1,
    health: 2,
    color: '#FF6600'
  }
};
```

#### Progresión de Ataques

**Fase 1 (100%-50%):**
1. **0s:** Corner Barrage (4 esquinas, ráfagas lentas)
2. **5s:** Homing Missile Barrage (1 misil perseguidor)
3. **9s:** Barrage Cannon (4 cañones activos)
4. **12s:** Ring Wave (proyectiles anulares)
5. **15s:** Volver a paso 1

**Fase 2 (49%-0%):**
1. **0s:** Corner Barrage (8 esquinas, doble velocidad)
2. **3s:** Homing Missile Barrage (2 misiles simultáneos)
3. **6s:** Barrage Cannon (8 cañones activos)
4. **9s:** Ring Wave + Corner Barrage (simultáneo)
5. **12s:** Repetir

#### Consideraciones de Dificultad

**Fortalezas:**
- Misiles perseguidores = amenaza constante
- Barrage crea presión de esquivas
- Explosiones de misiles causan daño secundario

**Debilidades:**
- Misiles lentos = tiempo para destruirlos
- Patrón predecible de ataques
- Sin movimiento de jefe

**Dificultad Balance:**
- Jugador en Lv14 con Laser + Orbital Shield
- Shield absorbe algunos misiles
- Missile Launcher no está disponible aún (irónico)
- Estimado: 2-2.5 minutos de lucha

---

### JEFE 3: LIGHTNING NEXUS
**Nivel de Aparición:** 20
**Arma Desbloqueada:** Lightning Ray
**HP Base:** 450
**Tema:** Energía eléctrica, rayos telegrafíados, cadenas de electricidad

#### Apariencia Visual

```
      ╱─────╲
    ╱   ◆●◆   ╲
   │  ◆  ▲  ◆  │
   │  ●  ●  ●  │
    ╲   ◆  ◆   ╱
      ╲─────╱
```

- **Forma:** Dodecágono (12 lados, casi circular)
- **Tamaño:** 90px de ancho
- **Color Base:** Amarillo brillante (#FFFF00) y naranja (#FF9900)
- **Centro:** Núcleo de arco eléctrico blanco-azul (#00FFFF)
- **Detalles:**
  - 12 picos puntiagudos alrededor del perímetro (1 por lado)
  - Arcos eléctricos animados entre picos consecutivos
  - Parpadeo constante (simula electricidad)
  - Aura que pulsa y brilla

#### Habilidad Única 1: TELEGRAPH LIGHTNING STRIKE

**Mecánica:**
El jefe emite líneas telegrafíadas de luz (advertencia visual) que se convierten en rayos dañinos después de ~1.5 segundos. El jugador debe esquivar antes de que el rayo se active.

**Detalles:**

```javascript
ABILITY_TELEGRAPH_LIGHTNING_STRIKE = {
  name: 'Telegraph Lightning Strike',

  mechanics: {
    telegraphDuration: 1.5, // segundos antes de convertirse en rayo dañino
    fireDuration: 0.5, // rayo está activo este tiempo
    cooldownDuration: 1.0, // antes del siguiente telegrafío

    rayStats: {
      width: 25,
      length: 1000, // Desde boss hasta borde de arena
      damage: 1,
      damagePerFrame: 0.15, // Daño continuo mientras el rayo está activo
      color: '#FFFF00'
    }
  },

  patterns: {
    straight4: {
      // 4 rayos: arriba, abajo, izq, der
      rays: 4,
      direction: 'cardinal'
    },
    diagonal4: {
      // 4 rayos: diagonales
      rays: 4,
      direction: 'diagonal'
    },
    spiral: {
      // 12 rayos expandiéndose en espiral
      rays: 12,
      rotationSpeed: 180 // degrees/second durante telegrafío
    },
    targeting: {
      // 1 rayo que apunta directamente al jugador + 3 alrededor
      rays: 4,
      centerOnPlayer: true,
      otherRaysOffset: 90
    }
  }
};
```

**Implementación Visual:**

```javascript
class TelegraphRay {
  constructor(boss, angle, type = 'telegraph') {
    this.boss = boss;
    this.angle = angle;
    this.type = type; // 'telegraph', 'fire', or 'gone'
    this.age = 0;
    this.opacity = 1.0;
    this.partikelEmission = 0;
  }

  render(ctx, bossX, bossY) {
    const rayLength = 1000;
    const rayWidth = this.type === 'telegraph' ? 20 : 25;

    const startX = bossX;
    const startY = bossY;
    const endX = bossX + Math.cos(this.angle) * rayLength;
    const endY = bossY + Math.sin(this.angle) * rayLength;

    // Dibujar línea del rayo
    ctx.strokeStyle = this.type === 'telegraph'
      ? 'rgba(255, 255, 0, 0.4)'
      : 'rgba(255, 255, 0, 1.0)';

    if (this.type === 'fire') {
      // Efecto de parpadeo durante fuego
      if (Math.floor(game.time * 20) % 2 === 0) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 1.0)';
      }
      ctx.lineWidth = rayWidth + 10; // Más grueso cuando dispara
    } else {
      ctx.lineWidth = rayWidth;
    }

    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Brillo exterior para efecto de rayo
    if (this.type === 'fire') {
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.6)';
      ctx.lineWidth = rayWidth + 5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }
  }

  getHitbox() {
    // Retorna línea para collision testing
    return {
      startX: this.boss.x,
      startY: this.boss.y,
      endX: this.boss.x + Math.cos(this.angle) * 1000,
      endY: this.boss.y + Math.sin(this.angle) * 1000,
      width: 25,
      isDamaging: this.type === 'fire'
    };
  }
}
```

**Cronología de un Ataque:**

```
Tiempo 0.0s:    [Telegrafío comienza] - línea amarilla semitransparente
                Jugador ve advertencia

Tiempo 1.5s:    [Rayo se activa] - línea amarilla brillante + blanca
                ¡DAÑO! si el jugador está en la línea

Tiempo 2.0s:    [Rayo finaliza]
                Línea desaparece

Tiempo 3.0s:    [Siguiente telegrafío comienza]
```

#### Habilidad Única 2: ELECTRICAL CHAIN REACTION

**Mecánica:**
El jefe dispara "anillos de cadena eléctrica" que se expanden. Cuando un anillo golpea al jugador o a otro proyectil, crea una descarga que salta a objetivos cercanos. Múltiples saltadores pueden ocurrir simultáneamente.

**Detalles:**

```javascript
ABILITY_ELECTRICAL_CHAIN_REACTION = {
  name: 'Electrical Chain Reaction',

  chainRingStats: {
    initialSpeed: 0,
    expandSpeed: 250, // px/s se expanden
    maxRadius: 600,
    color: '#00FFFF',
    thickness: 8,
    lifetime: 3
  },

  chainMechanics: {
    maxChainDistance: 200, // Distancia máxima de salto
    chainDamage: 1,
    chainsPerRing: 3, // Máximo de cadenas simultáneas por anillo
    chainSpeed: 500,
    chainColor: '#00FF00'
  },

  pattern: {
    ringsPerWave: 2,
    waveDelay: 0.8,
    totalWaves: 3
  }
};
```

**Visualización:**

```
Anillo 1 (expandiéndose):
          ◇ ◇ ◇
        ◇       ◇
      ◇    [B]    ◇
        ◇       ◇
          ◇ ◇ ◇

Jugador toca anillo → ⚡ cadena salta a objeto cercano
                    ⚡ segunda cadena a otro objetivo
                    ⚡ tercera cadena
```

#### Progresión de Ataques

**Fase 1 (100%-50%):**
1. **0s:** Telegraph Lightning Strike (4 rayos cardinales)
2. **5s:** Electrical Chain Reaction (2 anillos expandibles)
3. **9s:** Telegraph Lightning Strike (patrón diagonal)
4. **13s:** Corner Barrage (8 esquinas)
5. **16s:** Repetir

**Fase 2 (49%-0%):**
1. **0s:** Telegraph Lightning Strike (12 rayos en espiral)
2. **3s:** Electrical Chain Reaction (3 anillos simultáneos)
3. **5s:** Telegraph Lightning Strike (apuntando al jugador)
4. **7s:** Spiral Outward (doble densidad)
5. **9s:** Repetir

#### Consideraciones de Dificultad

**Fortalezas:**
- Telegrafío enseña al jugador a anticipar patrones
- Cadenas eléctricas crean situaciones impredecibles
- Rango de ataque amplio (rayos llegan hasta bordes)

**Debilidades:**
- Rayos son línea recta, esquivables
- Cadenas tienen alcance limitado
- Patrón aún predecible

**Dificultad Balance:**
- Jugador en Lv20 con Laser, Orbital Shield, Missile Launcher
- Múltiples armas permiten diferentes estrategias
- Estimado: 2.5-3 minutos de lucha

---

### JEFE 4: PLASMA OVERLORD
**Nivel de Aparición:** 27
**Arma Desbloqueada:** Plasma Field
**HP Base:** 600
**Tema:** Plasma infernal, campos circulares telegrafíados, donas de fuego

#### Apariencia Visual

```
        ◆◆◆◆◆
      ◆◆     ◆◆
     ◆◆   ▲   ◆◆
     ◆◆  ◆●◆  ◆◆
     ◆◆   ▼   ◆◆
      ◆◆     ◆◆
        ◆◆◆◆◆
```

- **Forma:** Cuadrado rotado (diamante) con bordes afilados
- **Tamaño:** 110px de ancho
- **Color Base:** Rojo intenso (#FF0000) a naranja (#FF6600)
- **Centro:** Esfera de plasma pulsante (#FFFF00)
- **Detalles:**
  - Bordes afilados y violentos
  - Líneas de plasma fluyen desde el centro hacia afuera
  - Efecto de onda de calor constante alrededor del jefe
  - Colores más intensos en Fase 2

#### Habilidad Única 1: TELEGRAPH PLASMA RING

**Mecánica:**
Similar al Telegraph Lightning Strike pero con anillos circulares de plasma. Primero se telegrafía (línea fina pulsante), luego se activa como anillo de fuego de gran daño.

**Detalles:**

```javascript
ABILITY_TELEGRAPH_PLASMA_RING = {
  name: 'Telegraph Plasma Ring',

  mechanics: {
    telegraphDuration: 1.2,
    fireDuration: 0.7,
    cooldownDuration: 0.8,

    ringStats: {
      innerRadius: 100,
      thickness: 40, // El anillo es un donut, no una línea
      damage: 1,
      damagePerFrame: 0.25, // Más daño que rayos
      color: '#FF6600'
    }
  },

  patterns: {
    single: {
      // Un anillo grande
      rings: 1,
      radius: 250
    },
    concentric: {
      // Múltiples anillos concéntricos
      rings: 3,
      radii: [120, 250, 400],
      delays: [0, 0.3, 0.6] // Segundos entre activaciones
    },
    expanding: {
      // Un anillo que se expande (comenzando pequeño)
      minRadius: 80,
      maxRadius: 500,
      expandDuration: 2.5
    },
    spiral: {
      // Anillos se emiten en secuencia, creando patrón de espiral
      rings: 5,
      radiusMultiplier: 1.3, // Cada anillo 30% más grande
      delay: 0.4
    }
  }
};
```

**Visualización:**

```
Telegrafío:
    ◌ ◌ ◌ ◌
  ◌           ◌
 ◌      [B]      ◌
  ◌           ◌
    ◌ ◌ ◌ ◌

Fuego:
    ███████
  ███     ███
 ███ [B]   ███
  ███     ███
    ███████
```

#### Habilidad Única 2: DONUT ERUPTION

**Mecánica:**
El jefe emite múltiples anillos de plasma en cascada rápida, creando un patrón "erupción" de anillos superpuestos que crecen en tamaño.

**Detalles:**

```javascript
ABILITY_DONUT_ERUPTION = {
  name: 'Donut Eruption',

  eruption: {
    ringCount: 6,
    initialDelay: 0.0,
    delayBetweenRings: 0.25,

    ringProgression: {
      // Cada anillo es más grande y más rápido
      minRadius: [80, 120, 160, 200, 250, 300],
      maxThickness: [40, 50, 60, 70, 80, 90],
      expandSpeed: [200, 250, 300, 350, 400, 450]
    }
  },

  visualization: `
  Anillo 1 (pequeño):    ◌
  Anillo 2 (medio):     ◌◌◌
  Anillo 3 (grande):   ◌◌◌◌◌
  Anillo 4 (enorme):  ◌◌◌◌◌◌◌
  ... patrón de crecimiento visual
  `
};
```

#### Progresión de Ataques

**Fase 1 (100%-50%):**
1. **0s:** Telegraph Plasma Ring (un anillo)
2. **4s:** Ring Wave (proyectiles normales)
3. **7s:** Telegraph Plasma Ring (anillos concéntricos 3)
4. **11s:** Spiral Outward (más denso)
5. **15s:** Repetir

**Fase 2 (49%-0%):**
1. **0s:** Telegraph Plasma Ring (anillos en espiral)
2. **3s:** Donut Eruption (6 anillos en cascada)
3. **5s:** Telegraph Plasma Ring (anillos expandibles)
4. **8s:** Corner Barrage + Ring Wave (simultáneo)
5. **11s:** Repetir

#### Consideraciones de Dificultad

**Fortalezas:**
- Anillos telegrafíados son predecibles pero requieren memoria espacial
- Donut Eruption es visualmente espectacular y requiere esquivas precisas
- Alto daño requiere que el jugador sea cauteloso

**Debilidades:**
- Anillos son estacionarios después de la activación
- Patrón sigue siendo mayormente predecible
- Tiempo de telegrafío permite planificación

**Dificultad Balance:**
- Jugador en Lv27 con 3 armas desbloqueadas
- Plasma Field no disponible aún
- Estimado: 3-3.5 minutos de lucha
- Debe ser notablemente más duro que anteriores

---

### JEFE 5: SWARM MOTHER
**Nivel de Aparición:** 35
**Arma Desbloqueada:** Alien Drone
**HP Base:** 800
**Tema:** Colmena, spawning de enemigos, caos controlado

#### Apariencia Visual

```
      ◆◆◆◆◆◆◆
    ◆◆         ◆◆
   ◆◆   ◇◇◇◇   ◆◆
   ◆◆  ◇  ●  ◇  ◆◆
   ◆◆   ◇◇◇◇   ◆◆
    ◆◆         ◆◆
      ◆◆◆◆◆◆◆
```

- **Forma:** Hexágono grande pero irregular (más bien orgánico, casi amorfo)
- **Tamaño:** 140px de ancho
- **Color Base:** Verde oscuro (#1A5C1A) a verde neón (#00FF00)
- **Centro:** Cámara de cría pulsante roja (#FF0000)
- **Detalles:**
  - Estructura similar a colmena con hexágonos internos
  - Membranas que palpitan constantemente
  - Partículas de spore verdes emitidas continuamente
  - En Fase 2, auras más verdes y más activas

#### Habilidad Única 1: HIVE SPAWN

**Mecánica:**
El jefe periódicamente expulsa enjambres de enemigos pequeños desde su centro y desde el borde del anillo. Estos enemigos son copias débiles pero numerosas de enemigos normales.

**Detalles:**

```javascript
ABILITY_HIVE_SPAWN = {
  name: 'Hive Spawn',

  mechanics: {
    spawnsPerAttack: 2, // Centro + borde
    enemyTypesSpawned: {
      scouts: 5,
      kamikazes: 3,
      spinners: 2,
      tanks: 1
    },

    centerSpawn: {
      // Enemigos salen explosivamente desde el centro
      position: 'boss_center',
      spreadRadius: 80,
      spreadAngle: Math.PI * 2, // 360°
      spreadSpeed: 250,
      duration: 1.5 // Tiempo de dispersión
    },

    ringSpawn: {
      // Enemigos aparecen en los bordes del anillo
      positions: 4, // 4 puntos alrededor del borde
      angleOffsets: [0, Math.PI/2, Math.PI, Math.PI*1.5],
      enemiesPerPoint: 4,
      jumpSpeed: 200 // Velocidad inicial hacia adentro
    }
  },

  enemyStats: {
    // Enemigos spawned tienen stats reducidos
    scoutHealth: 5, // Normal es 10
    survivalMultiplier: 0.5 // HP * 0.5
  }
};
```

**Visualización:**

```
Centro spawn:
         ↙ ↘ ↙ ↘
       ↙  [Boss] ↘
      ↙ ↘ ↙ ↘

Borde spawn:
    Scout    Scout
    ↓        ↓
  [Anillo]
    ↓        ↓
    Scout    Scout
```

#### Habilidad Única 2: BROOD EXPLOSION

**Mecánica:**
Cuando hay muchos enemigos spawnados en el campo, la SWARM MOTHER puede detonarse, causando una explosión que daña tanto al jugador como a los enemigos (los enemigos sobreviven, pero el jefe se hiere a sí mismo para maximizar daño).

**Detalles:**

```javascript
ABILITY_BROOD_EXPLOSION = {
  name: 'Brood Explosion',

  trigger: {
    // Se activa cuando hay X o más enemigos en el campo
    minimumEnemiesOnField: 8,
    cooldown: 8 // Segundos antes de poder explotar de nuevo
  },

  explosion: {
    radius: 500,
    baseDamage: 2, // Daño al jugador
    expandDuration: 0.5,
    color: '#00FF00',

    // Pulso de onda de choque
    waveCount: 3,
    waveDelay: 0.2,
    waveSize: 100
  },

  mechanics: {
    // Los enemigos spawned se disparan hacia afuera en la explosión
    enemyKnockback: 500, // px/s
    enemySurvival: true, // No mueren en la explosión
    enemyStunDuration: 0.0 // No se aturden
  }
};
```

**Visualización ASCII:**

```
Antes:          Explosión:         Después:
  ↙ ↘             ◇◇◇◇              ↙ ↘
↙ [B] ↘     →   ◇◇ ↙↘ ◇◇    →    ↙ [B] ↘
  ↖ ↗           ◇◇ [B] ◇◇         ↖ ↗
                 ◇◇ ◇◇
```

#### Habilidad Única 3: SPORE CLOUD (Secundaria)

**Mecánica:**
Mientras el jefe está activo, emite constantemente una nube de spores que rodea el anillo. Esta nube es pasiva pero reduce la visibilidad y crea un efecto visual de "contaminación".

**Detalles:**

```javascript
ABILITY_SPORE_CLOUD = {
  name: 'Spore Cloud',

  mechanics: {
    emissionRate: 10, // Spores por segundo
    sporeLifetime: 2.5,
    sporeSpeed: 100,
    sporeRadius: 4,
    sporeColor: 'rgba(0, 255, 0, 0.6)',

    // Spores flotan alrededor del anillo
    floatPattern: 'spiral',
    floatSpeed: 30 // px/s rotación
  },

  effects: {
    // Efecto visual pasivo, sin daño
    obscuresVision: false, // Jugador puede ver a través
    createsParticleBeauty: true
  }
};
```

#### Progresión de Ataques

**Fase 1 (100%-50%):**
1. **0s:** Hive Spawn (centro + borde)
2. **3s:** Ring Wave (proyectiles normales)
3. **5s:** Hive Spawn nuevamente
4. **8s:** Spiral Outward (doble densidad)
5. **11s:** Brood Explosion (si hay 8+ enemigos)
6. **13s:** Repetir

**Fase 2 (49%-0%):**
1. **0s:** Hive Spawn (doble spawning)
2. **2s:** Corner Barrage (8 esquinas)
3. **4s:** Hive Spawn nuevamente
4. **6s:** Brood Explosion (más agresivo)
5. **7s:** Spiral Outward + Telegraph Lightning Strike (simultáneo - usa patrón de otro jefe)
6. **10s:** Repetir

**Fase 3 (FINAL, solo en repeat defeats):**
Si se vuelve a derrotar a SWARM MOTHER después del primer derrota (es decir, el jugador ya tiene Alien Drone desbloqueado):
- Todos los patrones ocurren 1.5x más rápido
- Spawns son dobles (20 enemigos en lugar de 10)
- Explosiones ocurren cada 4 segundos en lugar de 8

#### Consideraciones de Dificultad

**Fortalezas:**
- Spawning de enemigos crea caos y presión
- Jugador debe decidir entre atacar jefe o limpiar espacio
- Explosiones son impredecibles si hay muchos enemigos
- Prueba la capacidad del jugador de manejar multitud

**Debilidades:**
- Enemigos spawned son débiles (HP reducido)
- Explosión daña al jefe también
- Con suficientes armas, jugador puede limpiar enemigos rápido

**Dificultad Balance:**
- Jugador en Lv35 con 4 armas desbloqueadas
- Este es el ÚLTIMO jefe, debe ser el más desafiante
- Estimado: 3.5-4.5 minutos de lucha
- Requiere manejo de recursos y decisiones tácticas

---

## 5. SISTEMA DE META-PROGRESIÓN

### 5.1 Estructura de localStorage

```javascript
// Clave principal: 'stellarSwarm_progression'

const PROGRESSION_SAVE = {
  version: 1, // Para futuras actualizaciones

  unlockedWeapons: {
    laserCannon: true, // Siempre true (inicial)
    orbitalShield: false,
    missileLauncher: false,
    lightningRay: false,
    plasmaField: false,
    alienDrone: false
  },

  bossDefeats: {
    orbitalGuardian: 0, // Contador de derrotas
    missileTitan: 0,
    lightningNexus: 0,
    plasmaOverlord: 0,
    swarmMother: 0
  },

  achievementFlags: {
    defeatedFirstBoss: false,
    unlockedAllWeapons: false,
    repeatedlyDefeatedBoss: false // Si un boss fue derrotado 3+ veces
  },

  stats: {
    totalBossDefeats: 0,
    totalRunsStarted: 0,
    totalTimePlayed: 0 // Minutos
  }
};

// Guardar en localStorage
localStorage.setItem('stellarSwarm_progression', JSON.stringify(PROGRESSION_SAVE));
```

### 5.2 Aparición de Armas en Pool de Mejoras

**Primera Carrera (sin armas desbloqueadas):**
```javascript
UPGRADE_POOL_FIRST_RUN = [
  'laserCannon', // Siempre disponible
  'randomWeapon', // Random entre otros 5
  'laserCannon', // Duplicado para mayor frecuencia
  'randomWeapon'
];
```

**Carreras Subsecuentes (con armas desbloqueadas):**
```javascript
function generateUpgradePool(unlockedWeapons) {
  const pool = [];

  // Laser siempre disponible
  pool.push('laserCannon');

  // Añadir armas desbloqueadas al pool
  Object.entries(unlockedWeapons).forEach(([weapon, isUnlocked]) => {
    if (isUnlocked && weapon !== 'laserCannon') {
      // Weapon tiene 30% chance de aparecer vs otros
      pool.push(weapon);
      pool.push(weapon);
      pool.push(weapon);
    }
  });

  // Añadir armas bloqueadas como "?"
  Object.entries(unlockedWeapons).forEach(([weapon, isUnlocked]) => {
    if (!isUnlocked && weapon !== 'laserCannon') {
      pool.push('mystery_' + weapon);
    }
  });

  return pool;
}
```

**Visualización:**
```
Primera carrera:    [Laser] [?] [Laser] [?]

Después de derrotar Orbital Guardian:
                    [Laser] [Shield] [Laser] [?] [?]

Después de 3 bosses:
                    [Laser] [Shield] [Missile] [Lightning] [?] [?]
```

### 5.3 Progresión del Jugador Entre Carreras

**Carrera 1:**
- Solo Laser disponible
- Jugador llega a Lv8, pelea Orbital Guardian
- Si gana: Orbital Shield desbloqueado
- Si pierde: Fin de carrera

**Carrera 2 (si ganó carrera 1):**
- Laser + Shield disponibles en pool
- Jugador puede elegir mejorar cualquiera
- Llega más lejos porque tiene más opciones

**Carrera 5 (si desbloqueó todos):**
- Todas las armas disponibles
- Máxima flexibilidad
- Bosses tienen más HP porque jugador es más fuerte

### 5.4 Almacenamiento Persistente

```javascript
// Al iniciar juego
function loadProgression() {
  const saved = localStorage.getItem('stellarSwarm_progression');
  if (saved) {
    return JSON.parse(saved);
  } else {
    // Primera vez
    return createNewProgression();
  }
}

// Al derrotar un boss
function onBossDefeated(bossType) {
  const progression = loadProgression();

  const weaponMap = {
    'orbitalGuardian': 'orbitalShield',
    'missileTitan': 'missileLauncher',
    'lightningNexus': 'lightningRay',
    'plasmaOverlord': 'plasmaField',
    'swarmMother': 'alienDrone'
  };

  progression.unlockedWeapons[weaponMap[bossType]] = true;
  progression.bossDefeats[bossType]++;
  progression.stats.totalBossDefeats++;

  // Guardar cambios
  localStorage.setItem('stellarSwarm_progression', JSON.stringify(progression));
}
```

---

## 6. SISTEMA DE RECOMPENSAS

### 6.1 Derrota Inicial (Primera Derrota de Jefe)

**XP/Niveles:**
```javascript
FIRST_DEFEAT_REWARDS = {
  orbitalGuardian: { xp: 100, levels: 1 },   // Nivel 8 → 9
  missileTitan: { xp: 150, levels: 1 },      // Nivel 14 → 15
  lightningNexus: { xp: 250, levels: 1 },    // Nivel 20 → 21
  plasmaOverlord: { xp: 400, levels: 2 },    // Nivel 27 → 29
  swarmMother: { xp: 600, levels: 3 }        // Nivel 35 → 38
};
```

**Score:**
```javascript
FIRST_DEFEAT_SCORE = {
  orbitalGuardian: 5000,
  missileTitan: 10000,
  lightningNexus: 20000,
  plasmaOverlord: 40000,
  swarmMother: 100000 // Recompensa épica
};
```

### 6.2 Derrota Repetida (Boss Ya Desbloqueado)

Si el jugador derrota a un jefe que ya tiene el arma desbloqueada:

```javascript
REPEAT_DEFEAT_REWARDS = {
  // Opción 1: Mucho XP
  xpApproach: {
    multiplier: 3.0, // 3x XP normal
    formula: (bossHp) => Math.floor(bossHp * 0.5) // 50% HP del boss en XP
  },

  // Opción 2: Niveles automáticos
  levelApproach: {
    minLevels: 2,
    maxLevels: 5,
    formula: (currentLevel) => Math.min(5, Math.floor(currentLevel / 10))
  },

  // Usar Opción 2 (más satisfactorio)
  score: {
    multiplier: 2.0 // 2x score comparado con derrota inicial
  }
};
```

**Ejemplo:**
- Jugador derrota Orbital Guardian por segunda vez
- Recibe: 2-5 niveles automáticos + 10,000 score
- Esto es significativo pero no roto

### 6.3 Recompensa de Puntuación Adicional

```javascript
SCORE_BONUSES = {
  // Bonificador por dificultad
  bossDefeatedWithoutTakingDamage: 2.0, // 2x multiplicador
  bossDefeatedInQuickTime: {
    // Si se derrota en menos de X tiempo
    lessThanTwoMinutes: 1.5,
    lessThanOneMinute: 3.0
  },

  // Bonificador por armas desbloqueadas
  defeatedWithOnlyLaser: {
    orbitalGuardian: 1.5, // 1.5x bonus
    missileTitan: 2.0,
    lightningNexus: 2.5,
    plasmaOverlord: 3.0,
    swarmMother: 5.0 // Brutal si solo tienes laser
  },

  // Bonificador por salud
  defeatedWithMaxHealth: 1.2,
  defeatedWithLowHealth: 2.0 // Si baja a 1 HP
};
```

---

## 7. HUD DE BARRA DE SALUD

### 7.1 Posicionamiento y Tamaño

```javascript
BOSS_HEALTHBAR_HUD = {
  position: {
    x: 960, // Centro de 1920
    y: 80   // 80px desde la parte superior
  },

  dimensions: {
    width: 400,
    height: 40,
    barHeight: 30 // Barra interna
  },

  anchor: 'top-center'
};
```

### 7.2 Diseño Visual

```
┌──────────────────────────────────────────┐
│  ORBITAL GUARDIAN                    [●]  │  ← Boss name
│  ██████████░░░░░░░░░░░░░░░░░░░░░░░░░░  │  ← Health bar
│  75% | Phase 1                      ▲    │  ← Health % + Phase
└──────────────────────────────────────────┘

Colores:
- Barra llena: Gradiente Verde (#00FF00) → Amarillo (#FFFF00)
- Barra vacía: Gris (#444444)
- Borde: Azul cian (#00CCFF)
- Fase 2: Barra cambia a Rojo (#FF0000) → Naranja (#FF6600)
```

### 7.3 Elementos del HUD

```javascript
class BossHealthBarHUD {
  constructor(boss) {
    this.boss = boss;
    this.displayHealth = boss.maxHp; // Animación suave
    this.displayUpdateSpeed = 30; // px/frame
  }

  render(ctx) {
    const x = 960;
    const y = 80;
    const width = 400;
    const height = 40;
    const barHeight = 30;

    // Fondo del HUD
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(x - width/2, y, width, height);

    // Borde
    ctx.strokeStyle = '#00CCFF';
    ctx.lineWidth = 3;
    ctx.strokeRect(x - width/2, y, width, height);

    // Nombre del Boss
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(
      this.boss.name,
      x - width/2 + 15,
      y + 25
    );

    // Indicador de fase
    const phaseText = this.boss.currentPhase === 1 ? 'Phase 1' : 'Phase 2 - ENRAGED';
    ctx.fillStyle = this.boss.currentPhase === 1 ? '#00FF00' : '#FF0000';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(
      phaseText,
      x + width/2 - 15,
      y + 25
    );

    // Animación suave de barra
    this.displayHealth += (this.boss.hp - this.displayHealth) * 0.15;
    const healthPercent = this.displayHealth / this.boss.maxHp;

    // Barra de salud
    const barWidth = (width - 30) * healthPercent;
    const barX = x - width/2 + 15;
    const barY = y + 32;

    // Gradiente
    const gradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
    if (this.boss.currentPhase === 1) {
      gradient.addColorStop(0, '#00FF00');
      gradient.addColorStop(1, '#FFFF00');
    } else {
      gradient.addColorStop(0, '#FF0000');
      gradient.addColorStop(1, '#FF6600');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(barX, barY, barWidth, barHeight);

    // Fondo de barra (vacío)
    ctx.fillStyle = '#444444';
    ctx.fillRect(barX + barWidth, barY, (width - 30) - barWidth, barHeight);

    // Borde de barra
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, width - 30, barHeight);

    // Texto de porcentaje
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      Math.floor(healthPercent * 100) + '%',
      x,
      y + 55
    );
  }
}
```

### 7.4 Animaciones Especiales

**Cuando el boss cambia de fase (50% HP):**
```javascript
function onPhaseTransition() {
  // Flash de pantalla blanca
  screenFlash(duration: 0.3, color: 'white');

  // Barra de salud parpadea rojo
  healthBar.flashDuration = 0.5;
  healthBar.flashColor = '#FF0000';

  // Sonido distinto
  playSound('boss_phase2_start', volume: 0.7);

  // Partículas alrededor del boss
  for (let i = 0; i < 20; i++) {
    createParticle({
      x: boss.x + random(-50, 50),
      y: boss.y + random(-50, 50),
      vx: random(-300, 300),
      vy: random(-300, 300),
      lifetime: 1.0,
      color: '#FF0000'
    });
  }
}
```

---

## 8. PANTALLA DE VICTORIA / CELEBRACIÓN

### 8.1 Pantalla de Derrota del Boss

Cuando el boss llega a 0 HP:

```javascript
class BossVictoryScreen {
  constructor(boss, progression) {
    this.boss = boss;
    this.progression = progression;
    this.startTime = game.time;
    this.duration = 4.5; // segundos
    this.isFirstDefeat = !progression.unlockedWeapons[boss.weaponType];
  }

  render(ctx, canvasWidth, canvasHeight) {
    const elapsed = game.time - this.startTime;
    const progress = Math.min(elapsed / this.duration, 1.0);

    // Fondo oscuro semitransparente (fade-in)
    const bgAlpha = progress * 0.8;
    ctx.fillStyle = `rgba(0, 0, 0, ${bgAlpha})`;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    if (this.isFirstDefeat) {
      this.renderWeaponUnlock(ctx, canvasWidth, canvasHeight, progress);
    } else {
      this.renderReplayVictory(ctx, canvasWidth, canvasHeight, progress);
    }
  }

  renderWeaponUnlock(ctx, w, h, progress) {
    const centerX = w / 2;
    const centerY = h / 2;

    // Escala de entrada (zoom-in)
    const scale = 0.5 + (progress * 0.5); // 0.5 to 1.0

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);

    // Título: "WEAPON UNLOCKED"
    ctx.fillStyle = '#FFFF00';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      'WEAPON UNLOCKED!',
      centerX,
      centerY - 100
    );

    // Nombre del arma desbloqueada
    const weaponName = this.boss.unlocksWeapon;
    ctx.fillStyle = '#00CCFF';
    ctx.font = 'bold 48px Arial';
    ctx.fillText(
      weaponName.toUpperCase(),
      centerX,
      centerY - 20
    );

    // Icono del arma (representación visual)
    this.drawWeaponIcon(ctx, centerX, centerY + 60, weaponName);

    // Subtítulo
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.fillText(
      'This weapon is now available in future runs',
      centerX,
      centerY + 150
    );

    // Estadísticas del combate
    ctx.font = '14px Arial';
    ctx.fillStyle = '#CCCCCC';
    const combatTime = Math.round(this.boss.combatDuration);
    ctx.fillText(
      `Combat time: ${combatTime}s | Boss HP: ${this.boss.maxHp}`,
      centerX,
      centerY + 180
    );

    ctx.restore();
  }

  renderReplayVictory(ctx, w, h, progress) {
    const centerX = w / 2;
    const centerY = h / 2;

    const scale = 0.7 + (progress * 0.3); // 0.7 to 1.0

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);

    // Título más modesto
    ctx.fillStyle = '#00FF00';
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(
      'BOSS DEFEATED!',
      centerX,
      centerY - 60
    );

    // Recompensas
    ctx.fillStyle = '#FFFF00';
    ctx.font = 'bold 28px Arial';
    ctx.fillText(
      `+${this.boss.defeatRewards.levels} LEVELS`,
      centerX,
      centerY + 30
    );

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.fillText(
      `+${this.boss.defeatRewards.xp} XP`,
      centerX,
      centerY + 70
    );

    ctx.restore();
  }

  drawWeaponIcon(ctx, x, y, weaponName) {
    // Dibujos simples representativos
    switch(weaponName) {
      case 'orbitalShield':
        // Dibujar escudo orbital (círculos)
        ctx.strokeStyle = '#00CCFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, 40, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(x, y, 25, 0, Math.PI * 2);
        ctx.stroke();
        break;
      case 'missileLauncher':
        // Dibujar misil (triángulo)
        ctx.fillStyle = '#FF6600';
        ctx.beginPath();
        ctx.moveTo(x, y - 40);
        ctx.lineTo(x - 20, y + 30);
        ctx.lineTo(x + 20, y + 30);
        ctx.fill();
        break;
      case 'lightningRay':
        // Rayo en zigzag
        ctx.strokeStyle = '#FFFF00';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x, y - 40);
        ctx.lineTo(x + 20, y - 10);
        ctx.lineTo(x - 15, y + 10);
        ctx.lineTo(x + 15, y + 35);
        ctx.stroke();
        break;
      case 'plasmaField':
        // Anillo de plasma
        ctx.strokeStyle = '#FF0000';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(x, y, 30, 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
        ctx.fill();
        break;
      case 'alienDrone':
        // Hexágono (colmena)
        ctx.strokeStyle = '#00FF00';
        ctx.lineWidth = 3;
        this.drawHexagon(ctx, x, y, 35);
        break;
    }
  }

  drawHexagon(ctx, x, y, radius) {
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
  }
}
```

### 8.2 Flujo de Pantalla

```
1. Boss HP → 0
   ↓
2. Pausa el juego (congelar enemigos, etc.)
   ↓
3. Mostrar victoria de 4.5 segundos
   ├─ Si primera derrota: "WEAPON UNLOCKED"
   └─ Si repeat: "BOSS DEFEATED + rewards"
   ↓
4. Transición suave a pantalla de resumen
   ├─ Mostrar estadísticas de carrera
   ├─ Ofrecimiento: Continuar vs Fin de carrera
   └─ Guardar progresión
```

### 8.3 Sonidos y Efectos

```javascript
VICTORY_AUDIO_EFFECTS = {
  bossDefeated: {
    sound: 'victory_stinger.wav',
    volume: 0.8,
    duration: 2.0
  },

  weaponUnlocked: {
    sound: 'weapon_unlock.wav',
    volume: 1.0,
    duration: 1.5
  }
};

VICTORY_VISUAL_EFFECTS = {
  screenFlash: {
    duration: 0.5,
    color: 'white',
    intensity: 0.6
  },

  particleExplosion: {
    count: 50,
    spreadAngle: Math.PI * 2,
    color: ['#00CCFF', '#FFFF00', '#00FF00'],
    speed: 300,
    duration: 1.5
  },

  weaponGlow: {
    color: '#FFFF00',
    intensity: 'pulsing',
    frequency: 2 // Hz
  }
};
```

---

## 9. ESCALADO DE DIFICULTAD

### 9.1 Múltiples Niveles de Escala

Los jefes escalan en dificultad según:

**1. Nivel del Jugador Actual**

```javascript
DIFFICULTY_LEVEL_SCALING = {
  // Para cada jefe, si el jugador está MÁS arriba del nivel esperado
  bossAttackSpeed: (playerLevel, bossLevel) => {
    const levelDiff = Math.max(0, playerLevel - bossLevel);
    return 1.0 + (levelDiff * 0.08); // 8% más rápido por nivel
  },

  bossProjectileSpeed: (playerLevel, bossLevel) => {
    const levelDiff = Math.max(0, playerLevel - bossLevel);
    return 1.0 + (levelDiff * 0.10); // 10% más rápido
  },

  bossPatternComplexity: (playerLevel, bossLevel) => {
    const levelDiff = Math.max(0, playerLevel - bossLevel);
    // Cada 5 niveles por encima = 1 patrón más complejo
    return Math.ceil(1 + (levelDiff / 5));
  }
};
```

**2. Armas Desbloqueadas (Poder del Jugador)**

```javascript
DIFFICULTY_WEAPON_SCALING = {
  // Más armas = jugador más fuerte = jefe más fuerte
  bossHpMultiplier: (weaponCount) => {
    return 1.0 + (weaponCount * 0.25); // +25% HP por arma
  },

  bossProjectileCount: (weaponCount) => {
    // Después de 2 armas, empieza a aumentar projectiles
    if (weaponCount < 2) return 1.0;
    return 1.0 + ((weaponCount - 2) * 0.15); // +15% projectiles por arma extra
  },

  bossPhaseDuration: (weaponCount) => {
    // Menos tiempo entre patrones si jugador tiene más armas
    return 1.0 - (weaponCount * 0.08); // -8% duración (más rápido)
  }
};
```

**3. Posición del Jefe en Secuencia**

```javascript
DIFFICULTY_PROGRESSION_CURVE = {
  // Tabla de base HP
  bossBaseHp: [
    200,  // Boss 1
    300,  // Boss 2
    450,  // Boss 3
    600,  // Boss 4
    800   // Boss 5
  ],

  // Multiplicador que aumenta exponencialmente
  bossIndexMultiplier: (index) => {
    return Math.pow(1.4, index); // Exponencial: 1.4x, 1.96x, 2.74x, etc.
  }
};
```

### 9.2 Tabla de Ejemplo - Dificultad Escalada

Suponiendo jugador con múltiples armas desbloqueadas jugando en diferentes niveles:

| Scenario | Boss | Jugador Lv | Armas | HP Base | HP Escalada | Complejidad |
|----------|------|-----------|-------|---------|------------|------------|
| Primera Carrera | Orbital Guardian | 8 | 1 (Laser) | 200 | 200 | Normal |
| Segunda Carrera | Orbital Guardian | 12 | 2 | 200 | 250 (+25%) | Normal +1 |
| Tercera Carrera | Orbital Guardian | 18 | 3 | 200 | 300 (+50%) | Normal +2 |
| Retry (Mismo Boss) | Missile Titan | 14 | 1 | 300 | 300 | Normal |
| Después 2 Bosses | Missile Titan | 18 | 2 | 300 | 375 (+25%) | Normal +1 |
| Todos desbloqueados | Swarm Mother | 40 | 5 | 800 | 1600 (+100%) | Complex +3 |

### 9.3 Fórmula de Dificultad Combinada

```javascript
function calculateBossDifficulty(boss, playerLevel, unlockedWeapons) {
  const levelDiff = Math.max(0, playerLevel - boss.defaultLevel);
  const weaponCount = Object.values(unlockedWeapons).filter(v => v).length;

  // HP Scaling
  const levelMultiplier = 1 + (levelDiff * 0.15);
  const weaponMultiplier = 1 + (weaponCount * 0.25);
  const indexMultiplier = Math.pow(1.4, boss.index);

  boss.scaledHp = Math.floor(
    boss.baseHp * levelMultiplier * weaponMultiplier * indexMultiplier
  );

  // Attack Scaling
  boss.attackSpeed = 1.0 + (levelDiff * 0.08);
  boss.projectileSpeed = 350 * (1 + (levelDiff * 0.10));

  // Pattern Complexity
  const complexityIncrease = Math.ceil(1 + (levelDiff / 5));
  boss.patternCycleLenght += complexityIncrease;
}
```

---

## 10. CASOS ESPECIALES

### 10.1 Muerte del Jugador Durante el Boss

```javascript
function onPlayerDeathDuringBoss() {
  // Game Over inmediato
  gameState = 'gameOver';

  // NO guardar derrota del boss
  // NO dar recompensas

  // Mostrar pantalla de derrota:
  // "Boss not defeated - try again!"
  // Opción: Retry / Back to Menu

  // Estadísticas mostradas:
  // - Tiempo en batalla
  // - Daño hecho al boss
  // - Porcentaje de HP del boss
}
```

### 10.2 Jugador en Nivel Máximo Durante Boss

**Si se alcanza nivel MAX (digamos 50) durante pelea del boss:**

```javascript
function onMaxLevelReached() {
  // Opción 1: No permitir
  // player.level = 49;

  // Opción 2: Permitir pero parado
  if (player.level >= MAX_LEVEL) {
    player.level = MAX_LEVEL;
    // XP adicional simplemente no se cuenta
    player.xp = player.xpForNextLevel; // Mantener en tope
  }
}
```

### 10.3 Múltiples Boss Spawns en una Carrera

**Sistema actual:** Solo 1 boss por carrera

**Si se quisiera múltiples:**
```javascript
MULTI_BOSS_SYSTEM = {
  // Idea: Jefes aparecen en cascada
  // Si jefe 1 aparece en Lv8, jefe 2 en Lv14, etc.
  // Player puede enfrentar múltiples en 1 carrera si juega lo suficiente

  // Modificación necesaria:
  // - Cuando boss 1 muere, enemies resumen normalmente
  // - Boss 2 aparece cuando se alcanza siguiente nivel
  // - Pueden aparecer múltiples bosses si carrera es muy larga
};
```

### 10.4 Jugador Intenta Esquivar Boss (Salir del Arena)

```javascript
function preventBossEscape() {
  // Si jugador intenta salir del arena durante boss:
  // 1. Pared invisible lo empuja de vuelta
  // 2. NO hay daño (frustración mínima)
  // 3. Se muestra aviso visual rojo

  if (playerDistanceFromArenaCenter > ARENA_OUTER_RADIUS) {
    // Empujar de vuelta
    const angle = Math.atan2(
      player.y - arena.centerY,
      player.x - arena.centerX
    );

    player.x = arena.centerX + Math.cos(angle) * ARENA_OUTER_RADIUS;
    player.y = arena.centerY + Math.sin(angle) * ARENA_OUTER_RADIUS;

    // Knockback
    player.vx *= -0.5;
    player.vy *= -0.5;

    // Efecto visual: Flash rojo en borde arena
    arena.edgeFlash = 0.3; // duración
  }
}
```

### 10.5 Boss Se Queda Atrapado en Borde del Arena

```javascript
function preventBossStuckState() {
  // Asegurar boss siempre puede atacar
  // El jefe es estacionario en centro, así que no es problema

  // Pero si hay movimiento futuro:
  if (boss.distanceFromArenaCenter > ARENA_OUTER_RADIUS * 0.9) {
    // Forzar dirección hacia centro
    const angle = Math.atan2(
      arena.centerY - boss.y,
      arena.centerX - boss.x
    );

    boss.x += Math.cos(angle) * 100;
    boss.y += Math.sin(angle) * 100;
  }
}
```

### 10.6 Armas Especiales vs Proyectiles del Boss

```javascript
// Aclaración: Proyectiles del boss pueden ser destruidos
BOSS_PROJECTILE_DESTRUCTION = {
  laserCannon: {
    canDestroy: true,
    effectivenessMultiplier: 1.0
  },

  orbitalShield: {
    canDestroy: true,
    effectivenessMultiplier: 0.8, // Menos efectivo (irónico: es escudo)
    alternativeEffect: 'reflect' // Podría rebotar
  },

  missileLauncher: {
    canDestroy: true,
    effectivenessMultiplier: 1.2, // Muy efectivo contra proyectiles
    alternativeEffect: 'explosion' // Crea explosión adicional
  },

  lightningRay: {
    canDestroy: true,
    effectivenessMultiplier: 1.1,
    alternativeEffect: 'chain' // Cadena eléctricas a otros proyectiles
  },

  plasmaField: {
    canDestroy: true,
    effectivenessMultiplier: 1.3, // Extremadamente efectivo
    alternativeEffect: 'absorption' // Absorbe y amplifica daño
  },

  alienDrone: {
    canDestroy: true,
    effectivenessMultiplier: 0.7, // Menos efectivo
    alternativeEffect: 'summon' // Invoca drones menores
  }
};
```

---

## TABLA DE REFERENCIA RÁPIDA

### Cronología de Boss por Nivel de Jugador

| Nivel | Evento | Notas |
|-------|--------|-------|
| 1 | Comienza juego | Solo Laser Cannon |
| 8 | ORBITAL GUARDIAN spawna | HP 200 |
| 9 | Posible derrota → Orbital Shield desbloqueado | |
| 14 | MISSILE TITAN spawna | HP 300, jugador con Shield |
| 15 | Posible derrota → Missile Launcher desbloqueado | |
| 20 | LIGHTNING NEXUS spawna | HP 450, jugador con Laser+Shield+Missile |
| 21 | Posible derrota → Lightning Ray desbloqueado | |
| 27 | PLASMA OVERLORD spawna | HP 600 |
| 29 | Posible derrota → Plasma Field desbloqueado | |
| 35 | SWARM MOTHER spawna | HP 800, boss final |
| 38+ | Fin de carrera (jugador puede continuar o retirarse) | Todos los bosses desbloqueados |

### Estadísticas de Ataque Base

| Boss | Patrón Principal | Proyectiles | Velocidad | Cooldown |
|------|-----------------|------------|----------|----------|
| Orbital Guardian | Corner Barrage | 16 | 350px/s | 2.5s |
| Missile Titan | Homing Missiles | 1-2 | 200px/s | 3.5s |
| Lightning Nexus | Telegraph Rays | 4-12 | N/A (rayos) | 2.0s |
| Plasma Overlord | Plasma Rings | 0 (anillo) | Expand 250px/s | 1.5s |
| Swarm Mother | Hive Spawn | 10 enemigos | N/A (spawn) | 3.0s |

### Recompensas por Derrota Inicial

| Boss | XP | Niveles | Score | Arma Desbloqueada |
|------|----|----|-------|------------|
| Orbital Guardian | 100 | +1 | 5,000 | Orbital Shield |
| Missile Titan | 150 | +1 | 10,000 | Missile Launcher |
| Lightning Nexus | 250 | +1 | 20,000 | Lightning Ray |
| Plasma Overlord | 400 | +2 | 40,000 | Plasma Field |
| Swarm Mother | 600 | +3 | 100,000 | Alien Drone |

### Parámetros del Arena

```
Radio Exterior: 600px
Radio Interior: 550px
Grosor Anillo: 50px
Velocidad de Confinamiento: Inmediato (sin daño)
Movimiento del Jefe: Oscilación ±50px
Rotación del Jefe: 60°/segundo
```

### Variables Globales de Boss

```javascript
// En el código, referencia así:
BOSS_SYSTEM = {
  ARENA_OUTER_RADIUS: 600,
  ARENA_INNER_RADIUS: 550,
  BOSS_ROTATION_SPEED: 1.5, // degrees per frame
  BOSS_OSCILLATION_RANGE: 50,
  BOSS_OSCILLATION_SPEED: 0.03,

  HP_BASE: [200, 300, 450, 600, 800],

  SPAWN_LEVELS: [8, 14, 20, 27, 35],

  WEAPON_UNLOCK_MAP: {
    0: 'orbitalShield',
    1: 'missileLauncher',
    2: 'lightningRay',
    3: 'plasmaField',
    4: 'alienDrone'
  },

  PROJECTILE_BASE_STATS: {
    speed: 400,
    damage: 1,
    hp: 3,
    radius: 8,
    lifetime: 15
  }
};
```

---

## REFERENCIAS DE IMPLEMENTACIÓN

### Archivos Sugeridos de Código

1. **boss_system.js** - Sistema base de jefes
   - Clase Boss base
   - Sistemas de HP, fases, patrones
   - Arena logic

2. **boss_attacks.js** - Patrones de ataque
   - Implementación de los 4 patrones base
   - Factory de patrones

3. **boss_types.js** - Definiciones específicas de jefes
   - Clase para cada uno de los 5 bosses
   - Habilidades únicas

4. **boss_hud.js** - Elementos visuales
   - Barra de salud
   - Pantalla de victoria
   - Efectos visuales

5. **progression_system.js** - Meta-progresión
   - localStorage management
   - Desbloqueo de armas
   - Pool de mejoras dinámico

---

**Fin del Documento de Diseño**

*Este documento proporciona especificaciones completas para implementar el sistema de jefes de Stellar Swarm. Todos los números, colores y mecánicas están optimizados para balance y diversión.*
