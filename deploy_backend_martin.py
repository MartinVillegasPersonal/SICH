import paramiko
from scp import SCPClient
import os
import sys

def load_env():
    if os.path.exists(".env"):
        with open(".env") as f:
            for line in f:
                if "=" in line and not line.startswith("#"):
                    k, v = line.strip().split("=", 1)
                    os.environ[k] = v.strip("'").strip('"')

load_env()

HOST_HP = os.getenv("SSH_HOST_HP")
USER_HP = os.getenv("SSH_USER_MARTIN")
PASS_HP = os.getenv("SSH_PASS_MARTIN")
PORT_HP = int(os.getenv("SSH_PORT_HP", 22))

REMOTE_APPS_DIR = "/config/appdaemon/apps"
REMOTE_SICH_DIR = f"{REMOTE_APPS_DIR}/sich"
LOCAL_SOURCE_FILE = "./backend/appdaemon/apps/sich/sich.py"

def deploy():
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        print(f"[*] Conectando al servidor HP como '{USER_HP}' ({HOST_HP}:{PORT_HP})...")
        ssh.connect(HOST_HP, port=PORT_HP, username=USER_HP, password=PASS_HP, timeout=10)
        
        print("[+] Conexión establecida remotamente.")

        print("[*] Asegurando que el directorio de SICH exista...")
        # Usamos sudo si es necesario para crear directorios en /config
        ssh.exec_command(f"echo '{PASS_HP}' | sudo -S mkdir -p {REMOTE_SICH_DIR}")
        
        print("[*] Iniciando transferencia SCP del código Backend...")
        with SCPClient(ssh.get_transport()) as scp:
            scp.put(LOCAL_SOURCE_FILE, remote_path="/tmp/sich.py")
        
        print("[*] Moviendo archivo a su destino final con sudo...")
        ssh.exec_command(f"echo '{PASS_HP}' | sudo -S mv /tmp/sich.py {REMOTE_SICH_DIR}/sich.py")

        print("[*] Ejecutando reinicio del servicio de AppDaemon...")
        command_restart = f"echo '{PASS_HP}' | sudo -S ha addons restart a0d7b954_appdaemon || echo '{PASS_HP}' | sudo -S docker restart appdaemon"
        stdin, stdout, stderr = ssh.exec_command(command_restart)
        stdout.channel.recv_exit_status()
        
        print("[+] ¡Despliegue del Backend Finalizado!")

    except Exception as e:
        print(f"\n[Fallo Crítico]: {str(e)}")
    finally:
        ssh.close()

if __name__ == "__main__":
    deploy()
