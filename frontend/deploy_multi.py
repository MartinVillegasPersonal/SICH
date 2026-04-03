import paramiko
import os
import sys
import tarfile

def load_env():
    # Buscar .env en el directorio actual o el padre
    env_paths = [".env", "../.env"]
    for path in env_paths:
        if os.path.exists(path):
            with open(path) as f:
                for line in f:
                    if "=" in line and not line.startswith("#"):
                        k, v = line.strip().split("=", 1)
                        os.environ[k] = v.strip("'").strip('"')
            break

load_env()

def create_ssh_client(server, port, user, password):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(server, port, user, password)
    return client

def deploy(host, user, password):
    remote_dir = '/home/martin/SICH_frontend'
    print(f"\n🚀 Desplegando en {host}...")
    
    try:
        ssh = create_ssh_client(host, 22, user, password)
        
        # Crear archivo tar para transferencia rápida
        tar_name = 'dist.tar.gz'
        with tarfile.open(tar_name, "w:gz") as tar:
            tar.add('dist', arcname='dist')
            if os.path.exists('nginx.conf'):
                tar.add('nginx.conf', arcname='nginx.conf')
            if os.path.exists('deploy_dockerfile.txt'):
                tar.add('deploy_dockerfile.txt', arcname='Dockerfile')

        # Transferir usando SFTP (paramiko nativo)
        print(f"[{host}] Transferiendo archivos...")
        sftp = ssh.open_sftp()
        sftp.put(tar_name, f'/tmp/{tar_name}')
        sftp.close()

        print(f"[{host}] Configurando Docker...")
        commands = [
            f'mkdir -p {remote_dir}',
            f'tar -xzf /tmp/{tar_name} -C {remote_dir}',
            f'cd {remote_dir} && echo "{password}" | sudo -S docker stop sich_frontend || true',
            f'cd {remote_dir} && echo "{password}" | sudo -S docker rm sich_frontend || true',
            f'cd {remote_dir} && echo "{password}" | sudo -S docker build -t sich-frontend .',
            f'cd {remote_dir} && echo "{password}" | sudo -S docker run -d -p 80:80 --name sich_frontend --restart unless-stopped sich-frontend'
        ]

        for cmd in commands:
            stdin, stdout, stderr = ssh.exec_command(cmd)
            exit_status = stdout.channel.recv_exit_status()
            if exit_status != 0:
                err = stderr.read().decode()
                if "docker stop" not in cmd and "docker rm" not in cmd:
                    print(f"[{host}] Error en comando: {cmd}\n{err}")
        
        ssh.close()
        os.remove(tar_name)
        print(f"✅ Despliegue en {host} exitoso.")
    except Exception as e:
        print(f"❌ Error en {host}: {str(e)}")

if __name__ == '__main__':
    user = os.getenv("FRONTEND_USER")
    password = os.getenv("FRONTEND_PASS")
    
    hosts_env = os.getenv("FRONTEND_HOSTS")
    if hosts_env:
        hosts = [h.strip() for h in hosts_env.split(",")]
    else:
        hosts = [
            os.getenv("FRONTEND_HOST_216"),
            os.getenv("FRONTEND_HOST_109")
        ]
        # Filtrar None en caso de que alguna no esté definida
        hosts = [h for h in hosts if h]
    
    if not os.path.exists('dist'):
        print("Error: No se encontró la carpeta 'dist'. Ejecuta 'npm run build' primero.")
        sys.exit(1)
        
    for host in hosts:
        deploy(host, user, password)
