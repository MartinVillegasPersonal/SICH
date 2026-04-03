import os
import sys
import paramiko
from scp import SCPClient

def load_env():
    if os.path.exists(".env"):
        with open(".env") as f:
            for line in f:
                if "=" in line and not line.startswith("#"):
                    k, v = line.strip().split("=", 1)
                    os.environ[k] = v.strip("'").strip('"')

load_env()

HOST_HP = os.getenv("SSH_HOST_HP")
USER_HP = os.getenv("SSH_USER_ROOT")
PORT_HP = int(os.getenv("SSH_PORT_HP", 22))

REMOTE_APPS_DIR = "/config/appdaemon/apps"
REMOTE_SICH_DIR = f"{REMOTE_APPS_DIR}/sich"
LOCAL_SOURCE_FILE = "./backend/appdaemon/apps/sich/sich.py"

def deploy():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        print(f"[*] Conectando al servidor HP de Home Assistant ({HOST_HP}:{PORT_HP})...")
        # Forzamos paramiko a usar la clave ECDSA que creamos recién en Linux
        key = paramiko.ECDSAKey.from_private_key_file(os.path.expanduser('~/.ssh/id_ecdsa'))
        ssh.connect(HOST_HP, port=PORT_HP, username=USER_HP, pkey=key, timeout=10)
        
        print("[+] Conexión establecida remotamente.")

        print("[*] Asegurando que el directorio de SICH exista bajo AppDaemon...")
        stdin, stdout, stderr = ssh.exec_command(f"mkdir -p {REMOTE_SICH_DIR}")
        exit_status = stdout.channel.recv_exit_status()
        if exit_status != 0:
            print(f"[ERROR] No se pudo crear el directorio. Detalles: {stderr.read().decode()}")
            sys.exit(1)

        print("[*] Iniciando transferencia SCP del código Backend...")
        with SCPClient(ssh.get_transport()) as scp:
            scp.put(LOCAL_SOURCE_FILE, remote_path=REMOTE_SICH_DIR)
        print("[+] API sich.py transferida con éxito al servidor HP.")

        print("[*] Ejecutando reinicio del servicio de AppDaemon...")
        command_restart = "ha addons restart a0d7b954_appdaemon || systemctl restart appdaemon || docker restart appdaemon || echo 'Could not automaticaly restart'"
        stdin, stdout, stderr = ssh.exec_command(command_restart)
        exit_status = stdout.channel.recv_exit_status()
        
        output = stdout.read().decode()
        error_output = stderr.read().decode()

        print(f"Salida del reinicio:\n{output}")
        if error_output:
             print(f"Avisos durante reinicio:\n{error_output}")
        
        print("[+] ¡Despliegue del Backend Finalizado Mágicamente!")

    except Exception as e:
        print(f"\n[Fallo Crítico]: {str(e)}")
    finally:
        ssh.close()

if __name__ == "__main__":
    deploy()
