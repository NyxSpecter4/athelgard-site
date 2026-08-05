#!/bin/bash
# Athelgard CLI Quick Setup

echo "🦉 Setting up Athelgard CLI..."

# Make executable
chmod +x cli/athelgard.js

# Create global symlink so you can run 'athelgard' anywhere
npm link 2>/dev/null || echo "Run: npm link (optional, for global 'athelgard' command)"

echo ""
echo "✅ CLI ready!"
echo ""
echo "Next steps:"
echo "  1. node cli/athelgard.js config       # Set DeepSeek/Kimi API keys"
echo "  2. node cli/athelgard.js github login # Paste your GitHub PAT"
echo "  3. node cli/athelgard.js chat         # Start coding!"
echo ""
echo "Or install globally:"
echo "  npm link"
echo "  athelgard config"
echo "  athelgard chat"
