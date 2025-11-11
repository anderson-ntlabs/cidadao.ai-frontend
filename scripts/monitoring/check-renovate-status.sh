#!/bin/bash

# Script para verificar status do Renovate
# Uso: ./scripts/monitoring/check-renovate-status.sh

echo "🔍 Verificando status do Renovate..."
echo ""

# Verificar PRs do Renovate
echo "📋 Pull Requests do Renovate:"
gh pr list --label "dependencies" --state all --limit 5 || echo "Nenhum PR encontrado ainda"
echo ""

# Verificar Issues do Renovate (Dependency Dashboard)
echo "📊 Dependency Dashboard:"
gh issue list --label "dependencies" --state open --limit 1 || echo "Dashboard ainda não criado"
echo ""

# Verificar se renovate.json existe
echo "⚙️ Configuração:"
if [ -f "renovate.json" ]; then
    echo "✅ renovate.json encontrado"
    echo "📦 Pacotes configurados:"
    jq -r '.packageRules[] | .groupName // .description' renovate.json 2>/dev/null | grep -v "null" | head -5
else
    echo "❌ renovate.json não encontrado!"
fi
echo ""

# Instruções
echo "📝 Próximos passos:"
echo "1. Aguardar PR 'Configure Renovate' (5-15 minutos)"
echo "2. Review e merge do Onboarding PR"
echo "3. Aguardar criação do Dependency Dashboard"
echo "4. Primeiras atualizações: Segunda/Quinta 5am BRT"
echo ""

echo "💡 Dica: Execute este script novamente em alguns minutos"
echo "   para ver se o PR foi criado!"
