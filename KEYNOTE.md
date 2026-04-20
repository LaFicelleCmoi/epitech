# Keynote — ChatFlow

## Structure imposée (sujet RTC Strikes Back)

1. Introduction
2. Architecture technique
3. Méthodologie
4. Démonstration live
5. Code walkthrough d'une feature

---

## 1. Introduction (2 min)

**Qui** : 4 étudiants Epitech — Augustin, Olysse, Clyde, Loïs
**Quoi** : ChatFlow, une app de messagerie temps réel type Discord
**Pourquoi** : projet *RTC Strikes Back* — simuler des conditions startup réelles
**Objectifs** : livrer un produit qui fonctionne, multiplateforme, démontrant notre capacité d'ingénierie

**Chiffres clés à annoncer** :
- 3 phases du sujet **100% complètes**
- **15 features bonus** au-delà du cahier des charges
- **8 langues** supportées (le sujet en demandait 2)
- **30+ routes API** documentées avec Swagger
- **7 suites de tests** avec coverage > 70%

---

## 2. Architecture technique (5 min)

### Stack
- **Frontend web** : Next.js 14 + React 18 + Socket.IO Client
- **Backend** : Node.js 20 + Express + Socket.IO 4
- **Bases de données hybride** :
  - PostgreSQL (users, servers, bans, friendships) — données relationnelles
  - MongoDB (messages, réactions, conversations) — documents flexibles
- **Desktop** : Electron 33 + electron-builder
- **DevOps** : Docker Compose, GitHub Actions CI/CD

### Schéma à montrer
```
[Web Client] ←→ [Backend REST + WS] ←→ [PostgreSQL + MongoDB]
     ↑                ↑
[Electron App] ───────┘
```

### Justifications à assumer
- **Pourquoi Next.js ?** SSR, routing intégré, écosystème React mature
- **Pourquoi 2 bases ?** PostgreSQL pour la cohérence relationnelle (users/servers/bans), MongoDB pour la scalabilité des messages (millions de documents possibles, flexibilité du schéma pour reactions/replies)
- **Pourquoi Electron ?** Réutilisation intégrale du frontend web, un seul codebase pour web + desktop
- **Pourquoi Docker ?** Environnement identique pour tous les devs, déploiement en 1 commande

---

## 3. Méthodologie (3 min)

### Organisation
- **Répartition claire** des rôles (voir ORGANIZATION.md)
- **Git workflow** : branches par feature + PR + review
- **Sprints de 2-3 jours** avec point quotidien
- **CI/CD** déclenché sur chaque push (tests auto)

### Décisions techniques assumées
- Clair séparation **routes / controllers / models / middleware**
- JWT en header Authorization (stateless)
- Socket.IO authentifié via le même JWT
- Validation des permissions via middleware `checkRole`
- Tests avec vraies bases de données (pas de mocks lourds) → tests fiables

### Ce qu'on referait différemment
- Commencer les tests plus tôt
- Utiliser TypeScript dès le début
- Mettre en place un tableau Kanban GitHub Projects dès le sprint 0

---

## 4. Démonstration live (10 min)

**Scénario à suivre** (deux ordinateurs côte à côte : Alice et Bob)

1. **Signup Alice** → inscription avec avatar
2. **Signup Bob** → deuxième compte
3. **Alice crée un serveur** "Demo Epitech"
4. **Alice copie le code d'invitation** → Bob rejoint
5. **Alice crée un channel** "général"
6. **Chat temps réel** — Alice envoie "Hello Bob!" → apparait instantanément chez Bob
7. **Bob répond avec un GIF** via Tenor
8. **Alice envoie un message vocal** 🎤
9. **Bob réagit avec 🎉**
10. **Alice mentionne @Bob** — notification chez Bob
11. **Reply** — Alice répond à un message de Bob
12. **Modération** — Alice kick Bob → Bob ne peut plus poster
13. **Alice rebanni Bob temporairement** → Bob ne peut plus rejoindre
14. **Unban** → Bob rejoint
15. **DM** — Alice ouvre une conversation privée avec Bob
16. **Système d'amis** — Alice envoie une demande d'ami à Bob
17. **Changement de langue** — Alice passe en japonais, tout change
18. **Application desktop** — Alice ferme le navigateur et ouvre ChatFlow en app native
19. **Notification desktop** — Bob écrit, Alice reçoit une notif système même si l'app est en arrière-plan

---

## 5. Code walkthrough — Le système de mentions (5 min)

**Pourquoi ce choix** : feature qui touche à **tous les niveaux** de la stack (UI, state, socket, backend, notification native) et qu'on n'a pas implémenté "par défaut".

### Flow complet à montrer

1. **Input utilisateur** (`MessageInput.js`)
   - Détection de `@` → ouvre `MentionSuggestions`
   - Autocomplétion filtrée sur les users du channel
   - Navigation clavier (↑↓ Tab Enter)

2. **Envoi socket** (`ChatArea.js`)
   - `socket.emit('channel message', { channelId, msg: "@Bob salut" })`

3. **Backend** (`back/app.js` socket handler)
   - `createMessageService()` persiste en MongoDB
   - Le message est relayé à tous les participants du channel

4. **Rendu côté récepteur** (`renderMessage.js`)
   - Parse `@(\S+)` → `<span class="mention">`
   - Si c'est le user courant → `class="mention-me"` avec highlight

5. **Notification système** (`chat.js` socket global)
   - Détection de mention dans le message entrant
   - `sendNotification()` → `new Notification()` ou IPC Electron

**Points à souligner** :
- Séparation des responsabilités claire
- Utilisation du même composant pour channels ET DM
- Testable (comportement prévisible, peu d'effets de bord)

---

## Questions / Réponses préparées

### "Pourquoi MongoDB **et** PostgreSQL ?"
PostgreSQL pour les entités relationnelles (contraintes d'intégrité, cascade deletes, requêtes JOIN complexes comme "liste des channels d'un serveur où l'user a le rôle admin"). MongoDB pour les messages car : volume élevé, schéma flexible (on a ajouté `reactions`, `replyTo`, `edited` au fil du projet sans migration), pas de besoin de transactions multi-messages.

### "Est-ce que ça scale ?"
L'architecture est prête :
- Socket.IO peut être scaled horizontalement avec Redis adapter
- PostgreSQL supporte read replicas
- MongoDB sharding natif
- Le backend est stateless (JWT) donc load-balancing trivial

### "Comment gérez-vous la sécurité ?"
- Passwords hashés avec bcrypt (12 rounds)
- JWT signés côté serveur avec un secret fort
- Middleware `authenticate` sur toutes les routes sensibles
- Middleware `checkRole` pour les actions privilégiées
- Validation des permissions avant delete de message (owner/admin ou auteur)

### "Pourquoi Electron et pas Tauri ?"
Electron est plus mature, mieux documenté, meilleur support des API natives (Notification, Menu). Le sujet autorisait les deux.

### "Tests ?"
7 suites de tests d'intégration avec Jest + Supertest sur toutes les routes (auth, servers, channels, messages, moderation, friends, conversations). Coverage > 70%. Lancés automatiquement en CI.

### "Combien de temps ?"
~3 semaines, 4 développeurs, organisation en sprints courts.

### "Si vous aviez plus de temps ?"
- Appels vocaux/vidéo via WebRTC
- Partage de fichiers (S3 / Cloudflare R2)
- Mode sombre/clair
- Recherche full-text dans les messages
- Threads (sous-conversations)

### "Le point le plus difficile ?"
Synchroniser l'état des messages entre plusieurs onglets + desktop avec Socket.IO (notamment les badges de non-lus). On a utilisé un socket global dans `chat.js` qui joint automatiquement tous les channels de l'user au connect.
