import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../services/api'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import heroMinecraft from '../../assets/hero-minecraft.jpg'
import Button from '../../components/ui/Button'

const ForgotPassword = () => {
    const navigate = useNavigate()
    const theme = useSelector((state) => state.theme)

    const [step, setStep] = useState(1)
    const [identifier, setIdentifier] = useState('')
    const [mobileNumber, setMobileNumber] = useState('')
    const [otp, setOtp] = useState('')
    const [form, setForm] = useState({ password: '', confirmPassword: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleStep1 = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await api.post('/auth/forgot-password/', { identifier })
            setMobileNumber(res.data.mobileNumber)
            setStep(2)
        } catch (err) {
            setError(err.response?.data?.error || 'User not found. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleStep2 = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await api.post('/auth/verify-otp/', { mobileNumber, otp })
            setStep(3)
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleStep3 = async (e) => {
        e.preventDefault()
        if (form.password !== form.confirmPassword) return setError('Passwords do not match')
        setLoading(true)
        setError(null)
        try {
        await api.post('/auth/reset-password/', { identifier, password: form.password })
            setStep(4)
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password. Please try again.')
        } finally {
            setLoading(false)
        }
    }

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
                <div className='rounded-xl p-8 shadow-2xl' style={{ backgroundColor: theme.backgroundColor }}>
                    <span className='text-4xl font-semibold mb-4 block text-center' style={{ color: theme.textColor }}>Forgot Password</span>

                    {error && (
                        <div className='mb-4 p-3 rounded text-sm text-red-600' style={{ backgroundColor: '#fee2e2' }}>
                            {error}
                        </div>
                    )}

                    {/* Step 1 - Identifier */}
                    {step === 1 && (
                        <form onSubmit={handleStep1} className='flex flex-col gap-4'>
                            <div className='flex flex-col gap-1'>
                                <label className='text-sm font-medium' style={{ color: theme.textColor }}>Username or Mobile Number</label>
                                <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder='Enter username or mobile number' required
                                    className='w-full px-4 py-2.5 text-sm outline-none border'
                                    style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                            </div>
                            <Button type='submit' loading={loading}>Send OTP</Button>
                        </form>
                    )}

                    {/* Step 2 - OTP */}
                    {step === 2 && (
                        <form onSubmit={handleStep2} className='flex flex-col gap-4'>
                            <p className='text-sm text-center' style={{ color: theme.textColor, opacity: 0.7 }}>
                                We sent an OTP to <strong>{mobileNumber}</strong>
                            </p>
                            <div className='flex flex-col gap-1'>
                                <label className='text-sm font-medium' style={{ color: theme.textColor }}>Enter OTP</label>
                                <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder='Enter OTP' required maxLength={6}
                                    className='w-full px-4 py-2.5 text-sm outline-none border text-center tracking-widest'
                                    style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                            </div>
                            <Button type='submit' loading={loading}>Verify OTP</Button>
                        </form>
                    )}

                    {/* Step 3 - New Password */}
                    {step === 3 && (
                        <form onSubmit={handleStep3} className='flex flex-col gap-4'>
                            <div className='flex flex-col gap-1'>
                                <label className='text-sm font-medium' style={{ color: theme.textColor }}>New Password</label>
                                <div className='relative'>
                                    <input name='password' type={showPassword ? 'text' : 'password'} value={form.password}
                                        onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                                        placeholder='Enter new password' required
                                        className='w-full px-4 py-2.5 text-sm outline-none border pr-10'
                                        style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                                    <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-1/2 -translate-y-1/2 opacity-50 cursor-pointer'>
                                        {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className='flex flex-col gap-1'>
                                <label className='text-sm font-medium' style={{ color: theme.textColor }}>Confirm Password</label>
                                <div className='relative'>
                                    <input name='confirmPassword' type={showConfirm ? 'text' : 'password'} value={form.confirmPassword}
                                        onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                                        placeholder='Confirm new password' required
                                        className='w-full px-4 py-2.5 text-sm outline-none border pr-10'
                                        style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                                    <button type='button' onClick={() => setShowConfirm(!showConfirm)} className='absolute right-3 top-1/2 -translate-y-1/2 opacity-50 cursor-pointer'>
                                        {showConfirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                    </button>
                                </div>
                            </div>
                            <Button type='submit' loading={loading}>Reset Password</Button>
                        </form>
                    )}

                    {/* Step 4 - Success */}
                    {step === 4 && (
                        <div className='flex flex-col items-center gap-4 text-center'>
                            <p className='text-sm' style={{ color: theme.textColor }}>Password reset successfully!</p>
                        </div>
                    )}
                </div>

                <p className='text-center text-sm text-white opacity-60 mt-4 cursor-pointer' onClick={() => navigate('/')}>
                    ← Back to Home
                </p>
            </div>
        </div>
    )
}

export default ForgotPassword
