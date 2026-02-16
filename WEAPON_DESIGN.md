# Diseño de Nuevas Armas — Stellar Swarm

## Referencia de Balance Actual

| Arma | Coste | DPS Base | Tipo |
|------|-------|----------|------|
| Laser Cannon | 0 | ~28.6 (10/0.35s) | Proyectil directo |
| Missiles | 150 | ~66 burst cada 1.5s | Homing AoE |
| Orbital Shield | 150 | ~48 (16×3 orbs, cd 150ms) | Contacto pasivo |
| Lightning | 200 | ~40 (8×6 cadena/1.2s) | Cadena multi-target |
| Plasma Field | 200 | ~8 (4/0.5s tick) | Aura continua |
| Alien Drone | 250 | ~15 por kill | On-kill spawn |

---

## 1. RAYO DE FUSIÓN (Arma Principal Alternativa)

**Color:** `#00FF88` (Verde esmeralda)
**Icono:** `beam`
**Coste:** 0 cristales (arma inicial alternativa al Laser Cannon)
**Descripción:** *"Rayo continuo que se fija al enemigo más cercano"*

### Concepto

El Rayo de Fusión es la alternativa al Laser Cannon como arma inicial. Al comenzar una partida, el jugador elige entre las dos. **Si eliges el Rayo de Fusión, el Laser Cannon NO aparece en esa partida** (ni en el pool de upgrades, ni en level-up), y viceversa.

La diferencia fundamental con el Laser: el Laser dispara proyectiles individuales con auto-aim en cono. El Rayo es un **canal continuo** que se engancha al enemigo más cercano y hace daño por segundo mientras mantenga conexión. Es más consistente en DPS pero single-target por defecto.

### Stats Base

| Stat | Valor | Notas |
|------|-------|-------|
| DPS base | 26 dmg/sec | Comparable al láser (~28.6 DPS) |
| Tick rate | 0.1s (10 ticks/sec) | Daño por tick: 2.6 |
| Rango máximo | 350px | Más corto que laser (700px), compensado por ser continuo |
| Lock-on automático | Sí | Se fija al enemigo más cercano dentro del rango |
| Ancho del rayo | 6px | Visual + colisión |
| Ramp-up | No (base) | Se añade en upgrade |

### DPS Comparativo con Laser

- **Laser base:** 10 dmg × (1/0.35s) = 28.6 DPS → pero requiere que el enemigo esté en cono de 30° y falla si se mueve rápido
- **Rayo base:** 26 DPS → siempre conecta si hay enemigo en rango, pero rango más corto y solo 1 target
- **Trade-off:** El Rayo es más fiable en DPS (no falla) pero obliga a jugar más agresivo por el rango corto

### Rama 1: Rayo Bifurcado *(Multi-target)*

| Nivel | Descripción | Efecto |
|-------|-------------|--------|
| 1 | El rayo se divide: 2 objetivos simultáneos | `beamTargets: 2` |
| 2 | 3 objetivos simultáneos | `beamTargets: 3` |
| 3 | 4 objetivos, daño no se divide | `beamTargets: 4` |

**Mecánica:** El rayo principal se conecta al más cercano. Los rayos secundarios buscan al siguiente enemigo más cercano que NO sea el target principal. Cada rayo hace daño completo (no se divide). Los rayos secundarios son visualmente más finos (3px vs 6px) y con color atenuado.

**DPS potencial Nivel 3:** 26 × 4 = 104 DPS distribuido (excelente contra grupos)

### Rama 2: Intensificación *(Ramp-up damage)*

| Nivel | Descripción | Efecto |
|-------|-------------|--------|
| 1 | Daño aumenta +15%/sec en mismo objetivo (max +60%) | `beamRampRate: 0.15, beamRampMax: 0.60` |
| 2 | Ramp +20%/sec, max +100% | `beamRampRate: 0.20, beamRampMax: 1.00` |
| 3 | Ramp +25%/sec, max +150%, el objetivo arde (DoT 5/sec por 2s al desconectar) | `beamRampRate: 0.25, beamRampMax: 1.50, beamBurnDamage: 5, beamBurnDuration: 2.0` |

**Mecánica:** Un contador `beamRampCurrent` se incrementa por `beamRampRate * deltaTime` cada segundo que el rayo está conectado al **mismo** objetivo. Si el objetivo muere o el rayo cambia de target, el contador se resetea a 0. El daño real es `baseDPS * (1 + beamRampCurrent)`.

**DPS potencial Nivel 3:** Tras 6 segundos en mismo target = 26 × 2.5 = 65 DPS (ideal para jefes/tanques)

### Rama 3: Rayo Expansivo *(Rango + área)*

| Nivel | Descripción | Efecto |
|-------|-------------|--------|
| 1 | Rango: 350 → 475px | `beamRange: 475` |
| 2 | Rango: 475 → 600px, ancho: 6 → 14px (daña enemigos en la línea) | `beamRange: 600, beamWidth: 14` |
| 3 | Rango: 700px, ancho: 22px, atraviesa enemigos hasta fin de rango | `beamRange: 700, beamWidth: 22, beamPierce: true` |

**Mecánica Nivel 3:** El rayo no termina en el primer enemigo sino que atraviesa todo en su camino hasta 700px. Usa detección de colisión con rectángulo rotado (22px de ancho × largo del rayo). Esto transforma el arma de single-target a line-AoE.

**DPS potencial Nivel 3:** 26 DPS a cada enemigo en la línea de 700px × 22px

### Evolución: SIPHON NEXUS

**Descripción:** *"Los enemigos muertos por el rayo explotan y conectan rayos temporales (2s) a 3 enemigos cercanos dentro de 200px. Los rayos secundarios hacen 50% del DPS base."*

**Mecánica:** Al morir un enemigo por daño del rayo, se crea un efecto `siphonBurst` en su posición que durante 2 segundos mantiene rayos a los 3 enemigos más cercanos haciendo 13 DPS cada uno. Visualmente: rayos verde esmeralda parpadeantes con partículas.

---

## 2. MINAS GRAVITACIONALES

**Color:** `#FF6EC7` (Rosa neón / magenta)
**Icono:** `mine`
**Coste:** 200 cristales
**Descripción:** *"Despliega minas que atraen y detonan enemigos"*

### Concepto

El jugador deja minas flotantes en su estela a intervalos regulares. Cada mina tiene un radio de **atracción gravitacional** que jala enemigos cercanos hacia ella, y después de un breve arming delay, detona al contacto con un enemigo o al expirar su timer.

Nicho que cubre: **control de zona y trampas**. Ningún arma actual cubre posicionamiento estratégico de daño. El Plasma Field es centrado en el jugador. Las minas permiten cubrir zonas por donde el jugador ya pasó, creando "campos minados" que los enemigos perseguidores deben atravesar.

### Stats Base

| Stat | Valor | Notas |
|------|-------|-------|
| Intervalo de despliegue | 2.5 seg | Una mina cada 2.5s automáticamente |
| Minas simultáneas | 3 máx | Las más antiguas desaparecen si hay más |
| Vida de la mina | 8 seg | Explota sola al expirar |
| Arming delay | 0.8 seg | No detona antes de este tiempo |
| Radio de atracción | 120px | Fuerza de 80 px/sec hacia el centro |
| Radio de explosión | 90px | AoE de la detonación |
| Daño de explosión | 25 | Daño completo en todo el radio |
| Tamaño visual de mina | 16px | Esfera pulsante |

### DPS Teórico

Con 3 minas en 8 segundos de vida, rotando cada 2.5s:
- Escenario: grupo de enemigos pasa por zona → 3 minas × 25 dmg = 75 daño burst
- Es menos DPS constante que otras armas, pero su valor está en el **control posicional** y el daño burst en área

### Rama 1: Campo Minado *(Cantidad)*

| Nivel | Descripción | Efecto |
|-------|-------------|--------|
| 1 | Intervalo: 2.5s → 2.0s, máximo: 3 → 4 | `mineInterval: 2.0, mineMaxCount: 4` |
| 2 | Intervalo: 2.0s → 1.5s, máximo: 4 → 6 | `mineInterval: 1.5, mineMaxCount: 6` |
| 3 | Intervalo: 1.5s → 1.0s, máximo: 6 → 9 | `mineInterval: 1.0, mineMaxCount: 9` |

**DPS potencial Nivel 3:** 9 minas activas, burst máximo de 225 dmg si detonan todas. Cubre una zona enorme detrás del jugador.

### Rama 2: Pozo Gravitatorio *(Control)*

| Nivel | Descripción | Efecto |
|-------|-------------|--------|
| 1 | Radio atracción: 120 → 170px, fuerza: 80 → 120 px/sec | `mineGravityRadius: 170, mineGravityForce: 120` |
| 2 | Radio: 170 → 230px, fuerza: 160 px/sec, enemigos ralentizados 20% al salir | `mineGravityRadius: 230, mineGravityForce: 160, mineExitSlow: 0.20` |
| 3 | Radio: 300px, fuerza: 220 px/sec, enemigos no pueden escapar si están a <80px del centro | `mineGravityRadius: 300, mineGravityForce: 220, mineEventHorizon: 80` |

**Mecánica del "Event Horizon" (Nivel 3):** Los enemigos dentro de 80px del centro de la mina reciben una fuerza de atracción de 500 px/sec, haciendo prácticamente imposible escapar. Esto crea mini-trampas letales.

### Rama 3: Carga Volátil *(Daño)*

| Nivel | Descripción | Efecto |
|-------|-------------|--------|
| 1 | Daño explosión: 25 → 38, radio: 90 → 110px | `mineDamage: 38, mineExplosionRadius: 110` |
| 2 | Daño: 50, radio: 130px, deja campo de radiación (8 dmg/sec, 3s, radio 70px) | `mineDamage: 50, mineExplosionRadius: 130, mineRadiationDPS: 8, mineRadiationDuration: 3.0` |
| 3 | Daño: 65, radio: 150px, radiación mejorada (14 dmg/sec, 4s, radio 100px), detonación encadenada (minas a <200px detonan en cascada) | `mineDamage: 65, mineExplosionRadius: 150, mineRadiationDPS: 14, mineRadiationDuration: 4.0, mineChainDetonate: 200` |

**Mecánica de detonación encadenada (Nivel 3):** Cuando una mina explota, todas las minas dentro de 200px también detonan con 0.15s de delay entre cada una (efecto dominó visual). Esto convierte campos densos de minas en bombas devastadoras.

### Evolución: AGUJERO NEGRO

**Descripción:** *"Cada 12s, una mina se convierte en un Agujero Negro: radio de atracción de 500px, fuerza irresistible, dura 4s. Los enemigos absorbidos son destruidos instantáneamente al llegar al centro."*

**Mecánica:** Un timer global de 12s convierte la mina más reciente en un Agujero Negro con efecto visual masivo (disco de acreción giratorio, distorsión visual). Fuerza de atracción: 400 px/sec en todo el radio, 800 px/sec a <100px. Los enemigos que tocan el centro (20px) mueren instantáneamente ignorando HP (excepto jefes: reciben 200 daño). Dura 4 segundos.

---

## 3. TORRETA CENTINELA

**Color:** `#FF8C00` (Naranja intenso)
**Icono:** `turret`
**Coste:** 250 cristales
**Descripción:** *"Despliega torretas estáticas con fuego automático"*

### Concepto

El jugador despliega torretas fijas que disparan automáticamente al enemigo más cercano dentro de su radio. Las torretas persisten un tiempo limitado y luego se desactivan. A diferencia de los drones (que son temporales y kamikaze), las torretas son estructuras estáticas que crean zonas de control permanente.

Nicho que cubre: **control territorial estático**. Mientras que las minas son reactivas (explotan una vez), las torretas proporcionan DPS sostenido en un punto fijo. Permiten al jugador crear "bases" temporales o flanquear a los enemigos dejando torretas en puntos estratégicos.

### Stats Base

| Stat | Valor | Notas |
|------|-------|-------|
| Cooldown de despliegue | 8 seg | Una torreta cada 8s |
| Torretas simultáneas | 1 | La más antigua desaparece al desplegar una nueva (base) |
| Vida de la torreta | 10 seg | Desaparece tras este tiempo |
| HP de la torreta | 0 (invulnerable) | Base: no puede ser destruida |
| Fire rate de torreta | 0.5 seg | 2 disparos/sec |
| Daño por disparo | 8 | Proyectil auto-aim |
| Rango de la torreta | 300px | Radio de detección y disparo |
| Velocidad del proyectil | 1500 px/sec | Más lento que laser del jugador |
| Tamaño visual | 24px | Base hexagonal con cañón rotatorio |

### DPS Teórico

- 1 torreta: 8 dmg × 2 tiros/sec = **16 DPS** durante 10s
- DPS total por ciclo (10s activa, 8s cooldown): 16 × (10/18) = ~8.9 DPS efectivo
- Bajo, pero es daño **posicional** y se suma a las demás armas activas

### Rama 1: Producción en Serie *(Cantidad + cadencia de despliegue)*

| Nivel | Descripción | Efecto |
|-------|-------------|--------|
| 1 | Max torretas: 1 → 2, cooldown: 8s → 7s | `turretMaxCount: 2, turretCooldown: 7` |
| 2 | Max torretas: 2 → 3, cooldown: 7s → 5.5s | `turretMaxCount: 3, turretCooldown: 5.5` |
| 3 | Max torretas: 3 → 5, cooldown: 5.5s → 4s, vida: 10s → 12s | `turretMaxCount: 5, turretCooldown: 4, turretLifetime: 12` |

**DPS potencial Nivel 3:** 5 torretas × 16 DPS = **80 DPS** estático distribuido en el mapa. Con 4s de cooldown y 12s de vida, siempre hay 3-5 torretas activas.

### Rama 2: Fortaleza *(Defensa + rango)*

| Nivel | Descripción | Efecto |
|-------|-------------|--------|
| 1 | Rango: 300 → 400px, vida: 10s → 14s | `turretRange: 400, turretLifetime: 14` |
| 2 | Rango: 400 → 500px, la torreta tiene escudo (absorbe 30 dmg de enemigos que la tocan) | `turretRange: 500, turretShieldHP: 30` |
| 3 | Rango: 600px, escudo: 60 HP que se regenera (5 HP/sec), torreta ralentiza enemigos en su rango 15% | `turretRange: 600, turretShieldHP: 60, turretShieldRegen: 5, turretSlow: 0.15` |

**Mecánica del escudo:** Los enemigos que colisionan con la torreta hacen daño al escudo en vez de destruirla. Si el escudo llega a 0, la torreta es destruida prematuramente. Visualmente: anillo brillante alrededor de la torreta que disminuye.

### Rama 3: Armamento Pesado *(Daño + tipos de disparo)*

| Nivel | Descripción | Efecto |
|-------|-------------|--------|
| 1 | Daño: 8 → 13, fire rate: 0.5s → 0.4s | `turretDamage: 13, turretFireRate: 0.4` |
| 2 | Daño: 18, fire rate: 0.35s, balas penetran 1 enemigo | `turretDamage: 18, turretFireRate: 0.35, turretPierce: 1` |
| 3 | Daño: 24, fire rate: 0.3s, cada 5to disparo es un mini-cohete (15 dmg explosión, 60px radio) | `turretDamage: 24, turretFireRate: 0.3, turretRocketEvery: 5, turretRocketDamage: 15, turretRocketRadius: 60` |

**DPS potencial Nivel 3:** 24 × (1/0.3) = **80 DPS** por torreta, más 15 dmg AoE cada 1.5s. Una sola torreta supera al laser base.

### Evolución: ESTACIÓN DE COMBATE

**Descripción:** *"Si hay 2+ torretas activas, se conectan con rayos láser entre sí. Los rayos hacen 12 dmg/sec a cualquier enemigo que los cruce. Cada torreta dispara 30% más rápido por cada otra torreta en rango (500px)."*

**Mecánica:**
- **Rayos conectores:** Se trazan líneas (rayos láser naranjas) entre cada par de torretas que estén a <500px entre sí. Cualquier enemigo cuya hitbox cruce la línea recibe 12 DPS.
- **Sinergia:** Cada torreta obtiene +30% fire rate por cada otra torreta dentro de 500px. Con 3 torretas cercanas = +60% fire rate cada una.
- **Visual:** Red de líneas naranjas pulsantes entre torretas, con partículas a lo largo de las líneas.
- Con 5 torretas nivel 3 en formación: 10 líneas de conexión × 12 DPS + 5 torretas con +120% fire rate = devastación total.

---

## Resumen Comparativo

| Arma | Coste | DPS Base | DPS Max (Nivel 3) | Nicho |
|------|-------|----------|---------------------|-------|
| Rayo de Fusión | 0 | 26 single | 104 multi / 65 ramp | Arma principal alternativa |
| Minas Gravitacionales | 200 | ~10 eff. | 225 burst + radiación | Control de zona, trampas |
| Torreta Centinela | 250 | ~9 eff. | 400+ (5 torretas conectadas) | Control territorial estático |

---

## Notas de Implementación

### Sistema de Selección de Arma Inicial

Para implementar el Rayo de Fusión como alternativa al Laser, se necesita:

1. **Pantalla de selección pre-partida:** Tras pulsar "PLAY", mostrar una pantalla con las dos opciones de arma inicial (Laser Cannon / Rayo de Fusión) si ambas están desbloqueadas.

2. **Variable `startingWeapon`:** Reemplazar el hardcoded `activeWeapons = ['laser_cannon']` por `activeWeapons = [startingWeapon]` donde `startingWeapon` es la elección del jugador.

3. **Exclusión mutua:** En el pool de upgrades de level-up, filtrar el arma no elegida para que nunca aparezca como opción.

4. **Desbloqueo:** El Rayo de Fusión debería desbloquearse gratis después de completar X runs o alcanzar cierto score, para que el jugador primero aprenda con el Laser.

### Estructura de Configuración

```javascript
// Ejemplo de cómo encajaría en WEAPONS:
'fusion_beam': {
    name: 'FUSION BEAM',
    color: '#00FF88',
    icon: 'beam',
    description: 'Continuous lock-on beam',
    shopPrice: 0,
    isStartingWeapon: true,  // Nueva propiedad
    excludes: 'laser_cannon', // Excluye al otro starter
    branches: {
        'forked_beam': { ... },
        'intensification': { ... },
        'expanding_ray': { ... }
    },
    evolution: { name: 'SIPHON NEXUS', ... }
}
```

### Pool de Objetos Necesarios

| Pool | Capacidad | Para |
|------|-----------|------|
| `mine` | 20 | Minas gravitacionales |
| `turret` | 10 | Torretas centinela |
| `turretBullet` | 100 | Proyectiles de torreta |
| `radiationField` | 10 | Campos de radiación (upgrade minas) |
| `siphonBeam` | 10 | Rayos siphon (evolución beam) |
