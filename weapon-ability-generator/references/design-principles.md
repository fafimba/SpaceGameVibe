# Weapon & Ability Design Principles

## Core Design Philosophy

### The "Push-Pull" Principle
Every weapon/ability should create interesting decisions:
- **Push**: Encourages a playstyle (aggressive, defensive, mobile)
- **Pull**: Requires trade-offs or positioning

Bad: "Deal 100 damage" (no decision)
Good: "Deal 200 damage to enemies behind you" (positioning decision)

### Risk/Reward Trade-offs
Items should rarely be "no-brainer" picks:
- High damage but slow
- Auto-aim but lower damage
- Area effect but hits self
- Powerful but conditional

## Weapon Archetypes for Survivors Games

### Archetype 1: Basic Projectile
**Purpose**: Reliable consistent damage
- Fires toward cursor/enemies
- Scales with: amount, pierce, speed
- Examples: Magic Wand, Knife

**Variations**:
- Homing vs straight
- Single target vs pierce
- Fast/weak vs slow/strong

### Archetype 2: Area of Effect (AoE)
**Purpose**: Crowd control, area denial
- Damages zones around/near player
- Scales with: area, duration, damage
- Examples: Garlic, Santa Water

**Variations**:
- Centered on player vs dropped on ground
- Persistent vs pulse damage
- Knockback vs slow vs pure damage

### Archetype 3: Orbital
**Purpose**: Passive protection + damage
- Revolves around player
- Scales with: amount, speed, area
- Examples: King Bible, Peachone

**Variations**:
- Close orbit vs far orbit
- Fast rotation vs slow
- Blocking projectiles vs pass-through

### Archetype 4: Burst/Nuke
**Purpose**: High damage, cooldown-gated
- Single powerful attack
- Scales with: damage, cooldown, area
- Examples: Axe, Lightning strike

**Variations**:
- Targeted vs random
- Instant vs delayed
- Single hit vs DoT

### Archetype 5: Utility/Support
**Purpose**: Survival, buffs, debuffs
- Non-damage primary function
- Scales with: duration, cooldown, effect strength
- Examples: Clock Lancet (freeze), Laurel (shield)

**Variations**:
- Defensive (shield, heal, dodge)
- Control (freeze, slow, stun)
- Buff (speed, damage boost)

## Ability Effect Categories

### Damage Effects
| Effect | Description | Balance Notes |
|--------|-------------|---------------|
| Direct | Instant damage | Base, scales well |
| DoT | Damage over time | Lower per-tick, stacks |
| Execute | Bonus vs low HP | High risk/reward |
| Splash | Area on impact | Lower single-target |
| Chain | Jumps to nearby | Caps at X targets |

### Control Effects
| Effect | Description | Balance Notes |
|--------|-------------|---------------|
| Slow | Reduce move speed | 20-50% typical |
| Freeze | Complete stop | Short duration |
| Knockback | Push enemies | Disrupts patterns |
| Pull | Gather enemies | Combo enabler |
| Stun | Interrupt attacks | Brief, high value |

### Defensive Effects
| Effect | Description | Balance Notes |
|--------|-------------|---------------|
| Shield | Absorb X damage | Regenerates or not |
| Dodge | Invulnerability frame | Skill expression |
| Block | Chance negate hit | Percentage based |
| Reflect | Return damage | Risk/reward |
| Heal | Restore HP | Per kill/hit/time |

### Utility Effects
| Effect | Description | Balance Notes |
|--------|-------------|---------------|
| Speed boost | Move faster | Duration limited |
| Magnet | Pull XP/pickups | QoL focused |
| Vision | Reveal enemies | Minor advantage |
| Gold/XP bonus | More resources | Snowball potential |

## Synergy Design Patterns

### Pattern 1: Stat Amplification
One ability boosts stats another uses:
- "Increase crit chance" + "On crit: explode"
- "+Attack speed" + "On hit: 10% proc"

### Pattern 2: Trigger Chains
One effect triggers another:
- "On kill: explosion" + "Explosion can kill" = chain
- "On hit: slow" + "Bonus damage to slowed" = combo

### Pattern 3: Build-Around
Central item defines strategy:
- "All healing doubled" → build healing items
- "Every 10 kills: nuke" → build kill speed

### Pattern 4: Union/Fusion
Two items combine into one stronger:
- Frees up slot for more items
- Reward for specific pairing

## Progression Curves

### Power Per Level (8 levels typical)
```
Level 1: Base power (100%)
Level 2-3: Small boost (+10-15% each)
Level 4-5: Meaningful upgrade (+15-20% each)
Level 6-7: Strong growth (+20-25% each)
Level 8: Capstone, often new mechanic
```

### Evolution Power Spike
Evolved weapons should feel ~2-3x stronger:
- New visual
- Additional effect (not just stat boost)
- Rewards investment

## Balance Guidelines

### Session Length Considerations
For 3-8 minute sessions (Stellar Swarm target):
- Power curve should complete by minute 5-6
- Late game = power fantasy, screen clearing
- Avoid "I need 20 minutes to feel strong"

### Avoid These Pitfalls
1. **Too many similar options**: Each weapon should feel distinct
2. **Clear best choice**: Avoid dominant strategies
3. **Useless options**: Every item should have a build
4. **Complexity creep**: Simple base, complex interactions
5. **Frontloaded power**: Save best for evolution/late game

### The "One More Run" Factor
- Quick feedback on choices
- Visible power growth
- "Next time I'll try X build"
- Death should feel like learning

## Naming Conventions

### Weapon Names
- Action verbs: Slash, Pierce, Blast, Strike
- Descriptive: Frost Nova, Chain Lightning
- Evocative: Soul Reaper, Void Cannon

### Ability Names
- Effect + Element: Fire Burst, Ice Shield
- Fantasy terms: Arcane, Ethereal, Spectral
- Power words: Ultimate, Mega, Hyper (sparingly)

## Sources & Further Reading
- [Gamasutra: Eight Rules of Roguelike Design](https://www.gamedeveloper.com/game-platforms/analysis-the-eight-rules-of-roguelike-design)
- [Vampire Survivors Wiki](https://vampire-survivors.fandom.com/wiki/)
- [Risk of Rain 2 Wiki](https://riskofrain2.fandom.com/wiki/)
- [GDC: Designing for Mastery in Roguelikes](https://www.gdcvault.com/)
