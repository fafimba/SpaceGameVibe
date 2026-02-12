# Game Loops

> **Fuentes principales**:
> - [A Theory of Fun for Game Design](https://www.theoryoffun.com/) - Raph Koster (2004) - Fundamentos del engagement y aprendizaje
> - [Flow: The Psychology of Optimal Experience](https://www.amazon.com/Flow-Psychology-Experience-Perennial-Classics/dp/0061339202) - Mihaly Csikszentmihalyi - Base psicológica del estado de flow
> - [Hooked: How to Build Habit-Forming Products](https://www.nirandfar.com/hooked/) - Nir Eyal (2014) - El modelo Hook para retention
> - [Game Feel](https://www.amazon.com/Game-Feel-Designers-Sensation-Kaufmann/dp/0123743281) - Steve Swink (2008) - Feedback loop y sensación de juego
> - [GDC: Compulsion Loop Design](https://www.gdcvault.com/browse/gdc-12/) - Múltiples charlas sobre diseño de loops adictivos
> - [Deconstructor of Fun: Core Loop Analysis](https://www.deconstructoroffun.com/) - Análisis de loops de juegos modernos

## Table of Contents
1. [Loop Hierarchy](#loop-hierarchy)
2. [Core Loop Design](#core-loop-design)
3. [Session Structure](#session-structure)
4. [Retention Mechanics](#retention-mechanics)
5. [Flow State](#flow-state)
6. [El Modelo Hook (Nir Eyal)](#el-modelo-hook-nir-eyal)
7. [Raph Koster: Diversión como Aprendizaje](#raph-koster-diversión-como-aprendizaje)
8. [Game Feel (Steve Swink)](#game-feel-steve-swink)

---

## Loop Hierarchy

Games have nested loops operating at different time scales:

```
┌─────────────────────────────────────────┐
│  META LOOP (days/weeks)                 │
│  ┌───────────────────────────────────┐  │
│  │  SESSION LOOP (30-60 min)         │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  ENGAGEMENT LOOP (5-10 min) │  │  │
│  │  │  ┌───────────────────────┐  │  │  │
│  │  │  │  CORE LOOP (seconds)  │  │  │  │
│  │  │  └───────────────────────┘  │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### Time Scales

| Loop | Duration | Player Motivation |
|------|----------|-------------------|
| Core | 1-10 sec | "One more kill" |
| Engagement | 5-10 min | "One more wave" |
| Session | 30-60 min | "One more run" |
| Meta | Days/weeks | "One more unlock" |

---

## Core Loop Design

### The Fundamental Cycle

Every core loop has four phases:

```
    ┌─── ACTION ───┐
    │              │
    ▼              │
CHALLENGE ←── FEEDBACK
    │              ▲
    │              │
    └── REWARD ────┘
```

### For Action/Shooter Games

```
MOVE/AIM → SHOOT → HIT/MISS FEEDBACK → DAMAGE/XP REWARD → repeat
```

```javascript
// Core loop in code
function coreLoop() {
    // 1. ACTION: Player input
    const input = getPlayerInput()
    movePlayer(input)

    // 2. CHALLENGE: Threats to respond to
    updateEnemies()
    checkCollisions()

    // 3. FEEDBACK: Immediate response
    playHitEffects()
    updateUI()

    // 4. REWARD: Progress indicators
    awardXP()
    updateScore()
}
```

### Core Loop Timing

| Action | Ideal Duration | Notes |
|--------|----------------|-------|
| Input to response | < 100ms | Feels instant |
| Attack animation | 200-500ms | Satisfying weight |
| Enemy death | 300-800ms | Celebrate the kill |
| XP collection | 100-200ms | Quick dopamine |

---

## Session Structure

### The Session Arc

```
INTENSITY
    ^
    │        ╭───╮
    │       ╱     ╲    ╭───╮
    │      ╱       ╲  ╱     ╲
    │    ╱          ╲╱       ╲
    │   ╱                      ╲
    │──╱────────────────────────╲──→ TIME
       Start    Mid    Climax   End
```

### Pacing Phases

**Opening (0-5 min)**:
- Low difficulty, teach mechanics
- Quick rewards, easy wins
- Build confidence

**Rising Action (5-20 min)**:
- Increasing challenge
- Meaningful choices (skill tree)
- Introduce variety (new enemy types)

**Climax (20-40 min)**:
- Peak difficulty
- All systems active
- Player using full toolkit

**Resolution (end)**:
- Clear ending (victory/defeat)
- Summary of achievements
- Tease next session content

### Wave Design for Roguelikes

```javascript
function getWaveConfig(waveNumber) {
    // Breathing room every 5 waves
    const isBreatherWave = waveNumber % 5 === 0

    if (isBreatherWave) {
        return {
            enemyCount: baseCount * 0.5,
            hasElite: false,
            bonusReward: true
        }
    }

    // Boss every 10 waves
    const isBossWave = waveNumber % 10 === 0

    return {
        enemyCount: baseCount + (waveNumber * 2),
        hasElite: waveNumber > 5,
        hasBoss: isBossWave,
        enemyTypes: getEnemyMix(waveNumber)
    }
}
```

---

## Retention Mechanics

### Short-Term Retention (within session)

**Sunk Cost**:
```javascript
// Show investment made
displayStats({
    timeInvested: formatTime(sessionTime),
    enemiesKilled: totalKills,
    xpEarned: sessionXP
})
// "I've come this far, might as well continue"
```

**Near Miss**:
```javascript
// Highlight close calls
if (playerHP <= maxHP * 0.2) {
    showLowHealthWarning()
    playHeartbeatSound()
    // Creates tension and engagement
}
```

**Variable Rewards**:
```javascript
// Randomize reward amounts slightly
const baseXP = 10
const variance = Math.floor(Math.random() * 5) - 2  // -2 to +2
const xpEarned = baseXP + variance
// Unpredictability increases engagement
```

### Long-Term Retention (between sessions)

**Meta Progression**:
```javascript
// Persistent unlocks
const metaProgress = {
    totalRuns: 147,
    bestWave: 23,
    unlockedShips: ['basic', 'speedy', 'tank'],
    achievements: ['first_boss', 'no_damage_wave']
}
```

**Daily/Session Goals**:
```javascript
const dailyChallenges = [
    { task: "Kill 100 enemies", reward: 50, progress: 0 },
    { task: "Reach wave 10", reward: 100, progress: 0 },
    { task: "Use dash 20 times", reward: 30, progress: 0 }
]
```

**Unlockable Content**:
```javascript
// Staggered unlocks keep players coming back
const unlockSchedule = {
    runs_5: "New enemy type: Spinner",
    runs_10: "New weapon: Rockets",
    runs_25: "New ship: Speeder",
    runs_50: "Hard mode",
    runs_100: "Endless mode"
}
```

---

## Flow State

### The Flow Channel

```
DIFFICULTY
    ^
    │      ANXIETY
    │      (too hard)
    │         ╲
    │          ╲    ← FLOW ZONE
    │           ╲
    │    BOREDOM ╲
    │    (too easy)
    └──────────────────→ SKILL
```

### Maintaining Flow

**Dynamic Difficulty Adjustment**:
```javascript
function adjustDifficulty() {
    const recentDeaths = getDeathsInLast5Minutes()
    const recentKills = getKillsInLast5Minutes()

    if (recentDeaths > 3) {
        // Player struggling
        difficultyMultiplier *= 0.9
        spawnHealthPickup()
    } else if (recentKills > 50 && recentDeaths === 0) {
        // Player dominating
        difficultyMultiplier *= 1.1
    }
}
```

**Rubber Banding**:
```javascript
// Help struggling players catch up
function getRubberBandBonus(playerLevel, expectedLevel) {
    if (playerLevel < expectedLevel) {
        const deficit = expectedLevel - playerLevel
        return 1 + (deficit * 0.1)  // +10% XP per level behind
    }
    return 1
}
```

### Flow Indicators

Player is in flow when:
- Deaths are spaced 3-5 minutes apart
- Upgrade choices feel meaningful (not obvious)
- Close calls happen regularly but aren't fatal
- Time passes unnoticed ("just one more wave")

Player is bored when:
- No deaths for 10+ minutes
- Upgrades feel arbitrary
- Checking phone/alt-tabbing

Player is frustrated when:
- Multiple deaths per minute
- Upgrades feel useless
- Rage-quitting or demanding nerfs

---

## El Modelo Hook (Nir Eyal)

Del libro "Hooked", el modelo Hook describe cómo crear productos que enganchan:

```
┌─────────────────────────────────────┐
│  1. TRIGGER (interno/externo)       │
│         ↓                           │
│  2. ACTION (comportamiento simple)  │
│         ↓                           │
│  3. VARIABLE REWARD (satisfacción)  │
│         ↓                           │
│  4. INVESTMENT (compromiso futuro)  │
│         ↓                           │
│     [vuelve a TRIGGER]              │
└─────────────────────────────────────┘
```

Aplicado a juegos:
- **Trigger**: Notificación, ganas de jugar, "solo una partida más"
- **Action**: Empezar run, matar enemigos
- **Variable Reward**: Loot aleatorio, progresión, victorias
- **Investment**: Skill points gastados, tiempo invertido, builds creados

---

## Raph Koster: Diversión como Aprendizaje

De "A Theory of Fun for Game Design":

> "La diversión es aprender en un contexto donde no hay presión, y por eso los juegos importan."

Koster argumenta que los juegos son "máquinas de enseñar" disfrazadas. El flow ocurre cuando:
- El challenge es *just right* para la habilidad actual
- El jugador está aprendiendo (consciente o inconscientemente)
- No hay consecuencias reales de fallar

---

## Game Feel (Steve Swink)

Del libro "Game Feel", Swink identifica los componentes que hacen que un juego se sienta bien:

### Los 6 Componentes del Game Feel

```javascript
const gameFeel = {
    input: "Responsividad de controles",
    response: "Feedback visual/auditivo inmediato",
    context: "El mundo reacciona a tus acciones",
    polish: "Screenshake, particles, juiciness",
    metaphor: "La fantasía que vendes (ser un piloto espacial)",
    rules: "Las reglas físicas del mundo del juego"
}
```

### Timing del Feedback (milisegundos importan)

| Acción | Tiempo Ideal | Notas |
|--------|--------------|-------|
| Input a acción | <16ms | Un frame - se siente instantáneo |
| Confirmación de hit | 50ms | Flash visual + sonido |
| Números de daño | 100ms | Aparecen flotando |
| Animación de muerte | 300ms | Celebra la kill |
| Colección de XP | 200ms | Orbs volando al jugador |

### El Concepto de "Juiciness"

"Juicy" = Máxima respuesta con mínimo input. Un click debería disparar múltiples respuestas:

```javascript
function fireWeapon() {
    // Visual
    spawnMuzzleFlash()
    spawnBulletTrail()
    lightFlicker(0.1)

    // Audio
    playFireSound()

    // Física
    applyRecoil(player, -0.5)
    screenShake(2, 50)

    // UI
    flashAmmoCounter()

    // Todo esto por UN click = jugador se siente PODEROSO
}

function onEnemyHit(enemy, damage) {
    // Inmediato (0ms)
    playSound('hit_' + enemy.type)
    flashWhite(enemy, 50)

    // Muy rápido (16-50ms)
    spawnParticles(enemy.position, 'sparks')
    screenShake(damage * 0.5, 100)

    // Rápido (50-200ms)
    showDamageNumber(enemy.position, damage)
    slowMotion(0.9, 50)  // Subtle hit-stop
}
```

### Checklist de Game Feel por Momento del Loop

| Momento | Feedback Requerido |
|---------|-------------------|
| Disparo | Muzzle flash, recoil, sonido, shell casing |
| Impacto | Hit marker, damage number, sparks, screen shake |
| Kill | Death animation, XP popup, kill sound, slowmo |
| Level up | Fanfare, screen flash, stat popup, time pause |
| Wave complete | Celebration, bonus overlay, breather moment |
| Death | Impact, slowmo, dramatic sound, summary |

---

## Referencias Adicionales

- [GDC: Juice It or Lose It](https://www.youtube.com/watch?v=Fy0aCDmgnxg) - Martin Jonasson & Petri Purho
- [Extra Credits: Compulsion Loops](https://www.youtube.com/watch?v=dJcwgOGGy78) - Introducción visual
- [Lost Garden: Loops and Arcs](https://lostgarden.com/2012/04/24/loops-and-arcs/) - Daniel Cook
- [Gamasutra: The Chemistry of Game Design](https://www.gamedeveloper.com/design/the-chemistry-of-game-design) - Skill atoms
- [The Skinner Box and Video Games](https://www.gamedeveloper.com/design/behavioral-game-design) - John Hopson
