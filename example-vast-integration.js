/**
 * Exemple d'utilisation du module Vast.ai
 * 
 * Ce script montre comment tester l'intégration Vast.ai
 */

import { vastService, isVastConfigured } from './src/modules/vast/index.ts';

console.log('🎬 Test du module Vast.ai\n');

// 1. Vérifier la configuration
console.log('=== Configuration ===');
console.log(`Vast.ai configuré: ${isVastConfigured() ? '✅ Oui' : '⚠️ Non (mode mock)'}\n`);

// 2. Exemple de prompts vidéo (généré par OpenAI)
const videoPrompts = [
  {
    scene: "Un laboratoire futuriste avec des chercheurs",
    positive: "A cinematic view of a futuristic laboratory, showcasing researchers in lab coats interacting with holographic interfaces and complex data visualizations, professional lighting, high-tech environment, 4k quality",
    negative: "low quality, blurry, distorted, ugly, bad anatomy, text, watermark",
    timing: { start: 0, end: 5 }
  },
  {
    scene: "Montage illustrant l'impact de l'IA",
    positive: "A cinematic montage illustrating the impact of AI in various sectors, featuring doctors using AI diagnostic tools, students learning with adaptive educational software, high quality, professional",
    negative: "low quality, blurry, distorted, ugly, bad anatomy, text, watermark",
    timing: { start: 5, end: 10 }
  },
  {
    scene: "Vue panoramique d'une ville intelligente",
    positive: "A panoramic cinematic view of a smart city, showcasing drones flying overhead, autonomous vehicles on clean streets, modern infrastructure with green spaces, futuristic architecture, 4k quality",
    negative: "low quality, blurry, distorted, ugly, bad anatomy, text, watermark",
    timing: { start: 10, end: 15 }
  }
];

// 3. Test d'envoi à Vast.ai
console.log('=== Test d\'envoi à Vast.ai ===');

const testVideoJobId = 'test-' + Date.now();
const webhookUrl = 'http://localhost:3000/api/v1/webhook/vast';

try {
  const response = await vastService.sendToVast(
    testVideoJobId,
    15,
    videoPrompts,
    webhookUrl
  );

  console.log('✅ Requête envoyée avec succès!');
  console.log(`Vast Job ID: ${response.vastJobId}`);
  console.log(`Message: ${response.message}`);
  if (response.estimatedCompletionTime) {
    console.log(`Temps estimé: ${response.estimatedCompletionTime}s`);
  }
  console.log();

  // 4. Simulation d'un webhook (pour tester)
  if (!isVastConfigured()) {
    console.log('=== Simulation de webhook ===');
    console.log('Pour tester le webhook en local, exécute:');
    console.log();
    console.log(`curl -X POST http://localhost:3000/api/v1/webhook/vast \\
  -H "Content-Type: application/json" \\
  -d '{
    "vastJobId": "${response.vastJobId}",
    "videoJobId": "${testVideoJobId}",
    "status": "completed",
    "videoUrl": "https://example.com/test-video.mp4",
    "cloudProvider": "s3",
    "metadata": {
      "duration": 15,
      "fileSize": 25600000,
      "resolution": "1920x1080",
      "format": "mp4"
    }
  }'`);
    console.log();
  }

  // 5. Informations pour la configuration
  console.log('=== Configuration Vast.ai ===');
  console.log('Pour activer Vast.ai, ajoute ces variables dans ton .env:');
  console.log();
  console.log('VAST_API_URL="http://your-vast-instance:8000"');
  console.log('VAST_API_KEY="your-api-key" # Optionnel');
  console.log('VAST_WEBHOOK_SECRET="your-secret" # Optionnel');
  console.log();
  console.log('Le webhook recevra les résultats à: ' + webhookUrl);

} catch (error) {
  console.error('❌ Erreur:', error instanceof Error ? error.message : error);
}

console.log();
console.log('✨ Test terminé!');
