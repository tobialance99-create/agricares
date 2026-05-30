import { useSelector } from 'react-redux'
import AdminLayout from '../../components/layout/AdminLayout'
import useLayout from '../../hooks/useLayout'

const Settings = () => {
    const theme = useSelector((state) => state.theme)
    const { layout, toggleLayout } = useLayout()

    return (
        <AdminLayout>
            <h1 className='text-2xl font-bold mb-6' style={{ color: theme.textColor }}>Settings</h1>

            {/* Layout Settings */}
            <div className='rounded-xl p-6 shadow-sm mb-4' style={{ backgroundColor: '#fff', border: `1px solid ${theme.secondaryColor}` }}>
                <h2 className='text-base font-semibold mb-4' style={{ color: theme.textColor }}>Layout Preference</h2>
                <div className='flex gap-4'>
                    <div onClick={() => toggleLayout('topbar')}
                        className='flex flex-col items-center gap-2 p-4 w-36 cursor-pointer rounded-lg transition-opacity hover:opacity-80'
                        style={{ border: `2px solid ${layout === 'topbar' ? theme.primaryColor : theme.secondaryColor}`, backgroundColor: layout === 'topbar' ? theme.primaryColor + '15' : '#fff' }}>
                        <div className='w-full h-8 rounded' style={{ backgroundColor: theme.primaryColor }} />
                        <div className='w-full h-16 rounded' style={{ backgroundColor: theme.secondaryColor + '40' }} />
                        <span className='text-xs font-semibold' style={{ color: theme.textColor }}>Topbar</span>
                    </div>
                    <div onClick={() => toggleLayout('sidebar')}
                        className='flex flex-col items-center gap-2 p-4 w-36 cursor-pointer rounded-lg transition-opacity hover:opacity-80'
                        style={{ border: `2px solid ${layout === 'sidebar' ? theme.primaryColor : theme.secondaryColor}`, backgroundColor: layout === 'sidebar' ? theme.primaryColor + '15' : '#fff' }}>
                        <div className='flex gap-1 w-full h-24'>
                            <div className='w-8 h-full rounded' style={{ backgroundColor: theme.primaryColor }} />
                            <div className='flex-1 h-full rounded' style={{ backgroundColor: theme.secondaryColor + '40' }} />
                        </div>
                        <span className='text-xs font-semibold' style={{ color: theme.textColor }}>Sidebar</span>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}

export default Settings
