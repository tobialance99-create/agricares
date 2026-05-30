import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
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
    const [error, setError] = useState(null)

    const roleLabel = role === 'farmer' ? 'Farmer' : 'Extension Worker'

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    const handleStep1 = async (e) => {
        e.preventDefault()
        if (form.password !== form.confirmPassword) return setError('Passwords do not match')
        setLoading(true)
        setError(null)
        try {
            // API call to register + send OTP will go here
            setStep(2)
        } catch (err) {
            setError('Registration failed. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleStep2 = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            // API call to verify OTP will go here
            setStep(3)
        } catch (err) {
            setError('Invalid OTP. Please try again.')
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
                                    <input name='firstName' value={form.firstName} onChange={handleChange} placeholder='First name' required
                                        className='w-full px-4 py-2.5 text-sm outline-none border'
                                        style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                                </div>
                                <div className='flex flex-col gap-1 flex-1'>
                                    <label className='text-sm font-medium' style={{ color: theme.textColor }}>Last Name</label>
                                    <input name='lastName' value={form.lastName} onChange={handleChange} placeholder='Last name' required
                                        className='w-full px-4 py-2.5 text-sm outline-none border'
                                        style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                                </div>
                            </div>

                            {role === 'farmer' && (
                                <div className='flex flex-col gap-1'>
                                    <label className='text-sm font-medium' style={{ color: theme.textColor }}>Barangay</label>
                                    <input name='barangay' value={form.barangay} onChange={handleChange} placeholder='Enter barangay' required
                                        className='w-full px-4 py-2.5 text-sm outline-none border'
                                        style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                                </div>
                            )}

                            <div className='flex flex-col gap-1'>
                                <label className='text-sm font-medium' style={{ color: theme.textColor }}>Username</label>
                                <input name='username' value={form.username} onChange={handleChange} placeholder='Enter username' required
                                    className='w-full px-4 py-2.5 text-sm outline-none border'
                                    style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                            </div>

                            <div className='flex flex-col gap-1'>
                                <label className='text-sm font-medium' style={{ color: theme.textColor }}>Mobile Number</label>
                                <input name='mobileNumber' value={form.mobileNumber} onChange={handleChange} placeholder='Enter mobile number' required
                                    className='w-full px-4 py-2.5 text-sm outline-none border'
                                    style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                            </div>

                            <div className='flex flex-col gap-1'>
                                <label className='text-sm font-medium' style={{ color: theme.textColor }}>Password</label>
                                <div className='relative'>
                                    <input name='password' type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder='Enter password' required
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
                                    <input name='confirmPassword' type={showConfirm ? 'text' : 'password'} value={form.confirmPassword} onChange={handleChange} placeholder='Confirm password' required
                                        className='w-full px-4 py-2.5 text-sm outline-none border pr-10'
                                        style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }} />
                                    <button type='button' onClick={() => setShowConfirm(!showConfirm)} className='absolute right-3 top-1/2 -translate-y-1/2 opacity-50 cursor-pointer'>
                                        {showConfirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                    </button>
                                </div>
                            </div>

                            <Button type='submit' loading={loading} className='w-full mt-2'>Register</Button>

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
                            <Button type='submit' loading={loading}>Verify OTP</Button>
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

                <p className='text-center text-sm text-white opacity-60 mt-4 cursor-pointer' onClick={() => navigate('/')}>
                    ← Back to Home
                </p>
            </div>
        </div>
    )
}

export default Register
