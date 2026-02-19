# Applied Agentic AI — Hostinger VPS Deployment Guide

## Prerequisites
- Hostinger VPS with Ubuntu 22.04+
- Domain: `appliedagentic.in` pointed to VPS IP
- SSH access to root or sudo user

---

## 1. Initial Server Setup

```bash
# Update system
apt update && apt upgrade -y

# Install essential tools
apt install -y curl git build-essential unzip ufw

# Configure firewall
ufw allow ssh
ufw allow 80
ufw allow 443
ufw enable
```

---

## 2. Install Node.js 20 (LTS)

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Verify
node -v   # v20.x.x
npm -v

# Install pnpm
npm install -g pnpm

# Install PM2
npm install -g pm2
```

---

## 3. Install MySQL 8

```bash
apt install -y mysql-server
systemctl start mysql
systemctl enable mysql

# Secure installation
mysql_secure_installation
# → Set root password, remove anonymous users, disallow remote root login, remove test DB

# Create application database and user
mysql -u root -p <<SQL
CREATE DATABASE appliedagentic CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'aa_user'@'localhost' IDENTIFIED BY 'STRONG_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON appliedagentic.* TO 'aa_user'@'localhost';
FLUSH PRIVILEGES;
SQL
```

---

## 4. Install Nginx

```bash
apt install -y nginx
systemctl start nginx
systemctl enable nginx
```

---

## 5. Install SSL (Let's Encrypt)

```bash
apt install -y certbot python3-certbot-nginx

# Obtain certificate (replace with your domain)
certbot --nginx -d appliedagentic.in -d www.appliedagentic.in
# → Follow prompts, enter email, agree to TOS

# Verify auto-renewal
certbot renew --dry-run
```

---

## 6. Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/appliedagentic.in`:

```nginx
# HTTP → HTTPS redirect
server {
    listen 80;
    server_name appliedagentic.in www.appliedagentic.in;
    return 301 https://appliedagentic.in$request_uri;
}

# HTTPS
server {
    listen 443 ssl http2;
    server_name appliedagentic.in www.appliedagentic.in;

    ssl_certificate     /etc/letsencrypt/live/appliedagentic.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/appliedagentic.in/privkey.pem;
    include             /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Static files (Next.js standalone copies these)
    location /_next/static/ {
        alias /var/www/appliedagentic.in/.next/standalone/.next/static/;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    location /public/ {
        alias /var/www/appliedagentic.in/.next/standalone/public/;
        expires 30d;
    }

    # Uploaded media files
    location /uploads/ {
        alias /var/www/appliedagentic.in/uploads/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # Proxy to Next.js
    location / {
        proxy_pass         http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header   X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
    }

    # File upload size limit
    client_max_body_size 20M;
}
```

```bash
# Enable site
ln -s /etc/nginx/sites-available/appliedagentic.in /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default   # remove default

# Test and reload
nginx -t
systemctl reload nginx
```

---

## 7. Deploy Application

```bash
# Create app directory
mkdir -p /var/www/appliedagentic.in
cd /var/www/appliedagentic.in

# Clone repository
git clone https://github.com/YOUR_USERNAME/appliedagentic.in.git .

# Create uploads directory
mkdir -p uploads
chmod 755 uploads

# Install dependencies
pnpm install --frozen-lockfile --prod=false
```

---

## 8. Configure Environment Variables

```bash
cp .env.example .env.production
nano .env.production
```

Fill in all values:

```env
DATABASE_URL="mysql://aa_user:STRONG_PASSWORD_HERE@localhost:3306/appliedagentic"
NEXTAUTH_URL="https://appliedagentic.in"
NEXTAUTH_SECRET="run: openssl rand -base64 32"
OPENAI_API_KEY="sk-..."
NEXT_PUBLIC_SITE_URL="https://appliedagentic.in"
UPLOAD_DIR="/var/www/appliedagentic.in/uploads"
MAX_FILE_SIZE_MB="10"
NODE_ENV="production"
```

---

## 9. Build & Migrate

```bash
# Run Prisma migrations
pnpm prisma migrate deploy

# Seed database with initial data (first time only)
pnpm prisma db seed

# Build Next.js (standalone mode)
NODE_ENV=production pnpm build

# Copy standalone public/static assets (required for output: standalone)
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static
```

---

## 10. Start with PM2

```bash
# Create PM2 log dir
mkdir -p /var/log/pm2

# Start application
pm2 start ecosystem.config.js --env production

# Check status
pm2 status
pm2 logs appliedagentic --lines 50

# Save PM2 process list
pm2 save

# Enable PM2 startup on reboot
pm2 startup
# → Run the command PM2 outputs
```

---

## 11. Verify Deployment

```bash
# Check app is running
pm2 status

# Test locally on server
curl http://localhost:3000

# Test via Nginx
curl https://appliedagentic.in

# Check Nginx logs if issues
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log
```

---

## Updating the Application

```bash
cd /var/www/appliedagentic.in

# Pull latest changes
git pull origin main

# Install any new dependencies
pnpm install --frozen-lockfile

# Apply any new DB migrations
pnpm prisma migrate deploy

# Rebuild
NODE_ENV=production pnpm build
cp -r public .next/standalone/public
cp -r .next/static .next/standalone/.next/static

# Reload PM2 (zero-downtime)
pm2 reload appliedagentic
```

---

## Useful Commands

| Action | Command |
|--------|---------|
| View logs | `pm2 logs appliedagentic` |
| Restart app | `pm2 restart appliedagentic` |
| Stop app | `pm2 stop appliedagentic` |
| Reload (zero-downtime) | `pm2 reload appliedagentic` |
| Prisma Studio | `pnpm prisma studio` |
| MySQL shell | `mysql -u aa_user -p appliedagentic` |
| Nginx reload | `systemctl reload nginx` |
| Renew SSL | `certbot renew` |

---

## Troubleshooting

**App not starting**: Check `pm2 logs appliedagentic` and verify `.env.production` values.

**DB connection error**: Verify MySQL is running with `systemctl status mysql` and test connection with `mysql -u aa_user -p`.

**502 Bad Gateway**: App may be down — run `pm2 status` and `pm2 restart appliedagentic`.

**Static assets 404**: Ensure you ran the `cp -r` commands after build to copy public/static into standalone.

**Prisma migration fails**: Make sure `DATABASE_URL` in `.env.production` matches. Run `pnpm prisma migrate status` to see state.
