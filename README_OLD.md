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

## 🚀 Aperçu

Backend du SaaS de génération automatique de vidéos à partir d’un formulaire utilisateur.
Technos principales : **Node.js (TypeScript) + Express + Prisma + PostgreSQL + Redis (BullMQ) + Docker**.

## 📂 Structure du projet

```
src/
  app/
    server.ts        # Bootstrap Express
    routes.ts        # Montage des routes
  config/
    env.ts           # Validation .env (Zod)
    logger.ts        # Logger Pino
    db.ts            # Prisma client
    queue.ts         # Connexion BullMQ
  modules/
    auth/            # Authentification JWT
      auth.controller.ts
      auth.service.ts
      auth.routes.ts
    profile/         # Gestion du profil utilisateur
      profile.controller.ts
      profile.service.ts
      profile.routes.ts
    video/           # Orchestration des jobs vidéo
      video.controller.ts
      video.service.ts
      video.routes.ts
      video.model.ts
    ai/              # Génération AI (stubs pour l’instant)
      script.service.ts
      audio.service.ts
      model.service.ts
      shotstack.service.ts
  workers/
    video.worker.ts  # Worker BullMQ (traite les jobs)
prisma/
  schema.prisma      # Schéma BDD Prisma
```

## 🛠️ Technologies utilisées

* **Node.js + TypeScript** – serveur backend moderne, typé et maintenable
* **Express** – framework web minimaliste
* **Prisma ORM + PostgreSQL** – gestion de la base de données relationnelle
* **Redis + BullMQ** – gestion des files de jobs asynchrones (génération vidéo)
* **Pino** – logging structuré et performant
* **Zod** – validation des entrées et des variables d’environnement
* **Docker + docker-compose** – pour lancer Postgres et Redis rapidement

## ⚙️ Configuration

Créer un fichier `.env` à partir de `.env.example` :

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/video_saas?schema=public"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="change-me"
PORT=3000
AI_MODE=stub
```

## 🐳 Lancer Postgres + Redis

```bash
docker-compose up -d
```

## ▶️ Démarrer en dev

```bash
npm install
npx prisma migrate dev --name init
npm run dev       # API Express (http://localhost:3000)
npm run worker    # Worker BullMQ
```

## 🔑 Endpoints principaux

* `POST /api/v1/auth/signup` – créer un compte
* `POST /api/v1/auth/login` – obtenir un JWT
* `GET /api/v1/profile/me` – lire le profil utilisateur
* `PUT /api/v1/profile/me` – mettre à jour le profil
* `POST /api/v1/video` – créer une demande de vidéo (job asynchrone)
* `GET /api/v1/video/:id` – consulter le statut d’une vidéo
* `GET /api/v1/video` – lister les vidéos de l’utilisateur

## ✅ Exemple rapide (via curl)

```bash
# Signup
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"me@example.com","password":"password123"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"me@example.com","password":"password123"}' | jq -r .token)

# Créer un job vidéo
JOB_ID=$(curl -s -X POST http://localhost:3000/api/v1/video \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"tone":"didactique","duration":"45s","platform":"Instagram"}' | jq -r .jobId)

# Suivre le job
curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/video/$JOB_ID | jq
```

## 📌 Bonnes pratiques déjà en place

* Validation stricte des entrées (Zod)
* Logs structurés (Pino)
* Séparation claire API/Worker (BullMQ)
* Auth sécurisée (JWT, bcrypt)
* Architecture modulaire (controllers, services, routes, models)

## 🔮 Prochaines étapes

* Intégration réelle des API AI (ElevenLabs, Shotstack, WAN…)
* Documentation API via Swagger/OpenAPI
* Gestion d’erreurs enrichie (format standardisé)
* Stockage réel des vidéos générées (S3, etc.)
* Rate limiting et sécurité avancée sur l’auth
* Tests unitaires et d’intégration automatisés