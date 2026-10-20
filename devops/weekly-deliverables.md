# Plan de trabajo y entregables — IT Incident Hub

## Organización del proyecto

El proyecto **IT Incident Hub** se desarrolla y entrega mediante un único repositorio GitHub, conservando el historial de commits, ramas, Pull Requests y evidencias de integración continua.

**Repositorio:** https://github.com/hwongg/IT-Incident-Hub

**Azure DevOps:** https://dev.azure.com/hwongg/IT-Incident-Hub

## Semana 1 — Planificación y desarrollo

Actividades:

- Organización del proyecto en Azure Boards.
- Creación de Epics, Features, User Stories y Tasks.
- Implementación de la aplicación Node.js y Express.
- Integración de PostgreSQL y Docker Compose.
- Desarrollo de funcionalidades para gestionar incidentes.
- Uso de ramas Git y Pull Requests.

Evidencias:

- Backlog y jerarquía de Work Items.
- Commits y Pull Requests.
- Código fuente y estructura de base de datos.

## Semana 2 — Integración continua, calidad y seguridad

Actividades:

- Configuración de GitHub Actions.
- Implementación de Azure Pipelines.
- Configuración de un agente autohospedado en Windows.
- Ejecución de ESLint y pruebas automatizadas.
- Revisión de dependencias.
- Generación y publicación de artefactos.
- Ejecución fallida controlada y posterior corrección.

Evidencias:

- Pipeline fallido y diagnóstico.
- Pipeline corregido y aprobado.
- Agente autohospedado.
- Resultados de pruebas.
- Artefacto publicado.

## Semana 3 — Deuda técnica, estabilización y release

Actividades:

- Identificación y documentación de seis deudas técnicas.
- Resolución de DT-02 mediante PR #7.
- Resolución de DT-03 mediante PR #8.
- Incorporación de pruebas de integración PostgreSQL.
- Actualización de documentación técnica.
- Preparación de la versión SemVer `v1.0.0`.
- Demostración funcional del sistema.

Evidencias:

- Registro `docs/technical-debt.md`.
- Pull Requests #7 y #8.
- GitHub Actions aprobado.
- Azure Pipelines `#20261018.2`, intento 2, aprobado.
- 13 pruebas unitarias y 7 pruebas de integración aprobadas en la versión v1.1.0.
- Tags y releases `v1.0.0` y `v1.1.0` publicados.
- Evidencias de demostración funcional.

## Entrega final

La entrega final se realiza mediante un único repositorio, conforme a la indicación del docente. Este repositorio que contendrá el código fuente, documentación, configuración de Docker, pipelines, historial de desarrollo y referencias a Azure Boards.

Las evidencias deberán corresponder a ejecuciones, cambios y revisiones reales. No se crearán commits, aprobaciones o Pull Requests ficticios para completar los requisitos.

## Actualización final v1.1.0

El [PR #9](https://github.com/hwongg/IT-Incident-Hub/pull/9) incorporó el dashboard renovado, el CRUD completo y las pruebas adicionales. Las validaciones de GitHub Actions y Azure Pipelines fueron exitosas y se publicó la release `v1.1.0`. Las evidencias están organizadas en `docs/evidencias/`.
