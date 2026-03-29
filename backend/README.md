# SICH Backend (Nodo Central)

Este componente gestiona la lógica de negocio, evaluación de normativas e integración con Home Assistant mediante **AppDaemon**.

## Estructura
- `appdaemon/apps/sich/`: Lógica de la aplicación y configuración.
- `requirements.txt`: Librerías de Python necesarias.
- `init_db.sql`: Script de MariaDB para inicializar las tablas y datos.

## Guía de Despliegue (Deploy)

Dado que este Nodo Central requiere AppDaemon (usualmente ejecutándose como un Add-on en Home Assistant o un contenedor Docker), aquí están los pasos generales para su despliegue.

### 1. Base de Datos (MariaDB)
1. Conéctate a tu instancia de MariaDB (puede ser un Add-on de Home Assistant o un servicio independiente).
2. Ejecuta el script `init_db.sql` incluido en esta carpeta:
   ```bash
   mysql -u tu_usuario -p < init_db.sql
   ```
3. Opcionalmente, crea un usuario específico para AppDaemon con permisos solo sobre la base de datos `sich_db`.

### 2. Configurar AppDaemon
1. **Instalación de Dependencias**:
   Asegúrate de que AppDaemon tenga instalada la librería `mysql-connector-python`.
   - **Si usas el Add-on de Home Assistant**: Ve a la configuración del Add-on, busca la sección `python_packages` y agrega `mysql-connector-python`.
   - **Si usas Docker**: Puedes crear un `Dockerfile` propio basado en la imagen oficial, o añadir la librería al iniciar el contenedor.

2. **Copiar Archivos**:
   Copia el contenido de la carpeta `appdaemon/apps/sich` (los archivos `sich.py` y `apps.yaml`) directamente a la carpeta de configuración de tu servidor AppDaemon, dentro de `/config/appdaemon/apps/`.

3. **Ajustar Credenciales (apps.yaml)**:
   Edita el archivo `apps.yaml` en tu servidor de AppDaemon para reflejar la conexión real a MariaDB:
   ```yaml
   sich:
     module: sich
     class: SICHManager
     db_config:
       host: "DIRECCION_IP_DE_MARIADB" # Ej: "core-mariadb" si es Add-on
       user: "sich_user"
       password: "SUPER_SECRET_PASSWORD"
       database: "sich_db"
   ```

### 3. Reiniciar y Verificar
1. Reinicia el servicio de AppDaemon.
2. Revisa los logs de AppDaemon (generalmente en la interfaz de Home Assistant o en `/config/appdaemon/appdaemon.log`).
3. Deberías ver los mensajes:
   - `S.I.C.H. Backend Inicializado`
   - `Endpoints SICH registrados correctamente`

### 4. Pruebas de Endpoints HTTP de AppDaemon
AppDaemon expone sus endpoints en el puerto que hayas configurado (usualmente 5050).
Puedes probar los endpoints del backend usando CURL o Postman:
```bash
# Probar GET Reglas
curl -X GET http://<IP_APPDAEMON>:5050/api/appdaemon/sich/reglas

# Probar POST Evaluar
curl -X POST http://<IP_APPDAEMON>:5050/api/appdaemon/sich/evaluar \
     -H "Content-Type: application/json" \
     -d '{"token_id": "tkn-martina-1234", "regla_id": "MOD-001", "respuestas": {"1": 0, "2": 1, "3": 1, "4": 0, "5": 0}}'
```