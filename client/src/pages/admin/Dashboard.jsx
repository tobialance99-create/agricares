import AdminLayout from '../../components/layout/AdminLayout'
import { useSelector } from 'react-redux'

const Dashboard = () => {
    const theme = useSelector((state) => state.theme)

    return (
        <AdminLayout>
            <div>
                <h1 className='text-2xl font-bold mb-4' style={{ color: theme.textColor }}>Dashboard</h1>
                <p className='text-sm opacity-60' style={{ color: theme.textColor }}>Welcome to AgriCare Admin Dashboard</p>
            </div>
        </AdminLayout>
    )
}

export default Dashboard
