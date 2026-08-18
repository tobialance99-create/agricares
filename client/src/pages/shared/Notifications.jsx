import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { MdPeople, MdSupportAgent, MdNotifications, MdSend, MdClose, MdConfirmationNumber, MdPushPin, MdCheckCircle, MdInsertDriveFile } from 'react-icons/md'
import AdminLayout from '../../components/layout/AdminLayout'
import FarmerLayout from '../../components/layout/FarmerLayout'
import ExtensionWorkerLayout from '../../components/layout/ExtensionWorkerLayout'
import Dialog from '../../components/ui/Dialog'
import Button from '../../components/ui/Button'
import api from '../../services/api'

const TYPE_ICON = {
    new_farmer: MdPeople,
    new_extension_worker: MdSupportAgent,
    ticket_reply: MdConfirmationNumber,
    ticket_pinned: MdPushPin,
    ticket_resolved: MdCheckCircle,
}

const TYPE_COLOR = {
    new_farmer: '#3b82f6',
    new_extension_worker: '#8b5cf6',
    ticket_reply: '#f59e0b',
    ticket_pinned: '#ec4899',
    ticket_resolved: '#10b981',
}

const TYPE_LABEL = {
    new_farmer: 'New Farmer',
    new_extension_worker: 'New Extension Worker',
    ticket_reply: 'Ticket Reply',
    ticket_pinned: 'Ticket Pinned',
    ticket_resolved: 'Ticket Resolved',
}

const ROLE_LABEL = { farmer: 'Farmer', extension_worker: 'Extension Worker', admin: 'Admin' }

const groupByDate = (notifications) => {
    const groups = {}
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const sorted = [...notifications].sort((a, b) => new Date(b.date) - new Date(a.date))

    sorted.forEach(n => {
        const d = new Date(n.date)
        let label
        if (d.toDateString() === today.toDateString()) label = 'Today'
        else if (d.toDateString() === yesterday.toDateString()) label = 'Yesterday'
        else label = d.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
        if (!groups[label]) groups[label] = []
        groups[label].push(n)
    })
    return groups
}

const Notifications = () => {
    const theme = useSelector((state) => state.theme)
    const { user } = useSelector((state) => state.auth)
    const navigate = useNavigate()
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState(null)
    const [mobileDetailOpen, setMobileDetailOpen] = useState(false)

    const [sendOpen, setSendOpen] = useState(false)
    const [allUsers, setAllUsers] = useState([])
    const [sendToAll, setSendToAll] = useState(false)
    const [selectedUsers, setSelectedUsers] = useState([])
    const [userSearch, setUserSearch] = useState('')
    const [notifType, setNotifType] = useState('')
    const [notifMessage, setNotifMessage] = useState('')
    const [sending, setSending] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    const fetchNotifications = () => {
        setLoading(true)
        api.get('/users/notifications/').then(res => {
            setNotifications(res.data)
            setLoading(false)
        }).catch(() => setLoading(false))
    }

    useEffect(() => {
        fetchNotifications()
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const ws = new WebSocket(`${wsProtocol}//${window.location.host}/ws/notifications/${user?.id}/`)
        ws.onmessage = () => fetchNotifications()
        ws.onerror = () => ws.close()
        return () => ws.close()
    }, [])

    useEffect(() => {
        if (!sendOpen) return
        api.get('/users/all/').then(res => setAllUsers(res.data))
    }, [sendOpen])

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    const TICKET_TYPES = ['ticket_reply', 'ticket_pinned', 'ticket_resolved']

    const handleSelect = async (n) => {
        setSelected(n)
        if (window.innerWidth < 768) setMobileDetailOpen(true)
        if (!n.isRead) {
            await api.patch(`/users/notifications/${n.id}/read/`)
            setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, isRead: true } : x))
            setSelected(prev => prev?.id === n.id ? { ...prev, isRead: true } : prev)
        }
    }

    const handleViewTicket = (n) => {
        const path = user?.role === 'extension_worker' ? '/extension-worker/tickets' : '/farmer/knowledge-repository'
        navigate(path, { state: { ticketId: n.relatedTicketId } })
    }

    const filteredUsers = allUsers.filter(u =>
        `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase()) &&
        !selectedUsers.find(s => s.id === u.id)
    )

    const handleSelectUser = (u) => {
        setSelectedUsers(prev => [...prev, u])
        setUserSearch('')
        setDropdownOpen(false)
    }

    const handleRemoveUser = (id) => setSelectedUsers(prev => prev.filter(u => u.id !== id))

    const handleSend = async () => {
        if (!notifType.trim() || !notifMessage.trim()) return
        const userIds = sendToAll ? allUsers.map(u => u.id) : selectedUsers.map(u => u.id)
        if (!userIds.length) return
        setSending(true)
        try {
            await api.post('/users/notifications/send/', { userIds, type: notifType.trim(), message: notifMessage.trim() })
            setSendOpen(false)
            setSelectedUsers([])
            setUserSearch('')
            setNotifType('')
            setNotifMessage('')
            setSendToAll(false)
        } finally {
            setSending(false)
        }
    }

    const notifDetail = (n) => {
        if (!n) return null
        const Icon = TYPE_ICON[n.type] || MdNotifications
        const color = TYPE_COLOR[n.type] || theme.primaryColor
        return (
            <div className='w-full flex flex-col gap-4'>
                <div className='flex flex-col items-center gap-3'>
                    <div className='w-16 h-16 rounded-full flex items-center justify-center'
                        style={{ backgroundColor: color + '18', border: `2px solid ${color}` }}>
                        <Icon size={32} color={color} />
                    </div>
                    <span className='text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full'
                        style={{ backgroundColor: color + '18', color }}>
                        {TYPE_LABEL[n.type] ?? n.type}
                    </span>
                </div>
                <hr style={{ borderColor: theme.secondaryColor }} />
                <div className='flex flex-col gap-1'>
                    <p className='text-xs opacity-40 uppercase tracking-wider' style={{ color: theme.textColor }}>Message</p>
                    <div className='flex items-start gap-2'>
                        {n.message?.includes('sent an attachment') && (
                            <MdInsertDriveFile size={18} color={color} className='shrink-0 mt-0.5' />
                        )}
                        <p className='text-base font-medium leading-relaxed' style={{ color: theme.textColor }}>{n.message}</p>
                    </div>
                </div>
                <div className='flex flex-col gap-1'>
                    <p className='text-xs opacity-40 uppercase tracking-wider' style={{ color: theme.textColor }}>Received</p>
                    <p className='text-sm' style={{ color: theme.textColor }}>
                        {new Date(n.date).toLocaleString(undefined, {
                            weekday: 'long', year: 'numeric', month: 'long',
                            day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                    </p>
                </div>
                <div className='flex items-center gap-2'>
                    <div className='w-2 h-2 rounded-full' style={{ backgroundColor: n.isRead ? '#10b981' : color }} />
                    <span className='text-sm opacity-60' style={{ color: theme.textColor }}>
                        {n.isRead ? 'Read' : 'Unread'}
                    </span>
                </div>
                {TICKET_TYPES.includes(n.type) && n.relatedTicketId && (
                    <Button size='sm' onClick={() => handleViewTicket(n)}>
                        View Ticket
                    </Button>
                )}
            </div>
        )
    }
    const canSend = notifType.trim() && notifMessage.trim() && (sendToAll ? allUsers.length > 0 : selectedUsers.length > 0)
    const unreadCount = notifications.filter(n => !n.isRead).length
    const grouped = groupByDate(notifications)

    const Layout = user?.role === 'farmer' ? FarmerLayout : user?.role === 'extension_worker' ? ExtensionWorkerLayout : AdminLayout

    return (
        <Layout>
            <div className='flex flex-col gap-4 h-full'>
                {/* Header */}
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <h1 className='text-2xl font-bold' style={{ color: theme.textColor }}>Notifications</h1>
                        {unreadCount > 0 && (
                            <span className='px-2.5 py-0.5 rounded-full text-xs font-semibold text-white'
                                style={{ backgroundColor: theme.primaryColor }}>
                                {unreadCount} unread
                            </span>
                        )}
                    </div>
                    {user?.role === 'admin' && (
                        <Button size='sm' onClick={() => setSendOpen(true)}>
                            <MdSend size={14} className='inline mr-1' /> Send Notification
                        </Button>
                    )}
                </div>

                {loading ? (
                    <div className='flex justify-center py-24'>
                        <AiOutlineLoading3Quarters className='animate-spin' size={28} color={theme.primaryColor} />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className='flex flex-col items-center justify-center gap-3 py-32 opacity-40'>
                        <MdNotifications size={52} color={theme.textColor} />
                        <p className='text-sm' style={{ color: theme.textColor }}>No notifications yet</p>
                    </div>
                ) : (
                    <div className='flex gap-6 items-start'>
                        {/* Left — Timeline */}
                        <div className='flex flex-col gap-6 w-full md:w-[420px] flex-shrink-0'>
                            {Object.entries(grouped).map(([label, items]) => (
                                <div key={label} className='flex flex-col gap-2'>
                                    <div className='flex items-center gap-3'>
                                        <span className='text-xs font-semibold uppercase tracking-widest opacity-40' style={{ color: theme.textColor }}>{label}</span>
                                        <div className='flex-1 h-px opacity-20' style={{ backgroundColor: theme.textColor }} />
                                    </div>
                                    <div className='flex flex-col'>
                                        {items.map((n, idx) => {
                                            const Icon = TYPE_ICON[n.type] || MdNotifications
                                            const color = TYPE_COLOR[n.type] || theme.primaryColor
                                            const isLast = idx === items.length - 1
                                            const isSelected = selected?.id === n.id
                                            return (
                                                <div key={n.id} className='flex gap-3'>
                                                    {/* Timeline dot + line */}
                                                    <div className='flex flex-col items-center flex-shrink-0'>
                                                        <div className='w-8 h-8 rounded-full flex items-center justify-center z-10 flex-shrink-0'
                                                            style={{ backgroundColor: color + '18', border: `2px solid ${color}` }}>
                                                            <Icon size={14} color={color} />
                                                        </div>
                                                        {!isLast && <div className='w-0.5 flex-1 my-1 opacity-20' style={{ backgroundColor: theme.textColor }} />}
                                                    </div>

                                                    {/* Card */}
                                                    <div onClick={() => handleSelect(n)}
                                                        className='flex-1 flex items-start justify-between gap-2 p-3 rounded-xl mb-2 cursor-pointer transition-all'
                                                        style={{
                                                            border: `1px solid ${isSelected ? color : n.isRead ? theme.secondaryColor : color + '40'}`,
                                                            backgroundColor: isSelected ? color + '15' : n.isRead ? '#fff' : color + '08',
                                                            boxShadow: isSelected ? `0 0 0 2px ${color}30` : 'none',
                                                        }}>
                                                        <div className='flex flex-col gap-0.5 min-w-0'>
                                                            <p className='text-xs font-medium leading-snug line-clamp-2' style={{ color: theme.textColor }}>{n.message}</p>
                                                            <p className='text-xs opacity-40' style={{ color: theme.textColor }}>
                                                                {new Date(n.date).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                        {!n.isRead && (
                                                            <div className='w-2 h-2 rounded-full mt-1 flex-shrink-0' style={{ backgroundColor: color }} />
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Right — Detail Panel (desktop only) */}
                        <div className='flex-1 hidden md:flex flex-col gap-4'>
                            {/* Stats */}
                            <div className='grid grid-cols-2 xl:grid-cols-4 gap-3'>
                                {[
                                    { label: 'Total', value: notifications.length, color: theme.primaryColor },
                                    { label: 'Unread', value: unreadCount, color: '#f59e0b' },
                                    ...Object.entries(
                                        notifications.reduce((acc, n) => {
                                            const key = TYPE_LABEL[n.type] ?? n.type
                                            acc[key] = (acc[key] || 0) + 1
                                            return acc
                                        }, {})
                                    ).map(([label, value]) => ({
                                        label,
                                        value,
                                        color: TYPE_COLOR[Object.keys(TYPE_LABEL).find(k => TYPE_LABEL[k] === label)] || theme.primaryColor
                                    }))
                                ].map(({ label, value, color }) => (
                                    <div key={label} className='rounded-xl p-4 flex flex-col gap-1'
                                        style={{ border: `1px solid ${theme.secondaryColor}`, backgroundColor: '#fff' }}>
                                        <div className='w-2 h-2 rounded-full' style={{ backgroundColor: color }} />
                                        <p className='text-2xl font-bold' style={{ color }}>{value}</p>
                                        <p className='text-xs opacity-50' style={{ color: theme.textColor }}>{label}</p>
                                    </div>
                                ))}
                            </div>
                            {selected ? (
                                <div className='w-full rounded-2xl p-8 flex flex-col gap-6'
                                    style={{ border: `1px solid ${theme.secondaryColor}`, backgroundColor: '#fff' }}>
                                    {notifDetail(selected)}
                                </div>
                            ) : (
                                <div className='w-full rounded-2xl flex flex-col items-center justify-center gap-3 py-16 opacity-30'
                                    style={{ border: `1px dashed ${theme.secondaryColor}` }}>
                                    <MdNotifications size={48} color={theme.textColor} />
                                    <p className='text-sm' style={{ color: theme.textColor }}>Select a notification to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Mobile Notification Detail Dialog */}
            <Dialog isOpen={mobileDetailOpen} onClose={() => setMobileDetailOpen(false)} title='Notification'>
                {notifDetail(selected)}
            </Dialog>

            {/* Send Notification Dialog */}
            <Dialog isOpen={sendOpen} onClose={() => setSendOpen(false)} title='Send Notification'>
                <div className='flex flex-col gap-4 w-full sm:w-[min(480px,90vw)]'>
                    <label className='flex items-center gap-2 cursor-pointer'>
                        <input type='checkbox' checked={sendToAll} onChange={e => { setSendToAll(e.target.checked); setSelectedUsers([]) }}
                            className='w-4 h-4' style={{ accentColor: theme.primaryColor }} />
                        <span className='text-sm' style={{ color: theme.textColor }}>Send to All Users</span>
                    </label>

                    {!sendToAll && (
                        <div className='flex flex-col gap-2'>
                            <p className='text-xs opacity-50' style={{ color: theme.textColor }}>To</p>
                            {selectedUsers.length > 0 && (
                                <div className='flex flex-wrap gap-1.5'>
                                    {selectedUsers.map(u => (
                                        <span key={u.id} className='flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white'
                                            style={{ backgroundColor: theme.primaryColor }}>
                                            {u.firstName} {u.lastName}
                                            <button onClick={() => handleRemoveUser(u.id)} className='hover:opacity-70'><MdClose size={12} /></button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            <div className='relative' ref={dropdownRef}>
                                <input value={userSearch}
                                    onChange={e => { setUserSearch(e.target.value); setDropdownOpen(true) }}
                                    onFocus={() => setDropdownOpen(true)}
                                    placeholder='Search users...'
                                    className='w-full px-3 py-2 text-sm outline-none border rounded-lg'
                                    style={{ borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                                {dropdownOpen && filteredUsers.length > 0 && (
                                    <div className='absolute z-10 w-full mt-1 rounded-lg shadow-lg overflow-hidden max-h-48 overflow-y-auto'
                                        style={{ border: `1px solid ${theme.secondaryColor}`, backgroundColor: '#fff' }}>
                                        {filteredUsers.map(u => (
                                            <button key={u.id} onClick={() => handleSelectUser(u)}
                                                className='w-full text-left px-3 py-2 text-sm hover:opacity-70 flex items-center justify-between'
                                                style={{ color: theme.textColor }}>
                                                <span>{u.firstName} {u.lastName}</span>
                                                <span className='text-xs opacity-40'>{ROLE_LABEL[u.role] ?? u.role}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className='flex flex-col gap-1'>
                        <p className='text-xs opacity-50' style={{ color: theme.textColor }}>Type</p>
                        <input value={notifType} onChange={e => setNotifType(e.target.value)}
                            placeholder='e.g. announcement, reminder...'
                            className='w-full px-3 py-2 text-sm outline-none border rounded-lg'
                            style={{ borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                    </div>

                    <div className='flex flex-col gap-1'>
                        <p className='text-xs opacity-50' style={{ color: theme.textColor }}>Message</p>
                        <textarea value={notifMessage} onChange={e => setNotifMessage(e.target.value)}
                            placeholder='Write your message...' rows={3}
                            className='w-full px-3 py-2 text-sm outline-none border rounded-lg resize-none'
                            style={{ borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                    </div>

                    <div className='flex justify-end gap-2'>
                        <Button size='sm' variant='ghost' onClick={() => setSendOpen(false)}>Cancel</Button>
                        <Button size='sm' onClick={handleSend} loading={sending} disabled={!canSend}>Send</Button>
                    </div>
                </div>
            </Dialog>
        </Layout>
    )
}

export default Notifications
