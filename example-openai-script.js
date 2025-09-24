/**
 * Exemple d'utilisation du nouveau système de génération de script avec OpenAI
 * 
 * Pour tester :
 * 1. Assure-toi d'avoir une clé OpenAI dans ton .env : OPENAI_API_KEY=sk-...
 * 2. Lance : node example-openai-script.js
 */

import { generateScript } from './src/modules/ai/script.service.ts';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

async function testOpenAIScript() {
    console.log('🤖 Test de génération de script avec OpenAI...\n');

    try {
        // Exemple 1: Script simple
        console.log('📝 Génération d\'un script sur l\'IA...');
        const result1 = await generateScript({
            topic: 'intelligence artificielle',
            tone: 'éducatif et enthousiaste',
            duration: 15
        });

        console.log('✅ Script généré:');
        console.log(`📄 Texte (${result1.text.length} caractères):`, result1.text);
        console.log(`⏱️  Durée:`, result1.duration, 'secondes');
        console.log(`🎬 Prompts vidéo (${result1.videoPrompts.length}):`, JSON.stringify(result1.videoPrompts, null, 2));

        console.log('\n' + '='.repeat(80) + '\n');

        // Exemple 2: Script marketing
        console.log('📝 Génération d\'un script marketing...');
        const result2 = await generateScript({
            topic: 'développement web moderne',
            tone: 'dynamique et professionnel',
            duration: 15
        });

        console.log('✅ Script marketing généré:');
        console.log(`📄 Texte:`, result2.text);
        console.log(`🎬 Prompts WAN 2.2:`, 
            result2.videoPrompts.map(p => ({
                scene: p.scene,
                timing: p.timing,
                positive: p.positive.substring(0, 100) + '...',
                negative: p.negative
            }))
        );

    } catch (error) {
        console.error('❌ Erreur lors du test:', error.message);
        
        if (error.message.includes('OpenAI API key')) {
            console.log('\n💡 Conseil: Ajoute ta clé OpenAI dans le fichier .env:');
            console.log('OPENAI_API_KEY=sk-ton-api-key-ici');
        }
    }
}

// Lancer le test
testOpenAIScript().catch(console.error);