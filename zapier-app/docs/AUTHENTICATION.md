# Authentification

PortalFlow utilise une authentification par **clé API**.

## Récupérer sa clé API

1. Se connecter à PortalFlow
2. Aller dans **Paramètres → Intégrations**
3. Cliquer sur **Générer une clé API** (ou copier la clé existante)
4. La clé commence par `pk_`

## Fonctionnement

Chaque appel à l'API PortalFlow inclut la clé dans l'en-tête HTTP :

```
Authorization: Bearer pk_xxxxxxxxxxxx
```

L'app Zapier gère cet en-tête automatiquement une fois la connexion établie — il n'y a rien à configurer côté Zap.

## Test de connexion

Lors de la connexion d'un compte dans Zapier, l'app appelle `GET /api/zapier/me` pour vérifier que la clé est valide. En cas d'échec, vérifier que :
- La clé a bien été copiée en entier (pas d'espace en début/fin)
- La clé n'a pas été régénérée depuis (une régénération invalide l'ancienne clé)

## Sécurité

- Ne jamais partager sa clé API publiquement (dépôt de code, capture d'écran, forum)
- Régénérer immédiatement la clé en cas de doute sur une fuite
- Une seule clé active par compte à la fois
