import appdaemon.plugins.hass.hassapi as hass
import mysql.connector
import json

class SICHManager(hass.Hass):

    def initialize(self):
        self.log("S.I.C.H. Backend Inicializado")
        self.db_config = self.args.get("db_config")
        
        # Headers para permitir CORS desde el satélite (Raspberry Pi)
        self.cors_headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        }

        # Registro de Endpoints HTTP con guiones bajos para consistencia
        self.register_endpoint(self.api_get_ping, "sich_ping")
        self.register_endpoint(self.api_get_reglas, "sich_reglas")
        self.register_endpoint(self.api_post_evaluar, "sich_evaluar")
        
        # Endpoints de Administración (Protegidos por PIN en el Frontend)
        self.register_endpoint(self.api_get_dashboard, "sich_dashboard")
        self.register_endpoint(self.api_post_reglas_save, "sich_reglas_save")
        self.register_endpoint(self.api_get_tokens, "sich_tokens")
        self.register_endpoint(self.api_post_tokens_save, "sich_tokens_save")
        self.register_endpoint(self.api_delete_tokens, "sich_tokens_delete")
        
        self.log("Endpoints SICH (underscore names) registrados correctamente")

    # ==========================================
    # DATABASE CONNECTION
    # ==========================================
    def get_db_connection(self):
        """Abre y retorna una conexión a MariaDB"""
        try:
            return mysql.connector.connect(**self.db_config)
        except mysql.connector.Error as err:
            self.error(f"Error conectando a la base de datos: {err}")
            return None

    # ==========================================
    # API ENDPOINTS
    # ==========================================
    def api_get_ping(self, request, kwargs):
        """Endpoint GET /api/appdaemon/sich/ping (Health Check)"""
        self.log("GET /sich/ping llamado")
        conn = None
        try:
            conn = self.get_db_connection()
            if conn and conn.is_connected():
                return json.dumps({"status": "ok", "message": "pong", "db_connected": True}), 200, self.cors_headers
            else:
                return json.dumps({"status": "error", "message": "Database connection failed", "db_connected": False}), 500, self.cors_headers
        except Exception as e:
            self.error(f"Error en api_get_ping: {e}")
            return json.dumps({"status": "error", "message": str(e), "db_connected": False}), 500, self.cors_headers
        finally:
            if conn and conn.is_connected():
                conn.close()

    def api_get_reglas(self, request, kwargs):
        """Endpoint GET /api/appdaemon/sich/reglas"""
        self.log("GET /sich/reglas llamado")
        conn = None
        try:
            conn = self.get_db_connection()
            if not conn:
                return json.dumps({"status": "error", "message": "Error conectando a BD"}), 500, self.cors_headers

            cursor = conn.cursor(dictionary=True)
            
            # Paginación básica simulada (TODO: extraer de kwargs si es necesario)
            limit = 10
            offset = 0
            
            cursor.execute("SELECT id, titulo, cuerpo, ha_entity FROM tabla_reglas LIMIT %s OFFSET %s", (limit, offset))
            reglas = cursor.fetchall()
            
            # Obtener preguntas para cada regla
            for regla in reglas:
                cursor.execute("SELECT id, enunciado, opciones_json, correcta_index FROM tabla_preguntas WHERE regla_id = %s", (regla['id'],))
                preguntas = cursor.fetchall()
                for p in preguntas:
                    # Parsear opciones si están como string JSON en la base de datos
                    if isinstance(p['opciones_json'], str):
                        try:
                            p['opciones_json'] = json.loads(p['opciones_json'])
                        except Exception:
                            p['opciones_json'] = []
                regla['preguntas'] = preguntas
                
            cursor.close()
            return json.dumps({"status": "ok", "data": reglas}), 200, self.cors_headers
            
        except Exception as e:
            self.error(f"Error en api_get_reglas: {e}")
            return json.dumps({"status": "error", "message": str(e)}), 500, self.cors_headers
        finally:
            if conn and conn.is_connected():
                conn.close()
        
    def api_post_evaluar(self, request, kwargs):
        """Endpoint POST /api/appdaemon/sich/evaluar"""
        self.log("POST /sich/evaluar llamado")
        conn = None
        try:
            # En AppDaemon, request a veces viene como string si el Content-Type es JSON
            if isinstance(request, str):
                data = json.loads(request)
            else:
                data = request
                
            token_id = data.get("token_id")
            normativa_id = data.get("regla_id")
            respuestas = data.get("respuestas", {}) # Formato: {"id_pregunta": index_respuesta_enviado}

            if not token_id or not normativa_id:
                return json.dumps({"status": "error", "message": "Faltan parámetros (token_id, regla_id)"}), 400, self.cors_headers

            conn = self.get_db_connection()
            if not conn:
                return json.dumps({"status": "error", "message": "Error de BD"}), 500, self.cors_headers
                
            cursor = conn.cursor(dictionary=True)
            
            # 1. Validar el Token
            cursor.execute("SELECT colaboradora_nombre FROM tabla_tokens WHERE token_id = %s", (token_id,))
            token_record = cursor.fetchone()
            
            if not token_record:
                cursor.close()
                return json.dumps({"status": "error", "message": "Token inválido o expirado"}), 401, self.cors_headers
                
            colaboradora = token_record["colaboradora_nombre"]
            
            # 2. Calcular la nota (The 80% Rule)
            score = self.calculate_score(cursor, normativa_id, respuestas)
            
            # 3. Evaluar e impactar resultados
            if score >= 80:
                self.log(f"Éxito: {colaboradora} aprobó {normativa_id} con {score}%")
                self.register_success(cursor, colaboradora, normativa_id, score)
                conn.commit() # Asegurar la inserción
                
                self.activate_resource(cursor, normativa_id)
                resultado = {
                    "status": "ok", 
                    "aprobado": True, 
                    "score": score, 
                    "mensaje": "¡Felicitaciones! Certificado emitido y acceso concedido."
                }
            else:
                self.log(f"Fallo: {colaboradora} obtuvo {score}% en {normativa_id}. No se registra.")
                resultado = {
                    "status": "ok", 
                    "aprobado": False, 
                    "score": score, 
                    "mensaje": f"Obtuviste un {score}%. Necesitas un 80% para aprobar. ¡Inténtalo de nuevo!"
                }
                
            cursor.close()
            return json.dumps(resultado), 200, self.cors_headers

        except Exception as e:
            self.error(f"Error en api_post_evaluar: {e}")
            return json.dumps({"status": "error", "message": str(e)}), 500, self.cors_headers
        finally:
            if conn and conn.is_connected():
                conn.close()

    # ==========================================
    # BUSINESS LOGIC (The 80% Rule)
    # ==========================================
    def calculate_score(self, cursor, normativa_id, respuestas):
        """Calcula el porcentaje de respuestas correctas"""
        cursor.execute("SELECT id, correcta_index FROM tabla_preguntas WHERE regla_id = %s", (normativa_id,))
        preguntas_db = cursor.fetchall()
        
        if not preguntas_db:
            return 0 # No hay preguntas configuradas
            
        correctas = 0
        total = len(preguntas_db)
        
        for p_db in preguntas_db:
            # Las keys del diccionario enviado en JSON suelen ser strings
            p_id_str = str(p_db['id'])
            
            if p_id_str in respuestas:
                # Si la respuesta del frontend coincide con la almacenada
                if int(respuestas[p_id_str]) == p_db['correcta_index']:
                    correctas += 1
                    
        porcentaje = (correctas / total) * 100
        return round(porcentaje)

    def register_success(self, cursor, colaboradora, normativa_id, score):
        """Registra el certificado en MariaDB"""
        from datetime import datetime
        ahora = datetime.now()
        
        cursor.execute(
            "INSERT INTO tabla_certificados (colaboradora, regla_id, fecha, nota) VALUES (%s, %s, %s, %s)",
            (colaboradora, normativa_id, ahora, score)
        )
        self.log(f"Certificado insertado en BD para {colaboradora} - Regla: {normativa_id}")

    # ==========================================
    # ADMIN ENDPOINTS
    # ==========================================
    
    def api_get_dashboard(self, request, kwargs):
        """GET /sich_dashboard: Estadísticas rápidas"""
        conn = None
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor(dictionary=True)
            
            # Conteo de Reglas
            cursor.execute("SELECT COUNT(*) as count FROM tabla_reglas")
            reglas_count = cursor.fetchone()['count']
            
            # Conteo de Certificados (Aprobados)
            cursor.execute("SELECT COUNT(*) as count FROM tabla_certificados WHERE nota >= 80")
            certificados_count = cursor.fetchone()['count']
            
            # Últimos movimientos
            cursor.execute("SELECT colaboradora, fecha, nota FROM tabla_certificados ORDER BY fecha DESC LIMIT 5")
            recientes = cursor.fetchall()
            for r in recientes: r['fecha'] = r['fecha'].strftime("%Y-%m-%d %H:%M")

            res = {
                "reglas_activas": reglas_count,
                "certificados_aprobados": certificados_count,
                "recientes": recientes
            }
            return json.dumps(res), 200, self.cors_headers
        except Exception as e:
            return json.dumps({"status": "error", "message": str(e)}), 500, self.cors_headers
        finally:
            if conn: conn.close()

    def api_post_reglas_save(self, request, kwargs):
        """POST /sich_reglas_save: Crea o actualiza una regla"""
        conn = None
        try:
            data = json.loads(request) if isinstance(request, str) else request
            titulo = data.get("titulo")
            cuerpo = data.get("cuerpo")
            ha_entity = data.get("ha_entity")
            preguntas = data.get("preguntas", [])

            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            # Insertar Regla
            cursor.execute("INSERT INTO tabla_reglas (titulo, cuerpo, ha_entity) VALUES (%s, %s, %s)", (titulo, cuerpo, ha_entity))
            regla_id = cursor.lastrowid
            
            # Insertar Preguntas
            for p in preguntas:
                p_json = json.dumps(p.get("opciones_json", []))
                cursor.execute("INSERT INTO tabla_preguntas (regla_id, enunciado, opciones_json, correcta_index) VALUES (%s, %s, %s, %s)",
                               (regla_id, p.get("enunciado"), p_json, p.get("correcta_index")))
            
            conn.commit()
            return json.dumps({"status": "ok", "regla_id": regla_id}), 200, self.cors_headers
        except Exception as e:
            return json.dumps({"status": "error", "message": str(e)}), 500, self.cors_headers
        finally:
            if conn: conn.close()

    def api_get_tokens(self, request, kwargs):
        """GET /sich_tokens: Lista todos los tokens activos"""
        conn = None
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT token_id, colaboradora_nombre FROM tabla_tokens ORDER BY fecha_creacion DESC")
            tokens = cursor.fetchall()
            return json.dumps(tokens), 200, self.cors_headers
        except Exception as e:
            return json.dumps({"status": "error"}), 500, self.cors_headers
        finally:
            if conn: conn.close()

    def api_post_tokens_save(self, request, kwargs):
        """POST /sich_tokens_save: Crea un nuevo token"""
        conn = None
        try:
            data = json.loads(request) if isinstance(request, str) else request
            token_id = data.get("token_id")
            nombre = data.get("colaboradora_nombre")
            
            conn = self.get_db_connection()
            cursor = conn.cursor()
            cursor.execute("INSERT INTO tabla_tokens (token_id, colaboradora_nombre) VALUES (%s, %s)", (token_id, nombre))
            conn.commit()
            return json.dumps({"status": "ok"}), 200, self.cors_headers
        except Exception as e:
            return json.dumps({"status": "error"}), 500, self.cors_headers
        finally:
            if conn: conn.close()

    def api_delete_tokens(self, request, kwargs):
        """DELETE /sich_tokens_delete: Elimina un token"""
        conn = None
        try:
            data = json.loads(request) if isinstance(request, str) else request
            token_id = data.get("token_id")
            conn = self.get_db_connection()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM tabla_tokens WHERE token_id = %s", (token_id,))
            conn.commit()
            return json.dumps({"status": "ok"}), 200, self.cors_headers
        except Exception as e:
            return json.dumps({"status": "error"}), 500, self.cors_headers
        finally:
            if conn: conn.close()
