/**
 * Utilitaires pour la génération de scripts et prompts vidéo
 */

import { GENERATION_CONFIG } from '../shared/prompts.js';

export interface VisualStyleOptions {
    name: string;
    description: string;
    keywords: string[];
    negativePrompts?: string[];
}

/**
 * Styles visuels disponibles avec leurs caractéristiques
 */
export const VISUAL_STYLES_CATALOG: Record<string, VisualStyleOptions> = {
    MODERN: {
        name: 'Modern',
        description: 'Clean, contemporary design with sleek aesthetics',
        keywords: ['modern', 'sleek', 'contemporary', 'minimalist', 'clean lines', 'geometric'],
        negativePrompts: ['outdated', 'vintage', 'retro', 'old-fashioned']
    },
    CINEMATIC: {
        name: 'Cinematic',
        description: 'Movie-like quality with dramatic lighting and composition',
        keywords: ['cinematic', 'dramatic', 'film-like', 'epic', 'wide shots', 'depth of field'],
        negativePrompts: ['amateur', 'low production', 'flat lighting', 'poor composition']
    },
    PROFESSIONAL: {
        name: 'Professional',
        description: 'Corporate and business-oriented visual style',
        keywords: ['professional', 'corporate', 'business', 'clean', 'polished', 'formal'],
        negativePrompts: ['casual', 'messy', 'unprofessional', 'chaotic']
    },
    CREATIVE: {
        name: 'Creative',
        description: 'Artistic and imaginative with bold visual elements',
        keywords: ['creative', 'artistic', 'imaginative', 'colorful', 'abstract', 'innovative'],
        negativePrompts: ['boring', 'conventional', 'standard', 'plain']
    },
    DYNAMIC: {
        name: 'Dynamic',
        description: 'Energetic and movement-focused visuals',
        keywords: ['dynamic', 'energetic', 'motion', 'active', 'vibrant', 'fast-paced'],
        negativePrompts: ['static', 'slow', 'dull', 'monotonous']
    },
    MINIMAL: {
        name: 'Minimal',
        description: 'Simple and elegant with focus on essential elements',
        keywords: ['minimal', 'simple', 'elegant', 'clean', 'spacious', 'uncluttered'],
        negativePrompts: ['cluttered', 'busy', 'complex', 'overwhelming']
    }
};

/**
 * Fonctions utilitaires pour la génération
 */
export class ScriptGenerationUtils {
    
    /**
     * Calcule le nombre de mots optimal pour une durée donnée
     */
    static calculateWordCount(durationSeconds: number): number {
        return Math.round(durationSeconds * GENERATION_CONFIG.WORDS_PER_SECOND);
    }
    
    /**
     * Divise une durée en segments égaux
     */
    static calculateSegmentTimings(duration: number, segmentCount: number = 3): Array<{start: number, end: number}> {
        const segmentDuration = duration / segmentCount;
        return Array.from({ length: segmentCount }, (_, index) => ({
            start: Math.floor(index * segmentDuration),
            end: Math.floor((index + 1) * segmentDuration)
        }));
    }
    
    /**
     * Valide la structure d'un prompt vidéo
     */
    static validateVideoPrompt(prompt: any): boolean {
        return !!(
            prompt &&
            typeof prompt.scene === 'string' &&
            typeof prompt.positive === 'string' &&
            typeof prompt.negative === 'string' &&
            prompt.timing &&
            typeof prompt.timing.start === 'number' &&
            typeof prompt.timing.end === 'number'
        );
    }
    
    /**
     * Nettoie et normalise un texte de script
     */
    static cleanScriptText(text: string): string {
        return text
            .trim()
            .replace(/\s+/g, ' ') // Normalise les espaces
            .replace(/[""]/g, '"') // Normalise les guillemets
            .replace(/['']/g, "'") // Normalise les apostrophes
            .replace(/\n{3,}/g, '\n\n'); // Limite les sauts de ligne multiples
    }
    
    /**
     * Estime la durée de lecture d'un texte
     */
    static estimateReadingDuration(text: string): number {
        const wordCount = text.split(/\s+/).length;
        return Math.round(wordCount / GENERATION_CONFIG.WORDS_PER_SECOND);
    }
    
    /**
     * Génère des mots-clés de style combinés
     */
    static buildStyleKeywords(styleName: string, additionalKeywords: string[] = []): string {
        const style = VISUAL_STYLES_CATALOG[styleName.toUpperCase()];
        if (!style) {
            return additionalKeywords.join(', ');
        }
        
        return [...style.keywords, ...additionalKeywords].join(', ');
    }
    
    /**
     * Génère des prompts négatifs combinés
     */
    static buildNegativePrompts(styleName?: string, additionalNegatives: string[] = []): string {
        const baseNegatives = GENERATION_CONFIG.DEFAULT_NEGATIVE_PROMPTS.split(', ');
        let styleNegatives: string[] = [];
        
        if (styleName) {
            const style = VISUAL_STYLES_CATALOG[styleName.toUpperCase()];
            styleNegatives = style?.negativePrompts || [];
        }
        
        return [...baseNegatives, ...styleNegatives, ...additionalNegatives]
            .filter((item, index, arr) => arr.indexOf(item) === index) // Supprime les doublons
            .join(', ');
    }
    
    /**
     * Valide les paramètres d'entrée pour la génération
     */
    static validateGenerationInput(input: any): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];
        
        if (input.duration && (input.duration < 5 || input.duration > 300)) {
            errors.push('Duration must be between 5 and 300 seconds');
        }
        
        if (input.topic && input.topic.length > 200) {
            errors.push('Topic must be less than 200 characters');
        }
        
        if (input.tone && input.tone.length > 100) {
            errors.push('Tone must be less than 100 characters');
        }
        
        if (input.visualStyle && !VISUAL_STYLES_CATALOG[input.visualStyle.toUpperCase()]) {
            errors.push(`Visual style "${input.visualStyle}" is not supported. Available styles: ${Object.keys(VISUAL_STYLES_CATALOG).join(', ')}`);
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

/**
 * Types pour l'export
 */
export type VisualStyleName = keyof typeof VISUAL_STYLES_CATALOG;