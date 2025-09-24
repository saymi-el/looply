# 🎬 Looply - SaaS de Génération de Vidéos IA

## 🚀 Aperçu

**Looply** est une plateforme SaaS qui génère automatiquement des vidéos personnalisées en utilisant l'intelligence artificielle. Transformez simplement un sujet et un ton en vidéo complète avec script, audio, visuels et assemblage automatique.

**Stack technique :** Node.js + TypeScript + Fastify + OpenAI GPT-4o-mini + PostgreSQL + Redis + Docker

## 📚 Documentation complète

- **📖 [Documentation générale](DOCUMENTATION.md)** - Architecture complète, modules et fonctionnalités
- **🚀 [Guide de démarrage rapide](QUICK_START.md)** - Installation et premiers tests en 5 minutes  
- **🔌 [Documentation API](API.md)** - Tous les endpoints avec exemples détaillés

## ✨ Fonctionnalités principales

- 🤖 **Génération de scripts intelligents** avec OpenAI GPT-4o-mini
- 🎙️ **Synthèse vocale automatique** (ElevenLabs - en cours)
- 🎨 **Génération d'assets visuels** avec prompts WAN 2.2 (en cours)
- 🎞️ **Assemblage vidéo automatique** via Shotstack (en cours)
- 🔄 **Pipeline asynchrone** avec Redis et BullMQ
- 🔐 **Authentification JWT** sécurisée
- 📊 **API REST complète** avec Swagger UI

## ⚡ Démarrage rapide

```bash
# 1. Installation
git clone <repo>
cd Looply
npm install

# 2. Configuration 
cp .env.example .env
# Éditer .env avec vos clés API

# 3. Services
sudo docker-compose up -d
npx prisma migrate deploy

# 4. Démarrage
npm run dev     # API (terminal 1)
npm run worker  # Worker (terminal 2)
```

**URLs importantes :**
- API : http://localhost:3000
- Swagger UI : http://localhost:3000/docs
- PostgreSQL : localhost:5433
- Redis : localhost:6380

## 📂 Structure du projet

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
│   ├── ai/                # Services d'IA
│   │   ├── script.service.ts    # Génération scripts OpenAI
│   │   ├── audio.service.ts     # Synthèse vocale (TODO)
│   │   ├── model.service.ts     # Génération images (TODO)
│   │   └── shotstack.service.ts # Assemblage vidéo (TODO)
│   └── system/            # Routes système
│       └── system.routes.ts
└── workers/
    └── video.worker.ts    # Worker de traitement vidéo
```

## 🎥 Pipeline de génération vidéo

```mermaid
graph LR
    A[Requête utilisateur] --> B[Génération script OpenAI]
    B --> C[Synthèse vocale]
    C --> D[Génération visuels WAN 2.2]
    D --> E[Assemblage Shotstack]
    E --> F[Vidéo finale]
```

**Étapes détaillées :**

1. **📝 Script (0→20%)** - OpenAI génère un script narratif + 3 prompts visuels WAN 2.2
2. **🔊 Audio (20→45%)** - Conversion texte vers parole avec ElevenLabs
3. **🎨 Visuels (45→70%)** - Génération d'images synchronisées avec WAN 2.2
4. **🎞️ Assemblage (70→100%)** - Montage final avec Shotstack

## 🔧 API Endpoints principaux

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

### Système
- `GET /api/v1/system/health` - Health check

## 🗄️ Base de données

**Tables Prisma :**
- `User` - Comptes utilisateurs
- `Profile` - Profils utilisateurs étendus
- `VideoJob` - Jobs de génération vidéo

**Statuts des jobs :**
- `PENDING` - En attente
- `RUNNING` - En cours
- `COMPLETED` - Terminé
- `FAILED` - Échec

## 🔑 Variables d'environnement

```bash
# Serveur
PORT=3000
NODE_ENV=development

# Base de données
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/video_saas?schema=public"

# Redis
REDIS_URL="redis://localhost:6380"

# Sécurité  
JWT_SECRET="votre-secret-jwt"

# CORS
CORS_ORIGIN="http://localhost:3000"

# OpenAI (optionnel)
OPENAI_API_KEY="sk-votre-clé-openai"
```

## 📊 Exemple de génération

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
# Tests manuels
npx tsx example-openai-script.js

# Compilation
npm run build

# Monitoring
npm run dev     # Logs en temps réel
npm run worker  # Worker avec logs détaillés
```

## 🚀 Déploiement

**Prérequis production :**
- Node.js 18+
- PostgreSQL 
- Redis
- Clé OpenAI valide

**Variables critiques :**
- `JWT_SECRET` - Secret fort
- `DATABASE_URL` - Connexion sécurisée
- `OPENAI_API_KEY` - Clé de production

## 🛠️ Roadmap

### ✅ Fonctionnalités complètes
- ✅ Architecture Fastify + TypeScript
- ✅ Authentification JWT
- ✅ Génération de scripts OpenAI GPT-4o-mini
- ✅ Prompts vidéo WAN 2.2 structurés
- ✅ Pipeline asynchrone avec BullMQ
- ✅ Logs détaillés et monitoring

### 🚧 En cours d'intégration
- 🔄 **ElevenLabs** - Synthèse vocale réaliste
- 🔄 **WAN 2.2** - Génération d'images IA
- 🔄 **Shotstack** - Assemblage vidéo professionnel

### 📋 Améliorations prévues
- [ ] Rate limiting et quotas
- [ ] Interface d'administration
- [ ] Analytics et métriques
- [ ] Templates vidéo personnalisables
- [ ] Support multi-formats
- [ ] Tests automatisés
- [ ] CI/CD pipeline

## 📞 Support

**Documentation :** Voir les fichiers `.md` dans le projet
**Health check :** `GET /api/v1/system/health`
**Swagger UI :** http://localhost:3000/docs

---

*Looply v1.0 - Septembre 2025*