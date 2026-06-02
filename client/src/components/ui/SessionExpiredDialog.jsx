import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setSessionExpired, setAppLoading } from '../../store/slices/appSlice'
import { clearCredentials } from '../../store/slices/authSlice'
import { deleteCookie } from '../../utils/cookies'

const SessionExpiredDialog = () => {
    const theme = useSelector((state) => state.theme)
    const sessionExpired = useSelector((state) => state.app.sessionExpired)
    const dispatch = useDispatch()
    const navigate = useNavigate()

    if (!sessionExpired) return null

    return (
        <div className='fixed inset-0 z-[200] flex items-center justify-center' style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div className='rounded-xl p-8 shadow-2xl text-center flex flex-col gap-4 mx-4' style={{ backgroundColor: theme.backgroundColor, maxWidth: '360px', width: '100%' }}>
                <span className='text-4xl'>⏰</span>
                <h2 className='text-lg font-bold' style={{ color: theme.textColor }}>Session Expired</h2>
                <p className='text-sm opacity-60' style={{ color: theme.textColor }}>Your session has expired. Please login again to continue.</p>
                <button
                    className='w-full py-2.5 rounded-lg font-medium text-sm text-white cursor-pointer'
                    style={{ backgroundColor: theme.primaryColor, borderRadius: theme.borderRadius }}
                    onClick={() => {
                        dispatch(setSessionExpired(false))
                        dispatch(setAppLoading(true))
                        setTimeout(() => {
                            dispatch(clearCredentials())
                            deleteCookie('token')
                            navigate('/')
                        }, 100)
                    }}
                >
                    Login Again
                </button>
            </div>
        </div>
    )
}

export default SessionExpiredDialog
