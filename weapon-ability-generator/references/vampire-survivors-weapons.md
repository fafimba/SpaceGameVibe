# Vampire Survivors - Weapon Reference

## Weapon Categories

### 1. Projectile Weapons
Fire attacks in specific directions, scale with projectile count, speed, and pierce.

| Weapon | Behavior | Evolution | Catalyst |
|--------|----------|-----------|----------|
| **Magic Wand** | Auto-targets nearest enemy | Holy Wand | Empty Tome |
| **Knife** | Fires rapidly in facing direction | Thousand Edge | Bracer |
| **Fire Wand** | Shoots fireballs, higher damage | Hellfire | Spinach |
| **Runetracer** | Bounces off walls | NO FUTURE | Armor |
| **Phiera Der Tuphello** | Fires at random angle | Phieraggi | Tiragisú (8 weapons) |
| **Eight The Sparrow** | Fires at random angle | Phieraggi | Tiragisú (8 weapons) |

### 2. Area/AoE Weapons
Create damage zones around or near the player.

| Weapon | Behavior | Evolution | Catalyst |
|--------|----------|-----------|----------|
| **Garlic** | Aura around player, knockback | Soul Eater | Pummarola |
| **Santa Water** | Drops damaging pools on ground | La Borra | Attractorb |
| **Lightning Ring** | Strikes random enemies on screen | Thunder Loop | Duplicator |
| **Song of Mana** | Vertical beams across screen | Mannajja | Skull O'Maniac |

### 3. Orbital Weapons
Revolve around the player, blocking and damaging.

| Weapon | Behavior | Evolution | Catalyst |
|--------|----------|-----------|----------|
| **King Bible** | Orbiting books | Unholy Vespers | Spellbinder |
| **Peachone** | White bird orbit | Vandalier | Ebony Wings (Union) |
| **Ebony Wings** | Black bird orbit | Vandalier | Peachone (Union) |

### 4. Melee/Close Range Weapons
Attack in specific patterns near the player.

| Weapon | Behavior | Evolution | Catalyst |
|--------|----------|-----------|----------|
| **Whip** | Horizontal slash, passes through | Bloody Tear | Hollow Heart |
| **Axe** | Thrown in arc, high damage | Death Spiral | Candelabrador |
| **Cross** | Boomerang pattern | Heaven Sword | Clover |

### 5. Utility/Special Weapons
Provide non-damage benefits or unique mechanics.

| Weapon | Behavior | Evolution | Catalyst |
|--------|----------|-----------|----------|
| **Clock Lancet** | Freezes enemies, no damage | Infinite Corridor | Silver/Gold Ring |
| **Laurel** | Shield that blocks damage | Crimson Shroud | Metaglio Left/Right |

## Evolution System

### Requirements
1. Base weapon at max level (usually 8)
2. Correct passive item in inventory
3. Open a chest after 10-minute mark

### Evolution Types
- **Standard**: Weapon + Passive = Evolved Weapon
- **Union**: Weapon + Weapon = Combined Weapon (frees slot)
- **Gift**: Meets conditions = Bonus weapon/item added
- **Morph**: Character transformation (rare)

## Weapon Stat Scaling

| Stat | Effect | Example Weapons |
|------|--------|-----------------|
| **Amount** | More projectiles/instances | Knife, Magic Wand |
| **Area** | Larger hitbox/range | Garlic, Santa Water |
| **Cooldown** | Faster attacks | All weapons |
| **Duration** | Longer active time | King Bible, Santa Water |
| **Speed** | Faster projectile movement | Knife, Runetracer |
| **Might** | More damage | All weapons |
| **Pierce** | Hits more enemies | Knife, Whip |

## Design Patterns Observed

### Pattern 1: Simple → Complex Evolution
- Base weapon has simple mechanic
- Evolution adds secondary effect (lifesteal, explosion, chain)
- Example: Whip → Bloody Tear (adds lifesteal + crit)

### Pattern 2: Area Coverage Types
- **Point**: Exact location damage (Santa Water drops)
- **Circle**: Around player (Garlic, King Bible orbit)
- **Line**: Directional (Whip horizontal, Song of Mana vertical)
- **Random**: Screen-wide random (Lightning Ring)

### Pattern 3: Trade-offs
- High damage vs low frequency (Axe)
- Auto-aim vs manual direction (Magic Wand vs Knife)
- Defensive vs offensive (Laurel vs any damage weapon)

### Pattern 4: Synergy Through Passives
- Weapons ignore certain stats (Garlic ignores speed/duration)
- Evolution catalyst determines upgrade path
- Build diversity through item combinations
