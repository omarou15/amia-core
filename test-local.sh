#!/bin/bash
# Test local pour Amia Core avant déploiement

echo "🧪 TEST LOCAL AMIA CORE"
echo "======================"

# 1. Vérifier Node.js
echo -e "\n1. Vérification Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "   ✅ Node.js $NODE_VERSION"
else
    echo "   ❌ Node.js non installé"
    exit 1
fi

# 2. Vérifier npm
echo -e "\n2. Vérification npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "   ✅ npm $NPM_VERSION"
else
    echo "   ❌ npm non installé"
    exit 1
fi

# 3. Installation dépendances
echo -e "\n3. Installation des dépendances..."
cd /root/.openclaw/workspace/amia-core
if npm install --silent 2>/dev/null; then
    echo "   ✅ Dépendances installées"
else
    echo "   ❌ Échec installation"
    exit 1
fi

# 4. Vérifier structure fichiers
echo -e "\n4. Vérification structure..."
REQUIRED_FILES=(
    "package.json"
    "src/app/page.tsx"
    "src/app/api/state/route.ts"
    "scripts/continuous-thought.js"
    "scripts/check-state.js"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✅ $file"
    else
        echo "   ⚠️  Manquant: $file"
    fi
done

# 5. Test syntaxe TypeScript/JavaScript
echo -e "\n5. Vérification syntaxe..."
if npx tsc --noEmit 2>/dev/null; then
    echo "   ✅ TypeScript valide"
else
    echo "   ⚠️  Erreurs TypeScript (non bloquant)"
fi

# 6. Test scripts Node
echo -e "\n6. Test scripts..."
if node scripts/check-state.js --dry-run 2>/dev/null; then
    echo "   ✅ Scripts fonctionnels"
else
    echo "   ⚠️  Scripts à vérifier"
fi

echo -e "\n======================"
echo "✅ TESTS TERMINÉS"
echo "Si tout est vert, tu peux déployer avec:"
echo "  git push origin main"
