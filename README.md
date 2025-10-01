# Looply - SaaS de Génération de Vidéos IA

## Aperçu

**Looply** est une plateforme SaaS qui génère automatiquement des vidéos personnalisées en utilisant l'intelligence artificielle. Transformez simplement un sujet et un ton en vidéo complète avec script, audio, visuels et assemblage automatique.

**Stack technique :** Node.js + TypeScript + Fastify + OpenAI GPT-4o-mini + PostgreSQL + Redis + Docker

## 📚 Documentation

- **[API Reference](API.md)** - Tous les endpoints avec exemples détaillés
- **[Vast.ai Integration](VAST_INTEGRATION.md)** - Guide d'intégration ComfyUI
- **[Project Status](STATUS.md)** - État actuel et fonctionnalités

## Fonctionnalités principales

- **Génération de scripts intelligents** avec OpenAI GPT-4o-mini
- **Intégration Vast.ai** pour génération vidéo haute qualité avec ComfyUI
- **Pipeline asynchrone** avec Redis et BullMQ
- **Authentification JWT** sécurisée
- **Webhook système** pour recevoir les vidéos finales
- **Fallback local** si Vast.ai n'est pas configuré (ElevenLabs, Shotstack)

## 🚀 Démarrage rapide

```bash
# 1. Installation
git clone <repo>
cd Looply
npm install

# 2. Configuration 
cp .env.example .env
# Éditer .env avec ta clé OpenAI et autres configs

# 3. Démarrer les services Docker
docker-compose up -d

# 4. Migrer la base de données
npx prisma migrate deploy

# 5. Démarrer l'application
npm run dev     # API (terminal 1)
npm run worker  # Worker vidéo (terminal 2)
```

**URLs :**
- API : http://localhost:3000
- Swagger : http://localhost:3000/docs
- PostgreSQL : localhost:5433
- Redis : localhost:6380

## 📝 Test rapide

```bash
# 1. Créer un compte
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123456"}'

# 2. Se connecter
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123456"}'

# 3. Générer une vidéo (utilise le token reçu)
curl -X POST http://localhost:3000/api/v1/video \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"platform": "IA", "tone": "éducatif", "duration": 15}'
```

## Structure du projet

```
src/
├── app/
│   ├── server.ts          # Bootstrap Fastify
│   └── routes.ts          # Montage des routes
├── config/
│   ├── env.ts             # Validation .env (Zod)
│   ├── logger.ts          # Logger Pino
│   ├── db.ts              # Client Prisma
│   └── queue.ts           # Connexion BullMQ
├── modules/
│   ├── auth/              # Authentification JWT
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.routes.ts
│   │   └── jwt.middleware.ts
│   ├── profile/           # Gestion profils utilisateurs
│   │   ├── profile.controller.ts
│   │   ├── profile.service.ts
│   │   └── profile.routes.ts
│   ├── video/             # Gestion des vidéos
│   │   ├── video.controller.ts
│   │   ├── video.service.ts
│   │   ├── video.routes.ts
│   │   └── video.model.ts
│   ├── vast/              # Intégration Vast.ai
│   │   ├── vast.service.ts      # Service principal
│   │   ├── vast.config.ts       # Configuration
│   │   └── vast.types.ts        # Types TypeScript
│   ├── webhook/           # Webhooks externes
│   │   └── webhook.routes.ts    # Endpoint Vast.ai
│   ├── ai/                # Services d'IA (modularisé)
│   │   ├── script/              # Génération scripts
│   │   │   ├── script.service.ts
│   │   │   └── script.utils.ts
│   │   ├── audio/               # Synthèse vocale
│   │   │   └── audio.service.ts
│   │   ├── visual/              # Génération images
│   │   │   └── model.service.ts
│   │   ├── video/               # Assemblage vidéo
│   │   │   └── shotstack.service.ts
│   │   └── shared/              # Configuration partagée
│   │       └── prompts.ts
│   └── system/            # Routes système
│       └── system.routes.ts
└── workers/
    └── video.worker.ts    # Worker de traitement vidéo
```

## 🎬 Pipeline de génération

### Avec Vast.ai (recommandé)

```mermaid
graph LR
    A[User] --> B[OpenAI Script]
    B --> C[Vast.ai + ComfyUI]
    C --> D[S3 Storage]
    D --> E[Webhook]
    E --> F[Video URL]
```

1. **Script (OpenAI)** - Génération du texte + prompts visuels WAN 2.2
2. **Vast.ai** - Envoi des prompts à l'instance ComfyUI
3. **Génération** - ComfyUI crée la vidéo
4. **Upload** - Vidéo stockée sur S3
5. **Callback** - Webhook avec l'URL finale

📖 **[Guide Vast.ai complet](VAST_INTEGRATION.md)**

### Fallback local (si Vast.ai non configuré)

```mermaid
graph LR
    A[User] --> B[OpenAI Script]
    B --> C[Audio Service]
    C --> D[Visual Service]
    D --> E[Video Assembly]
    E --> F[Final Video]
```

Le système bascule automatiquement sur le pipeline local si `VAST_API_URL` n'est pas configuré.

## API Endpoints principaux

### Authentification
- `POST /api/v1/auth/signup` - Inscription
- `POST /api/v1/auth/login` - Connexion

### Profil
- `GET /api/v1/profile` - Récupérer profil
- `PUT /api/v1/profile` - Modifier profil

### Génération vidéo
- `POST /api/v1/video` - Créer une vidéo
- `GET /api/v1/video/:id` - Statut de génération
- `GET /api/v1/video` - Liste des vidéos

### Webhooks
- `POST /api/v1/webhook/vast` - Callback Vast.ai (vidéo terminée)

### Système
- `GET /api/v1/system/health` - Health check

## Base de données

**Tables Prisma :**
- `User` - Comptes utilisateurs
- `Profile` - Profils utilisateurs étendus
- `VideoJob` - Jobs de génération vidéo

**Statuts des jobs :**
- `PENDING` - En attente
- `RUNNING` - En cours
- `COMPLETED` - Terminé
- `FAILED` - Échec

## 📦 Configuration

### Variables d'environnement essentielles

```bash
# Serveur
PORT=3000
NODE_ENV=development

# Base de données
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/video_saas"

# Redis
REDIS_URL="redis://localhost:6380"

# Sécurité  
JWT_SECRET="your-super-secret-key"
CORS_ORIGIN="http://localhost:3000"

# OpenAI (requis pour génération de scripts)
OPENAI_API_KEY="sk-your-key"

# Vast.ai (optionnel - pour génération vidéo haute qualité)
VAST_API_URL="http://your-vast-instance:8000"
VAST_API_KEY="your-api-key"
VAST_WEBHOOK_SECRET="your-secret"
```

Voir `.env.example` pour la liste complète.

## Exemple de génération

**Input :**
```json
{
  "platform": "intelligence artificielle",
  "tone": "éducatif et captivant", 
  "duration": 15
}
```

**Output OpenAI :**
```json
{
  "text": "L'innovation technologique transforme notre quotidien! Imaginez un monde où chaque idée devient réalité...",
  "videoPrompts": [
    {
      "scene": "Un globe terrestre animé avec des circuits électroniques illuminés",
      "positive": "Un globe terrestre en 3D entouré de circuits électroniques lumineux, symbolisant l'innovation mondiale, couleurs vives et dynamique, style futuriste",
      "negative": "éviter les images floues, peu détaillées ou de mauvaise qualité",
      "timing": { "start": 0, "end": 5 }
    }
  ]
}
```

## 🧪 Tests et développement

```bash
# Test module OpenAI
npx tsx example-openai-script.js

# Test module Vast.ai
npx tsx example-vast-integration.js

# Test complet de l'intégration
./test-vast-integration.sh

# Compilation TypeScript
npm run build

# Logs en temps réel
npm run dev     # API avec logs détaillés
npm run worker  # Worker avec traçabilité complète
```

## 🔧 Commandes utiles

```bash
# Migrations Prisma
npx prisma migrate dev          # Créer une migration
npx prisma migrate deploy       # Appliquer les migrations
npx prisma generate             # Régénérer le client

# Base de données
npx prisma studio              # Interface graphique DB

# Docker
docker-compose up -d           # Démarrer services
docker-compose down            # Arrêter services
docker-compose logs -f         # Logs des containers
```

## 🚀 État du projet

### ✅ Fonctionnalités opérationnelles
- Architecture Fastify + TypeScript + Prisma
- Authentification JWT complète
- Génération de scripts avec OpenAI GPT-4o-mini
- Prompts vidéo WAN 2.2 structurés
- Module Vast.ai prêt à brancher
- Pipeline asynchrone avec BullMQ
- Webhook pour réception des vidéos
- Base de données PostgreSQL + migrations
- Logs détaillés et monitoring
- Documentation API Swagger

### 🔄 Pipeline vidéo
- **Vast.ai** : Envoi des prompts → ComfyUI → S3 → Webhook
- **Fallback** : Audio local → Visuels → Assemblage

### 📖 Documentation
Voir **[STATUS.md](STATUS.md)** pour l'état complet et détaillé.

---

**Looply v1.0** - Octobre 2025