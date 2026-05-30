import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setTheme } from '../store/slices/themeSlice'

const useTheme = () => {
    const dispatch = useDispatch()
    const theme = useSelector((state) => state.theme)

    useEffect(() => {
        const ws = new WebSocket(`${import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws'}/theme/`)

        ws.onmessage = (e) => {
            const data = JSON.parse(e.data)
            dispatch(setTheme(data))
        }

        return () => ws.close()
    }, [dispatch])

    return theme
}

export default useTheme
