# Cheat Sheet: Comandos para el Cliente Ubuntu

Ejecuta estos comandos en la terminal de tu computadora con Ubuntu para configurar el acceso y desplegar el código en Home Assistant.

### 1. Generar la Clave SSH
Crea una clave segura (ECDSA). Cuando te pregunte por la ruta, presiona `Enter`. Cuando te pida `passphrase` (contraseña), **presiona Enter dos veces** para dejarla vacía (necesario para despliegues automáticos):
```bash
ssh-keygen -t ecdsa -b 521 -C "deploy_sich"
```

### 2. Ver y Copiar tu Clave Pública
Muestra la clave en la terminal para que puedas seleccionarla, copiarla (Ctrl+Shift+C) y pegarla en la configuración del Add-on en Home Assistant:
```bash
cat ~/.ssh/id_ecdsa.pub
```

### 3. Probar la Conexión SSH
Una vez que pegaste la clave en HA e iniciaste el Add-on, prueba conectarte. Reemplaza `IP_DE_HA` por la IP real (ej: `192.168.1.100`). 
*Nota: La primera vez te preguntará si confías en el fingerprint, escribe `yes` y presiona Enter.*
```bash
ssh root@IP_DE_HA
```
*(Si configuraste el puerto 22222 en HA, usa: `ssh -p 22222 root@IP_DE_HA`)*. 
Para salir del servidor de HA y volver a tu PC, escribe `exit`.

---

### 4. Comandos para Desplegar el Backend de S.I.C.H.
Si quieres hacer el despliegue manualmente desde tu Ubuntu (lo que haría Antigravity):

**A. Copiar la carpeta del backend a Home Assistant:**
Asegúrate de estar posicionado en la carpeta raíz del proyecto `SICH` en tu Ubuntu y ejecuta:
```bash
scp -r backend/appdaemon/apps/sich root@IP_DE_HA:/config/appdaemon/apps/
```

**B. Reiniciar AppDaemon para aplicar los cambios:**
```bash
ssh root@IP_DE_HA "ha addons restart a0d7b954_appdaemon"
```
*(Nota: `a0d7b954_appdaemon` es el nombre interno (slug) típico del addon oficial de AppDaemon. Si usas otro, puedes reiniciarlo desde la interfaz web de HA).*
