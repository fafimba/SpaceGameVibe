# Shape Cutting Mechanics

> **Fuentes**:
> - Computational Geometry algorithms
> - Paper.js Boolean Operations
> - Game Development with Canvas/SVG

## Concepto de Corte

En ShapesFinancial, el jugador "corta" formas para dividir dinero entre diferentes inversiones.

```
    ANTES                    DESPUÉS

┌─────────────┐         ┌─────────────┐
│             │         │   PARTE A   │
│   $1000     │   →     ├─────────────┤  ← línea de corte
│             │         │   PARTE B   │
└─────────────┘         └─────────────┘

   Una forma              Dos formas
   $1000                  $600 + $400
```

---

## Algoritmo de Corte

### 1. Representación de Formas

```javascript
// Forma como array de puntos (polígono)
class Shape {
    constructor(points, value = 0) {
        this.points = points  // [{x, y}, {x, y}, ...]
        this.value = value    // Dinero contenido
    }

    // Calcular área (para dividir valor proporcionalmente)
    getArea() {
        let area = 0
        const n = this.points.length

        for (let i = 0; i < n; i++) {
            const j = (i + 1) % n
            area += this.points[i].x * this.points[j].y
            area -= this.points[j].x * this.points[i].y
        }

        return Math.abs(area / 2)
    }

    // Convertir a SVG path
    toSVGPath() {
        if (this.points.length === 0) return ''

        let d = `M ${this.points[0].x} ${this.points[0].y}`
        for (let i = 1; i < this.points.length; i++) {
            d += ` L ${this.points[i].x} ${this.points[i].y}`
        }
        d += ' Z'

        return d
    }
}
```

### 2. Línea de Corte

```javascript
class CutLine {
    constructor(start, end) {
        this.start = start  // {x, y}
        this.end = end      // {x, y}
    }

    // Extender la línea para asegurar que cruza toda la forma
    extend(bounds, padding = 100) {
        const dx = this.end.x - this.start.x
        const dy = this.end.y - this.start.y
        const length = Math.sqrt(dx * dx + dy * dy)

        const unitX = dx / length
        const unitY = dy / length

        return new CutLine(
            {
                x: this.start.x - unitX * padding,
                y: this.start.y - unitY * padding
            },
            {
                x: this.end.x + unitX * padding,
                y: this.end.y + unitY * padding
            }
        )
    }
}
```

### 3. Encontrar Intersecciones

```javascript
function findIntersection(lineStart, lineEnd, segStart, segEnd) {
    const x1 = lineStart.x, y1 = lineStart.y
    const x2 = lineEnd.x, y2 = lineEnd.y
    const x3 = segStart.x, y3 = segStart.y
    const x4 = segEnd.x, y4 = segEnd.y

    const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)

    if (Math.abs(denom) < 0.0001) {
        return null  // Líneas paralelas
    }

    const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
    const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom

    // Verificar que la intersección está dentro del segmento
    if (u >= 0 && u <= 1) {
        return {
            x: x3 + u * (x4 - x3),
            y: y3 + u * (y4 - y3),
            t: t,  // Posición en la línea de corte
            segmentIndex: null  // Se llenará después
        }
    }

    return null
}

function findAllIntersections(shape, cutLine) {
    const intersections = []
    const extendedLine = cutLine.extend(shape.getBounds())

    for (let i = 0; i < shape.points.length; i++) {
        const j = (i + 1) % shape.points.length
        const intersection = findIntersection(
            extendedLine.start, extendedLine.end,
            shape.points[i], shape.points[j]
        )

        if (intersection) {
            intersection.segmentIndex = i
            intersections.push(intersection)
        }
    }

    // Ordenar por posición en la línea de corte
    intersections.sort((a, b) => a.t - b.t)

    return intersections
}
```

### 4. Dividir la Forma

```javascript
function cutShape(shape, cutLine) {
    const intersections = findAllIntersections(shape, cutLine)

    // Necesitamos exactamente 2 intersecciones para un corte válido
    if (intersections.length !== 2) {
        return null  // Corte inválido
    }

    const [int1, int2] = intersections

    // Crear dos nuevas formas
    const shape1Points = []
    const shape2Points = []

    // Recorrer los puntos originales
    let currentShape = shape1Points
    let addedInt1 = false
    let addedInt2 = false

    for (let i = 0; i < shape.points.length; i++) {
        currentShape.push({ ...shape.points[i] })

        // Verificar si después de este punto hay una intersección
        if (!addedInt1 && i === int1.segmentIndex) {
            currentShape.push({ x: int1.x, y: int1.y })
            currentShape = shape2Points  // Cambiar a la otra forma
            currentShape.push({ x: int1.x, y: int1.y })
            addedInt1 = true
        }

        if (!addedInt2 && i === int2.segmentIndex) {
            currentShape.push({ x: int2.x, y: int2.y })
            currentShape = shape1Points  // Volver a la primera
            currentShape.push({ x: int2.x, y: int2.y })
            addedInt2 = true
        }
    }

    // Crear las nuevas formas
    const originalArea = shape.getArea()
    const newShape1 = new Shape(shape1Points)
    const newShape2 = new Shape(shape2Points)

    // Dividir el valor proporcionalmente al área
    const ratio1 = newShape1.getArea() / originalArea
    newShape1.value = shape.value * ratio1
    newShape2.value = shape.value * (1 - ratio1)

    return [newShape1, newShape2]
}
```

---

## Implementación Visual

### Canvas Rendering

```javascript
class ShapeCutter {
    constructor(canvas) {
        this.canvas = canvas
        this.ctx = canvas.getContext('2d')
        this.shapes = []
        this.activeCutLine = null
        this.isDragging = false
    }

    // Dibujar todas las formas
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        // Dibujar formas
        this.shapes.forEach((shape, index) => {
            this.drawShape(shape, this.getShapeColor(index))
        })

        // Dibujar línea de corte activa
        if (this.activeCutLine) {
            this.drawCutLine(this.activeCutLine)
            this.drawCutPreview()
        }
    }

    drawShape(shape, color) {
        const ctx = this.ctx
        ctx.beginPath()
        ctx.moveTo(shape.points[0].x, shape.points[0].y)

        for (let i = 1; i < shape.points.length; i++) {
            ctx.lineTo(shape.points[i].x, shape.points[i].y)
        }

        ctx.closePath()
        ctx.fillStyle = color
        ctx.fill()
        ctx.strokeStyle = '#000'
        ctx.lineWidth = 2
        ctx.stroke()

        // Mostrar valor
        const center = this.getShapeCenter(shape)
        ctx.fillStyle = '#000'
        ctx.font = 'bold 16px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(`$${Math.round(shape.value)}`, center.x, center.y)
    }

    drawCutLine(cutLine) {
        const ctx = this.ctx
        ctx.beginPath()
        ctx.moveTo(cutLine.start.x, cutLine.start.y)
        ctx.lineTo(cutLine.end.x, cutLine.end.y)
        ctx.strokeStyle = '#FF0000'
        ctx.lineWidth = 3
        ctx.setLineDash([10, 5])
        ctx.stroke()
        ctx.setLineDash([])
    }

    drawCutPreview() {
        // Mostrar preview de cómo quedará el corte
        const targetShape = this.findShapeUnderCut(this.activeCutLine)
        if (!targetShape) return

        const result = cutShape(targetShape, this.activeCutLine)
        if (!result) return

        const [shape1, shape2] = result

        // Dibujar preview semi-transparente
        this.ctx.globalAlpha = 0.3
        this.drawShape(shape1, '#3B82F6')
        this.drawShape(shape2, '#10B981')
        this.ctx.globalAlpha = 1.0
    }

    // Event handlers
    onMouseDown(e) {
        const pos = this.getMousePos(e)
        this.activeCutLine = new CutLine(pos, pos)
        this.isDragging = true
    }

    onMouseMove(e) {
        if (!this.isDragging) return
        const pos = this.getMousePos(e)
        this.activeCutLine.end = pos
        this.render()
    }

    onMouseUp(e) {
        if (!this.isDragging) return
        this.isDragging = false

        // Ejecutar el corte
        const targetShape = this.findShapeUnderCut(this.activeCutLine)
        if (targetShape) {
            const result = cutShape(targetShape, this.activeCutLine)
            if (result) {
                // Reemplazar la forma original con las dos nuevas
                const index = this.shapes.indexOf(targetShape)
                this.shapes.splice(index, 1, ...result)
            }
        }

        this.activeCutLine = null
        this.render()
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect()
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        }
    }

    findShapeUnderCut(cutLine) {
        return this.shapes.find(shape => {
            const intersections = findAllIntersections(shape, cutLine)
            return intersections.length === 2
        })
    }

    getShapeCenter(shape) {
        const sumX = shape.points.reduce((sum, p) => sum + p.x, 0)
        const sumY = shape.points.reduce((sum, p) => sum + p.y, 0)
        return {
            x: sumX / shape.points.length,
            y: sumY / shape.points.length
        }
    }

    getShapeColor(index) {
        const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']
        return colors[index % colors.length]
    }
}
```

---

## SVG Implementation

### SVG-based Cutting

```javascript
class SVGShapeCutter {
    constructor(svgElement) {
        this.svg = svgElement
        this.shapes = []
        this.setupEventListeners()
    }

    createShapeElement(shape, id) {
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        path.setAttribute('d', shape.toSVGPath())
        path.setAttribute('id', id)
        path.setAttribute('fill', this.getNextColor())
        path.setAttribute('stroke', '#000')
        path.setAttribute('stroke-width', '2')
        path.dataset.value = shape.value

        // Label
        const center = this.getShapeCenter(shape)
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        text.setAttribute('x', center.x)
        text.setAttribute('y', center.y)
        text.setAttribute('text-anchor', 'middle')
        text.setAttribute('dominant-baseline', 'middle')
        text.textContent = `$${Math.round(shape.value)}`

        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g')
        group.appendChild(path)
        group.appendChild(text)

        return group
    }

    animateCut(originalElement, shape1, shape2) {
        // Crear elementos para las nuevas formas
        const elem1 = this.createShapeElement(shape1, 'shape-' + Date.now())
        const elem2 = this.createShapeElement(shape2, 'shape-' + (Date.now() + 1))

        // Posicionar en el mismo lugar
        elem1.style.opacity = 0
        elem2.style.opacity = 0

        this.svg.appendChild(elem1)
        this.svg.appendChild(elem2)

        // Animación
        originalElement.animate([
            { opacity: 1 },
            { opacity: 0 }
        ], { duration: 300 })

        setTimeout(() => {
            originalElement.remove()

            elem1.animate([
                { opacity: 0, transform: 'translateX(0)' },
                { opacity: 1, transform: 'translateX(-10px)' }
            ], { duration: 300, fill: 'forwards' })

            elem2.animate([
                { opacity: 0, transform: 'translateX(0)' },
                { opacity: 1, transform: 'translateX(10px)' }
            ], { duration: 300, fill: 'forwards' })
        }, 300)
    }
}
```

---

## Feedback y UX

### Cursor Personalizado

```javascript
// Cursor de tijeras durante el corte
function setCutCursor(canvas, isActive) {
    if (isActive) {
        canvas.style.cursor = `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="red" d="M6 6a3 3 0 1 0 0-3 3 3 0 0 0 0 3zm0 15a3 3 0 1 0 0-3 3 3 0 0 0 0 3zM20 4L8.12 15.88m6.35-1.4L20 20M8.12 8.12L12 12"/></svg>') 12 12, crosshair`
    } else {
        canvas.style.cursor = 'default'
    }
}
```

### Validación Visual

```javascript
function showCutFeedback(isValid, cutLine) {
    const color = isValid ? '#10B981' : '#EF4444'
    const dashArray = isValid ? [] : [5, 5]

    // Actualizar visualización de la línea
    cutLineElement.style.stroke = color
    cutLineElement.style.strokeDasharray = dashArray.join(' ')

    // Mensaje de feedback
    if (!isValid) {
        showTooltip(cutLine.end, 'Corte inválido - debe cruzar la forma')
    }
}
```

### Sonido

```javascript
const cutSounds = {
    start: new Audio('/sounds/scissors-open.mp3'),
    valid: new Audio('/sounds/paper-cut.mp3'),
    invalid: new Audio('/sounds/error-soft.mp3')
}

function playCutSound(type) {
    cutSounds[type].currentTime = 0
    cutSounds[type].play()
}
```
