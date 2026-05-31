import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { MdPeople, MdPersonOff, MdMenuBook, MdConfirmationNumber } from 'react-icons/md'
import AdminLayout from '../../components/layout/AdminLayout'
import FarmerLayout from '../../components/layout/FarmerLayout'
import ExtensionWorkerLayout from '../../components/layout/ExtensionWorkerLayout'
import api from '../../services/api'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const StatCard = ({ icon: Icon, label, value, color }) => {
    const theme = useSelector((state) => state.theme)
    return (
        <div className='flex items-center gap-4 p-5 rounded-xl shadow-sm' style={{ backgroundColor: '#fff', border: `1px solid ${theme.secondaryColor}` }}>
            <div className='p-3 rounded-lg' style={{ backgroundColor: color + '20' }}>
                <Icon size={24} color={color} />
            </div>
            <div>
                <p className='text-xs opacity-60' style={{ color: theme.textColor }}>{label}</p>
                <p className='text-2xl font-bold' style={{ color: theme.textColor }}>{value ?? '...'}</p>
            </div>
        </div>
    )
}

const Dashboard = () => {
    const theme = useSelector((state) => state.theme)
    const { user } = useSelector((state) => state.auth)
    const [stats, setStats] = useState(null)


    useEffect(() => {
        if (user?.role === 'admin') {
            api.get('/dashboard/stats/').then(res => setStats(res.data))
        }
    }, [user])

    const chartData = {
        labels: ['Today', 'This Week', 'This Month'],
        datasets: [{
            label: 'Tickets',
            data: stats ? [stats.tickets.today, stats.tickets.weekly, stats.tickets.monthly] : [0, 0, 0],
            backgroundColor: [theme.primaryColor + 'cc', theme.secondaryColor + 'cc', theme.primaryColor + '88'],
            borderRadius: 8,
        }]
    }

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Ticket Overview', color: theme.textColor },
        },
        scales: {
            y: { beginAtZero: true, ticks: { color: theme.textColor } },
            x: { ticks: { color: theme.textColor } },
        },
    }

    const adminContent = (
        <div className='flex flex-col gap-6'>
            <h1 className='text-2xl font-bold' style={{ color: theme.textColor }}>
                Welcome back, {user?.firstName}!
            </h1>

            {/* Stat Cards */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                <StatCard icon={MdPeople} label='Active Workers' value={stats?.workers.active} color='#22c55e' />
                <StatCard icon={MdPersonOff} label='Inactive Workers' value={stats?.workers.inactive} color='#ef4444' />
                <StatCard icon={MdMenuBook} label='Repository Visits' value={stats?.knowledgeRepositoryVisits} color={theme.primaryColor} />
                <StatCard icon={MdConfirmationNumber} label='Tickets Today' value={stats?.tickets.today} color={theme.secondaryColor} />
            </div>

            {/* Chart */}
            <div className='p-6 rounded-xl shadow-sm' style={{ backgroundColor: '#fff', border: `1px solid ${theme.secondaryColor}`, height: '250px' }}>
                <Bar data={chartData} options={{ ...chartOptions, maintainAspectRatio: false }} />
            </div>
        </div>
    )

    const defaultContent = (
        <div>
            <h1 className='text-2xl font-bold mb-2' style={{ color: theme.textColor }}>
                Welcome, {user?.firstName}!
            </h1>
            <p className='text-sm opacity-60' style={{ color: theme.textColor }}>
                {user?.role === 'farmer' && 'Farmer Dashboard'}
                {user?.role === 'extension_worker' && 'Extension Worker Dashboard'}
            </p>
        </div>
    )

    if (user?.role === 'admin') return <AdminLayout>{adminContent}</AdminLayout>
    if (user?.role === 'farmer') return <FarmerLayout>{defaultContent}</FarmerLayout>
    if (user?.role === 'extension_worker') return <ExtensionWorkerLayout>{defaultContent}</ExtensionWorkerLayout>
    return null
}

export default Dashboard
