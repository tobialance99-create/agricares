import { useSelector } from 'react-redux'
import { MdMenuBook, MdSupportAgent } from 'react-icons/md'
import Topbar from './Topbar'
import Sidebar from './Sidebar'

const farmerNavLinks = [
    { label: 'Knowledge Repository', path: '/farmer/knowledge-repository', icon: MdMenuBook },
    { label: 'Extension Workers', path: '/farmer/extension-workers', icon: MdSupportAgent },
]

const FarmerLayout = ({ children, notificationCount = 0 }) => {
    const layout = useSelector((state) => state.layout.layout)

    return layout === 'sidebar'
        ? <Sidebar navLinks={farmerNavLinks} notificationCount={notificationCount}>{children}</Sidebar>
        : <Topbar navLinks={farmerNavLinks} notificationCount={notificationCount}>{children}</Topbar>
}

export default FarmerLayout
