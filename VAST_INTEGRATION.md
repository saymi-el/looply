# 🚀 Module Vast.ai - Documentation

## Vue d'ensemble

Le module Vast.ai permet de déléguer la génération vidéo à une instance Vast.ai équipée de ComfyUI. Cette approche offre une génération vidéo haute qualité et scalable.

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│   OpenAI    │─────>│  Looply API  │─────>│  Vast.ai        │
│  GPT-4o     │      │   (Script)   │      │  + ComfyUI      │
└─────────────┘      └──────────────┘      └─────────────────┘
                            ↑                        │
                            │                        │
                            │     Webhook            │
                            └────────────────────────┘
                                  (Video URL)
```

## Flux de traitement

### 1. Génération du script
```typescript
const script = await generateScript({
  topic: "intelligence artificielle",
  tone: "éducatif",
  duration: 15,
  visualStyle: "cinematic"
});
```

Résultat:
- Script texte narratif
- Liste de prompts vidéo (positive/negative pour chaque scène)

### 2. Envoi à Vast.ai

Le worker détecte automatiquement si Vast.ai est configuré:

```typescript
if (isVastConfigured()) {
  await vastService.sendToVast(
    videoJobId,
    duration,
    videoPrompts,
    webhookUrl
  );
}
```

Payload envoyé:
```json
{
  "videoJobId": "cmfy11uyf0000p6h3kxfq9604",
  "duration": 15,
  "videoPrompts": [
    {
      "scene": "Description de la scène",
      "positive": "A cinematic view of...",
      "negative": "low quality, blurry, distorted...",
      "timing": { "start": 0, "end": 5 }
    }
  ],
  "webhookUrl": "https://your-domain.com/api/v1/webhook/vast"
}
```

### 3. Traitement ComfyUI sur Vast.ai

L'instance Vast.ai:
1. Reçoit les prompts vidéo
2. Génère la vidéo avec ComfyUI
3. Upload la vidéo sur S3 (ou autre cloud)
4. Appelle le webhook avec les résultats

### 4. Réception du webhook

Endpoint: `POST /api/v1/webhook/vast`

Payload attendu:
```json
{
  "vastJobId": "vast-job-123",
  "videoJobId": "cmfy11uyf0000p6h3kxfq9604",
  "status": "completed",
  "videoUrl": "https://s3.amazonaws.com/bucket/video.mp4",
  "cloudProvider": "s3",
  "metadata": {
    "duration": 15,
    "fileSize": 25600000,
    "resolution": "1920x1080",
    "format": "mp4"
  }
}
```

Le webhook met à jour automatiquement le `VideoJob` avec:
- Status: `COMPLETED` ou `FAILED`
- `videoUrl`: URL de la vidéo finale
- `vastJobId`: ID du job Vast.ai
- `cloudProvider`: Type de stockage utilisé
- `metadata`: Informations sur la vidéo

## Configuration

### Variables d'environnement

```bash
# Required: URL de votre instance Vast.ai
VAST_API_URL="http://your-vast-instance:8000"

# Optional: Clé API pour sécuriser les requêtes
VAST_API_KEY="your-api-key"

# Optional: Secret pour vérifier les webhooks
VAST_WEBHOOK_SECRET="your-webhook-secret"
```

### Vérifier la configuration

```typescript
import { isVastConfigured } from './modules/vast';

if (isVastConfigured()) {
  console.log('✅ Vast.ai is configured');
} else {
  console.log('⚠️ Vast.ai not configured, using fallback pipeline');
}
```

## Mode de fonctionnement

### Avec Vast.ai configuré

1. Script généré par OpenAI
2. **Prompts envoyés à Vast.ai**
3. Worker attend le webhook
4. Webhook met à jour le VideoJob

### Sans Vast.ai (fallback)

1. Script généré par OpenAI
2. **Audio généré localement** (ElevenLabs/autre)
3. **Visuels générés localement** (Stable Diffusion/WAN)
4. **Assemblage vidéo** (Shotstack)

## Structure de la base de données

### Nouveaux champs dans `VideoJob`

```prisma
model VideoJob {
  // ... champs existants
  
  videoUrl      String?  // URL de la vidéo finale (S3, etc.)
  vastJobId     String?  // ID du job Vast.ai
  cloudProvider String?  // Type de stockage: "s3", "gcs", etc.
  metadata      String?  // JSON avec infos sur la vidéo
}
```

## Sécurité du webhook

Le webhook vérifie la signature pour s'assurer que la requête vient bien de Vast.ai:

```typescript
const signature = request.headers['x-vast-signature'];
if (!vastService.verifyWebhookSignature(payload, signature)) {
  return reply.code(401).send({ error: 'Invalid signature' });
}
```

## Exemple d'utilisation

### 1. Créer une vidéo

```bash
curl -X POST http://localhost:3000/api/v1/video \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "platform": "intelligence artificielle",
    "tone": "éducatif",
    "duration": 15
  }'
```

### 2. Le système envoie automatiquement à Vast.ai

Le worker détecte la configuration et envoie les prompts.

### 3. Vast.ai traite et renvoie le résultat

Quand la vidéo est prête, Vast.ai appelle:

```bash
curl -X POST https://your-domain.com/api/v1/webhook/vast \
  -H "Content-Type: application/json" \
  -H "x-vast-signature: YOUR_SIGNATURE" \
  -d '{
    "vastJobId": "vast-123",
    "videoJobId": "cmfy11uyf0000p6h3kxfq9604",
    "status": "completed",
    "videoUrl": "https://s3.amazonaws.com/bucket/video.mp4"
  }'
```

### 4. Récupérer la vidéo

```bash
curl -X GET http://localhost:3000/api/v1/video/cmfy11uyf0000p6h3kxfq9604 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Réponse:
```json
{
  "id": "cmfy11uyf0000p6h3kxfq9604",
  "status": "COMPLETED",
  "progress": 100,
  "videoUrl": "https://s3.amazonaws.com/bucket/video.mp4",
  "vastJobId": "vast-123",
  "cloudProvider": "s3",
  "metadata": "{\"duration\":15,\"fileSize\":25600000}"
}
```

## Tests et développement

### Mode mock (sans instance Vast.ai)

Si `VAST_API_URL` n'est pas défini, le service retourne une réponse mock:

```typescript
{
  success: true,
  vastJobId: "mock-vast-cmfy11uyf0000p6h3kxfq9604",
  message: "Mock response - Vast.ai not configured"
}
```

### Simuler un webhook

```bash
curl -X POST http://localhost:3000/api/v1/webhook/vast \
  -H "Content-Type: application/json" \
  -d '{
    "vastJobId": "test-123",
    "videoJobId": "YOUR_VIDEO_JOB_ID",
    "status": "completed",
    "videoUrl": "https://example.com/test-video.mp4",
    "cloudProvider": "s3"
  }'
```

## Prochaines étapes

Quand l'instance Vast.ai sera prête:

1. **Configurer l'instance**
   - Installer ComfyUI
   - Configurer l'API endpoint
   - Setup S3 ou autre cloud storage

2. **Ajouter les variables d'environnement**
   ```bash
   VAST_API_URL="http://your-vast-instance:8000"
   VAST_API_KEY="your-key"
   VAST_WEBHOOK_SECRET="your-secret"
   ```

3. **Tester l'intégration**
   - Créer une vidéo de test
   - Vérifier les logs
   - Valider le webhook

4. **Déployer en production**
   - Configurer le domaine public pour le webhook
   - Activer la signature des webhooks
   - Monitorer les performances

## Logs et monitoring

Le module log toutes les étapes importantes:

```typescript
// Envoi à Vast.ai
[INFO] Sending video generation request to Vast.ai
  videoJobId: "cmfy11uyf0000p6h3kxfq9604"
  duration: 15
  promptsCount: 3

// Réception du webhook
[INFO] Received Vast.ai webhook
  vastJobId: "vast-123"
  videoJobId: "cmfy11uyf0000p6h3kxfq9604"
  status: "completed"

// Mise à jour du job
[INFO] Video job completed successfully
  videoJobId: "cmfy11uyf0000p6h3kxfq9604"
  videoUrl: "https://s3.amazonaws.com/bucket/video.mp4"
```

## Troubleshooting

### Erreur: "Vast.ai not configured"

✅ Solution: Ajouter `VAST_API_URL` dans `.env`

### Webhook non reçu

✅ Vérifier:
- L'URL du webhook est accessible publiquement
- Le firewall autorise les requêtes entrantes
- Les logs de l'instance Vast.ai

### Signature invalide

✅ Solution: Vérifier que `VAST_WEBHOOK_SECRET` correspond sur les deux côtés

---

**Module prêt à être branché !** 🎉

Une fois l'instance Vast.ai configurée, tout fonctionnera automatiquement.
