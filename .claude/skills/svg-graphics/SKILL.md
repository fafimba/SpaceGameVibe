---
name: svg-graphics
description: |
  SVG Graphics skill for creating and manipulating vector graphics. Use this skill when:
  - Creating icons, shapes, and simple illustrations in SVG
  - Implementing shape-cutting mechanics (like in ShapesFinancial)
  - Animating SVG elements (CSS or JS animations)
  - Optimizing SVG for performance
  - Working with paths, transforms, and clipping
  - Generating procedural/dynamic SVG content
  TRIGGERS: svg, icon, vector, shape, path, clip-path, mask, transform, viewBox, stroke, fill, animation, cut shape, geometry
---

# SVG Graphics

## Overview

Este skill cubre la creación, manipulación y animación de gráficos SVG. Incluye técnicas para iconos, ilustraciones simples, y mecánicas de juego basadas en geometría (como el corte de formas).

## Quick Reference

| Topic | Concepto Clave | Reference |
|-------|----------------|-----------|
| Basics | viewBox, paths, shapes | [basics.md](references/basics.md) |
| Icons | Diseño de iconos consistentes | [icons.md](references/icons.md) |
| Cutting | Mecánica de corte de formas | [cutting.md](references/cutting.md) |
| Animation | CSS y JS animations | [animation.md](references/animation.md) |

---

## Fundamentos SVG

### Estructura Básica

```svg
<svg
  width="100"
  height="100"
  viewBox="0 0 100 100"
  xmlns="http://www.w3.org/2000/svg"
>
  <!-- contenido -->
</svg>
```

### viewBox Explicado

```
viewBox="minX minY width height"

viewBox="0 0 100 100"
        │ │  │    │
        │ │  │    └── altura del sistema de coordenadas interno
        │ │  └─────── anchura del sistema de coordenadas interno
        │ └────────── origen Y
        └──────────── origen X
```

```javascript
// El SVG escala automáticamente
// viewBox="0 0 100 100" con width="200" = todo se ve 2x más grande
```

### Formas Básicas

```svg
<!-- Rectángulo -->
<rect x="10" y="10" width="80" height="60" rx="5" fill="#3B82F6"/>

<!-- Círculo -->
<circle cx="50" cy="50" r="40" fill="#10B981"/>

<!-- Elipse -->
<ellipse cx="50" cy="50" rx="40" ry="25" fill="#F59E0B"/>

<!-- Línea -->
<line x1="10" y1="10" x2="90" y2="90" stroke="#EF4444" stroke-width="2"/>

<!-- Polígono -->
<polygon points="50,10 90,90 10,90" fill="#8B5CF6"/>

<!-- Polilínea (no cerrada) -->
<polyline points="10,10 50,50 90,10" fill="none" stroke="#EC4899" stroke-width="2"/>
```

---

## Paths (El Poder de SVG)

### Comandos de Path

```svg
<path d="M 10 10 L 90 90" />
```

| Comando | Significado | Ejemplo |
|---------|-------------|---------|
| M/m | Move to | M 10 10 |
| L/l | Line to | L 90 90 |
| H/h | Horizontal line | H 90 |
| V/v | Vertical line | V 90 |
| C/c | Cubic bezier | C 20 20, 40 20, 50 10 |
| S/s | Smooth cubic | S 80 40, 90 10 |
| Q/q | Quadratic bezier | Q 50 50, 90 10 |
| A/a | Arc | A 25 25 0 0 1 50 50 |
| Z | Close path | Z |

**Mayúscula = absoluto, minúscula = relativo**

### Ejemplos de Paths

```svg
<!-- Triángulo -->
<path d="M 50 10 L 90 90 L 10 90 Z" fill="#3B82F6"/>

<!-- Corazón -->
<path d="M 50 88 C 20 60, 0 30, 50 10 C 100 30, 80 60, 50 88 Z" fill="#EF4444"/>

<!-- Check mark -->
<path d="M 20 50 L 40 70 L 80 30" fill="none" stroke="#10B981" stroke-width="8" stroke-linecap="round"/>

<!-- Flecha -->
<path d="M 10 50 H 70 L 50 30 M 70 50 L 50 70" fill="none" stroke="#000" stroke-width="4"/>
```

---

## Para ShapesFinancial: Mecánica de Corte

### Concepto de Corte de Formas

```javascript
// La forma se "corta" arrastrando una línea a través
// Resultado: dos nuevas formas

const cutMechanic = {
    // Input: línea de corte definida por dos puntos
    cutLine: { start: {x: 10, y: 50}, end: {x: 90, y: 50} },

    // Original shape (como path o polygon)
    originalShape: "M 0 0 L 100 0 L 100 100 L 0 100 Z",

    // Output: dos shapes resultantes
    resultShapes: [
        "M 0 0 L 100 0 L 100 50 L 0 50 Z",  // Arriba
        "M 0 50 L 100 50 L 100 100 L 0 100 Z"  // Abajo
    ]
}
```

### Algoritmo de Corte Simplificado

```javascript
// Para formas convexas simples (rectángulos, círculos aprox)
function cutShape(shapePath, cutLine) {
    // 1. Encontrar puntos de intersección
    const intersections = findIntersections(shapePath, cutLine)

    if (intersections.length !== 2) {
        return null  // Corte inválido
    }

    // 2. Dividir el path en los puntos de intersección
    const [point1, point2] = intersections

    // 3. Crear dos nuevos paths
    const shape1 = createPathFromSegments(
        getSegmentsBetween(shapePath, point1, point2, 'clockwise')
    )
    const shape2 = createPathFromSegments(
        getSegmentsBetween(shapePath, point1, point2, 'counterclockwise')
    )

    return [shape1, shape2]
}
```

### Intersección Línea-Segmento

```javascript
// Encontrar donde una línea cruza un segmento
function lineSegmentIntersection(line, segment) {
    const { x1, y1, x2, y2 } = line
    const { x3, y3, x4, y4 } = segment

    const denom = (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4)
    if (Math.abs(denom) < 0.0001) return null  // Paralelas

    const t = ((x1-x3)*(y3-y4) - (y1-y3)*(x3-x4)) / denom
    const u = -((x1-x2)*(y1-y3) - (y1-y2)*(x1-x3)) / denom

    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
            x: x1 + t * (x2 - x1),
            y: y1 + t * (y2 - y1)
        }
    }
    return null
}
```

### Visualización del Corte

```javascript
// Feedback visual durante el corte
function renderCutPreview(ctx, cutLine, shape) {
    // Línea de corte punteada
    ctx.setLineDash([5, 5])
    ctx.strokeStyle = '#FF0000'
    ctx.beginPath()
    ctx.moveTo(cutLine.start.x, cutLine.start.y)
    ctx.lineTo(cutLine.end.x, cutLine.end.y)
    ctx.stroke()

    // Highlight de las dos partes resultantes
    const [part1, part2] = previewCut(shape, cutLine)
    if (part1 && part2) {
        // Colorear diferente cada parte
        renderPath(ctx, part1, { fill: 'rgba(59, 130, 246, 0.3)' })
        renderPath(ctx, part2, { fill: 'rgba(16, 185, 129, 0.3)' })
    }
}
```

---

## Clip Paths y Máscaras

### Clip Path (Recorte Duro)

```svg
<defs>
  <clipPath id="circleClip">
    <circle cx="50" cy="50" r="40"/>
  </clipPath>
</defs>

<!-- Imagen recortada en forma circular -->
<image href="photo.jpg" clip-path="url(#circleClip)"/>
```

### Mask (Recorte con Transparencia)

```svg
<defs>
  <mask id="fadeMask">
    <linearGradient id="fadeGrad">
      <stop offset="0%" stop-color="white"/>
      <stop offset="100%" stop-color="black"/>
    </linearGradient>
    <rect fill="url(#fadeGrad)" width="100" height="100"/>
  </mask>
</defs>

<rect mask="url(#fadeMask)" fill="#3B82F6" width="100" height="100"/>
```

### Uso para Mecánica de Corte

```javascript
// Usar clip-path para mostrar "parte cortada"
function applyCutClip(element, cutPath) {
    const clipId = `cut-${Date.now()}`

    // Crear clipPath dinámico
    const clipPath = document.createElementNS(SVG_NS, 'clipPath')
    clipPath.id = clipId

    const path = document.createElementNS(SVG_NS, 'path')
    path.setAttribute('d', cutPath)
    clipPath.appendChild(path)

    // Añadir al defs
    defs.appendChild(clipPath)

    // Aplicar al elemento
    element.setAttribute('clip-path', `url(#${clipId})`)
}
```

---

## Transformaciones

### Transform Attribute

```svg
<!-- Translate (mover) -->
<rect transform="translate(50, 30)" .../>

<!-- Rotate (rotar) -->
<rect transform="rotate(45, 50, 50)" .../>  <!-- 45° alrededor de (50,50) -->

<!-- Scale (escalar) -->
<rect transform="scale(2)" .../>  <!-- 2x tamaño -->
<rect transform="scale(2, 0.5)" .../>  <!-- 2x ancho, 0.5x alto -->

<!-- Skew (sesgar) -->
<rect transform="skewX(20)" .../>

<!-- Combinadas -->
<rect transform="translate(50, 50) rotate(45) scale(0.5)" .../>
```

### Transform en JavaScript

```javascript
// Manipular transforms programáticamente
function transformShape(element, transforms) {
    const { translate, rotate, scale } = transforms

    let transformStr = ''

    if (translate) {
        transformStr += `translate(${translate.x}, ${translate.y}) `
    }
    if (rotate) {
        transformStr += `rotate(${rotate.angle}, ${rotate.cx}, ${rotate.cy}) `
    }
    if (scale) {
        transformStr += `scale(${scale.x}, ${scale.y || scale.x}) `
    }

    element.setAttribute('transform', transformStr.trim())
}
```

---

## Generación Procedural

### Formas Aleatorias

```javascript
function generateRandomShape(complexity = 5) {
    const points = []
    const cx = 50, cy = 50, radius = 40

    for (let i = 0; i < complexity; i++) {
        const angle = (i / complexity) * Math.PI * 2
        const r = radius * (0.7 + Math.random() * 0.6)  // Variación
        points.push({
            x: cx + Math.cos(angle) * r,
            y: cy + Math.sin(angle) * r
        })
    }

    // Convertir a path
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 1; i < points.length; i++) {
        d += ` L ${points[i].x} ${points[i].y}`
    }
    d += ' Z'

    return d
}
```

### Iconos Dinámicos

```javascript
// Generar icono de moneda con valor
function createCoinIcon(value, color = '#FFD700') {
    return `
        <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="${color}"/>
            <circle cx="50" cy="50" r="38" fill="none" stroke="#B8860B" stroke-width="3"/>
            <text x="50" y="58" text-anchor="middle" font-size="24" font-weight="bold" fill="#8B4513">
                $${value}
            </text>
        </svg>
    `
}

// Generar icono de gráfico
function createChartIcon(trend = 'up', color = '#10B981') {
    const path = trend === 'up'
        ? 'M 10 70 L 30 50 L 50 60 L 70 30 L 90 40'
        : 'M 10 30 L 30 50 L 50 40 L 70 70 L 90 60'

    return `
        <svg viewBox="0 0 100 100">
            <path d="${path}" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"/>
            <circle cx="90" cy="${trend === 'up' ? 40 : 60}" r="5" fill="${color}"/>
        </svg>
    `
}
```

---

## Fuentes

### Documentación
- [MDN SVG Tutorial](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial)
- [SVG Path Reference](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths)
- [CSS-Tricks SVG Guide](https://css-tricks.com/using-svg/)

### Herramientas
- [SVGOMG](https://jakearchibald.github.io/svgomg/) - Optimizador SVG
- [SVG Path Editor](https://yqnn.github.io/svg-path-editor/) - Editor visual de paths
- [Boxy SVG](https://boxy-svg.com/) - Editor SVG online

### Librerías
- [Snap.svg](http://snapsvg.io/) - Manipulación SVG
- [Paper.js](http://paperjs.org/) - Vector graphics scripting
- [Two.js](https://two.js.org/) - 2D drawing API
