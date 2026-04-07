<div align="center">

# ChatFlow

**Une application de messagerie temps réel moderne — pensée pour les communautés, les amis et les équipes.**

[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](.github/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?logo=electron&logoColor=white)](https://electronjs.org)

</div>

---

## Présentation

**ChatFlow** est une plateforme complète de communication en temps réel inspirée des outils de messagerie modernes. Développée dans le cadre du projet *RTC Strikes Back* à Epitech, elle propose une expérience soignée à la fois sur le **web** et en **application desktop**, portée par un backend Node.js robuste, une architecture hybride PostgreSQL + MongoDB, et un ensemble de fonctionnalités allant de la modération de serveurs aux messages privés.

Le projet simule les conditions réelles d'une startup : délais serrés, choix techniques à assumer, et un produit livrable qui doit *fonctionner du premier coup*.

---

## Fonctionnalités

### Messagerie principale
- **Chat temps réel** propulsé par Socket.IO avec channels, indicateurs de frappe et présence en ligne
- **Messages privés** (DM) avec conversations one-to-one et suivi des messages non lus
- **Édition des messages** avec indicateur d'historique
- **Réponses aux messages** avec aperçu du message cité
- **Réactions emoji** sur chaque message
- **Mentions @** avec autocomplétion et notifications mises en évidence
- **Messages vocaux** enregistrés directement depuis le navigateur
- **Sélecteur de GIF** propulsé par l'API Tenor
- **Affichage d'images** en ligne (détection automatique des URLs)

### Gestion des serveurs
- **Serveurs et channels** avec permissions par rôle (owner / admin / member)
- **Codes d'invitation** pour rejoindre les serveurs
- **Expulsion (kick)** des membres d'un serveur
- **Bannissement permanent** avec suivi du motif
- **Bannissement temporaire** avec expiration automatique
- **Panneau de modération** avec liste des utilisateurs bannis

### Expérience utilisateur
- **Avatars personnalisés** (upload d'image)
- **Paramètres de profil** avec une modale style Discord
- **Système d'amis** avec demandes, acceptation/refus et accès rapide aux DM
- **Badges de notifications** sur les channels, serveurs et DM
- **Notifications système** (navigateur + desktop natif)
- **Internationalisation** en **8 langues** : 🇫🇷 Français, 🇬🇧 Anglais, 🇩🇪 Allemand, 🇯🇵 Japonais, 🇪🇸 Espagnol, 🇮🇹 Italien, 🇨🇳 Chinois, 🇰🇷 Coréen

### Application desktop
- **Application Electron native** pour **Windows**, **macOS** et **Linux**
- **Menus natifs** avec support multilingue
- **Notifications système** pour les messages entrants
- **Conservation de l'état de la fenêtre**

### Qualité d'ingénierie
- **Pipeline CI/CD** sur GitHub Actions (build, tests, Docker, installeur desktop, release sur tag)
- **Documentation API Swagger** générée automatiquement
- **Docker Compose** pour un déploiement en une seule commande
- **Architecture modulaire** (routes / controllers / models / middleware)

---

## Stack technique

| Couche       | Technologies                                                          |
|--------------|-----------------------------------------------------------------------|
| **Frontend** | Next.js 14, React 18, Socket.IO Client, Biome                         |
| **Backend**  | Node.js 20, Express 4, Socket.IO 4, JWT, Bcrypt, Swagger              |
| **Bases de données** | PostgreSQL 16 (relationnel), MongoDB 7 (messages, réactions, replies) |
| **Desktop**  | Electron 33, electron-builder, electron-store                         |
| **DevOps**   | Docker, Docker Compose, GitHub Actions, PgAdmin, Mongo Express        |
| **APIs**     | Tenor (GIF), Web Notifications API, MediaRecorder API                 |

---

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌───────────────┐
│   Next.js Web   │◄────►│  Express + WS    │◄────►│  PostgreSQL   │
│   (port 3000)   │      │   (port 3001)    │      │  (users,      │
└─────────────────┘      │                  │      │   servers,    │
        ▲                │  • API REST      │      │   bans, etc.) │
        │                │  • Socket.IO     │      └───────────────┘
┌─────────────────┐      │  • Auth JWT      │      ┌───────────────┐
│  App Electron   │◄────►│  • Docs Swagger  │◄────►│   MongoDB     │
│ (Win/Mac/Linux) │      └──────────────────┘      │  (messages,   │
└─────────────────┘                                │  réactions)   │
                                                   └───────────────┘
```

---

## Démarrage rapide

### Prérequis
- [Docker](https://www.docker.com/) et Docker Compose
- (Optionnel) [Node.js 20+](https://nodejs.org) pour les builds desktop

### Lancer avec Docker (recommandé)

```bash
docker compose up --build
```

C'est tout. La stack complète est en marche.

### Services disponibles

| Service                  | URL                                 |
|--------------------------|-------------------------------------|
| Application web          | http://localhost:3000               |
| API backend              | http://localhost:3001               |
| Documentation API        | http://localhost:3001/api-docs      |
| PgAdmin                  | http://localhost:5050               |
| Mongo Express            | http://localhost:8081               |

### Lancer l'application desktop

```bash
cd desktop
npm install
npm start                # Lancer en développement
npm run build:win        # Construire l'installeur .exe (Windows)
npm run build:mac        # Construire le .dmg (macOS)
npm run build:linux      # Construire le .AppImage / .deb (Linux)
```

---

## Structure du projet

```
.
├── back/               # API Express + Socket.IO
│   ├── Config/         # DB, Swagger, Mongo
│   ├── Controllers/    # Gestionnaires de requêtes
│   ├── Models/         # Requêtes et schémas BDD
│   ├── Routes/         # Définition des routes
│   ├── middleware/     # Auth JWT, vérification des rôles
│   └── app.js          # Point d'entrée
├── front/              # Client Next.js
│   ├── components/     # Composants React (chat, dm, server, layout, modal)
│   ├── pages/          # Routes (Pages Router de Next.js)
│   ├── i18n/           # Traductions (8 langues)
│   ├── style/          # Modules CSS
│   └── utils/          # Notifications, rendu des messages
├── desktop/            # Wrapper Electron
│   ├── main.js         # Process principal (menus, notifications)
│   └── preload.js      # Pont IPC
├── DataBase/           # Scripts d'initialisation PostgreSQL
├── Data-Analyse/       # Requêtes SQL pour les KPI
├── .github/workflows/  # Pipeline CI/CD
└── docker-compose.yml  # Orchestration de la stack complète
```

---

## CI/CD

Le pipeline se déclenche automatiquement sur :
- Chaque **push** sur n'importe quelle branche
- Chaque **pull request** vers `main`
- Chaque **tag** (`v*`) — déclenche les builds des images Docker, les installeurs desktop (Win/Mac/Linux) et une release GitHub

Voir [`.github/workflows/ci.yml`](.github/workflows/ci.yml) pour la configuration complète.

---

## Auteurs

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Augustin734">
        <img src="https://github.com/Augustin734.png" width="100" height="100" style="border-radius: 50%;" alt="Augustin Viemont"/>
        <br />
        <sub><b>Augustin Viemont</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/S6leak">
        <img src="https://github.com/S6leak.png" width="100" height="100" style="border-radius: 50%;" alt="Olysse Perles"/>
        <br />
        <sub><b>Olysse Perles</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/ClydeViscione">
        <img src="https://github.com/ClydeViscione.png" width="100" height="100" style="border-radius: 50%;" alt="Clyde Viscione"/>
        <br />
        <sub><b>Clyde Viscione</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/LaFicelleCmoi">
        <img src="https://github.com/LaFicelleCmoi.png" width="100" height="100" style="border-radius: 50%;" alt="Loïs Clerc"/>
        <br />
        <sub><b>Loïs Clerc</b></sub>
      </a>
    </td>
  </tr>
</table>

<div align="center">
  <sub>Conçu avec passion à <a href="https://www.epitech.eu/">Epitech</a> — projet <i>RTC Strikes Back</i></sub>
</div>
