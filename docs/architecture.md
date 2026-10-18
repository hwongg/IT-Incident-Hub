# Arquitectura

## Componentes

- Frontend: HTML, CSS y JavaScript servidos por Express.
- Backend: Node.js y Express exponen la API REST.
- Persistencia: PostgreSQL almacena incidentes y comentarios.
- Contenedores: Docker empaqueta la aplicación y Docker Compose coordina aplicación y base de datos.
- Calidad: Node test runner, ESLint, npm audit, GitHub Actions y Azure Pipelines.

## Flujo

1. El usuario interactúa con el frontend.
2. El frontend consume `/api/*`.
3. Express valida los datos y ejecuta consultas parametrizadas con `pg`.
4. PostgreSQL guarda incidentes y comentarios.
5. La API devuelve JSON y el frontend actualiza la vista.

## Entidades principales

`incidents`: título, descripción, categoría, prioridad, reportante, técnico, estado y fechas.

`incident_comments`: incidente relacionado, autor, comentario y fecha.

## Decisiones

- Se usa SQL parametrizado para reducir el riesgo de inyección SQL.
- Los estados y prioridades se validan en la API y en restricciones de la base de datos.
- Se utiliza Compose para que la base de datos esté saludable antes de iniciar la aplicación.
- El pipeline publica un artefacto comprimido del código y archivos de despliegue.

## Limitación conocida

La versión inicial no implementa login ni roles. La API está pensada para demostración local y requiere controles de identidad/autorización antes de uso real.
