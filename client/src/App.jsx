import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { setAppLoading } from './store/slices/appSlice'
import { setTheme } from './store/slices/themeSlice'
import SessionExpiredDialog from './components/ui/SessionExpiredDialog'

import api from './services/api'
import PageLoader from './components/ui/PageLoader'
import minecraftMusic from './assets/sound-minecraft.mp3'

import LandingPage from './pages/LandingPage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import PendingApproval from './pages/auth/PendingApproval'

import FarmersAccounts from './pages/admin/FarmersAccounts'
import AdminExtensionWorkers from './pages/admin/ExtensionWorkers'
import AdminKnowledgeRepository from './pages/admin/KnowledgeRepository'
import Reports from './pages/admin/Reports'

import SharedDashboard from './pages/shared/Dashboard'
import SharedNotifications from './pages/shared/Notifications'

import FarmerKnowledgeRepository from './pages/farmer/KnowledgeRepository'
import FarmerExtensionWorkers from './pages/farmer/ExtensionWorkers'

import Tickets from './pages/extensionworker/Tickets'

import Init from './pages/system/init'
import Overview from './pages/system/panel/Overview'
import Endpoints from './pages/system/panel/Endpoints'
import SystemControl from './pages/system/panel/SystemControl'

function App() {
  const theme = useSelector((state) => state.theme)
  const audioRef = useRef(null)


  useEffect(() => {
    if (!theme.minecraftMusic) {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
      return
    }

    const audio = new Audio(minecraftMusic)
    audio.loop = true
    audio.volume = 0.3
    audioRef.current = audio

    audio.play().catch(() => {
      const playOnClick = () => {
        audio.play().catch(() => { })
        document.removeEventListener('click', playOnClick, true)
      }
      document.addEventListener('click', playOnClick, true)
    })

    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [theme.minecraftMusic])

  const dispatch = useDispatch()
  const isLoading = useSelector((state) => state.app.isLoading)
  const [systemDisabled, setSystemDisabled] = useState(false)
  const [themeLoaded, setThemeLoaded] = useState(false)

  useEffect(() => {
    api.get('/theme/').then(res => {
      dispatch(setTheme(res.data))
      setThemeLoaded(true)
    }).catch(() => setThemeLoaded(true))
    api.get('/system/config/').then(res => {
      setSystemDisabled(!res.data.isSystemEnabled)
    }).catch(() => { })

    let pollInterval = null

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const ws = new WebSocket(`${wsProtocol}//${window.location.host}/ws/system/`)
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data)
      if (data.type === 'theme') {
        const { type, ...themeData } = data
        dispatch(setTheme(themeData))
      } else if (data.type === 'config') {
        setSystemDisabled(!data.isSystemEnabled)
      }
    }
    ws.onerror = () => ws.close()
    return () => ws.close()
  }, [dispatch])



  if (!themeLoaded) return <PageLoader onDone={() => { }} />

  if (systemDisabled && !window.location.pathname.startsWith('/system/')) return (
    <div className='min-h-screen flex flex-col items-center justify-center gap-4 text-center px-8'
      style={{ backgroundColor: theme.backgroundColor }}>
      <span className='text-6xl'>🔧</span>
      <h1 className='text-2xl font-bold' style={{ color: theme.textColor }}>System Under Maintenance</h1>
      <p className='text-sm opacity-60' style={{ color: theme.textColor }}>
        We're currently performing maintenance. Please check back later.
      </p>
    </div>
  )

  return (
    <div style={{ fontFamily: theme.minecraftMode ? 'Minecraft' : 'sans-serif' }}>
      {isLoading && <PageLoader onDone={() => dispatch(setAppLoading(false))} />}
      <div style={{ visibility: isLoading ? 'hidden' : 'visible' }}>
        <BrowserRouter>

          <Routes>
            {/* Public */}
            <Route path='/' element={<LandingPage />} />
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/pending-approval' element={<PendingApproval />} />

            {/* Shared */}
            <Route path='/dashboard' element={<SharedDashboard />} />
            <Route path='/notifications' element={<SharedNotifications />} />

            {/* Admin */}
            <Route path='/admin/farmers' element={<FarmersAccounts />} />
            <Route path='/admin/extension-workers' element={<AdminExtensionWorkers />} />
            <Route path='/admin/knowledge-repository' element={<AdminKnowledgeRepository />} />
            <Route path='/admin/reports' element={<Reports />} />

            {/* Farmer */}
            <Route path='/farmer/knowledge-repository' element={<FarmerKnowledgeRepository />} />
            <Route path='/farmer/extension-workers' element={<FarmerExtensionWorkers />} />

            {/* Extension Worker */}
            <Route path='/extension-worker/tickets' element={<Tickets />} />

            {/* SuperAdmin */}
            <Route path='/system/init' element={<Init />} />
            <Route path='/system/panel/overview' element={<Overview />} />
            <Route path='/system/panel/endpoints' element={<Endpoints />} />
            <Route path='/system/panel/control' element={<SystemControl />} />
          </Routes>
          <SessionExpiredDialog />
        </BrowserRouter>
      </div>
    </div>
  )
}

export default App
