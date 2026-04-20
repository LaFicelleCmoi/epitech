# Security

## Gestion des secrets

**Aucun secret n'est committé en clair dans le repo.**

- `.env` et `.env.local` sont listés dans `.gitignore`
- Un fichier `.env.example` fournit un template avec des valeurs `CHANGE_ME`
- Chaque développeur copie `.env.example` en `.env.local` (pour le mode natif) ou `.env` (pour le mode Docker) et y met ses propres valeurs

## Génération d'un secret JWT fort

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Mettre la valeur dans `ACCESS_TOKEN_SECRET`.

## Hachage des mots de passe

Bcrypt avec 12 rounds (configuré dans `back/Controllers/AuthControllers.js`). Les mots de passe ne sont **jamais** stockés en clair ni retournés par l'API.

## Authentification

- JWT signé avec HMAC-SHA256
- Expiration 6h
- Passé en header `Authorization: Bearer <token>`
- Middleware `authenticate` vérifie le token sur toutes les routes sensibles

## Autorisation

- Middleware `checkRole(['owner', 'admin'])` pour les actions privilégiées
- Vérification d'ownership avant delete/edit de message (auteur ou owner/admin)
- Check de ban au moment du join serveur

## Rotation des secrets en production

En cas de fuite suspectée du `ACCESS_TOKEN_SECRET` :
1. Générer un nouveau secret fort
2. Mettre à jour `.env` sur tous les serveurs
3. Redémarrer l'application
4. Tous les tokens émis avec l'ancien secret sont invalidés → les users doivent se reconnecter

## Vulnérabilités connues

Aucune à ce jour. Rapport d'un problème de sécurité : ouvrir une issue GitHub avec le label `security`.
