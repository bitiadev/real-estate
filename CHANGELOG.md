# Changelog

Todos los cambios notables en este proyecto serán documentados en este archivo.

## [2026-04-09 22:20] - Mejoras de UX y Correciones Visuales

### Cambios Realizados:

- **Optimización de la navegación (Scroll Restoration)**: 
    - Se implementó un sistema de restauración de scroll manual para la página `/propiedades`.
    - Se configuró `window.history.scrollRestoration = 'manual'` para evitar conflictos con el comportamiento nativo del navegador.
    - El scroll ahora persiste correctamente tanto al usar el botón "Atrás" del navegador como al usar enlaces internos de "Volver".
    - Se utiliza `sessionStorage` para mantener la posición Y del usuario durante la sesión.

- **Ajuste de la sección Hero**:
    - Se corrigió el posicionamiento del componente `HeroCarousel` de `sticky` a `relative`.
    - Esto soluciona el problema de visibilidad del Hero detrás de otras secciones cuando se utilizan anchos de contenedor reducidos (80%) en escritorio.
    - Se eliminaron offsets de posicionamiento (`top-24`) innecesarios para mejorar el flujo natural del documento.
