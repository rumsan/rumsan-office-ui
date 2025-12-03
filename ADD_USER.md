\`\`\`
sudo adduser --gecos "" --disabled-login kcodsxtluzxl
echo "kcodsxtluzxl:T\$mp9670" | sudo chpasswd
sudo usermod -aG sudo kcodsxtluzxl

sudo mkdir -p /home/kcodsxtluzxl
sudo chown kcodsxtluzxl:kcodsxtluzxl /home/kcodsxtluzxl
sudo chmod 700 /home/kcodsxtluzxl

sudo chsh -s /bin/bash kcodsxtluzxl

\`\`\`

\`\`\`
ssh-keygen -s rumsan_ssh_ca -I rumsan-cert -n dev -V +1h ~/.ssh/id_ed25519.pub
ssh-keygen -s /tmp/test_key -I rumsan-cert -n dev -V +1h ~/.ssh/id_ed25519.pub

Host dev_us
  HostName dev-us-ssh.rumsan.us
  User kcodsxtluzxl
  IdentityFile ~/.ssh/id_ed25519
  CertificateFile ~/.ssh/id_ed25519-cert.pub
  ProxyCommand /opt/homebrew/bin/cloudflared access ssh --hostname %h
  ServerAliveInterval 240
\`\`\`


\`\`\`
cut -d: -f1 /etc/passwd

sudo deluser --remove-home kcodsxtluzxl
\`\`\`
