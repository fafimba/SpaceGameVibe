# Stellar Swarm — Roadmap de Lanzamiento y Monetización

## Estado Actual del Juego

- **10,061 líneas** en un solo `index.html`
- Core loop funcional, 11 armas con progresión, sistema de upgrades permanentes
- **Ya optimizado para mobile**: touch controls, joystick virtual, safe areas, responsive
- **Sin monetización ni analytics** actualmente
- Sin `package.json`, sin Capacitor, sin cuentas de desarrollador

---

## Decisión Técnica: Capacitor (Recomendado)

**¿Por qué Capacitor y no PWA/TWA?**

| | Capacitor | PWA/TWA |
|---|---|---|
| Play Store | Sí (APK/AAB nativo) | Sí (limitado) |
| App Store | Sí | No viable |
| AdMob nativo | Sí (plugin oficial) | No |
| Play Pass compatible | Sí | No |
| Billing API (IAPs) | Sí (plugin oficial) | No |
| Performance | WebView optimizado | Similar |
| Esfuerzo extra | ~1 día setup | Menos, pero limitado |

Capacitor envuelve tu HTML5 en una app nativa real. Mismo código, acceso a APIs nativas (ads, billing, analytics). Es el camino correcto para tu caso.

---

## Plan por Fases

### FASE 0: Preparación (1-2 días)

**Cuentas necesarias:**

1. **Google Play Console** — $25 pago único
   - https://play.google.com/console/signup
   - Necesitas: cuenta Google, tarjeta de pago, ID verificación

2. **AdMob** (cuando decidas monetizar con ads)
   - https://admob.google.com
   - Vincular con Play Console

3. **Apple Developer Program** — $99/año (cuando llegue el momento de iOS)

**Herramientas locales:**
- Node.js + npm
- Android Studio (para builds)
- JDK 17+

---

### FASE 1: Capacitor Setup + Build Android (3-5 días)

```
Estructura objetivo:
stellar-swarm/
├── package.json
├── capacitor.config.ts
├── www/                    ← tu index.html + assets van aquí
│   ├── index.html
│   └── cosmic-rite-60s.ogg
├── android/                ← proyecto Android auto-generado
└── ios/                    ← (futuro)
```

**Pasos técnicos:**
1. Inicializar proyecto npm + instalar Capacitor
2. Copiar `index.html` + assets a `www/`
3. `npx cap add android`
4. Configurar `capacitor.config.ts` (nombre app, bundle ID, etc.)
5. Abrir en Android Studio, probar en emulador
6. Generar APK firmado para testing

**Bundle ID sugerido:** `com.tellmewow.stellarswarm`

---

### FASE 2: Monetización Limpia (3-5 días)

#### Opción A: Play Pass (la más limpia)

**Cómo funciona:**
- Los usuarios pagan $4.99/mes a Google por acceso a cientos de apps/juegos
- Tu juego se ofrece SIN ADS y con todo desbloqueado
- Google te paga royalties basados en engagement (no solo tiempo)
- Los devs reportan haber **duplicado sus ingresos** en Play Pass vs modelo normal

**Requisitos:**
- Tener la app publicada en Play Store
- Aplicar desde Play Console → Programs → Play Pass
- Tu juego necesita ser compatible: sin ads obligatorios, contenido accesible
- Google selecciona títulos, pero aceptan aplicaciones de todos los devs

**Para hacer tu juego Play Pass-compatible:**
- Detectar si el usuario es subscriber de Play Pass (via Billing API)
- Si es subscriber: todo desbloqueado, sin ads
- Si no: modelo normal (free + ads opcionales)

#### Opción B: Modelo Limpio Free + Rewarded Ads

Si Play Pass tarda o no te seleccionan, un modelo limpio sería:
- **Rewarded video ads** (100% opcionales): "Ver anuncio para continuar", "Ver anuncio para x2 cristales"
- **IAP "Remove Ads"** ($2.99-3.99): elimina todos los ads
- **Sin interstitials agresivos**, sin banners
- El juego es completamente jugable sin ver ni un solo ad

#### Opción C: Híbrido (Recomendado)

Combinar ambos:
- Publicar free con rewarded ads + IAP remove ads
- Aplicar a Play Pass simultáneamente
- Si te aceptan en Play Pass, los subscribers automáticamente tienen "remove ads" + contenido premium

---

### FASE 3: Pre-publicación (2-3 días)

**Assets necesarios para Play Store:**
- Icono 512x512 (PNG, alta resolución)
- Feature graphic 1024x500
- Screenshots: mínimo 2 (recomendado 4-8)
  - Teléfono: 1080x1920 o 1920x1080
  - Tablet: 1200x1920 (opcional pero recomendado)
- Descripción corta (80 chars) + descripción larga
- Categoría: Juegos → Arcade / Acción
- Clasificación de contenido (cuestionario IARC)
- Política de privacidad (obligatoria si usas ads/analytics)

**Política de privacidad:**
- Necesitas una URL pública con tu privacy policy
- Puede ser una página simple en GitHub Pages o tu dominio

---

### FASE 4: Internal Testing → Closed Testing (1-2 semanas)

1. **Internal testing** (hasta 100 testers, aprobación instantánea)
   - Subir AAB firmado
   - Probar en dispositivos reales
   - Verificar: rendimiento, controles, crashes

2. **Closed testing** (alpha/beta, hasta 1000 testers)
   - Google requiere **20 testers durante 14 días** antes de producción
   - Este es un requisito obligatorio desde 2023
   - Aprovecha para medir: session length, retention informal

3. **Iterar** basado en feedback

---

### FASE 5: Producción + Play Pass Application (1 semana)

1. Subir AAB de producción
2. Completar store listing
3. Enviar para revisión (1-3 días normalmente)
4. **Aplicar a Play Pass** desde Play Console
5. **Aplicar a Google Play Games Level Up** (programa nuevo 2025)
   - Herramientas promocionales
   - Mayor visibilidad en Play Store
   - Primer milestone: julio 2026

---

### FASE 6: iOS (cuando Android esté validado)

- `npx cap add ios`
- Abrir en Xcode
- Apple Developer account ($99/año)
- Misma app, adaptada a App Store guidelines
- Decisión: ¿Premium $3.99 sin ads o mismo modelo free?

---

## Nuevo Programa: Google Play Games Level Up

Google lanzó en septiembre 2025 un programa para juegos:
- **Abierto a todos los juegos**
- Beneficios: espacio propio para engagement con jugadores, herramientas de contenido en Play Console, mayor descubrimiento en editorial del Play Store
- Primer milestone: julio 2026
- Sin costo, solo hay que inscribirse y cumplir UX guidelines

Vale la pena inscribirse desde el día 1.

---

## Timeline Estimado

| Semana | Actividad |
|--------|-----------|
| 1 | Crear cuentas (Play Console), setup Capacitor, primer build Android |
| 2 | Integrar monetización (rewarded ads o preparar Play Pass), crear assets |
| 2-3 | Internal testing, iterar bugs mobile |
| 3-5 | Closed testing (20 testers × 14 días obligatorios) |
| 5-6 | Publicación producción + aplicar Play Pass + Level Up |
| 7+ | Medir métricas, iterar, considerar iOS |

---

## Próximos Pasos Inmediatos

1. **Crear cuenta Google Play Console** ($25)
2. **Decidir Bundle ID** (ej: `com.tellmewow.stellarswarm`)
3. **Iniciar Capacitor setup** (yo puedo hacerlo contigo aquí)
4. **Crear icono y assets** del store
5. **Escribir privacy policy** básica

¿Empezamos?
