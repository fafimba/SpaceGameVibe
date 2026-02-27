# Stellar Swarm — Setup TWA (Trusted Web Activity)

## ¿Qué es TWA?

Una TWA ejecuta tu juego **dentro de Chrome real** (no WebView). El rendimiento es idéntico a abrir el juego en Chrome, pero el usuario lo ve como una app nativa a pantalla completa, sin barra de URL.

---

## Paso 1: Subir los cambios a GitHub Pages

Sube los archivos nuevos (manifest, service worker, icons) a tu repo:

```bash
git add manifest.json sw.js icons/ index.html
git commit -m "Add PWA support (manifest, service worker, icons)"
git push
```

Verifica que funciona: `https://fafimba.github.io/SpaceGameVibe/`

---

## Paso 2: Instalar Bubblewrap

Bubblewrap es la herramienta oficial de Google para crear APKs de TWA.

**Requisitos:** Node.js 14+, JDK 8+, Android SDK (si ya tienes Android Studio, ya los tienes).

```bash
npm i -g @bubblewrap/cli
```

La primera vez que lo ejecutes, Bubblewrap ofrecerá descargar e instalar dependencias automáticamente (JDK, Android SDK). Si ya tienes Android Studio, puedes decirle que no y apuntar a tu SDK existente.

---

## Paso 3: Inicializar el proyecto TWA

Desde la carpeta de tu proyecto:

```bash
bubblewrap init --manifest="https://fafimba.github.io/SpaceGameVibe/manifest.json"
```

Bubblewrap leerá tu manifest y te preguntará:

1. **Package ID** → `com.fafimba.stellarswarm` (confirma)
2. **App name** → `Stellar Swarm` (confirma)
3. **Start URL** → debería autocompletarse desde el manifest
4. **Signing key** → la primera vez, te pide crear una. GUARDA LA CONTRASEÑA.
5. **Theme/background colors** → confirma negro (#000000)

---

## Paso 4: Build

```bash
bubblewrap build
```

Esto genera dos archivos:
- `app-release-signed.apk` → para testing en tu dispositivo
- `app-release-bundle.aab` → para subir a Play Store

---

## Paso 5: Probar en tu dispositivo

Conecta tu teléfono con USB debugging y:

```bash
adb install app-release-signed.apk
```

O simplemente copia el APK al teléfono e instálalo desde el explorador de archivos.

---

## Paso 6: Digital Asset Links (para ocultar la barra de URL)

Para que Chrome oculte la barra de URL y se vea 100% como app nativa, necesitas verificar tu dominio.

### 6.1 Obtener tu fingerprint SHA-256

```bash
keytool -list -v -keystore ./poner-ruta-del-keystore-aqui -alias stellarswarm
```

Copia el valor de `SHA256:` (algo como `AA:BB:CC:DD:...`).

### 6.2 Crear el archivo assetlinks.json

Crea un archivo en tu repo en la ruta `.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.fafimba.stellarswarm",
    "sha256_cert_fingerprints": ["TU_SHA256_AQUI"]
  }
}]
```

### 6.3 Subir a GitHub Pages

```bash
mkdir -p .well-known
# (crea assetlinks.json ahí con tu fingerprint)
git add .well-known/
git commit -m "Add digital asset links for TWA verification"
git push
```

Verifica que funciona: `https://fafimba.github.io/.well-known/assetlinks.json`

**NOTA:** GitHub Pages a veces no sirve carpetas que empiezan con `.` Para solucionarlo, asegúrate de tener un archivo `.nojekyll` en la raíz del repo (ya lo tienes).

---

## Paso 7: Subir a Play Store

1. Ve a Google Play Console
2. Create app → llena los datos
3. Internal testing → Create new release
4. Sube el archivo `app-release-bundle.aab`
5. Invita testers, espera los 14 días obligatorios
6. Publica en producción

---

## Actualizar el juego

La gran ventaja de TWA: para actualizar el juego, solo haces push a GitHub Pages. **No necesitas generar un nuevo APK ni pasar por revisión de Google.** Los cambios se ven al instante.

Solo necesitas un nuevo APK si cambias algo de la configuración nativa (nombre de app, iconos, permisos).

---

## Resumen de comandos

| Qué | Comando |
|-----|---------|
| Instalar Bubblewrap | `npm i -g @bubblewrap/cli` |
| Inicializar TWA | `bubblewrap init --manifest="URL/manifest.json"` |
| Build APK + AAB | `bubblewrap build` |
| Instalar en dispositivo | `adb install app-release-signed.apk` |

---

## TWA vs Capacitor

| | TWA | Capacitor |
|---|---|---|
| Motor | Chrome real | WebView del sistema |
| Rendimiento | Idéntico a Chrome | Potencialmente peor |
| Actualizar juego | Push a GitHub, instantáneo | Nuevo APK + review |
| APIs nativas | Limitado (Digital Goods API) | Completo (plugins) |
| Play Billing | Via Digital Goods API | Via plugin nativo |
| Offline | Service Worker | WebView local |
