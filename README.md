<div align="center">

# ChatFlow

**A modern real-time chat application — built for communities, friends, and teams.**

[![CI/CD](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)](.github/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white)](https://mongodb.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![Electron](https://img.shields.io/badge/Electron-Desktop-47848F?logo=electron&logoColor=white)](https://electronjs.org)

</div>

---

## Overview

**ChatFlow** is a complete real-time communication platform inspired by modern messaging tools. Built as part of the *RTC Strikes Back* project at Epitech, it delivers a polished experience across **web** and **desktop**, with a robust Node.js backend, a hybrid PostgreSQL + MongoDB architecture, and a feature set covering everything from server moderation to private messaging.

The project simulates real startup conditions: tight deadlines, technical decisions to own, and a deliverable that has to *just work*.

---

## Features

### Core messaging
- **Real-time chat** powered by Socket.IO with channels, typing indicators, and online presence
- **Private messages** (DMs) with one-to-one conversations and unread tracking
- **Message editing** with edit history indicator
- **Message replies** with quoted preview
- **Emoji reactions** on every message
- **@Mentions** with autocomplete and highlighted notifications
- **Voice messages** recorded directly in the browser
- **GIF picker** powered by the Tenor API
- **Image rendering** inline (auto-detect URLs)

### Server management
- **Servers & channels** with role-based permissions (owner / admin / member)
- **Invite codes** for joining servers
- **Kick** members from a server
- **Permanent ban** with reason tracking
- **Temporary ban** with automatic expiration
- **Server moderation panel** with banned users list

### User experience
- **Custom avatars** (image upload)
- **Profile settings** with Discord-style modal
- **Friend system** with requests, accept/reject, and quick DM
- **Unread badges** on channels, servers, and DMs
- **System notifications** (browser + native desktop)
- **Internationalization** in **8 languages**: 🇫🇷 French, 🇬🇧 English, 🇩🇪 German, 🇯🇵 Japanese, 🇪🇸 Spanish, 🇮🇹 Italian, 🇨🇳 Chinese, 🇰🇷 Korean

### Desktop application
- **Native Electron app** for **Windows**, **macOS**, and **Linux**
- **Native menus** with multilingual support
- **System notifications** for incoming messages
- **Persistent window state**

### Engineering quality
- **CI/CD pipeline** on GitHub Actions (build, test, Docker, desktop installer, release on tag)
- **Swagger API documentation** auto-generated
- **Docker Compose** for one-command deployment
- **Modular architecture** (routes / controllers / models / middleware)

---

## Tech stack

| Layer        | Technologies                                                          |
|--------------|-----------------------------------------------------------------------|
| **Frontend** | Next.js 14, React 18, Socket.IO Client, Biome                         |
| **Backend**  | Node.js 20, Express 4, Socket.IO 4, JWT, Bcrypt, Swagger              |
| **Databases**| PostgreSQL 16 (relational), MongoDB 7 (messages, reactions, replies)  |
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
        ▲                │  • REST API      │      │   bans, etc.) │
        │                │  • Socket.IO     │      └───────────────┘
┌─────────────────┐      │  • JWT Auth      │      ┌───────────────┐
│  Electron App   │◄────►│  • Swagger Docs  │◄────►│   MongoDB     │
│ (Win/Mac/Linux) │      └──────────────────┘      │  (messages,   │
└─────────────────┘                                │  reactions)   │
                                                   └───────────────┘
```

---

## Getting started

### Prerequisites
- [Docker](https://www.docker.com/) & Docker Compose
- (Optional) [Node.js 20+](https://nodejs.org) for desktop builds

### Run with Docker (recommended)

```bash
docker compose up --build
```

That's it. The full stack is running.

### Available services

| Service              | URL                                 |
|----------------------|-------------------------------------|
| Web application      | http://localhost:3000               |
| Backend API          | http://localhost:3001               |
| API documentation    | http://localhost:3001/api-docs      |
| PgAdmin              | http://localhost:5050               |
| Mongo Express        | http://localhost:8081               |

### Run the desktop app

```bash
cd desktop
npm install
npm start                # Run in development
npm run build:win        # Build .exe installer (Windows)
npm run build:mac        # Build .dmg (macOS)
npm run build:linux      # Build .AppImage / .deb (Linux)
```

---

## Project structure

```
.
├── back/               # Express + Socket.IO API
│   ├── Config/         # DB, Swagger, Mongo
│   ├── Controllers/    # Request handlers
│   ├── Models/         # DB queries & schemas
│   ├── Routes/         # Route definitions
│   ├── middleware/     # JWT auth, role checks
│   └── app.js          # Entry point
├── front/              # Next.js client
│   ├── components/     # React components (chat, dm, server, layout, modal)
│   ├── pages/          # Routes (Next.js pages router)
│   ├── i18n/           # Translations (8 languages)
│   ├── style/          # CSS modules
│   └── utils/          # Notifications, message rendering
├── desktop/            # Electron wrapper
│   ├── main.js         # Main process (menus, notifications)
│   └── preload.js      # IPC bridge
├── DataBase/           # PostgreSQL init scripts
├── Data-Analyse/       # KPI SQL queries
├── .github/workflows/  # CI/CD pipeline
└── docker-compose.yml  # Full stack orchestration
```

---

## CI/CD

The pipeline runs automatically on:
- Every **push** on any branch
- Every **pull request** to `main`
- Every **tag** (`v*`) — triggers Docker image builds, desktop installers (Win/Mac/Linux) and a GitHub Release

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for the full configuration.

---

## Auteurs
[Viemont_Augustin](https://github.com/Augustin734)
[Perles_Olysse](https://github.com/S6leak)
[Viscione_Clyde](https://github.com/ClydeViscione)
[Clerc_Lois](https://github.com/LaFicelleCmoi)
