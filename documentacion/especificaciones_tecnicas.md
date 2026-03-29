# 🛠️ ESPECIFICACIONES TÉCNICAS: S.I.C.H.

### 1. NODO SATÉLITE (FRONTEND)
- **Plataforma:** Raspberry Pi Satélite.
- **Tecnología:** Docker Container (Nginx + React/Vue).
- **Funcionalidades:**
  - Visualización paginada de reglas.
  - Interfaz de test amigable.
  - Dashboard de estado de certificados.
  - Módulo de carga de nuevas reglas (Admin).

### 2. NODO CENTRAL (BACKEND & LOGIC)
- **Plataforma:** Home Assistant (AppDaemon).
- **Tecnología:** Python.
- **Persistencia:**
  - **MariaDB:** Registro legal (Cursos aprobados, Tokens).
  - **InfluxDB:** Métricas de tiempo y rendimiento.
- **Endpoints (AppDaemon):**
  - `GET /api/sich/reglas`: Devuelve lista paginada de reglas.
  - `POST /api/sich/evaluar`: Recibe respuestas, califica y ejecuta acciones en HA.

### 3. ESQUEMA DE BASE DE DATOS (MARIADB)
- `tabla_reglas`: id, titulo, cuerpo, ha_entity.
- `tabla_preguntas`: id, regla_id, enunciado, opciones_json, correcta_index.
- `tabla_certificados`: id, colaboradora, regla_id, fecha, nota.
- `tabla_tokens`: token_id, colaboradora_nombre.
