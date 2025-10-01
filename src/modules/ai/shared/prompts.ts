/**
 * Configuration des prompts pour la génération de contenu OpenAI
 */

export const PROMPTS = {
  // Prompt principal pour la génération de script
  SCRIPT_GENERATION: `Tu es un expert en création de contenu vidéo. Génère un script vidéo de {duration} secondes sur le sujet "{topic}" avec un ton {tone}.

Le script doit être:
- Naturel et fluide pour la narration
- Engageant et captivant
- Adapté à la durée demandée (environ {wordCount} mots)
- Cohérent du début à la fin

Réponds uniquement avec le texte du script, sans formatage supplémentaire.`,

  // Prompt pour la génération des prompts vidéo
  VIDEO_PROMPTS_GENERATION: `Tu es un expert en génération d'images IA et en création de prompts visuels.

À partir de ce script vidéo:
"{script}"

Et de ces directives:
- Sujet: {topic}
- Ton: {tone}
- Durée: {duration} secondes
- Style visuel: {visualStyle}

Génère exactement 3 prompts vidéo au format WAN 2.2 pour accompagner ce script.

Chaque prompt doit couvrir {segmentDuration} secondes et être parfaitement synchronisé.

Format de réponse attendu (JSON strict):
{
  "videoPrompts": [
    {
      "scene": "Description de la scène",
      "positive": "prompt positif détaillé pour WAN 2.2, style {visualStyle}",
      "negative": "low quality, blurry, distorted, ugly, bad anatomy, text, watermark",
      "timing": { "start": 0, "end": {segmentDuration} }
    },
    {
      "scene": "Description de la scène",
      "positive": "prompt positif détaillé pour WAN 2.2, style {visualStyle}",
      "negative": "low quality, blurry, distorted, ugly, bad anatomy, text, watermark",
      "timing": { "start": {segmentDuration}, "end": {segmentDuration2} }
    },
    {
      "scene": "Description de la scène",
      "positive": "prompt positif détaillé pour WAN 2.2, style {visualStyle}",
      "negative": "low quality, blurry, distorted, ugly, bad anatomy, text, watermark",
      "timing": { "start": {segmentDuration2}, "end": {duration} }
    }
  ]
}

Critères pour les prompts positifs:
- Détaillés et spécifiques pour WAN 2.2
- Cohérents avec le script et le ton
- Visuellement riches et engageants
- Style {visualStyle} bien intégré`,

  // Prompt combiné (fallback pour compatibilité)
  COMBINED_GENERATION: `Génère un script vidéo de {duration} secondes sur le sujet "{topic}" avec un ton {tone}.

Le script doit être structuré comme suit :
1. Un texte narratif fluide et engageant de {duration} secondes (environ {wordCount} mots)
2. 3 prompts vidéo pour générer les images avec WAN 2.2

Format de réponse attendu (JSON strict) :
{
  "text": "Le script narratif complet...",
  "videoPrompts": [
    {
      "scene": "Description de la scène",
      "positive": "prompt positif détaillé pour WAN 2.2",
      "negative": "éléments à éviter (low quality, blurry, distorted)",
      "timing": { "start": 0, "end": {segmentDuration} }
    },
    {
      "scene": "Description de la scène",
      "positive": "prompt positif détaillé pour WAN 2.2", 
      "negative": "éléments à éviter (low quality, blurry, distorted)",
      "timing": { "start": {segmentDuration}, "end": {segmentDuration2} }
    },
    {
      "scene": "Description de la scène",
      "positive": "prompt positif détaillé pour WAN 2.2",
      "negative": "éléments à éviter (low quality, blurry, distorted)", 
      "timing": { "start": {segmentDuration2}, "end": {duration} }
    }
  ]
}

Critères importants :
- Le script doit être naturel et fluide pour la narration
- Les prompts positifs doivent être détaillés et spécifiques pour WAN 2.2
- Les prompts négatifs doivent inclure les défauts typiques à éviter
- Le timing doit couvrir exactement {duration} secondes
- Utilise un vocabulaire riche et varié`
};

export const GENERATION_CONFIG = {
  // Configuration OpenAI par défaut
  DEFAULT_MODEL: 'gpt-4o-mini',
  DEFAULT_MAX_TOKENS: 1000,
  DEFAULT_TEMPERATURE: 0.7,
  
  // Calculs de timing
  WORDS_PER_SECOND: 2.5,
  SEGMENTS_COUNT: 3,
  
  // Styles visuels disponibles
  VISUAL_STYLES: {
    MODERN: 'modern and sleek',
    CINEMATIC: 'cinematic and dramatic',
    PROFESSIONAL: 'professional and clean',
    CREATIVE: 'creative and artistic',
    DYNAMIC: 'dynamic and energetic',
    MINIMAL: 'minimal and elegant'
  },
  
  // Prompts négatifs par défaut
  DEFAULT_NEGATIVE_PROMPTS: 'low quality, blurry, distorted, ugly, bad anatomy, text, watermark, deformed'
};