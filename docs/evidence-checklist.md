# Lista de evidencias de evaluación

Use esta lista como guía. Sustituya cada casilla por la URL o evidencia real. Las capturas complementan el historial; no reemplazan el repositorio ni Azure DevOps.

## Azure Boards

- [ ] URL del proyecto.
- [ ] Mínimo 2 Epics, 4 Features, 8 User Stories y 16 Tasks.
- [ ] Cada Work Item tiene responsable, prioridad, estimación y estado.
- [ ] Enlaces entre Epic, Feature, Story y Task.
- [ ] Tablero actualizado durante las tres semanas.

Importe `devops/azure-boards-backlog.csv` como base y ajuste la jerarquía y campos según el proceso de Azure Boards de su organización.

## Git y PR

- [ ] URL del repositorio semanal.
- [ ] Rama `main` protegida y estable.
- [ ] Ramas feature/fix/refactor con referencia `AB#ID`.
- [ ] Seis PR reales como mínimo, cada uno con descripción, revisión y evidencia de validación.
- [ ] Commits vinculados a Work Items.
- [ ] Revisiones realizadas por una identidad real permitida por el docente; no inventar revisiones.

## CI/CD

- [ ] Ejecución exitosa de Azure Pipeline.
- [ ] Ejecución fallida conservada con log y diagnóstico.
- [ ] Commit de corrección y nueva ejecución exitosa.
- [ ] Agente autohospedado conectado y utilizado.
- [ ] Artefacto publicado y descargable.
- [ ] GitHub Actions ejecutado en PR.
- [ ] Evidencia de lint, pruebas y auditoría de dependencias.

## Seguridad y deuda

- [ ] Secretos configurados como secretos protegidos y nunca en Git.
- [ ] Informe de dependencias con vulnerabilidades, severidad y decisión.
- [ ] Cinco deudas técnicas registradas.
- [ ] Dos deudas resueltas con Work Item, rama, PR y pipeline.

## Versiones y lanzamiento

- [ ] Historial de versiones coherente.
- [ ] Tag `v1.0.0` sobre un commit aprobado.
- [ ] Estrategia de release y rollback documentada.
- [ ] Ambiente de validación y aprobación/validación de release demostrados.

## Demostración final

- [ ] Crear incidente.
- [ ] Asignar técnico y cambiar estado.
- [ ] Agregar comentario y consultar bitácora.
- [ ] Filtrar incidentes.
- [ ] Mostrar dashboard.
- [ ] Mostrar pipeline y artefacto.
- [ ] Mostrar GitHub Actions.
- [ ] Mostrar backlog, PR, deuda técnica y tag final.

## Evidencias verificadas

### Git y Pull Requests

- [x] Repositorio GitHub: https://github.com/hwongg/IT-Incident-Hub
- [x] Mínimo seis Pull Requests realizados: ocho PR fusionados.
- [x] Implementación de mejoras mediante ramas y Pull Requests.

### CI/CD

- [x] Azure Pipelines ejecutado satisfactoriamente.
- [x] Ejecución fallida conservada y posterior corrección.
- [x] Agente autohospedado utilizado.
- [x] Artefacto generado y publicado.
- [x] GitHub Actions ejecutado satisfactoriamente.
- [x] ESLint y pruebas automatizadas aprobadas.

### Deuda técnica

- [x] Seis deudas técnicas documentadas.
- [x] DT-02 resuelta mediante PR #7.
- [x] DT-03 resuelta mediante PR #8.
- [x] Cinco pruebas de integración PostgreSQL aprobadas.
- [x] Trece pruebas unitarias aprobadas.

### Referencias

- GitHub: https://github.com/hwongg/IT-Incident-Hub
- PR #7: https://github.com/hwongg/IT-Incident-Hub/pull/7
- PR #8: https://github.com/hwongg/IT-Incident-Hub/pull/8
- Azure DevOps: https://dev.azure.com/hwongg/IT-Incident-Hub
- Azure Pipelines: ejecución #20261018.2, intento 2.