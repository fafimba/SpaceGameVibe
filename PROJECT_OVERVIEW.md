# Stellar Swarm - Documentación del Proyecto

**Última actualización:** 2026-02-12
**Versión:** 2.0 (post-rediseño progresión)

## Descripción General

**Stellar Swarm** es un space shooter tipo vampire survivors desarrollado en HTML5 Canvas con JavaScript vanilla. Single file (`index.html`, ~5000+ líneas). Sesiones cortas (3-8 min), loop adictivo, controles teclado + touch.

## Estado Actual y Dirección

El juego tiene el core loop funcional con 6 armas, 4 tipos de enemigos, sistema de oleadas, XP/niveles y selección de upgrades al subir de nivel. Se ha tomado la decisión de **rediseñar el sistema de progresión**:

- **ELIMINADO**: Sistema de bosses como puerta de desbloqueo de armas (archivado en `_bosses_archived/`)
- **EN DISEÑO**: Sistema de upgrades multi-nivel por arma + evolución capstone
- **EN DISEÑO**: Meta-progresión con moneda persistente + tienda
- **EN DISEÑO**: Sistema de dificultades desbloqueables por puntuación

## Estructura del Proyecto

```
SpaceGameVibe/
├── index.html                    # Juego completo (single file, ~5000+ líneas)
├── .nojekyll                     # Config GitHub Pages
│
├── PROJECT_OVERVIEW.md           # Este archivo
├── CODEBASE_ANALYSIS.md          # Análisis técnico del código
├── WEAPON_EVOLUTION_DESIGN.md    # Diseño de armas, upgrades, tienda, dificultades
├── .claude_context.md            # Referencia rápida para Claude Code
│
├── _bosses_archived/             # Sistema de bosses (desactivado)
│   ├── README.md                 # Razones del archivado + guía reintegración
│   ├── BOSS_SYSTEM_DESIGN.md     # Diseño completo de 5 jefes
│   ├── BOSS_IMPLEMENTATION_PROMPTS.md
│   ├── INTEGRATION_GUIDE.md      # Guía de integración de bosses
│   ├── SYSTEM_ARCHITECTURE.md    # Arquitectura (era pre-rediseño)
│   ├── DOCUMENTATION_INDEX.md    # Índice docs (era pre-rediseño)
│   ├── boss_mockup.html          # Mockup visual de bosses
│   └── boss_system.js            # (PENDIENTE) Código extraído de index.html
│
├── .claude/                      # Configuración Claude Code
│   └── skills/                   # Skills para Claude Code
│       ├── weapon-ability-generator/  # Generar/diseñar armas
│       ├── game-design/               # Diseño de juego general
│       ├── ui-ux-design/              # Diseño de interfaz
│       └── svg-graphics/              # Gráficos vectoriales
│
└── .cursor/                      # Reglas Cursor IDE
    └── rules/
        └── stellar-swarm-architecture.mdc
```

## Sistemas del Juego

### Armas Actuales (6)

| Arma | Tipo | Comportamiento | Estado |
|------|------|---------------|--------|
| Laser Cannon | Proyectil | Auto-fire frontal, cono 60° | Default (siempre disponible) |
| Missile Launcher | Homing | Ráfagas de misiles buscadores | Desbloqueable |
| Orbital Shield | Orbital | 3 orbes rotando alrededor | Desbloqueable |
| Lightning Ray | Chain | Rayos que rebotan entre enemigos | Desbloqueable |
| Plasma Field | AoE | Aura de daño alrededor del jugador | Desbloqueable |
| Alien Drone | Summon | Drones kamikaze al matar enemigos | Desbloqueable |

Cada arma tiene 3 ramas de upgrade. Ver `WEAPON_EVOLUTION_DESIGN.md` para el diseño completo con niveles múltiples y evoluciones.

### Enemigos (4 tipos)

| Tipo | HP | Velocidad | Comportamiento |
|------|-----|-----------|---------------|
| Scout | 4 | 120 | Persigue al jugador |
| Kamikaze | 4 | 180 | Rápido, agresivo |
| Spinner | 4 | 90 | Dispara en patrón circular |
| Tank | 12 | 70 | Lento, resistente, embiste |

HP escala +40% por nivel del jugador.

### Progresión In-Run

- XP por matar enemigos → level up → elegir 1 de 3 upgrades aleatorios
- Fórmula XP: `25 × 1.4^(level-1)`
- Upgrades incluyen: activar armas, mejorar ramas de armas, pasivas

### Meta-Progresión (EN DISEÑO)

- Moneda persistente (cristales) obtenida durante runs
- Tienda en menú principal: desbloqueo de armas + mejoras permanentes de stats
- Dificultades desbloqueables por puntuación máxima alcanzada

## Controles

**PC:** WASD/Flechas (movimiento), Shift/Space (dash), Mouse (auto-aim)
**Móvil:** Joystick virtual izquierdo (movimiento), Botón derecho (dash)

## Rendimiento

- Canvas 1920x1080 (responsive a 720x1280 mobile)
- Mundo: 11520 x 6480 px
- Object pooling, spatial grid (250px cells), culling por distancia
- Max 200-500 enemigos simultáneos
- Low-perf mode automático si FPS cae

## Stack

- HTML5 Canvas 2D
- JavaScript Vanilla (ES6+)
- CSS3
- localStorage para persistencia
- Sin dependencias externas

## Documentos Relacionados

- `WEAPON_EVOLUTION_DESIGN.md` - Diseño detallado de armas, upgrades y meta-progresión
- `CODEBASE_ANALYSIS.md` - Análisis técnico del código actual
- `_bosses_archived/BOSS_SYSTEM_DESIGN.md` - Sistema de bosses (referencia futura)
