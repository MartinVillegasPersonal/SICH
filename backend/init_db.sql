-- ==========================================
-- S.I.C.H. - Sistema Integrado de Cumplimiento Hogareño
-- Script de Inicialización de Base de Datos MariaDB
-- ==========================================

-- 1. Preparar Base de Datos
CREATE DATABASE IF NOT EXISTS sich_db DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sich_db;

-- 2. Limpiar Estructura Anterior (Como se solicitó)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS tabla_preguntas;
DROP TABLE IF EXISTS tabla_certificados;
DROP TABLE IF EXISTS tabla_tokens;
DROP TABLE IF EXISTS tabla_reglas;
SET FOREIGN_KEY_CHECKS = 1;

-- ==========================================
-- ESTRUCTURA DE TABLAS (ACTUALIZADA)
-- ==========================================

-- Tabla de Reglas (Normativas)
CREATE TABLE tabla_reglas (
    id VARCHAR(50) PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    cuerpo TEXT NOT NULL,
    ha_entity VARCHAR(255) COMMENT 'Entidad de Home Assistant a activar',
    tipo_acceso VARCHAR(50) DEFAULT 'Token_Unico',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Preguntas para cada Regla
CREATE TABLE tabla_preguntas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    regla_id VARCHAR(50) NOT NULL,
    enunciado TEXT NOT NULL,
    opciones_json JSON NOT NULL COMMENT 'Array JSON con las opciones',
    correcta_index INT NOT NULL COMMENT 'Índice (0-based) de la opción correcta',
    FOREIGN KEY (regla_id) REFERENCES tabla_reglas(id) ON DELETE CASCADE
);

-- Tabla de Certificados (Registro Histórico y Legal)
CREATE TABLE tabla_certificados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    colaboradora VARCHAR(100) NOT NULL,
    regla_id VARCHAR(50) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nota INT NOT NULL COMMENT 'Porcentaje obtenido (>= 80 para éxito)',
    FOREIGN KEY (regla_id) REFERENCES tabla_reglas(id) ON DELETE CASCADE
);

-- Tabla de Tokens (Para autenticación sin fricción)
CREATE TABLE tabla_tokens (
    token_id VARCHAR(255) PRIMARY KEY,
    colaboradora_nombre VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- DATOS DE MUESTRA (NORMATIVA 001)
-- ==========================================

-- Insertar Tokens de prueba
INSERT INTO tabla_tokens (token_id, colaboradora_nombre) VALUES 
('tkn-martina-1234', 'Martina'),
('tkn-alfonsina-5678', 'Alfonsina');

-- Insertar Regla MOD-001 conforme a normativa_001.md
INSERT INTO tabla_reglas (id, titulo, cuerpo, ha_entity, tipo_acceso) VALUES (
    'MOD-001', 
    'Dormitorios Felices y Sin Migas', 
    '¡Hola, chicas! Queremos que sus piezas sigan siendo los mejores lugares para jugar y descansar. Para que no aparezcan visitantes no invitados (hormigas), recordamos que **en el dormitorio no se come**. Solo podemos tener agua fresquita por si les da sed. ¡El Quincho y la Cocina las esperan para los alfajores y galletitas!', 
    'input_boolean.permiso_tablet_nenas',
    'Token_Unico'
);

-- Insertar Preguntas para MOD-001 (Basadas en documentacion/normativa_001.md)
-- 0-based index: A=0, B=1.
INSERT INTO tabla_preguntas (regla_id, enunciado, opciones_json, correcta_index) VALUES 
('MOD-001', '¿Por qué es mejor no comer en el cuarto?', '["Para que no aparezcan hormigas en las sábanas.", "Porque la comida se enfría."]', 0),
('MOD-001', 'Si Martina tiene galletitas... ¿dónde debe comerlas?', '["En la cama.", "En la cocina o el quincho."]', 1),
('MOD-001', '¿Qué podemos tomar en el dormitorio?', '["Gaseosa.", "Solo agua potable."]', 1),
('MOD-001', 'Si Alfonsina ve una miga... ¿qué hace?', '["La limpia rápido para cuidar su cuarto.", "La deja ahí de mascota."]', 0),
('MOD-001', '¿Cómo se siente dormir en una cama limpia?', '["¡Súper bien para tener lindos sueños!", "Igual que siempre."]', 0);
