// export function renderHomeWelcome(containerElement, user) {
//   containerElement.innerHTML = '';

//   const wrapper = document.createElement('div');
//   wrapper.className = 'home-welcome-container';
  
//   wrapper.style.display = 'flex';
//   wrapper.style.flexDirection = 'column';
//   wrapper.style.alignItems = 'center';
//   wrapper.style.justifyContent = 'center';
//   wrapper.style.flex = '1';
//   wrapper.style.backgroundColor = '#313338';
//   wrapper.style.color = '#e5e7eb';

//   const userName = user && user.name ? user.name : 'Aventurier';

//   wrapper.innerHTML = `
//     <div style="margin-bottom: 1.5rem; transition: transform 0.5s; opacity: 0.9;">
//       <img src="/logo.png" alt="ChatFlow Logo" width="150" height="150" style="object-fit: contain; filter: drop-shadow(0 0 15px rgba(56,189,248,0.2));">
//     </div>
    
//     <h1 style="font-size: 1.875rem; font-weight: 700; margin-bottom: 0.5rem;">
//       Bon retour, ${userName} ! 👋
//     </h1>
    
//     <p style="color: #9ca3af; text-align: center; max-width: 28rem; margin-bottom: 2rem; line-height: 1.625;">
//       Vous êtes sur la page d'accueil de ChatFlow. Sélectionnez un serveur sur la barre de gauche pour rejoindre une communauté, ou créez le vôtre !
//     </p>

//     <button id="create-server-btn" style="padding: 0.75rem 1.5rem; background-color: #5865f2; color: white; font-weight: 600; border: none; border-radius: 0.375rem; cursor: pointer; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
//       + Créer un nouveau serveur
//     </button>
//   `;

//   containerElement.appendChild(wrapper);

//   const btn = wrapper.querySelector('#create-server-btn');
//   if (btn) {
//     btn.addEventListener('click', () => {
//       alert("Ouvre ici ton modal de création de serveur !");
//     });
//   }
// }