import { useSelector } from 'react-redux'
import { MdConfirmationNumber } from 'react-icons/md'
import Topbar from './Topbar'
import Sidebar from './Sidebar'

const extensionWorkerNavLinks = [
    { label: 'Tickets', path: '/extension-worker/tickets', icon: MdConfirmationNumber },
]

const ExtensionWorkerLayout = ({ children, notificationCount = 0 }) => {
    const layout = useSelector((state) => state.layout.layout)

    return layout === 'sidebar'
        ? <Sidebar navLinks={extensionWorkerNavLinks} notificationCount={notificationCount}>{children}</Sidebar>
        : <Topbar navLinks={extensionWorkerNavLinks} notificationCount={notificationCount}>{children}</Topbar>
}

export default ExtensionWorkerLayout
