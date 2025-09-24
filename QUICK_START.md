# 🚀 Guide de démarrage rapide - Looply API

## ⚡ Démarrage en 5 minutes

### 1. Installation
```bash
git clone <votre-repo>
cd Looply
npm install
```

### 2. Configuration
```bash
# Copier le fichier d'environnement
cp .env.example .env

# Modifier .env avec vos clés API
# OPENAI_API_KEY=sk-votre-clé-openai
```

### 3. Services
```bash
# Démarrer PostgreSQL + Redis
sudo docker-compose up -d

# Migrer la base de données
npx prisma migrate deploy

# Démarrer l'API (terminal 1)
npm run dev

# Démarrer le worker (terminal 2)
npm run worker
```

### 4. Test rapide
```bash
# 1. Créer un compte
curl -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123456"}'

# 2. Se connecter et récupérer le token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "test123456"}'

# 3. Générer une vidéo
curl -X POST http://localhost:3000/api/v1/video \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT" \
  -d '{"platform": "marketing digital", "tone": "dynamique", "duration": 15}'
```

---

## 📚 Exemples d'utilisation

### Génération de vidéo avec OpenAI
```javascript
// Requête complète
const response = await fetch('http://localhost:3000/api/v1/video', {
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

const { jobId } = await response.json();

// Vérifier le statut
const status = await fetch(`http://localhost:3000/api/v1/video/${jobId}`, {
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Réponse type d'OpenAI
```json
{
  "id": "cmfy00mge0001nukcq9a10pb4",
  "status": "COMPLETED",
  "progress": 100,
  "result": {
    "url": "https://example.com/video-generated.mp4",
    "generatedScript": "L'innovation technologique transforme...",
    "videoPrompts": [
      {
        "scene": "Un globe terrestre animé...",
        "positive": "Un globe terrestre en 3D entouré...",
        "negative": "éviter les images floues...",
        "timing": { "start": 0, "end": 5 }
      }
    ],
    "summary": "Script de 15s généré avec 3 prompts visuels"
  }
}
```

---

## 🔧 Commandes utiles

### Développement
```bash
# Hot-reload serveur
npm run dev

# Worker avec logs
npm run worker

# Compilation TypeScript
npm run build

# Tester la génération OpenAI
npx tsx example-openai-script.js
```

### Base de données
```bash
# Réinitialiser la DB
npx prisma migrate reset

# Générer le client Prisma
npx prisma generate

# Interface d'administration
npx prisma studio
```

### Docker
```bash
# Démarrer les services
sudo docker-compose up -d

# Voir les logs
sudo docker-compose logs -f

# Redémarrer un service
sudo docker-compose restart redis

# Arrêter tout
sudo docker-compose down
```

---

## 🐛 Debug et dépannage

### Problèmes fréquents

#### "Can't reach database server"
```bash
# Vérifier que PostgreSQL fonctionne
sudo docker-compose ps
curl -f http://localhost:5433 || echo "PostgreSQL non accessible"

# Corriger DATABASE_URL dans .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/video_saas?schema=public"
```

#### "ECONNREFUSED 127.0.0.1:6379"
```bash
# Redis sur le mauvais port
REDIS_URL="redis://localhost:6380"  # Pas 6379
```

#### "OpenAI API key not configured"
```bash
# Ajouter la clé dans .env
OPENAI_API_KEY="sk-votre-clé-réelle"
```

### Logs utiles
```bash
# Voir les logs du worker
# Rechercher ces patterns :
# "📤 Envoi du prompt à OpenAI"
# "📥 Réponse brute reçue d'OpenAI" 
# "✅ Script généré par OpenAI"

# Logs de debug de la DB
DEBUG=prisma:query npm run dev
```

---

## 📊 Métriques et monitoring

### Health check
```bash
curl http://localhost:3000/api/v1/system/health
```

### Swagger UI
Ouvrir http://localhost:3000/docs

### Métriques OpenAI
Les logs montrent :
- Tokens utilisés (prompt + completion)
- Modèle utilisé (gpt-4o-mini)
- Temps de réponse
- Coût approximatif

---

## 🎯 Cas d'usage

### 1. Vidéo marketing
```json
{
  "platform": "nouveau produit SaaS",
  "tone": "enthousiaste et commercial",
  "duration": 15
}
```

### 2. Contenu éducatif
```json
{
  "platform": "apprentissage JavaScript",
  "tone": "pédagogique et bienveillant", 
  "duration": 30
}
```

### 3. Réseaux sociaux
```json
{
  "platform": "tendances TikTok 2025",
  "tone": "jeune et viral",
  "duration": 10
}
```

---

## 🔒 Authentification rapide

### Flow complet
```bash
# 1. Signup
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "'$USER_EMAIL'", "password": "'$USER_PASSWORD'"}')

# 2. Login et récupérer token
TOKEN=$(curl -s -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "'$USER_EMAIL'", "password": "'$USER_PASSWORD'"}' \
  | jq -r '.token')

# 3. Utiliser le token
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/v1/profile
```

---

*Guide mis à jour le 24 septembre 2025*