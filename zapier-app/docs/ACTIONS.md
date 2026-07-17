# Actions

## Create Project

Crée un nouveau projet dans PortalFlow directement depuis Zapier.

**Endpoint appelé** : `POST /api/zapier/create-project`

**Champs d'entrée :**
| Champ | Requis | Description |
|---|---|---|
| `name` | Oui | Nom du projet |
| `client_email` | Non | Email du client |
| `client_name` | Non | Nom du client |
| `description` | Non | Description du projet |

**Champs de sortie :**
| Champ | Description |
|---|---|
| `id` | Identifiant du projet créé |
| `name` | Nom du projet |
| `client_email` | Email du client |
| `client_name` | Nom du client |
| `project_url` | Lien vers le projet créé |

**Cas d'usage :**
- Un formulaire Typeform/Tally est soumis → un projet est créé automatiquement
- Une opportunité passe en "Gagné" dans un CRM → un projet PortalFlow est créé
- Un événement calendrier est créé → un projet correspondant est ouvert

## Gestion des erreurs

| Statut HTTP | Cause | Résolution |
|---|---|---|
| 400 | `name` manquant dans la requête | Vérifier que le champ "Project Name" est bien mappé dans le Zap |
| 401 | Clé API invalide ou révoquée | Reconnecter le compte PortalFlow dans Zapier |
| 429 | Trop de requêtes (rate limit) | Réessayer après quelques minutes |
| 500 | Erreur serveur PortalFlow | Réessayer plus tard, contacter le support si persiste |
