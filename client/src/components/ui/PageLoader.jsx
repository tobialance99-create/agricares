import { useSelector } from 'react-redux'
import { AiOutlineLoading3Quarters } from 'react-icons/ai'
import { GiWheat } from 'react-icons/gi'

const PageLoader = () => {
    const theme = useSelector((state) => state.theme)

    return (
        <div className='fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4' style={{ backgroundColor: theme.backgroundColor }}>
            <div className='flex items-center gap-2'>
                <GiWheat size={40} color={theme.primaryColor} />
                <span className='text-2xl font-bold tracking-wide' style={{ color: theme.textColor }}>
                    Agri<span style={{ color: theme.primaryColor }}>Care</span>
                </span>
            </div>
            <div className='flex flex-col items-center gap-2'>
                <AiOutlineLoading3Quarters size={28} className='animate-spin' color={theme.primaryColor} />
                <span className='text-xs opacity-60' style={{ color: theme.textColor }}>Loading, please wait...</span>
            </div>
        </div>
    )
}

export default PageLoader
