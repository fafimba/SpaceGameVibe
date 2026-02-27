# Stellar Swarm — Setup Android con Capacitor

## Requisitos previos

Instala esto en tu máquina si no lo tienes:

1. **Node.js 18+** → https://nodejs.org (descarga LTS)
2. **Android Studio** → https://developer.android.com/studio
   - Al instalarlo, asegúrate de incluir: Android SDK, Android SDK Platform, Android Virtual Device
   - Después de instalar, abre Android Studio → Settings → SDK Manager → instala **Android API 34** (o la más reciente)
3. **JDK 17** → Android Studio normalmente lo incluye, pero si no:
   - Mac: `brew install openjdk@17`
   - Windows: descarga desde https://adoptium.net

### Variables de entorno (si no las tienes)

**Mac/Linux** — añade a `~/.zshrc` o `~/.bashrc`:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk   # Mac
# export ANDROID_HOME=$HOME/Android/Sdk         # Linux
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

**Windows** — añade a variables de entorno del sistema:
```
ANDROID_HOME = C:\Users\TU_USUARIO\AppData\Local\Android\Sdk
```

---

## Setup (una sola vez)

Abre terminal en la carpeta del proyecto (`SpaceGameVibe/`) y ejecuta estos comandos **en orden**:

### Paso 1: Instalar dependencias
```bash
npm install
npm install @capacitor/core @capacitor/cli @capacitor/android
```

### Paso 2: Inicializar Capacitor
```bash
npx cap init "Stellar Swarm" "com.fafimba.stellarswarm" --web-dir www
```
> Si te pregunta si quieres sobreescribir `capacitor.config.ts`, responde **sí** — ya lo tenemos configurado.
> (Realmente no debería preguntar porque ya existe, pero por si acaso.)

### Paso 3: Añadir plataforma Android
```bash
npx cap add android
```
Esto crea la carpeta `android/` con el proyecto nativo completo.

### Paso 4: Sincronizar archivos web → Android
```bash
npx cap sync android
```
Esto copia `www/` al proyecto Android.

### Paso 5: Abrir en Android Studio
```bash
npx cap open android
```
Se abre Android Studio con el proyecto. La primera vez tarda un poco en indexar y descargar dependencias de Gradle.

---

## Probar en emulador o dispositivo

### Opción A: Emulador
1. En Android Studio → Device Manager → Create Virtual Device
2. Elige un Pixel 7 o similar → Next
3. Selecciona una imagen de sistema (API 34) → Next → Finish
4. Click en el botón ▶️ (Run) en Android Studio

### Opción B: Dispositivo real (recomendado)
1. En tu teléfono Android: Ajustes → Acerca del teléfono → toca "Número de compilación" 7 veces
2. Vuelve a Ajustes → Opciones de desarrollador → Activa "Depuración USB"
3. Conecta el teléfono por USB al ordenador
4. En Android Studio aparecerá tu dispositivo → Click ▶️ Run

---

## Cada vez que cambies el juego

Cuando modifiques `index.html`:

```bash
# 1. Copia la versión actualizada a www/
cp index.html www/index.html

# 2. Sincroniza con el proyecto Android
npx cap sync android

# 3. Ejecuta desde Android Studio (botón Run)
```

O más rápido — Capacitor tiene live reload para desarrollo:
```bash
npx cap run android --livereload --external
```

---

## Configurar para fullscreen (inmersivo)

Para que la app sea fullscreen (sin barra de estado ni navegación), edita el archivo que Capacitor genera en:

`android/app/src/main/res/values/styles.xml`

Cambia el tema a:
```xml
<style name="AppTheme" parent="Theme.AppCompat.NoActionBar">
    <item name="android:statusBarColor">@android:color/black</item>
    <item name="android:navigationBarColor">@android:color/black</item>
</style>
```

Y en `android/app/src/main/java/.../MainActivity.java`, añade:
```java
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Fullscreen immersive
        getWindow().getDecorView().setSystemUiVisibility(
            View.SYSTEM_UI_FLAG_FULLSCREEN
            | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            | View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        );
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
    }
}
```

---

## Generar APK firmado (para subir a Play Store)

### Crear keystore (una sola vez)
```bash
keytool -genkey -v -keystore stellar-swarm-release.keystore \
  -alias stellarswarm -keyalg RSA -keysize 2048 -validity 10000
```
> GUARDA ESTE ARCHIVO Y LA CONTRASEÑA. Si lo pierdes, no puedes actualizar la app nunca más.

### Build release
En Android Studio:
1. Build → Generate Signed Bundle / APK
2. Selecciona **Android App Bundle (.aab)** (Play Store prefiere AAB sobre APK)
3. Selecciona tu keystore, introduce la contraseña
4. Build type: **release**
5. El archivo `.aab` se genera en `android/app/release/`

### Subir a Play Console
1. Ve a https://play.google.com/console
2. Create app → llena los datos
3. Internal testing → Create new release → sube el `.aab`
4. Invita 20 testers (puedes usar tu propio email + amigos/familia)

---

## Estructura del proyecto

```
SpaceGameVibe/
├── package.json              ← config npm
├── capacitor.config.ts       ← config Capacitor
├── node_modules/             ← (se crea con npm install)
├── www/                      ← web assets (lo que Capacitor empaqueta)
│   ├── index.html            ← tu juego
│   └── cosmic-rite-60s.ogg   ← música
├── android/                  ← (se crea con cap add android)
│   ├── app/
│   │   └── src/main/
│   │       ├── java/com/fafimba/stellarswarm/
│   │       │   └── MainActivity.java
│   │       ├── res/           ← iconos, splash, strings
│   │       └── assets/public/ ← copia de www/
│   └── build.gradle
├── index.html                ← fuente original del juego (editas aquí)
├── cosmic-rite-60s.ogg       ← fuente original de música
└── SETUP_ANDROID.md          ← este archivo
```

---

## Resumen de comandos

| Qué | Comando |
|-----|---------|
| Instalar deps | `npm install` |
| Sincronizar web→android | `npx cap sync android` |
| Abrir Android Studio | `npx cap open android` |
| Live reload (desarrollo) | `npx cap run android --livereload --external` |
| Build debug APK | `cd android && ./gradlew assembleDebug` |
| Build release AAB | Desde Android Studio → Build → Generate Signed Bundle |
