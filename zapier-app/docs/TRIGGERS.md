# Triggers

Les 3 triggers fonctionnent par **polling** : Zapier interroge PortalFlow toutes les 1 à 15 minutes (selon le plan Zapier de l'utilisateur) pour détecter les nouveaux événements.

## 1. New Project Created

Se déclenche quand un nouveau projet est créé dans PortalFlow (manuellement ou via l'action Zapier "Create Project").

**Endpoint interrogé** : `GET /api/zapier/projects/recent`

**Champs de sortie :**
| Champ | Description |
|---|---|
| `id` | Identifiant unique du projet |
| `name` | Nom du projet |
| `client_email` | Email du client |
| `client_name` | Nom du client |
| `description` | Description du projet |
| `created_at` | Date de création |
| `project_url` | Lien vers le projet |

**Cas d'usage :**
- Envoyer un email de bienvenue au client
- Créer un événement calendrier de kickoff
- Ajouter la ligne à un tableau Airtable/Sheets

## 2. Client Approved Item

Se déclenche quand un client approuve un item de checklist sur un projet.

**Endpoint interrogé** : `GET /api/zapier/checklist/approved`

**Champs de sortie :**
| Champ | Description |
|---|---|
| `id` | Identifiant unique de l'événement (= item_id) |
| `item_id` | Identifiant de l'item de checklist |
| `project_id` | Identifiant du projet parent |
| `title` | Titre de l'item approuvé |
| `approved_by` | Nom de la personne ayant approuvé |
| `approved_at` | Date d'approbation |
| `project_name` | Nom du projet |
| `project_url` | Lien vers le projet |

**Cas d'usage :**
- Envoyer un email de félicitations
- Poster dans un canal Slack
- Créer une ligne de facture

## 3. New Message

Se déclenche quand un nouveau message est posté sur un projet.

**Endpoint interrogé** : `GET /api/zapier/messages/recent`

**Champs de sortie :**
| Champ | Description |
|---|---|
| `id` | Identifiant unique de l'événement (= message_id) |
| `message_id` | Identifiant du message |
| `project_id` | Identifiant du projet parent |
| `content` | Contenu du message |
| `user_email` | Email de l'expéditeur |
| `created_at` | Date d'envoi |
| `project_name` | Nom du projet |
| `project_url` | Lien vers le projet |

**Cas d'usage :**
- Notification Slack en temps réel
- Ajout dans un tableau de suivi
- Création de tâche dans un outil de gestion de projet
