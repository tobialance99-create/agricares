import { useSelector } from 'react-redux'
import { MdClose } from 'react-icons/md'

const SidePanel = ({ isOpen, onClose, title, children, header, footer }) => {

    const theme = useSelector((state) => state.theme)

    return (
        <>
            {isOpen && (
                <div className='fixed inset-0 z-40' style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={onClose} />
            )}
            <div className='fixed top-0 right-0 h-full w-80 z-50 shadow-2xl transition-transform duration-300 flex flex-col'
                style={{ backgroundColor: theme.backgroundColor, transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}>
                <div className='flex items-center justify-between p-4' style={{ backgroundColor: theme.primaryColor }}>
                    <h2 className='text-white font-semibold'>{title}</h2>
                    <button onClick={onClose} className='text-white cursor-pointer opacity-80 hover:opacity-100'>
                        <MdClose size={20} />
                    </button>
                </div>
                {header && <div style={{ borderBottom: `1px solid ${theme.secondaryColor}` }}>{header}</div>}
                <div className='flex-1 p-4 flex flex-col gap-3 overflow-y-auto'>
                    {children}
                </div>
                {footer && <div style={{ borderTop: `1px solid ${theme.secondaryColor}` }}>{footer}</div>}
            </div>
        </>
    )
}

export default SidePanel
