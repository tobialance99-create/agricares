import { useSelector } from 'react-redux'
import Topbar from './Topbar'
import Sidebar from './Sidebar'

const AdminLayout = ({ children, notificationCount = 0 }) => {
    const layout = useSelector((state) => state.layout.layout)

    return layout === 'sidebar'
        ? <Sidebar notificationCount={notificationCount}>{children}</Sidebar>
        : <Topbar notificationCount={notificationCount}>{children}</Topbar>
}

export default AdminLayout
