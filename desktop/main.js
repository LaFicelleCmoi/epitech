const { app, BrowserWindow, Notification, Menu, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

// Store for settings
let store;
async function initStore() {
  const Store = (await import('electron-store')).default;
  store = new Store({
    defaults: {
      locale: 'fr',
      windowBounds: { width: 1200, height: 800 }
    }
  });
}

function createWindow() {
  const bounds = store?.get('windowBounds') || { width: 1200, height: 800 };

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    minWidth: 800,
    minHeight: 600,
    title: 'ChatFlow',
    icon: path.join(__dirname, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#0c0c0c',
    autoHideMenuBar: false
  });

  // Load the frontend (adjust URL based on your setup)
  const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
  mainWindow.loadURL(frontendURL);

  // Save window size on resize
  mainWindow.on('resize', () => {
    const { width, height } = mainWindow.getBounds();
    store?.set('windowBounds', { width, height });
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Create menu
  const locale = store?.get('locale') || 'fr';
  createMenu(locale);
}

function createMenu(locale) {
  const isFr = locale === 'fr';

  const template = [
    {
      label: 'ChatFlow',
      submenu: [
        {
          label: isFr ? 'À propos' : 'About',
          role: 'about'
        },
        { type: 'separator' },
        {
          label: isFr ? 'Quitter' : 'Quit',
          accelerator: 'CmdOrCtrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: isFr ? 'Édition' : 'Edit',
      submenu: [
        { label: isFr ? 'Annuler' : 'Undo', role: 'undo' },
        { label: isFr ? 'Rétablir' : 'Redo', role: 'redo' },
        { type: 'separator' },
        { label: isFr ? 'Couper' : 'Cut', role: 'cut' },
        { label: isFr ? 'Copier' : 'Copy', role: 'copy' },
        { label: isFr ? 'Coller' : 'Paste', role: 'paste' },
        { label: isFr ? 'Tout sélectionner' : 'Select All', role: 'selectAll' }
      ]
    },
    {
      label: isFr ? 'Affichage' : 'View',
      submenu: [
        { label: isFr ? 'Recharger' : 'Reload', role: 'reload' },
        { label: isFr ? 'Forcer le rechargement' : 'Force Reload', role: 'forceReload' },
        { type: 'separator' },
        { label: isFr ? 'Zoom avant' : 'Zoom In', role: 'zoomIn' },
        { label: isFr ? 'Zoom arrière' : 'Zoom Out', role: 'zoomOut' },
        { label: isFr ? 'Taille réelle' : 'Reset Zoom', role: 'resetZoom' },
        { type: 'separator' },
        { label: isFr ? 'Plein écran' : 'Fullscreen', role: 'togglefullscreen' }
      ]
    },
    {
      label: isFr ? 'Langue' : 'Language',
      submenu: [
        {
          label: 'Français',
          type: 'radio',
          checked: locale === 'fr',
          click: () => switchLanguage('fr')
        },
        {
          label: 'English',
          type: 'radio',
          checked: locale === 'en',
          click: () => switchLanguage('en')
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function switchLanguage(locale) {
  store?.set('locale', locale);
  createMenu(locale);

  // Inform the renderer process to switch language
  if (mainWindow) {
    mainWindow.webContents.executeJavaScript(`
      localStorage.setItem('locale', '${locale}');
      window.dispatchEvent(new Event('storage'));
      location.reload();
    `);
  }
}

// Handle notification requests from renderer
ipcMain.on('show-notification', (event, { title, body }) => {
  if (Notification.isSupported()) {
    const notification = new Notification({
      title: title || 'ChatFlow',
      body: body || '',
      icon: path.join(__dirname, 'icon.png')
    });

    notification.on('click', () => {
      if (mainWindow) {
        mainWindow.show();
        mainWindow.focus();
      }
    });

    notification.show();
  }
});

// App lifecycle
app.whenReady().then(async () => {
  await initStore();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
