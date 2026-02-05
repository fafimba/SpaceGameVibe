---
name: weapon-ability-generator
description: |
  Generate new weapons, abilities, and power-ups for survivors/roguelike games.
  Use when: designing new weapons for Stellar Swarm or similar games, brainstorming
  ability ideas, creating upgrade trees, balancing existing weapons, or generating
  variations of existing mechanics. Includes design patterns from Vampire Survivors,
  Risk of Rain 2, and roguelike game design principles.
---

# Weapon & Ability Generator

Generate balanced, engaging weapons and abilities for survivors-style games.

## Quick Start

1. Read [design-principles.md](references/design-principles.md) for core concepts
2. Reference [vampire-survivors-weapons.md](references/vampire-survivors-weapons.md) for weapon archetypes
3. Reference [risk-of-rain-items.md](references/risk-of-rain-items.md) for item/stacking patterns
4. Follow the generation workflow below

## Generation Workflow

### Step 1: Define the Request
Clarify with user:
- **Type**: Weapon, passive ability, or active skill?
- **Role**: Damage, defense, utility, or hybrid?
- **Feel**: What fantasy should this fulfill?

### Step 2: Select Archetype
Choose base archetype from design-principles.md:

| Archetype | Best For |
|-----------|----------|
| Projectile | Consistent damage, skill expression |
| AoE | Crowd control, area denial |
| Orbital | Passive protection, lazy builds |
| Burst | Boss damage, satisfying hits |
| Utility | Build diversity, support options |

### Step 3: Define Core Mechanic
Create ONE clear, unique mechanic:

```
[TRIGGER] → [EFFECT] → [SCALING]

Examples:
- "Every 3rd shot" → "Explodes" → "Scales with Area"
- "On kill" → "Spawn drone" → "Scales with Duration"
- "Passively" → "Pull nearby XP" → "Scales with Range"
```

### Step 4: Add Interesting Decision
Apply push-pull principle:

| Push (Reward) | Pull (Cost/Condition) |
|---------------|----------------------|
| High damage | Slow fire rate |
| Auto-aim | Lower base damage |
| Large area | Self-damage risk |
| Strong buff | Limited duration |
| No cooldown | Requires positioning |

### Step 5: Design Progression (8 Levels)
```
Lvl 1: Base effect
Lvl 2-3: +Stat (amount, damage, area)
Lvl 4-5: +Stat + minor effect
Lvl 6-7: Significant stat boost
Lvl 8: Capstone (new mechanic or large boost)
```

### Step 6: Create Evolution Path
Define evolution requirements:
- Required passive item (catalyst)
- Evolved name (evocative, powerful)
- New effect (not just stat boost)

### Step 7: Check Synergies
Ensure it synergizes with existing content:
- What passives enhance it?
- What builds does it enable?
- Does it create "broken" combos? (This can be good!)

## Output Format

Generate weapons in this format:

```markdown
## [WEAPON NAME]

**Type**: [Projectile/AoE/Orbital/Burst/Utility]
**Fantasy**: [One sentence describing the feel]

### Base Effect
[Clear description of what it does]

### Stats
- Base Damage: X
- Cooldown: X seconds
- Area: X pixels (if applicable)
- Duration: X seconds (if applicable)

### Scaling
- **Amount**: [How more projectiles/instances affect it]
- **Area**: [How larger area affects it]
- **Cooldown**: [How faster cooldown affects it]
- **Duration**: [How longer duration affects it]

### Level Progression
| Level | Effect |
|-------|--------|
| 1 | Base effect |
| 2 | +X Damage |
| 3 | +X Amount |
| 4 | +X Damage, +Y Area |
| 5 | +X Amount |
| 6 | +X Damage, special effect |
| 7 | +X Amount, +Y Area |
| 8 | [Capstone: new mechanic] |

### Evolution
- **Name**: [Evolved weapon name]
- **Catalyst**: [Required passive item]
- **New Effect**: [What the evolution adds]

### Synergies
- Works well with: [List 2-3 passives/weapons]
- Enables builds: [Describe build archetype]

### Design Notes
[Why this weapon is interesting, what decisions it creates]
```

## Batch Generation

For generating multiple weapons at once:

1. Define theme or category (fire weapons, defensive abilities, etc.)
2. Ensure variety across archetypes
3. Create 1-2 obvious synergies between them
4. Check no two weapons feel redundant

## Balance Checklist

Before finalizing, verify:
- [ ] Unique from existing weapons
- [ ] Clear use case / build role
- [ ] Interesting decision for player
- [ ] Scales appropriately (not too weak/strong)
- [ ] Evolution feels rewarding
- [ ] Has synergy potential
- [ ] Fits 3-8 minute session length
- [ ] Name is evocative and memorable

## Quick Idea Generators

### Random Mechanic Combos
Roll from each column:

| Trigger | Effect | Modifier |
|---------|--------|----------|
| On hit | Explosion | Every Xth |
| On kill | Spawn minion | When HP < 50% |
| Passive | Shield | While moving |
| Timed | Beam | After X kills |
| Proximity | Slow enemies | Near boss |

### Thematic Sets
Generate coherent weapon sets:
- **Fire**: DoT focused, spreading, explosive
- **Ice**: Slow, freeze, shatter mechanics
- **Electric**: Chain, stun, speed-based
- **Void**: Risk/reward, corruption, transformation
- **Tech**: Drones, turrets, automation

## Reference Files

For detailed information, read these files:
- [design-principles.md](references/design-principles.md): Core design philosophy
- [vampire-survivors-weapons.md](references/vampire-survivors-weapons.md): VS weapon patterns
- [risk-of-rain-items.md](references/risk-of-rain-items.md): RoR2 item patterns
