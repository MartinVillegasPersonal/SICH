DOCUMENTO SPIKE: Proyecto S.I.C.H.
Sistema Integrado de Cumplimiento Hogareño
Versión: 1.0 (Marzo 2026)
Propietario: Dirección General (Señor Martín)
Ubicación: Sede Central, Córdoba, Argentina.

1. Visión del Proyecto
Transformar el marco normativo de la convivencia familiar en un ecosistema de Gobierno y Cumplimiento (GRC). El S.I.C.H. busca erradicar la ambigüedad en las reglas de la casa mediante un proceso de capacitación, evaluación y autorización automatizada, preparando a las colaboradoras para la estructura de responsabilidad del mundo adulto.

2. El Problema (Business Case)
Actualmente, la transmisión de directivas (uso del Quincho, mantenimiento de la Notebook Dell Latitude, horarios) depende de la memoria oral, lo que genera fricciones operativas y alegatos de desconocimiento ("no sabía", "me olvidé"). Se requiere un sistema auditable que garantice que el conocimiento ha sido adquirido antes de otorgar privilegios de acceso.

3. Objetivos Estratégicos
- Acreditación de Conocimiento: Asegurar que Martina (12) y Alfonsina (10) comprenden las normativas mediante tests de opción múltiple.
- Autorización Basada en Mérito: Vincular la aprobación de los módulos con la activación física de recursos vía Home Assistant.
- Transparencia Normativa: Mantener un repositorio de consulta permanente, numerado y categorizado.
- Cero Fricción de Acceso: Implementar identificación mediante Tokens Únicos en URLs, eliminando la gestión de contraseñas.

4. Definición de Módulos Funcionales
| Módulo | Descripción |
| :--- | :--- |
| Módulo de Evaluación | Interfaz de usuario para lectura de normativas y ejecución del test cronometrado. |
| Módulo de Gestión (Admin) | Panel para el Director General para cargar nuevas reglas, preguntas y mapear entidades de HA. |
| Módulo de Consulta | Repositorio público (interno) de reglas numeradas y títulos resumen para consulta 24/7. |
| Módulo de Auditoría | Dashboard paginado con el estado de cumplimiento y certificados emitidos. |

5. El Protocolo de Cumplimiento (The 80% Rule)
Para que una capacitación sea considerada exitosa y se registre en el historial legal de la colaboradora, se debe alcanzar un umbral de $\ge 80\%$ de respuestas correctas.
- Éxito: Registro en MariaDB + Activación de input_boolean en HA + Notificación.
- Fallo: El sistema no guarda registros. La colaboradora debe reiniciar el proceso de inducción.

6. Ecosistema Tecnológico (Stack)
- Nodos: Arquitectura distribuida. Nodo Central (Home Assistant + AppDaemon) y Nodo Satélite (Frontend Dockerizado).
- Persistencia: MariaDB (Datos maestros) e InfluxDB (Analítica de tiempos y errores).
- Integración: API de Home Assistant y Node-RED para lógica secundaria.

Declaración de Intenciones: Este sistema no es una herramienta de control, sino un facilitador de autonomía. Al aprobar el test, la colaboradora ya no depende de la voluntad del Director General, sino de su propia acreditación de competencia.
