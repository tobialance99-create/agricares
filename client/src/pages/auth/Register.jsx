import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../services/api'
import { FaEye, FaEyeSlash, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import Dialog from '../../components/ui/Dialog'
import heroMinecraft from '../../assets/hero-minecraft.jpg'
import Button from '../../components/ui/Button'

const Register = () => {
    const [searchParams] = useSearchParams()
    const role = searchParams.get('role')
    const navigate = useNavigate()
    const theme = useSelector((state) => state.theme)

    const [step, setStep] = useState(1)
    const [form, setForm] = useState({ firstName: '', lastName: '', barangay: '', username: '', mobileNumber: '', password: '', confirmPassword: '' })
    const [otp, setOtp] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [countdown, setCountdown] = useState(3)
    const [error, setError] = useState(null)
    const [usernameStatus, setUsernameStatus] = useState(null) // null | 'checking' | 'available' | 'taken'
    const [mobileStatus, setMobileStatus] = useState(null)
    const [dialog, setDialog] = useState({ open: false, type: null, messages: [] })
    const [loadingMessage, setLoadingMessage] = useState(null)
    const passwordReqs = {
        minLength: form.password.length >= 8,
        hasUpper: /[A-Z]/.test(form.password),
        hasNumber: /[0-9]/.test(form.password),
        hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(form.password),
    }
    const allReqsMet = Object.values(passwordReqs).every(Boolean)

    const roleLabel = role === 'farmer' ? 'Farmer' : 'Extension Worker'

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleStep1 = async (e) => {
        e.preventDefault()

        const missing = []
        if (!form.firstName) missing.push('First Name')
        if (!form.lastName) missing.push('Last Name')
        if (role === 'farmer' && !form.barangay) missing.push('Barangay')
        if (!form.username) missing.push('Username')
        if (!form.mobileNumber) missing.push('Mobile Number')
        if (!form.password) missing.push('Password')
        if (!form.confirmPassword) missing.push('Confirm Password')
        if (usernameStatus === 'taken') missing.push('Username is already taken')
        if (mobileStatus === 'taken') missing.push('Mobile number is already registered')
        if (!allReqsMet) missing.push('Password does not meet all requirements')
        if (form.password !== form.confirmPassword) missing.push('Passwords do not match')

        if (missing.length > 0) {
            setDialog({ open: true, type: 'error', messages: missing })
            return
        }
        setLoadingMessage('Registering your account...')
        setLoading(true)
        setError(null)
        try {
            await api.post('/auth/register/', {
                firstName: form.firstName,
                lastName: form.lastName,
                barangay: form.barangay,
                username: form.username,
                mobileNumber: form.mobileNumber,
                password: form.password,
                role: role === 'farmer' ? 'farmer' : 'extension_worker',
            })
            setLoadingMessage(null)
            setCountdown(3)
            setDialog({ open: true, type: 'success', messages: [] })
            const interval = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        setDialog({ open: false, type: null, messages: [] })
                        setStep(2)
                        return 3
                    }
                    return prev - 1
                })
            }, 1000)
        } catch (err) {
            setLoadingMessage(null)
            setDialog({ open: true, type: 'error', messages: [err.response?.data?.error || 'Registration failed. Please try again.'] })
        } finally {
            setLoading(false)
        }
    }

    const handleStep2 = async (e) => {
        e.preventDefault()
        setLoadingMessage('Verifying OTP...')
        setLoading(true)
        setError(null)
        try {
            await api.post('/auth/verify-otp/', { mobileNumber: form.mobileNumber, otp, isRegistration: true })
            setLoadingMessage(null)
            setStep(3)
        } catch (err) {
            setLoadingMessage(null)
            setError(err.response?.data?.error || 'Invalid OTP. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!form.username) return setUsernameStatus(null)
        setUsernameStatus('checking')
        const timer = setTimeout(async () => {
            const res = await api.get(`/auth/check-username/?username=${form.username}`)
            setUsernameStatus(res.data.available ? 'available' : 'taken')
        }, 500)
        return () => clearTimeout(timer)
    }, [form.username])

    useEffect(() => {
        if (!form.mobileNumber) return setMobileStatus(null)
        setMobileStatus('checking')
        const timer = setTimeout(async () => {
            const res = await api.get(`/auth/check-mobile/?mobile=${form.mobileNumber}`)
            setMobileStatus(res.data.available ? 'available' : 'taken')
        }, 500)
        return () => clearTimeout(timer)
    }, [form.mobileNumber])




    return (
        <div className='min-h-screen flex items-center justify-center relative'
            style={{ backgroundImage: `url(${theme.minecraftHero ? heroMinecraft : ''})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className='absolute inset-0' style={{ backgroundColor: 'rgba(0,0,0,0.55)' }} />

            <div className='relative z-10 w-full max-w-md mx-4'>
                {/* Logo */}
                <div className='flex flex-col items-center gap-2 mb-6'>
                    <span className='text-8xl font-bold text-white tracking-wide'>
                        Agri<span style={{ color: theme.secondaryColor }}>Care</span>
                    </span>
                </div>

                {/* Card */}
                <div className='rounded-xl shadow-2xl' style={{ backgroundColor: theme.backgroundColor }}>
                    {/* Form */}
                    <div className='p-8'>
                        <span className='text-4xl font-semibold mb-4 block text-center' style={{ color: theme.textColor }}>{roleLabel} Register</span>
                        {error && (
                            <div className='mb-4 p-3 rounded text-sm text-red-600' style={{ backgroundColor: '#fee2e2' }}>
                                {error}
                            </div>
                        )}

                        {/* Step 1 - Form */}
                        {step === 1 && (
                            <form onSubmit={handleStep1} className='flex flex-col gap-4'>
                                <div className='flex gap-3'>
                                    <div className='flex flex-col gap-1 flex-1'>
                                        <label className='text-sm font-medium' style={{ color: theme.textColor }}>First Name</label>
                                        <input name='firstName' value={form.firstName} onChange={handleChange} placeholder='First name'
                                            className='w-full px-4 py-2.5 text-sm outline-none border'
                                            style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                                    </div>
                                    <div className='flex flex-col gap-1 flex-1'>
                                        <label className='text-sm font-medium' style={{ color: theme.textColor }}>Last Name</label>
                                        <input name='lastName' value={form.lastName} onChange={handleChange} placeholder='Last name'
                                            className='w-full px-4 py-2.5 text-sm outline-none border'
                                            style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                                    </div>
                                </div>

                                {role === 'farmer' && (
                                    <div className='flex flex-col gap-1'>
                                        <label className='text-sm font-medium' style={{ color: theme.textColor }}>Barangay</label>
                                        <input name='barangay' value={form.barangay} onChange={handleChange} placeholder='Enter barangay'
                                            className='w-full px-4 py-2.5 text-sm outline-none border'
                                            style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                                    </div>
                                )}

                                <div className='flex flex-col gap-1'>
                                    <label className='text-sm font-medium' style={{ color: theme.textColor }}>Username</label>
                                    <div className='relative'>
                                        <input name='username' value={form.username} onChange={handleChange} placeholder='Enter username'
                                            className='w-full px-4 py-2.5 text-sm outline-none border pr-8'
                                            style={{ borderRadius: theme.borderRadius, borderColor: usernameStatus === 'taken' ? theme.dangerColor : usernameStatus === 'available' ? '#22c55e' : theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                                        {usernameStatus === 'checking' && <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50'>...</span>}
                                        {usernameStatus === 'available' && <span className='absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm'>✓</span>}
                                        {usernameStatus === 'taken' && <span className='absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-sm'>✗</span>}
                                    </div>
                                    {usernameStatus === 'taken' && <span className='text-xs' style={{ color: theme.dangerColor }}>Username is already taken</span>}
                                </div>

                                <div className='flex flex-col gap-1'>
                                    <label className='text-sm font-medium' style={{ color: theme.textColor }}>Mobile Number</label>
                                    <div className='relative'>
                                        <input name='mobileNumber' type='tel' value={form.mobileNumber} onChange={(e) => setForm(prev => ({ ...prev, mobileNumber: e.target.value.replace(/\D/g, '') }))} placeholder='Enter mobile number'
                                            className='w-full px-4 py-2.5 text-sm outline-none border pr-8'
                                            style={{ borderRadius: theme.borderRadius, borderColor: mobileStatus === 'taken' ? theme.dangerColor : mobileStatus === 'available' ? '#22c55e' : theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                                        {mobileStatus === 'checking' && <span className='absolute right-3 top-1/2 -translate-y-1/2 text-xs opacity-50'>...</span>}
                                        {mobileStatus === 'available' && <span className='absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm'>✓</span>}
                                        {mobileStatus === 'taken' && <span className='absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-sm'>✗</span>}
                                    </div>
                                    {mobileStatus === 'taken' && <span className='text-xs' style={{ color: theme.dangerColor }}>Mobile number is already registered</span>}
                                </div>

                                <div className='flex flex-col gap-1'>
                                    <label className='text-sm font-medium' style={{ color: theme.textColor }}>Password</label>
                                    <div className='relative'>
                                        <input name='password' type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder='Enter password'
                                            className='w-full px-4 py-2.5 text-sm outline-none border pr-10'
                                            style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                                        <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-1/2 -translate-y-1/2 opacity-50 cursor-pointer'>
                                            {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Requirements */}
                                <div className='flex flex-col gap-2 p-4 rounded-lg' style={{ backgroundColor: theme.primaryColor + '10' }}>
                                    <p className='text-xs font-semibold' style={{ color: theme.textColor }}>Password Requirements</p>
                                    {[
                                        { label: 'At least 8 characters', met: passwordReqs.minLength },
                                        { label: '1 uppercase letter', met: passwordReqs.hasUpper },
                                        { label: '1 number', met: passwordReqs.hasNumber },
                                        { label: '1 special character', met: passwordReqs.hasSpecial },
                                    ].map(({ label, met }) => (
                                        <div key={label} className='flex items-center gap-2'>
                                            <span className={`text-sm ${met ? 'text-green-500' : 'text-red-400'}`}>{met ? '✓' : '✗'}</span>
                                            <span className='text-xs' style={{ color: theme.textColor, opacity: met ? 1 : 0.6 }}>{label}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className='flex flex-col gap-1'>
                                    <label className='text-sm font-medium' style={{ color: theme.textColor }}>Confirm Password</label><div className='relative'>
                                        <input name='confirmPassword' type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} placeholder='Confirm password'
                                            className='w-full px-4 py-2.5 text-sm outline-none border pr-10'
                                            style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                                        <button type='button' onClick={() => setShowConfirm(!showConfirm)} className='absolute right-3 top-1/2 -translate-y-1/2 opacity-50 cursor-pointer'>
                                            {showConfirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <Button type='submit' disabled={!!loadingMessage} className='w-full mt-2'>Register</Button>

                                <p className='text-center text-sm' style={{ color: theme.textColor }}>
                                    Already have an account?{' '}
                                    <Link to={`/login?role=${role}`} style={{ color: theme.primaryColor }} className='font-medium'>Login</Link>
                                </p>
                            </form>
                        )}

                        {/* Step 2 - OTP */}
                        {step === 2 && (
                            <form onSubmit={handleStep2} className='flex flex-col gap-4'>
                                <p className='text-sm text-center' style={{ color: theme.textColor, opacity: 0.7 }}>
                                    We sent an OTP to your mobile number <strong>{form.mobileNumber}</strong>
                                </p>
                                <div className='flex flex-col gap-1'>
                                    <label className='text-sm font-medium' style={{ color: theme.textColor }}>Enter OTP</label>
                                    <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder='Enter OTP' required maxLength={6}
                                        className='w-full px-4 py-2.5 text-sm outline-none border text-center tracking-widest'
                                        style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                                </div>
                                <Button type='submit' disabled={!!loadingMessage}>Verify OTP</Button>
                                <p className='text-center text-sm cursor-pointer' style={{ color: theme.primaryColor }} onClick={() => setStep(1)}>← Back</p>
                            </form>
                        )}

                        {/* Step 3 - Success */}
                        {step === 3 && (
                            <div className='flex flex-col items-center gap-4 text-center'>
                                {role === 'farmer' ? (
                                    <>
                                        <p className='text-sm' style={{ color: theme.textColor }}>Your account has been created successfully!</p>
                                        <Button onClick={() => navigate(`/login?role=farmer`)}>Go to Login</Button>
                                    </>
                                ) : (
                                    <>
                                        <p className='text-sm' style={{ color: theme.textColor }}>Your account is pending approval from the admin.</p>
                                        <Button onClick={() => navigate('/pending-approval')}>View Status</Button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                    {/* Loading Dialog */}
                    <Dialog isOpen={!!loadingMessage} title={loadingMessage}>
                        <div className='flex justify-center py-2'>
                            <AiOutlineLoading3Quarters size={28} className='animate-spin' color={theme.primaryColor} />
                        </div>
                    </Dialog>

                    {/* Validation/Success Dialog */}
                    <Dialog
                        isOpen={dialog.open}
                        onClose={() => setDialog({ open: false, type: null, messages: [] })}
                        title={dialog.type === 'success' ? 'OTP Sent!' : 'Please fix the following'}
                        icon={dialog.type === 'success' ? FaCheckCircle : FaExclamationCircle}
                    >
                        {dialog.type === 'success' ? (
                            <div className='text-center'>
                                <p className='text-sm' style={{ color: theme.textColor }}>
                                    OTP has been sent to <strong>{form.mobileNumber}</strong>
                                </p>
                                <p className='text-xs opacity-60 mt-2' style={{ color: theme.textColor }}>
                                    Redirecting in {countdown} {countdown === 1 ? 'second' : 'seconds'}...
                                </p>
                            </div>
                        ) : (
                            <ul className='flex flex-col gap-2'>
                                {dialog.messages.map((msg, i) => (
                                    <li key={i} className='flex items-center gap-2 text-sm' style={{ color: theme.textColor }}>
                                        <span className='text-red-500'>•</span> {msg}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {dialog.type === 'error' && (
                            <div className='flex justify-end mt-4'>
                                <Button onClick={() => setDialog({ open: false, type: null, messages: [] })}>OK</Button>
                            </div>
                        )}
                    </Dialog>

                </div>
                <p className='text-center text-sm text-white opacity-60 mt-4 cursor-pointer' onClick={() => navigate('/')}>
                    ← Back to Home
                </p>
            </div>
        </div>
    )
}

export default Register
