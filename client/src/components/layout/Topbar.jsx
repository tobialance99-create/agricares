import { useSelector } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { MdDashboard, MdPeople, MdSupportAgent, MdMenuBook, MdBarChart, MdSettings } from 'react-icons/md'
import Header from './Header'
import Footer from './Footer'

const navLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: MdDashboard },
    { label: 'Farmers', path: '/admin/farmers', icon: MdPeople },
    { label: 'Extension Workers', path: '/admin/extension-workers', icon: MdSupportAgent },
    { label: 'Knowledge Repository', path: '/admin/knowledge-repository', icon: MdMenuBook },
    { label: 'Reports', path: '/admin/reports', icon: MdBarChart },
    { label: 'Settings', path: '/admin/settings', icon: MdSettings },
]

const Topbar = ({ children, notificationCount = 0 }) => {
    const theme = useSelector((state) => state.theme)
    const navigate = useNavigate()
    const location = useLocation()

    return (
        <div className='min-h-screen flex flex-col' style={{ backgroundColor: theme.backgroundColor }}>
            {/* Header */}
            <Header notificationCount={notificationCount} />

            {/* Nav Links */}
            <nav className='flex items-center gap-1 px-6 py-1 shadow-sm justify-end' style={{ backgroundColor: theme.primaryColor, borderTop: `1px solid rgba(255,255,255,0.1)` }}>
                {navLinks.map(({ label, path, icon: Icon }) => {
                    const isActive = location.pathname === path
                    return (
                        <button key={path} onClick={() => navigate(path)}
                            className='flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-md'
                            style={{
                                backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                                color: '#fff',
                                opacity: isActive ? 1 : 0.75,
                            }}>
                            <Icon size={16} />
                            {label}
                        </button>
                    )
                })}
            </nav>

            {/* Page Content */}
            <main className='flex-1 p-6'>
                {children}
            </main>

            {/* Footer */}
            <Footer />
        </div>
    )
}

export default Topbar
