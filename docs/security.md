# Seguridad y revisión de dependencias

## Controles implementados

- Helmet incorpora cabeceras de seguridad HTTP (con la política CSP deshabilitada en esta versión).
- Las operaciones de PostgreSQL utilizan consultas parametrizadas.
- El backend valida campos obligatorios, estados, prioridades y datos de entrada.
- El tamaño de las solicitudes JSON está limitado.
- `.env` está excluido del control de versiones mediante las reglas de Git.
- Azure Pipelines ejecuta `npm audit --audit-level=high` como parte de la integración continua.

## Gestión de secretos

Las credenciales reales, tokens y cadenas de conexión privadas no forman parte del código versionado. Azure Pipelines utiliza variables protegidas para la base de datos de integración. Los archivos `.env` locales no deben incorporarse al repositorio ni a los ZIP de entrega. Las capturas y los registros se revisan para evitar exponer secretos.

## Análisis de dependencias

La revisión automatizada de dependencias forma parte de Azure Pipelines mediante `npm audit --audit-level=high`. Este comando falla cuando se detectan vulnerabilidades de severidad alta o crítica, de acuerdo con las reglas de npm audit.

**Registro de resultados:** el informe numérico detallado (paquetes afectados, severidad y corrección) debe documentarse a partir de la salida real de la ejecución correspondiente. El ZIP revisado no contiene un informe completo de `npm audit`, por lo que no se declara un número de vulnerabilidades sin evidencia.

| Campo de revisión | Evidencia o estado |
|---|---|
| Herramienta | `npm audit` |
| Umbral de CI | `high` |
| Ejecución de referencia | Azure Pipelines `#20261018.9` |
| Paquetes vulnerables y severidad | Pendiente de transcribir desde la salida real de la auditoría |
| Decisión y tratamiento | Documentar por hallazgo o indicar ausencia de hallazgos cuando la salida lo confirme |

Para obtener el resumen local sin incluir credenciales:

```bash
npm audit --audit-level=high
```

Los resultados deben conservar el nombre del paquete, severidad, disponibilidad de corrección y decisión tomada. Un resultado satisfactorio del pipeline confirma el cumplimiento del umbral configurado, **no** la ausencia absoluta de vulnerabilidades de cualquier severidad.

## Limitaciones y riesgos conocidos

La versión académica no implementa autenticación, autorización, HTTPS de producción, migraciones formales ni limitación de solicitudes. Está destinada a un entorno local o controlado. La deuda técnica DT-01 registra la ausencia de control de acceso; el resto de mejoras pendientes está documentado en `technical-debt.md`.
