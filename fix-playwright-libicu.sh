#!/bin/bash

# Script to fix Playwright WebKit dependencies on Ubuntu 25.04 (Plucky)
# Author: Anderson Henrique da Silva
# Date: 2025-11-05
#
# This script creates symlinks from libicu76 to libicu74 for Playwright compatibility
# Must be run as root or with sudo

set -e  # Exit on error

echo "=========================================="
echo "Playwright WebKit Dependencies Fixer"
echo "Ubuntu 25.04 (Plucky) - libicu76 → libicu74"
echo "=========================================="
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo "❌ ERROR: This script must be run as root or with sudo"
    echo "Usage: sudo bash fix-playwright-libicu.sh"
    exit 1
fi

echo "✓ Running as root"
echo ""

# Step 1: Find libicu76 files
echo "Step 1: Locating libicu76 files..."
LIBICU_PATH="/usr/lib/x86_64-linux-gnu"

if [ ! -f "$LIBICU_PATH/libicudata.so.76" ]; then
    echo "❌ ERROR: libicu76 not found at $LIBICU_PATH"
    echo "Please install libicu76 first: sudo apt-get install libicu76"
    exit 1
fi

echo "✓ Found libicu76 at $LIBICU_PATH"
echo ""

# Step 2: Create symlinks
echo "Step 2: Creating symlinks..."
cd "$LIBICU_PATH"

# Remove old symlinks if they exist
rm -f libicudata.so.74 libicuuc.so.74 libicui18n.so.74

# Create new symlinks
ln -s libicudata.so.76 libicudata.so.74
ln -s libicuuc.so.76 libicuuc.so.74
ln -s libicui18n.so.76 libicui18n.so.74

echo "✓ Created symlinks:"
ls -lh libicudata.so.74 libicuuc.so.74 libicui18n.so.74
echo ""

# Step 3: Update library cache
echo "Step 3: Updating library cache..."
ldconfig
echo "✓ Library cache updated"
echo ""

# Step 4: Verify symlinks
echo "Step 4: Verifying symlinks..."
if [ -L "$LIBICU_PATH/libicudata.so.74" ] &&
   [ -L "$LIBICU_PATH/libicuuc.so.74" ] &&
   [ -L "$LIBICU_PATH/libicui18n.so.74" ]; then
    echo "✓ All symlinks verified successfully"
else
    echo "❌ ERROR: Some symlinks were not created properly"
    exit 1
fi
echo ""

# Step 5: Install remaining Playwright dependencies (without libicu74)
echo "Step 5: Installing remaining Playwright WebKit dependencies..."
echo "This may take a few minutes..."
echo ""

# Create a temporary list of packages excluding libicu74
apt-get update
apt-get install -y --no-install-recommends \
    gstreamer1.0-libav \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-base \
    gstreamer1.0-plugins-good \
    libatomic1 \
    libatk-bridge2.0-0t64 \
    libatk1.0-0t64 \
    libcairo-gobject2 \
    libcairo2 \
    libdbus-1-3 \
    libdrm2 \
    libenchant-2-2 \
    libepoxy0 \
    libevent-2.1-7t64 \
    libflite1 \
    libfontconfig1 \
    libfreetype6 \
    libgbm1 \
    libgdk-pixbuf-2.0-0 \
    libgles2 \
    libglib2.0-0t64 \
    libgstreamer-gl1.0-0 \
    libgstreamer-plugins-bad1.0-0 \
    libgstreamer-plugins-base1.0-0 \
    libgstreamer1.0-0 \
    libgtk-4-1 \
    libharfbuzz-icu0 \
    libharfbuzz0b \
    libhyphen0 \
    libjpeg-turbo8 \
    liblcms2-2 \
    libmanette-0.2-0 \
    libopus0 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libpng16-16t64 \
    libsecret-1-0 \
    libvpx9 \
    libwayland-client0 \
    libwayland-egl1 \
    libwayland-server0 \
    libwebp7 \
    libwebpdemux2 \
    libwoff1 \
    libx11-6 \
    libxkbcommon0 \
    libxml2 \
    libxslt1.1 \
    libx264-164 \
    libavif16 \
    xvfb \
    fonts-noto-color-emoji \
    fonts-unifont \
    xfonts-cyrillic \
    xfonts-scalable \
    fonts-liberation \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-tlwg-loma-otf \
    fonts-freefont-ttf

echo ""
echo "✓ Playwright dependencies installed successfully"
echo ""

# Step 6: Final verification
echo "=========================================="
echo "✅ INSTALLATION COMPLETE!"
echo "=========================================="
echo ""
echo "Symlinks created:"
echo "  libicudata.so.76 → libicudata.so.74"
echo "  libicuuc.so.76 → libicuuc.so.74"
echo "  libicui18n.so.76 → libicui18n.so.74"
echo ""
echo "Location: $LIBICU_PATH"
echo ""
echo "Next steps:"
echo "  1. Exit root: exit"
echo "  2. Install WebKit browser: npx playwright install webkit"
echo "  3. Run iOS tests: npm run test:playwright -- --project=\"iPhone SE\""
echo ""
echo "=========================================="
