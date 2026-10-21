# Lista de evidencias de evaluación

Este documento registra las evidencias del proyecto **IT Incident Hub**, desarrollado como proyecto integrador de DevOps. Su finalidad es facilitar la verificación de los requisitos funcionales, técnicos y de gestión establecidos para la entrega.

Las capturas de pantalla almacenadas en `docs/evidencias/` complementan la información disponible en GitHub y Azure DevOps. La trazabilidad principal se conserva mediante Work Items, ramas, commits, Pull Requests, ejecuciones de pipelines y versiones publicadas.

## Azure Boards

- [x] Proyecto de Azure DevOps creado y disponible.
- [x] Backlog con 2 Epics, 4 Features, 8 User Stories y 17 Tasks.
- [x] Organización jerárquica del trabajo mediante Epics, Features, User Stories y Tasks.
- [x] Work Item AB#33 vinculado a los cambios incorporados mediante el PR #11.
- [x] Evidencias visuales de Azure Boards almacenadas en `docs/evidencias/01-azure-boards/`.
- [ ] Verificar que todos los Work Items tengan responsable, prioridad, estimación y estado.
- [ ] Confirmar la actualización del tablero durante las tres semanas de trabajo.

**Proyecto:** https://dev.azure.com/hwongg/IT-Incident-Hub

## Git y Pull Requests

- [x] Repositorio principal disponible en GitHub.
- [x] Desarrollo realizado mediante ramas de trabajo y Pull Requests.
- [x] Mínimo de seis Pull Requests superado: 11 Pull Requests integrados.
- [x] Pull Request #11 integrado con tres pruebas unitarias adicionales.
- [x] Trazabilidad de cambios mediante referencias a Work Items, incluyendo AB#33.
- [x] Contribuciones registradas mediante las cuentas utilizadas para el proyecto.
- [x] Evidencias de Pull Requests almacenadas en `docs/evidencias/02-pull-requests/`.
- [ ] Confirmar la configuración de protección de la rama `main`.
- [ ] Verificar que los Pull Requests requeridos conserven descripción, revisión y validaciones comprobables.

**Repositorio:** https://github.com/hwongg/IT-Incident-Hub

**Pull Request #11:** https://github.com/hwongg/IT-Incident-Hub/pull/11

## Integración continua y entrega de artefactos

- [x] Azure Pipelines configurado mediante `azure-pipelines.yml`.
- [x] Pipeline ejecutado satisfactoriamente.
- [x] Ejecución fallida conservada y posterior corrección documentada.
- [x] Agente Windows autohospedado utilizado mediante el pool `Default`.
- [x] Instalación de dependencias mediante `npm ci`.
- [x] Validación de código mediante ESLint.
- [x] Pruebas unitarias automatizadas.
- [x] Pruebas de integración con PostgreSQL en un entorno aislado.
- [x] Revisión de dependencias mediante `npm audit`.
- [x] Empaquetado de la aplicación en `source.zip`.
- [x] Publicación de artefactos mediante `PublishBuildArtifacts@1`.
- [x] GitHub Actions configurado en `.github/workflows/quality.yml`.
- [x] Ejecuciones satisfactorias de GitHub Actions y Azure Pipelines asociadas al PR #11.
- [x] Evidencias almacenadas en `docs/evidencias/03-github-actions/` y `docs/evidencias/04-pipelines/`.
- [ ] Confirmar la descarga del artefacto publicado desde una ejecución exitosa de Azure Pipelines.

## Pruebas y calidad del software

- [x] 16 pruebas unitarias aprobadas.
- [x] 7 pruebas de integración con PostgreSQL aprobadas.
- [x] Total de 23 pruebas automatizadas aprobadas.
- [x] ESLint ejecutado sin errores.
- [x] Pruebas de integración ejecutadas contra la base de datos aislada `incident_hub_test`.
- [x] Separación entre la base de datos principal y el entorno de pruebas.

**Comandos de validación:**

```bash
npm run check
npm run test:integration
npm audit --audit-level=high
```

Las pruebas de integración requieren configurar `TEST_DATABASE_URL` para conectarse a una base de datos de pruebas. No deben ejecutarse contra la base de datos principal de la aplicación.

## Seguridad y dependencias

- [x] Uso de variables de entorno para configurar la conexión con PostgreSQL.
- [x] Variables protegidas utilizadas en Azure Pipelines para las credenciales de integración.
- [x] Exclusión de archivos `.env` mediante las reglas de Git.
- [x] Consultas parametrizadas a PostgreSQL.
- [x] Validación de datos de entrada.
- [x] Cabeceras HTTP de seguridad mediante Helmet.
- [x] Auditoría automatizada de dependencias en Azure Pipelines.
- [x] Auditoría local realizada el 20/10/2026 mediante `npm audit --audit-level=high`.
- [x] Resultado de la auditoría local: `found 0 vulnerabilities`.
- [x] Controles y limitaciones de seguridad documentados en `docs/security.md`.
- [ ] Confirmar que el historial completo de Git no contiene credenciales reales ni tokens expuestos.

**Resultado de referencia:**

```text
npm audit --audit-level=high
found 0 vulnerabilities
```

El resultado corresponde a la ejecución local del 20 de octubre de 2026 y no garantiza que no se descubran vulnerabilidades posteriormente.

## Deuda técnica

- [x] Seis deudas técnicas documentadas en `docs/technical-debt.md`.
- [x] DT-02 resuelta mediante el Pull Request #7.
- [x] DT-03 resuelta mediante el Pull Request #8.
- [x] Mínimo de cinco deudas técnicas identificadas.
- [x] Mínimo de dos deudas técnicas resueltas.
- [x] Documentación de limitaciones y mejoras pendientes.

**Referencias:**

- PR #7: https://github.com/hwongg/IT-Incident-Hub/pull/7
- PR #8: https://github.com/hwongg/IT-Incident-Hub/pull/8

## Versionado y estrategia de lanzamiento

- [x] Versión `v1.0.0` registrada mediante un tag de Git.
- [x] Versión `v1.1.0` registrada mediante un tag de Git.
- [x] Versiones publicadas mediante GitHub Releases.
- [x] Estrategia de lanzamiento documentada en `docs/release-strategy.md`.
- [x] Procedimiento de rollback documentado.
- [x] Evidencias de versiones almacenadas en `docs/evidencias/06-release/`.
- [ ] Verificar durante la demostración los controles de validación y aprobación del lanzamiento.

**Releases:** https://github.com/hwongg/IT-Incident-Hub/releases

## Documentación y organización del repositorio

- [x] `README.md` con descripción del proyecto, arquitectura, ejecución y pruebas.
- [x] `docs/architecture.md` con documentación de arquitectura.
- [x] `docs/branching.md` con estrategia de ramas.
- [x] `docs/security.md` con controles de seguridad y revisión de dependencias.
- [x] `docs/technical-debt.md` con registro de deuda técnica.
- [x] `docs/release-strategy.md` con estrategia de lanzamiento.
- [x] `devops/weekly-deliverables.md` con organización de las entregas.
- [x] Archivo `azure-pipelines.yml` para Azure Pipelines.
- [x] Workflow de GitHub Actions en `.github/workflows/quality.yml`.
- [x] Archivos Docker Compose para la aplicación y el entorno de integración.
- [x] Evidencias visuales organizadas en siete carpetas.
- [x] Un total de 19 capturas de pantalla almacenadas en `docs/evidencias/`.

## Demostración final

Las siguientes actividades deberán realizarse durante la presentación del proyecto:

- [ ] Crear y consultar un incidente.
- [ ] Asignar un técnico responsable.
- [ ] Cambiar el estado de un incidente.
- [ ] Agregar comentarios y consultar su seguimiento.
- [ ] Filtrar incidentes por sus diferentes criterios.
- [ ] Mostrar el dashboard y sus indicadores.
- [ ] Explicar la conexión entre la API REST y PostgreSQL.
- [ ] Mostrar la estructura del backlog en Azure Boards.
- [ ] Mostrar un Work Item vinculado a un commit o Pull Request.
- [ ] Mostrar los Pull Requests y las validaciones realizadas.
- [ ] Mostrar GitHub Actions.
- [ ] Mostrar Azure Pipelines, incluyendo una ejecución fallida y otra exitosa.
- [ ] Mostrar el agente autohospedado.
- [ ] Mostrar el artefacto publicado.
- [ ] Explicar las deudas técnicas resueltas.
- [ ] Mostrar las versiones `v1.0.0` y `v1.1.0`.
- [ ] Explicar la estrategia de release y rollback.

## Referencias principales

| Recurso | Enlace o ubicación |
|---|---|
| Repositorio GitHub | https://github.com/hwongg/IT-Incident-Hub |
| Proyecto Azure DevOps | https://dev.azure.com/hwongg/IT-Incident-Hub |
| Pull Requests | https://github.com/hwongg/IT-Incident-Hub/pulls |
| GitHub Actions | https://github.com/hwongg/IT-Incident-Hub/actions |
| GitHub Releases | https://github.com/hwongg/IT-Incident-Hub/releases |
| Evidencias visuales | `docs/evidencias/` |
| Documentación técnica | `docs/` |
| Pipeline Azure | `azure-pipelines.yml` |
| Pipeline GitHub | `.github/workflows/quality.yml` |

## Estado general de la entrega

IT Incident Hub dispone de una aplicación funcional con persistencia PostgreSQL, pruebas automatizadas, integración continua, trazabilidad mediante Git y Azure Boards, documentación técnica, deuda técnica gestionada y versiones publicadas.

Las actividades pendientes de esta lista corresponden principalmente a verificaciones adicionales y a la demostración final del proyecto. Su cumplimiento deberá confirmarse mediante las evidencias correspondientes, sin sustituir los registros reales del repositorio o de Azure DevOps.