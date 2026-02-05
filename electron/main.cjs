const { app, BrowserWindow } = require('electron')
const path = require('path')

// The server is built to server/dist/index.js (CommonJS)
const { startServer } = require('../server/dist/index')

const isDev = !app.isPackaged && process.env.ELECTRON_DEV !== '0'

let mainWindow

async function createWindow(serverPort) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'PostJohan',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.setMenuBarVisibility(false)

  if (isDev) {
    // In dev mode, load Vite dev server
    await mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    // In production, load from the built frontend served by Express
    await mainWindow.loadURL(`http://localhost:${serverPort}`)
  }
}

app.whenReady().then(async () => {
  // Determine the static directory for production builds
  const staticDir = isDev
    ? undefined
    : path.join(__dirname, '..', 'dist')

  // Start the backend server (port 0 = random available port in prod)
  const port = isDev ? 8080 : 0
  const serverPort = await startServer(staticDir, port)
  console.log(`Backend ready on port ${serverPort}`)

  await createWindow(serverPort)

  app.on('activate', async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow(serverPort)
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
