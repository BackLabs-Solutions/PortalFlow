# PortalFlow — Zapier CLI App

Code source de l'intégration Zapier officielle pour [PortalFlow](https://portalflow-landing-six.vercel.app). Voir [docs/](docs/) pour la documentation utilisateur (README, auth, triggers, actions).

## Structure

```
zapier-app/
├── .zapierapprc          # ID + clé de l'app (généré par `zapier-platform register`)
├── package.json
├── index.js               # Point d'entrée : assemble auth/triggers/creates
├── authentication.js       # Auth par clé API
├── triggers/
│   ├── project_created.js
│   ├── item_approved.js
│   └── message_created.js
├── creates/
│   └── create_project.js
├── samples/                # Données d'exemple utilisées par le CLI et l'UI Zapier
└── docs/                   # Documentation utilisateur finale
```

## Setup local

Prérequis : Node.js 18+, un compte [Zapier Developer](https://developer.zapier.com) (gratuit).

```bash
cd zapier-app
npm install -g zapier-platform-cli
npm install
```

> Note : depuis la CLI v17+, le binaire installé s'appelle **`zapier-platform`**, pas `zapier`. Toutes les commandes ci-dessous utilisent ce nom.

```bash
# Connexion au compte Zapier Developer (ouvre un navigateur)
zapier-platform login
```

## Variables d'environnement

L'app pointe par défaut sur `https://portalflow.onrender.com`. Pour tester contre un backend local :

```bash
export BASE_URL=http://localhost:3001
```

## Tester en local

```bash
# Valide la structure de l'app (schéma Zapier)
zapier-platform validate
```

`validate` fonctionne déjà sans connexion — il vérifie la structure du code. Les commandes suivantes nécessitent d'être connectée (`zapier-platform login`) et l'app enregistrée (`zapier-platform register`, voir plus bas).

Pour un test manuel d'un trigger ou d'une action sans passer par l'UI Zapier :

```bash
zapier-platform invoke trigger project_created
zapier-platform invoke create create_project
```

(nécessite d'avoir configuré une clé API de test via `zapier-platform env:set`)

## Enregistrer et pousser l'app

**Première fois seulement** — crée l'app côté Zapier et remplace `.zapierapprc` :

```bash
zapier-platform register "PortalFlow"
```

**À chaque changement** — pousse une nouvelle version vers Zapier :

```bash
zapier-platform push
```

## Soumettre pour review

1. Aller sur [developer.zapier.com](https://developer.zapier.com), ouvrir l'app PortalFlow
2. Compléter la fiche : description, catégorie, logo, liens de support
3. Vérifier que chaque trigger/action a des exemples fonctionnels (`zapier-platform push` doit être à jour)
4. Cliquer **Submit for Review**
5. Délai habituel : 5 à 10 jours ouvrés. Zapier peut renvoyer des demandes de correction — traiter, `zapier-platform push`, resoumettre.

## Notes

- Les endpoints de polling (`/api/zapier/projects/recent`, `/checklist/approved`, `/messages/recent`) sont filtrés par utilisateur via la clé API — chaque connexion Zapier ne voit que ses propres projets.
- Le rate limiting du backend (100 req / 15 min / IP) s'applique aussi au polling Zapier. Si plusieurs utilisateurs Zapier partagent la même IP sortante (peu probable), envisager un rate limit par clé API plutôt que par IP.
