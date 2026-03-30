import appdaemon.plugins.hass.hassapi as hass
import mysql.connector
import json
from datetime import datetime

class SICHManager(hass.Hass):

    def initialize(self):
        self.log("S.I.C.H. Backend Inicializado")
        self.db_config = self.args.get("db_config")

        # Registro de Endpoints HTTP
        self.register_endpoint(self.api_get_ping, "sich_ping")
        self.register_endpoint(self.api_get_reglas, "sich_reglas")
        self.register_endpoint(self.api_post_evaluar, "sich_evaluar")
        
        # Endpoints de Administración
        self.register_endpoint(self.api_get_dashboard, "sich_dashboard")
        self.register_endpoint(self.api_post_reglas_save, "sich_reglas_save")
        self.register_endpoint(self.api_get_tokens, "sich_tokens")
        self.register_endpoint(self.api_post_tokens_save, "sich_tokens_save")
        self.register_endpoint(self.api_delete_tokens, "sich_tokens_delete")
        
        self.log("Endpoints SICH registrados correctamente")

    def get_db_connection(self):
        try:
            return mysql.connector.connect(**self.db_config)
        except mysql.connector.Error as err:
            self.error(f"Error conectando a la base de datos: {err}")
            return None

    # ==========================================
    # API ENDPOINTS PRINCIPALES
    # ==========================================

    def api_get_ping(self, request, kwargs):
        self.log("GET /sich_ping llamado")
        conn = None
        try:
            conn = self.get_db_connection()
            if conn and conn.is_connected():
                return json.dumps({"status": "ok", "message": "pong", "db_connected": True}), 200
            else:
                return json.dumps({"status": "error", "message": "Database connection failed", "db_connected": False}), 500
        except Exception as e:
            self.error(f"Error en api_get_ping: {e}")
            return json.dumps({"status": "error", "message": str(e), "db_connected": False}), 500
        finally:
            if conn and conn.is_connected():
                conn.close()

    def api_get_reglas(self, request, kwargs):
        self.log("GET /sich_reglas llamado")
        conn = None
        try:
            conn = self.get_db_connection()
            if not conn:
                return json.dumps({"status": "error", "message": "Error conectando a BD"}), 500

            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT id, titulo, cuerpo, ha_entity FROM tabla_reglas LIMIT 10 OFFSET 0")
            reglas = cursor.fetchall()
            
            for regla in reglas:
                cursor.execute("SELECT id, enunciado, opciones_json, correcta_index FROM tabla_preguntas WHERE regla_id = %s", (regla['id'],))
                preguntas = cursor.fetchall()
                for p in preguntas:
                    if isinstance(p['opciones_json'], str):
                        try:
                            p['opciones_json'] = json.loads(p['opciones_json'])
                        except:
                            p['opciones_json'] = []
                regla['preguntas'] = preguntas
                
            cursor.close()
            return json.dumps({"status": "ok", "data": reglas}), 200
            
        except Exception as e:
            self.error(f"Error en api_get_reglas: {e}")
            return json.dumps({"status": "error", "message": str(e)}), 500
        finally:
            if conn and conn.is_connected():
                conn.close()
        
    def api_post_evaluar(self, request, kwargs):
        self.log("POST /sich_evaluar llamado")
        conn = None
        try:
            if isinstance(request, str):
                data = json.loads(request)
            else:
                data = request
                
            token_id = data.get("token_id")
            normativa_id = data.get("regla_id")
            respuestas = data.get("respuestas", {})

            if not token_id or not normativa_id:
                return json.dumps({"status": "error", "message": "Faltan parámetros"}), 400

            conn = self.get_db_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute("SELECT colaboradora_nombre FROM tabla_tokens WHERE token_id = %s", (token_id,))
            token_record = cursor.fetchone()
            
            if not token_record:
                cursor.close()
                return json.dumps({"status": "error", "message": "Token inválido"}), 401
                
            colaboradora = token_record["colaboradora_nombre"]
            score = self.calculate_score(cursor, normativa_id, respuestas)
            
            if score >= 80:
                self.register_success(cursor, colaboradora, normativa_id, score)
                conn.commit()
                self.activate_resource(cursor, normativa_id)
                res = {"status": "ok", "aprobado": True, "score": score, "mensaje": "¡Certificado emitido!"}
            else:
                res = {"status": "ok", "aprobado": False, "score": score, "mensaje": f"Obtuviste {score}%. Necesitás 80% para aprobar."}
                
            cursor.close()
            return json.dumps(res), 200

        except Exception as e:
            self.error(f"Error en api_post_evaluar: {e}")
            return json.dumps({"status": "error", "message": str(e)}), 500
        finally:
            if conn and conn.is_connected():
                conn.close()

    # ==========================================
    # LÓGICA DE NEGOCIO
    # ==========================================

    def calculate_score(self, cursor, normativa_id, respuestas):
        cursor.execute("SELECT id, correcta_index FROM tabla_preguntas WHERE regla_id = %s", (normativa_id,))
        preguntas_db = cursor.fetchall()
        if not preguntas_db:
            return 0
        correctas = 0
        for p_db in preguntas_db:
            p_id_str = str(p_db['id'])
            if p_id_str in respuestas and int(respuestas[p_id_str]) == p_db['correcta_index']:
                correctas += 1
        return round((correctas / len(preguntas_db)) * 100)

    def register_success(self, cursor, colaboradora, normativa_id, score):
        cursor.execute(
            "INSERT INTO tabla_certificados (colaboradora, regla_id, fecha, nota) VALUES (%s, %s, %s, %s)",
            (colaboradora, normativa_id, datetime.now(), score)
        )

    def activate_resource(self, cursor, normativa_id):
        cursor.execute("SELECT ha_entity FROM tabla_reglas WHERE id = %s", (normativa_id,))
        regla = cursor.fetchone()
        if regla and regla['ha_entity']:
            self.turn_on(regla['ha_entity'])

    # ==========================================
    # ADMIN ENDPOINTS
    # ==========================================

    def api_get_dashboard(self, request, kwargs):
        conn = None
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor(dictionary=True)
            
            cursor.execute("SELECT COUNT(*) as count FROM tabla_reglas")
            reglas_count = cursor.fetchone()['count']
            
            cursor.execute("SELECT COUNT(*) as count FROM tabla_certificados WHERE nota >= 80")
            certificados_count = cursor.fetchone()['count']
            
            cursor.execute("SELECT colaboradora, fecha, nota FROM tabla_certificados ORDER BY fecha DESC LIMIT 5")
            recientes = cursor.fetchall()
            for r in recientes:
                r['fecha'] = r['fecha'].strftime("%Y-%m-%d %H:%M")

            res = {
                "reglas_activas": reglas_count,
                "certificados_aprobados": certificados_count,
                "recientes": recientes
            }
            return json.dumps(res), 200
        except Exception as e:
            return json.dumps({"status": "error", "message": str(e)}), 500
        finally:
            if conn: conn.close()

    def api_post_reglas_save(self, request, kwargs):
        conn = None
        try:
            data = json.loads(request) if isinstance(request, str) else request
            titulo = data.get("titulo")
            cuerpo = data.get("cuerpo")
            ha_entity = data.get("ha_entity")
            preguntas = data.get("preguntas", [])

            conn = self.get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute("INSERT INTO tabla_reglas (titulo, cuerpo, ha_entity) VALUES (%s, %s, %s)", (titulo, cuerpo, ha_entity))
            regla_id = cursor.lastrowid
            
            for p in preguntas:
                p_json = json.dumps(p.get("opciones_json", []))
                cursor.execute(
                    "INSERT INTO tabla_preguntas (regla_id, enunciado, opciones_json, correcta_index) VALUES (%s, %s, %s, %s)",
                    (regla_id, p.get("enunciado"), p_json, p.get("correcta_index"))
                )
            
            conn.commit()
            return json.dumps({"status": "ok", "regla_id": regla_id}), 200
        except Exception as e:
            return json.dumps({"status": "error", "message": str(e)}), 500
        finally:
            if conn: conn.close()

    def api_get_tokens(self, request, kwargs):
        conn = None
        try:
            conn = self.get_db_connection()
            cursor = conn.cursor(dictionary=True)
            cursor.execute("SELECT token_id, colaboradora_nombre FROM tabla_tokens ORDER BY fecha_creacion DESC")
            tokens = cursor.fetchall()
            return json.dumps(tokens), 200
        except Exception as e:
            return json.dumps({"status": "error"}), 500
        finally:
            if conn: conn.close()

    def api_post_tokens_save(self, request, kwargs):
        conn = None
        try:
            data = json.loads(request) if isinstance(request, str) else request
            token_id = data.get("token_id")
            nombre = data.get("colaboradora_nombre")
            
            conn = self.get_db_connection()
            cursor = conn.cursor()
            cursor.execute("INSERT INTO tabla_tokens (token_id, colaboradora_nombre) VALUES (%s, %s)", (token_id, nombre))
            conn.commit()
            return json.dumps({"status": "ok"}), 200
        except Exception as e:
            return json.dumps({"status": "error"}), 500
        finally:
            if conn: conn.close()

    def api_delete_tokens(self, request, kwargs):
        conn = None
        try:
            data = json.loads(request) if isinstance(request, str) else request
            token_id = data.get("token_id")
            conn = self.get_db_connection()
            cursor = conn.cursor()
            cursor.execute("DELETE FROM tabla_tokens WHERE token_id = %s", (token_id,))
            conn.commit()
            return json.dumps({"status": "ok"}), 200
        except Exception as e:
            return json.dumps({"status": "error"}), 500
        finally:
            if conn: conn.close()
