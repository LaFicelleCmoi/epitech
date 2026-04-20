# Organisation du projet ChatFlow

## Équipe

| Membre | GitHub | Rôle principal |
|--------|--------|----------------|
| Augustin Viemont | [@Augustin734](https://github.com/Augustin734) | Backend — API, base de données, Socket.IO |
| Olysse Perles | [@S6leak](https://github.com/S6leak) | Frontend — UI/UX, composants React |
| Clyde Viscione | [@ClydeViscione](https://github.com/ClydeViscione) | Desktop — Electron, notifications, packaging |
| Loïs Clerc | [@LaFicelleCmoi](https://github.com/LaFicelleCmoi) | DevOps — CI/CD, Docker, tests, intégration |

## Répartition des tâches par phase

### Phase 1 — Core features
| Feature | Responsable |
|---------|-------------|
| Kick | Augustin (backend) + Olysse (UI) |
| Ban permanent | Augustin (backend + table) + Olysse (modale) |
| Ban temporaire | Augustin (backend + expiration) + Olysse (UI duration) |
| Édition de messages | Augustin (route PUT) + Olysse (mode édition) |

### Phase 2 — Enhancement
| Feature | Responsable |
|---------|-------------|
| i18n (8 langues) | Olysse (fichiers JSON + contexte React) |
| CI/CD | Loïs (GitHub Actions + Docker) |
| API GIF Tenor | Olysse (GifPicker) |
| Messages privés | Augustin (backend + sockets) + Olysse (DMChat, DMList) |
| Réactions emoji | Augustin (schema + routes) + Olysse (EmojiPicker) |

### Phase 3 — Desktop
| Feature | Responsable |
|---------|-------------|
| App Electron | Clyde (main.js, preload.js) |
| Build Win/Mac/Linux | Clyde (electron-builder) + Loïs (CI) |
| Notifications système | Clyde (IPC + notifications.js) |
| Menu natif multilingue | Clyde (Menu.buildFromTemplate) |

### Bonus (extras)
| Feature | Responsable |
|---------|-------------|
| Avatars personnalisés | Augustin (backend) + Olysse (SettingsModal) |
| Système d'amis | Augustin (tables + routes) + Olysse (FriendsPanel) |
| Mentions @ + autocomplete | Olysse |
| Reply / Répondre | Augustin (schema) + Olysse (UI) |
| Messages vocaux | Olysse (AudioRecorder) |
| Badges non-lus | Olysse (socket + state) |
| Settings Discord-style | Olysse |
| Tests + coverage | Loïs |
| README + Swagger | Loïs + Augustin |

## Workflow Git

Branches :
- `main` — branche stable, protégée, merge via PR
- `feature/<name>` — branche par feature (ex. `feature/friend-system`)
- `fix/<name>` — branche de bug fix

Convention de commits (Conventional Commits) :
- `feat:` nouvelle fonctionnalité
- `fix:` correction de bug
- `docs:` documentation
- `refactor:` refactoring
- `test:` ajout/modification de tests
- `ci:` pipeline CI/CD
- `chore:` maintenance

## Outils de suivi

- **GitHub Issues** — suivi des bugs et features
- **GitHub Projects** — tableau Kanban (To Do / In Progress / Review / Done)
- **Pull Requests** — revue de code obligatoire avant merge
- **GitHub Actions** — CI auto sur chaque push

## Méthodologie

- **Sprints courts** (2-3 jours) avec point quotidien
- **Répartition claire** : chaque membre a un domaine principal mais peut contribuer ailleurs
- **Pair programming** occasionnel sur les parties complexes (sockets, WebRTC, i18n)
- **Code review** systématique via PR GitHub
- **Tests** écrits au fur et à mesure, pas en fin de projet

## Déroulé chronologique

1. **Sprint 0** — Setup projet, Docker Compose, structure back/front
2. **Sprint 1** — Phase 1 (kick, ban, edit message)
3. **Sprint 2** — Phase 2 (i18n, CI/CD, GIF, DM, réactions)
4. **Sprint 3** — Phase 3 (Electron, notifications, packaging)
5. **Sprint 4** — Features bonus (amis, avatars, mentions, reply, audio...)
6. **Sprint 5** — Tests, documentation, polish
7. **Sprint 6** — Préparation démo + keynote
