import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { MdSearch, MdVisibility, MdToggleOn, MdToggleOff, MdDelete, MdCheckCircle } from 'react-icons/md'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import AdminLayout from '../../components/layout/AdminLayout'
import Dialog from '../../components/ui/Dialog'
import Confirmation from '../../components/ui/Confirmation'
import Button from '../../components/ui/Button'
import api from '../../services/api'

const ExtensionWorkers = () => {
    const theme = useSelector((state) => state.theme)
    const [workers, setWorkers] = useState([])
    const [positions, setPositions] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedWorker, setSelectedWorker] = useState(null)
    const [viewDialog, setViewDialog] = useState(false)
    const [positionDialog, setPositionDialog] = useState({ open: false, id: null })
    const [selectedPosition, setSelectedPosition] = useState('')
    const [deleteConfirm, setDeleteConfirm] = useState({ open: false, id: null })
    const [toggleConfirm, setToggleConfirm] = useState({ open: false, id: null, isActive: false })
    const [approveConfirm, setApproveConfirm] = useState({ open: false, id: null })

    const fetchWorkers = () => {
        setLoading(true)
        api.get('/users/extension-workers/').then(res => {
            setWorkers(res.data)
            setLoading(false)
        }).catch(() => setLoading(false))
    }

    useEffect(() => {
        fetchWorkers()
        api.get('/positions/').then(res => setPositions(res.data))
    }, [])

    const handleView = (worker) => {
        setSelectedWorker(worker)
        setViewDialog(true)
    }

    const handleToggleActive = async () => {
        await api.patch(`/users/extension-workers/${toggleConfirm.id}/toggle-active/`)
        setToggleConfirm({ open: false, id: null, isActive: false })
        fetchWorkers()
    }

    const handleDelete = async () => {
        await api.delete(`/users/extension-workers/${deleteConfirm.id}/`)
        setDeleteConfirm({ open: false, id: null })
        fetchWorkers()
    }

    const handleApprove = async () => {
        await api.patch(`/users/extension-workers/${approveConfirm.id}/approve/`)
        setApproveConfirm({ open: false, id: null })
        fetchWorkers()
    }

    const handleChangePosition = async () => {
        if (!selectedPosition) return
        await api.patch(`/users/extension-workers/${positionDialog.id}/change-position/`, { positionId: selectedPosition })
        setPositionDialog({ open: false, id: null })
        setSelectedPosition('')
        fetchWorkers()
    }

    const filtered = workers.filter(w =>
        `${w.firstName} ${w.lastName} ${w.username}`.toLowerCase().includes(search.toLowerCase())
    )

    const getPositionName = (positionId) => {
        const pos = positions.find(p => p.id === positionId)
        return pos ? pos.name : 'N/A'
    }

    return (
        <AdminLayout>
            <div className='flex flex-col gap-4'>
                <h1 className='text-2xl font-bold' style={{ color: theme.textColor }}>Extension Workers</h1>

                {/* Search */}
                <div className='relative'>
                    <MdSearch size={18} className='absolute left-3 top-1/2 -translate-y-1/2 opacity-50' color={theme.textColor} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder='Search by name, username...'
                        className='w-full pl-9 pr-4 py-2.5 text-sm outline-none border rounded-lg'
                        style={{ borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                </div>

                {/* Table */}
                <div className='rounded-xl shadow-sm overflow-hidden' style={{ border: `1px solid ${theme.secondaryColor}` }}>
                    <table className='w-full text-sm'>
                        <thead style={{ backgroundColor: theme.primaryColor }}>
                            <tr>
                                {['Name', 'Username', 'Mobile', 'Position', 'Status', 'Registered', 'Actions'].map(h => (
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
                                <tr><td colSpan={7} className='text-center py-8 opacity-50' style={{ color: theme.textColor }}>No extension workers found</td></tr>
                            ) : filtered.map((worker, i) => (
                                <tr key={worker.id} style={{ backgroundColor: i % 2 === 0 ? '#fff' : theme.primaryColor + '08' }}>
                                    <td className='px-4 py-3' style={{ color: theme.textColor }}>{worker.firstName} {worker.lastName}</td>
                                    <td className='px-4 py-3' style={{ color: theme.textColor }}>{worker.username}</td>
                                    <td className='px-4 py-3' style={{ color: theme.textColor }}>{worker.mobileNumber}</td>
                                    <td className='px-4 py-3' style={{ color: theme.textColor }}>{getPositionName(worker.positionId)}</td>
                                    <td className='px-4 py-3'>
                                        <span className='px-2 py-1 rounded-full text-xs font-medium'
                                            style={{
                                                backgroundColor: worker.isPending ? '#fef9c3' : worker.isActive ? '#dcfce7' : '#fee2e2',
                                                color: worker.isPending ? '#ca8a04' : worker.isActive ? '#16a34a' : '#dc2626'
                                            }}>
                                            {worker.isPending ? 'Pending' : worker.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className='px-4 py-3 opacity-60' style={{ color: theme.textColor }}>
                                        {new Date(worker.date).toLocaleDateString()}
                                    </td>
                                    <td className='px-4 py-3'>
                                        <div className='flex gap-2'>
                                            <button onClick={() => handleView(worker)} title='View' className='cursor-pointer hover:opacity-70'>
                                                <MdVisibility size={18} color={theme.primaryColor} />
                                            </button>
                                            {worker.isPending && (
                                                <button onClick={() => setApproveConfirm({ open: true, id: worker.id })} title='Approve' className='cursor-pointer hover:opacity-70'>
                                                    <MdCheckCircle size={18} color='#16a34a' />
                                                </button>
                                            )}
                                            {!worker.isPending && (
                                                <button onClick={() => setToggleConfirm({ open: true, id: worker.id, isActive: worker.isActive })} title={worker.isActive ? 'Deactivate' : 'Activate'} className='cursor-pointer hover:opacity-70'>
                                                    {worker.isActive ? <MdToggleOn size={22} color='#16a34a' /> : <MdToggleOff size={22} color='#dc2626' />}
                                                </button>
                                            )}
                                            <button onClick={() => setDeleteConfirm({ open: true, id: worker.id })} title='Delete' className='cursor-pointer hover:opacity-70'>
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
            <Dialog isOpen={viewDialog} onClose={() => setViewDialog(false)} title='Extension Worker Details'>
                {selectedWorker && (
                    <div className='flex flex-col gap-3 text-sm'>
                        {[
                            ['First Name', selectedWorker.firstName],
                            ['Last Name', selectedWorker.lastName],
                            ['Username', selectedWorker.username],
                            ['Mobile Number', selectedWorker.mobileNumber],
                            ['Position', getPositionName(selectedWorker.positionId)],
                            ['Status', selectedWorker.isPending ? 'Pending' : selectedWorker.isActive ? 'Active' : 'Inactive'],
                            ['Registered', new Date(selectedWorker.date).toLocaleDateString()],
                        ].map(([label, value]) => (
                            <div key={label} className='flex justify-between'>
                                <span className='opacity-60' style={{ color: theme.textColor }}>{label}</span>
                                <span className='font-medium' style={{ color: theme.textColor }}>{value}</span>
                            </div>
                        ))}
                        <div className='flex justify-end gap-2 mt-2'>
                            <Button variant='secondary' onClick={() => {
                                setViewDialog(false)
                                setPositionDialog({ open: true, id: selectedWorker.id })
                            }}>Change Position</Button>
                            <Button variant='ghost' onClick={() => setViewDialog(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </Dialog>

            {/* Change Position Dialog */}
            <Dialog isOpen={positionDialog.open} onClose={() => setPositionDialog({ open: false, id: null })} title='Change Position'>
                <div className='flex flex-col gap-4'>
                    <select value={selectedPosition} onChange={e => setSelectedPosition(e.target.value)}
                        className='w-full px-4 py-2.5 text-sm outline-none border rounded-lg'
                        style={{ borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }}>
                        <option value=''>Select position...</option>
                        {positions.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                    <div className='flex justify-end gap-2'>
                        <Button variant='ghost' onClick={() => setPositionDialog({ open: false, id: null })}>Cancel</Button>
                        <Button onClick={handleChangePosition} disabled={!selectedPosition}>Save</Button>
                    </div>
                </div>
            </Dialog>

            {/* Approve Confirmation */}
            <Confirmation
                isOpen={approveConfirm.open}
                title='Approve Extension Worker?'
                message='This extension worker will be able to login and handle tickets.'
                onConfirm={handleApprove}
                onCancel={() => setApproveConfirm({ open: false, id: null })}
                confirmText='Approve'
            />

            {/* Toggle Active Confirmation */}
            <Confirmation
                isOpen={toggleConfirm.open}
                title={toggleConfirm.isActive ? 'Deactivate Extension Worker?' : 'Activate Extension Worker?'}
                message={toggleConfirm.isActive ? 'This worker will no longer be able to login.' : 'This worker will be able to login again.'}
                onConfirm={handleToggleActive}
                onCancel={() => setToggleConfirm({ open: false, id: null, isActive: false })}
                confirmText={toggleConfirm.isActive ? 'Deactivate' : 'Activate'}
            />

            {/* Delete Confirmation */}
            <Confirmation
                isOpen={deleteConfirm.open}
                title='Delete Extension Worker?'
                message='This action cannot be undone. The extension worker account will be permanently deleted.'
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirm({ open: false, id: null })}
                confirmText='Delete'
            />
        </AdminLayout>
    )
}

export default ExtensionWorkers