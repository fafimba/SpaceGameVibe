# Progression Systems

> **Fuentes principales**:
> - [Mathematics of XP](https://onlyagame.typepad.com/only_a_game/2006/08/mathematics_of_.html) - Chris Bateman
> - [Example Level Curve Formulas](https://www.designthegame.com/learning/courses/course/fundamentals-level-curve-design/example-level-curve-formulas-game-progression) - DesignTheGame
> - [GameDesign Math: RPG Level-based Progression](https://www.davideaversa.it/blog/gamedesign-math-rpg-level-based-progression/) - Davide Aversa
> - [The Art of Game Design](https://www.amazon.com/Art-Game-Design-Lenses-Third/dp/1138632058) - Jesse Schell

## Table of Contents
1. [XP Curves](#xp-curves)
2. [Level Scaling](#level-scaling)
3. [Skill Point Distribution](#skill-point-distribution)
4. [Power Creep Management](#power-creep-management)

---

## XP Curves

### Tipos de Fórmulas (según DesignTheGame)

**Lineal** - Juegos casuales, progresión predecible:
```javascript
xpForLevel = baseXP + (level * increment)
// Ejemplo: 100 + (level * 50) → 150, 200, 250...
```

**Exponencial** - RPGs, roguelikes (la más común):
```javascript
xpForLevel = baseXP * Math.pow(multiplier, level - 1)
// Ejemplo: 100 * 1.5^(level-1) → 100, 150, 225, 337...
```

**Polinomial** - Balance entre lineal y exponencial:
```javascript
xpForLevel = baseXP * Math.pow(level, exponent)
// Ejemplo: 10 * level^2 → 10, 40, 90, 160...
```

**Triangular** (usada en RuneScape según Chris Bateman):
```javascript
xpForLevel = Math.floor(level + 300 * Math.pow(2, level / 7)) / 4
// Crecimiento suave que se acelera gradualmente
```

### Valores Recomendados por Género

| Género | Fórmula | Base | Multiplicador | Max Level Típico |
|--------|---------|------|---------------|------------------|
| Casual shooter | Lineal | 50-100 | +25-50 | 20-30 |
| Roguelike | Exponencial | 10-50 | 1.3-1.5 | 15-25 |
| RPG | Exponencial | 100-500 | 1.1-1.2 | 50-100 |
| Endless | Polinomial | 10-20 | ^1.5-2.0 | ∞ |

### Cálculo de Duración de Sesión

Según Davide Aversa, calcular el "time to level":

```javascript
// Objetivo: ¿cuánto debería tardar en subir de nivel?
xpPerMinute = (enemiesPerMinute * xpPerEnemy)
minutesToLevel = xpForLevel / xpPerMinute

// Ejemplo para un shooter:
// 20 enemigos/min * 5 XP/enemigo = 100 XP/min
// Nivel 5 necesita 200 XP → 2 minutos para alcanzar
```

---

## Level Scaling

### Crecimiento de Poder del Jugador

Jesse Schell en "The Art of Game Design" sugiere que cada nivel debe sentirse significativo pero no abrumador:

```javascript
// Boost directo de stats (+10% por nivel)
playerDamage = baseDamage * (1 + (level * 0.1))

// Retornos decrecientes (previene escalado descontrolado)
playerDamage = baseDamage * (1 + Math.log(level + 1) * 0.5)
```

### Escalado de Enemigos para Compensar

```javascript
// Escalado lineal simple
enemyHP = baseHP * (1 + (wave * 0.15))
enemyDamage = baseDamage * (1 + (wave * 0.08))  // Daño crece más lento

// Escalado con topes (previene picos de dificultad)
function getEnemyStats(wave) {
    const hpMultiplier = Math.min(1 + (wave * 0.2), 5.0)   // Tope en 5x
    const dmgMultiplier = Math.min(1 + (wave * 0.1), 3.0)  // Tope en 3x
    return { hp: baseHP * hpMultiplier, damage: baseDamage * dmgMultiplier }
}
```

### La Proporción Dorada (Golden Ratio del TTK)

El jugador debería matar enemigos básicos en:
- Early game: 1-2 golpes
- Mid game: 2-4 golpes
- Late game: 3-5 golpes

Si el TTK (time to kill) excede 5 segundos para enemigos básicos, el gameplay se siente lento.

---

## Skill Point Distribution

### Puntos por Nivel

| Estilo | Puntos/Nivel | Total al Max | Notas |
|--------|--------------|--------------|-------|
| Elecciones significativas | 1 | 15-25 | Cada punto importa |
| Upgrades frecuentes | 2-3 | 50-75 | Dopamina constante |
| Híbrido | 1 early, 2 late | 30-40 | Escala con complejidad |

### Estructuras de Skill Tree (según Jesse Schell)

**Ancho y Superficial** (juegos de acción):
```
[A] [B] [C] [D] [E]   ← 5 caminos independientes
 |   |   |   |   |
[+] [+] [+] [+] [+]   ← Cada uno tiene 1-2 mejoras
```

**Estrecho y Profundo** (RPGs):
```
      [Inicio]
         |
    [Elección 1]
       /   \
   [2a]    [2b]
     |       |
   [3a]    [3b]
     |       |
   [Ult A] [Ult B]
```

**Patrón Diamante** (roguelikes - permite builds híbridos):
```
        [Base]
       /      \
   [Path A] [Path B]
       \      /
       [Sinergia]
       /      \
  [Final A] [Final B]
```

### Diseño de Prerequisitos

```javascript
const skillTree = {
    laser_base: { requires: [], cost: 0 },
    laser_dmg1: { requires: ['laser_base'], cost: 1 },
    laser_dmg2: { requires: ['laser_dmg1'], cost: 2 },
    spread_shot: { requires: ['laser_dmg1'], cost: 2 },  // Punto de bifurcación
    ultimate: { requires: ['laser_dmg2', 'spread_shot'], cost: 3 }  // Convergencia
}
```

---

## Power Creep Management

### Identificar Power Creep

Señales de poder descontrolado:
- Jugadores one-shot a todos los enemigos
- Contenido nuevo es trivial al lanzarse
- Contenido viejo completamente ignorado
- Picos de dificultad artificiales (sobrecompensación)

### Estrategias de Prevención

**Soft Caps** (límites suaves):
```javascript
function getEffectiveStat(baseStat, bonuses) {
    const threshold = baseStat * 2
    const total = baseStat + bonuses
    if (total > threshold) {
        const excess = total - threshold
        return threshold + (excess * 0.5)  // 50% efectividad pasado el tope
    }
    return total
}
```

**Escalado Porcentual** (en vez de plano):
```javascript
// En lugar de +10 daño plano:
damageBonus = baseDamage * 0.15  // +15% del base
// Esto escala naturalmente y previene problemas de stacking
```

**Soft Counters de Enemigos**:
- Build de alto daño → Enemigos con reducción de daño
- Build de alta velocidad → Enemigos con ataques homing
- Build AoE → Spawns de enemigos más dispersos

### Checklist de Rebalanceo

Al añadir contenido nuevo:
1. Calcular DPS teórico máximo con el nuevo item
2. Comparar con DPS máximo actual
3. Si >20% de incremento, ajustar o añadir counters
4. Testear en nivel 1, mid-level, y max level
5. Verificar que no surjan skills "obligatorias"

---

## Referencias Adicionales

- [GDC: Balancing for Skill](https://www.gdcvault.com/browse/gdc-16/play/1023559) - Charla sobre balance de dificultad
- [Gamasutra: The Chemistry of Game Design](https://www.gamedeveloper.com/design/the-chemistry-of-game-design) - Daniel Cook
