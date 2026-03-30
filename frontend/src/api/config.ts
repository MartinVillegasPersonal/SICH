export const API_BASE_URL = "http://192.168.0.200:5050/api/appdaemon";

export const ENDPOINTS = {
  PING: `${API_BASE_URL}/sich_ping`,
  REGLAS: `${API_BASE_URL}/sich_reglas`,
  REGLAS_SAVE: `${API_BASE_URL}/sich_reglas_save`,
  EVALUAR: `${API_BASE_URL}/sich_evaluar`,
  DASHBOARD: `${API_BASE_URL}/sich_dashboard`,
  TOKENS: `${API_BASE_URL}/sich_tokens`,
  TOKENS_SAVE: `${API_BASE_URL}/sich_tokens_save`,
  TOKENS_DELETE: `${API_BASE_URL}/sich_tokens_delete`,
};
