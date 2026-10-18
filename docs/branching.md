# Estrategia Git y Pull Requests

## Ramas

- `main`: rama estable; protegerla en la configuración del repositorio.
- `feature/AB#ID-descripcion`: nuevas funciones vinculadas a Azure Boards.
- `fix/AB#ID-descripcion`: correcciones.
- `refactor/AB#ID-descripcion`: mejoras internas sin cambiar el comportamiento esperado.

## Flujo por cambio

1. Crear o seleccionar un Work Item en Azure Boards.
2. Crear rama a partir de `main`.
3. Implementar un cambio pequeño.
4. Ejecutar `npm run lint` y `npm test`.
5. Hacer commit con referencia, por ejemplo `AB#123 Agrega filtro por prioridad`.
6. Abrir Pull Request hacia `main` con contexto, Work Item vinculado, pruebas y riesgos.
7. Solicitar revisión real, atender comentarios y registrar evidencia.
8. Completar el PR después de validar los checks.
9. Confirmar que el pipeline de `main` terminó correctamente.

## Plantilla de Pull Request

### Objetivo
¿Qué necesidad resuelve este cambio?

### Work Item
AB#ID

### Cambios
- ...

### Validación
- [ ] `npm run lint`
- [ ] `npm test`
- [ ] Validación manual cuando aplique

### Riesgos
¿Qué podría fallar y cómo se revierte?

No cuente PR de prueba vacíos como evidencia. Se requieren al menos seis PR reales con revisión y validación.
