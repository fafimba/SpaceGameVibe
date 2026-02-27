# Prompt: Implementar sistema Demo / Full Version

## Contexto
Stellar Swarm va a publicarse en Google Play como app gratuita con un sistema de demo: el jugador puede jugar gratis hasta cierto punto, y para seguir jugando necesita comprar la versión completa (one-time IAP) o ser subscriber de Google Play Pass. Por ahora NO hay ads en el juego — la monetización es 100% via compra/Play Pass.

## Qué implementar

### 1. Flag de versión completa
- Añadir una constante `DEMO_MAX_LEVEL = 10` (configurable, decidir después el número exacto)
- Añadir una variable `isFullVersion` que se carga desde `localStorage` (key: `stellarswarm_fullversion`)
- En `loadProgression()` / `saveProgression()`, incluir este flag en la estructura de progression
- Cuando `isFullVersion === true`, el juego funciona sin límites (como ahora)
- Cuando `isFullVersion === false`, el juego se detiene cuando el jugador alcanza el nivel límite

### 2. Pantalla de "Demo completada"
Cuando el jugador sube al nivel `DEMO_MAX_LEVEL` y no es full version (comprobar en `levelUp()` o `collectXP()`):
- Pausar el juego (no matar al jugador, no es game over)
- Mostrar una pantalla superpuesta con el estilo visual del juego (neon outline, fondo oscuro semitransparente)
- Texto principal: "DEMO COMPLETE" (en el estilo dorado del juego, COLORS.ui)
- Texto secundario: "You've reached level [X]. Unlock the full game to keep playing!"
- Estadísticas de la run actual (kills, time survived, wave reached) para que vea lo bien que iba
- Botón "UNLOCK FULL GAME" — por ahora al pulsarlo simplemente setea `isFullVersion = true` en localStorage y reanuda la partida (la integración real con Google Play Billing se hará después con un plugin de Capacitor)
- Botón "BACK TO MENU" — vuelve al menú principal
- Ambos botones deben funcionar en mobile (touch) y desktop (click)
- La pantalla debe respetar el sistema de coordenadas del juego (worldToScreen/canvas scaling)

### 3. Indicador de nivel en el HUD
- El nivel del jugador ya se muestra en el HUD, pero en modo demo mostrar adicionalmente "Lv 5/10" (o similar) para que el jugador sepa cuánto le queda antes del límite
- Cuando es full version, mostrar solo el nivel normal sin el "/10"

### 4. Menú principal — indicador de versión
- En el menú principal, si es demo, mostrar un texto discreto "DEMO" o "FREE VERSION" en alguna esquina
- Si es full version, no mostrar nada (o "FULL VERSION" discreto)

### 5. Cheat code para testing
- Añadir un cheat code (como los existentes en L1019-1073) para toggle entre demo y full version
- Sugerencia: escribir "unlock" para activar full version, "demo" para volver a demo

## Restricciones técnicas
- Seguir las reglas de CLAUDE.md estrictamente (leer code-index primero, actualizar code-index después)
- Seguir el estilo visual neon geometric outline del juego
- NO usar shadowBlur/glow en la pantalla de unlock (puede haber muchos enemigos en segundo plano)
- La pantalla de unlock es un nuevo gameState: `demoEnd` — añadirlo a los estados válidos
- Usar el patrón existente de renderizado de pantallas (como renderMenu, renderShop, renderGameOver)
- Los clicks deben usar el mismo patrón de handleMenuClick/handleShopClick (getBoundingClientRect + scale)
- Mobile-friendly: botones grandes, funcionar con touch

## Flujo del jugador

```
Descarga gratis → Juega → Sube a nivel 10 → Pantalla "Demo Complete"
                                                ├→ "Unlock Full Game" → Compra → Sigue jugando sin límites
                                                └→ "Back to Menu" → Puede empezar otra run (pero se para otra vez en nivel 10)

Si tiene Play Pass → isFullVersion = true automáticamente (esto se hará después via Billing API)
```

## Lo que NO implementar ahora
- NO integrar Google Play Billing Library (eso se hace después con un plugin de Capacitor)
- NO añadir ads de ningún tipo
- NO bloquear la shop/progression en modo demo — el jugador puede seguir comprando upgrades permanentes y desbloqueando armas con los cristales que gane en sus runs de demo
- NO cambiar el core gameplay en modo demo — es el juego completo, solo con límite de nivel del jugador
