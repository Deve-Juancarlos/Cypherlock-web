# PRODUCT — CYPHERLOCK Admin

## Qué es
Panel web interno de CYPHERLOCK (control de acceso para casas: puertas con ESP32-CAM,
tarjetas RFID, códigos OTP/QR de visita y reconocimiento facial). Lo usa **solo el
personal ADMIN** de la empresa.

## Quién y dónde
Administradores de la empresa, en escritorio (oficina, a menudo con poca luz o en
turnos largos) y ocasionalmente en el celular para revisar alertas. Necesitan
confiar en la herramienta al instante: nada decorativo que distraiga.

## Qué deben lograr (en segundos)
- Ver si hubo intrusiones o alertas en las últimas 24 h.
- Seguir la actividad de las puertas en vivo.
- Dar de alta domicilios y registrar el dispositivo de su puerta (credenciales una vez).
- Gestionar cuentas (roles, activar/desactivar, promover a ADMIN con re-contraseña).
- Asignar y cerrar solicitudes de instalación respetando su máquina de estados.

## Superficie y modo
Aplicación de producto → **Operate**. Densidad y consistencia antes que expresión.

## Marca
Emblema: escudo con "B" y candado, trazas de circuito cian sobre metal oscuro.
Neutros grafito (sin tinte azul) + el cian de `AppColors` (Flutter) solo para accion, foco y seleccion;
semánticos red/green/amber/blue. Tema oscuro por el entorno de uso, no por categoría.
Tipografía: IBM Plex Sans (interfaz), IBM Plex Mono para datos (UIDs, códigos, horas, cifras). Superficies planas con borde fino, sin sombras, halos ni degradados.

## Restricciones
- Nunca mostrar secretos más de una vez; nunca incluirlos en el bundle.
- Español (es-PE).
- Accesible: contraste AA, foco visible, `prefers-reduced-motion`.
