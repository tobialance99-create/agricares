import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { sha256 } from '../../utils/crypto'
import { MdClose, MdLock, MdLogout, MdDashboard, MdViewSidebar } from 'react-icons/md'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { clearCredentials } from '../../store/slices/authSlice'
import { setAppLoading } from '../../store/slices/appSlice'
import { deleteCookie } from '../../utils/cookies'
import useLayout from '../../hooks/useLayout'
import Confirmation from '../ui/Confirmation'
import api from '../../services/api'

const ProfilePanel = ({ isOpen, onClose }) => {
    const theme = useSelector((state) => state.theme)
    const { user } = useSelector((state) => state.auth)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { layout, toggleLayout } = useLayout()

    const [logoutConfirm, setLogoutConfirm] = useState(false)
    const [changePassStep, setChangePassStep] = useState(null) // null | 'otp' | 'newpass'
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    const handleLogout = () => {
        dispatch(setAppLoading(true))
        setTimeout(() => {
            dispatch(clearCredentials())
            deleteCookie('token')
            navigate('/')
        }, 100)
    }

    const handleChangePassword = async () => {
        setLoading(true)
        setError(null)
        try {
            await api.post('/auth/forgot-password/', { identifier: user?.mobileNumber || user?.username })
            setChangePassStep('otp')
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send OTP')
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyOtp = async () => {
        setLoading(true)
        setError(null)
        try {
            await api.post('/auth/verify-otp/', { mobileNumber: user?.mobileNumber, otp })
            setChangePassStep('newpass')
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP')
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async () => {
        if (newPassword !== confirmPassword) return setError('Passwords do not match')
        setLoading(true)
        setError(null)
        try {
            const hashedPassword = await sha256(newPassword)
            await api.post('/auth/reset-password/', { identifier: user?.mobileNumber || user?.username, password: hashedPassword })
            setSuccess('Password changed successfully!')
            setChangePassStep(null)
            setOtp('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password')
        } finally {
            setLoading(false)
        }
    }

    const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'U'

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div className='fixed inset-0 z-40' style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
            )}

            {/* Panel */}
            <div className='fixed top-0 right-0 h-full w-80 z-50 shadow-2xl transition-transform duration-300 flex flex-col'
                style={{ backgroundColor: theme.backgroundColor, transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}>

                {/* Header */}
                <div className='flex items-center justify-between p-4' style={{ backgroundColor: theme.primaryColor }}>
                    <h2 className='text-white font-semibold'>Profile</h2>
                    <button onClick={onClose} className='text-white cursor-pointer opacity-80 hover:opacity-100'>
                        <MdClose size={20} />
                    </button>
                </div>

                {/* User Info */}
                <div className='flex items-center gap-3 p-6' style={{ borderBottom: `1px solid ${theme.secondaryColor}` }}>
                    <div className='w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold'
                        style={{ backgroundColor: theme.primaryColor, color: '#fff' }}>
                        {initials}
                    </div>
                    <div>
                        <p className='font-semibold' style={{ color: theme.textColor }}>{user?.firstName} {user?.lastName}</p>
                        <p className='text-xs opacity-60 capitalize' style={{ color: theme.textColor }}>{user?.role?.replace('_', ' ')}</p>
                    </div>
                </div>

                {/* Content */}
                <div className='flex-1 p-4 flex flex-col gap-3 overflow-y-auto'>

                    {success && (
                        <div className='p-3 rounded text-sm text-green-600' style={{ backgroundColor: '#dcfce7' }}>
                            {success}
                        </div>
                    )}

                    {error && (
                        <div className='p-3 rounded text-sm text-red-600' style={{ backgroundColor: '#fee2e2' }}>
                            {error}
                        </div>
                    )}

                    {/* Layout Toggle */}
                    {!changePassStep && (
                        <div className='p-4 rounded-xl' style={{ backgroundColor: theme.primaryColor + '10', border: `1px solid ${theme.secondaryColor}` }}>
                            <p className='text-sm font-semibold mb-3' style={{ color: theme.textColor }}>Layout</p>
                            <div className='flex gap-2'>
                                <button onClick={() => toggleLayout('topbar')}
                                    className='flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer'
                                    style={{ backgroundColor: layout === 'topbar' ? theme.primaryColor : 'transparent', color: layout === 'topbar' ? '#fff' : theme.textColor, border: `1px solid ${theme.secondaryColor}` }}>
                                    <MdDashboard size={16} className='mx-auto mb-1' />
                                    Topbar
                                </button>
                                <button onClick={() => toggleLayout('sidebar')}
                                    className='flex-1 py-2 rounded-lg text-xs font-medium cursor-pointer'
                                    style={{ backgroundColor: layout === 'sidebar' ? theme.primaryColor : 'transparent', color: layout === 'sidebar' ? '#fff' : theme.textColor, border: `1px solid ${theme.secondaryColor}` }}>
                                    <MdViewSidebar size={16} className='mx-auto mb-1' />
                                    Sidebar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Change Password */}
                    {!changePassStep && (
                        <button onClick={handleChangePassword} disabled={loading}
                            className='flex items-center gap-3 p-4 rounded-xl w-full text-left cursor-pointer'
                            style={{ backgroundColor: theme.primaryColor + '10', border: `1px solid ${theme.secondaryColor}` }}>
                            {loading ? <AiOutlineLoading3Quarters size={18} className='animate-spin' color={theme.primaryColor} /> : <MdLock size={18} color={theme.primaryColor} />}
                            <span className='text-sm font-medium' style={{ color: theme.textColor }}>Change Password</span>
                        </button>
                    )}

                    {/* OTP Step */}
                    {changePassStep === 'otp' && (
                        <div className='flex flex-col gap-3'>
                            <p className='text-sm' style={{ color: theme.textColor }}>Enter the OTP sent to your email/mobile:</p>
                            <input value={otp} onChange={e => setOtp(e.target.value)} placeholder='Enter OTP' maxLength={6}
                                className='w-full px-4 py-2.5 text-sm outline-none border text-center tracking-widest'
                                style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                            <div className='flex gap-2'>
                                <button onClick={() => { setChangePassStep(null); setOtp('') }}
                                    className='flex-1 py-2 rounded-lg text-sm cursor-pointer'
                                    style={{ border: `1px solid ${theme.secondaryColor}`, color: theme.textColor }}>
                                    Cancel
                                </button>
                                <button onClick={handleVerifyOtp} disabled={loading}
                                    className='flex-1 py-2 rounded-lg text-sm text-white cursor-pointer'
                                    style={{ backgroundColor: theme.primaryColor }}>
                                    {loading ? <AiOutlineLoading3Quarters size={16} className='animate-spin mx-auto' /> : 'Verify'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* New Password Step */}
                    {changePassStep === 'newpass' && (
                        <div className='flex flex-col gap-3'>
                            <input type='password' value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder='New Password'
                                className='w-full px-4 py-2.5 text-sm outline-none border'
                                style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                            <input type='password' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder='Confirm Password'
                                className='w-full px-4 py-2.5 text-sm outline-none border'
                                style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                            <div className='flex gap-2'>
                                <button onClick={() => { setChangePassStep(null); setNewPassword(''); setConfirmPassword('') }}
                                    className='flex-1 py-2 rounded-lg text-sm cursor-pointer'
                                    style={{ border: `1px solid ${theme.secondaryColor}`, color: theme.textColor }}>
                                    Cancel
                                </button>
                                <button onClick={handleResetPassword} disabled={loading}
                                    className='flex-1 py-2 rounded-lg text-sm text-white cursor-pointer'
                                    style={{ backgroundColor: theme.primaryColor }}>
                                    {loading ? <AiOutlineLoading3Quarters size={16} className='animate-spin mx-auto' /> : 'Save'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Logout */}
                {!changePassStep && (
                    <div className='p-4' style={{ borderTop: `1px solid ${theme.secondaryColor}` }}>
                        <button onClick={() => setLogoutConfirm(true)}
                            className='flex items-center gap-3 p-4 rounded-xl w-full text-left cursor-pointer'
                            style={{ backgroundColor: theme.dangerColor + '10', border: `1px solid ${theme.dangerColor}40` }}>
                            <MdLogout size={18} color={theme.dangerColor} />
                            <span className='text-sm font-medium' style={{ color: theme.dangerColor }}>Logout</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Logout Confirmation */}
            <Confirmation
                isOpen={logoutConfirm}
                title='Logout'
                message="Are you sure you want to logout? You will need to login again to access your account."
                onConfirm={handleLogout}
                onCancel={() => setLogoutConfirm(false)}
                confirmText='Logout'
            />
        </>
    )
}

export default ProfilePanel
