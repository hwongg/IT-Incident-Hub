# Seguridad

## Controles incluidos

- Helmet añade cabeceras HTTP de seguridad.
- Las consultas a PostgreSQL utilizan parámetros.
- Se valida el contenido obligatorio, los estados y las prioridades.
- Se limita el tamaño del JSON recibido.
- El archivo `.env` está excluido de Git.
- GitHub Actions ejecuta `npm audit --audit-level=high`.

## Secretos

- No guardar contraseñas, tokens ni cadenas de conexión reales en el repositorio.
- En Azure Pipelines usar variables secretas o una conexión de servicio autorizada.
- En GitHub Actions usar GitHub Actions Secrets cuando un job necesite credenciales.
- No imprimir secretos en logs ni capturas.
- Rotar inmediatamente cualquier secreto que se haya publicado.

## Revisión de dependencias

Ejecutar `npm audit --json > docs/npm-audit-evidence.json` solo si se desea guardar un informe; revisar el resultado antes de confirmar el archivo. No incluir tokens ni datos privados.

Registrar cada vulnerabilidad con paquete, versión, severidad, versión corregida disponible, decisión y evidencia de nueva ejecución. Si el comando devuelve un código distinto de cero, no ocultar el fallo: documentar, corregir o justificar formalmente la excepción académica.

## Limitaciones y siguientes pasos

La aplicación no implementa autenticación/autorización ni TLS de producción. No desplegar en una red pública hasta implementar esos controles. En producción usar un gestor de secretos, HTTPS, roles, rate limiting, auditoría, actualizaciones periódicas y copias de seguridad.
