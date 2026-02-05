# Game UI Design

> **Fuentes**:
> - [Game UI Database](https://www.gameuidatabase.com/)
> - GDC UI/UX Summit talks
> - "Game Feel" - Steve Swink

## Tipos de UI en Juegos

### Diegetic vs Non-Diegetic

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   DIEGETIC                    NON-DIEGETIC                  │
│   (Existe en el mundo)       (Solo para el jugador)         │
│                                                             │
│   • Reloj en la muñeca       • Barra de vida                │
│   • Pantalla de computadora  • Minimapa                     │
│   • Señales en el mundo      • Score/puntos                 │
│                                                             │
│   META                        SPATIAL                       │
│   (Sobre el juego)           (En el mundo 3D)              │
│                                                             │
│   • Menú de pausa            • Nombres sobre personajes    │
│   • Inventario               • Indicadores de objetivo      │
│   • Configuración            • Marcadores de daño           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Para ShapesFinancial

```javascript
const uiElements = {
    diegetic: [
        // Elementos que "existen" en el mundo del juego
        'price_tags',
        'money_animations',
        'shape_values'
    ],
    nonDiegetic: [
        // HUD tradicional
        'total_balance',
        'income_indicator',
        'progress_bars'
    ],
    meta: [
        // Fuera del gameplay
        'pause_menu',
        'settings',
        'tutorial_overlays'
    ]
}
```

---

## HUD Design

### Principios del HUD

```
┌─────────────────────────────────────────────────────────────┐
│ [Balance: $1,234]                          [⚙️] [❓] [⏸️] │  ← Info + Actions
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                                             │
│                                                             │
│                    ÁREA DE JUEGO                            │
│                    (Máximo espacio)                         │
│                                                             │
│                                                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ [💰 Income: $50/s]  [📈 +12%]  [⏱️ 5:23]                    │  ← Stats
└─────────────────────────────────────────────────────────────┘
```

### Reglas del HUD

```javascript
const hudRules = {
    // 1. Mínima obstrucción
    maxScreenCoverage: 0.15,  // 15% máximo

    // 2. Información en capas
    layers: {
        always: ['balance', 'critical_alerts'],
        onHover: ['detailed_stats', 'tooltips'],
        onDemand: ['full_portfolio', 'history']
    },

    // 3. Posicionamiento consistente
    positions: {
        topLeft: 'player_stats',
        topRight: 'system_controls',
        bottomLeft: 'context_actions',
        bottomRight: 'minimap_or_progress',
        center: 'alerts_and_modals'
    }
}
```

### HUD para ShapesFinancial

```jsx
function GameHUD({ gameState }) {
    return (
        <div className="fixed inset-0 pointer-events-none">
            {/* Top Bar */}
            <header className="absolute top-0 left-0 right-0 p-4 flex justify-between pointer-events-auto">
                {/* Balance principal */}
                <div className="bg-black/50 rounded-lg px-4 py-2">
                    <span className="text-gray-400 text-sm">Total Balance</span>
                    <div className="text-2xl font-bold text-green-400">
                        ${formatMoney(gameState.totalBalance)}
                    </div>
                </div>

                {/* Controles */}
                <div className="flex gap-2">
                    <IconButton icon="settings" />
                    <IconButton icon="help" />
                    <IconButton icon="pause" />
                </div>
            </header>

            {/* Income Indicator */}
            <div className="absolute top-20 left-4 bg-black/50 rounded-lg px-3 py-1 pointer-events-auto">
                <span className="text-green-400">
                    +${formatMoney(gameState.incomePerSecond)}/s
                </span>
            </div>

            {/* Notifications */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <NotificationStack />
            </div>

            {/* Bottom Info */}
            <footer className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
                <ProgressBar
                    label="Next Level"
                    current={gameState.xp}
                    max={gameState.xpToNextLevel}
                />
            </footer>
        </div>
    )
}
```

---

## Menús y Navegación

### Menú Principal

```jsx
function MainMenu() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col items-center justify-center">
            {/* Logo */}
            <h1 className="text-5xl font-bold text-white mb-12">
                ShapesFinancial
            </h1>

            {/* Opciones principales - grandes y claras */}
            <nav className="flex flex-col gap-4 w-64">
                <MenuButton primary>
                    Continuar
                </MenuButton>
                <MenuButton>
                    Nueva Partida
                </MenuButton>
                <MenuButton>
                    Configuración
                </MenuButton>
                <MenuButton>
                    Salir
                </MenuButton>
            </nav>

            {/* Info secundaria */}
            <footer className="absolute bottom-4 text-gray-500 text-sm">
                v1.0.0 | © 2024
            </footer>
        </div>
    )
}
```

### Menú de Pausa

```jsx
function PauseMenu({ onResume, onSettings, onQuit }) {
    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-xl p-8 w-80 animate-scale-in">
                <h2 className="text-2xl font-bold text-white text-center mb-8">
                    Pausa
                </h2>

                <div className="flex flex-col gap-3">
                    <Button onClick={onResume} primary large>
                        Continuar
                    </Button>
                    <Button onClick={onSettings}>
                        Configuración
                    </Button>
                    <Button onClick={onQuit} variant="danger">
                        Salir al Menú
                    </Button>
                </div>

                {/* Tip durante pausa */}
                <div className="mt-6 p-3 bg-blue-900/30 rounded-lg">
                    <p className="text-blue-300 text-sm">
                        💡 Tip: Diversifica tus inversiones para reducir el riesgo
                    </p>
                </div>
            </div>
        </div>
    )
}
```

---

## Feedback Visual en Juegos

### Números Flotantes

```jsx
function FloatingNumber({ value, position, type }) {
    const colors = {
        gain: 'text-green-400',
        loss: 'text-red-400',
        neutral: 'text-white'
    }

    return (
        <div
            className={`absolute ${colors[type]} font-bold text-lg animate-float-up`}
            style={{ left: position.x, top: position.y }}
        >
            {type === 'gain' ? '+' : type === 'loss' ? '-' : ''}
            ${Math.abs(value)}
        </div>
    )
}

// CSS
const styles = `
@keyframes floatUp {
    0% {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
    100% {
        opacity: 0;
        transform: translateY(-50px) scale(0.8);
    }
}

.animate-float-up {
    animation: floatUp 1s ease-out forwards;
}
`
```

### Progress Bars

```jsx
function ProgressBar({ current, max, label, showValue = true }) {
    const percentage = Math.min((current / max) * 100, 100)

    return (
        <div className="w-full">
            {label && (
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">{label}</span>
                    {showValue && (
                        <span className="text-white">
                            {current} / {max}
                        </span>
                    )}
                </div>
            )}
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    )
}
```

### Notificaciones

```jsx
function Notification({ type, title, message, onDismiss }) {
    const styles = {
        success: 'bg-green-900/90 border-green-500',
        error: 'bg-red-900/90 border-red-500',
        warning: 'bg-yellow-900/90 border-yellow-500',
        info: 'bg-blue-900/90 border-blue-500'
    }

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    }

    return (
        <div className={`
            ${styles[type]}
            border-l-4 rounded-r-lg p-4 flex items-start gap-3
            animate-slide-in-right
        `}>
            <span className="text-xl">{icons[type]}</span>
            <div className="flex-1">
                <h4 className="font-bold text-white">{title}</h4>
                <p className="text-gray-300 text-sm">{message}</p>
            </div>
            <button
                onClick={onDismiss}
                className="text-gray-400 hover:text-white"
            >
                ✕
            </button>
        </div>
    )
}
```

---

## Tooltips y Ayuda Contextual

### Tooltip Component

```jsx
function Tooltip({ children, content, position = 'top' }) {
    const [show, setShow] = useState(false)

    const positions = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    }

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}

            {show && (
                <div className={`
                    absolute ${positions[position]}
                    bg-gray-900 text-white text-sm
                    px-3 py-2 rounded-lg shadow-lg
                    whitespace-nowrap z-50
                    animate-fade-in
                `}>
                    {content}
                    {/* Arrow */}
                    <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45" />
                </div>
            )}
        </div>
    )
}
```

### Info Cards (para términos financieros)

```jsx
function FinancialTermCard({ term, definition, example }) {
    return (
        <div className="bg-gray-800 rounded-lg p-4 max-w-xs">
            <h4 className="font-bold text-white flex items-center gap-2">
                <span className="text-blue-400">📘</span>
                {term}
            </h4>
            <p className="text-gray-300 text-sm mt-2">{definition}</p>
            {example && (
                <div className="mt-3 p-2 bg-gray-700/50 rounded text-xs text-gray-400">
                    <strong>Ejemplo:</strong> {example}
                </div>
            )}
        </div>
    )
}

// Uso
<Tooltip content={
    <FinancialTermCard
        term="Interés Compuesto"
        definition="Interés calculado sobre el principal inicial y también sobre el interés acumulado"
        example="$100 al 5% anual = $105 el primer año, $110.25 el segundo"
    />
}>
    <span className="underline decoration-dotted cursor-help">
        interés compuesto
    </span>
</Tooltip>
```

---

## Animaciones de Juego

### Transiciones de Estado

```css
/* Cuando el dinero cambia */
.money-change {
    transition: all 0.3s ease;
}

.money-change.increasing {
    color: #10B981;
    transform: scale(1.1);
}

.money-change.decreasing {
    color: #EF4444;
    transform: scale(0.95);
}

/* Desbloqueo de feature */
@keyframes unlock {
    0% {
        transform: scale(0.8);
        opacity: 0;
        filter: grayscale(1);
    }
    50% {
        transform: scale(1.1);
        filter: grayscale(0);
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}

.feature-unlocked {
    animation: unlock 0.5s ease-out;
}
```

### Celebraciones

```jsx
function Celebration({ type, message }) {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            {/* Confetti */}
            <Confetti active={type === 'major'} />

            {/* Message */}
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-8 py-4 rounded-xl shadow-2xl animate-bounce-in">
                <div className="text-4xl mb-2">🎉</div>
                <div className="text-xl font-bold">{message}</div>
            </div>
        </div>
    )
}
```

---

## Responsive Game UI

### Adaptación Mobile

```jsx
function ResponsiveGameLayout() {
    const isMobile = useMediaQuery('(max-width: 768px)')

    if (isMobile) {
        return (
            <div className="h-screen flex flex-col">
                {/* Header compacto */}
                <header className="h-14 flex items-center justify-between px-4 bg-gray-900">
                    <Balance compact />
                    <div className="flex gap-2">
                        <IconButton size="sm" icon="menu" />
                    </div>
                </header>

                {/* Área de juego */}
                <main className="flex-1 relative">
                    <GameCanvas />
                </main>

                {/* Bottom sheet para inversiones */}
                <BottomSheet>
                    <InvestmentTabs />
                </BottomSheet>
            </div>
        )
    }

    return <DesktopLayout />
}
```

### Touch Controls

```jsx
function TouchControls({ onCut }) {
    const [touchStart, setTouchStart] = useState(null)
    const [touchEnd, setTouchEnd] = useState(null)

    const handleTouchStart = (e) => {
        setTouchStart({
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        })
    }

    const handleTouchMove = (e) => {
        setTouchEnd({
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        })
    }

    const handleTouchEnd = () => {
        if (touchStart && touchEnd) {
            onCut({ start: touchStart, end: touchEnd })
        }
        setTouchStart(null)
        setTouchEnd(null)
    }

    return (
        <div
            className="absolute inset-0"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        />
    )
}
```
