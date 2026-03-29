# Guía Paso a Paso: Activar Acceso SSH en Home Assistant

Esta guía te explicará cómo habilitar el acceso remoto seguro vía SSH a tu instancia de Home Assistant. Esto es esencial para poder desplegar el backend de S.I.C.H. utilizando herramientas automatizadas (como Antigravity) o mediante comandos desde tu computadora.

## Fase 1: Habilitar el Modo Avanzado en Home Assistant

El Add-on de Terminal & SSH está oculto por defecto para proteger a usuarios principiantes.

1. Abre tu interfaz web de Home Assistant en el navegador.
2. En la barra lateral izquierda, haz clic en tu **Nombre de Usuario (Perfil)** (generalmente abajo del todo).
3. Desplázate hacia abajo hasta encontrar la opción **Modo Avanzado (Advanced Mode)**.
4. **Activa** el interruptor.

## Fase 2: Instalar el Add-on de Terminal & SSH

1. Ve a **Ajustes (Settings)** en el menú lateral.
2. Selecciona **Complementos (Add-ons)** (o "Apps" dependiendo de tu versión).
3. Haz clic en el botón azul de la esquina inferior derecha **"Añadir Complemento" (Add-on Store)**.
4. En el buscador, escribe **"Terminal & SSH"**.
5. Haz clic en el complemento oficial (suele tener el logo de Home Assistant) y presiona **Instalar (Install)**.
6. Espera a que termine la instalación. **Todavía NO le des a Iniciar**.

## Fase 3: Configurar la Autenticación Segura (Recomendado: Claves SSH)

Para conectar herramientas de despliegue automatizado, usar usuario/contraseña es inseguro y propenso a errores. Usaremos **Claves SSH públicas/privadas**.

### 3.1: Generar una Clave SSH en tu PC (Si no tienes una)
*Abre la terminal de tu computadora (Linux/Mac) o PowerShell (Windows).*

Ejecuta este comando para generar una clave moderna y segura (ECDSA):
```bash
ssh-keygen -t ecdsa -b 521 -C "deploy_sich"
```
* Presiona `Enter` para guardar la clave en la ruta por defecto (`~/.ssh/id_ecdsa`).
* **Importante:** Deja la contraseña (passphrase) en blanco (presiona Enter dos veces) si quieres que el despliegue automático (Antigravity) funcione sin intervención humana.

### 3.2: Obtener tu Clave Pública
En tu terminal, muestra el contenido de la clave **pública**:
```bash
cat ~/.ssh/id_ecdsa.pub
```
Copia **todo** el texto que aparece (empezará con `ecdsa-sha2-nistp521...`).

### 3.3: Configurar el Add-on en Home Assistant
1. Vuelve a la pantalla del Add-on "Terminal & SSH" en Home Assistant.
2. Ve a la pestaña **Configuración (Configuration)**.
3. En la sección `authorized_keys`, pega la clave que acabas de copiar. Asegúrate de ponerla entre comillas dobles si marca error de formato. Debería verse así:
   ```yaml
   authorized_keys:
     - "ecdsa-sha2-nistp521 AAAA...tu_clave_super_larga... deploy_sich"
   password: ''
   apks: []
   server:
     tcp_forwarding: false
   ```
4. Haz clic en **Guardar (Save)**.

## Fase 4: Configurar el Puerto de Red

Por defecto, el acceso desde fuera de la interfaz web de HA está apagado.

1. En la misma pestaña de **Configuración (Configuration)** del Add-on, baja hasta la sección **Red (Network)**.
2. Verás un campo que dice "SSH server port".
3. Escribe el número **22** (el puerto estándar de SSH). Si ese puerto está ocupado, puedes usar el **22222**.
4. Haz clic en **Guardar (Save)** en esa sección.

## Fase 5: Iniciar y Probar

1. Ve a la pestaña **Información (Info)** del Add-on.
2. Activa las opciones: **"Iniciar en el arranque"** y **"Mostrar en la barra lateral"** (opcional, útil para la Terminal Web).
3. Haz clic en **Iniciar (Start)**.
4. Revisa la pestaña de **Registro (Log)** para asegurarte de que no hay errores y que el servidor SSH está escuchando.

### Prueba Final desde tu Computadora:
Abre tu terminal y ejecuta:
```bash
# Cambia 'IP_DE_HOME_ASSISTANT' por la IP real, ej: 192.168.1.100
ssh root@IP_DE_HOME_ASSISTANT
```
Si configuraste el puerto 22222, el comando es:
```bash
ssh -p 22222 root@IP_DE_HOME_ASSISTANT
```

Si todo salió bien, **entrarás directamente a la terminal de Home Assistant sin que te pida contraseña**, y estarás posicionado en la carpeta base donde vive la carpeta `/config`.

¡Ahora Antigravity (o tú mismo) puede ejecutar el plan de despliegue conectándose con esta misma clave SSH!
