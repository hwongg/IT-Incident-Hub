# Estrategia de versiones y lanzamiento

## Versionado

IT Incident Hub utiliza Semantic Versioning (`MAJOR.MINOR.PATCH`) y etiquetas Git asociadas a versiones publicadas. El historial incluye la primera versión estable `v1.0.0` y la actualización `v1.1.0`.

| Versión | Resultado |
|---|---|
| `v1.0.0` | Primera entrega funcional y release publicada |
| `v1.1.0` | Dashboard renovado, CRUD completo, siete pruebas de integración y release publicada |

Las releases están disponibles en https://github.com/hwongg/IT-Incident-Hub/releases.

## Ambientes

- **Desarrollo:** aplicación y PostgreSQL mediante Docker Compose local.
- **Validación:** ejecución de lint, pruebas y auditoría de dependencias; PostgreSQL de pruebas aislado y artefacto generado por Azure Pipelines.
- **Demostración:** ejecución local de la versión aprobada y verificación funcional de sus principales operaciones.

No se documenta un despliegue público de producción, ya que el sistema no cuenta con autenticación ni autorización.

## Controles previos a una publicación

La integración de cambios se realiza mediante Pull Requests. Antes de la publicación se revisan los resultados de GitHub Actions y Azure Pipelines, el estado de las pruebas, los artefactos y las limitaciones de seguridad. El responsable de la publicación confirma la versión y publica la GitHub Release.

La versión `v1.1.0` corresponde al [PR #9](https://github.com/hwongg/IT-Incident-Hub/pull/9) y al commit de fusión `bb87c88`. La ejecución `#20261018.9` de Azure Pipelines finalizó correctamente.

## Flujo de entrega

```text
Azure Boards → Rama Git → Commit → Pull Request → Validaciones CI
    → main → Artefacto → Etiqueta SemVer → GitHub Release → Demostración
```

Las ejecuciones fallidas se diagnostican y corrigen mediante cambios trazables; las evidencias están organizadas en `docs/evidencias/`.

## Recuperación y rollback

Ante un problema de aplicación, el procedimiento previsto consiste en volver a desplegar el código o artefacto de la última versión aprobada, conservando los datos persistentes de PostgreSQL. La reversión de cambios de esquema requiere un procedimiento específico de migración; **no** se elimina el volumen de la base de datos como mecanismo de rollback.
