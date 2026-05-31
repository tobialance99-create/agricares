import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { MdSearch, MdVisibility, MdToggleOn, MdToggleOff, MdDelete } from 'react-icons/md'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import AdminLayout from '../../components/layout/AdminLayout'
import Dialog from '../../components/ui/Dialog'
import Confirmation from '../../components/ui/Confirmation'
import Button from '../../components/ui/Button'
import api from '../../services/api'

const FarmersAccounts = () => {
    const theme = useSelector((state) => state.theme)
    const [farmers, setFarmers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedFarmer, setSelectedFarmer] = useState(null)
    const [viewDialog, setViewDialog] = useState(false)
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null })
    const [toggleConfirm, setToggleConfirm] = useState({ open: false, id: null, isActive: false })

    const fetchFarmers = () => {
        setLoading(true)
        api.get('/users/farmers/').then(res => {
            setFarmers(res.data)
            setLoading(false)
        }).catch(() => setLoading(false))
    }

    useEffect(() => { fetchFarmers() }, [])

    const handleView = (farmer) => {
        setSelectedFarmer(farmer)
        setViewDialog(true)
    }

    const handleToggleActive = async () => {
        await api.patch(`/users/farmers/${toggleConfirm.id}/toggle-active/`)
        setToggleConfirm({ open: false, id: null, isActive: false })
        fetchFarmers()
    }

    const handleDelete = async () => {
        await api.delete(`/users/farmers/${deleteConfirm.id}/`)
        setDeleteConfirm({ open: false, id: null })
        fetchFarmers()
    }

    const filtered = farmers.filter(f =>
        `${f.firstName} ${f.lastName} ${f.username} ${f.barangay}`.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <AdminLayout>
            <div className='flex flex-col gap-4'>
                <h1 className='text-2xl font-bold' style={{ color: theme.textColor }}>Farmers Accounts</h1>

                {/* Search */}
                <div className='relative'>
                    <MdSearch size={18} className='absolute left-3 top-1/2 -translate-y-1/2 opacity-50' color={theme.textColor} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder='Search by name, username, barangay...'
                        className='w-full pl-9 pr-4 py-2.5 text-sm outline-none border rounded-lg'
                        style={{ borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                </div>

                {/* Table */}
                <div className='rounded-xl shadow-sm overflow-hidden' style={{ border: `1px solid ${theme.secondaryColor}` }}>
                    <table className='w-full text-sm'>
                        <thead style={{ backgroundColor: theme.primaryColor }}>
                            <tr>
                                {['Name', 'Username', 'Barangay', 'Mobile', 'Status', 'Registered', 'Actions'].map(h => (
                                    <th key={h} className='px-4 py-3 text-left text-white font-medium'>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={7} className='text-center py-8'>
                                    <AiOutlineLoading3Quarters className='animate-spin inline' size={24} color={theme.primaryColor} />
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7} className='text-center py-8 opacity-50' style={{ color: theme.textColor }}>No farmers found</td></tr>
                            ) : filtered.map((farmer, i) => (
                                <tr key={farmer.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : theme.primaryColor + '08' }}>
                                    <td className='px-4 py-3' style={{ color: theme.textColor }}>{farmer.firstName} {farmer.lastName}</td>
                                    <td className='px-4 py-3' style={{ color: theme.textColor }}>{farmer.username}</td>
                                    <td className='px-4 py-3' style={{ color: theme.textColor }}>{farmer.barangay}</td>
                                    <td className='px-4 py-3' style={{ color: theme.textColor }}>{farmer.mobileNumber}</td>
                                    <td className='px-4 py-3'>
                                        <span className='px-2 py-1 rounded-full text-xs font-medium'
                                            style={{ backgroundColor: farmer.isActive ? '#dcfce7' : '#fee2e2', color: farmer.isActive ? '#16a34a' : '#dc2626' }}>
                                            {farmer.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className='px-4 py-3 opacity-60' style={{ color: theme.textColor }}>
                                        {new Date(farmer.date).toLocaleDateString()}
                                    </td>
                                    <td className='px-4 py-3'>
                                        <div className='flex gap-2'>
                                            <button onClick={() => handleView(farmer)} title='View' className='cursor-pointer hover:opacity-70'>
                                                <MdVisibility size={18} color={theme.primaryColor} />
                                            </button>
                                            <button onClick={() => setToggleConfirm({ open: true, id: farmer.id, isActive: farmer.isActive })} title={farmer.isActive ? 'Deactivate' : 'Activate'} className='cursor-pointer hover:opacity-70'>
                                                {farmer.isActive ? <MdToggleOn size={22} color='#16a34a' /> : <MdToggleOff size={22} color='#dc2626' />}
                                            </button>
                                            <button onClick={() => setDeleteConfirm({ open: true, id: farmer.id })} title='Delete' className='cursor-pointer hover:opacity-70'>
                                                <MdDelete size={18} color={theme.dangerColor} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Dialog */}
            <Dialog isOpen={viewDialog} onClose={() => setViewDialog(false)} title='Farmer Details'>
                {selectedFarmer && (
                    <div className='flex flex-col gap-3 text-sm'>
                        {[
                            ['First Name', selectedFarmer.firstName],
                            ['Last Name', selectedFarmer.lastName],
                            ['Barangay', selectedFarmer.barangay],
                            ['Username', selectedFarmer.username],
                            ['Mobile Number', selectedFarmer.mobileNumber],
                            ['Status', selectedFarmer.isActive ? 'Active' : 'Inactive'],
                            ['Registered', new Date(selectedFarmer.date).toLocaleDateString()],
                        ].map(([label, value]) => (
                            <div key={label} className='flex justify-between'>
                                <span className='opacity-60' style={{ color: theme.textColor }}>{label}</span>
                                <span className='font-medium' style={{ color: theme.textColor }}>{value}</span>
                            </div>
                        ))}
                        <div className='flex justify-end mt-2'>
                            <Button variant='ghost' onClick={() => setViewDialog(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* Toggle Active Confirmation */}
            <Confirmation
                isOpen={toggleConfirm.open}
                title={toggleConfirm.isActive ? 'Deactivate Farmer?' : 'Activate Farmer?'}
                message={toggleConfirm.isActive ? 'This farmer will no longer be able to login.' : 'This farmer will be able to login again.'}
                onConfirm={handleToggleActive}
                onCancel={() => setToggleConfirm({ open: false, id: null, isActive: false })}
                confirmText={toggleConfirm.isActive ? 'Deactivate' : 'Activate'}
            />

            {/* Delete Confirmation */}
            <Confirmation
                isOpen={deleteConfirm.open}
                title='Delete Farmer?'
                message='This action cannot be undone. The farmer account will be permanently deleted.'
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirm({ open: false, id: null })}
                confirmText='Delete'
            />
        </AdminLayout>
    )
}

export default FarmersAccounts
