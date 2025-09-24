# 📚 Documentation Complète - Looply Video SaaS

## 📋 Vue d'ensemble

**Looply** est une plateforme SaaS de génération de vidéos automatisée qui utilise l'intelligence artificielle pour créer du contenu vidéo personnalisé. Le système génère automatiquement des scripts, de l'audio, des visuels et assemble le tout en vidéos finales.

### 🎯 Fonctionnalités principales
- **Génération de scripts intelligents** avec OpenAI GPT-4o-mini
- **Synthèse vocale** pour convertir le texte en audio
- **Génération d'assets visuels** avec prompts WAN 2.2
- **Assemblage vidéo automatique** via Shotstack
- **Système de files d'attente** asynchrone avec Redis + BullMQ
- **Authentification JWT** sécurisée
- **API REST** complète avec documentation Swagger

---

## 🏗️ Architecture Technique

### Stack Technologique
- **Backend :** Node.js + TypeScript + Fastify
- **Base de données :** PostgreSQL + Prisma ORM
- **Cache/Queue :** Redis + BullMQ
- **IA :** OpenAI GPT-4o-mini
- **Containerisation :** Docker + Docker Compose

### Structure du projet
```
src/
├── app/                    # Configuration serveur principal
├── config/                 # Configuration globale
├── modules/               # Modules métier
│   ├── auth/             # Authentification & autorisation
│   ├── profile/          # Gestion des profils utilisateurs
│   ├── video/            # Gestion des vidéos
│   ├── ai/               # Services d'intelligence artificielle
│   └── system/           # Routes système (health, info)
└── workers/              # Workers de traitement asynchrone
```

---

## 🔧 Modules Opérationnels

### 🔐 Module d'Authentification (`/modules/auth/`)

**Fichiers :**
- `auth.controller.ts` - Contrôleurs HTTP
- `auth.routes.ts` - Définition des routes
- `auth.service.ts` - Logique métier
- `jwt.middleware.ts` - Middleware de validation JWT

**Fonctionnalités :**
- **Inscription** (`POST /api/v1/auth/signup`)
  - Validation email/password
  - Hachage bcrypt du mot de passe
  - Création automatique du profil utilisateur
  
- **Connexion** (`POST /api/v1/auth/login`)
  - Vérification des identifiants
  - Génération de token JWT (7 jours)
  
- **Middleware JWT**
  - Protection des routes privées
  - Extraction de l'userId depuis le token

**Sécurité :**
- Hachage bcrypt (10 rounds)
- JWT avec secret configuré
- Validation Zod des entrées

---

### 👤 Module Profil (`/modules/profile/`)

**Fonctionnalités :**
- **Récupération profil** (`GET /api/v1/profile`)
- **Mise à jour profil** (`PUT /api/v1/profile`)

**Modèle de données :**
```typescript
Profile {
  id: string
  userId: string
  displayName?: string
  bio?: string
  avatarUrl?: string
}
```

---

### 🎬 Module Vidéo (`/modules/video/`)

**Fichiers :**
- `video.controller.ts` - API endpoints
- `video.routes.ts` - Configuration des routes
- `video.service.ts` - Logique métier
- `video.model.ts` - Types TypeScript

**API Endpoints :**

#### 📤 Création de vidéo (`POST /api/v1/video`)
**Paramètres :**
```typescript
{
  platform?: string     // Sujet/thème de la vidéo
  tone?: string         // Ton souhaité (ex: "énergique", "professionnel")
  duration?: number     // Durée en secondes (défaut: 15)
  script?: string       // Script personnalisé (optionnel)
}
```

**Réponse :**
```json
{
  "jobId": "cmfy00mge0001nukcq9a10pb4",
  "status": "PENDING"
}
```

#### 📊 Statut de vidéo (`GET /api/v1/video/:id`)
**Réponse :**
```json
{
  "id": "job-id",
  "status": "COMPLETED|PENDING|RUNNING|FAILED",
  "progress": 100,
  "result": {
    "url": "https://...",
    "generatedScript": "Script généré...",
    "videoPrompts": [...],
    "summary": "Description du résultat"
  }
}
```

#### 📋 Liste des vidéos (`GET /api/v1/video`)
**Paramètres de pagination :**
- `page` (défaut: 1)
- `pageSize` (défaut: 10, max: 100)

---

### 🤖 Modules d'Intelligence Artificielle (`/modules/ai/`)

#### 📝 Service de génération de script (`script.service.ts`)

**Fonction principale :** `generateScript(input)`

**Fonctionnalités :**
- Génération de scripts avec **OpenAI GPT-4o-mini**
- Création automatique de **3 prompts vidéo WAN 2.2**
- Support de durées personnalisées
- Fallback gracieux si pas d'API OpenAI

**Format de sortie :**
```typescript
GeneratedScript {
  text: string           // Script narratif
  duration: number       // Durée en secondes
  videoPrompts: VideoPrompt[]  // Prompts pour génération visuelle
}

VideoPrompt {
  scene: string         // Description de la scène
  positive: string      // Prompt positif pour WAN 2.2
  negative: string      // Éléments à éviter
  timing: {
    start: number       // Début en secondes
    end: number         // Fin en secondes
  }
}
```

**Exemple de génération :**
```typescript
const result = await generateScript({
  topic: "innovation technologique",
  tone: "enthousiaste et inspirant", 
  duration: 15
});
```

#### 🔊 Service audio (`audio.service.ts`)
- **Fonction :** `textToSpeech(text)`
- **TODO :** Intégration ElevenLabs
- **Actuellement :** Stub retournant une URL exemple

#### 🎨 Service de génération visuelle (`model.service.ts`)
- **Fonction :** `generateVisualAssets(params)`
- **Support :** Prompts multiples WAN 2.2
- **TODO :** Intégration réelle WAN 2.2
- **Actuellement :** Génération de noms d'assets

#### 🎞️ Service d'assemblage (`shotstack.service.ts`)
- **Fonction :** `assembleVideo(components)`
- **Entrées :** Script, audio, assets, prompts vidéo
- **TODO :** Intégration Shotstack
- **Actuellement :** URL de vidéo simulée

---

### ⚡ Worker de traitement vidéo (`/workers/video.worker.ts`)

**Pipeline de traitement :**

1. **📝 Génération du script** (0→20%)
   - Appel à OpenAI pour générer script + prompts
   - Logs détaillés de la génération
   
2. **🔊 Synthèse vocale** (20→45%)
   - Conversion texte vers audio
   
3. **🎨 Génération des visuels** (45→70%)
   - Utilisation des prompts WAN 2.2
   
4. **🎞️ Assemblage final** (70→100%)
   - Synchronisation audio/vidéo
   - Export de la vidéo finale

**Logs détaillés :**
- Prompt envoyé à OpenAI
- Réponse brute d'OpenAI
- Parsing et validation JSON
- Progression à chaque étape

---

## 🗄️ Base de données

### Schéma Prisma (`prisma/schema.prisma`)

#### Table `User`
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  profile   Profile?
  videoJobs VideoJob[]
}
```

#### Table `Profile`
```prisma
model Profile {
  id          String  @id @default(cuid())
  userId      String  @unique
  displayName String?
  bio         String?
  avatarUrl   String?
  
  user User @relation(fields: [userId], references: [id])
}
```

#### Table `VideoJob`
```prisma
model VideoJob {
  id           String      @id @default(cuid())
  userId       String
  status       VideoStatus @default(PENDING)
  progress     Int         @default(0)
  request      Json
  result       Json?
  errorMessage String?
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
  
  user User @relation(fields: [userId], references: [id])
}

enum VideoStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
}
```

---

## 🔧 Configuration

### Variables d'environnement (`.env`)
```bash
# Serveur
PORT=3000
NODE_ENV=development

# Base de données PostgreSQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/video_saas?schema=public"

# Redis (Queue system)
REDIS_URL="redis://localhost:6380"

# Sécurité
JWT_SECRET="your-super-secret-jwt-key-here"

# CORS
CORS_ORIGIN="http://localhost:3000"

# OpenAI (optionnel)
OPENAI_API_KEY="sk-your-api-key-here"
```

### Docker Compose (`docker-compose.yml`)
```yaml
services:
  pg:      # PostgreSQL sur port 5433
  redis:   # Redis sur port 6380
```

---

## 🚀 Installation et démarrage

### Prérequis
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (ou via Docker)
- Redis (ou via Docker)

### Installation
```bash
# 1. Cloner et installer
git clone <repo>
cd Looply
npm install

# 2. Démarrer les services
sudo docker-compose up -d

# 3. Configurer la base de données
npx prisma migrate deploy

# 4. Démarrer l'application
npm run dev     # Serveur API
npm run worker  # Worker de traitement
```

### Ports utilisés
- **API :** http://localhost:3000
- **Swagger :** http://localhost:3000/docs
- **PostgreSQL :** localhost:5433
- **Redis :** localhost:6380

---

## 📊 Monitoring et logs

### Logs structurés
Le système utilise **Pino** pour des logs JSON structurés :

```json
{
  "level": 30,
  "time": 1758718653000,
  "msg": "✅ Script généré par OpenAI",
  "scriptLength": 234,
  "duration": 15,
  "promptsCount": 3,
  "script": "L'innovation technologique...",
  "videoPrompts": [...]
}
```

### Métriques importantes
- **Usage OpenAI :** Tokens utilisés, modèle, temps de réponse
- **Performance :** Temps de traitement par étape
- **Erreurs :** Logs détaillés avec stack traces
- **Jobs :** Progression et statuts en temps réel

---

## 🔒 Sécurité

### Authentification
- **Hachage :** bcrypt avec 10 rounds
- **JWT :** Tokens signés, expiration 7 jours
- **Middleware :** Protection automatique des routes privées

### Validation des données
- **Zod :** Validation stricte des entrées API
- **Sanitization :** Nettoyage automatique des données

### Bonnes pratiques
- Variables d'environnement pour les secrets
- CORS configuré
- Rate limiting (TODO)
- Logs sans données sensibles

---

## 🧪 Tests et développement

### Scripts npm disponibles
```bash
npm run dev      # Développement avec hot-reload
npm run build    # Compilation TypeScript
npm run worker   # Démarrage du worker
npm start        # Production
```

### Tests
- Endpoint de test : `GET /api/v1/system/health`
- Exemple d'utilisation : `example-openai-script.js`

---

## 🔮 Roadmap et TODOs

### Intégrations en cours
- [ ] **ElevenLabs** - Synthèse vocale réaliste
- [ ] **WAN 2.2** - Génération d'images IA
- [ ] **Shotstack** - Assemblage vidéo professionnel

### Améliorations prévues
- [ ] Rate limiting et quotas utilisateurs
- [ ] Système de templates vidéo
- [ ] Support de formats multiples
- [ ] Analytics et métriques utilisateur
- [ ] Interface d'administration
- [ ] Tests automatisés
- [ ] CI/CD pipeline

### Optimisations techniques
- [ ] Cache Redis pour les résultats
- [ ] Compression des assets
- [ ] CDN pour les vidéos
- [ ] Monitoring avancé (Prometheus/Grafana)

---

## 📞 Support et maintenance

### Logs de debug
- Activation : `NODE_ENV=development`
- Localisation : Console + fichiers (TODO)

### Santé du système
- Health check : `GET /api/v1/system/health`
- Métriques : Disponibles via logs structurés

### Dépannage courant
1. **Erreur de connexion BDD :** Vérifier `DATABASE_URL` et PostgreSQL
2. **Jobs bloqués :** Redémarrer le worker
3. **OpenAI timeout :** Vérifier la clé API et les quotas

---

*Documentation générée le 24 septembre 2025 - Version 1.0*