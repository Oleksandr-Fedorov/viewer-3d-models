import React, { useEffect } from 'react'

interface MaterialWarningModalProps {
	isOpen: boolean
	onClose: () => void
	onContinue: () => void
	onCancel: () => void
}

const MaterialWarningModal: React.FC<MaterialWarningModalProps> = ({
	isOpen,
	onClose,
	onContinue,
	onCancel,
}) => {
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onCancel()
			}
		}

		document.addEventListener('keydown', handleEscape)
		return () => {
			document.removeEventListener('keydown', handleEscape)
		}
	}, [isOpen, onCancel])

	if (!isOpen) return null

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
			<div className='bg-white p-6 rounded-lg shadow-lg max-w-md w-full'>
				<h2 className='text-xl font-bold mb-4'>Предупреждение о материалах</h2>
				<p className='mb-6'>
					Обнаружены пользовательские материалы/текстуры. Продолжить загрузку с
					пользовательскими материалами?
				</p>
				<div className='flex justify-end space-x-4'>
					<button
						onClick={onCancel}
						className='px-4 py-2 bg-gray-300 rounded hover:bg-gray-400'
					>
						Отмена
					</button>
					<button
						onClick={onContinue}
						className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
					>
						Продолжить
					</button>
				</div>
			</div>
		</div>
	)
}

export default MaterialWarningModal
