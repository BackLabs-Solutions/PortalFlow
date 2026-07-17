# PortalFlow Zapier App

PortalFlow est un portail client pour freelancers : centralise fichiers, checklists d'approbation et messages dans un espace à la marque du freelancer.

Cette intégration Zapier permet de :
- Déclencher un Zap quand un nouveau projet est créé
- Déclencher un Zap quand un client approuve un item de checklist
- Déclencher un Zap quand un nouveau message est posté
- Créer un projet PortalFlow directement depuis Zapier

## Démarrage rapide

1. Recherche "PortalFlow" dans l'annuaire d'apps Zapier
2. Connecte ton compte avec ta clé API PortalFlow (voir [AUTHENTICATION.md](AUTHENTICATION.md))
3. Crée un Zap avec un des 3 triggers ou l'action "Create Project"

## Exemples d'automatisations

- **Nouveau projet → email de bienvenue au client** (trigger `project_created` + action Gmail/Outlook)
- **Item approuvé → notification Slack** (trigger `item_approved` + action Slack)
- **Nouveau message → ligne ajoutée dans Google Sheets** (trigger `message_created` + action Sheets)
- **Formulaire Typeform rempli → projet créé dans PortalFlow** (trigger Typeform + action `create_project`)

## Support

contact@portalflow.com
