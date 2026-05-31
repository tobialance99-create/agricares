import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setTheme } from '../store/slices/themeSlice'
import { setAppLoading } from '../store/slices/appSlice'

const useTheme = () => {
    const dispatch = useDispatch()
    const theme = useSelector((state) => state.theme)

    useEffect(() => {
        const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
        const wsHost = import.meta.env.VITE_WS_URL || `${wsProtocol}//${window.location.host}`
        const ws = new WebSocket(`${wsHost}/ws/system/`)

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data)
            if (data.type === 'theme') {
                const { type, ...themeData } = data
                dispatch(setTheme(themeData))
            }
        }

        ws.onerror = () => ws.close()

        return () => ws.close()
    }, [dispatch])

    return theme
}

export default useTheme
