# STELLAR SWARM — Sistema de Audio

## Especificaciones Técnicas

**Sintetizador Web Audio API + Sound Tuner Tool**
Documento de referencia para implementación con Claude Code — Marzo 2026

---

## 1. Visión General

El sistema de audio de Stellar Swarm se compone de dos partes que se implementarán de forma secuencial:

- **SynthEngine**: Un sintetizador procedural integrado en index.html que genera todos los sonidos del juego en runtime usando Web Audio API. Sin archivos de audio externos, sin librerías, sin dependencias. Todo vive dentro del single-file.
- **Sound Tuner**: Una herramienta HTML independiente (sound-tuner.html) que permite diseñar sonidos visualmente, previsualizarlos, y exportar los parámetros como código JavaScript listo para copiar/pegar en index.html.

### Principios de Diseño

- **Zero-dependency**: todo vanilla JS dentro del mismo index.html
- **Performance-first**: pool de AudioNodes, sin garbage collection en gameplay
- **Estética coherente**: sonidos sintéticos/retro-neon que complementen la visual geométrica
- **Single-file**: los sonidos se definen como objetos de parámetros (~80-150 caracteres cada uno)
- **Mobile-ready**: respetar restricciones de autoplay (AudioContext resume on user gesture)

---

## 2. Arquitectura Técnica

### 2.1 AudioManager (Singleton)

Objeto global que gestiona todo el audio del juego. Se inicializa una vez en init() y se reutiliza durante toda la sesión.

**Responsabilidades:**

- Crear y mantener el AudioContext (con resume on user gesture para mobile)
- Almacenar el catálogo de definiciones de sonido (SOUND_DEFS)
- Sintetizar sonidos bajo demanda usando Web Audio API
- Gestionar volumen master + volumen por categoría (SFX, UI)
- Pool de nodos para evitar crear/destruir objetos en el game loop
- Método play(soundId) que es la única interfaz que usa el resto del código

### 2.2 Estructura de SOUND_DEFS

Cada sonido se define como un objeto compacto con los parámetros del sintetizador:

```javascript
const SOUND_DEFS = {
  playerShoot: {
    wave: 'square',        // oscillator type: sine|square|sawtooth|triangle
    freq: [880, 440],      // frequency sweep [start, end] in Hz
    duration: 0.08,        // seconds
    volume: 0.3,           // 0-1
    decay: 'exp',          // envelope: 'exp' | 'linear'
    noise: 0,              // white noise mix 0-1
    filter: {              // optional low/highpass
      type: 'lowpass',
      freq: [2000, 500],   // filter freq sweep
      Q: 1
    },
    detune: 50,            // random detune range (cents) for variation
    category: 'sfx'        // volume category
  },
  // ... more sounds
};
```

### 2.3 SynthEngine (funciones internas)

Funciones que interpretan un SOUND_DEF y generan el sonido con Web Audio API:

- **synthesize(def)**: Crea la cadena OscillatorNode → GainNode → FilterNode(opt) → masterGain → destination
- **scheduleEnvelope(gainNode, def)**: Aplica el envelope (attack/decay) al GainNode
- **scheduleFreqSweep(oscNode, def)**: Programa el barrido de frecuencia con linearRampToValueAtTime
- **addNoise(def, duration)**: Si noise > 0, crea un AudioBufferSourceNode con ruido blanco mezclado

### 2.4 Integración con el Game Loop

El AudioManager NO se actualiza en el game loop. Los sonidos son fire-and-forget: se llama a `AudioManager.play('soundId')` y Web Audio API se encarga del scheduling internamente. Esto es crítico para no añadir carga al frame.

Puntos de integración en el código existente:

```javascript
// En fireBullet() ~L3222:
AudioManager.play('playerShoot');

// En killEnemy() ~L4560:
AudioManager.play('enemyDeath');

// En damagePlayer() ~L7641:
AudioManager.play('playerHit');

// En collectXP() ~L4808:
AudioManager.play('xpPickup');

// En levelUp() ~L4842:
AudioManager.play('levelUp');
```

---

## 3. Catálogo de Sonidos

Lista completa de sonidos a implementar, organizados por categoría. Cada sonido incluye su punto de integración en el código.

### 3.1 Armas del Jugador

| Sonido | Descripción | Prioridad |
|--------|-------------|-----------|
| **playerShoot** | Disparo básico láser — sweep agudo corto | Alta |
| **rocketFire** | Lanzamiento de cohete — burst grave + sweep | Alta |
| **rocketExplode** | Explosión de cohete — ruido + freq baja | Alta |
| **lightningZap** | Descarga eléctrica — ruido filtrado rápido | Alta |
| **voidSlash** | Corte void blade — sweep descendente rápido | Alta |
| **fusionBeam** | Loop continuo del beam — oscilación sostenida | Media |
| **orbitalHit** | Impacto orbital — ping metálico corto | Media |
| **auraHit** | Daño por aura — tick sutil grave | Baja |
| **droneFire** | Disparo de drone alien — variante del shoot | Media |
| **turretFire** | Disparo de torreta — burst corto y seco | Media |
| **mineExplode** | Explosión gravity mine — implosion-like | Media |
| **snareActivate** | Activación warp snare — whoosh + resonancia | Baja |

### 3.2 Evoluciones

| Sonido | Descripción | Prioridad |
|--------|-------------|-----------|
| **novaBeamFire** | Nova Beam — beam potenciado, más resonante | Media |
| **armageddonLaunch** | Armageddon missile — launch épico grave | Media |
| **armageddonExplode** | Explosión masiva — ruido largo + decadencia | Media |
| **annihilationPulse** | Pulso de aniquilación — onda expansiva | Media |
| **hiveMindSpawn** | Spawn Hive Mind drone — chirp alien | Baja |

### 3.3 Jugador y Combate

| Sonido | Descripción | Prioridad |
|--------|-------------|-----------|
| **playerHit** | Daño al jugador — impacto + distorsión corta | Alta |
| **shieldBreak** | Escudo roto — crack descendente | Alta |
| **shieldRecharge** | Escudo recargado — sweep ascendente suave | Media |
| **playerDeath** | Muerte del jugador — explosión larga + decay | Alta |
| **nearMiss** | Near miss — whoosh sutil | Baja |

### 3.4 Pickups y Progresión

| Sonido | Descripción | Prioridad |
|--------|-------------|-----------|
| **xpPickup** | Recoger XP — ting agudo corto | Alta |
| **crystalPickup** | Recoger cristal — chime brillante | Alta |
| **healthPickup** | Recoger vida — sweep ascendente cálido | Media |
| **levelUp** | Subir de nivel — fanfarre ascendente (2-3 notas) | Alta |
| **upgradeSelect** | Seleccionar upgrade — confirm satisfactorio | Alta |

### 3.5 UI y Menús

| Sonido | Descripción | Prioridad |
|--------|-------------|-----------|
| **uiClick** | Click genérico UI — tick corto | Alta |
| **uiHover** | Hover en botón — tono sutil (solo desktop) | Baja |
| **gameStart** | Inicio de partida — sweep + whoosh energético | Media |
| **waveAlert** | Nueva oleada — alerta tipo sirena corta | Media |
| **pauseIn** | Entrar en pausa — pitch down | Baja |
| **pauseOut** | Salir de pausa — pitch up | Baja |

### 3.6 Enemigos

| Sonido | Descripción | Prioridad |
|--------|-------------|-----------|
| **enemyDeath** | Muerte genérica — pop + ring corto | Alta |
| **enemyShoot** | Disparo enemigo — buzz grave corto | Alta |
| **kamikazeCharge** | Kamikaze acelerando — pitch ascendente | Media |
| **leviathanSpawn** | Spawn Leviathan — rugido grave profundo | Media |
| **tankSplit** | Tank/Alien split — crack + spawn | Baja |

---

## 4. Sound Tuner Tool

Herramienta visual independiente (sound-tuner.html) para diseñar y exportar sonidos. No forma parte del juego — es una herramienta de desarrollo.

### 4.1 Funcionalidades

- Editor visual de parámetros: sliders para frecuencia, duración, volumen, decay, noise mix, filtro
- Selector de tipo de onda: sine, square, sawtooth, triangle (con preview visual de la waveform)
- Botón de preview: reproduce el sonido en tiempo real mientras ajustas
- Visualizador de waveform: muestra la forma de onda resultante en un canvas pequeño
- Presets: carga cualquier sonido del catálogo para usarlo como punto de partida
- Export: genera el bloque JavaScript (objeto SOUND_DEFS entry) listo para copiar y pegar en index.html
- Import: pega un bloque existente para editarlo visualmente
- Randomizer: genera parámetros aleatorios para explorar sonidos inesperados

### 4.2 Interfaz

Layout de dos columnas. Izquierda: controles (sliders, dropdowns, botones). Derecha: visualizador de waveform + código de export. Estilo neon-dark consistente con la estética del juego. Single HTML file, same philosophy.

### 4.3 Flujo de Trabajo

1. Abrir sound-tuner.html en el navegador
2. Seleccionar un preset o empezar desde cero
3. Ajustar parámetros con sliders, escuchar en tiempo real
4. Cuando el sonido sea satisfactorio, click en Export
5. Copiar el código generado
6. Pegar en la sección SOUND_DEFS de index.html

---

## 5. Milestones de Implementación

Cada milestone es un entregable funcional que se puede testear independientemente. Pensados para sesiones de Claude Code.

### Milestone 1: AudioManager Core

*Objetivo: Sistema básico de audio funcionando con 3-4 sonidos de prueba.*

| Tarea | Descripción | Prioridad | Estimación |
|-------|-------------|-----------|------------|
| AudioManager singleton | AudioContext + resume on gesture + masterGain | Alta | 30 min |
| SynthEngine básico | Oscillator + GainNode + frequency sweep + envelope | Alta | 45 min |
| SOUND_DEFS estructura | Definir formato + 3 sonidos de prueba (shoot, death, pickup) | Alta | 20 min |
| Integración básica | play() en fireBullet, killEnemy, collectXP | Alta | 15 min |
| Mobile unlock | AudioContext.resume() en primer touch/click | Alta | 10 min |
| Volumen settings | Master volume + mute toggle (persistido en localStorage) | Media | 15 min |

*Tiempo estimado: ~2.5 horas — Resultado: Juego con sonidos básicos funcionales*

### Milestone 2: Catálogo Completo de Sonidos

*Objetivo: Todos los sonidos del catálogo implementados y conectados.*

| Tarea | Descripción | Prioridad | Estimación |
|-------|-------------|-----------|------------|
| Filtro (lowpass/highpass) | FilterNode con frequency sweep + Q | Alta | 20 min |
| Ruido blanco | AudioBufferSourceNode con noise mix | Alta | 20 min |
| Detune/variación | Random detune por reproducción para evitar repetición | Media | 10 min |
| Sonidos de armas (x12) | Todos los del catálogo sección 3.1 + 3.2 | Alta | 1.5 h |
| Sonidos de jugador (x5) | playerHit, shieldBreak, recharge, death, nearMiss | Alta | 30 min |
| Sonidos de pickups (x5) | xp, crystal, health, levelUp, upgradeSelect | Alta | 30 min |
| Sonidos de UI (x6) | click, hover, gameStart, waveAlert, pause in/out | Media | 30 min |
| Sonidos de enemigos (x5) | death, shoot, kamikaze, leviathan, tankSplit | Alta | 30 min |
| Integración completa | Conectar cada play() en su punto del código | Alta | 45 min |

*Tiempo estimado: ~5 horas — Resultado: Experiencia de audio completa*

### Milestone 3: Optimización y Polish

*Objetivo: Audio pulido, sin impacto en performance, con controles de usuario.*

| Tarea | Descripción | Prioridad | Estimación |
|-------|-------------|-----------|------------|
| Rate limiting | Máx sonidos simultáneos por tipo (ej: max 3 shoots) | Alta | 20 min |
| Prioridad de sonidos | Sonidos críticos (playerHit) nunca se dropean | Media | 15 min |
| Cooldown por sonido | Evitar que el mismo SFX suene 60 veces/segundo | Alta | 15 min |
| Spatial audio básico | Paneo L/R según posición X relativa al jugador | Baja | 20 min |
| Volume ducking | Bajar SFX al pausar / en menú de upgrade | Baja | 15 min |
| Performance profiling | Verificar 0 impacto en FPS con 200+ enemigos | Alta | 30 min |
| Settings UI | Control de volumen en pausa menu + mute button en HUD | Media | 30 min |

*Tiempo estimado: ~2.5 horas — Resultado: Audio production-ready*

### Milestone 4: Sound Tuner Tool

*Objetivo: Herramienta visual para diseñar y exportar sonidos.*

| Tarea | Descripción | Prioridad | Estimación |
|-------|-------------|-----------|------------|
| Layout básico | HTML/CSS dark theme, dos columnas, sliders | Alta | 30 min |
| SynthEngine reusable | Copiar synth engine del juego al tuner | Alta | 15 min |
| Controles completos | Sliders para cada parámetro de SOUND_DEFS | Alta | 45 min |
| Preview en real-time | Botón play + auto-play al cambiar parámetro | Alta | 20 min |
| Waveform visualizer | Canvas con AnalyserNode mostrando la forma de onda | Media | 30 min |
| Export code | Genera JS object listo para copiar a index.html | Alta | 15 min |
| Import/Load | Pegar código existente para editarlo | Media | 20 min |
| Presets del juego | Dropdown con todos los SOUND_DEFS del catálogo | Media | 15 min |
| Randomizer | Botón que genera parámetros aleatorios | Baja | 10 min |

*Tiempo estimado: ~3.5 horas — Resultado: Herramienta completa de diseño de audio*

---

## 6. Restricciones y Consideraciones

### Performance

- Web Audio API corre en un thread separado (audio worklet thread), por lo que NO bloquea el game loop
- Sin embargo, crear muchos OscillatorNodes simultáneos puede causar clicks/pops — por eso el rate limiting es crítico
- Nunca llamar a play() dentro de un loop de enemigos sin cooldown — con 200 enemigos sería desastroso
- El GainNode con exponentialRampToValueAtTime es más eficiente que setValueAtTime + linear para envelopes

### Mobile

- iOS Safari requiere AudioContext.resume() dentro de un user gesture handler (touchstart/click)
- Android Chrome tiene el mismo requisito pero es menos estricto
- Solución: en setupInput() y setupTouchControls(), añadir AudioManager.unlock() en el primer evento

### Arquitectura Single-File

- Todo el código del AudioManager + SynthEngine + SOUND_DEFS va dentro del IIFE existente en index.html
- Ubicación sugerida: después de las CONSTANTS (~L600), antes de GAME STATE (~L602)
- El code-index.md se actualizará con una nueva sección: AUDIO SYSTEM
- Estimación: ~300-400 líneas adicionales (AudioManager + SynthEngine + catálogo completo)

### Compatibilidad TWA

- TWA usa Chrome internamente, por lo que Web Audio API funciona al 100%
- No se necesita ningún cambio en la capa nativa (app/build.gradle) para audio
- Los sonidos sintéticos no añaden peso al bundle (vs archivos .mp3/.wav)

---

## 7. Resumen de Milestones

| # | Milestone | Dependencia | Estimación | Líneas |
|---|-----------|-------------|------------|--------|
| 1 | AudioManager Core | Ninguna | ~2.5 h | ~100 |
| 2 | Catálogo Completo | Milestone 1 | ~5 h | ~200 |
| 3 | Optimización | Milestone 2 | ~2.5 h | ~80 |
| 4 | Sound Tuner Tool | Milestone 1 | ~3.5 h | ~500 |
|   | **TOTAL** | | **~13.5 h** | **~880** |

Los milestones 3 y 4 son independientes entre sí y pueden ejecutarse en paralelo. El milestone 4 (Sound Tuner) puede empezarse en cuanto el milestone 1 esté listo, ya que reutiliza el mismo SynthEngine.

**Orden recomendado de ejecución:** M1 (Core) → M2 (Catálogo) → M4 (Tuner) → M3 (Polish). Así puedes usar el Tuner para refinar los sonidos del catálogo antes de hacer el polish final.
