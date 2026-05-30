import { useSelector } from 'react-redux'

const Dialog = ({ isOpen, onClose, title, icon: Icon, children, actions }) => {
    const theme = useSelector((state) => state.theme)

    if (!isOpen) return null

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center' style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className='w-fit max-w-[90%] shadow-lg p-6' style={{ backgroundColor: theme.backgroundColor, borderRadius: theme.borderRadius }}>
                <div className='flex flex-col items-center text-center gap-3 mb-4'>
                    {Icon && <Icon size={40} color={theme.primaryColor} />}
                    {title && <h2 className='text-lg font-semibold m-0' style={{ color: theme.textColor }}>{title}</h2>}
                </div>
                <div style={{ color: theme.textColor }}>
                    {children}
                </div>
                {actions && (
                    <div className='flex gap-2 justify-end mt-6'>
                        {actions}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Dialog
