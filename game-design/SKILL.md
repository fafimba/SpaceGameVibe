---
name: game-design
description: |
  Game Design skill for creating and balancing video games. Use this skill when:
  - Designing game progression systems (XP, levels, skill trees, unlocks)
  - Creating or balancing game economy (currencies, rewards, drop rates)
  - Structuring game loops (core loop, engagement loop, retention)
  - Balancing difficulty curves and player power scaling
  - Designing reward schedules and player motivation systems
  - Adding new features, weapons, enemies, or mechanics to games
  TRIGGERS: game design, game balance, progression system, XP curve, skill tree, game economy, game loop, difficulty curve, enemy scaling, reward system, roguelike, shooter, RPG mechanics
---

# Game Design

## Overview

This skill provides frameworks and formulas for designing engaging game systems. It covers three core pillars: **Progression**, **Economy**, and **Game Loops**.

## Quick Reference

| System | Key Concept | Reference |
|--------|-------------|-----------|
| Progression | XP curves, level scaling | [progression.md](references/progression.md) |
| Economy | Currencies, rewards, sinks | [economy.md](references/economy.md) |
| Game Loops | Core/meta/engagement loops | [loops.md](references/loops.md) |
| **Cheatsheet** | Fórmulas y valores rápidos | [api_reference.md](references/api_reference.md) |

## Core Design Principles

### 1. The Core Loop

Every game has a core loop - the fundamental cycle players repeat:

```
[Action] → [Reward] → [Progression] → [New Challenge] → repeat
```

For a shooter like Stellar Swarm:
```
Kill enemies → Get XP → Level up/unlock skills → Face harder waves → repeat
```

### 2. Progression Formula

Standard XP curve (exponential growth):

```javascript
xpForLevel = baseXP * Math.pow(multiplier, level - 1)
```

- **baseXP**: Starting XP requirement (e.g., 10-100)
- **multiplier**: Growth factor (1.2 = gentle, 1.5 = steep, 2.0 = aggressive)

### 3. Difficulty Scaling

Enemy stats should scale with player power:

```javascript
enemyHP = baseHP * (1 + (wave * scalingFactor))
enemyDamage = baseDamage * (1 + (wave * scalingFactor * 0.5))
```

Keep damage scaling lower than HP to avoid one-shots.

### 4. Reward Timing

- **Variable ratio**: Random rewards (slot machine effect) - highest engagement
- **Fixed interval**: Rewards every X time/actions - predictable, less exciting
- **Fixed ratio**: Rewards every X kills - clear goals

## Workflow: Adding New Features

### Adding a New Weapon/Skill

1. Define the **fantasy** (what does it feel like to use?)
2. Set **base stats** using existing weapons as reference
3. Create **upgrade path** (2-3 tiers typical)
4. Balance against existing options (not strictly better/worse)
5. Test feel at low AND high power levels

### Adding a New Enemy Type

1. Define **role** (tank, DPS, support, special)
2. Set HP relative to player DPS (seconds to kill)
3. Define **behavior pattern** (chase, shoot, special ability)
4. Set threat level (damage per second to player)
5. Determine **spawn conditions** (wave number, frequency)

### Balancing Economy

1. Identify all **sources** (how players earn currency/rewards)
2. Identify all **sinks** (how they spend it)
3. Calculate **flow rate** (income per minute of play)
4. Ensure sinks slightly exceed sources for long-term engagement

## Common Patterns

### Skill Tree Design

```
       [Base Skill]
          /    \
    [Path A]  [Path B]    ← Branching choices
       |         |
   [A upgrade] [B upgrade]
       \         /
        [Ultimate]        ← Convergence reward
```

### Power Curve

Player should feel ~10-20% stronger each level:
- Too little = grind feels pointless
- Too much = trivializes content too fast

### Enemy Wave Composition

```
Wave 1-5:   80% basic, 20% shooter
Wave 6-10:  60% basic, 30% shooter, 10% special
Wave 11+:   40% basic, 30% shooter, 30% special
```

## References

For detailed formulas and examples, see:

- **[references/progression.md](references/progression.md)** - XP curves, level scaling, skill point distribution
- **[references/economy.md](references/economy.md)** - Currency systems, drop rates, reward schedules
- **[references/loops.md](references/loops.md)** - Core loops, session design, retention mechanics

## Fuentes Principales

Este skill está basado en fuentes verificadas de la industria:

### Libros
- [The Art of Game Design: A Book of Lenses](https://www.amazon.com/Art-Game-Design-Lenses-Third/dp/1138632058) - Jesse Schell
- [A Theory of Fun for Game Design](https://www.theoryoffun.com/) - Raph Koster
- [Game Feel](https://www.amazon.com/Game-Feel-Designers-Sensation-Kaufmann/dp/0123743281) - Steve Swink
- [Hooked: How to Build Habit-Forming Products](https://www.nirandfar.com/hooked/) - Nir Eyal
- [Flow: The Psychology of Optimal Experience](https://www.amazon.com/Flow-Psychology-Experience-Perennial-Classics/dp/0061339202) - Csikszentmihalyi

### GDC Vault (Charlas de profesionales)
- [Design and Monetization Strategies](https://www.gdcvault.com/play/1020027/Design-and-Monetization-Strategies-in) - Análisis de Candy Crush, Clash of Clans
- [Monetizing Economy Based F2P Games](https://www.gdcvault.com/play/1016578/Monetizing-Economy-Based-Free-to) - The Settlers Online

### Blogs y Análisis
- [Deconstructor of Fun](https://www.deconstructoroffun.com/) - Análisis de economías de juegos modernos
- [GameDesignSkills](https://gamedesignskills.com/game-design/core-loops-in-gameplay/) - Tutoriales de core loops
- [GameAnalytics](https://www.gameanalytics.com/blog/how-to-perfect-your-games-core-loop) - Optimización con datos

### Matemáticas de Game Design
- [Mathematics of XP](https://onlyagame.typepad.com/only_a_game/2006/08/mathematics_of_.html) - Chris Bateman
- [GameDesign Math: RPG Progression](https://www.davideaversa.it/blog/gamedesign-math-rpg-level-based-progression/) - Davide Aversa
