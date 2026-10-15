# IT Incident Hub

Aplicación web para registrar, asignar y dar seguimiento a incidentes de TI. Proyecto integrador para demostrar un flujo DevOps con Git, Azure Boards, Pull Requests, CI, pruebas, análisis de dependencias, artefactos y versionado.

## Requisitos

- Docker Desktop con Docker Compose.
- Git.
- Node.js 22 o compatible para ejecutar pruebas locales.
- Cuenta de Azure DevOps y cuenta de GitHub para completar las evidencias de la asignatura.

## Ejecutar con Docker

1. Copie `.env.example` como referencia. Para Docker Compose, la contraseña local predeterminada está en `compose.yaml`; cámbiela antes de un uso real.
2. En la raíz del proyecto, ejecute:

   ```bash
   docker compose up --build -d
   ```

3. Abra `http://localhost:3000`.
4. Verifique la API en `http://localhost:3000/api/health`.
5. Ver registros:

   ```bash
   docker compose logs -f app
   ```

6. Detener:

   ```bash
   docker compose down
   ```

Para borrar también la base de datos de desarrollo y sus datos:

```bash
docker compose down -v
```

## Ejecutar pruebas locales

```bash
npm install
npm run lint
npm test
npm audit --audit-level=high
```

La base de datos debe estar disponible para las pruebas de integración manuales; los tests incluidos prueban reglas de validación sin depender de PostgreSQL.

## Funcionalidades

- Crear y consultar incidentes.
- Estados NUEVO, ASIGNADO, EN_PROCESO, RESUELTO y CERRADO.
- Prioridades BAJA, MEDIA, ALTA y CRITICA.
- Asignación de técnico.
- Bitácora y comentarios por incidente.
- Filtros por estado, prioridad, categoría, técnico y texto.
- Dashboard de abiertos, cerrados, críticos y distribución por categoría/técnico.
- API REST con persistencia PostgreSQL y consultas parametrizadas.
- Docker Compose, endpoint de salud, cabeceras de seguridad y validación de entradas.

## API

| Método | Ruta | Propósito |
|---|---|---|
| GET | `/api/health` | Estado de la API y base de datos |
| GET | `/api/meta` | Estados y prioridades permitidos |
| GET | `/api/incidents` | Listar y filtrar |
| POST | `/api/incidents` | Crear incidente |
| GET | `/api/incidents/:id` | Ver detalle y bitácora |
| PATCH | `/api/incidents/:id` | Cambiar estado, técnico o prioridad |
| POST | `/api/incidents/:id/comments` | Agregar comentario |
| GET | `/api/dashboard` | Indicadores |

## Estructura

- `backend/`: API Express.
- `frontend/`: interfaz web.
- `database/`: esquema SQL y datos iniciales.
- `tests/`: pruebas automáticas.
- `devops/`: plantillas de backlog y guía de evidencias.
- `docs/`: arquitectura, ramas, seguridad, deuda técnica y release.
- `.github/workflows/`: GitHub Actions.
- `azure-pipelines.yml`: pipeline de Azure Pipelines.

## Seguridad y limitaciones de la entrega inicial

Este es un proyecto académico de demostración. No incluye autenticación ni autorización de usuarios, y no debe exponerse a Internet tal cual. Antes de un despliegue real, añada autenticación, permisos por rol, gestión de secretos en un vault, TLS, migraciones, copias de seguridad, limitación de solicitudes y pruebas de integración. No use la contraseña predeterminada fuera del entorno local.

## Responsables

Complete aquí los nombres reales de los integrantes y sus responsabilidades. Si el proyecto es individual, use su cuenta principal y las cuentas adicionales solo si las reglas de su curso lo permiten; no simule revisiones que no hayan ocurrido.
