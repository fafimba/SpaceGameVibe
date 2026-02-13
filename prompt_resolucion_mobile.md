# Prompt: Optimización de resolución mobile para Stellar Swarm

## Contexto

Stellar Swarm es un shooter roguelike estilo Vampire Survivors renderizado en Canvas 2D puro (un solo archivo `index.html`). Todo se dibuja con funciones vectoriales (`ctx.arc()`, `ctx.stroke()`, `ctx.fill()`, `ctx.fillText()`), no hay sprites ni imágenes rasterizadas.

El juego tiene un modo mobile (detectado con `isMobile()` que compara `window.innerWidth` vs `window.innerHeight`) y un modo desktop. El canvas se escala con CSS para ajustarse a la pantalla manteniendo aspect ratio.

## Cambio solicitado

Reducir la resolución interna del canvas en mobile de **720×1280** a **540×960** para mejorar rendimiento y reducir fatiga visual, ya que el juego puede tener hasta 500 enemigos, 4000 partículas, trails y efectos simultáneos.

## Cambios específicos requeridos

### 1. Resolución del canvas mobile

En la función `init()`, cambiar:
```
CANVAS_WIDTH = 720;
CANVAS_HEIGHT = 1280;
```
A:
```
CANVAS_WIDTH = 540;
CANVAS_HEIGHT = 960;
```

### 2. Ajuste proporcional de fuentes en canvas

Al reducir la resolución un 25%, las fuentes renderizadas con `ctx.fillText()` se verán más pequeñas proporcionalmente. Buscar TODOS los `ctx.font = ...` que se usen en contexto mobile y escalar los tamaños un ~25% hacia arriba para compensar. Ejemplos:

- Fuentes de 9px en mobile → subir a 12px
- Fuentes de 10px → subir a 13px
- Fuentes de 11px → subir a 14px
- Fuentes de 12px → subir a 15px
- Fuentes de 14px → subir a 18px
- Fuentes de 16px → subir a 20px
- Fuentes de 18px → subir a 22px
- Fuentes de 24px → subir a 30px

Prestar atención especial a:
- Los textos del HUD (`renderHUD`)
- Los nombres de armas en el menú (9-11px en mobile)
- Las upgrade cards
- Los floating texts de daño
- Los textos de WAVE alert
- Los textos del menú principal y game over

### 3. Ajuste de lineWidth mínimo

Actualmente hay líneas de 0.5px (grid lejano) y 1px que al escalar se verían demasiado finas. Aplicar un mínimo de 1px para cualquier lineWidth en mobile:
- Grid lejano: de ~0.5px a 1px
- Grid cercano: de ~1px a 1.5px
- Arcos de escudo de 1px: subir a 1.5px
- Asegurar que ningún `ctx.lineWidth` quede por debajo de 1 en mobile

### 4. Desactivar scanlines en mobile

Las scanlines CRT (`cachedScanlinePattern` con `rgba(127, 219, 255, 0.04)` al 30% de opacidad) contribuyen a fatiga visual en pantallas pequeñas. En `renderBackground()`, saltar el bloque de scanlines cuando `isMobile()` sea true:

```javascript
// 5. CRT Scanlines - skip on mobile
if (!isMobile()) {
    ctx.globalAlpha = 0.3 * gridFadeIn;
    ctx.fillStyle = cachedScanlinePattern;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.globalAlpha = 1;
}
```

### 5. Ajuste de UI layout mobile

Los cálculos de layout en mobile usan valores absolutos que asumen 720px de ancho. Revisar y ajustar:
- `cardW = mobile ? 140 : 200` → reducir proporcionalmente a `105` (o el valor que quepa bien en 540px)
- `cardH = mobile ? 100 : 120` → ajustar a `75`
- `gap = mobile ? 12 : 16` → mantener o reducir a `10`
- Posiciones absolutas del HUD (padding, posición de paneles)
- El joystick y touch controls (son CSS con position fixed, no deberían necesitar cambios ya que se posicionan relativos al viewport, no al canvas)

### 6. Ajuste de distancias de spawn

`spawnDistance` usa `CANVAS_WIDTH / 2 + offset` para calcular dónde aparecen los enemigos. Con 540px de ancho esto serían ~270px + offset, que podría hacer que los enemigos aparezcan demasiado cerca. Revisar si conviene usar un valor fijo mínimo o escalar:
```javascript
const spawnDistance = Math.max(400, CANVAS_WIDTH / 2 + offset);
```

### 7. Reducir viñeta

La viñeta actual oscurece los bordes con opacidad 0.15. En resolución más baja con pantalla mobile más pequeña, reducir a 0.08:
```javascript
vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.08)'); // era 0.15
```
(Aplicar solo en mobile)

## Lo que NO hay que cambiar

- La resolución desktop (1920×1080) permanece igual
- El mundo de juego (11520×6480) permanece igual
- La lógica de gameplay, colisiones, velocidades — todo eso opera en coordenadas del mundo, no del canvas
- `resizeCanvas()` ya escala el canvas con CSS para ajustarse al viewport — esto seguirá funcionando igual
- Los colores y la paleta no se tocan en este cambio

## Verificación

Después de los cambios, verificar que:
1. El canvas se crea a 540×960 en mobile
2. Se escala correctamente para llenar la pantalla
3. Los textos son legibles (no demasiado pequeños ni grandes)
4. Las líneas del grid son visibles pero no gruesas
5. No hay scanlines en mobile
6. Los enemigos no aparecen dentro de la pantalla visible
7. El HUD no se sale de los márgenes
8. Las upgrade cards caben bien en la pantalla
