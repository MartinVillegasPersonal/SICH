# S.I.C.H. - Sistema Integrado de Cumplimiento Hogareño

![SICH Logo](https://img.shields.io/badge/Status-Active-brightgreen)

SICH es un ecosistema de capacitación, evaluación y autorización automatizada diseñado para gestionar el cumplimiento de normativas en el entorno familiar. El sistema integra un Nodo Central (AppDaemon/MariaDB) con Nodos Satélites (Frontend/Raspberry Pi) para otorgar privilegios basados en el mérito y el conocimiento acreditado.

---

## 🗺️ Mapa de URLs del Sistema

### 🚀 Nodo Satélite (Frontend / Raspberry Pi)
Interfaz principal de interacción para las colaboradoras.
- **Página Principal**: [http://192.168.0.216/](http://192.168.0.216/)
- **Acceso Directo Martina**: [http://192.168.0.216/e/tkn-martina-1234](http://192.168.0.216/e/tkn-martina-1234)
- **Acceso Directo Alfonsina**: [http://192.168.0.216/e/tkn-alfonsina-5678](http://192.168.0.216/e/tkn-alfonsina-5678)

### ⚙️ Nodo Central (Backend / Home Assistant HP)
Lógica de negocio, base de datos y ejecución de acciones en Home Assistant.
- **API Base URL**: `http://192.168.0.200:5050/api/appdaemon/`
- **Check de Salud (Ping)**: [http://192.168.0.200:5050/api/appdaemon/sich_ping](http://192.168.0.200:5050/api/appdaemon/sich_ping)

### 🛠️ Administración y Desarrollo
- **Panel de Control (Admin)**: [http://192.168.0.216/admin](http://192.168.0.216/admin)
- **Entorno de Desarrollo Local**: `http://localhost:5173/` (Vite)

> [!TIP]
> Para entrar al panel `/admin` se requiere el **PIN de seguridad** definido en la configuración del frontend.

---

## 📂 Estructura del Proyecto

Este repositorio es compatible con el ecosistema de Home Assistant:

- **HACS (Backend/AppDaemon)**: Carpeta `apps/sich`.
- **Add-on Store (Frontend)**: Carpeta `sich-frontend/`.
- `/backend` y `/frontend`: Carpetas originales de código fuente y desarrollo.
- `/documentacion`: Normativas, especificaciones técnicas y documentos estratégicos.

---

## 🛠️ Instalación en Home Assistant

### 1. Backend (Lógica) vía HACS
1. Abre **HACS** en Home Assistant.
2. Ve a **Automatizaciones** -> Menú (3 puntos) -> **Repositorios personalizados**.
3. Añade la URL de este repositorio y selecciona la categoría **AppDaemon**.
4. Busca e instala "SICH".
5. Configura tu `apps.yaml` siguiendo la documentación en `/backend`.

### 2. Frontend (Panel) vía Tienda de Complementos
1. Ve a **Ajustes** -> **Complementos** -> **Tienda de complementos**.
2. Menú (3 puntos) -> **Repositorios**.
3. Añade la URL de este repositorio.
4. Busca e instala "SICH Frontend".
5. Inicia el complemento y configuralo (puertos, etc).

## 🚀 Despliegue Rápido

### Backend
1. Ejecutar `backend/init_db.sql` en MariaDB.
2. Configurar `apps.yaml` en AppDaemon.
3. Desplegar `sich.py`.

### Frontend
1. Build: `npm run build` dentro de `/frontend`.
2. Deploy: `python3 deploy.py` (Realiza transferencia SCP y despliegue Docker en el satélite).

---

© 2026 S.I.C.H. Project - Dirección General.
