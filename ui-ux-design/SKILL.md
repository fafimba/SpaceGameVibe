---
name: ui-ux-design
description: |
  UI/UX Design skill for web applications and games. Use this skill when:
  - Designing user interfaces (layouts, components, navigation)
  - Improving user experience (flows, feedback, accessibility)
  - Creating responsive designs (mobile-first, breakpoints)
  - Implementing visual hierarchy and typography
  - Designing game HUDs and menus
  - Handling user input and feedback states
  TRIGGERS: UI, UX, interface, layout, design system, responsive, mobile, accessibility, HUD, menu, feedback, animation, transition, component, navigation
---

# UI/UX Design

## Overview

Este skill cubre diseño de interfaces para web y juegos, combinando principios de UX con implementación práctica en CSS/React/Tailwind.

## Quick Reference

| Topic | Concepto Clave | Reference |
|-------|----------------|-----------|
| Layout | Grid, Flexbox, Composition | [layout.md](references/layout.md) |
| Components | Design System, Patterns | [components.md](references/components.md) |
| Game UI | HUD, Menus, Feedback | [game-ui.md](references/game-ui.md) |
| Accessibility | a11y, WCAG, Inclusivo | [accessibility.md](references/accessibility.md) |

---

## Principios Fundamentales de UX

### 1. Jerarquía Visual

Los usuarios escanean, no leen. Guía su atención:

```
IMPORTANCIA VISUAL

[████████████████████]  ← TÍTULO GRANDE (más importante)
[██████████████]        ← Subtítulo
[████████]              ← Cuerpo de texto
[████]                  ← Texto secundario
```

```css
/* Escala tipográfica consistente */
:root {
    --text-xs: 0.75rem;    /* 12px - captions */
    --text-sm: 0.875rem;   /* 14px - secondary */
    --text-base: 1rem;     /* 16px - body */
    --text-lg: 1.125rem;   /* 18px - emphasis */
    --text-xl: 1.25rem;    /* 20px - subheadings */
    --text-2xl: 1.5rem;    /* 24px - headings */
    --text-3xl: 1.875rem;  /* 30px - page titles */
    --text-4xl: 2.25rem;   /* 36px - hero */
}
```

### 2. Ley de Fitts

Objetos más grandes y cercanos son más fáciles de clickear:

```javascript
// Tiempo para alcanzar un target
T = a + b * log2(D/W + 1)

// D = distancia al target
// W = ancho del target
```

**Aplicación práctica**:
```css
/* Botones primarios más grandes */
.btn-primary {
    padding: 12px 24px;
    min-width: 120px;
    min-height: 44px;  /* Mínimo para touch */
}

/* Botones secundarios pueden ser más pequeños */
.btn-secondary {
    padding: 8px 16px;
    min-height: 36px;
}

/* Acciones destructivas pequeñas (intencional) */
.btn-danger {
    padding: 6px 12px;
}
```

### 3. Ley de Hick

Más opciones = más tiempo para decidir. Simplifica:

```javascript
// ❌ Mal: Demasiadas opciones
const menu = [
    'Savings', 'Stocks', 'Bonds', 'ETFs', 'Mutual Funds',
    'REITs', 'Commodities', 'Crypto', 'Options', 'Futures'
]

// ✅ Bien: Categorías claras
const menu = [
    { name: 'Safe', items: ['Savings', 'Bonds'] },
    { name: 'Growth', items: ['Stocks', 'ETFs'] },
    { name: 'Advanced', items: ['Options', 'Crypto'] }
]
```

### 4. Principio de Proximidad (Gestalt)

Elementos cercanos se perciben como grupo:

```
AGRUPACIÓN

❌ Malo (espaciado uniforme):
[Label] [Input] [Label] [Input] [Label] [Input]

✅ Bueno (grupos claros):
[Label] [Input]    [Label] [Input]    [Label] [Input]
└─────────────┘    └─────────────┘    └─────────────┘
    Grupo 1            Grupo 2            Grupo 3
```

```css
/* Espaciado que agrupa */
.form-group {
    margin-bottom: 24px;  /* Grande entre grupos */
}

.form-group label {
    margin-bottom: 4px;   /* Pequeño dentro del grupo */
}
```

---

## Feedback y Estados

### Estados de UI

Todo elemento interactivo necesita estados claros:

```css
.button {
    /* Default */
    background: #3B82F6;
    transition: all 0.2s ease;
}

.button:hover {
    /* Hover - indica que es clickeable */
    background: #2563EB;
    transform: translateY(-1px);
}

.button:active {
    /* Active - confirma el click */
    background: #1D4ED8;
    transform: translateY(1px);
}

.button:focus-visible {
    /* Focus - navegación por teclado */
    outline: 2px solid #93C5FD;
    outline-offset: 2px;
}

.button:disabled {
    /* Disabled - no disponible */
    background: #9CA3AF;
    cursor: not-allowed;
    opacity: 0.6;
}

.button.loading {
    /* Loading - procesando */
    pointer-events: none;
    opacity: 0.8;
}
```

### Feedback Inmediato

```javascript
// Cada acción debe tener respuesta visual
function handleClick(button, action) {
    // 1. Feedback instantáneo (< 100ms)
    button.classList.add('active')
    playSound('click')

    // 2. Indicador de carga si tarda
    if (action.isAsync) {
        button.classList.add('loading')
        showSpinner(button)
    }

    // 3. Resultado
    try {
        await action.execute()
        showSuccess('¡Completado!')
    } catch (error) {
        showError(error.message)
    } finally {
        button.classList.remove('loading', 'active')
    }
}
```

### Micro-interacciones

```css
/* Transiciones suaves */
* {
    transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform;
    transition-duration: 150ms;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Animación de entrada */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.card {
    animation: fadeIn 0.3s ease-out;
}

/* Pulse para llamar atención */
@keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

.notification-badge {
    animation: pulse 2s infinite;
}
```

---

## Layout Patterns

### Container + Content

```css
/* Container centra y limita ancho */
.container {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
}

@media (min-width: 768px) {
    .container {
        padding: 0 32px;
    }
}
```

### Grid System

```css
/* Grid responsive */
.grid {
    display: grid;
    gap: 16px;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

/* Grid fijo */
.grid-3 {
    display: grid;
    gap: 24px;
    grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 768px) {
    .grid-3 {
        grid-template-columns: 1fr;
    }
}
```

### Split Layout (ShapesFinancial)

```jsx
// Layout típico de juego: sidebar + main area
function GameLayout({ children }) {
    return (
        <div className="h-screen flex">
            {/* Sidebar izquierdo - Stats */}
            <aside className="w-64 bg-gray-900 p-4 flex-shrink-0">
                <PlayerStats />
                <IncomeDisplay />
            </aside>

            {/* Área principal - Juego */}
            <main className="flex-1 relative overflow-hidden">
                {children}
            </main>

            {/* Sidebar derecho - Inversiones */}
            <aside className="w-80 bg-gray-800 p-4 flex-shrink-0 overflow-y-auto">
                <InvestmentPanel />
            </aside>
        </div>
    )
}
```

---

## Color y Contraste

### Sistema de Colores

```css
:root {
    /* Primarios */
    --primary-50: #EFF6FF;
    --primary-100: #DBEAFE;
    --primary-500: #3B82F6;
    --primary-600: #2563EB;
    --primary-700: #1D4ED8;

    /* Semánticos */
    --success: #10B981;
    --warning: #F59E0B;
    --error: #EF4444;
    --info: #3B82F6;

    /* Neutrales */
    --gray-50: #F9FAFB;
    --gray-100: #F3F4F6;
    --gray-500: #6B7280;
    --gray-900: #111827;

    /* Finanzas específico */
    --money-green: #10B981;
    --loss-red: #EF4444;
    --neutral-gray: #6B7280;
}
```

### Contraste WCAG

```javascript
// Mínimo 4.5:1 para texto normal
// Mínimo 3:1 para texto grande (18px+)

const contrastRatios = {
    'white-on-primary500': 4.5,   // ✅ OK
    'white-on-primary400': 3.2,   // ❌ Insuficiente para texto pequeño
    'gray900-on-white': 15.8,     // ✅ Excelente
}

// Herramienta: https://webaim.org/resources/contrastchecker/
```

---

## Responsive Design

### Mobile-First

```css
/* Base: Mobile */
.card {
    padding: 16px;
    font-size: 14px;
}

/* Tablet */
@media (min-width: 768px) {
    .card {
        padding: 24px;
        font-size: 16px;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .card {
        padding: 32px;
    }
}
```

### Breakpoints

```javascript
const breakpoints = {
    sm: '640px',   // Móvil grande
    md: '768px',   // Tablet
    lg: '1024px',  // Desktop pequeño
    xl: '1280px',  // Desktop
    '2xl': '1536px' // Desktop grande
}
```

### Touch Targets

```css
/* Mínimo 44x44px para touch */
.touch-target {
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Espacio entre targets */
.button-group > * + * {
    margin-left: 8px;  /* Evitar clicks accidentales */
}
```

---

## Fuentes

### Design Systems
- [Material Design 3](https://m3.material.io/)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Tailwind UI](https://tailwindui.com/)

### UX Research
- "Don't Make Me Think" - Steve Krug
- "The Design of Everyday Things" - Don Norman
- [Nielsen Norman Group](https://www.nngroup.com/articles/)

### Game UI
- [Game UI Database](https://www.gameuidatabase.com/)
- [Interface In Game](https://interfaceingame.com/)
- [GDC: UI/UX Summit](https://gdcvault.com/browse/gdc-22/summit/40145)

### Tools
- [Figma](https://www.figma.com/)
- [Coolors](https://coolors.co/) - Paletas de colores
- [Type Scale](https://type-scale.com/) - Escalas tipográficas
