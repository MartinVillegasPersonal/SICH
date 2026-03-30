import subprocess
import os

# Configuración SMB
HOST = "192.168.0.200"
SHARE = "addon_configs"
USER = "martin"
PASS = "maquina"
REMOTE_PATH = "a0d7b954_appdaemon/apps/sich"
LOCAL_FILE = "./backend/appdaemon/apps/sich/sich.py"

def deploy():
    # Asegurar que el directorio remoto exista (smbclient no lo crea solo)
    # Sin embargo, si ya existe el addon_configs, usualmente basta con el 'cd'
    
    print(f"[*] Subiendo backend via SMB a {HOST}/{SHARE}...")
    
    # Construir comando smbclient
    # -c 'cd path; put localfile'
    smb_command = f"smbclient //{HOST}/{SHARE} -U {USER}%{PASS} -c 'cd {REMOTE_PATH}; put {LOCAL_FILE} sich.py'"
    
    try:
        # Usar subprocess para ejecutar el comando
        process = subprocess.Popen(smb_command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        
        if process.returncode == 0:
            print("[+] Archivo sich.py transferido con éxito.")
            print(f"Resultado:\n{stdout.decode()}")
        else:
            print(f"[ERROR] Falló la transferencia SMB.\n{stderr.decode()}")
            
    except Exception as e:
        print(f"[Fallo Crítico]: {str(e)}")

if __name__ == "__main__":
    deploy()
