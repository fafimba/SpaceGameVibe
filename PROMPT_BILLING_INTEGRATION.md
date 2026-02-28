# PROMPT: Integrar Google Play Billing via Digital Goods API

## Contexto

El juego "Space Survivor" es una TWA (Trusted Web Activity) publicada en Google Play. Ya tiene implementado un sistema de demo/unlock:

- `DEMO_MAX_LEVEL = 10` — nivel máximo en demo
- `isFullVersion` — flag global (boolean)
- `loadFullVersion()` / `saveFullVersion()` — persiste en localStorage
- `gameState = 'demoEnd'` — pantalla con botón "UNLOCK FULL GAME"
- `handleDemoEndClick()` — actualmente hace `saveFullVersion(true)` directamente (placeholder)
- Cheat codes "unlock" / "demo" para testing

## Tarea

Reemplazar el placeholder del botón "UNLOCK FULL GAME" con la integración real de **Digital Goods API + Payment Request API** para cobrar a través de Google Play Billing.

## Producto a crear en Play Console

- **Product ID**: `full_game_unlock`
- **Tipo**: Producto in-app (one-time purchase, no subscription)
- **Precio sugerido**: $1.99 USD (lo configura el dev en Play Console)

## Implementación requerida

### 1. Servicio de Digital Goods (añadir cerca de las funciones de fullVersion, ~L970)

```javascript
// Digital Goods API for Play Billing
let digitalGoodsService = null;
const PRODUCT_ID = 'full_game_unlock';

async function initDigitalGoods() {
    if (!('getDigitalGoodsService' in window)) {
        console.log('Digital Goods API not available (not in TWA)');
        return false;
    }
    try {
        digitalGoodsService = await window.getDigitalGoodsService('https://play.google.com/billing');
        console.log('Digital Goods Service connected');
        // Check for existing purchases (user already bought or has Play Pass)
        await checkExistingPurchases();
        return true;
    } catch (e) {
        console.warn('Failed to init Digital Goods:', e);
        return false;
    }
}

async function checkExistingPurchases() {
    if (!digitalGoodsService) return;
    try {
        const purchases = await digitalGoodsService.listPurchases();
        for (const purchase of purchases) {
            if (purchase.itemId === PRODUCT_ID) {
                // User already purchased (or has Play Pass) — unlock
                saveFullVersion(true);
                console.log('Existing purchase found, full version unlocked');
                return;
            }
        }
    } catch (e) {
        console.warn('Error checking purchases:', e);
    }
}
```

### 2. Función de compra (añadir después de initDigitalGoods)

```javascript
async function purchaseFullGame() {
    // If Digital Goods API not available, just unlock (for web/testing)
    if (!digitalGoodsService) {
        console.log('No billing service — unlocking directly (dev/web mode)');
        saveFullVersion(true);
        gameState = 'playing';
        return;
    }

    try {
        // Get product details (price, title, etc.)
        const details = await digitalGoodsService.getDetails([PRODUCT_ID]);
        if (!details || details.length === 0) {
            console.error('Product not found in Play Console');
            spawnFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'Purchase unavailable', '#FF4444');
            return;
        }

        const product = details[0];

        // Create Payment Request
        const paymentMethod = {
            supportedMethods: 'https://play.google.com/billing',
            data: {
                sku: PRODUCT_ID
            }
        };

        const paymentDetails = {
            total: {
                label: product.title || 'Unlock Full Game',
                amount: { currency: product.price.currency, value: product.price.value }
            }
        };

        const request = new PaymentRequest([paymentMethod], paymentDetails);
        const response = await request.show();

        // Validate the purchase
        const { purchaseToken } = response.details;

        // Acknowledge the purchase (required by Google)
        await digitalGoodsService.acknowledge(purchaseToken, 'onetime');

        // Complete the payment flow
        await response.complete('success');

        // Unlock the game!
        saveFullVersion(true);
        gameState = 'playing';
        spawnFloatingText(player.x, player.y - 50, 'FULL GAME UNLOCKED!', '#39FF14');
        console.log('Purchase successful!');

    } catch (e) {
        if (e.name === 'AbortError') {
            console.log('Purchase cancelled by user');
        } else {
            console.error('Purchase error:', e);
            spawnFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, 'Purchase failed', '#FF4444');
        }
    }
}
```

### 3. Inicialización (en la función `init()`, después de `loadFullVersion()`)

Buscar `loadFullVersion();` en `init()` y añadir después:

```javascript
loadFullVersion();
initDigitalGoods(); // async, no await — runs in background
```

### 4. Modificar handleDemoEndClick() (~L10122)

Reemplazar el bloque del botón 'unlock':

```javascript
// ANTES (placeholder):
if (btn.type === 'unlock') {
    saveFullVersion(true);
    gameState = 'playing';
    return true;
}

// DESPUÉS (billing real):
if (btn.type === 'unlock') {
    purchaseFullGame(); // async — handles the full flow
    return true;
}
```

### 5. Verificar al volver de background (opcional pero recomendado)

En el event listener de `visibilitychange` o `focus`, volver a verificar purchases por si el usuario completó la compra desde otro flujo:

```javascript
document.addEventListener('visibilitychange', () => {
    if (!document.hidden && !isFullVersion && digitalGoodsService) {
        checkExistingPurchases();
    }
});
```

### 6. Mostrar precio real en el botón (opcional, mejora UX)

En `renderDemoEnd()`, si tenemos los detalles del producto, mostrar el precio real en vez de solo "UNLOCK FULL GAME":

```javascript
// Variable global para cachear el precio
let cachedProductPrice = null;

// En initDigitalGoods(), después de conectar el servicio:
if (digitalGoodsService) {
    try {
        const details = await digitalGoodsService.getDetails([PRODUCT_ID]);
        if (details && details.length > 0) {
            cachedProductPrice = details[0].price.value + ' ' + details[0].price.currency;
        }
    } catch (e) {}
}

// En renderDemoEnd(), cambiar el texto del botón:
const unlockText = cachedProductPrice
    ? 'UNLOCK FULL GAME — ' + cachedProductPrice
    : 'UNLOCK FULL GAME';
ctx.fillText(unlockText, cx, unlockY + (mobile ? 46 : 37));
```

## Google Play Pass

**No requiere código adicional.** Cuando un suscriptor de Play Pass instala tu app desde Play Store, Google Play automáticamente otorga acceso a todos los productos in-app. `listPurchases()` devolverá el producto como si lo hubiera comprado. El flujo de `checkExistingPurchases()` lo detecta y desbloquea automáticamente.

## Pasos en Play Console (los hace el dev manualmente)

1. Ir a **Monetización → Productos → Productos en la aplicación**
2. Crear producto con ID: `full_game_unlock`
3. Nombre: "Unlock Full Game" / "Desbloquear juego completo"
4. Precio: $1.99 USD (o lo que decida el dev)
5. Estado: **Activo**

## Testing

- **En navegador (fuera de TWA)**: el Digital Goods API no existe, así que `initDigitalGoods()` falla silenciosamente y el botón unlock simplemente desbloquea directo (modo dev).
- **En TWA sin producto creado**: `getDetails()` devuelve vacío, muestra "Purchase unavailable".
- **En TWA con producto**: flujo completo de compra con popup de Google Play.
- **Cheat codes "unlock"/"demo"**: siguen funcionando para testing rápido.
- **Play Pass tester**: usar cuenta de test de Play Pass en Play Console.

## Importante — Build con Gradle (sin Bubblewrap)

El proyecto TWA se compila directamente con Gradle (no usamos Bubblewrap para build). Para que el Digital Goods API funcione, hay que asegurar la dependencia de billing en el proyecto Android:

### Dependencia requerida en `build.gradle` (app level)

```gradle
dependencies {
    // La dependencia principal de TWA (ya debería estar):
    implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'

    // AÑADIR esta línea para Play Billing via Digital Goods API:
    implementation 'com.google.androidbrowserhelper:billing:1.1.0'
}
```

La librería `billing:1.1.0` es la que conecta el Digital Goods API (JavaScript en el navegador) con Google Play Billing Library 7 (nativo Android). Sin esta dependencia, `getDigitalGoodsService()` fallará en el JS.

### Verificar

Después de añadir la dependencia, hacer un `gradle sync` en Android Studio y rebuild. La app debe compilar sin errores.

### Play Billing Library 7

La versión `billing:1.1.0` ya incluye Play Billing Library 7, que es obligatorio desde agosto 2025 para apps nuevas o actualizaciones en Play Store. No necesitas hacer nada más.

## Archivos a modificar

- `index.html` — añadir funciones de billing JS, modificar handleDemoEndClick, modificar init()
- `build.gradle` (app level) — añadir dependencia `com.google.androidbrowserhelper:billing:1.1.0`

## NO modificar

- `twa-manifest.json` (ya tiene playBilling enabled)
- Estructura del demo system existente (solo reemplazar el placeholder del botón unlock)
