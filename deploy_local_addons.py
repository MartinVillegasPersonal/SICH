import os
import subprocess

def load_env():
    # Cargar variables del .env
    if os.path.exists(".env"):
        with open(".env") as f:
            for line in f:
                if "=" in line and not line.startswith("#"):
                    k, v = line.strip().split("=", 1)
                    os.environ[k] = v.strip("'").strip('"')

def deploy():
    load_env()
    
    host = os.getenv("SSH_HOST_HP", "192.168.0.200")
    user = os.getenv("SMB_USER", "martin")
    password = os.getenv("SMB_PASS", "maquina")
    share = "addons"  # Carpeta estándar para complementos locales de HA
    
    print(f"🚀 Desplegando el Complemento Local (Frontend) en {host}/{share}...")
    
    folder = "sich-frontend"
    print(f"[*] Iniciando transferencia de {folder} vía SMB...")
    
    # Usamos smbclient para transferir la carpeta entera de forma recursiva
    smb_command = f"smbclient //{host}/{share} -U {user}%{password} -c 'mkdir {folder}; cd {folder}; lcd {folder}; prompt; recurse; mput *'"
    
    try:
        subprocess.run(smb_command, shell=True, check=True)
        print(f"\n✅ {folder} copiado con éxito a tu Home Assistant.")
        print("\nPróximos pasos:")
        print("1. Ve a Ajustes > Complementos > Tienda en tu Home Assistant.")
        print("2. Menú (3 puntos) > 'Comprobar si hay actualizaciones'.")
        print("3. Busca 'SICH Frontend' en la nueva sección de 'Local add-ons'.")
    except Exception as e:
        print(f"\n❌ Fallo al copiar el complemento: {e}")

if __name__ == "__main__":
    deploy()
