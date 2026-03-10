# STELLAR SWARM — Sistema de Música Procedural

## Especificaciones Técnicas

**Drone Adaptativo + Sequencer Melódico (Suno → MIDI → Synth)**
Documento de referencia para implementación con Claude Code — Marzo 2026

---

## 1. Visión General

El sistema de música de Stellar Swarm se compone de dos capas independientes que suenan simultáneamente, gestionadas por el AudioManager existente:

- **Capa 1 — Drone Adaptativo**: Ambient/soundscape espacial generado proceduralmente en runtime. Nunca se repite exactamente. Reacciona al estado del juego (tensión, menú, muerte). Cero archivos externos.
- **Capa 2 — Sequencer Melódico**: Reproduce melodías simplificadas (estilo ambient minimalista, ondas sine limpias) extraídas de tracks generados con Suno AI. Las notas se almacenan como arrays de datos dentro del código. El mismo SynthEngine las sintetiza.

Ambas capas usan el SynthEngine y AudioManager que ya existen en el juego. No se necesitan librerías ni archivos de audio.

### Principios de Diseño

- **Todo procedural**: ambas capas se generan con Web Audio API, cero archivos .mp3
- **Adaptativo**: la música cambia según el estado del juego, nunca es un loop estático
- **Sutil**: la música acompaña, no compite con los SFX ni distrae del gameplay
- **Cohesivo**: al usar el mismo SynthEngine que los SFX, todo suena del mismo universo sonoro
- **Moderno y limpio**: ondas sine puras, sin estética retro/chiptune — la vibe es ambient electrónico minimalista, no arcade 8-bit
- **Separable**: cada capa funciona independientemente — se puede desactivar una sin afectar la otra

---

## 2. Capa 1 — Drone Adaptativo

### 2.1 Concepto

Un paisaje sonoro espacial continuo que "respira" — sube y baja en intensidad lentamente, creando sensación de profundidad e inmersión sin necesitar melodía. Piensa en el hum grave de una nave espacial mezclado con reverberaciones etéreas.

### 2.2 Arquitectura de Nodos

```
LFO (OscillatorNode, ~0.1-0.3 Hz)
  │
  └──▶ modula gain de ──▶ Osc1 (sine, 55-80 Hz) ──▶ droneGain ──▶ masterGain
                          Osc2 (sine, 82-110 Hz) ──┘     ▲
                          Osc3 (triangle, sutil)  ──┘     │
                                                    stateGain (controlado por game state)
```

**Componentes:**

- **Osc1 (fundamental)**: Onda sine muy grave (55-80 Hz). Es el "hum" base. Siempre activo.
- **Osc2 (quinta/intervalo)**: Onda sine ligeramente disonante respecto a Osc1 (ej: Osc1=55Hz, Osc2=82Hz). Crea tensión sutil por el batimiento entre frecuencias cercanas.
- **Osc3 (textura)**: Onda triangle más aguda y muy baja de volumen. Añade brillo etéreo. Se activa/desactiva según nivel de tensión.
- **LFO (modulador)**: Oscillator a frecuencia muy baja (0.1-0.3 Hz, o sea un ciclo cada 3-10 segundos) conectado al GainNode del drone. Hace que el volumen "respire" — sube y baja orgánicamente.
- **FilterNode**: Lowpass en la salida del drone. La frecuencia de corte sube con la tensión (más brillo = más intenso).

### 2.3 Estados Adaptativos

El drone cambia según el game state, con transiciones suaves (crossfade de ~2 segundos):

| Estado | Frecuencia base | LFO speed | Volumen | Filtro cutoff | Osc3 |
|--------|----------------|-----------|---------|--------------|------|
| **menu** | 55 Hz | 0.08 Hz (lento) | 0.15 | 200 Hz | Off |
| **playing_calm** | 60 Hz | 0.12 Hz | 0.12 | 300 Hz | Off |
| **playing_tense** | 65 Hz | 0.2 Hz (rápido) | 0.18 | 500 Hz | On |
| **playing_intense** | 70 Hz | 0.3 Hz | 0.22 | 800 Hz | On |
| **skilltree** | 50 Hz | 0.06 Hz (muy lento) | 0.10 | 150 Hz | Off |
| **gameOver** | 45 Hz | 0.04 Hz | 0.20 | 120 Hz | Off — pitch bend descendente |

### 2.4 Cálculo de Tensión

La tensión se calcula cada ~2 segundos (no cada frame) basándose en el gameplay:

```javascript
function calculateTension() {
    const enemyCount = enemies.length;
    const healthRatio = player.hp / playerMaxHP;
    const timeAlive = (Date.now() - gameStartTime) / 1000;

    let tension = 0;
    tension += Math.min(enemyCount / 80, 1) * 0.4;    // 40% peso: cantidad de enemigos
    tension += (1 - healthRatio) * 0.3;                 // 30% peso: vida baja = más tensión
    tension += Math.min(timeAlive / 300, 1) * 0.2;      // 20% peso: más tiempo = más tensión
    tension += (bossActive ? 0.1 : 0);                  // 10% peso: boss activo

    return Math.min(tension, 1); // 0 = calma total, 1 = intensidad máxima
}
```

**Mapeo de tensión a estados:**
- 0.0 - 0.25 → `playing_calm`
- 0.25 - 0.55 → `playing_tense`
- 0.55 - 1.0 → `playing_intense`

### 2.5 Transiciones

Todas las transiciones entre estados usan `linearRampToValueAtTime` o `exponentialRampToValueAtTime` con duración de ~2 segundos. Nunca hay cortes abruptos. Los parámetros que transicionan:

- Frecuencia de oscillators (ramp suave)
- Volumen del droneGain (ramp suave)
- Frecuencia de corte del filtro (ramp suave)
- Velocidad del LFO (cambio instantáneo, no se nota)
- Osc3 on/off (fade in/out de 1 segundo via su propio gain)

### 2.6 Integración

```javascript
// En el game loop existente (o en un setInterval separado cada 2s):
DroneEngine.updateTension(calculateTension());

// En cambios de game state:
// setState('menu') en drawMainMenu()
// setState('playing') en startGame()
// setState('skilltree') en openSkillTree()
// setState('gameOver') en gameOver()
DroneEngine.setState('menu');
```

### 2.7 API del DroneEngine

```javascript
const DroneEngine = {
    init(audioCtx, masterGain),  // Crea los oscillators y nodos. Se llama una vez.
    start(),                      // Inicia los oscillators (después del user gesture)
    stop(),                       // Para todo (si el usuario muta la música)
    setState(state),              // Transiciona al estado indicado
    updateTension(value),         // 0-1, ajusta parámetros continuamente
    setVolume(vol),               // 0-1, volumen de la capa de drone
};
```

---

## 3. Capa 2 — Sequencer Melódico

### 3.1 Concepto

Un sequencer minimalista que reproduce secuencias de notas usando el SynthEngine existente. Las melodías suenan limpias y modernas — una sola voz monofónica (una nota a la vez) con timbre de onda sine, como una línea melódica de ambient electrónico flotando encima del drone espacial. El resultado es minimalista y agradable, no retro arcade.

### 3.2 Flujo de Creación de Melodías

```
Suno AI                    Herramientas externas           Tu código
────────                   ─────────────────────           ──────────
"synthwave space           DEMUCS (separar stems)          Array de notas
 shooter 120bpm"  ──▶     ──▶ stem melódico ──▶           en MUSIC_SEQUENCES
                           Basic Pitch (audio→MIDI)
                           ──▶ archivo .mid ──▶
                           Parser MIDI (script) ──▶
                           JSON de notas
```

**Paso a paso:**

1. **Generar en Suno**: Prompt tipo "synthwave retro space shooter, 120 BPM, driving, 8-bit inspired, loopable". Generar varias opciones, elegir las mejores.
2. **Separar stems**: Pasar el .mp3 por DEMUCS o LALAL.AI para aislar la voz/melodía principal del bajo, batería y pads.
3. **Audio a MIDI**: Pasar el stem melódico por Basic Pitch (basicpitch.spotify.com) para obtener un archivo .mid con las notas.
4. **MIDI a datos**: Un script de Node.js parsea el .mid y genera el array de notas (frecuencia, duración, beat de inicio). Este paso lo puede hacer Claude Code.
5. **Simplificar**: Reducir a las notas principales — quitar ornamentos, notas muy cortas, simplificar a la melodía esencial. También Claude Code.
6. **Integrar**: Pegar el array resultante en MUSIC_SEQUENCES dentro de index.html.

### 3.3 Formato de Secuencias

```javascript
const MUSIC_SEQUENCES = {
    gameplay_main: {
        bpm: 120,
        loopBeats: 32,              // duración del loop en beats (32 = 8 compases 4/4)
        wave: 'sine',               // timbre limpio y moderno
        volume: 0.15,               // volumen bajo — acompaña, no domina
        filter: { type: 'lowpass', freq: 3000, Q: 0.5 },  // suave, sin resonancia agresiva
        notes: [
            // [midiNote, durationBeats, startBeat]
            [69, 0.5, 0],           // A4, medio beat, en beat 0
            [72, 0.5, 0.5],         // C5, medio beat, en beat 0.5
            [76, 1.0, 1],           // E5, un beat completo, en beat 1
            [74, 0.5, 2],           // D5
            [72, 1.5, 2.5],         // C5
            // ... más notas del loop
        ]
    },
    gameplay_tense: {
        bpm: 130,                   // más rápido = más urgencia
        loopBeats: 16,
        wave: 'sine',               // se mantiene limpio, la tensión viene del ritmo y las notas
        volume: 0.18,
        notes: [ /* ... */ ]
    },
    menu_theme: {
        bpm: 90,
        loopBeats: 32,
        wave: 'sine',               // mismo timbre limpio, el mood lo da el BPM y la melodía
        volume: 0.12,
        notes: [ /* ... */ ]
    }
};
```

### 3.4 Arquitectura del Sequencer

```javascript
const MusicSequencer = {
    init(audioCtx, synthEngine, masterGain),
    play(sequenceId),         // Inicia una secuencia con fade in
    stop(),                   // Para la secuencia actual con fade out
    crossfadeTo(sequenceId),  // Transiciona suavemente a otra secuencia (~2s)
    setVolume(vol),           // 0-1
    isPlaying(),              // boolean
};
```

**Funcionamiento interno:**

El sequencer usa `audioCtx.currentTime` para programar las notas del loop completo de una vez (look-ahead scheduling). Cuando el loop termina, programa el siguiente. Cada nota se sintetiza con el SynthEngine existente, usando una definición de sonido fija (la del wave/filter de la secuencia).

```javascript
// Pseudo-código del scheduling:
function scheduleLoop(sequence, startTime) {
    const beatDuration = 60 / sequence.bpm;
    for (const [midiNote, duration, startBeat] of sequence.notes) {
        const noteTime = startTime + (startBeat * beatDuration);
        const freq = 440 * Math.pow(2, (midiNote - 69) / 12); // MIDI → Hz
        synthEngine.playNote(freq, duration * beatDuration, noteTime, sequence);
    }
    // Programar el siguiente loop
    const loopDuration = sequence.loopBeats * beatDuration;
    setTimeout(() => scheduleLoop(sequence, startTime + loopDuration),
               (loopDuration - 0.5) * 1000); // re-schedule 0.5s antes de que acabe
}
```

### 3.5 Transiciones entre Secuencias

Cuando la tensión cambia y hay que cambiar de secuencia:

1. La secuencia actual hace fade out (1.5s)
2. La nueva secuencia espera al siguiente beat fuerte (downbeat) para empezar
3. La nueva secuencia hace fade in (1.5s)
4. Esto da la sensación de que la música "evoluciona" en vez de cortar

### 3.6 Mapeo de Tensión a Secuencias

| Tensión | Game State | Secuencia |
|---------|-----------|-----------|
| N/A | menu | `menu_theme` |
| 0.0 - 0.3 | playing | `gameplay_main` |
| 0.3 - 0.6 | playing | `gameplay_tense` |
| 0.6 - 1.0 | playing | `gameplay_intense` (si existe, o mantener tense) |
| N/A | skilltree | Silenciar melodía, solo drone |
| N/A | gameOver | `gameover_theme` (opcional) o fade out |

---

## 4. Script de Conversión MIDI → Notas

### 4.1 Herramienta de Parseo

Un script Node.js que toma un archivo .mid y genera el array de notas para MUSIC_SEQUENCES:

```javascript
// midi-to-sequence.js (herramienta de desarrollo, NO va en index.html)
// npm install midi-parser-js
// node midi-to-sequence.js melody.mid --bpm 120 --simplify

// Output:
// {
//   bpm: 120,
//   loopBeats: 32,
//   notes: [[69, 0.5, 0], [72, 0.5, 0.5], ...]
// }
```

### 4.2 Simplificación de Melodía

El script incluye opciones de simplificación:

- **Quantize**: Redondear startBeat al valor más cercano (1/4, 1/8, 1/16 de beat)
- **Min duration**: Eliminar notas más cortas que X beats (ej: eliminar todo < 0.25 beats)
- **Merge**: Fusionar notas consecutivas de la misma frecuencia
- **Range**: Mantener solo notas dentro de un rango MIDI (ej: 60-84, dos octavas centrales)
- **Max notes**: Limitar a N notas por loop para mantener simplicidad

### 4.3 Ajuste Manual con Sound Tuner

El Sound Tuner Tool (del spec anterior, Milestone 4) se puede extender para incluir una pestaña de "Melody Editor" donde visualizas las notas en un piano roll básico, puedes mover/eliminar notas, cambiar el timbre, y exportar la secuencia actualizada.

---

## 5. Milestones de Implementación

### Milestone 1: Drone Adaptativo

*Objetivo: Capa de ambient espacial funcionando y reaccionando al gameplay. Testeable de inmediato.*

| Tarea | Descripción | Prioridad | Estimación |
|-------|-------------|-----------|------------|
| DroneEngine core | Crear Osc1 + Osc2 + LFO + GainNode + FilterNode | Alta | 30 min |
| Estados básicos | Implementar menu, playing_calm, playing_tense, gameOver | Alta | 20 min |
| Transiciones suaves | Ramps de frecuencia, volumen y filtro entre estados | Alta | 20 min |
| Cálculo de tensión | calculateTension() basado en enemigos, vida, tiempo | Alta | 15 min |
| Integración game states | Conectar setState() en las transiciones existentes del juego | Alta | 15 min |
| Timer de tensión | setInterval cada 2s para updateTension() durante gameplay | Alta | 10 min |
| Osc3 (textura) | Tercera capa triangle que se activa en tensión alta | Media | 10 min |
| Volume control | Volumen independiente para música en settings (localStorage) | Media | 15 min |
| Mute/unmute | Toggle de música en el pause menu y HUD | Media | 15 min |

*Tiempo estimado: ~2.5 horas — Resultado: Drone espacial adaptativo completo, jugable y testeable*

### Milestone 2: Sequencer Core

*Objetivo: Motor de secuencias funcionando con una melodía de prueba hardcodeada.*

| Tarea | Descripción | Prioridad | Estimación |
|-------|-------------|-----------|------------|
| MusicSequencer base | Scheduling de notas con look-ahead usando audioCtx.currentTime | Alta | 45 min |
| MIDI → frecuencia | Función de conversión midiNote → Hz | Alta | 5 min |
| MUSIC_SEQUENCES formato | Definir estructura de datos + 1 secuencia de prueba manual | Alta | 15 min |
| Loop scheduling | Re-programar el loop antes de que termine | Alta | 20 min |
| play/stop con fades | Fade in al iniciar, fade out al parar | Alta | 15 min |
| Integración con drone | Ambas capas sonando juntas, volúmenes balanceados | Alta | 15 min |
| Crossfade entre secuencias | Transición suave entre dos secuencias diferentes | Media | 20 min |

*Tiempo estimado: ~2.5 horas — Resultado: Sequencer funcional con melodía de prueba*

### Milestone 3: Pipeline Suno → MIDI → Notas

*Objetivo: Flujo completo para crear melodías reales desde Suno hasta el juego.*

| Tarea | Descripción | Prioridad | Estimación |
|-------|-------------|-----------|------------|
| Script midi-to-sequence.js | Parser de .mid que genera array de notas | Alta | 45 min |
| Opciones de simplificación | Quantize, min duration, merge, range, max notes | Alta | 30 min |
| Generar tracks en Suno | Crear 3-4 tracks con prompts adecuados | Alta | 30 min |
| Separar stems | Pasar por DEMUCS/LALAL.AI para aislar melodía | Alta | 20 min |
| Audio → MIDI | Convertir stems con Basic Pitch | Alta | 15 min |
| Procesar con script | Ejecutar midi-to-sequence.js en cada .mid | Alta | 15 min |
| Integrar secuencias | Pegar arrays resultantes en MUSIC_SEQUENCES | Alta | 15 min |
| Ajuste fino | Tunear volúmenes, timbres, transiciones con melodías reales | Media | 30 min |

*Tiempo estimado: ~3.5 horas — Resultado: Melodías reales de Suno sonando en el sintetizador*

### Milestone 4: Mapeo de Tensión + Polish

*Objetivo: Música que reacciona al gameplay de forma fluida y pulida.*

| Tarea | Descripción | Prioridad | Estimación |
|-------|-------------|-----------|------------|
| Mapeo tensión → secuencias | Sistema que elige secuencia según nivel de tensión | Alta | 20 min |
| Crossfade por tensión | Transiciones automáticas entre secuencias al cambiar tensión | Alta | 20 min |
| Secuencias por game state | menu_theme, skilltree silence, gameOver fade | Alta | 15 min |
| Balance SFX vs música | Ajustar volúmenes para que SFX destaquen sobre melodía | Alta | 20 min |
| Ducking en upgrade screen | Bajar música al abrir menú de upgrades / skilltree | Media | 10 min |
| Settings UI completa | Sliders separados: SFX volume, Music volume, Drone volume | Media | 20 min |
| Performance check | Verificar que el sequencer no genera GC spikes ni lag | Alta | 20 min |
| Mobile testing | Verificar transiciones y timing en iOS Safari + Android Chrome | Alta | 20 min |

*Tiempo estimado: ~2.5 horas — Resultado: Sistema de música completo y production-ready*

### Milestone 5 (Opcional): Melody Editor en Sound Tuner

*Objetivo: Extensión del Sound Tuner para editar secuencias melódicas visualmente.*

| Tarea | Descripción | Prioridad | Estimación |
|-------|-------------|-----------|------------|
| Piano roll canvas | Visualización de notas en grid tiempo × pitch | Media | 1 h |
| Edición de notas | Click para añadir/eliminar, drag para mover/redimensionar | Media | 45 min |
| Preview de secuencia | Botón play que reproduce la secuencia con el SynthEngine | Alta | 20 min |
| Import secuencia | Pegar array de MUSIC_SEQUENCES para editar | Media | 15 min |
| Export código | Generar array JS listo para copiar a index.html | Alta | 10 min |
| Selector de timbre | Cambiar wave/filter y escuchar el resultado | Media | 15 min |

*Tiempo estimado: ~3 horas — Resultado: Editor visual de melodías integrado en Sound Tuner*

---

## 6. Restricciones y Consideraciones

### Performance

- El drone usa oscillators persistentes (no se crean/destruyen), coste de CPU prácticamente nulo
- El sequencer crea un OscillatorNode por nota, pero las notas son secuenciales (monofónico), así que nunca hay más de 1-2 activos simultáneamente
- El cálculo de tensión se hace cada 2 segundos, no cada frame — impacto cero en el game loop
- Las transiciones de parámetros usan los métodos nativos de AudioParam (ramp), no código JS en un loop

### Mobile

- El drone se inicia con AudioManager.unlock() que ya existe (del spec de SFX)
- iOS Safari tiene un límite de ~6 AudioContexts simultáneos — todo debe usar el mismo contexto (ya es así)
- El scheduling look-ahead del sequencer funciona bien en mobile porque Web Audio API mantiene su propio reloj independiente del frame rate

### Volúmenes de Referencia

- SFX: 0.3-0.8 (protagonistas)
- Melodía: 0.10-0.18 (acompañamiento sutil)
- Drone: 0.10-0.22 (según tensión, siempre debajo de la melodía)
- Master: 1.0 (controlable por el usuario)

La música nunca debe competir con los SFX. Si un jugador no nota conscientemente la música pero "siente" que el juego tiene ambiente, está perfecta.

---

## 7. Resumen de Milestones

| # | Milestone | Dependencia | Estimación | Líneas |
|---|-----------|-------------|------------|--------|
| 1 | Drone Adaptativo | AudioManager (SFX spec M1) | ~2.5 h | ~120 |
| 2 | Sequencer Core | Milestone 1 | ~2.5 h | ~100 |
| 3 | Pipeline Suno → MIDI → Notas | Milestone 2 | ~3.5 h | ~80 + script |
| 4 | Mapeo de Tensión + Polish | Milestone 3 | ~2.5 h | ~60 |
| 5 | Melody Editor (opcional) | Sound Tuner (SFX spec M4) | ~3 h | ~400 |
|   | **TOTAL** | | **~14 h** | **~760** |

**Dependencia clave**: Este spec asume que el Milestone 1 del spec de SFX (AudioManager Core) ya está implementado. El DroneEngine y el MusicSequencer se conectan al mismo AudioContext y masterGain.

**Orden recomendado**: M1 (Drone) → testear y ajustar → M2 (Sequencer) → M3 (Pipeline con Suno) → M4 (Polish) → M5 si se quiere editor visual.

El Milestone 1 (Drone) es completamente autónomo y testeable — en cuanto esté implementado puedes jugar una partida y sentir cómo el ambiente cambia con la acción.
