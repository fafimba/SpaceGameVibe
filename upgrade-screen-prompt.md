# Prompt: Rediseñar la pantalla de upgrade como overlay sobre el juego

## Objetivo

Reemplazar la pantalla de upgrade actual (que es un panel HTML/CSS que cubre totalmente el juego) por un overlay renderizado directamente en el canvas del juego, con una animación estilo "blueprint neon" donde líneas salen de la nave del jugador hacia las cajas de upgrade.

Hay un mockup visual del concepto en `upgrade-screen-mockup.html` — ábrelo en el navegador para ver la animación. Es la referencia visual principal.

## Concepto Visual

1. **Blur/oscurecimiento**: Cuando el jugador sube de nivel, el juego se pausa y se dibuja una capa oscura semi-transparente sobre todo (simula blur). NO usar CSS filter blur por rendimiento — solo un overlay oscuro `rgba(2, 6, 16, 0.65)` es suficiente.

2. **"LEVEL UP"**: Aparece en dorado (`COLORS.GOLD`) con glow sutil encima de la nave del jugador, con dos rayitas decorativas a los lados.

3. **Nave nítida**: La nave del jugador se redibuja ENCIMA del overlay, más grande (x1.3), con un sutil anillo circular alrededor. La nave debe ser la real del juego (usar `renderPlayer()` o dibujarla con los mismos trazos).

4. **Líneas de conexión estilo blueprint**: Tres líneas salen de puntos cercanos a la nave y crecen animadamente hacia abajo hasta cada carta de upgrade. El recorrido es: bajan vertical → giro horizontal hacia la posición de la carta → bajan vertical hasta la carta. Cada línea tiene:
   - Color basado en el arma/upgrade que representa (usar el color del arma del sistema WEAPONS)
   - Una línea fina principal (~2px) con un glow difuso más ancho (~8px, baja opacidad)
   - Un punto luminoso que pulsa en el extremo mientras crece
   - Un punto pequeño en el origen (donde sale de la nave)
   - Las tres líneas se escalonan ligeramente (0ms, 80ms, 160ms de delay)

5. **Cartas de upgrade**: Aparecen con fade-in + slide-up sutil cuando las líneas llegan. Cada carta:
   - Fondo oscuro semi-transparente con borde sutil (como el panel del HUD)
   - **NO** tiene etiqueta de rareza (no hay sistema de rareza)
   - **NO** escribe el nivel como texto — ya se ve en los dots de progreso de abajo
   - Muestra: icono del arma, nombre, descripción corta
   - Hover: borde se ilumina con el color del arma + glow sutil
   - Los dots de nivel se mantienen como están actualmente (10 puntos indicando progreso)

6. **Texto "ELIGE MEJORA"**: Aparece encima de las cartas, sutil y espaciado.

## Implementación Técnica

### Qué ELIMINAR
- El HTML del `#upgradePanel` en el `<body>` (L357-372 aprox)
- El CSS del `#upgradePanel` y todos sus hijos (L10-355 aprox, la parte que corresponda al upgrade panel)
- La función `showUpgradePanel()` actual que manipula DOM
- La función `hideUpgradePanel()` actual

### Qué CREAR
Todo se renderiza en canvas dentro del game loop. Nuevas funciones necesarias:

1. **`showUpgradeOverlay()`** — reemplaza a `showUpgradePanel()`:
   - Genera las 3 opciones de upgrade (reutilizar `generateUpgradeOptions()` que ya existe)
   - Inicia el estado de animación del overlay (timestamp de inicio, fase)
   - Setea `gameState = 'skilltree'` (mismo que ahora)
   - NO toca DOM

2. **`renderUpgradeOverlay()`** — llamada desde `render()` cuando `gameState === 'skilltree'`:
   - Dibuja overlay oscuro con fade-in animado
   - Dibuja "LEVEL UP" en dorado con glow
   - Redibuja la nave del jugador centrada en pantalla, más grande
   - Dibuja las 3 líneas animadas de nave→carta
   - Dibuja las 3 cartas de upgrade con fade-in
   - Dibuja "ELIGE MEJORA" encima de las cartas
   - Toda la animación de entrada dura ~1.2 segundos total

3. **`updateUpgradeOverlay(dt)`** — llamada desde `update()`:
   - Avanza el timer de animación del overlay
   - Maneja hover detection en las cartas (comparando posición del mouse/touch contra la pantalla)

4. **`handleUpgradeClick(screenX, screenY)`** — maneja clicks en las cartas:
   - Determina qué carta se clickeó según coordenadas de pantalla
   - Llama a `selectUpgrade(option)` (la lógica de `selectUpgrade` se mantiene igual, solo quitar la parte que manipula DOM)

### Variables de estado del overlay
```javascript
let upgradeOverlay = {
    active: false,
    startTime: 0,
    options: [],        // las 3 opciones generadas
    hoveredCard: -1,
    // Posiciones calculadas (en coordenadas de pantalla)
    shipScreenPos: { x: 0, y: 0 },
    cardPositions: [],  // [{x, y}, {x, y}, {x, y}]
};
```

### Posicionamiento
- La nave se dibuja en pantalla en su posición real (usar `worldToScreen(player.x, player.y)`) pero clampear para que quede en el tercio superior
- Las cartas se posicionan horizontalmente centradas, en el tercio inferior de la pantalla
- Las líneas conectan la nave con cada carta
- Todo en coordenadas de PANTALLA (no world), porque es UI

### Interacción
- Click/touch en carta → `selectUpgrade()` → si quedan más skillPoints, `showUpgradeOverlay()` de nuevo
- Las teclas 1/2/3 siguen funcionando para seleccionar rápidamente
- En mobile: tap directo en las cartas

### Animación temporal (fases)
```
t=0.0s       Overlay oscuro empieza a aparecer
t=0.15s      "LEVEL UP" fade in con glow
t=0.25s      Líneas empiezan a crecer desde la nave (escalonadas)
t=0.25-0.95s Líneas crecen con easing hacia las cartas
t=0.70s      Cartas empiezan su fade-in + slide-up
t=1.10s      "ELIGE MEJORA" aparece
t=1.2s       Todo visible, esperando input
```

### Performance
- NO usar shadowBlur en las líneas (hay 3 solamente, pero por consistencia). Usar líneas dobles (una gruesa baja opacidad + una fina) para simular glow.
- Los dots de nivel y los iconos de armas se dibujan con las funciones existentes (`drawSkillIcon`, `drawUpgradeIcon`).
- La animación es solo de entrada. Una vez completada, el overlay es estático salvo hover.

### Integración con el flujo existente
- `levelUp()` sigue llamando a la función de mostrar panel, solo cambia el nombre
- `selectUpgrade()` mantiene su lógica interna (weapon_activation, upgrade, bonus), solo quitarle la manipulación DOM (querySelector, classList, etc.)
- `hideUpgradePanel()` → `hideUpgradeOverlay()`: simplemente setea `upgradeOverlay.active = false` y `gameState = 'playing'`
- El weapon inventory bar (que muestra las armas activas arriba del panel) se puede integrar opcionalmente como una fila de iconos encima de las cartas

## Resumen de lo que NO cambia
- `generateUpgradeOptions()` — misma lógica
- `getAvailableUpgrades()` — misma lógica
- `selectUpgrade()` — misma lógica interna (solo quitar DOM manipulation)
- `drawSkillIcon()` — reutilizar para los iconos en canvas
- Sistema de teclas 1/2/3 para selección rápida
- La lógica de skillPoints y re-mostrar panel si quedan más
