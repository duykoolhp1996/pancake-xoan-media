#!/bin/bash
set -e

echo "=========================================================="
echo "🚀 Pancake Xoăn Media - Standalone App Deployment (v1.0.0)"
echo "=========================================================="

# 1. Build Frontend React + Vite
echo "🔨 [Bước 1/3] Đang build mã nguồn Pancake Frontend..."
npm run build

# 2. Đồng bộ file sang Server Production
echo "📦 [Bước 2/3] Đồng bộ mã nguồn sang Server Production (/var/www/pancake-xoan-media)..."
ssh -n -T server-pc-tunnel "sudo mkdir -p /var/www/pancake-xoan-media"
rsync -avz --delete \
  -e "ssh -T" ./dist/ server-pc-tunnel:/home/minh/pancake-dist/

ssh -n -T server-pc-tunnel "
  sudo cp -r /home/minh/pancake-dist/* /var/www/pancake-xoan-media/
  sudo chown -R www-data:www-data /var/www/pancake-xoan-media
  sudo chmod -R 755 /var/www/pancake-xoan-media
"

echo "=========================================================="
echo "✅ Đã deploy thành công App Pancake độc lập lên Server!"
echo "🥞 Kết nối REST API trực tiếp tới: https://crm.xoanmedia.com/api"
echo "=========================================================="
