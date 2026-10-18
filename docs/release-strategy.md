# Estrategia de release

## Versionado semántico

Usar `MAJOR.MINOR.PATCH`:

- `0.1.0`: primera versión de desarrollo.
- `0.2.0`: funcionalidad compatible añadida.
- `0.3.0`: automatización y controles de calidad incorporados.
- `1.0.0`: alcance acordado completado, pruebas y documentación revisadas.

No etiquetar `v1.0.0` hasta que el producto esté probado y los controles exigidos estén demostrados.

## Ambientes

1. Desarrollo: ejecución local con Docker Compose.
2. Validación: artefacto de pipeline, pruebas y revisión del equipo.
3. Producción/demo: publicación aprobada después de validar la versión candidata.

## Puertas de aprobación

- Pull Request revisado.
- Lint y pruebas exitosos.
- Revisión de dependencias documentada.
- Artefacto publicado.
- Variables secretas fuera del repositorio.
- Aprobación manual del responsable antes de liberar.

## Procedimiento de release

1. Cerrar los Work Items comprometidos para la versión.
2. Verificar pipeline exitoso en `main`.
3. Revisar changelog, pruebas y deuda conocida.
4. Crear tag `v1.0.0` desde el commit aprobado.
5. Asociar notas de versión y artefacto.
6. Ejecutar smoke test en ambiente de demostración.
7. Documentar resultado y procedimiento de rollback.

## Rollback

Volver a desplegar el artefacto de la última versión aprobada. Si hubo cambios de esquema, aplicar un plan de reversión de base de datos previamente probado; no borrar el volumen de datos para simular un rollback.
