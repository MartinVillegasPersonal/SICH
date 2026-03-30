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

- `/backend`: Lógica de AppDaemon y scripts de inicialización de SQL.
- `/frontend`: Aplicación React + Vite para el Nodo Satélite.
- `/documentacion`: Normativas, especificaciones técnicas y documentos estratégicos (Spike).

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
