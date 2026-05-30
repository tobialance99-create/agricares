import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { getCookie, setPermCookie } from '../../utils/cookies'
import { useNavigate, useLocation } from 'react-router-dom'
import { GiWheat } from 'react-icons/gi'
import { MdChevronLeft, MdChevronRight } from 'react-icons/md'
import { IoNotificationsOutline } from 'react-icons/io5'
import { FiLogOut } from 'react-icons/fi'
import { clearCredentials } from '../../store/slices/authSlice'
import logoMinecraft from '../../assets/logo-minecraft.png'
import Footer from './Footer'

const Sidebar = ({ children, notificationCount = 0, navLinks = [] }) => {
    const theme = useSelector((state) => state.theme)
    const { user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const location = useLocation()
    const [collapsed, setCollapsed] = useState(getCookie('sidebarCollapsed') === 'true')


    const initials = user ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase() : 'U'

    const toggleCollapse = () => {
        const next = !collapsed
        setCollapsed(next)
        setPermCookie('sidebarCollapsed', String(next))
    }

    const handleLogout = () => {
        dispatch(clearCredentials())
        navigate('/')
    }

    return (
        <div className='min-h-screen flex' style={{ backgroundColor: theme.backgroundColor }}>
            {/* Sidebar */}
            <div className='flex flex-col min-h-screen shadow-lg transition-all duration-300' style={{ backgroundColor: theme.primaryColor, width: collapsed ? '64px' : '256px' }}>
                {/* Logo + Collapse Button */}
                <div className='flex items-center justify-between px-3 py-4'>
                    {!collapsed && (
                        <div className='flex items-center gap-2 cursor-pointer' onClick={() => navigate('/dashboard')}
>
                            {theme.minecraftLogo
                                ? <img src={logoMinecraft} alt='logo' className='h-8 w-8 object-contain' />
                                : <GiWheat size={24} color='#fff' />
                            }
                            <span className='text-lg font-bold text-white tracking-wide'>
                                Agri<span style={{ color: theme.secondaryColor }}>Care</span>
                            </span>
                        </div>
                    )}
                    <button onClick={toggleCollapse} className='text-white opacity-75 hover:opacity-100 cursor-pointer ml-auto'>
                        {collapsed ? <MdChevronRight size={24} /> : <MdChevronLeft size={24} />}
                    </button>
                </div>

                {/* Profile */}
                <div className={`flex items-center gap-3 py-4 cursor-pointer ${collapsed ? 'justify-center px-2' : 'px-6'}`}
                    style={{ borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
                    onClick={() => navigate('/profile')}>
                    <div className='w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0'
                        style={{ backgroundColor: theme.secondaryColor, color: theme.textColor }}>
                        {initials}
                    </div>
                    {!collapsed && (
                        <div className='flex flex-col'>
                            <span className='text-sm font-medium text-white'>{user ? `${user.firstName} ${user.lastName}` : 'User'}</span>
                            <span className='text-xs text-white opacity-60'>{user?.role || 'User'}</span>
                        </div>
                    )}
                </div>

                {/* Nav Links */}
                <nav className='flex flex-col gap-1 px-3 py-4 flex-1'>
                    {navLinks.map(({ label, path, icon: Icon }) => {
                        const isActive = location.pathname === path
                        return (
                            <button key={path} onClick={() => navigate(path)}
                                className={`flex items-center gap-3 py-2.5 text-sm font-medium transition-all rounded-lg w-full ${collapsed ? 'justify-center px-2' : 'px-4 text-left'}`}
                                title={collapsed ? label : ''}
                                style={{
                                    backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : 'transparent',
                                    color: '#fff',
                                    opacity: isActive ? 1 : 0.75,
                                }}>
                                <Icon size={18} />
                                {!collapsed && label}
                            </button>
                        )
                    })}
                </nav>

                {/* Bottom */}
                <div className='px-3 py-4 flex flex-col gap-1' style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button onClick={() => navigate('/notifications')}
                        className={`flex items-center gap-3 py-2.5 text-sm font-medium rounded-lg w-full ${collapsed ? 'justify-center px-2' : 'px-4 text-left'}`}
                        title={collapsed ? 'Notifications' : ''}
                        style={{ backgroundColor: 'transparent', color: '#fff', opacity: 0.75 }}>
                        <div className='relative'>
                            <IoNotificationsOutline size={18} />
                            {notificationCount > 0 && (
                                <span className='absolute -top-1 -right-1 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full'
                                    style={{ backgroundColor: theme.dangerColor, fontSize: '10px' }}>
                                    {notificationCount > 99 ? '99+' : notificationCount}
                                </span>
                            )}
                        </div>
                        {!collapsed && 'Notifications'}
                    </button>
                    <button onClick={handleLogout}
                        className={`flex items-center gap-3 py-2.5 text-sm font-medium rounded-lg w-full ${collapsed ? 'justify-center px-2' : 'px-4 text-left'}`}
                        title={collapsed ? 'Logout' : ''}
                        style={{ backgroundColor: 'transparent', color: '#fff', opacity: 0.75 }}>
                        <FiLogOut size={18} />
                        {!collapsed && 'Logout'}
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className='flex-1 flex flex-col'>
                <main className='flex-1 p-6'>
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    )
}

export default Sidebar
