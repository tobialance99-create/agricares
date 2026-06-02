import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { GiWheat } from 'react-icons/gi'
import { IoNotificationsOutline } from 'react-icons/io5'
import logoMinecraft from '../../assets/logo-minecraft.png'
import ProfilePanel from './ProfilePanel'

const Header = ({ notificationCount = 0 }) => {
    const theme = useSelector((state) => state.theme)
    const { user } = useSelector((state) => state.auth)
    const navigate = useNavigate()
    const [profileOpen, setProfileOpen] = useState(false)

    const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'U'

    return (
        <>
            <div className='flex items-center justify-between px-6 py-3 shadow-sm' style={{ backgroundColor: theme.primaryColor }}>
                {/* Logo */}
                <div className='flex items-center gap-2 cursor-pointer' onClick={() => navigate('/dashboard')}>
                    {theme.minecraftLogo
                        ? <img src={logoMinecraft} alt='logo' className='h-8 w-8 object-contain' />
                        : <GiWheat size={24} color='#fff' />
                    }
                    <span className='text-lg font-bold text-white tracking-wide'>
                        Agri<span style={{ color: theme.secondaryColor }}>Care</span>
                    </span>
                </div>

                {/* Right side */}
                <div className='flex items-center gap-4'>
                    {/* Notifications */}
                    <div className='relative cursor-pointer' onClick={() => navigate('/notifications')}>
                        <IoNotificationsOutline size={24} color='#fff' />
                        {notificationCount > 0 && (
                            <span className='absolute -top-1 -right-1 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full'
                                style={{ backgroundColor: theme.dangerColor, fontSize: '10px' }}>
                                {notificationCount > 99 ? '99+' : notificationCount}
                            </span>
                        )}
                    </div>

                    {/* Profile */}
                    <div className='flex items-center gap-2 cursor-pointer' onClick={() => setProfileOpen(true)}>
                        <div className='w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold'
                            style={{ backgroundColor: theme.secondaryColor, color: theme.textColor }}>
                            {initials}
                        </div>
                        <span className='text-sm text-white font-medium hidden md:block'>
                            {user ? `${user.firstName} ${user.lastName}` : 'User'}
                        </span>
                    </div>
                </div>
            </div>

            <ProfilePanel isOpen={profileOpen} onClose={() => setProfileOpen(false)} />
        </>
    )
}

export default Header
