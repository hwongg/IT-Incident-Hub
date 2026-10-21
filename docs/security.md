# Seguridad y revisión de dependencias

## Controles implementados

El proyecto IT Incident Hub incorpora controles básicos de seguridad para proteger la aplicación, validar la información recibida y reducir los riesgos asociados con el uso de dependencias externas.

Los controles implementados son los siguientes:

- **Cabeceras de seguridad HTTP:** se utiliza Helmet para incorporar cabeceras de protección. La política Content Security Policy (CSP) se encuentra deshabilitada en esta versión.
- **Consultas SQL parametrizadas:** las operaciones con PostgreSQL utilizan consultas parametrizadas para reducir el riesgo de inyección SQL.
- **Validación de datos:** el backend valida campos obligatorios, estados, prioridades y otros datos recibidos mediante la API REST.
- **Límite de solicitudes JSON:** se establece un tamaño máximo para las solicitudes JSON procesadas por el servidor.
- **Protección de archivos de configuración:** el archivo `.env` está excluido del control de versiones mediante las reglas de Git.
- **Auditoría de dependencias:** Azure Pipelines ejecuta `npm audit --audit-level=high` como parte del proceso de integración continua.

## Gestión de secretos

Las credenciales reales, tokens y cadenas de conexión privadas no deben incorporarse al código fuente versionado.

Para reducir el riesgo de exposición de información sensible, el proyecto utiliza las siguientes prácticas:

- Las configuraciones locales se administran mediante variables de entorno.
- Los archivos `.env` se excluyen del repositorio mediante `.gitignore`.
- Azure Pipelines utiliza variables protegidas para las credenciales de la base de datos de integración.
- Las credenciales no deben incluirse directamente en los archivos YAML del pipeline.
- Los archivos `.env` locales no deben incorporarse a los artefactos ZIP de entrega.
- Las capturas de pantalla y los registros deben revisarse para evitar la exposición de contraseñas, tokens o cadenas de conexión privadas.

Estas medidas permiten separar la configuración sensible del código fuente y facilitan la ejecución del proyecto en diferentes entornos.

## Análisis de dependencias

La revisión de dependencias se realiza mediante `npm audit`, herramienta que permite identificar vulnerabilidades conocidas en los paquetes utilizados por la aplicación.

Azure Pipelines incorpora el comando `npm audit --audit-level=high`, que establece un umbral de fallo para vulnerabilidades de severidad alta o crítica.

### Registro de la auditoría

| Campo de revisión | Evidencia o resultado |
|---|---|
| Herramienta utilizada | `npm audit` |
| Umbral configurado en CI | `high` |
| Ejecución de referencia de Azure Pipelines | `#20261018.9` |
| Fecha de verificación local | 20/10/2026 |
| Vulnerabilidades detectadas | 0 |
| Paquetes vulnerables reportados | Ninguno |
| Severidad de los hallazgos | No se reportaron vulnerabilidades |
| Correcciones necesarias | Ninguna según el resultado obtenido |
| Decisión adoptada | Mantener la auditoría automatizada y revisar las dependencias periódicamente |

### Verificación local del 20/10/2026

Se ejecutó el siguiente comando desde la raíz del proyecto:

```bash
npm audit --audit-level=high
```

La herramienta devolvió el siguiente resultado:

```text
found 0 vulnerabilities
```

Este resultado confirma que, durante la ejecución local realizada, la auditoría no reportó vulnerabilidades conocidas en las dependencias analizadas.

Por lo tanto, no fue necesario aplicar correcciones ni actualizar paquetes por motivos de seguridad en esta revisión.

### Tratamiento de vulnerabilidades

Cuando una auditoría detecte vulnerabilidades, se deberá evaluar:

1. El nombre del paquete afectado.
2. La severidad de la vulnerabilidad.
3. La existencia de una versión corregida.
4. El impacto potencial sobre la aplicación.
5. La decisión de actualizar, sustituir o mantener temporalmente la dependencia, documentando el motivo.

Las vulnerabilidades de severidad alta o crítica deberán atenderse antes de aprobar una ejecución del pipeline, debido al umbral configurado.

### Seguimiento continuo

La revisión de dependencias forma parte del proceso de integración continua del proyecto.

Cada ejecución de Azure Pipelines incluye una etapa denominada `Dependency security review`, encargada de ejecutar:

```bash
npm audit --audit-level=high
```

Si se detectan vulnerabilidades que superen el umbral establecido, el comando devuelve un código de error y la ejecución del pipeline se marca como fallida.

El resultado de cero vulnerabilidades corresponde a la revisión local del 20 de octubre de 2026 y no garantiza que no puedan descubrirse nuevos problemas de seguridad posteriormente.

## Limitaciones y riesgos conocidos

IT Incident Hub fue desarrollado como un proyecto académico destinado a ejecutarse en un entorno local o controlado.

Aunque incorpora controles básicos de seguridad, esta versión presenta las siguientes limitaciones:

- **Autenticación:** no implementa un sistema de inicio de sesión para identificar usuarios.
- **Autorización:** no dispone de roles ni permisos para restringir las operaciones según el tipo de usuario.
- **HTTPS de producción:** no incluye una configuración de certificados TLS para un despliegue público.
- **Migraciones de base de datos:** no utiliza un sistema formal de migraciones versionadas.
- **Limitación de solicitudes:** no implementa un mecanismo de rate limiting para restringir solicitudes excesivas.
- **Política CSP:** la Content Security Policy de Helmet permanece deshabilitada en esta versión.

La ausencia de autenticación y autorización se encuentra registrada como deuda técnica **DT-01**.

Las demás mejoras pendientes y las deudas técnicas identificadas se documentan en [`technical-debt.md`](technical-debt.md).

## Conclusión

IT Incident Hub incorpora mecanismos de validación de entradas, consultas SQL parametrizadas, cabeceras de seguridad HTTP, protección de archivos de configuración y auditoría automatizada de dependencias.

La verificación local realizada el 20 de octubre de 2026 mediante `npm audit --audit-level=high` finalizó con **0 vulnerabilidades reportadas**.

El proyecto mantiene documentadas sus limitaciones de seguridad y utiliza Azure Pipelines para revisar las dependencias durante el proceso de integración continua.

Estos controles son adecuados para el alcance académico definido, aunque un despliegue público requeriría implementar medidas adicionales, especialmente autenticación, autorización, HTTPS y limitación de solicitudes.