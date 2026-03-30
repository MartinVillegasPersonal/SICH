import paramiko
from scp import SCPClient
import os
import sys

def create_ssh_client(server, port, user, password):
    client = paramiko.SSHClient()
    client.load_system_host_keys()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(server, port, user, password)
    return client

def progress(filename, size, sent):
    sys.stdout.write(f"\rTransfiriendo {filename}: {float(sent)/float(size)*100:.2f}%")
    sys.stdout.flush()

if __name__ == '__main__':
    host = '192.168.0.216'
    user = 'martin'
    password = 'MondealRD200k'
    remote_dir = '/home/martin/SICH_frontend'

    print("Conectando al servidor SSH...")
    ssh = create_ssh_client(host, 22, user, password)

    print("Preparando directorio remoto...")
    stdin, stdout, stderr = ssh.exec_command(f'mkdir -p {remote_dir}')
    stdout.channel.recv_exit_status()

    # SCP Transfer
    print("Iniciando transferencia de archivos...")
    with SCPClient(ssh.get_transport(), progress=progress) as scp:
        scp.put('dist', recursive=True, remote_path=remote_dir)
        scp.put('nginx.conf', remote_path=remote_dir)
        scp.put('deploy_dockerfile.txt', remote_path=os.path.join(remote_dir, 'Dockerfile'))
    
    print("\nArchivos transferidos. Verificando Docker...")

    # Build and Run
    commands = [
        f"if ! command -v docker &> /dev/null; then echo '{password}' | sudo -S curl -fsSL https://get.docker.com -o get-docker.sh && echo '{password}' | sudo -S sh get-docker.sh && echo '{password}' | sudo -S usermod -aG docker {user}; fi",
        f"cd {remote_dir} && echo '{password}' | sudo -S docker stop sich_frontend || true",
        f"cd {remote_dir} && echo '{password}' | sudo -S docker rm sich_frontend || true",
        f"cd {remote_dir} && echo '{password}' | sudo -S docker build -t sich-frontend .",
        f"cd {remote_dir} && echo '{password}' | sudo -S docker run -d -p 80:80 --name sich_frontend --restart unless-stopped sich-frontend"
    ]

    for cmd in commands:
        print(f"Ejecutando: {cmd[:60]}...")
        stdin, stdout, stderr = ssh.exec_command(cmd)
        exit_status = stdout.channel.recv_exit_status()
        if exit_status == 0:
            print(f"-> OK\n{stdout.read().decode()}")
        else:
            print(f"-> ERROR\n{stderr.read().decode()}")

    ssh.close()
    print("¡Despliegue finalizado!")
