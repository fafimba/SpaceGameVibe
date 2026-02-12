# Risk of Rain 2 - Item Reference

## Item Tiers

### Common (White) - 36 Items
First items obtained, powerful in quantity.

| Item | Effect | Stacking |
|------|--------|----------|
| **Soldier's Syringe** | +15% attack speed | Linear (+15% per) |
| **Tougher Times** | 15% block chance | Hyperbolic (caps ~90%) |
| **Paul's Goat Hoof** | +14% movement speed | Linear (+14% per) |
| **Lens-Maker's Glasses** | +10% crit chance | Linear (caps at 100%) |
| **Crowbar** | +75% damage to enemies >90% HP | Linear (+75% per) |
| **Tri-Tip Dagger** | 10% chance to bleed (240% dmg) | Linear (+10% per) |
| **Gasoline** | Kill = explosion + burn area | Linear (area + duration) |
| **Sticky Bomb** | 5% chance for 180% explosion | Linear (+5% per) |
| **Bundle of Fireworks** | 8 fireworks on chest open | Linear (+8 per) |
| **Energy Drink** | +25% sprint speed | Linear (+25% per) |
| **Backup Magazine** | +1 secondary charge | Linear (+1 per) |
| **Cautious Slug** | +3 HP/s outside combat | Linear (+3 per) |
| **Personal Shield Generator** | +8% max HP as shield | Linear (+8% per) |

### Uncommon (Green) - 42 Items
Rarer, more impactful effects.

| Item | Effect | Stacking |
|------|--------|----------|
| **AtG Missile Mk. 1** | 10% chance → 300% missile | Linear (+300% dmg per) |
| **Predatory Instincts** | Crit = +12% attack speed (3s) | Linear (max stacks +2) |
| **Ukulele** | 25% chain lightning 80% dmg | Linear (+2 targets per) |
| **Will-o'-the-wisp** | Kill = explosion 350% dmg | Linear (+280% per) |
| **Harvester's Scythe** | Crit = +8 heal | Linear (+4 heal per) |
| **Hopoo Feather** | +1 extra jump | Linear (+1 per) |
| **Fuel Cell** | +1 equipment charge, -15% CD | Mixed stacking |
| **Old Guillotine** | Execute elites <13% HP | Hyperbolic |
| **Berzerker's Pauldron** | Kill 4 enemies = +6s frenzy | Linear (+4s per) |
| **Lepton Daisy** | Heal 50% in teleporter | Linear (+50% per) |
| **Wax Quail** | Jump while sprinting = boost | Linear (+10m per) |

### Legendary (Red) - 36 Items
~1% from small chest, ~20% from large.

| Item | Effect | Stacking |
|------|--------|----------|
| **57 Leaf Clover** | All RNG rolls get extra chance | +1 reroll per stack |
| **Brilliant Behemoth** | All attacks explode (60% dmg) | Linear (+60% per) |
| **Ceremonial Dagger** | Kill = 3 seeking daggers | Linear (+3 per) |
| **Frost Relic** | Kill = icicle storm (3x100%) | Linear (+3 icicles per) |
| **N'kuhana's Opinion** | Heal = skull 250% stored HP | Linear (+250% per) |
| **Rejuvenation Rack** | +100% healing | Linear (+100% per) |
| **Resonance Disc** | Kill charges disc, fires | Linear (+charge per) |
| **Sentient Meat Hook** | 20% chance hook 100% dmg | Linear (+10% per) |
| **Shattering Justice** | Hit 5x = -60 armor (8s) | Linear (+8s per) |
| **Soulbound Catalyst** | Kill = -4s equipment CD | Linear (-2s per) |
| **Unstable Tesla Coil** | Constant lightning (200%) | Linear (+100% per) |
| **Alien Head** | -25% cooldowns | Hyperbolic |

### Boss (Yellow) - Dropped by specific bosses

| Item | Source Boss | Effect |
|------|-------------|--------|
| **Titanic Knurl** | Stone Titan | +40 HP, +1.6 HP/s |
| **Queen's Gland** | Beetle Queen | Summon beetle guard ally |
| **Shatterspleen** | Imp Overlord | Crit = bleed, bleed explode |
| **Genesis Loop** | Wandering Vagrant | <25% HP = explosion (6000%) |
| **Little Disciple** | Grovetender | Fire wisps while sprinting |
| **Empathy Cores** | Solus Control Unit | Summon probes |

### Lunar (Blue) - Powerful with drawbacks

| Item | Upside | Downside |
|------|--------|----------|
| **Shaped Glass** | +100% damage | -50% max HP |
| **Transcendence** | HP → shields (+50%) | No health, no healing |
| **Gesture of Drowned** | -50% equipment CD | Auto-activates randomly |
| **Brittle Crown** | Kill = gold | Lose gold when hit |
| **Corpsebloom** | +100% healing | Healing over time |

### Void (Purple) - Corrupts other items

| Item | Corrupts | New Effect |
|------|----------|------------|
| **Safer Spaces** | Tougher Times | Block every 15s (guaranteed) |
| **Pluripotent Larva** | Dio's Best Friend | Respawn as different survivor |
| **Singularity Band** | Kjaro/Runald Band | Black hole on hit |

## Stacking Formulas

### Linear Stacking
`Total = Base × Stacks`
- Simple multiplication
- Example: 10 Goat Hoofs = 140% speed bonus

### Hyperbolic Stacking
`Chance = 1 - (1 / (1 + Coefficient × Stacks))`
- Diminishing returns, never reaches 100%
- Sweet spot: 8-12 stacks
- Example: Tougher Times approaches ~90% but never reaches

### Multiplicative Stacking (between items)
`Total = Base × Item1 × Item2 × ...`
- Different items multiply together
- Focus Crystal × ATG × Crowbar = massive burst

## Synergy Categories

### On-Kill Chains
- Ceremonial Daggers → Will-o'-the-wisp → Gasoline
- Each kill triggers explosions → more kills → more triggers

### Crit Builds
- Lens-Maker's Glasses + Predatory Instincts + Harvester's Scythe
- Stack glasses to 90%, 10% from other sources

### On-Hit Procs
- Ukulele + AtG Missile + Sticky Bomb
- High attack speed = more procs

### Healing Loops
- N'kuhana's Opinion + Rejuvenation Rack + Harvester's Scythe
- Overheal converts to damage skulls

## Design Principles Observed

### 1. Risk/Reward (Lunar Items)
- Powerful upside always paired with significant downside
- Player choice creates build diversity

### 2. Stacking Limits
- Percentage effects use hyperbolic to prevent 100%
- Flat effects can stack infinitely for power fantasy

### 3. Proc Chains
- On-kill effects can trigger each other
- Creates emergent gameplay and screen-clearing builds

### 4. Tier Power Budget
- Commons: Simple stat boosts
- Uncommons: Conditional effects or procs
- Legendaries: Build-defining abilities
- Lunars: Extreme power with extreme cost
