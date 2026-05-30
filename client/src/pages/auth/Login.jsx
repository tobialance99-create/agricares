import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { setCredentials } from '../../store/slices/authSlice'
import { setCookie, REMEMBER_ME_DAYS } from '../../utils/cookies'
import api from '../../services/api'
import { GiWheat } from 'react-icons/gi'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import logoMinecraft from '../../assets/logo-minecraft.png'
import heroMinecraft from '../../assets/hero-minecraft.jpg'
import Button from '../../components/ui/Button'

const Login = () => {
    const [searchParams] = useSearchParams()
    const role = searchParams.get('role')
    const navigate = useNavigate()
    const theme = useSelector((state) => state.theme)
    const dispatch = useDispatch()

    const [form, setForm] = useState({ identifier: '', password: '', rememberMe: false })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const res = await api.post('/auth/login/', { identifier: form.identifier, password: form.password })
            setCookie('token', res.data.access, form.rememberMe ? REMEMBER_ME_DAYS : 1)
            dispatch(setCredentials({ user: res.data.user, token: res.data.access }))
            const userRole = res.data.user.role
            if (userRole === 'admin') navigate('/admin/dashboard')
            else if (userRole === 'farmer') navigate('/farmer/knowledge-repository')
            else if (userRole === 'extension_worker') navigate('/extension-worker/tickets')
        } catch (err) {
            const msg = err.response?.data?.error
            if (err.response?.data?.isPending) navigate('/pending-approval')
            else setError(msg || 'Invalid credentials. Please try again.')
        } finally {
            setLoading(false)
        }
    }


    const roleLabel = role === 'farmer' ? 'Farmer' : role === 'extension' ? 'Extension Worker' : 'Admin'

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
                    <span className='text-5xl font-semibold mb-4 block text-center' style={{ color: theme.textColor }}>{roleLabel} Login</span>
                    {error && (
                        <div className='mb-4 p-3 rounded text-sm text-red-600' style={{ backgroundColor: '#fee2e2' }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
                        <div className='flex flex-col gap-1'>
                            <label className='text-sm font-medium' style={{ color: theme.textColor }}>
                                {role === 'admin' ? 'Username' : 'Username or Mobile Number'}
                            </label>
                            <input
                                name='identifier'
                                value={form.identifier}
                                onChange={handleChange}
                                placeholder={role === 'admin' ? 'Enter username' : 'Enter username or mobile number'}
                                required
                                className='w-full px-4 py-2.5 text-sm outline-none border'
                                style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }}
                            />
                        </div>

                        <div className='flex flex-col gap-1'>
                            <label className='text-sm font-medium' style={{ color: theme.textColor }}>Password</label>
                            <div className='relative'>
                                <input
                                    name='password'
                                    type={showPassword ? 'text' : 'password'}
                                    value={form.password}
                                    onChange={handleChange}
                                    placeholder='Enter password'
                                    required
                                    className='w-full px-4 py-2.5 text-sm outline-none border pr-10'
                                    style={{ borderRadius: theme.borderRadius, borderColor: theme.secondaryColor, backgroundColor: '#fff', color: theme.textColor }}
                                />
                                <button type='button' onClick={() => setShowPassword(!showPassword)}
                                    className='absolute right-3 top-1/2 -translate-y-1/2 opacity-50 cursor-pointer'>
                                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className='flex items-center justify-between'>
                            <label className='flex items-center gap-2 text-sm cursor-pointer' style={{ color: theme.textColor }}>
                                <input type='checkbox' name='rememberMe' checked={form.rememberMe} onChange={handleChange} />
                                Remember Me
                            </label>
                            <Link to='/forgot-password' className='text-sm' style={{ color: theme.primaryColor }}>Forgot Password?</Link>
                        </div>

                        <Button type='submit' loading={loading} className='w-full mt-2'>Login</Button>

                        {role !== 'admin' && (
                            <p className='text-center text-sm' style={{ color: theme.textColor }}>
                                Don't have an account?{' '}
                                <Link to={`/register?role=${role}`} style={{ color: theme.primaryColor }} className='font-medium'>Register</Link>
                            </p>
                        )}
                    </form>
                </div>

                <p className='text-center text-sm text-white opacity-60 mt-4 cursor-pointer' onClick={() => navigate('/')}>
                    ← Back to Home
                </p>
            </div>
        </div>
    )
}

export default Login
