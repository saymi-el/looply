# 🔌 Documentation API - Looply

## Base URL
```
http://localhost:3000/api/v1
```

---

## 🔐 Authentification

### Inscription
**POST** `/auth/signup`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "minimum8characters"
}
```

**Response 201:**
```json
{
  "id": "cmfxzmqei000020jcmra9gbx9",
  "email": "user@example.com"
}
```

**Erreurs:**
- `400` - Email invalide ou mot de passe trop court
- `409` - Email déjà utilisé

---

### Connexion
**POST** `/auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "cmfxzmqei000020jcmra9gbx9",
    "email": "user@example.com"
  }
}
```

**Erreurs:**
- `400` - Données manquantes
- `401` - Identifiants incorrects

---

## 👤 Profil utilisateur

### Récupérer le profil
**GET** `/profile`
**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "id": "profile-id",
  "userId": "user-id", 
  "displayName": "John Doe",
  "bio": "Créateur de contenu",
  "avatarUrl": "https://..."
}
```

---

### Modifier le profil
**PUT** `/profile`
**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "displayName": "Nouveau nom",
  "bio": "Ma nouvelle bio",
  "avatarUrl": "https://nouvel-avatar.jpg"
}
```

**Response 200:**
```json
{
  "id": "profile-id",
  "userId": "user-id",
  "displayName": "Nouveau nom",
  "bio": "Ma nouvelle bio", 
  "avatarUrl": "https://nouvel-avatar.jpg"
}
```

---

## 🎬 Génération de vidéos

### Créer une vidéo
**POST** `/video`
**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "platform": "marketing digital",     // Sujet/thème
  "tone": "dynamique et professionnel", // Ton souhaité  
  "duration": 15,                      // Durée en secondes
  "script": "Script personnalisé..."   // Optionnel
}
```

**Paramètres:**
- `platform` *(string, optionnel)* - Sujet principal de la vidéo
- `tone` *(string, optionnel)* - Ton/style désiré (ex: "énergique", "professionnel", "chaleureux")
- `duration` *(number, optionnel)* - Durée en secondes (défaut: 15, max: 60)
- `script` *(string, optionnel)* - Script prédéfini (court-circuite la génération OpenAI)

**Response 202:**
```json
{
  "jobId": "cmfy00mge0001nukcq9a10pb4",
  "status": "PENDING"
}
```

**Erreurs:**
- `401` - Token manquant ou invalide
- `400` - Paramètres invalides
- `429` - Trop de requêtes (limite de débit)

---

### Vérifier le statut
**GET** `/video/:jobId`
**Headers:** `Authorization: Bearer <token>`

**Statuts possibles:**
- `PENDING` - En attente de traitement
- `RUNNING` - En cours de génération
- `COMPLETED` - Terminé avec succès  
- `FAILED` - Échec du traitement

**Response 200 (PENDING/RUNNING):**
```json
{
  "id": "cmfy00mge0001nukcq9a10pb4",
  "status": "RUNNING",
  "progress": 45,
  "result": null,
  "errorMessage": null
}
```

**Response 200 (COMPLETED):**
```json
{
  "id": "cmfy00mge0001nukcq9a10pb4", 
  "status": "COMPLETED",
  "progress": 100,
  "result": {
    "url": "https://example.com/video-generated.mp4",
    "generatedScript": "L'innovation technologique transforme notre quotidien! Imaginez un monde où chaque idée devient réalité...",
    "videoPrompts": [
      {
        "scene": "Un globe terrestre animé avec des circuits électroniques illuminés",
        "positive": "Un globe terrestre en 3D entouré de circuits électroniques lumineux, symbolisant l'innovation mondiale, couleurs vives et dynamique, style futuriste",
        "negative": "éviter les images floues, peu détaillées ou de mauvaise qualité",
        "timing": { "start": 0, "end": 5 }
      },
      {
        "scene": "Des inventeurs divers travaillant ensemble dans un laboratoire moderne",
        "positive": "Un laboratoire moderne vibrant de créativité, avec des inventeurs de différentes origines collaborant sur des prototypes innovants, atmosphère dynamique et énergique",
        "negative": "éviter les scènes sombres, floues ou avec un manque de diversité", 
        "timing": { "start": 5, "end": 10 }
      },
      {
        "scene": "Une ville futuriste avec des véhicules volants et des bâtiments écologiques",
        "positive": "Une vue panoramique d'une ville futuriste brillante avec des véhicules volants, des bâtiments écologiques et des espaces verts, ambiance optimiste et inspirante",
        "negative": "éviter les images ternes, mal définies ou peu inspirantes",
        "timing": { "start": 10, "end": 15 }
      }
    ],
    "summary": "Script de 15s généré avec 3 prompts visuels",
    "steps": [
      {
        "name": "script",
        "status": "ok", 
        "meta": {
          "length": 234,
          "duration": 15,
          "promptsCount": 3,
          "script": "L'innovation technologique...",
          "videoPrompts": [...]
        }
      },
      {
        "name": "audio",
        "status": "ok",
        "meta": {
          "audioUrl": "https://example.com/audio.mp3"
        }
      },
      {
        "name": "visuals", 
        "status": "ok",
        "meta": {
          "count": 3
        }
      },
      {
        "name": "assemble",
        "status": "ok",
        "meta": {
          "url": "https://example.com/video-generated.mp4"
        }
      }
    ]
  },
  "errorMessage": null
}
```

**Response 200 (FAILED):**
```json
{
  "id": "cmfy00mge0001nukcq9a10pb4",
  "status": "FAILED", 
  "progress": 45,
  "result": null,
  "errorMessage": "OpenAI API quota exceeded"
}
```

**Erreurs:**
- `404` - Job non trouvé
- `401` - Non autorisé (job appartient à un autre utilisateur)

---

### Lister les vidéos
**GET** `/video`
**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` *(number, optionnel)* - Page (défaut: 1)
- `pageSize` *(number, optionnel)* - Taille de page (défaut: 10, max: 100)

**Response 200:**
```json
{
  "jobs": [
    {
      "id": "cmfy00mge0001nukcq9a10pb4",
      "status": "COMPLETED",
      "progress": 100,
      "createdAt": "2025-09-24T15:07:04.295Z",
      "result": {
        "url": "https://...",
        "summary": "Script de 15s généré avec 3 prompts visuels"
      }
    },
    {
      "id": "another-job-id", 
      "status": "PENDING",
      "progress": 0,
      "createdAt": "2025-09-24T14:30:00.000Z",
      "result": null
    }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

---

## 🔧 Système

### Health Check
**GET** `/system/health`

**Response 200:**
```json
{
  "status": "healthy",
  "timestamp": "2025-09-24T15:07:04.295Z",
  "uptime": 3600,
  "services": {
    "database": "connected",
    "redis": "connected", 
    "openai": "configured"
  }
}
```

---

## 📋 Codes d'erreur

### Erreurs d'authentification
- **401 Unauthorized** - Token manquant, invalide ou expiré
- **403 Forbidden** - Accès refusé (permissions insuffisantes)

### Erreurs de validation
- **400 Bad Request** - Données invalides ou manquantes
- **422 Unprocessable Entity** - Validation Zod échouée

### Erreurs de ressources
- **404 Not Found** - Ressource inexistante
- **409 Conflict** - Conflit (ex: email déjà utilisé)

### Erreurs serveur
- **500 Internal Server Error** - Erreur interne
- **503 Service Unavailable** - Service temporairement indisponible

### Erreurs de quotas
- **429 Too Many Requests** - Limite de débit dépassée

---

## 🔑 Headers obligatoires

### Authentification
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Content-Type
```http
Content-Type: application/json
```

---

## 🚀 Exemples d'utilisation

### Workflow complet
```javascript
// 1. Inscription
const signup = await fetch('/api/v1/auth/signup', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'dev@looply.com',
    password: 'securepassword123'
  })
});

// 2. Connexion
const login = await fetch('/api/v1/auth/login', {
  method: 'POST', 
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'dev@looply.com',
    password: 'securepassword123'
  })
});
const { token } = await login.json();

// 3. Créer une vidéo
const videoRequest = await fetch('/api/v1/video', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    platform: 'intelligence artificielle',
    tone: 'éducatif et captivant',
    duration: 15
  })
});
const { jobId } = await videoRequest.json();

// 4. Polling du statut
const checkStatus = async () => {
  const response = await fetch(`/api/v1/video/${jobId}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const job = await response.json();
  
  if (job.status === 'COMPLETED') {
    console.log('Vidéo prête:', job.result.url);
    console.log('Script généré:', job.result.generatedScript);
    return job;
  } else if (job.status === 'FAILED') {
    throw new Error(job.errorMessage);
  } else {
    console.log(`Progression: ${job.progress}%`);
    setTimeout(checkStatus, 2000); // Vérifier toutes les 2s
  }
};

await checkStatus();
```

### Cas d'usage avancés

#### Script personnalisé
```javascript
const customVideo = await fetch('/api/v1/video', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    script: "Découvrez notre nouveau produit révolutionnaire! En seulement 3 étapes simples, transformez votre workflow et boostez votre productivité de 300%. Rejoignez les 10 000+ utilisateurs satisfaits dès aujourd'hui!",
    duration: 15
  })
});
```

#### Vidéo longue format
```javascript
const longVideo = await fetch('/api/v1/video', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    platform: 'formation complète React.js',
    tone: 'pédagogique et professionnel',
    duration: 60
  })
});
```

---

## 📊 Rate Limiting

**Limites actuelles:** *(à implémenter)*
- 100 requêtes/minute par utilisateur
- 10 créations de vidéo/heure par utilisateur
- 1000 requêtes/minute globales

**Headers de réponse:**
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

---

## 🔍 Swagger/OpenAPI

Interface interactive disponible sur:
**http://localhost:3000/docs**

JSON Schema:
**http://localhost:3000/docs/json**

---

*API Documentation - Version 1.0 - 24 septembre 2025*