/**
 * Exemple d'utilisation du nouveau système de génération de script modulaire
 * 
 * Pour tester :
 * 1. Assure-toi d'avoir une clé OpenAI dans ton .env : OPENAI_API_KEY=sk-...
 * 2. Lance : npx tsx example-openai-script.js
 */

import { generateScript } from './src/modules/ai/script/script.service.ts';
import { VISUAL_STYLES_CATALOG } from './src/modules/ai/script/script.utils.ts';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

async function testModularScriptGeneration() {
    console.log('Testing modular script generation with OpenAI...\n');

    try {
        // Exemple 1: Génération modulaire (recommandé)
        console.log('=== Test 1: Génération modulaire ===');
        const result1 = await generateScript({
            topic: 'intelligence artificielle',
            tone: 'éducatif et captivant',
            duration: 15,
            visualStyle: 'cinematic',
            useModularGeneration: true
        });

        console.log('Script généré:');
        console.log(`Texte (${result1.text.length} caractères):`, result1.text);
        console.log(`Durée:`, result1.duration, 'secondes');
        console.log(`Prompts vidéo (${result1.videoPrompts.length}):`);
        result1.videoPrompts.forEach((prompt, index) => {
            console.log(`  ${index + 1}. ${prompt.scene} (${prompt.timing.start}-${prompt.timing.end}s)`);
            console.log(`     Positive: ${prompt.positive.substring(0, 80)}...`);
            console.log(`     Negative: ${prompt.negative}`);
        });

        console.log('\n' + '='.repeat(80) + '\n');

        // Exemple 2: Génération combinée (fallback)
        console.log('=== Test 2: Génération combinée ===');
        const result2 = await generateScript({
            topic: 'développement web moderne',
            tone: 'dynamique et professionnel',
            duration: 20,
            visualStyle: 'modern',
            useModularGeneration: false
        });

        console.log('Script marketing généré:');
        console.log(`Texte:`, result2.text);
        console.log(`Prompts (${result2.videoPrompts.length}):`);
        result2.videoPrompts.forEach((prompt, index) => {
            console.log(`  ${index + 1}. ${prompt.scene}`);
        });

        console.log('\n' + '='.repeat(80) + '\n');

        // Exemple 3: Test des différents styles visuels
        console.log('=== Test 3: Styles visuels disponibles ===');
        console.log('Styles supportés:');
        Object.entries(VISUAL_STYLES_CATALOG).forEach(([key, style]) => {
            console.log(`  ${key}: ${style.description}`);
            console.log(`    Keywords: ${style.keywords.join(', ')}`);
        });

        console.log('\n' + '='.repeat(80) + '\n');

        // Exemple 4: Test avec style minimal
        console.log('=== Test 4: Style minimal ===');
        const result4 = await generateScript({
            topic: 'méditation et bien-être',
            tone: 'calme et inspirant',
            duration: 12,
            visualStyle: 'minimal',
            useModularGeneration: true
        });

        console.log('Script style minimal:');
        console.log(result4.text);
        console.log('\nPremier prompt vidéo:');
        console.log(`Scene: ${result4.videoPrompts[0]?.scene}`);
        console.log(`Positive: ${result4.videoPrompts[0]?.positive}`);

    } catch (error) {
        console.error('Erreur lors du test:', error.message);
        
        if (error.message.includes('OpenAI API key')) {
            console.log('\nConseil: Ajoute ta clé OpenAI dans le fichier .env:');
            console.log('OPENAI_API_KEY=sk-ton-api-key-ici');
        }
    }
}

async function testValidation() {
    console.log('\n=== Test 5: Validation des paramètres ===');
    
    try {
        // Test avec durée invalide
        await generateScript({
            topic: 'test',
            duration: 500, // Trop long
            useModularGeneration: true
        });
    } catch (error) {
        console.log('Validation correcte pour durée excessive');
    }
    
    try {
        // Test avec style invalide
        await generateScript({
            topic: 'test',
            visualStyle: 'inexistant',
            useModularGeneration: true
        });
        console.log('Style invalide accepté - fallback utilisé');
    } catch (error) {
        console.log('Gestion d\'erreur pour style invalide:', error.message);
    }
}

// Lancer les tests
console.log('🤖 Tests de génération de script modulaire\n');
testModularScriptGeneration()
    .then(() => testValidation())
    .catch(console.error);