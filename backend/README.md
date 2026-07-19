# PortalFlow Backend API

API REST Node.js + Express + Prisma + PostgreSQL avec intégration Zapier.

## Setup local

```bash
cd backend
npm install
cp .env.example .env
# Editer .env avec votre DATABASE_URL PostgreSQL
npx prisma db push
npx prisma db seed
npm run dev
```

Le serveur tourne sur `http://localhost:3001`.

## Endpoints

### Health
```bash
curl http://localhost:3001/health
```

### Auth — Magic Link
```bash
# Envoyer un magic link (en dev, le lien s'affiche dans la console)
curl -X POST http://localhost:3001/auth/sendMagicLink \
  -H "Content-Type: application/json" \
  -d '{"email": "demo@portalflow.com"}'

# Vérifier le token (copier depuis la console)
curl -X POST http://localhost:3001/auth/verifyToken \
  -H "Content-Type: application/json" \
  -d '{"token": "TOKEN_ICI"}'

# Récupérer le profil
curl http://localhost:3001/auth/me \
  -H "Authorization: Bearer JWT_TOKEN"

# Générer une API key (pour Zapier)
curl -X POST http://localhost:3001/auth/generate-api-key \
  -H "Authorization: Bearer JWT_TOKEN"
```

### Projects
```bash
# Créer un projet
curl -X POST http://localhost:3001/projects \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Mon Projet", "clientEmail": "client@example.com", "clientName": "Jean"}'

# Lister les projets
curl http://localhost:3001/projects \
  -H "Authorization: Bearer JWT_TOKEN"

# Détail d'un projet (avec fichiers, checklist, messages)
curl http://localhost:3001/projects/PROJECT_ID \
  -H "Authorization: Bearer JWT_TOKEN"

# Modifier
curl -X PUT http://localhost:3001/projects/PROJECT_ID \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'

# Supprimer
curl -X DELETE http://localhost:3001/projects/PROJECT_ID \
  -H "Authorization: Bearer JWT_TOKEN"
```

### Files
Files are stored in Supabase Storage (bucket `project-files`, public read). Allowed types: PDF, images, Office docs, ZIP, plain text/CSV. Max 20MB per file.

```bash
# Upload (real multipart upload)
curl -X POST http://localhost:3001/projects/PROJECT_ID/files \
  -H "Authorization: Bearer JWT_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "uploadedBy=freelancer"

# Lister
curl http://localhost:3001/projects/PROJECT_ID/files \
  -H "Authorization: Bearer JWT_TOKEN"

# Supprimer
curl -X DELETE http://localhost:3001/files/FILE_ID \
  -H "Authorization: Bearer JWT_TOKEN"
```

### Checklist
```bash
# Créer un item
curl -X POST http://localhost:3001/projects/PROJECT_ID/checklist \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Livrable 1", "description": "Description du livrable"}'

# Lister
curl http://localhost:3001/projects/PROJECT_ID/checklist \
  -H "Authorization: Bearer JWT_TOKEN"

# Approuver (déclenche le webhook item_approved)
curl -X PUT http://localhost:3001/checklist/ITEM_ID \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "approved", "approvedBy": "Client Name"}'
```

### Messages
```bash
# Poster un message (déclenche le webhook message_created)
curl -X POST http://localhost:3001/projects/PROJECT_ID/messages \
  -H "Authorization: Bearer JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Bonjour, voici le livrable."}'

# Lister
curl http://localhost:3001/projects/PROJECT_ID/messages \
  -H "Authorization: Bearer JWT_TOKEN"
```

### Zapier Webhooks (auth par API Key)
```bash
# Enregistrer un webhook
curl -X POST http://localhost:3001/webhooks/register \
  -H "Authorization: Bearer API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"eventType": "project_created", "webhookUrl": "https://hooks.zapier.com/xxx"}'

# Lister les webhooks
curl http://localhost:3001/webhooks \
  -H "Authorization: Bearer API_KEY"

# Tester un webhook
curl -X POST http://localhost:3001/webhooks/test \
  -H "Authorization: Bearer API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"webhookId": "WEBHOOK_ID"}'

# Créer un projet via Zapier
curl -X POST http://localhost:3001/api/zapier/create-project \
  -H "Authorization: Bearer API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name": "Projet Zapier", "clientEmail": "client@test.com"}'
```

## Déploiement sur Railway

1. Créer un projet sur [railway.app](https://railway.app)
2. Ajouter un service PostgreSQL
3. Connecter le repo GitHub
4. Ajouter les variables d'environnement (copier `.env.example`)
5. Railway détecte Node.js automatiquement

Build command: `npx prisma generate && npm run build`
Start command: `npm start`

## Événements Zapier

| Événement | Déclenché quand |
|-----------|----------------|
| `project_created` | Un nouveau projet est créé |
| `item_approved` | Un item de checklist est approuvé |
| `message_created` | Un nouveau message est posté |
