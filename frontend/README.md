# PortalFlow — Dashboard

Dashboard Next.js 14 (App Router) connecté à l'API PortalFlow. Auth par magic link, gestion de projets, portail client public.

## Setup local

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Ouvre [http://localhost:3000](http://localhost:3000).

## Variables d'environnement

```
NEXT_PUBLIC_API_URL=https://portalflow.onrender.com
```

## Structure

```
app/
├── page.tsx              # Redirige vers /login ou /dashboard
├── login/page.tsx         # Saisie email, envoi du lien magique
├── verify/page.tsx        # Vérifie le token, stocke le JWT
├── dashboard/
│   ├── layout.tsx         # Route protégée + navbar
│   ├── page.tsx           # Liste des projets, stats, recherche
│   ├── projects/[id]/     # Détail projet : fichiers, checklist, messages
│   └── settings/          # Profil, marque, clé API Zapier
└── portal/[projectId]/    # Portail client public, sans authentification
```

## Notes importantes

- **Upload de fichiers** : le backend actuel est un mock (il enregistre le nom/la taille du fichier mais ne stocke pas le binaire). L'UI reflète honnêtement ce comportement — pas de vrai stockage tant qu'une intégration S3/Cloudinary n'est pas branchée côté backend.
- **Portail client** : accessible via `/portal/[projectId]`, sans compte. La sécurité repose sur le caractère non-devinable de l'UUID du projet (comme un lien Google Docs "toute personne disposant du lien").
- **Thème** : détection automatique du thème système + bascule manuelle persistée en `localStorage`.

## Déploiement sur Vercel

```bash
npx vercel --prod
```

Penser à configurer `NEXT_PUBLIC_API_URL` dans les variables d'environnement du projet Vercel, et à mettre à jour `DASHBOARD_URL` et `FRONTEND_URL` côté backend une fois l'URL de déploiement connue (pour les liens magiques et le CORS).
