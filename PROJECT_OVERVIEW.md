# Stellar Swarm - Documentación del Proyecto

## 📋 Descripción General
**Stellar Swarm** es un juego web de tipo "space shooter" / "roguelike" desarrollado completamente en HTML5, CSS3 y JavaScript vanilla (sin frameworks). El juego está contenido en un único archivo `index.html` de aproximadamente 3,126 líneas de código.

## 🎮 Concepto del Juego
- Juego de naves espaciales con vista cenital (top-down)
- El jugador controla una nave que dispara automáticamente a enemigos
- Sistema de oleadas con dificultad incremental
- Sistema de progresión con XP, niveles y árbol de habilidades
- Mecánicas de combate con diferentes tipos de armas y mejoras

## 🏗️ Arquitectura del Proyecto

### Estructura del Archivo
```
index.html
├── <head>
│   ├── Meta tags y configuración
│   └── <style> - Estilos CSS embebidos
│
└── <body>
    ├── <div id="gameContainer"> - Contenedor principal
    │   ├── <canvas id="game"> - Canvas principal del juego
    │   └── <div id="touchControls"> - Controles táctiles para móviles
    │
    └── <script> - Toda la lógica del juego en JavaScript
```

### Componentes Principales

#### 1. **Sistema de Canvas y Rendering**
- Canvas principal de 1600x900 píxeles
- Sistema de partículas para fondo estrellado
- Renderizado 60 FPS con `requestAnimationFrame`

#### 2. **Constantes de Configuración** (líneas 150-220)
- `PLAYER_*`: Configuración del jugador (velocidad, HP, dash)
- `BULLET_*`: Propiedades de proyectiles
- `ENEMY_*`: Configuración de enemigos
- `XP_*`: Sistema de experiencia y niveles

#### 3. **Sistema de Habilidades - Skill Tree** (líneas 225-390)
El árbol de habilidades incluye:
- **Laser Base**: Láser básico (desbloqueado por defecto)
- **Rama de Daño**: `laser_dmg1`, `laser_dmg2` (aumentan daño)
- **Rama de Cadencia**: `laser_rate1`, `laser_rate2` (disparo más rápido)
- **Multishot**: `spread1`, `spread2` (3-5 proyectiles en cono)
- **Pierce Shot**: `beam1`, `beam2` (láser que penetra enemigos)
- **Orbital Shield**: `orbital1`, `orbital2`, `orbital_dmg` (orbes que orbitan al jugador)
- **Homing Rockets**: `rockets1`, `rockets2`, `rockets_dmg` (misiles buscadores)
- **Nova Bomb**: `nova1`, `nova2` (explosión AoE)
- **Mejoras de Jugador**: HP, velocidad, dash, regeneración

## 🎯 Funciones Principales

### Inicialización y Setup
| Función | Línea | Descripción |
|---------|-------|-------------|
| `init()` | ~488 | Inicializa el juego, canvas y controles |
| `resizeCanvas()` | ~501 | Ajusta el tamaño del canvas responsive |
| `generateBackground()` | ~520 | Genera las estrellas del fondo |
| `resetGame()` | ~533 | Reinicia el estado del juego |
| `setupInput()` | ~594 | Configura controles de teclado |
| `setupTouchControls()` | ~690 | Configura joystick virtual para móviles |

### Game Loop Principal
| Función | Línea | Descripción |
|---------|-------|-------------|
| `gameLoop()` | ~772 | Loop principal del juego (RAF) |
| `update()` | ~810 | Actualiza toda la lógica del juego |
| `updateInput()` | ~669 | Procesa input del jugador |

### Sistema de Jugador
| Función | Línea | Descripción |
|---------|-------|-------------|
| `updatePlayer()` | ~858 | Actualiza posición, movimiento y disparo del jugador |
| `getWeaponStats()` | ~955 | Calcula estadísticas de armas según skills |
| `hasEnemyInAimCone()` | ~989 | Sistema de auto-aim para apuntar a enemigos |
| `fireBullet()` | ~1006 | Dispara proyectiles según armas equipadas |

### Sistema de Combate
| Función | Línea | Descripción |
|---------|-------|-------------|
| `updateBullets()` | ~1156 | Actualiza proyectiles y detecta colisiones |
| `updateEnemies()` | ~1311 | Actualiza comportamiento y IA de enemigos |
| `updateEnemyBullets()` | ~1423 | Actualiza proyectiles enemigos |
| `killEnemy()` | ~1437 | Elimina enemigo y genera drops de XP |

### Sistema de Spawning
| Función | Línea | Descripción |
|---------|-------|-------------|
| `updateSpawnSystem()` | ~1240 | Gestiona oleadas y spawn de enemigos |
| `spawnEnemy()` | ~1261 | Crea un enemigo en posición aleatoria |
| `spawnPickup()` | ~1490 | Genera pickups (vida, munición) |
| `spawnXPOrb()` | ~1553 | Crea orbes de experiencia |

### Sistema de Progresión
| Función | Línea | Descripción |
|---------|-------|-------------|
| `collectXP()` | ~1626 | Recoge XP y verifica level up |
| `levelUp()` | ~1644 | Aumenta nivel y abre skill tree |
| `updateXPOrbs()` | ~1569 | Actualiza orbes de XP con efecto magnético |

### UI y Menús
| Función | Descripción |
|---------|-------------|
| `openSkillTree()` | Pausa el juego y muestra árbol de habilidades |
| `closeSkillTree()` | Cierra el menú de skills y reanuda |
| `unlockSkill()` | Desbloquea una habilidad específica |
| `showGameOver()` | Muestra pantalla de fin de juego |

## 🎨 Elementos Visuales

### Sistema de Partículas
- **Fondo de estrellas**: Partículas animadas simulando viaje espacial
- **Efectos de propulsor**: Partículas al moverse
- **Efectos de dash**: Explosión de partículas al usar dash
- **Explosiones**: Partículas cuando enemigos/jugador mueren

### Tipos de Enemigos
1. **Chasers**: Persiguen al jugador directamente
2. **Shooters**: Disparan proyectiles al jugador
3. **Spinners**: Giran y disparan en múltiples direcciones

## 🎮 Controles

### Teclado (PC)
- **WASD / Arrow Keys**: Movimiento
- **Shift / Space**: Dash (con cooldown)
- **Mouse**: Auto-aim (jugador mira hacia el cursor)

### Táctil (Móvil)
- **Joystick virtual izquierdo**: Movimiento y dirección
- **Botón derecho**: Dash

## 📊 Sistema de Progresión

### Experiencia y Niveles
- XP base por nivel: 10 puntos
- Crecimiento exponencial: multiplicador 1.4x por nivel
- Cada nivel otorga 1 punto de habilidad
- XP se obtiene al eliminar enemigos

### Skill Points
- 1 punto por nivel
- Se gastan en el árbol de habilidades
- Las habilidades tienen prerequisitos
- Ramificaciones que permiten diferentes builds

## 🔧 Configuración y Constantes

### Variables Globales de Estado
```javascript
gameState = {
    player: { x, y, vx, vy, hp, rotation, ... },
    bullets: [],
    enemies: [],
    enemyBullets: [],
    pickups: [],
    xpOrbs: [],
    wave: 1,
    score: 0,
    paused: false,
    gameOver: false
}
```

### Balanceo del Juego
- Velocidad jugador: 360 px/s
- HP jugador: 100 (3 puntos de vida)
- Dash: 2x velocidad, 0.2s duración, 3s cooldown
- Enemigos spawneados: Incrementa con oleada
- Dificultad: Escala con el número de oleada

## 🚀 Flujo del Juego

1. **Inicio**: `init()` → Setup canvas, controles, fondo
2. **Loop Principal**: `gameLoop()` ejecuta cada frame
3. **Actualización**: `update()` → Actualiza entidades, física, colisiones
4. **Rendering**: Dibuja todo en canvas
5. **Level Up**: Pausa → Skill Tree → Continúa
6. **Game Over**: Muestra estadísticas y opción de reiniciar

## 📱 Características Especiales

### Responsive Design
- Adapta canvas según tamaño de ventana
- Detecta dispositivos táctiles automáticamente
- Controles específicos para móvil/escritorio

### Performance
- Sistema de pooling para objetos (enemigos, balas)
- Límite de partículas para mantener FPS
- Optimización de colisiones con distancia Euclidiana

## 🎯 Mecánicas Avanzadas

### Auto-Aim
- Cono de 60° (±30°) para detectar enemigos
- Jugador apunta automáticamente al enemigo más cercano en el cono
- Facilita la experiencia en móvil

### Sistema de Oleadas
- Oleadas progresivas con más enemigos
- Mix de tipos de enemigos
- Tiempo de descanso entre oleadas
- Dificultad escala exponencialmente

## 🔍 Puntos de Entrada para Modificaciones

### Para añadir nuevas armas:
1. Añadir definición en `SKILL_TREE` (~línea 225)
2. Modificar `getWeaponStats()` (~línea 955)
3. Actualizar `fireBullet()` (~línea 1006)

### Para nuevos tipos de enemigos:
1. Añadir configuración en constantes (~línea 150)
2. Modificar `spawnEnemy()` (~línea 1261)
3. Actualizar `updateEnemies()` (~línea 1311)

### Para ajustar dificultad:
- Modificar constantes de ENEMY_* (~línea 150)
- Ajustar `updateSpawnSystem()` (~línea 1240)
- Cambiar valores en XP_PER_LEVEL_* (~línea 203)

## 🏷️ Stack Tecnológico
- **HTML5 Canvas** - Renderizado 2D
- **JavaScript Vanilla** - Lógica del juego (ES6+)
- **CSS3** - Estilos y UI
- **No dependencias externas** - Todo autocontenido

## 📄 Resumen
Este es un juego completo desarrollado sin frameworks, demostrando capacidades avanzadas de JavaScript vanilla, matemáticas para juegos (vectores, colisiones, física), y arquitectura de sistemas de juego (game loop, state management, skill trees).
