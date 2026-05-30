import { useSelector } from 'react-redux'
import { MdDashboard, MdPeople, MdSupportAgent, MdMenuBook, MdBarChart, MdSettings } from 'react-icons/md'
import Topbar from './Topbar'
import Sidebar from './Sidebar'

const adminNavLinks = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: MdDashboard },
    { label: 'Farmers', path: '/admin/farmers', icon: MdPeople },
    { label: 'Extension Workers', path: '/admin/extension-workers', icon: MdSupportAgent },
    { label: 'Knowledge Repository', path: '/admin/knowledge-repository', icon: MdMenuBook },
    { label: 'Reports', path: '/admin/reports', icon: MdBarChart },
    { label: 'Settings', path: '/admin/settings', icon: MdSettings },
]

const AdminLayout = ({ children, notificationCount = 0 }) => {
    const layout = useSelector((state) => state.layout.layout)

    return layout === 'sidebar'
        ? <Sidebar navLinks={adminNavLinks} notificationCount={notificationCount}>{children}</Sidebar>
        : <Topbar navLinks={adminNavLinks} notificationCount={notificationCount}>{children}</Topbar>
}

export default AdminLayout
