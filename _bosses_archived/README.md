# Boss System - Archivado

Este directorio contiene el sistema de bosses que fue implementado y luego desactivado.
El código de bosses debe extraerse de `index.html` y guardarse aquí como `boss_system.js` para posible reintegración futura.

## Contenido

- `BOSS_SYSTEM_DESIGN.md` - Documento de diseño completo del sistema de 5 jefes
- `boss_system.js` - (PENDIENTE) Código extraído del sistema de bosses

## Razón del archivado

El sistema de bosses como puerta de desbloqueo de armas presentaba estos problemas:
1. Limitaba la variedad en las primeras partidas (solo láser hasta nivel 8)
2. Cada arma nueva requería diseñar un boss adicional
3. Después de derrotar todos los bosses, la progresión quedaba sin dirección
4. Los bosses que terminan runs pueden ser frustrantes en un juego tipo survivors

## Posible reintegración

Si se decide reintroducir los bosses, considerar:
- Como eventos opcionales (bonus de rewards, no gates)
- Como "modo desafío" separado
- Como eventos cada X minutos con recompensas de moneda permanente
- Sin bloquear contenido detrás de ellos
