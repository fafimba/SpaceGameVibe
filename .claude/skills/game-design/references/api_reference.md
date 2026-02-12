# Game Design Quick Reference

## Cheatsheet de Fórmulas

### Progresión XP

```javascript
// Lineal (casual)
xpForLevel = baseXP + (level * increment)

// Exponencial (roguelike, RPG) - MÁS COMÚN
xpForLevel = baseXP * Math.pow(multiplier, level - 1)

// Polinomial (endless)
xpForLevel = baseXP * Math.pow(level, exponent)
```

**Valores típicos**:
| Género | Base | Multiplicador | Max Level |
|--------|------|---------------|-----------|
| Casual | 50-100 | 1.1-1.2 | 20-30 |
| Roguelike | 10-50 | 1.3-1.5 | 15-25 |
| RPG | 100-500 | 1.1-1.15 | 50-100 |

---

### Escalado de Enemigos

```javascript
// HP
enemyHP = baseHP * (1 + (wave * 0.15))

// Daño (más lento que HP)
enemyDamage = baseDamage * (1 + (wave * 0.08))

// Con tope máximo
hpMultiplier = Math.min(1 + (wave * 0.2), 5.0)
```

---

### Drop Rates

| Rareza | Probabilidad | Color típico |
|--------|--------------|--------------|
| Común | 80-100% | Blanco/Gris |
| Uncommon | 10-20% | Verde |
| Rare | 2-5% | Azul |
| Epic | 0.5-1% | Púrpura |
| Legendary | 0.1% | Naranja/Dorado |

```javascript
// Pity system básico
const PITY_INCREASE = 0.01  // +1% por intento fallido
const PITY_THRESHOLD = 100  // Garantizado en intento 100
```

---

### Timing de Feedback (Game Feel)

| Evento | Tiempo (ms) |
|--------|-------------|
| Input → acción | <16 (1 frame) |
| Hit confirmation | 50 |
| Damage numbers | 100 |
| Death animation | 300-500 |
| XP collection | 200 |
| Screen shake | 50-100 |

---

### Flow de Sesión

```
Minutos   Fase            Objetivo
0-5       Opening         Enseñar, ganar confianza
5-20      Rising          Incrementar challenge
20-40     Climax          Dificultad peak
40+       Resolution      Cierre satisfactorio
```

**Regla de los 30 segundos**: Feedback positivo cada 30 seg mínimo.

---

### Composición de Waves

```javascript
// Template para roguelike
wave 1-5:   80% básico, 20% shooter
wave 6-10:  60% básico, 30% shooter, 10% especial
wave 11+:   40% básico, 30% shooter, 30% especial

// Breathing room cada 5 waves
// Boss cada 10 waves
```

---

### Reward Schedules

| Tipo | Cuándo usar | Engagement |
|------|-------------|------------|
| Fixed Ratio | Cada N kills | Medio |
| Variable Ratio | Random % | **Alto** |
| Fixed Interval | Cada N segundos | Bajo |

```javascript
// Variable ratio (más adictivo)
if (Math.random() < 0.1) giveReward()
```

---

### Power Curve del Jugador

- **Por nivel**: +10-20% de poder
- **TTK básicos early**: 1-2 golpes
- **TTK básicos late**: 3-5 golpes
- **Si TTK > 5 segundos**: Gameplay se siente lento

---

### Métricas Objetivo

| KPI | Objetivo | Alerta |
|-----|----------|--------|
| Time to first upgrade | <2 min | >5 min |
| Upgrades por hora | 12-30 | <10 |
| Tiempo entre deaths | 3-5 min | <1 min o >10 min |
| Currency velocity | 70-90% gastado | <50% |

---

### Modelo Hook (Retention)

```
TRIGGER → ACTION → VARIABLE REWARD → INVESTMENT → (loop)
```

**Investment types**: Tiempo, esfuerzo, social, dinero, datos personalizados.

---

## Código Útil

### Screen Shake

```javascript
function screenShake(intensity, duration) {
    const startTime = Date.now()
    function shake() {
        const elapsed = Date.now() - startTime
        if (elapsed < duration) {
            const decay = 1 - (elapsed / duration)
            camera.x += (Math.random() - 0.5) * intensity * decay
            camera.y += (Math.random() - 0.5) * intensity * decay
            requestAnimationFrame(shake)
        }
    }
    shake()
}
```

### Damage Numbers

```javascript
function showDamageNumber(position, damage, isCrit = false) {
    const text = document.createElement('div')
    text.textContent = damage
    text.className = isCrit ? 'damage-crit' : 'damage-normal'
    text.style.left = position.x + 'px'
    text.style.top = position.y + 'px'
    document.body.appendChild(text)

    // Float up and fade
    setTimeout(() => text.remove(), 1000)
}
```

### Pity System

```javascript
class PitySystem {
    constructor(baseChance, pityIncrease, guarantee) {
        this.baseChance = baseChance
        this.pityIncrease = pityIncrease
        this.guarantee = guarantee
        this.attempts = 0
    }

    roll() {
        this.attempts++
        const chance = this.baseChance + (this.attempts * this.pityIncrease)

        if (this.attempts >= this.guarantee || Math.random() < chance) {
            this.attempts = 0
            return true
        }
        return false
    }
}
```
