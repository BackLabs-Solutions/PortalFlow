# Zapier Reviewer Test Account

This document explains how to log in to PortalFlow as the reviewer test account and how to exercise every trigger and action in the Zapier integration.

## Login

PortalFlow uses **passwordless magic-link authentication** — there is no password to share or reset.

1. Go to **https://portalflow-dashboard.vercel.app/login**
2. Enter the email: `integration-testing@zapier.com`
3. Click "Envoyer le lien magique" ("Send magic link")
4. Check the `integration-testing@zapier.com` inbox and click the link — it signs you in directly, no further setup needed
5. The link is a JWT valid for 15 minutes; once signed in, the session (also a JWT) lasts 7 days. Request a new link any time — the account itself never expires

The account is provisioned on the **Agency** tier, PortalFlow's highest tier, so no feature or trial limitation applies.

## What's pre-populated

The account already has one sample project, so you don't need to build data from scratch to test the integration:

- **Project:** "Website Redesign — Acme Corp" (status: active)
- **Checklist items:** one already approved, two pending
- **Files:** one sample file (metadata only — see note below)
- **Messages:** a short exchange between the freelancer and the client

## Finding the API key

The Zapier integration authenticates with an API key (`Authorization: Bearer <key>`), not the session JWT used by the dashboard UI.

1. Once logged in, go to **Paramètres** ("Settings") in the top nav
2. Scroll to **"Clé API — Zapier"**
3. An API key is already generated for this account. Click **"Régénérer la clé"** ("Regenerate key") if you need a fresh one — note this invalidates the previous key

## Exercising each trigger

**New Project Created** (`project_created`)
Dashboard → "Nouveau projet" → fill in name/client → "Créer le projet". The new project appears immediately in `GET /api/zapier/projects/recent`.

**Client Approved Item** (`item_approved`)
Open the sample project → copy the "Lien de partage client" (client share link) card → open that link in a new tab (this simulates the client's view, no login required) → click "Approuver" on a pending checklist item.

**New Message** (`message_created`)
Either post a message from the project detail page (freelancer side) or from the client portal link above (client side) — both fire this trigger.

## Exercising the action

**Create Project** (`create_project`)
This is what the Zapier action step does automatically — configure a Zap with this action and run it; the resulting project will appear in the dashboard's project list under the test account.

## API documentation

Full OpenAPI 3.0 spec, covering every endpoint used by this integration and the rest of the API: **https://portalflow.onrender.com/openapi.json**

## Notes on scope

- No payment or financial features are exposed anywhere in the product — checklist approval and messaging are the only client-facing actions.
- File "upload" currently stores name/size metadata only (no binary storage yet); this doesn't affect the Zapier integration, which only reads/writes file metadata.
