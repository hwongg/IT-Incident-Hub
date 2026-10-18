# Registro de deuda técnica

## 1. Introducción

Este documento registra las deudas técnicas identificadas durante el desarrollo de **IT Incident Hub**, un sistema de gestión de incidentes de TI desarrollado con Node.js, Express, PostgreSQL y Docker.

Su objetivo es identificar riesgos, establecer prioridades, proponer soluciones y documentar las mejoras realizadas mediante Azure Boards, Git, Pull Requests y pipelines de integración continua.

Se identificaron seis deudas técnicas, de las cuales dos fueron resueltas mediante cambios verificables en el código fuente.

## 2. Registro general de deudas técnicas

| ID | Deuda identificada | Riesgo | Prioridad | Estado |
|---|---|---|---|---|
| DT-01 | No existe autenticación ni autorización | Cualquier usuario con acceso puede modificar incidentes | Crítica | Pendiente |
| DT-02 | No había paginación en el listado de incidentes | El rendimiento disminuye cuando aumenta la cantidad de registros | Alta | Resuelta |
| DT-03 | No existían pruebas de integración contra PostgreSQL | Los errores SQL podían pasar inadvertidos | Alta | Resuelta |
| DT-04 | El frontend y backend se despliegan juntos | Menor flexibilidad para escalar y publicar componentes | Media | Pendiente |
| DT-05 | No existen migraciones versionadas del esquema | Los cambios de base de datos son difíciles de reproducir | Alta | Pendiente |
| DT-06 | Las respuestas de error no incluyen identificador de correlación | Dificulta el diagnóstico de errores en producción | Media | Pendiente |

## 3. Descripción de las deudas técnicas

### DT-01 — Ausencia de autenticación y autorización

**Prioridad:** Crítica  
**Estado:** Pendiente

**Descripción:**

El sistema no cuenta con mecanismos de autenticación y autorización que permitan identificar a los usuarios y controlar sus permisos.

**Riesgo:**

Cualquier persona con acceso a la aplicación podría consultar o modificar incidentes sin restricciones basadas en roles.

**Plan de mejora:**

Implementar autenticación, manejo seguro de sesiones y autorización mediante roles de usuario.

### DT-02 — Ausencia de paginación en el listado

**Prioridad:** Alta  
**Estado:** Resuelta

**Descripción:**

Inicialmente, el listado de incidentes no contaba con paginación, lo que podía provocar problemas de rendimiento cuando aumentara el número de registros almacenados.

**Solución implementada:**

Se incorporó paginación mediante parámetros de consulta y límites de resultados para controlar la cantidad de incidentes devueltos por el backend.

La solución permite consultar los registros por páginas y evita recuperar innecesariamente todos los incidentes en una sola solicitud.

**Trazabilidad:**

- **Pull Request:** [PR #7](https://github.com/hwongg/IT-Incident-Hub/pull/7)
- **Validación:** Pruebas automatizadas y verificaciones de calidad.
- **Resultado:** Mejora implementada e integrada en la rama principal.

### DT-03 — Ausencia de pruebas de integración con PostgreSQL

**Prioridad:** Alta  
**Estado:** Resuelta

**Descripción:**

El proyecto contaba con pruebas automatizadas, pero no disponía de pruebas de integración que comprobaran el comportamiento de la aplicación utilizando una instancia real de PostgreSQL.

**Riesgo:**

Los errores relacionados con consultas SQL, conexiones y operaciones de base de datos podían pasar inadvertidos durante el desarrollo.

**Solución implementada:**

Se incorporaron cinco pruebas de integración automatizadas utilizando PostgreSQL 16 y una base de datos de pruebas aislada mediante Docker Compose.

Las pruebas verifican:

1. La conexión con PostgreSQL.
2. El funcionamiento del endpoint de salud.
3. El registro, consulta y actualización de incidentes.
4. La validación de datos inválidos.
5. El funcionamiento de la paginación.

También se integraron estas pruebas en los flujos de integración continua de GitHub Actions y Azure Pipelines.

**Trazabilidad:**

- **Azure Boards:** AB#32 — DT-03: Implementar pruebas de integración con PostgreSQL.
- **Rama:** `test/AB32-integracion-postgresql`
- **Pull Request:** [PR #8](https://github.com/hwongg/IT-Incident-Hub/pull/8)
- **Archivo de pruebas:** `tests/integration.test.js`
- **Configuración de pruebas:** `compose.ci.yaml`
- **Resultado:** Implementada, validada e integrada en la rama principal.

**Evidencias de validación:**

- 13 pruebas unitarias aprobadas.
- 5 pruebas de integración aprobadas.
- GitHub Actions ejecutado satisfactoriamente.
- Azure Pipelines `#20261018.2`, intento 2, ejecutado satisfactoriamente.
- Limpieza automatizada de los recursos de PostgreSQL utilizados durante las pruebas.

### DT-04 — Despliegue conjunto de frontend y backend

**Prioridad:** Media  
**Estado:** Pendiente

**Descripción:**

El frontend y el backend se distribuyen conjuntamente, lo que reduce la independencia de sus procesos de publicación.

**Riesgo:**

Puede dificultar el escalado independiente y aumentar el trabajo necesario para desplegar cambios específicos de un componente.

**Plan de mejora:**

Evaluar la separación de frontend y backend en servicios o artefactos independientes, según las necesidades futuras del sistema.

### DT-05 — Ausencia de migraciones versionadas

**Prioridad:** Alta  
**Estado:** Pendiente

**Descripción:**

La estructura de PostgreSQL se administra mediante scripts SQL, sin un sistema formal de migraciones versionadas.

**Riesgo:**

Las modificaciones del esquema pueden resultar difíciles de aplicar, reproducir y mantener entre diferentes entornos.

**Plan de mejora:**

Incorporar una herramienta de migraciones que permita controlar y ejecutar cambios incrementales en la base de datos.

### DT-06 — Ausencia de identificadores de correlación

**Prioridad:** Media  
**Estado:** Pendiente

**Descripción:**

Las respuestas de error no incorporan identificadores de correlación que permitan relacionar una solicitud HTTP con los registros generados durante su procesamiento.

**Riesgo:**

El diagnóstico de incidentes puede ser más complejo, especialmente cuando existen múltiples solicitudes simultáneas.

**Plan de mejora:**

Implementar identificadores únicos por solicitud y un sistema de logging estructurado para facilitar la trazabilidad de errores.

## 4. Resolución trazable de deudas técnicas

Se resolvieron dos deudas técnicas mediante cambios verificables, siguiendo el flujo de trabajo de Azure Boards, ramas Git, Pull Requests y validaciones automatizadas.

| Deuda resuelta | Work Item | Rama | Pull Request | Evidencia |
|---|---|---|---|---|
| DT-02 — Paginación de incidentes | Referencia del PR #7 | Rama de implementación del PR #7 | [PR #7](https://github.com/hwongg/IT-Incident-Hub/pull/7) | Pruebas de paginación y controles de calidad |
| DT-03 — Pruebas de integración PostgreSQL | AB#32 | `test/AB32-integracion-postgresql` | [PR #8](https://github.com/hwongg/IT-Incident-Hub/pull/8) | 5 pruebas de integración, GitHub Actions y Azure Pipelines aprobados |

## 5. Validación mediante integración continua

El proyecto utiliza dos plataformas para verificar automáticamente la calidad del código.

### GitHub Actions

El flujo de trabajo comprueba la instalación de dependencias, la calidad del código y la ejecución de las pruebas automatizadas.

Para la resolución de DT-03, se agregó un servicio PostgreSQL 16 y se incorporó la ejecución de las pruebas de integración.

**Resultado:** Validación satisfactoria del Pull Request #8.

### Azure Pipelines

El pipeline utiliza un agente Windows autohospedado y Docker Desktop para preparar una base de datos PostgreSQL de pruebas.

Durante su ejecución realiza la instalación de dependencias, análisis de código, pruebas unitarias, preparación de PostgreSQL, pruebas de integración, verificaciones adicionales y publicación de artefactos.

La base de datos de integración utiliza una configuración Docker Compose aislada para evitar modificaciones en la base de datos principal del proyecto.

**Resultado:** Ejecución `#20261018.2`, intento 2, satisfactoria.

## 6. Resumen de resultados

| Indicador | Resultado |
|---|---|
| Deudas técnicas identificadas | 6 |
| Deudas técnicas resueltas | 2 |
| Deudas técnicas pendientes | 4 |
| Pull Requests de resolución | #7 y #8 |
| Pruebas unitarias aprobadas | 13 |
| Pruebas de integración aprobadas | 5 |
| Integración continua | GitHub Actions y Azure Pipelines |

## 7. Conclusión

La gestión de deuda técnica permitió identificar limitaciones del sistema y aplicar mejoras verificables en su implementación.

La resolución de **DT-02** mejoró el manejo de grandes cantidades de incidentes mediante paginación, mientras que la resolución de **DT-03** fortaleció la confiabilidad del proyecto al incorporar pruebas automatizadas con PostgreSQL real.

Ambas mejoras fueron desarrolladas mediante Pull Requests y verificaciones de integración continua, proporcionando evidencia del proceso de mejora y mantenimiento del software.

Las cuatro deudas restantes quedan documentadas como oportunidades de mejora para futuras versiones de IT Incident Hub.