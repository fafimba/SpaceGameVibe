# SVG Icons Design

> **Fuentes**:
> - [Material Design Icons Guidelines](https://m3.material.io/styles/icons/designing-icons)
> - [Lucide Icons](https://lucide.dev/) - Biblioteca usada en ShapesFinancial
> - [Feather Icons Design Principles](https://feathericons.com/)

## Principios de Diseño de Iconos

### Grid System

```
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐  │  ← Padding (2-4 units)
│  │  ┌─────────────────────────┐  │  │
│  │  │                         │  │  │
│  │  │    AREA DE CONTENIDO    │  │  │  ← Safe area
│  │  │                         │  │  │
│  │  └─────────────────────────┘  │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘

Típico: 24x24 con 2px padding = 20x20 area de contenido
```

### Tamaños Estándar

```javascript
const iconSizes = {
    xs: 16,    // Inline, junto a texto pequeño
    sm: 20,    // Botones compactos
    md: 24,    // Default, más común
    lg: 32,    // Headers, destacados
    xl: 48,    // Hero icons, empty states
    xxl: 64    // Ilustraciones simples
}
```

### Stroke vs Fill

```svg
<!-- STROKE (outline) - Estilo moderno, limpio -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v6l4 2"/>
</svg>

<!-- FILL (sólido) - Más visible en tamaños pequeños -->
<svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm..."/>
</svg>
```

**Recomendación**: Usar stroke para iconos ≥24px, fill para <24px

---

## Iconos para ShapesFinancial

### Iconos Financieros

```svg
<!-- Moneda/Coin -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v12"/>
    <path d="M9 9h6"/>
    <path d="M9 15h6"/>
</svg>

<!-- Wallet -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="2" y="6" width="20" height="14" rx="2"/>
    <path d="M2 10h20"/>
    <circle cx="17" cy="14" r="2"/>
</svg>

<!-- Gráfico de líneas (Stock) -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="3 18 8 12 13 15 21 6"/>
    <polyline points="17 6 21 6 21 10"/>
</svg>

<!-- Savings/Piggy Bank -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M19 10c0 4-3.5 8-8 8s-8-4-8-8 3.5-8 8-8c2.5 0 4.7 1.1 6.2 2.8"/>
    <line x1="12" y1="6" x2="12" y2="8"/>
    <circle cx="9" cy="10" r="1" fill="currentColor"/>
    <path d="M3 10l-1 4"/>
    <path d="M21 10l1 4"/>
</svg>

<!-- Bond/Certificate -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="3" y="4" width="18" height="16" rx="2"/>
    <line x1="7" y1="8" x2="17" y2="8"/>
    <line x1="7" y1="12" x2="14" y2="12"/>
    <circle cx="16" cy="16" r="2"/>
</svg>

<!-- Interest/Percentage -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="7" cy="7" r="3"/>
    <circle cx="17" cy="17" r="3"/>
    <line x1="19" y1="5" x2="5" y2="19"/>
</svg>
```

### Iconos de Acciones

```svg
<!-- Cut/Scissors -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="6" cy="6" r="3"/>
    <circle cx="6" cy="18" r="3"/>
    <line x1="20" y1="4" x2="8.12" y2="15.88"/>
    <line x1="14.47" y1="14.48" x2="20" y2="20"/>
    <line x1="8.12" y1="8.12" x2="12" y2="12"/>
</svg>

<!-- Split/Divide -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <line x1="12" y1="3" x2="12" y2="21"/>
    <polyline points="8 8 4 12 8 16"/>
    <polyline points="16 8 20 12 16 16"/>
</svg>

<!-- Drag -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <circle cx="9" cy="5" r="1" fill="currentColor"/>
    <circle cx="9" cy="12" r="1" fill="currentColor"/>
    <circle cx="9" cy="19" r="1" fill="currentColor"/>
    <circle cx="15" cy="5" r="1" fill="currentColor"/>
    <circle cx="15" cy="12" r="1" fill="currentColor"/>
    <circle cx="15" cy="19" r="1" fill="currentColor"/>
</svg>

<!-- Transfer -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="17 1 21 5 17 9"/>
    <line x1="3" y1="5" x2="21" y2="5"/>
    <polyline points="7 15 3 19 7 23"/>
    <line x1="21" y1="19" x2="3" y2="19"/>
</svg>
```

### Iconos de Estado

```svg
<!-- Up/Profit -->
<svg viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2">
    <polyline points="18 15 12 9 6 15"/>
</svg>

<!-- Down/Loss -->
<svg viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2">
    <polyline points="6 9 12 15 18 9"/>
</svg>

<!-- Locked -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="5" y="11" width="14" height="10" rx="2"/>
    <path d="M8 11V7a4 4 0 1 1 8 0v4"/>
</svg>

<!-- Unlocked -->
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="5" y="11" width="14" height="10" rx="2"/>
    <path d="M8 11V7a4 4 0 0 1 7.4-2"/>
</svg>
```

---

## Consistencia de Estilo

### Variables de Diseño

```javascript
const iconStyle = {
    // Stroke
    strokeWidth: 2,           // Consistente en todos los iconos
    strokeLinecap: 'round',   // Puntas redondeadas
    strokeLinejoin: 'round',  // Esquinas redondeadas

    // Fill
    fill: 'none',             // Por defecto sin relleno
    fillRule: 'evenodd',

    // Tamaño
    viewBox: '0 0 24 24',
    defaultSize: 24,

    // Color
    color: 'currentColor'     // Hereda del CSS
}
```

### Template de Icono

```javascript
function createIcon(pathData, options = {}) {
    const {
        size = 24,
        color = 'currentColor',
        strokeWidth = 2,
        className = ''
    } = options

    return `
        <svg
            width="${size}"
            height="${size}"
            viewBox="0 0 24 24"
            fill="none"
            stroke="${color}"
            stroke-width="${strokeWidth}"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="${className}"
        >
            ${pathData}
        </svg>
    `
}

// Uso
const coinIcon = createIcon(`
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 6v12M9 9h6M9 15h6"/>
`, { size: 32, color: '#FFD700' })
```

---

## Iconos Animados

### Hover Effect

```css
.icon {
    transition: transform 0.2s ease;
}

.icon:hover {
    transform: scale(1.1);
}

/* Rotación para loading */
.icon-spin {
    animation: spin 1s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
```

### Path Animation

```svg
<svg viewBox="0 0 24 24">
    <path
        d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
    >
        <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 12 12"
            to="360 12 12"
            dur="1s"
            repeatCount="indefinite"
        />
    </path>
</svg>
```

### Draw Effect (Stroke Animation)

```css
.icon-draw path {
    stroke-dasharray: 100;
    stroke-dashoffset: 100;
    animation: draw 1s ease forwards;
}

@keyframes draw {
    to {
        stroke-dashoffset: 0;
    }
}
```

```javascript
// Calcular stroke-dasharray correcto
function getPathLength(path) {
    const temp = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    temp.setAttribute('d', path)
    return temp.getTotalLength()
}
```

---

## Optimización

### SVGO Config

```javascript
// svgo.config.js
module.exports = {
    plugins: [
        'removeDoctype',
        'removeXMLProcInst',
        'removeComments',
        'removeMetadata',
        'removeEditorsNSData',
        'cleanupAttrs',
        'mergeStyles',
        'inlineStyles',
        'minifyStyles',
        'cleanupIds',
        'removeUselessDefs',
        'cleanupNumericValues',
        'convertColors',
        'removeUnknownsAndDefaults',
        'removeNonInheritableGroupAttrs',
        'removeUselessStrokeAndFill',
        'cleanupEnableBackground',
        'removeHiddenElems',
        'removeEmptyText',
        'convertShapeToPath',
        'convertEllipseToCircle',
        'moveElemsAttrsToGroup',
        'moveGroupAttrsToElems',
        'collapseGroups',
        'convertPathData',
        'convertTransform',
        'removeEmptyAttrs',
        'removeEmptyContainers',
        'mergePaths',
        'removeUnusedNS',
        'sortDefsChildren',
        'removeTitle',
        'removeDesc'
    ]
}
```

### Inline vs External

```javascript
// Para iconos pequeños y frecuentes: INLINE
// Evita request HTTP adicional
const inlineIcon = `<svg>...</svg>`

// Para iconos grandes o poco frecuentes: EXTERNAL
// Permite caching
<img src="/icons/large-illustration.svg" alt="..." />

// Para iconos reutilizables: SYMBOL + USE
<svg style="display:none">
    <symbol id="icon-coin" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
    </symbol>
</svg>

// Uso
<svg><use href="#icon-coin"/></svg>
```
