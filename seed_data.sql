-- SCRIPT PARA RELLENAR LA BASE DE DATOS SICH EN MARIADB (HP)

-- 1. Crear la Regla del Quincho
INSERT INTO tabla_reglas (id, titulo, cuerpo, ha_entity) 
VALUES (1, 'Uso del Quincho y Parrilla', 
'Reglas del Quincho:\n1. Limpieza obligatoria.\n2. Abrir la válvula general de gas en el patio.\n3. Sacar la basura al terminar.', 
'switch.parrilla_luz');

-- 2. Crear las Preguntas para esa Regla
INSERT INTO tabla_preguntas (regla_id, enunciado, opciones_json, correcta_index) 
VALUES (1, '¿Qué hay que hacer con el gas?', '["No tocar nada", "Abrir la válvula general en el patio", "Llamar a un técnico"]', 1);

INSERT INTO tabla_preguntas (regla_id, enunciado, opciones_json, correcta_index) 
VALUES (1, '¿Dónde se deja la basura?', '["En el piso", "En el patio de invierno", "Se saca al contenedor de la calle"]', 2);

-- 3. Crear un Token de prueba para Martina
-- Hack: el token_id es lo que va en la URL /e/MAR_TOKEN_1
INSERT INTO tabla_tokens (token_id, colaboradora_nombre, fecha_creacion) 
VALUES ('MAR_TOKEN_1', 'Martina', NOW());

-- NOTA: Si las tablas no existen todavía, asegúrate de correr el DDL que definimos en el Spike.
