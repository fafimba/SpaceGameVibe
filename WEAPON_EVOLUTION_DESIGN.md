# STELLAR SWARM - Diseño de Armas, Progresión y Meta-Progresión

**Fecha:** 2026-02-12
**Versión:** 1.0
**Estado:** En diseño

---

## RESUMEN

Este documento define el sistema completo de progresión de Stellar Swarm, reemplazando el sistema de bosses. Cubre tres capas: progresión in-run (armas y upgrades al subir de nivel), meta-progresión (moneda persistente y tienda entre runs), y sistema de dificultades (desbloqueo por puntuación).

**Principios de diseño:**
- Cada run se siente diferente gracias a la aleatoriedad del pool de upgrades
- Progresión meta da sensación de avance aunque mueras pronto
- El jugador nunca completa todas las mejoras en un solo run
- Sesiones de 3-8 minutos con poder creciente hasta el final

---

## 1. SISTEMA DE ARMAS Y UPGRADES IN-RUN

### 1.1 Mecánica General

Al subir de nivel, el jugador elige 1 de 3 opciones aleatorias del pool disponible. Las opciones pueden ser:
- Activar un arma nueva (si no la tiene activa en este run)
- Subir de nivel un upgrade de un arma que ya tiene activa

### 1.2 Estructura por Arma

Cada arma tiene:
- **Activación base** (1 nodo): Activa el arma con stats base
- **3 ramas de upgrade**, cada una con **3 niveles** (I, II, III)
- **1 evolución capstone**: Se desbloquea al maxear las 3 ramas (nivel III en todas)

Total por arma: 1 base + 9 upgrades + 1 evolución = 11 nodos
Total 6 armas: 66 nodos de armas

### 1.3 Cómo Aparecen en el Pool

- Solo aparecen armas que el jugador tiene desbloqueadas en la tienda (meta-progresión)
- Los upgrades de un arma solo aparecen si el arma está ACTIVA en el run actual
- Los niveles aparecen en orden (no puedes elegir Rapid Fire II sin tener Rapid Fire I)
- La evolución/capstone aparece automáticamente cuando se completan las 3 ramas a nivel III
- Si no quedan upgrades disponibles, aparecen recompensas de moneda persistente (+cristales)

---

## 2. DISEÑO DETALLADO POR ARMA

### 2.1 LASER CANNON (Siempre disponible)

**Color:** #FF6B5B (Coral/Rojo)
**Tipo:** Proyectil direccional
**Fantasía:** Cañón de energía preciso y versátil
**Base:** Auto-fire hacia el enemigo más cercano en cono frontal (60°, 700px). Daño: 10, Cadencia: 0.35s

#### Rama A: RAPID FIRE (Cadencia)
| Nivel | Efecto | Valor |
|-------|--------|-------|
| I | Reduce cadencia de disparo | 0.35s → 0.28s (-20%) |
| II | Reduce cadencia de disparo | 0.28s → 0.22s (-21%) |
| III | Reduce cadencia de disparo | 0.22s → 0.16s (-27%) |

#### Rama B: BEAM SPLITTER (Cantidad)
| Nivel | Efecto | Valor |
|-------|--------|-------|
| I | Dispara en cono de 3 proyectiles | 1 → 3 balas |
| II | Amplía el cono, 5 proyectiles | 3 → 5 balas, cono +15° |
| III | Cono amplio, 7 proyectiles | 5 → 7 balas, cono +15° |

> Nota: Siempre números impares para que el proyectil central impacte al enemigo apuntado.

#### Rama C: PIERCING LENS (Penetración + Daño)
| Nivel | Efecto | Valor |
|-------|--------|-------|
| I | Balas penetran 1 enemigo extra | Pierce: 1 → 2 enemigos |
| II | Aumenta daño base | Daño: 10 → 14 (+40%) |
| III | Penetración total + daño | Pierce: ilimitado, Daño: 14 → 18 |

#### EVOLUCIÓN: NOVA BEAM
**Requisito:** Rapid Fire III + Beam Splitter III + Piercing Lens III
**Efecto:** Cada 5 disparos, lanza un rayo cónico masivo que atraviesa todo y hace daño AoE en una línea. Daño: 40, Ancho del cono: 30°, Alcance: todo el viewport.

---

### 2.2 MISSILE LAUNCHER

**Color:** #FFD93D (Dorado)
**Tipo:** Proyectil homing
**Fantasía:** Arsenal de misiles inteligentes que buscan y destruyen
**Base:** Dispara 3 misiles homing cada 1.0s. Daño: 22 + explosión (30 daño, 120px radio). Rango detección: 600px
**Desbloqueo tienda:** 150 cristales

#### Rama A: BARRAGE (Cantidad de misiles)
| Nivel | Efecto | Valor |
|-------|--------|-------|
| I | Más misiles por ráfaga | 3 → 4 misiles |
| II | Más misiles por ráfaga | 4 → 5 misiles |
| III | Salva masiva | 5 → 7 misiles |

#### Rama B: CLUSTER PAYLOAD (Explosión)
| Nivel | Efecto | Valor |
|-------|--------|-------|
| I | Mayor radio de explosión | 120px → 160px (+33%) |
| II | Explosión genera 2 mini-misiles | Ricochet: 2 mini-misiles |
| III | Mayor daño de explosión y 3 mini-misiles | Explosión: 30 → 45, 3 mini-misiles |

#### Rama C: HEAVY PAYLOAD (Daño directo)
| Nivel | Efecto | Valor |
|-------|--------|-------|
| I | Más daño por impacto | 22 → 30 (+36%) |
| II | Más daño por impacto | 30 → 40 (+33%) |
| III | Daño máximo + chance de crítico | 40 → 50, +20% crit chance (×2 daño) |

> Nota: El crit chance es un sistema nuevo. Cuando un misil hace crit, su daño directo y de explosión se duplican. Efecto visual: explosión dorada. Este sistema de críticos podría extenderse a otras armas en el futuro.

#### EVOLUCIÓN: ARMAGEDDON PROTOCOL
**Requisito:** Barrage III + Cluster III + Heavy Payload III
**Efecto:** Cada 8 segundos, lanza un mega-misil que al impactar crea una explosión masiva (300px) y libera 10 mini-misiles homing en todas direcciones. Daño mega: 100.

---

### 2.3 ORBITAL SHIELD

**Color:** #00DFFF (Cian)
**Tipo:** Orbital / Protección
**Fantasía:** Escudo de energía viviente que te protege y destruye
**Base:** 3 orbes rotan alrededor del jugador (radio 130px). Daño por contacto: 16. Velocidad de rotación: constante
**Desbloqueo tienda:** 150 cristales

#### Rama A: ORBITAL EXPANSION (Cantidad)
| Nivel | Efecto | Valor |
|-------|--------|-------|
| I | Más orbes | 3 → 4 orbes |
| II | Más orbes | 4 → 5 orbes |
| III | Más orbes | 5 → 7 orbes |

#### Rama B: SHOCKWAVE (Tamaño + Knockback)
| Nivel | Efecto | Valor |
|-------|--------|-------|
| I | Orbes más grandes | Tamaño: +30% |
| II | Orbes más grandes + knockback | Tamaño: +60%, knockback leve |
| III | Orbes enormes + knockback fuerte | Tamaño: +100%, knockback fuerte |

#### Rama C: ENERGY ABSORPTION (Daño)
| Nivel | Efecto | Valor |
|-------|--------|-------|
| I | Más daño por contacto | 16 → 24 (+50%) |
| II | Más daño por contacto | 24 → 32 (+33%) |
| III | Daño alto + enemigos golpeados son ralentizados | 32 → 40, slow 25% durante 1s |

#### EVOLUCIÓN: SINGULARITY CORE
**Requisito:** Expansion III + Shockwave III + Absorption III
**Efecto:** Los orbes forman un campo gravitacional continuo. Enemigos cercanos son ralentizados un 40% y reciben daño pasivo constante (15/s). Al destruir un enemigo dentro del campo, emite un pulso que daña a los demás.

---

### 2.4 LIGHTNING RAY

**Color:** #9F7AEA (Púrpura)
**Tipo:** Chain / Multi-target
**Fantasía:** Tormenta eléctrica que salta de enemigo en enemigo
**Base:** Auto-disparo de rayo que encadena 6 rebotes entre enemigos. Daño: 8 por impacto. Cadencia: 1.2s. Rango detección: 225px, rango cadena: 200px
**Desbloqueo tienda:** 200 cristales

#### Rama A: CHAIN AMPLIFIER (Rebotes)
| Nivel | Efecto | Valor |
|-------|--------|-------|
| I | Más rebotes | 6 → 8 rebotes |
| II | Más rebotes | 8 → 10 rebotes |
| III | Cadena masiva | 10 → 14 rebotes |

#### Rama B: RAPID DISCHARGE (Cadencia)
| Nivel | Efecto | Valor |
|-------|--------|-------|
| I | Disparo más rápido | 1.2s → 1.0s |
| II | Disparo más rápido | 1.0s → 0.8s |
| III | Disparo muy rápido | 0.8s → 0.6s |

#### Rama C: EXTENDED ARC (Rango + Daño)
| Nivel | Efecto | Valor |
|-------|--------|-------|
| I | Mayor rango de detección y cadena | Detección: 225 → 300px, Cadena: 200 → 270px |
| II | Mayor daño por impacto | 8 → 12 (+50%) |
| III | Rango máximo + daño aumentado | Detección: 400px, Cadena: 350px, Daño: 12 → 16 |

#### EVOLUCIÓN: STORM NEXUS
**Requisito:** Chain III + Discharge III + Arc III
**Efecto:** Los rayos dejan un campo eléctrico residual entre los enemigos alcanzados durante 2 segundos. Enemigos que entren en la zona del campo reciben daño continuo (10/s) y están paralizados (stun) 0.5s al entrar.

---

### 2.5 PLASMA FIELD

**Color:** #7FDBFF (Cian claro)
**Tipo:** AoE / Aura
**Fantasía:** Campo de energía devastador que consume todo a tu alrededor
**Base:** Aura de daño alrededor del jugador. Radio: 100px. Daño: 8 por tick. Tick rate: cada 0.5s
**Desbloqueo tienda:** 200 cristales

#### Rama A: FIELD EXPANSION (Radio)
| Nivel | Efecto | Valor |
|-------|--------|-------|
| I | Mayor radio | 100px → 130px (+30%) |
| II | Mayor radio | 130px → 170px (+31%) |
| III | Campo enorme | 170px → 220px (+29%) |

#### Rama B: FIELD INTENSITY (Daño)
| Nivel | Efecto | Valor |
|-------|--------|-------|
| I | Más daño por tick | 8 → 12 (+50%) |
| II | Más daño por tick | 12 → 17 (+42%) |
| III | Daño alto + slow a enemigos | 17 → 24, slow 20% en zona |

#### Rama C: RAPID PULSE (Tick rate)
| Nivel | Efecto | Valor |
|-------|--------|-------|
| I | Ticks más frecuentes | 0.50s → 0.40s (-20%) |
| II | Ticks más frecuentes | 0.40s → 0.30s (-25%) |
| III | Pulso rápido | 0.30s → 0.22s (-27%) |

#### EVOLUCIÓN: ANNIHILATION SPHERE
**Requisito:** Expansion III + Intensity III + Pulse III
**Efecto:** El campo de plasma se vuelve visible como una esfera pulsante. Al matar un enemigo dentro del campo, crea una mini-explosión (60px) que hace 20 daño a los cercanos. Efecto chain: si la mini-explosión mata otro enemigo, se repite.

---

### 2.6 ALIEN DRONE

**Color:** #39FF14 (Lima/Verde)
**Tipo:** Summon / On-kill
**Fantasía:** Enjambre alienígena que crece con cada kill
**Base:** Al matar un enemigo, spawn 1 drone kamikaze que busca al enemigo más cercano (rango de búsqueda: 400px). Daño: 15. Lifetime: 1.5s. Velocidad: rápida
**Desbloqueo tienda:** 250 cristales

#### Rama A: DRONE SWARM (Cantidad)
| Nivel | Efecto | Valor |
|-------|--------|-------|
| I | Chance de spawnar drone extra por kill | 1 drone + 30% chance de 2º drone |
| II | Mayor chance de drone extra | 1 drone + 60% chance de 2º drone |
| III | Enjambre masivo | 2 drones siempre + 40% chance de 3º drone |

#### Rama B: DRONE POWER (Daño base)
| Nivel | Efecto | Valor |
|-------|--------|-------|
| I | Más daño de impacto | 15 → 22 (+47%) |
| II | Más daño + mayor rango de búsqueda | 22 → 30, Rango: 400 → 550px |
| III | Daño alto + velocidad aumentada | 30 → 40, Velocidad: +30% |

#### Rama C: VOLATILE CORE (Explosiones)
| Nivel | Efecto | Valor |
|-------|--------|-------|
| I | Chance de explotar al impactar | 30% chance, Explosión: 60px, 12 daño |
| II | Mayor chance y radio de explosión | 55% chance, Explosión: 80px, 18 daño |
| III | Explosiones frecuentes y potentes | 80% chance, Explosión: 100px, 25 daño |

> Nota: Las explosiones no son siempre 100% para mantener variabilidad. La rama premia invertir en ella para acercarse al máximo.

#### EVOLUCIÓN: HIVE MIND
**Requisito:** Swarm III + Power III + Volatile III
**Efecto:** Los drones ya no son kamikaze. Orbitan como satélites buscando enemigos, disparan mini-láseres (8 daño, 0.5s cadencia) y duran 5 segundos. Al expirar, explotan (100%, 100px, 25 daño). Máximo 8 drones activos simultáneos.

---

## 3. RESUMEN DEL POOL DE UPGRADES

> Las mejoras pasivas (HP, velocidad, etc.) se gestionan exclusivamente desde la tienda con moneda persistente (ver sección 5). No aparecen en el pool in-run.

| Categoría | Nodos |
|-----------|-------|
| Activaciones de arma (6) | 6 |
| Upgrades de arma (6 armas × 3 ramas × 3 niveles) | 54 |
| Evoluciones capstone (6 armas × 1) | 6 |
| **TOTAL** | **66** |

En un run típico (3-8 min), el jugador llega a nivel ~20-35. Con solo armas desbloqueadas en tienda disponibles, el pool real será menor (ej: con 3 armas = 33 nodos). Esto garantiza que el jugador siempre tenga opciones significativas sin completar todo en un solo run. A medida que desbloquea más armas, los runs ganan variedad.

### Comportamiento cuando no quedan upgrades

Si por alguna razón el pool se agota (runs muy largos en dificultad alta):
- Aparece opción de +50 cristales (moneda persistente)
- Aparece opción de HP recovery (curación completa)
- Aparece opción de buff temporal (daño ×1.5 durante 30s)

---

## 5. META-PROGRESIÓN: MONEDA PERSISTENTE Y TIENDA

### 5.1 Cristales (Moneda Persistente)

**Obtención durante runs:**
- Enemigos Tank siempre dropean 1 cristal al morir
- Resto de enemigos: 5% de probabilidad de dropear 1 cristal al morir
- Los cristales aparecen como pickup en el mundo (igual que los orbes de XP pero con color distinto)
- Al final del run, bonus de cristales = floor(kills / 50) + floor(puntuación / 1000)
- Multiplicador por dificultad: ×1.0 (Normal), ×1.5 (Difícil), ×2.0 (Extremo), ×3.0 (Pesadilla)

> Nota: El drop de cristales es bajo intencionalmente para no saturar la pantalla con más elementos. La mayor parte de cristales viene del bonus de final de run.

**Persistencia:** Se guardan en localStorage. Se acumulan entre runs independientemente de si mueres o no.

### 5.2 Tienda (Menú Principal)

#### Sección: Desbloqueo de Armas

| Arma | Precio | Disponible desde |
|------|--------|-----------------|
| Laser Cannon | GRATIS | Siempre |
| Orbital Shield | 150 cristales | Inicio |
| Missile Launcher | 150 cristales | Inicio |
| Lightning Ray | 200 cristales | Tras 1 arma comprada |
| Plasma Field | 200 cristales | Tras 2 armas compradas |
| Alien Drone | 250 cristales | Tras 3 armas compradas |

**Armas iniciales gratuitas para primera partida:** Laser Cannon + una segunda arma a elegir entre Orbital Shield o Missile Launcher (se ofrece al jugador en su primer run como "tutorial de selección"). Esto evita que las primeras partidas sean solo láser.

#### Sección: Mejoras Permanentes

Estas mejoras aplican en todos los runs. Cada una tiene 10 niveles con coste creciente.

| Mejora | Efecto por nivel | Coste Nivel 1 | Coste Nivel 10 | Total acumulado |
|--------|-----------------|---------------|----------------|-----------------|
| Power Core | +3% daño total | 50 | 410 | ~2,240 |
| Hull Plating | +5 HP máxima | 40 | 328 | ~1,790 |
| Engine Boost | +2% velocidad | 40 | 328 | ~1,790 |
| XP Amplifier | +5% XP ganada | 60 | 492 | ~2,690 |
| Crystal Attractor | +5% cristales ganados | 80 | 656 | ~3,580 |

> Nota: Se pueden añadir más mejoras permanentes en el futuro (armor, regeneración, etc.) según se expanda el juego. Por ahora se mantiene un set pequeño y funcional.

**Fórmula de coste:** `costeBase × (1 + (nivel - 1) × 0.8)`
Ejemplo Power Core: Nivel 1 = 50, Nivel 2 = 90, Nivel 3 = 130... Nivel 10 = 410

Esto crea un sumidero infinito de moneda que mantiene al jugador con objetivos entre runs incluso después de desbloquear todas las armas.

---

## 6. SISTEMA DE DIFICULTADES

### 6.1 Desbloqueo por Puntuación

| Dificultad | Puntuación requerida | Color de fondo | Multiplicadores |
|------------|---------------------|----------------|-----------------|
| **Normal** | 0 (default) | Azul oscuro (actual) | ×1.0 todo |
| **Difícil** | 5,000 pts | Púrpura oscuro | Enemigos: ×1.4 HP, ×1.2 velocidad, ×1.3 spawn rate |
| **Extremo** | 15,000 pts | Rojo oscuro | Enemigos: ×2.0 HP, ×1.4 velocidad, ×1.6 spawn rate |
| **Pesadilla** | 40,000 pts | Verde tóxico oscuro | Enemigos: ×3.0 HP, ×1.6 velocidad, ×2.0 spawn rate |

### 6.2 Beneficios de Dificultad Alta

- Multiplicador de cristales (ver sección 5.1)
- Multiplicador de XP: ×1.0 / ×1.2 / ×1.5 / ×2.0
- Multiplicador de puntuación: ×1.0 / ×1.5 / ×2.5 / ×4.0
- Records de puntuación separados por dificultad
- Indicador visual en el HUD (icono de dificultad)

### 6.3 Diseño de Dificultad

La idea es que las dificultades altas NO sean solo "más difícil" sino también "más rewarding". El jugador debería querer subir de dificultad porque:
1. Gana cristales más rápido → progresa más en la tienda
2. Gana XP más rápido → sube de nivel más rápido → builds más completas
3. La puntuación multiplicada alimenta el ego/leaderboard
4. Es un reto nuevo con las mismas mecánicas

---

## 7. FLUJO COMPLETO DEL JUGADOR

### Primera sesión (nuevo jugador)
1. Abre el juego → Menú principal
2. Solo tiene Laser Cannon. Se le ofrece elegir Orbital Shield o Missile Launcher gratis
3. Juega su primera partida con 2 armas en el pool
4. Muere → Ve cristales ganados → Ve menú con tienda
5. Puede comprar pequeñas mejoras permanentes o ahorrar para un arma nueva

### Jugador con 10+ runs
1. Tiene 4 armas desbloqueadas + varias mejoras permanentes
2. Cada run tiene builds muy variados según qué sale en los level-ups
3. Está ahorrando para Alien Drone (última arma)
4. Acaba de desbloquear dificultad Difícil → Intenta el reto

### Jugador veterano
1. Todas las armas + mejoras permanentes nivel 5-6
2. Juega en Extremo/Pesadilla por los multiplicadores
3. Busca completar evoluciones capstone en un solo run
4. Compite consigo mismo por records en cada dificultad

---

## 8. GUÍA DE IMPLEMENTACIÓN (para Claude Code)

### Prioridad 1: Desactivar bosses + Base del nuevo sistema
1. Extraer código de bosses a `_bosses_archived/boss_system.js`
2. Hacer que todas las armas aparezcan en el pool de upgrades (sin gate de boss)
3. Implementar flag de armas desbloqueadas desde un objeto de configuración (preparando tienda)
4. Hacer que 2-3 armas sean gratuitas por defecto

### Prioridad 2: Upgrades multi-nivel
1. Rediseñar SKILL_TREE para soportar niveles (I, II, III) por upgrade
2. Actualizar `generateUpgradeOptions()` para respetar el orden de niveles
3. Actualizar `getWeaponStats()` para acumular stats según nivel de cada upgrade
4. Actualizar `canUnlockSkill()` para verificar prerequisitos de nivel

### Prioridad 3: Moneda persistente + Tienda
1. Implementar sistema de cristales (ganar en run, persistir en localStorage)
2. Crear pantalla de tienda en el menú principal
3. Sección de desbloqueo de armas
4. Sección de mejoras permanentes

### Prioridad 4: Sistema de dificultades
1. Guardar puntuación máxima por dificultad
2. Crear selector de dificultad en menú
3. Aplicar multiplicadores de enemigos según dificultad
4. Aplicar multiplicadores de recompensas

### Prioridad 5: Evoluciones capstone
1. Detectar cuando las 3 ramas están a nivel III
2. Ofrecer evolución como upgrade especial (presentación visual diferenciada)
3. Implementar mecánica única de cada evolución

---

## 9. NOTAS DE BALANCE

### Curva de poder objetivo
- **Minuto 1-2:** El jugador tiene 1-2 armas activas con upgrades nivel I. Se siente competente.
- **Minuto 3-4:** 2-3 armas con upgrades nivel II. Se siente poderoso.
- **Minuto 5-6:** 3+ armas con varios nivel III. Power fantasy completa, limpiando pantalla.
- **Minuto 7-8:** Posible capstone evolution. Momento épico de pico de poder.
- **Muerte (cuando ocurra):** Debería sentirse como "casi lo logro" o "la próxima va mejor".

### DPS estimado por minuto (Normal, build promedio)
| Minuto | Armas activas | DPS estimado | Enemigos en pantalla |
|--------|--------------|-------------|---------------------|
| 1 | 1 (láser base) | ~30 | 5-10 |
| 2 | 1-2 (+ primeros upgrades) | ~60 | 10-20 |
| 3 | 2 (upgrades I-II) | ~120 | 20-40 |
| 5 | 2-3 (upgrades II-III) | ~250 | 40-80 |
| 7 | 3+ (upgrades III + posible evo) | ~500+ | 80-150 |

Estos valores son orientativos y requieren ajuste con playtesting real.

### Economía de cristales (objetivo)
- Run promedio (muere min 4, Normal): ~100-150 cristales
- Run bueno (muere min 7, Normal): ~250-350 cristales
- Run en Pesadilla (muere min 5): ~400-600 cristales
- Desbloquear todas las armas: ~950 cristales → ~5-8 runs
- Maxear todas las mejoras permanentes (5 mejoras): ~12,090 cristales → muchas horas de juego

---

## 10. SINERGIAS ENTRE ARMAS (notas de diseño)

Esto no requiere código extra, emerge naturalmente de las mecánicas, pero es útil para validar que el diseño permite builds interesantes.

**Build "Limpia-pantalla":** Plasma Field (expansión + daño) + Lightning (cadena masiva) = todo lo que entre en rango muere rápido.

**Build "Artillería":** Missile Launcher (barrage + cluster) + Laser (beam splitter + rapid fire) = lluvia de proyectiles desde la distancia.

**Build "Fortaleza":** Orbital Shield (expansion + absorción) + Plasma Field (intensidad) = tanque que mata por proximidad.

**Build "Enjambre":** Alien Drone (swarm + volatile) + Lightning (chain) = kills generan drones que generan más kills en cadena. Las explosiones de volatile amplifican el efecto bola de nieve.

**Build "Francotirador":** Laser (piercing lens III + rapid fire III) + Missile (heavy payload III con crit) = pocos impactos pero devastadores. Los crits de los misiles limpian grupos densos.
