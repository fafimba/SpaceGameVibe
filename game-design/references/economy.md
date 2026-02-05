# Game Economy Design

> **Fuentes principales**:
> - [GDC: Design and Monetization Strategies](https://www.gdcvault.com/play/1020027/Design-and-Monetization-Strategies-in) - Análisis de Candy Crush, Clash of Clans
> - [Game Economy Design: Metagame, Monetization and Live Operations](https://www.routledge.com/Game-Economy-Design-Metagame-Monetization-and-Live-Operations/Czerkawski/p/book/9781032479903) - Charlie Czerkawski (2024)
> - [GDC: Monetizing Economy Based F2P Games](https://www.gdcvault.com/play/1016578/Monetizing-Economy-Based-Free-to) - The Settlers Online
> - [Deconstructor of Fun](https://www.deconstructoroffun.com/) - Blog de análisis de economías de juegos

## Table of Contents
1. [Currency Types](#currency-types)
2. [Sources and Sinks](#sources-and-sinks)
3. [Drop Rates](#drop-rates)
4. [Reward Schedules](#reward-schedules)
5. [Economy Balance](#economy-balance)

---

## Currency Types

### Modelo Dual Currency (estándar de la industria)

Según las charlas de GDC sobre F2P, la mayoría de juegos exitosos usan dos monedas:

| Tipo | Cómo se Obtiene | En qué se Gasta | Ejemplo |
|------|-----------------|-----------------|---------|
| **Soft currency** | Gameplay normal | Items comunes, upgrades | Oro, Coins, XP |
| **Hard currency** | Dinero real / muy raro | Items premium, skips | Gems, Crystals |

### Para Juegos de Sesión Única (Roguelikes)

En roguelikes sin monetización, las monedas típicas son:

- **XP/Score**: Ganado por run, gastado en skill tree durante la partida
- **Meta currency**: Persiste entre runs, desbloquea opciones permanentes

```javascript
// XP ganado durante el run
runXP += enemyValue

// Meta currency al terminar run
metaCurrency += Math.floor(runXP / 100) + waveBonus
```

### Principio de Vampire Survivors

Vampire Survivors popularizó un modelo simple pero efectivo:
- **Oro (in-run)**: Comprar upgrades durante la partida
- **Oro (meta)**: El oro sobrante se usa para upgrades permanentes

---

## Sources and Sinks

### El Modelo Faucet-Drain

Concepto fundamental de economía de juegos (documentado en múltiples charlas GDC):

```
[SOURCES/FAUCETS]          [SINKS/DRAINS]
      |                          |
      v                          v
Enemy kills ────→ [WALLET] ────→ Skill unlocks
Wave bonuses ──→            ──→ Consumables
Pickups ───────→            ──→ Permanent upgrades
```

### Mapeo de Tu Economía

**Sources** (cómo ganan los jugadores):

| Source | Rate | Notas |
|--------|------|-------|
| Enemy kills | 5-20 XP c/u | Fuente principal |
| Wave completion | 50-100 XP | Reward de milestone |
| Time survived | 1 XP/segundo | Ingreso pasivo |
| Pickups | 10-50 XP | Varianza/emoción |

**Sinks** (cómo gastan):

| Sink | Costo | Notas |
|------|-------|-------|
| Skill unlock | 1 punto | Progresión principal |
| Consumable | 50-200 | Opcional, estratégico |
| Permanent upgrade | 500-2000 | Meta largo plazo |

### Flow Rate Saludable

```javascript
// Calcular ingreso por minuto
incomePerMinute = (killsPerMin * xpPerKill) + (passiveXP * 60)

// Recomendado: jugador gana suficiente para 1 upgrade cada 2-5 minutos
upgradesPerHour = incomePerMinute * 60 / averageUpgradeCost

// Objetivo: 12-30 upgrades por hora para gameplay engaged
```

---

## Drop Rates

### Fórmula Básica

```javascript
function shouldDrop(baseChance, luckModifier = 1) {
    const finalChance = baseChance * luckModifier
    return Math.random() < finalChance
}
```

### Drop Rates Recomendados (según análisis de Deconstructor of Fun)

| Tipo de Item | Rate Base | Notas |
|--------------|-----------|-------|
| Común (XP orbs) | 80-100% | Casi garantizado |
| Uncommon (vida) | 10-20% | Regular pero no confiable |
| Rare (power-up) | 2-5% | Emocionante cuando aparece |
| Epic (item especial) | 0.5-1% | Momentos memorables |
| Legendary | 0.1% | Derecho a presumir |

### Sistema de Pity (Anti-frustración)

Popularizado por juegos gacha, previene rachas de mala suerte:

```javascript
let dropsSinceRare = 0

function checkRareDrop(baseChance) {
    dropsSinceRare++

    // Aumentar chance después de racha seca
    const pityBonus = Math.floor(dropsSinceRare / 10) * 0.01
    const finalChance = Math.min(baseChance + pityBonus, 1.0)

    if (Math.random() < finalChance) {
        dropsSinceRare = 0
        return true
    }
    return false
}

// Drop garantizado después de threshold
const PITY_THRESHOLD = 100
if (dropsSinceRare >= PITY_THRESHOLD) {
    dropsSinceRare = 0
    return true
}
```

---

## Reward Schedules

### Tipos de Refuerzo (Psicología del Comportamiento)

Basado en los estudios de B.F. Skinner, aplicados a juegos:

**Fixed Ratio** (cada N kills):
```javascript
if (totalKills % 10 === 0) giveReward()
// Predecible, bueno para milestones
```

**Variable Ratio** (chance random por kill):
```javascript
if (Math.random() < 0.1) giveReward()
// Adictivo, bueno para loot drops - EL MÁS EFECTIVO
```

**Fixed Interval** (cada N segundos):
```javascript
if (timeSinceLastReward > 30) giveReward()
// Ritmo constante, bueno para idle games
```

### Timing Óptimo de Rewards

| Tipo de Reward | Schedule | Frecuencia |
|----------------|----------|------------|
| XP/Score | Cada acción | Feedback instantáneo |
| Level up | Fixed ratio | Cada 1-3 minutos |
| Rare drop | Variable ratio | Cada 5-10 minutos |
| Achievement | Milestone | Highlights de sesión |

### La Regla de los 30 Segundos

Según múltiples charlas de GDC, los jugadores deben recibir *algún* feedback positivo cada 30 segundos:
- Feedback visual (partículas, sonidos)
- Progreso pequeño (números de XP)
- Near-miss excitement (el enemigo casi te da)

---

## Economy Balance

### Economía Saludable

**Regla de oro**: Los drains deben exceder ligeramente a los faucets a largo plazo

- **Corto plazo**: Jugador se siente rico, puede mejorar
- **Largo plazo**: Aún tiene metas, nada se siente "gratis"

### Prevención de Inflación

```javascript
// Escalar costos con nivel del jugador
function getUpgradeCost(baseAmount, playerLevel) {
    return Math.floor(baseAmount * (1 + playerLevel * 0.1))
}

// Limitar moneda máxima
const MAX_CURRENCY = 99999
currency = Math.min(currency + earned, MAX_CURRENCY)
```

### Testing de Economía

Simular 100 runs para verificar:

1. **Tiempo al primer upgrade**: 1-2 minutos (quick win)
2. **Tiempo a build máximo**: 30-60 minutos (journey satisfactorio)
3. **Moneda sobrante al max**: Cerca de cero (nada desperdiciado)
4. **Tiempo "muerto" sin nada que comprar**: < 10% del tiempo de juego

```javascript
function simulateEconomy(runs = 100) {
    const results = []
    for (let i = 0; i < runs; i++) {
        const { timeToFirstUpgrade, timeToMax, wastedCurrency } = simulateRun()
        results.push({ timeToFirstUpgrade, timeToMax, wastedCurrency })
    }
    return {
        avgFirstUpgrade: average(results.map(r => r.timeToFirstUpgrade)),
        avgTimeToMax: average(results.map(r => r.timeToMax)),
        avgWaste: average(results.map(r => r.wastedCurrency))
    }
}
```

### Métricas Clave (KPIs de Economía)

Según la charla de GDC sobre Settlers Online:

| Métrica | Objetivo | Alerta |
|---------|----------|--------|
| Time to first purchase | < 5 min | > 10 min |
| Currency velocity | 70-90% gastado | < 50% gastado |
| Sink diversity | 3+ sinks usados | 1 sink domina |

---

## Referencias Adicionales

- [Lost Ark Economy Deep Dive](https://www.deconstructoroffun.com/blog/2022/3/14/lost-ark-deep-dive) - Deconstructor of Fun
- [Diablo IV Economy Analysis](https://www.deconstructoroffun.com/blog/diablo-iv) - Análisis moderno
- [Extra Credits: Game Economy](https://www.youtube.com/watch?v=W39TtF14i8I) - Introducción visual
