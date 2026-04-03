import subprocess
import os

# Configuración SMB
def load_env():
    if os.path.exists(".env"):
        with open(".env") as f:
            for line in f:
                if "=" in line and not line.startswith("#"):
                    k, v = line.strip().split("=", 1)
                    os.environ[k] = v.strip("'").strip('"')

load_env()

HOST = os.getenv("SSH_HOST_HP")
SHARE = os.getenv("SMB_SHARE")
USER = os.getenv("SMB_USER")
PASS = os.getenv("SMB_PASS")
REMOTE_DIR = "a0d7b954_appdaemon/apps/sich"
LOCAL_FILE = "backend/appdaemon/apps/sich/sich.py"

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def deploy():
    print(f"[*] Subiendo backend via SMB a {HOST}/{SHARE}/{REMOTE_DIR}...")
    
    # smbclient necesita el path local relativo al CWD
    smb_command = [
        "smbclient", f"//{HOST}/{SHARE}",
        "-U", f"{USER}%{PASS}",
        "-c", f"cd {REMOTE_DIR}; put {LOCAL_FILE} sich.py; ls"
    ]
    
    try:
        result = subprocess.run(
            smb_command,
            cwd=BASE_DIR,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            print("[+] Archivo sich.py transferido con éxito.")
            print(result.stdout)
        else:
            print(f"[ERROR] Falló la transferencia SMB.")
            print(result.stderr)
            
    except subprocess.TimeoutExpired:
        print("[ERROR] Timeout: El servidor SMB no respondió en 30 segundos.")
    except Exception as e:
        print(f"[Fallo Crítico]: {str(e)}")

if __name__ == "__main__":
    deploy()
