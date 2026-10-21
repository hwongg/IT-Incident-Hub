# IT Incident Hub

Sistema web para la gestión y el seguimiento de incidentes de tecnologías de la información. Centraliza el registro, la asignación, la atención y la consulta de incidentes, con comentarios, historial de cambios e indicadores operativos.

El proyecto integrador demuestra un proceso DevOps trazable mediante Azure Boards, Git, Pull Requests, GitHub Actions, Azure Pipelines, pruebas automatizadas, revisión de dependencias, artefactos y GitHub Releases.

**Última versión publicada:** [`v1.1.0`](https://github.com/hwongg/IT-Incident-Hub/releases/tag/v1.1.0)
**Repositorio:** https://github.com/hwongg/IT-Incident-Hub
**Azure DevOps:** https://dev.azure.com/hwongg/IT-Incident-Hub

## Tecnologías y arquitectura

| Componente | Tecnología |
|---|---|
| Interfaz | HTML, CSS y JavaScript |
| API REST | Node.js 22 y Express |
| Base de datos | PostgreSQL 16 |
| Contenedores | Docker y Docker Compose |
| Calidad | ESLint, Node.js Test Runner, npm audit |
| DevOps | Azure Boards, Azure Pipelines y GitHub Actions |
| Versionado | Git, GitHub, Semantic Versioning |

```text
Usuario → Navegador / Frontend → API REST (Express) → PostgreSQL
                                     │
                                     └→ Consultas SQL parametrizadas
```

La interfaz y la API se distribuyen en un contenedor de aplicación; PostgreSQL funciona en otro contenedor con almacenamiento persistente. El esquema relacional y los datos iniciales están definidos en [`database/init.sql`](database/init.sql). La arquitectura se describe con más detalle en [`docs/architecture.md`](docs/architecture.md).

## Funcionalidades

- Registro de incidentes con título, descripción, categoría, prioridad, persona que reporta y técnico opcional.
- Consulta, edición de los campos principales y eliminación con confirmación.
- Estados `NUEVO`, `ASIGNADO`, `EN_PROCESO`, `RESUELTO` y `CERRADO`.
- Prioridades `BAJA`, `MEDIA`, `ALTA` y `CRITICA`.
- Comentarios e historial de modificaciones por incidente.
- Filtros por estado, prioridad, categoría, técnico y texto, con paginación.
- Dashboard con totales, incidentes abiertos, cerrados y críticos, y distribución por categoría y técnico.
- API REST con validación de entradas y persistencia PostgreSQL.

## API REST

| Método | Ruta | Función |
|---|---|---|
| GET | `/api/health` | Verificación de la API y PostgreSQL |
| GET | `/api/meta` | Estados y prioridades |
| GET | `/api/incidents` | Listado, filtros y paginación (`limit`, `offset`) |
| POST | `/api/incidents` | Registro de incidentes |
| GET | `/api/incidents/:id` | Detalle y comentarios |
| PATCH | `/api/incidents/:id` | Edición de incidentes |
| DELETE | `/api/incidents/:id` | Eliminación de incidentes |
| POST | `/api/incidents/:id/comments` | Publicación de comentarios |
| GET | `/api/dashboard` | Indicadores y distribuciones |

## Requisitos y ejecución local

Docker Desktop con Docker Compose permite ejecutar la aplicación y la base de datos. Git se utiliza para obtener el código; Node.js 22 permite ejecutar las pruebas desde el equipo anfitrión.

```bash
# Iniciar aplicación y PostgreSQL
docker compose up -d --build

# Consultar el estado de los servicios
docker compose ps

# Consultar registros
docker compose logs -f app

# Detener sin eliminar los datos persistentes
docker compose down
```

**Interfaz:** http://localhost:3000
**Salud de la API:** http://localhost:3000/api/health

El volumen de PostgreSQL conserva los registros entre reinicios. Las variables de entorno se describen en `.env.example`; las credenciales predeterminadas de desarrollo no son apropiadas para despliegues públicos.

## Pruebas y validaciones

La versión v1.1.0 incorporó 13 pruebas unitarias y 7 pruebas de integración con PostgreSQL. Posteriormente, el Pull Request #11 agregó tres pruebas unitarias adicionales. El estado actual de main cuenta con 16 pruebas unitarias y 7 pruebas de integración, todas aprobadas.

```bash
npm ci
npm run check
npm run test:integration
npm audit --audit-level=high
```

`npm run check` ejecuta ESLint y las pruebas unitarias. Las pruebas de integración requieren una base de datos **aislada** llamada `incident_hub_test`; Azure Pipelines la prepara mediante `compose.ci.yaml` y variables protegidas. No se ejecutan contra la base de datos principal `incident_hub`.

## Proceso DevOps

El trabajo se planificó en Azure Boards y se desarrolló mediante ramas y Pull Requests vinculados con los Work Items. Las validaciones de GitHub Actions y Azure Pipelines comprueban la calidad antes de integrar cambios en `main`.

Azure Pipelines utiliza un agente Windows autohospedado. El flujo incluye instalación de dependencias, ESLint, pruebas unitarias, preparación de PostgreSQL de pruebas, pruebas de integración, auditoría de dependencias, empaquetado y publicación de un artefacto. El historial incluye un fallo controlado, su corrección y una ejecución posterior exitosa.

Se identificaron **6 deudas técnicas** y se resolvieron **2**, documentadas en [`docs/technical-debt.md`](docs/technical-debt.md). La estrategia de aprobación, versionado y recuperación está en [`docs/release-strategy.md`](docs/release-strategy.md).

## Versiones publicadas

| Versión | Alcance |
|---|---|
| [`v1.0.0`](https://github.com/hwongg/IT-Incident-Hub/releases/tag/v1.0.0) | Primera versión funcional |
| [`v1.1.0`](https://github.com/hwongg/IT-Incident-Hub/releases/tag/v1.1.0) | Dashboard renovado, CRUD completo y mejoras de seguimiento |

La versión `v1.1.0` incorporó los cambios del [Pull Request #9](https://github.com/hwongg/IT-Incident-Hub/pull/9), con validaciones exitosas de GitHub Actions y Azure Pipelines.

## Estructura del repositorio

```text
IT-Incident-Hub/
├── backend/src/              # API Express
├── frontend/                 # Interfaz web
├── database/init.sql         # Modelo relacional y datos iniciales
├── tests/                    # Pruebas unitarias y de integración
├── devops/                   # Planificación y guías DevOps
├── docs/
│   ├── architecture.md
│   ├── branching.md
│   ├── security.md
│   ├── technical-debt.md
│   ├── release-strategy.md
│   └── evidencias/
│       ├── 01-azure-boards/
│       ├── 02-pull-requests/
│       ├── 03-github-actions/
│       ├── 04-pipelines/
│       ├── 05-docker/
│       ├── 06-release/
│       └── 07-aplicacion/
├── .github/workflows/        # GitHub Actions
├── azure-pipelines.yml       # Pipeline de Azure DevOps
├── compose.yaml              # Ejecución local
├── compose.ci.yaml           # PostgreSQL aislado para CI
├── Dockerfile
└── README.md
```

Las capturas de planificación, PR, CI, contenedores, releases y aplicación están organizadas en [`docs/evidencias/`](docs/evidencias/). Las evidencias complementan el historial verificable de GitHub y Azure DevOps.

## Seguridad y alcance

La aplicación incorpora validación de entradas, consultas parametrizadas y cabeceras de seguridad mediante Helmet. **No incluye autenticación ni autorización de usuarios** y está destinada a una demostración académica en un entorno controlado. Un despliegue público requeriría gestión de identidades y permisos, HTTPS, protección de secretos, limitación de solicitudes, copias de seguridad y migraciones de base de datos.

Los controles y las decisiones pendientes se documentan en [`docs/security.md`](docs/security.md).

## Autoría y contribuciones

Proyecto académico IT Incident Hub. La autoría y las contribuciones pueden verificarse mediante el historial de commits, los Pull Requests y los Work Items vinculados en GitHub y Azure DevOps.
