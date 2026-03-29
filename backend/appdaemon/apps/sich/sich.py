import appdaemon.plugins.hass.hassapi as hass
import mysql.connector

class SICHManager(hass.Hass):

    def initialize(self):
        self.log("S.I.C.H. Backend Inicializado")
        self.db_config = self.args.get("db_config")
        
    def get_db_connection(self):
        return mysql.connector.connect(**self.db_config)

    def evaluate_test(self, colaboradora, normativa_id, respuestas):
        """Lógica de evaluación basada en la 'The 80% Rule'"""
        # Placeholder para la lógica real de calificación
        score = self.calculate_score(normativa_id, respuestas)
        
        if score >= 80:
            self.log(f"Éxito: {colaboradora} aprobó {normativa_id} con {score}%")
            self.register_success(colaboradora, normativa_id, score)
            self.activate_resource(normativa_id)
        else:
            self.log(f"Fallo: {colaboradora} obtuvo {score}% en {normativa_id}")

    def calculate_score(self, normativa_id, respuestas):
        # Simulación de puntaje
        return 100 

    def register_success(self, colaboradora, normativa_id, score):
        # Registro en MariaDB (tabla_certificados)
        pass

    def activate_resource(self, normativa_id):
        # Activa la entidad correspondiente en Home Assistant
        # Ejemplo: MOD-001 -> input_boolean.permiso_tablet_nenas
        entity = "input_boolean.permiso_tablet_nenas"
        self.turn_on(entity)
        self.notify(f"SICH: {normativa_id} acreditado. Acceso concedido.", title="SICH Cumplimiento")
