# STELLAR SWARM - PROMPTS DE IMPLEMENTACIÓN PARA CLAUDE CODE

## Estrategia de Implementación

**IMPORTANTE:** Implementar por fases, testeando cada una antes de avanzar. El juego es un single-file HTML (~5000 líneas). Todo el código va en `index.html`.

**Orden recomendado:**
1. Meta-progresión (localStorage + modificar pool de upgrades)
2. Pantalla principal con galería de armas
3. Sistema de arena (ring)
4. Boss base (mecánicas compartidas + health bar HUD)
5. Boss 1: Orbital Guardian
6. Boss 2: Missile Titan
7. Boss 3: Lightning Nexus
8. Boss 4: Plasma Overlord
9. Boss 5: Swarm Mother
10. Pantalla de victoria y celebración
11. Balanceo y polish

---

## FASE 1: META-PROGRESIÓN (localStorage)

### Prompt 1.1 - Sistema de persistencia

```
En el archivo index.html de Stellar Swarm, necesito implementar un sistema de meta-progresión persistente con localStorage.

CONTEXTO ACTUAL:
- El juego solo guarda high score en localStorage con key 'StellarSwarm_highscore_v1'
- Las armas son: laser_cannon (siempre disponible), orbital_shield, missile_launcher, lightning_ray, plasma_field, alien_drone
- Cada run empieza con unlockedSkills = ['arsenal', 'laser_cannon']
- El SKILL_TREE ya tiene todas las armas definidas con sus prereqs

IMPLEMENTAR:

1. Crear constante PROGRESSION_SAVE_KEY = 'StellarSwarm_progression_v1'

2. Crear estructura de datos para progresión persistente:
   - unlockedWeapons: objeto con cada arma como key y boolean (laser_cannon siempre true)
   - bossDefeats: contador de derrotas por cada boss
   - stats: totalBossDefeats, totalRuns

3. Funciones loadProgression() y saveProgression(data):
   - Con try-catch para seguridad
   - Si no existe, crear con valores por defecto

4. Función getUnlockedWeaponsForRun() que retorna array de weapon IDs desbloqueados permanentemente

5. MODIFICAR la función que genera las opciones de upgrade (generateUpgradeOptions o equivalente):
   - Al inicio de cada run, el pool de skills disponibles debe incluir SOLO las armas desbloqueadas permanentemente + laser
   - Las armas NO desbloqueadas NO deben aparecer como opción al subir de nivel
   - Sus upgrades tampoco (si no tienes missile_launcher, no puedes ver homing_guidance)

6. MODIFICAR initGame/startGame para cargar la progresión al iniciar cada run

NO tocar el sistema de bosses aún. Solo el sistema de persistencia y el filtrado de upgrades.
Testear que: en un run nuevo, si solo laser_cannon está desbloqueado, solo aparecen upgrades de laser.
```

---

## FASE 2: PANTALLA PRINCIPAL - GALERÍA DE ARMAS

### Prompt 2.1 - Arsenal en menú principal

```
En index.html de Stellar Swarm, necesito añadir una galería de armas ("ARSENAL") en la pantalla del menú principal (renderMenu).

CONTEXTO:
- renderMenu() dibuja el título, high score y controles en el canvas
- Ya existe loadProgression() que retorna las armas desbloqueadas
- Canvas: 1920x1080 desktop, 720x1280 mobile
- Colores del juego: cyan #7FDBFF, gold #FFDD57, red #FF6B6B, purple #9F7AEA, lime #39FF14

IMPLEMENTAR:

1. En renderMenu(), debajo del prompt "Press ENTER to Start", añadir sección "ARSENAL":

2. Mostrar un grid de 6 tarjetas de armas (3 columnas x 2 filas, o 2x3 en mobile):
   - Cada tarjeta: ~200x120px en desktop, ~140x100px en mobile
   - Contenido de cada tarjeta:
     a) Icono del arma (usar drawSkillIcon si existe, o dibujar forma simple)
     b) Nombre del arma
     c) Si está desbloqueada: borde brillante con color del arma, checkmark verde
     d) Si está bloqueada: borde gris opaco, icono de candado, texto "BOSS LVL X"

3. Las 6 armas y sus datos:
   - Laser Cannon: siempre desbloqueada, color #FF6B5B
   - Orbital Shield: Boss Lvl 8, color #00DFFF
   - Missile Launcher: Boss Lvl 14, color #FFD93D
   - Lightning Ray: Boss Lvl 20, color #9F7AEA
   - Plasma Field: Boss Lvl 27, color #7FDBFF
   - Alien Drone: Boss Lvl 35, color #39FF14

4. Animación sutil: las armas desbloqueadas pulsan levemente su brillo

5. Título "ARSENAL" encima del grid, con estilo cyan como el resto del HUD

6. Versión mobile: el grid debe ser responsive (2 columnas en vez de 3)

Usar los mismos estilos visuales que el HUD existente (fuentes, colores, bordes).
```

---

## FASE 3: SISTEMA DE ARENA (RING)

### Prompt 3.1 - Arena circular

```
En index.html de Stellar Swarm, necesito implementar el sistema de arena circular (ring) para las peleas de boss.

CONTEXTO:
- El mundo es 11520x6480, canvas 1920x1080
- El jugador se mueve con velocidad, tiene vx/vy
- La cámara sigue al jugador (camera.x, camera.y)
- Existe worldToScreen() para convertir coordenadas
- El jugador tiene player.x, player.y, player.vx, player.vy

IMPLEMENTAR:

1. Variables de estado del arena:
   let arenaActive = false;
   let arenaCenter = { x: 0, y: 0 };
   const ARENA_RADIUS = 600;

2. Función activateArena(centerX, centerY):
   - arenaActive = true
   - arenaCenter = { x: centerX, y: centerY }
   - Eliminar TODOS los enemigos activos SIN dar XP (recorrer array enemies y limpiar sin llamar killEnemy)
   - Limpiar enemyBullets array
   - Pausar el sistema de spawn de enemigos y waves

3. Función deactivateArena():
   - arenaActive = false
   - Reanudar spawning de enemigos y waves

4. Función enforceArenaBoundary() - llamar en update() cuando arenaActive:
   - Calcular distancia del jugador al centro del arena
   - Si distancia > ARENA_RADIUS - 30 (margen para el jugador):
     * Empujar al jugador hacia dentro (reposicionar en el borde)
     * Invertir velocidad parcialmente (player.vx *= -0.3, player.vy *= -0.3)
     * Disparar efecto visual de flash rojo en el borde

5. Función renderArena() - llamar en render() cuando arenaActive:
   - Dibujar anillo circular en world-space (usar camera transform)
   - Anillo exterior: strokeStyle con gradiente cyan (#00CCFF) a azul (#0066FF)
   - Grosor: 8px con glow (shadowBlur)
   - Líneas radiales cada 15° (como marcas de energía)
   - Efecto pulsante: opacidad oscila entre 0.6 y 1.0
   - FUERA del anillo: oscurecer todo con un overlay oscuro semitransparente

6. Integrar en update():
   if (arenaActive) { enforceArenaBoundary(); }

7. Integrar en render():
   if (arenaActive) { renderArena(); }

Testear activando manualmente el arena (un cheat code como 'arena_test') para verificar que el confinamiento funciona.
```

---

## FASE 4: BOSS BASE (Mecánicas compartidas)

### Prompt 4.1 - Estructura de boss y spawn

```
En index.html de Stellar Swarm, necesito implementar la estructura base del sistema de bosses.

CONTEXTO:
- Ya existe: arenaActive, activateArena(), enforceArenaBoundary(), renderArena()
- Ya existe: loadProgression(), saveProgression(), sistema de meta-progresión
- Enemies usan object pool (pools.enemy), tienen x, y, hp, maxHp, type
- Bullets tienen x, y, vx, vy, life, damage, hp (para ser destruibles)
- El jugador sube de nivel con addXP() y playerLevel indica el nivel actual
- Existen: triggerFlash(), triggerSlowmo(), spawnFloatingText()

IMPLEMENTAR:

1. Constantes de bosses:
   const BOSS_SPAWN_LEVELS = [8, 14, 20, 27, 35];
   const BOSS_TYPES = ['orbitalGuardian', 'missileTitan', 'lightningNexus', 'plasmaOverlord', 'swarmMother'];
   const BOSS_NAMES = ['ORBITAL GUARDIAN', 'MISSILE TITAN', 'LIGHTNING NEXUS', 'PLASMA OVERLORD', 'SWARM MOTHER'];
   const BOSS_COLORS = ['#00DFFF', '#FFD93D', '#9F7AEA', '#FF6600', '#39FF14'];
   const BOSS_BASE_HP = [200, 300, 450, 600, 800];
   const BOSS_WEAPON_UNLOCK = ['orbital_shield', 'missile_launcher', 'lightning_ray', 'plasma_field', 'alien_drone'];

2. Variables de estado del boss:
   let currentBoss = null;
   let bossProjectiles = [];  // Pool separado para proyectiles del boss
   let bossPhase = 1;
   let bossPatternTimer = 0;
   let bossDefeated = false;  // Para esta run
   let bossesDefeatedThisRun = [];  // IDs de bosses derrotados en esta run

3. Función calculateBossHP(bossIndex):
   - HP base del boss
   - Multiplicador por nivel: 1 + (playerLevel - BOSS_SPAWN_LEVELS[bossIndex]) * 0.15
   - Multiplicador por armas desbloqueadas: 1 + (numWeapons * 0.20)
   - Retornar Math.floor(resultado)

4. Función spawnBoss(bossIndex):
   - activateArena(player.x, player.y)
   - Calcular HP con calculateBossHP()
   - currentBoss = {
       type: BOSS_TYPES[bossIndex],
       index: bossIndex,
       name: BOSS_NAMES[bossIndex],
       color: BOSS_COLORS[bossIndex],
       x: arenaCenter.x, y: arenaCenter.y,
       hp: calculatedHP, maxHp: calculatedHP,
       phase: 1, rotation: 0,
       patternTimer: 0, currentPattern: null,
       oscillationTimer: 0,
       size: 80 + bossIndex * 15,  // Más grandes progresivamente
       weaponUnlock: BOSS_WEAPON_UNLOCK[bossIndex],
       combatStartTime: gameTime,
       sides: bossIndex % 2 === 0 ? 8 : 6  // Alternar octágono/hexágono
     }
   - triggerFlash('#FF0000', 0.3, 300)
   - triggerSlowmo(500)
   - spawnFloatingText con "⚠ BOSS INCOMING ⚠"

5. Función checkBossSpawn() - llamar en update():
   - Para cada BOSS_SPAWN_LEVELS, si playerLevel alcanza ese nivel:
     * Verificar que ese boss no fue ya derrotado en esta run
     * spawnBoss(index)

6. Función updateBoss(deltaTime) - llamar en update() si currentBoss:
   - Actualizar oscillation (movimiento suave ±50px con sin/cos)
   - Actualizar rotation (boss.rotation += 60 * deltaTime en grados)
   - Verificar cambio de fase: si hp/maxHp <= 0.5 y phase === 1 → transición
   - Actualizar patternTimer
   - Si hp <= 0: onBossDefeated()

7. Función damageBoss(amount):
   - currentBoss.hp -= amount
   - Efecto visual: flash blanco breve
   - Si hp <= maxHp * 0.5 y phase === 1: triggerPhaseTransition()

8. Función onBossDefeated():
   - Guardar en progresión
   - Mostrar pantalla de victoria (implementar después)
   - deactivateArena()
   - currentBoss = null
   - Dar recompensas (XP/niveles)

9. Función renderBoss() - llamar en render() si currentBoss:
   - Dibujar polígono (hexágono u octágono) con boss.sides lados
   - Color: boss.color con glow
   - Centro brillante pulsante
   - Tamaño: boss.size px
   - Rotación animada

10. MODIFICAR checkCollisions():
    - Bullets del jugador vs currentBoss (si colisionan, damageBoss)
    - bossProjectiles vs player (misma lógica que enemyBullets vs player)
    - El boss NO colisiona por contacto directo con el jugador (solo sus ataques)

11. Función renderBossHealthBar() - llamar en renderUI():
    - Barra centrada arriba, 400px ancho, 40px alto
    - Gradiente verde→amarillo en fase 1, rojo→naranja en fase 2
    - Nombre del boss arriba
    - Indicador de fase
    - Animación suave (displayHP se interpola hacia hp real)

12. Añadir cheat code 'spawn_boss' que llame spawnBoss(0) para testing.

NO implementar los patrones de ataque específicos aún. Solo la estructura base, el spawn, renderizado, colisiones y health bar.
```

### Prompt 4.2 - Proyectiles del boss (base)

```
En index.html de Stellar Swarm, necesito implementar el sistema de proyectiles base de los bosses.

CONTEXTO:
- currentBoss ya existe con x, y, rotation, phase, patternTimer
- bossProjectiles[] array ya existe
- Los bullets del jugador ya pueden destruir cosas
- El jugador tiene shield y hp

IMPLEMENTAR:

1. Constantes de proyectiles de boss:
   const BOSS_PROJ_SPEED = 350;
   const BOSS_PROJ_DAMAGE = 1;  // Daño al shield o HP del jugador
   const BOSS_PROJ_HP = 3;      // Se pueden destruir con armas del jugador
   const BOSS_PROJ_RADIUS = 8;
   const BOSS_PROJ_LIFETIME = 12;

2. Función spawnBossProjectile(x, y, angle, speed, options):
   - Crear objeto: { x, y, vx: cos*speed, vy: sin*speed, hp: BOSS_PROJ_HP,
     damage: BOSS_PROJ_DAMAGE, radius: BOSS_PROJ_RADIUS, life: BOSS_PROJ_LIFETIME,
     color: options.color || currentBoss.color, type: options.type || 'normal' }
   - Push a bossProjectiles

3. Función updateBossProjectiles(deltaTime):
   - Mover cada proyectil (x += vx * dt, y += vy * dt)
   - Decrementar life
   - Eliminar si life <= 0 o si está fuera del arena (distancia al centro > ARENA_RADIUS + 100)

4. Función renderBossProjectiles():
   - Dibujar cada proyectil como círculo brillante con glow
   - Color del boss
   - Trail corto (3-4 posiciones previas con fade)

5. COLISIONES - en checkCollisions():
   a) bossProjectiles vs player:
      - Si colisionan: quitar shield o HP al jugador
      - Efecto de impacto, knockback
   b) bullets del jugador vs bossProjectiles:
      - Si colisionan: reducir HP del bossProjectile
      - Si bossProjectile.hp <= 0: destruir con efecto de partículas
      - Bullet del jugador también se destruye (salvo piercing)
   c) orbitals vs bossProjectiles: destruir al contacto
   d) lightning vs bossProjectiles: puede encadenar y hacer daño
   e) plasma aura vs bossProjectiles: destruir si están en rango

6. 4 Patrones de ataque compartidos (funciones que llama updateBoss):

   a) bossPattern_SpiralOutward():
      - Cada 0.15s, disparar un proyectil desde el boss en ángulo rotativo
      - El ángulo incrementa 20° por disparo, creando espiral
      - Duración: 3 segundos, luego cooldown 2s

   b) bossPattern_CornerBarrage():
      - Disparar desde cada esquina/vértice del boss simultáneamente
      - 8 ráfagas separadas 0.5s cada una
      - Cada ráfaga: 1 proyectil por esquina dirección outward

   c) bossPattern_RingWave():
      - Un anillo de 24 proyectiles disparados simultáneamente en todas direcciones
      - Todos a la misma velocidad, formando un anillo expansivo

   d) bossPattern_TargetedBurst():
      - 5 proyectiles disparados hacia la posición actual del jugador
      - Con spread de ±15° entre ellos
      - Repetir 3 veces con 0.8s entre ráfagas

7. Sistema de selección de patrones en updateBoss():
   - patternTimer cuenta hacia atrás
   - Cuando llega a 0: elegir siguiente patrón de una secuencia predefinida
   - Fase 1: cooldown entre patrones = 2.5s
   - Fase 2: cooldown entre patrones = 1.5s, velocidad proyectiles +40%

Testear con spawn_boss cheat y verificar que los 4 patrones funcionan.
```

---

## FASE 5: BOSS 1 - ORBITAL GUARDIAN

### Prompt 5.1

```
En index.html de Stellar Swarm, necesito implementar el primer boss: ORBITAL GUARDIAN.

CONTEXTO:
- El sistema base de bosses ya funciona: currentBoss, spawnBoss(), renderBoss(), health bar, arena
- Los 4 patrones base de proyectiles ya están implementados
- Este boss aparece en nivel 8, desbloquea orbital_shield, HP base 200, color #00DFFF

IMPLEMENTAR:

1. Habilidad única: ORBITAL SHIELD DANCE
   - El boss tiene 2 anillos de esferas orbitando:
     * Anillo interior: 3 esferas, radio 120px del centro, girando clockwise a 2 rad/s
     * Anillo exterior: 3 esferas, radio 180px, girando counter-clockwise a 1.3 rad/s
   - Cada esfera: radio 15px, HP 15, colores variados (cian, magenta, amarillo, etc.)
   - Mientras haya esferas activas: boss recibe solo 30% del daño (70% reducción)
   - Esferas pueden ser destruidas por armas del jugador
   - Las esferas se regeneran 8 segundos después de la última destruida
   - Las esferas TAMBIÉN dañan al jugador si las toca (como los orbitals del player)

2. Habilidad única: SHIELD PROJECTION BARRAGE
   - 3 oleadas de 16 proyectiles diamante, separadas 0.6s
   - Proyectiles más lentos (280 px/s) pero más HP (5)
   - Cada oleada rotada 22.5° respecto a la anterior

3. Secuencia de ataque Fase 1 (100%-50% HP):
   - Esferas orbitan pasivamente TODO el tiempo
   - Patrón: SpiralOutward → pausa 3s → ShieldProjectionBarrage → pausa 3s → CornerBarrage → pausa 3s → repetir

4. Secuencia de ataque Fase 2 (<50% HP):
   - Esferas orbitan 1.5x más rápido
   - Patrón: CornerBarrage(8 esquinas, doble) → pausa 1.5s → ShieldProjectionBarrage(4 oleadas) → pausa 1.5s → RingWave → repetir

5. Renderizado específico:
   - Octágono cyan (#00DFFF) con glow
   - Centro blanco pulsante
   - Esferas con brillo y trail circular
   - Líneas de energía conectando esferas al boss (como rayos finos)

6. Transición de fase (al llegar a 50%):
   - Flash blanco de pantalla (0.3s)
   - Boss gira 720° en 1s (spin rápido)
   - Emite un RingWave de "rabia"
   - Color se torna más intenso

Integrar con la lógica de checkBossSpawn() para que este boss aparezca al nivel 8.
```

---

## FASE 6: BOSS 2 - MISSILE TITAN

### Prompt 6.1

```
En index.html de Stellar Swarm, implementar el segundo boss: MISSILE TITAN.

CONTEXTO:
- Sistema de bosses funcional con Boss 1 ya implementado
- Aparece en nivel 14, desbloquea missile_launcher, HP base 300, color #FFD93D
- El jugador probablemente tiene Laser + Orbital Shield en este punto

IMPLEMENTAR:

1. Habilidad única: HOMING MISSILE BARRAGE
   - Cada 3.5s dispara 1 misil enorme (Fase 2: 2 misiles simultáneos)
   - Misil: radio 20px, HP 25, velocidad 200px/s, giro máximo 45°/s
   - El misil persigue al jugador con steering behavior:
     * Calcular ángulo deseado hacia jugador
     * Girar gradualmente (maxTurnRate * deltaTime)
     * Acelerar en dirección de su rotación
   - Si el misil es destruido: EXPLOTA creando 12 proyectiles normales en círculo
   - Si toca al jugador: 3 puntos de daño (mucho)
   - Trail de humo/fuego detrás del misil (partículas rojas/naranjas)
   - Visualmente MUY grande y amenazante

2. Habilidad única: BARRAGE CANNON
   - 4 cañones activos (Fase 1) / 8 cañones (Fase 2)
   - Ráfagas de 3 proyectiles por cañón cada 0.2s
   - Duración: 2.5s (Fase 1) / 3.5s (Fase 2)

3. Secuencia Fase 1:
   CornerBarrage(4) → pausa 2s → HomingMissile(1) → pausa 3s → BarrageCannon(4) → pausa 2s → RingWave → repetir

4. Secuencia Fase 2:
   CornerBarrage(8, doble velocidad) → pausa 1s → HomingMissile(2) → pausa 2s → BarrageCannon(8) → pausa 1s → RingWave+CornerBarrage simultáneo → repetir

5. Renderizado:
   - Hexágono grande gris metálico (#808080) con acentos dorados (#FFD93D)
   - 8 puntos de cañón visibles en el perímetro
   - Líneas de "recarga" que parpadean antes de disparar misiles
   - Efecto de vapor/humo al disparar

6. Transición fase 2: pantalla tiembla fuerte, boss emite onda expansiva
```

---

## FASE 7: BOSS 3 - LIGHTNING NEXUS

### Prompt 7.1

```
En index.html de Stellar Swarm, implementar el tercer boss: LIGHTNING NEXUS.

Aparece en nivel 20, desbloquea lightning_ray, HP base 450, color #9F7AEA.

IMPLEMENTAR:

1. Habilidad única: TELEGRAPH LIGHTNING STRIKE
   - Sistema de 3 fases por ataque:
     a) TELEGRAPH (1.5s): líneas finas semitransparentes parpadean, mostrando dónde caerá el rayo
     b) FIRE (0.5s): las líneas se convierten en rayos gruesos brillantes que DAÑAN
     c) COOLDOWN (1.0s): los rayos desaparecen

   - Patrones de rayos (rotar entre ellos):
     * 4 rayos cardinales (arriba, abajo, izq, der)
     * 4 rayos diagonales
     * 8 rayos (cardinales + diagonales simultáneos)
     * Rayos que rotan durante el telegraph (empiezan en una posición, se mueven a otra)

   - Detección de colisión del rayo:
     * Usar line-vs-circle collision (rayo es línea gruesa, jugador es círculo)
     * Rayo va desde el boss hasta el borde del arena
     * Ancho del rayo: 25px (hitbox), visual puede ser más ancho con glow

   - Visual del telegraph: línea amarilla semitransparente (alpha 0.3) parpadeando
   - Visual del fire: línea amarilla brillante con glow blanco, efecto zigzag eléctrico

2. Habilidad única: ELECTRICAL CHAIN RINGS
   - Anillos de energía que se expanden desde el boss
   - 2 anillos por oleada (Fase 1), 3 por oleada (Fase 2)
   - Cada anillo: velocidad de expansión 250px/s, máximo ARENA_RADIUS
   - Grosor del anillo: 8px
   - Si toca al jugador: 1 daño
   - Visual: anillo cian (#00FFFF) con partículas eléctricas

3. Renderizado del boss:
   - Octágono púrpura (#9F7AEA) con arcos eléctricos entre vértices
   - Los arcos son líneas zigzag animadas (cambiar posiciones random cada frame)
   - Aura parpadeante alrededor del boss
   - En Fase 2: más arcos, más brillante, partículas constantes

4. Secuencia Fase 1:
   TelegraphStrike(4 cardinales) → pausa 2s → ChainRings(2) → pausa 2s → TelegraphStrike(diagonales) → pausa 2s → CornerBarrage → repetir

5. Secuencia Fase 2:
   TelegraphStrike(8 rayos) → pausa 1s → ChainRings(3) → pausa 1s → TelegraphStrike(rotatorios) → SpiralOutward → repetir
```

---

## FASE 8: BOSS 4 - PLASMA OVERLORD

### Prompt 8.1

```
En index.html de Stellar Swarm, implementar el cuarto boss: PLASMA OVERLORD.

Aparece en nivel 27, desbloquea plasma_field, HP base 600, color #FF6600.

IMPLEMENTAR:

1. Habilidad única: TELEGRAPH PLASMA RINGS
   - Similar al telegraph del Lightning Nexus pero con FORMAS CIRCULARES (donuts)
   - Sistema de 3 fases:
     a) TELEGRAPH (1.2s): anillos/donuts semitransparentes parpadean
     b) FIRE (0.7s): se convierten en zonas de plasma sólidas que DAÑAN
     c) COOLDOWN (0.8s): desaparecen

   - Patrones de donuts:
     * Un donut grande (radio 250px, grosor 40px) - zona segura dentro y fuera
     * 3 donuts concéntricos (radios 120, 250, 400) activándose con delay 0.3s cada uno
     * Donut que se EXPANDE desde radio 80 hasta 500 en 2.5s (el jugador debe mantenerse fuera o dentro)

   - Colisión: el jugador está dentro de la zona del donut si:
     * Su distancia al centro está entre innerRadius y outerRadius del donut

   - Visual telegraph: anillos naranja/rojo semitransparentes parpadeando
   - Visual fire: zonas de plasma brillante rojo-naranja con efecto de ondas

2. Habilidad única: DONUT ERUPTION
   - Cascada de 6 donuts disparados en secuencia rápida (0.25s entre cada uno)
   - Cada donut sucesivo es más grande que el anterior
   - Radios: 80, 120, 160, 200, 250, 300
   - Grosores: 40, 50, 60, 70, 80, 90
   - Todos se expanden hacia afuera a velocidades crecientes
   - El jugador debe encontrar huecos entre donuts

3. Renderizado:
   - Hexágono rojo (#FF0000) a naranja (#FF6600) con efecto de plasma
   - Centro: esfera amarilla pulsante
   - Ondas de calor constantes (distorsión visual simulada con líneas ondulantes)
   - Bordes afilados, aspecto agresivo
   - Los donuts de plasma tienen efecto de fuego interior

4. Secuencia Fase 1:
   PlasmaRing(1 donut) → pausa 3s → RingWave → pausa 2s → PlasmaRing(3 concéntricos) → pausa 3s → SpiralOutward → repetir

5. Secuencia Fase 2:
   PlasmaRing(espiral de 5 donuts) → pausa 1.5s → DonutEruption → pausa 2s → PlasmaRing(expandible) → CornerBarrage simultáneo → repetir
```

---

## FASE 9: BOSS 5 - SWARM MOTHER

### Prompt 9.1

```
En index.html de Stellar Swarm, implementar el quinto y último boss: SWARM MOTHER.

Aparece en nivel 35, desbloquea alien_drone, HP base 800, color #39FF14.

IMPORTANTE: Este es el boss final. Debe ser el más épico y desafiante.

IMPLEMENTAR:

1. Habilidad única: HIVE SPAWN
   - Cada 3s (Fase 1) / 2s (Fase 2), spawna enemigos:

   Desde el centro (boss):
   - 5 Scouts + 3 Kamikazes + 1 Tank (Fase 1)
   - 8 Scouts + 5 Kamikazes + 2 Spinners + 2 Tanks (Fase 2)
   - Se dispersan explosivamente desde el centro

   Desde el borde del ring (4 puntos equidistantes):
   - 4 enemigos por punto (van hacia el centro)
   - Tipo: mix de Scouts y Kamikazes

   TODOS los enemigos spawneados tienen 50% de HP normal (son más débiles)
   TODOS dan XP normal al morir (a diferencia de los que se limpian al iniciar boss)

2. Habilidad única: BROOD EXPLOSION
   - Se activa cuando hay 8+ enemigos en el campo
   - Cooldown: 8s (Fase 1), 4s (Fase 2)
   - Efecto: onda expansiva verde desde el boss (radio 500px)
   - Daño al jugador: 2 (si está en rango)
   - NO mata a los enemigos, los empuja hacia afuera (knockback 500px/s)
   - Visual: círculo verde expandiéndose con partículas

3. Efecto pasivo: SPORE CLOUD
   - Mientras el boss vive, emitir partículas verdes flotantes constantemente
   - Solo visual, no dañan
   - Crean atmósfera de "nido alienígena"

4. Renderizado:
   - Octágono grande (140px) verde oscuro (#1A5C1A) con bordes neón (#39FF14)
   - Patrón de hexágonos internos (colmena)
   - Membranas palpitantes (bordes que se mueven ligeramente)
   - Centro: cámara de cría roja pulsante
   - Tentáculos/tendriles que se extienden y retraen del boss
   - En Fase 2: todo más brillante y activo

5. Secuencia Fase 1:
   HiveSpawn(centro+borde) → pausa 1s → RingWave → pausa 2s → HiveSpawn → pausa 1s → SpiralOutward → BroodExplosion(si 8+) → repetir

6. Secuencia Fase 2:
   HiveSpawn(doble) → CornerBarrage → pausa 1s → HiveSpawn → BroodExplosion → SpiralOutward+TargetedBurst simultáneo → repetir

7. IMPORTANTE para rendimiento:
   - Los enemigos spawneados por el boss cuentan hacia MAX_ENEMIES
   - Si hay demasiados, dejar de spawnear (pero el boss sigue atacando con proyectiles)
   - Los drones del jugador (si tiene alien_drone) son especialmente útiles aquí
```

---

## FASE 10: PANTALLA DE VICTORIA Y CELEBRACIÓN

### Prompt 10.1

```
En index.html de Stellar Swarm, implementar la pantalla de victoria al derrotar un boss.

CONTEXTO:
- onBossDefeated() ya se llama cuando boss.hp <= 0
- saveProgression() guarda armas desbloqueadas
- currentBoss tiene: type, name, weaponUnlock, combatStartTime, maxHp

IMPLEMENTAR:

1. Variable de estado:
   let bossVictoryScreen = null;
   let bossVictoryTimer = 0;
   const BOSS_VICTORY_DURATION = 4.5;

2. Modificar onBossDefeated() para:
   - Determinar si es primera derrota o repetida
   - Si primera derrota:
     * Desbloquear arma en progresión (saveProgression)
     * Recompensas según boss: XP + niveles (ver tabla del diseño)
     * bossVictoryScreen = 'weaponUnlock'
   - Si repetida:
     * Dar 2 niveles automáticos (o más según boss)
     * XP bonus grande
     * bossVictoryScreen = 'bossDefeated'
   - Congelar el juego (gameState sigue 'playing' pero no se actualizan enemies ni player)
   - Explosión épica de partículas en posición del boss
   - Flash blanco de pantalla

3. Renderizar pantalla de victoria (en renderUI, encima de todo):

   Si bossVictoryScreen === 'weaponUnlock':
   - Fondo oscuro con fade-in (alpha crece de 0 a 0.8)
   - Texto grande dorado: "¡ARMA DESBLOQUEADA!" (zoom-in animado)
   - Nombre del arma en color del arma
   - Icono del arma (dibujar forma representativa)
   - Subtexto: "Disponible en futuras partidas"
   - Estadísticas: tiempo de combate, HP del boss
   - Partículas doradas volando por la pantalla

   Si bossVictoryScreen === 'bossDefeated':
   - Fondo oscuro
   - Texto verde: "¡BOSS DERROTADO!"
   - "+X NIVELES" en amarillo grande
   - "+Y XP" debajo
   - Más discreto que el de arma nueva

4. Después de BOSS_VICTORY_DURATION (4.5s):
   - Desvanecer la pantalla
   - Descongelar el juego
   - deactivateArena()
   - currentBoss = null
   - bossVictoryScreen = null
   - Reanudar gameplay normal

5. Input durante victoria:
   - El jugador puede presionar cualquier tecla o tap para saltar la animación
   - Mínimo 1.5s antes de poder saltar

6. Efectos adicionales:
   - Screen shake al derrotar boss
   - Slowmo dramático (0.3x) durante 1 segundo al matar boss
   - El boss "explota" con muchas partículas de su color
```

---

## FASE 11: BALANCEO Y POLISH

### Prompt 11.1

```
En index.html de Stellar Swarm, necesito hacer un pase de balance y polish del sistema de bosses.

REVISAR Y AJUSTAR:

1. BALANCE DE HP:
   - Testear cada boss con solo las armas que el jugador debería tener en ese punto
   - Boss 1 (Lv8, solo Laser): debería durar ~90-120 segundos
   - Boss 2 (Lv14, Laser+Shield): ~120-150 segundos
   - Boss 3 (Lv20, 3 armas): ~150-180 segundos
   - Boss 4 (Lv27, 4 armas): ~180-210 segundos
   - Boss 5 (Lv35, 5 armas): ~210-270 segundos
   - Ajustar BOSS_BASE_HP si es necesario

2. TRANSICIONES SUAVES:
   - Al activar arena: fade-in del anillo (no aparecer de golpe)
   - Al desactivar arena: fade-out
   - Entrada del boss: que "materialice" (escala de 0 a 1 en 1 segundo)
   - Muerte del boss: explosión gradual, no desaparecer instantáneamente

3. FEEDBACK VISUAL:
   - Al dañar al boss: flash blanco brevísimo + número de daño flotante
   - Los proyectiles del boss destruidos: partículas del color del boss
   - Cuando quedan pocos HP (<20%): boss parpadea rápidamente
   - Escudo orbital del Boss 1: efecto visual cuando absorbe daño

4. INDICADOR DE BOSS INCOMING:
   - 3 segundos ANTES de que aparezca el boss (al alcanzar el nivel):
     * Texto grande parpadeando "⚠ WARNING ⚠" en rojo
     * Pantalla se oscurece ligeramente
     * Sirena visual (bordes del canvas parpadean rojo)
   - Luego: flash, arena aparece, boss se materializa

5. INTEGRACIÓN CON GAME OVER:
   - Si mueres durante boss fight: mostrar progreso del boss
     * "BOSS: ORBITAL GUARDIAN - 45% remaining"
   - Añadir al game over screen si murió en boss

6. CHEAT CODES para testing:
   - 'spawn_boss_1' a 'spawn_boss_5': spawnear boss específico
   - 'kill_boss': matar boss actual instantáneamente
   - 'unlock_all_weapons': desbloquear todas las armas
   - 'reset_progression': resetear meta-progresión
   - 'god_mode': inmunidad a daño durante boss

7. RENDIMIENTO:
   - Los bossProjectiles deben usar object pooling (crear pool similar a bullets)
   - Limitar partículas durante boss fight si hay baja FPS
   - Los enemigos del Swarm Mother deben respetar MAX_ENEMIES
```

---

## NOTAS IMPORTANTES PARA CLAUDE CODE

### Tips generales:
- **NO crear archivos nuevos.** Todo va en index.html.
- **Leer TODO el código primero** antes de hacer cambios. Es un archivo grande (~5000 líneas).
- **Preservar la estructura existente.** No refactorizar lo que ya funciona.
- **Testear cada fase** antes de pasar a la siguiente. Usar los cheat codes.
- **Los nombres de variables** deben ser consistentes con lo existente (camelCase).
- **Mantener rendimiento:** usar object pooling para proyectiles del boss.

### Orden de dependencias:
```
Fase 1 (meta-progresión) → no depende de nada
Fase 2 (galería de armas) → depende de Fase 1
Fase 3 (arena) → no depende de nada
Fase 4 (boss base) → depende de Fase 3
Fases 5-9 (bosses individuales) → dependen de Fase 4
Fase 10 (victoria) → depende de Fase 4
Fase 11 (polish) → depende de todo
```

### Fases que se pueden hacer en paralelo:
- Fase 1 + Fase 3 (meta-progresión + arena)
- Fases 5-9 son secuenciales pero los bosses 2-5 siguen el mismo patrón que el 1

### Tiempo estimado por fase:
- Fase 1: ~20-30 min
- Fase 2: ~15-20 min
- Fase 3: ~15-20 min
- Fase 4: ~45-60 min (la más compleja)
- Fases 5-9: ~20-30 min cada una
- Fase 10: ~20-30 min
- Fase 11: ~30-45 min
- **Total estimado: ~5-7 horas de desarrollo**
