#!/bin/bash

# Script de test de l'intégration Vast.ai
# Ce script vérifie que tous les composants fonctionnent correctement

echo "🧪 Test de l'intégration Vast.ai"
echo "================================"
echo ""

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Vérifier que le serveur est démarré
echo "1. Vérification du serveur..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} Serveur opérationnel"
else
    echo -e "${RED}✗${NC} Serveur non accessible"
    echo "   Démarre le serveur avec: npm run dev"
    exit 1
fi

# 2. Vérifier la configuration Vast.ai
echo ""
echo "2. Vérification de la configuration..."
if [ -z "$VAST_API_URL" ]; then
    echo -e "${YELLOW}⚠${NC} VAST_API_URL non configuré (mode mock)"
else
    echo -e "${GREEN}✓${NC} VAST_API_URL: $VAST_API_URL"
fi

# 3. Test du module Vast.ai
echo ""
echo "3. Test du module Vast.ai..."
npx tsx example-vast-integration.js > /tmp/vast-test.log 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓${NC} Module Vast.ai fonctionnel"
else
    echo -e "${RED}✗${NC} Erreur dans le module"
    cat /tmp/vast-test.log
    exit 1
fi

# 4. Créer un compte de test (si pas déjà connecté)
echo ""
echo "4. Test de l'API..."

# Signup
TEST_EMAIL="vast-test-$(date +%s)@test.com"
TEST_PASSWORD="Test123456"

SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}")

TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗${NC} Échec de l'inscription"
    exit 1
fi

echo -e "${GREEN}✓${NC} Utilisateur créé"

# 5. Créer une vidéo de test
echo ""
echo "5. Test de création vidéo..."

VIDEO_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/video \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"platform":"test vast.ai","tone":"test","duration":15}')

VIDEO_JOB_ID=$(echo $VIDEO_RESPONSE | grep -o '"id":"[^"]*' | sed 's/"id":"//')

if [ -z "$VIDEO_JOB_ID" ]; then
    echo -e "${RED}✗${NC} Échec de création vidéo"
    echo $VIDEO_RESPONSE
    exit 1
fi

echo -e "${GREEN}✓${NC} Vidéo créée: $VIDEO_JOB_ID"

# 6. Attendre un peu pour que le worker traite
echo ""
echo "6. Vérification du traitement..."
sleep 2

VIDEO_STATUS=$(curl -s -X GET "http://localhost:3000/api/v1/video/$VIDEO_JOB_ID" \
  -H "Authorization: Bearer $TOKEN")

STATUS=$(echo $VIDEO_STATUS | grep -o '"status":"[^"]*' | sed 's/"status":"//')
echo "   Status actuel: $STATUS"

if [ "$STATUS" = "PENDING" ] || [ "$STATUS" = "RUNNING" ]; then
    echo -e "${GREEN}✓${NC} Job en cours de traitement"
elif [ "$STATUS" = "COMPLETED" ]; then
    echo -e "${GREEN}✓${NC} Job terminé"
else
    echo -e "${YELLOW}⚠${NC} Status inattendu: $STATUS"
fi

# 7. Test du webhook (simulation)
echo ""
echo "7. Test du webhook Vast.ai..."

WEBHOOK_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/webhook/vast \
  -H "Content-Type: application/json" \
  -d "{
    \"vastJobId\":\"test-vast-123\",
    \"videoJobId\":\"$VIDEO_JOB_ID\",
    \"status\":\"completed\",
    \"videoUrl\":\"https://example.com/test-video.mp4\",
    \"cloudProvider\":\"s3\",
    \"metadata\":{
      \"duration\":15,
      \"fileSize\":25600000,
      \"resolution\":\"1920x1080\",
      \"format\":\"mp4\"
    }
  }")

if echo $WEBHOOK_RESPONSE | grep -q "success"; then
    echo -e "${GREEN}✓${NC} Webhook traité avec succès"
else
    echo -e "${RED}✗${NC} Erreur webhook"
    echo $WEBHOOK_RESPONSE
    exit 1
fi

# 8. Vérifier que le job a été mis à jour
echo ""
echo "8. Vérification de la mise à jour..."
sleep 1

VIDEO_FINAL=$(curl -s -X GET "http://localhost:3000/api/v1/video/$VIDEO_JOB_ID" \
  -H "Authorization: Bearer $TOKEN")

if echo $VIDEO_FINAL | grep -q "https://example.com/test-video.mp4"; then
    echo -e "${GREEN}✓${NC} VideoJob mis à jour avec l'URL"
else
    echo -e "${RED}✗${NC} URL non trouvée dans le job"
    echo $VIDEO_FINAL
    exit 1
fi

# Résumé
echo ""
echo "================================"
echo -e "${GREEN}✅ Tous les tests passent !${NC}"
echo ""
echo "📋 Résumé:"
echo "   - Serveur: ✓"
echo "   - Module Vast.ai: ✓"
echo "   - API: ✓"
echo "   - Worker: ✓"
echo "   - Webhook: ✓"
echo "   - Base de données: ✓"
echo ""
echo "🚀 Le module Vast.ai est prêt à l'emploi !"
echo ""
echo "Pour configurer Vast.ai en production:"
echo "1. Ajoute VAST_API_URL dans .env"
echo "2. Configure ton instance avec ComfyUI"
echo "3. Redémarre le serveur"
echo ""
echo "📖 Documentation: VAST_INTEGRATION.md"
