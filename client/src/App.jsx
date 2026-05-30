import { useEffect, useRef } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useSelector } from 'react-redux'
import LandingPage from './pages/LandingPage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import PendingApproval from './pages/auth/PendingApproval'
import Dashboard from './pages/admin/Dashboard'
import FarmersAccounts from './pages/admin/FarmersAccounts'
import ExtensionWorkers from './pages/admin/ExtensionWorkers'
import KnowledgeRepository from './pages/admin/KnowledgeRepository'
import Reports from './pages/admin/Reports'
import Settings from './pages/admin/Settings'
import Init from './pages/system/init'
import Overview from './pages/system/panel/Overview'
import Endpoints from './pages/system/panel/Endpoints'
import SystemControl from './pages/system/panel/SystemControl'
import PageLoader from './components/ui/PageLoader'
import minecraftMusic from './assets/sound-minecraft.mp3'

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



  return (
    <div style={{ fontFamily: theme.minecraftMode ? 'Minecraft' : 'sans-serif' }}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LandingPage />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/pending-approval' element={<PendingApproval />} />
          <Route path='/admin/dashboard' element={<Dashboard />} />
          <Route path='/admin/farmers' element={<FarmersAccounts />} />
          <Route path='/admin/extension-workers' element={<ExtensionWorkers />} />
          <Route path='/admin/knowledge-repository' element={<KnowledgeRepository />} />
          <Route path='/admin/reports' element={<Reports />} />
          <Route path='/admin/settings' element={<Settings />} />
          <Route path='/system/init' element={<Init />} />
          <Route path='/system/panel/overview' element={<Overview />} />
          <Route path='/system/panel/endpoints' element={<Endpoints />} />
          <Route path='/system/panel/control' element={<SystemControl />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
