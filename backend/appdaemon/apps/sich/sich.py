import appdaemon.plugins.hass.hassapi as hass
import mysql.connector
import json

class SICHManager(hass.Hass):

    def initialize(self):
        self.log("S.I.C.H. Backend Inicializado")
        self.db_config = self.args.get("db_config")
        
        # Registro de Endpoints HTTP para el Nodo Satélite (Frontend)
        # GET /api/appdaemon/sich/reglas
        self.register_endpoint(self.api_get_reglas, "sich/reglas")
        
        # POST /api/appdaemon/sich/evaluar
        self.register_endpoint(self.api_post_evaluar, "sich/evaluar")
        
        self.log("Endpoints SICH registrados correctamente")

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
    def api_get_reglas(self, request, kwargs):
        """Endpoint GET /api/appdaemon/sich/reglas"""
        self.log("GET /sich/reglas llamado")
        conn = None
        try:
            conn = self.get_db_connection()
            if not conn:
                return json.dumps({"status": "error", "message": "Error conectando a BD"}), 500

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
            return json.dumps({"status": "ok", "data": reglas}), 200
            
        except Exception as e:
            self.error(f"Error en api_get_reglas: {e}")
            return json.dumps({"status": "error", "message": str(e)}), 500
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
                return json.dumps({"status": "error", "message": "Faltan parámetros (token_id, regla_id)"}), 400

            conn = self.get_db_connection()
            if not conn:
                return json.dumps({"status": "error", "message": "Error de BD"}), 500
                
            cursor = conn.cursor(dictionary=True)
            
            # 1. Validar el Token
            cursor.execute("SELECT colaboradora_nombre FROM tabla_tokens WHERE token_id = %s", (token_id,))
            token_record = cursor.fetchone()
            
            if not token_record:
                cursor.close()
                return json.dumps({"status": "error", "message": "Token inválido o expirado"}), 401
                
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
            return json.dumps(resultado), 200

        except Exception as e:
            self.error(f"Error en api_post_evaluar: {e}")
            return json.dumps({"status": "error", "message": str(e)}), 500
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

    def activate_resource(self, cursor, normativa_id):
        """Activa la entidad correspondiente en Home Assistant"""
        cursor.execute("SELECT ha_entity FROM tabla_reglas WHERE id = %s", (normativa_id,))
        regla = cursor.fetchone()
        
        if regla and regla['ha_entity']:
            entity = regla['ha_entity']
            self.turn_on(entity)
            self.notify(f"SICH: Regla {normativa_id} aprobada. Acceso a {entity} concedido.", title="SICH Cumplimiento")
            self.log(f"HA Entity {entity} activada por aprobación de {normativa_id}")
        else:
            self.log(f"Advertencia: La regla {normativa_id} no tiene ha_entity asignada.")
