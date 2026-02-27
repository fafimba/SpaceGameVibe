# Prompts de Rebalanceo para Claude Code

Usar estos prompts uno por uno en Claude Code dentro de este proyecto.

---

## Prompt 1: Curva de XP y Nivelado

```
Rebalancear la curva de XP/nivelado del juego. Ahora mismo se sube de nivel demasiado rápido al principio y demasiado lento después.

**Valores actuales** (L582-583):
- XP_PER_LEVEL_BASE = 25
- XP_PER_LEVEL_GROWTH = 1.4

**XP por kill** (en killEnemy ~L4446):
- SCOUT = 1 XP, SPINNER = 2 XP, TANK = 3 XP

La fórmula actual es: xpToNextLevel = XP_PER_LEVEL_BASE * (XP_PER_LEVEL_GROWTH ^ (level-1))
Esto da: Lv2=25, Lv3=35, Lv4=49, Lv5=69, Lv6=96, Lv7=134...

**Cambios necesarios:**
1. Subir XP_PER_LEVEL_BASE a 40 (primeros niveles más lentos)
2. Bajar XP_PER_LEVEL_GROWTH a 1.22 (curva más suave, no se dispara tanto en niveles altos)
3. Subir el XP de los enemigos más fuertes para compensar en late-game:
   - SCOUT = 1, KAMIKAZE = 2, SPINNER = 3, TANK = 5, ALIEN = 0 (ya se divide en tanks)

Esto da: Lv2=40, Lv3=49, Lv4=60, Lv5=73, Lv6=89, Lv7=108, Lv10=175, Lv15=388
Progresión mucho más suave y sostenida.
```

---

## Prompt 2: Escalado de Vida y Dificultad de Enemigos

```
Rebalancear el escalado de vida de los enemigos y hacer que el juego se sienta progresivamente más difícil. Ahora mismo los enemigos no escalan lo suficiente.

**Valores actuales:**
- HP base: SCOUT=4, KAMIKAZE=4, SPINNER=4, TANK=12, ALIEN=60
- Escalado HP en spawnEnemy (L4239): +40% por nivel del jugador
- Escalado HP en spawnWave (L3964): +25% por nivel (¡inconsistente y más bajo!)

**Cambios necesarios:**

1. Subir la vida base de los enemigos:
   - SCOUT: 4 → 6
   - KAMIKAZE: 4 → 5
   - SPINNER: 4 → 8
   - TANK: 12 → 25
   - ALIEN: 60 → 120

2. Unificar y mejorar el escalado de HP. Cambiar AMBAS funciones (spawnEnemy y spawnWave) para usar la misma fórmula exponencial en vez de lineal:
   ```
   const hpMultiplier = Math.pow(1.12, playerLevel - 1) * diffMult.enemyHP;
   ```
   Esto da un escalado compuesto: nivel 5 = x1.57, nivel 10 = x2.77, nivel 15 = x4.89, nivel 20 = x8.61
   Mucho mejor que el lineal actual donde nivel 10 solo era x4.6

3. También escalar la velocidad de los enemigos ligeramente con el tiempo (no con nivel). En updateEnemies (L4265), después de calcular `speed`, aplicar un multiplicador temporal:
   ```
   const timeSpeedBonus = 1 + Math.min(gameTime / 600, 0.3); // +30% max a los 10 min
   const finalSpeed = speed * timeSpeedBonus;
   ```
   Usar finalSpeed en vez de speed para el cálculo de targetVx/targetVy.
```

---

## Prompt 3: Progresión de Tipos de Enemigos (más Tanks, luego Aliens)

```
Cambiar la progresión de tipos de enemigos para que se sienta más escalada. Ahora solo salen scouts y algún kamikaze/tank suelto. Necesito que progresivamente salgan más tanks y eventualmente aliens.

**Código actual** en spawnEnemy() (~L4199-4207):
```js
let type = 'SCOUT';
const r = Math.random();
if (gameTime > 90 && r < 0.08) {
    type = 'TANK';
} else if (waveNumber >= 10 && r < 0.20) {
    type = 'KAMIKAZE';
}
```

**Reemplazar** toda la lógica de selección de tipo por esta progresión basada en tiempo de juego (gameTime en segundos):

```js
let type = 'SCOUT';
const r = Math.random();
const t = gameTime;

if (t < 30) {
    // Primeros 30s: solo scouts
    type = 'SCOUT';
} else if (t < 90) {
    // 30s-90s: aparecen kamikazes (15%)
    if (r < 0.15) type = 'KAMIKAZE';
} else if (t < 180) {
    // 90s-3min: kamikazes (20%) + tanks empiezan (8%)
    if (r < 0.08) type = 'TANK';
    else if (r < 0.28) type = 'KAMIKAZE';
} else if (t < 300) {
    // 3min-5min: más tanks (15%) + kamikazes (20%) + spinners (10%)
    if (r < 0.15) type = 'TANK';
    else if (r < 0.35) type = 'KAMIKAZE';
    else if (r < 0.45) type = 'SPINNER';
} else if (t < 480) {
    // 5min-8min: tanks dominan (22%) + spinners (12%) + primeros aliens (3%)
    if (r < 0.03) type = 'ALIEN';
    else if (r < 0.25) type = 'TANK';
    else if (r < 0.37) type = 'SPINNER';
    else if (r < 0.52) type = 'KAMIKAZE';
} else {
    // 8min+: late game, aliens crecen, tanks abundan
    if (r < 0.07) type = 'ALIEN';
    else if (r < 0.30) type = 'TANK';
    else if (r < 0.42) type = 'SPINNER';
    else if (r < 0.57) type = 'KAMIKAZE';
}
```

También hay que aplicar esta misma tabla a las waves (spawnWave). Actualmente las waves SOLO generan SCOUTS (L4185: `enemy.type = 'SCOUT'`). Cambiar para que las waves también usen tipos mixtos basados en gameTime. En vez de asignar siempre 'SCOUT', usar la misma lógica de selección de tipo para cada enemigo de la wave, y calcular el HP según el tipo real:

```js
// Dentro del loop de spawnPositions en spawnWave:
const enemyType = getSpawnType(); // extraer la lógica de arriba a una función reutilizable
const typeConfig = ENEMY_TYPES[enemyType];
const scaledHp = Math.ceil(typeConfig.hp * hpMultiplier);
enemy.type = enemyType;
enemy.hp = scaledHp;
enemy.maxHp = scaledHp;
```
```

---

## Prompt 4: Sistema de Spawn Estilo Vampire Survivors

```
Rediseñar el sistema de spawn para que sea más estilo Vampire Survivors: enemigos saliendo alrededor del jugador en grupos densos y unidos, siempre fuera del campo visual.

**Problema actual:**
- spawnEnemy() (spawns individuales) genera enemigos sueltos uno a uno
- spawnWave() usa 11 patrones elaborados (arc, side, pincer, circle, etc.) que se sienten artificiales
- El jugador no se siente "rodeado" como en Vampire Survivors

**Cambios en spawnWave():**

1. Eliminar todos los patrones actuales (arc, side, pincer, circle, line, cluster, spiral, corners, rush, scatter, v_formation). Reemplazar por un sistema de spawn circular con clusters:

```js
function spawnWave() {
    if (!player) return;

    waveNumber++;

    // Wave alert (mantener)
    waveAlertActive = true;
    waveAlertTimer = 0;
    waveAlertNumber = waveNumber;
    waveAlertSubtitle = 'HOSTILES INCOMING';

    // Contar enemigos a spawnear - escala con tiempo
    const baseCount = 20 + Math.floor(gameTime / 10) * 3; // Crece con el tiempo
    const count = Math.min(baseCount, 80);

    // Generar 3-6 clusters alrededor del jugador
    const numClusters = 3 + Math.floor(Math.random() * 4); // 3-6 clusters
    const enemiesPerCluster = Math.floor(count / numClusters);

    const spawnPositions = [];
    const spawnTypes = [];

    // Distancia de spawn: justo fuera de la pantalla (960 = mitad del viewport)
    const minSpawnDist = 1000;
    const maxSpawnDist = 1200;

    for (let c = 0; c < numClusters; c++) {
        // Ángulo aleatorio para cada cluster
        const clusterAngle = Math.random() * Math.PI * 2;
        const clusterDist = minSpawnDist + Math.random() * (maxSpawnDist - minSpawnDist);

        // Centro del cluster
        const cx = player.x + Math.cos(clusterAngle) * clusterDist;
        const cy = player.y + Math.sin(clusterAngle) * clusterDist;

        // Enemigos en el cluster, agrupados (spread pequeño = grupo compacto)
        for (let i = 0; i < enemiesPerCluster; i++) {
            const offsetAngle = Math.random() * Math.PI * 2;
            const offsetDist = Math.random() * 60; // Radio del cluster: 60px (compacto)

            spawnPositions.push({
                x: cx + Math.cos(offsetAngle) * offsetDist,
                y: cy + Math.sin(offsetAngle) * offsetDist
            });
            spawnTypes.push(getSpawnType());
        }
    }

    // ... spawn loop usando spawnPositions y spawnTypes
}
```

2. Eliminar WAVE_PATTERNS, getWaveSubtitle() y todo lo relacionado con patrones.

3. Para spawnEnemy() (spawns individuales continuos), cambiar para que también genere mini-grupos de 3-5 enemigos en vez de 1 solo:

```js
function spawnEnemy() {
    if (!player) return;

    const groupSize = 3 + Math.floor(Math.random() * 3); // 3-5 enemigos
    const angle = Math.random() * Math.PI * 2;
    const spawnDistance = CANVAS_WIDTH / 2 + ENEMY_SPAWN_OFFSET_MIN + Math.random() * ENEMY_SPAWN_OFFSET_RANGE;

    const cx = player.x + Math.cos(angle) * spawnDistance;
    const cy = player.y + Math.sin(angle) * spawnDistance;

    for (let i = 0; i < groupSize; i++) {
        const type = getSpawnType();
        const config = ENEMY_TYPES[type];

        // Posición dentro del grupo
        const offsetAngle = Math.random() * Math.PI * 2;
        const offsetDist = Math.random() * 40;
        const x = cx + Math.cos(offsetAngle) * offsetDist;
        const y = cy + Math.sin(offsetAngle) * offsetDist;

        const angleToPlayer = Math.atan2(player.y - y, player.x - x);
        const hpMultiplier = Math.pow(1.12, playerLevel - 1) * getDiffMultipliers().enemyHP;
        const scaledHp = Math.ceil(config.hp * hpMultiplier);

        const enemy = pools.enemy.acquire();
        enemy.x = x; enemy.y = y;
        enemy.vx = Math.cos(angleToPlayer) * config.speed;
        enemy.vy = Math.sin(angleToPlayer) * config.speed;
        enemy.angle = angleToPlayer * 180 / Math.PI;
        enemy.type = type;
        enemy.hp = scaledHp; enemy.maxHp = scaledHp;
        enemy.fireTimer = config.fireRate || 0;
        enemy.burstCooldown = 0;
        enemy.spawnTime = gameTime;
        enemy.offScreenTime = 0;
        enemies.push(enemy);
    }
}
```

4. Ajustar INITIAL_SPAWN_INTERVAL a 0.8-1.2 (L512-513) ya que ahora cada spawn genera un grupo entero. Subir el intervalo base para compensar los grupos.
```

---

## Prompt 5: Comportamiento Kamikaze (Rápidos + Inmunes al Empuje)

```
Cambiar el comportamiento de los enemigos KAMIKAZE:

1. **Mucho más rápidos**: Cambiar la velocidad base del KAMIKAZE en ENEMY_TYPES (L506):
   - speed: 180 → 350
   - turnRate: 60 → 120 (también giran más rápido para ser más agresivos)

2. **Inmunes al empuje físico de otros enemigos**: En la sección de separación entre enemigos en updateEnemies() (~L4309-4332), los kamikazes no deben ser empujados por otros enemigos, pero SÍ deben empujar a los demás. Modificar la lógica así:

```js
// Separation from other enemies (staggered — half per frame)
if ((i + separationFrame) & 1) {
    const nearbyEnemies = spatialGrid.queryRadius(e.x, e.y, config.radius * 3);
    for (const other of nearbyEnemies) {
        if (other === e) continue;

        const sepDx = e.x - other.x;
        const sepDy = e.y - other.y;
        const sepDistSq = sepDx * sepDx + sepDy * sepDy;
        const minDist = config.radius + ENEMY_TYPES[other.type].radius + ENEMY_SEPARATION_PADDING;
        const minDistSq = minDist * minDist;

        if (sepDistSq < minDistSq && sepDistSq > 0) {
            const sepDist = Math.sqrt(sepDistSq);
            const push = (minDist - sepDist) * 0.5;
            const pushX = (sepDx / sepDist) * push;
            const pushY = (sepDy / sepDist) * push;

            // Kamikazes son inmunes al empuje pero empujan a otros
            if (e.type !== 'KAMIKAZE') {
                e.vx += pushX;
                e.vy += pushY;
            }
            if (other.type !== 'KAMIKAZE') {
                other.vx -= pushX;
                other.vy -= pushY;
            }
        }
    }
}
```

3. **Kamikazes empujan MÁS fuerte**: Cuando un kamikaze empuja a otro enemigo, el empuje debe ser más fuerte. Cambiar el factor de push para kamikazes:

```js
// Multiplicar el empuje si el que empuja es kamikaze
const pushMult = (e.type === 'KAMIKAZE') ? 2.5 : 1;
if (other.type !== 'KAMIKAZE') {
    other.vx -= pushX * pushMult;
    other.vy -= pushY * pushMult;
}
```

Esto hará que los kamikazes atraviesen las masas de scouts como "bulldozers", apartándolos sin frenar.
```

---

## Notas de Uso

- Ejecutar los prompts en orden (1→2→3→4→5)
- El prompt 3 introduce `getSpawnType()` que el prompt 4 también usa, así que 3 debe ir antes que 4
- Después de cada prompt, probar el juego abriendo index.html en el navegador
- Claude Code actualizará automáticamente el code-index según las reglas del CLAUDE.md
