import { FaExclamationTriangle } from 'react-icons/fa'

interface FormErrorProps {
	message?: string
}

export const FailValid = ({ message }: FormErrorProps) => {
	if (!message) return null

	return (
		<div
			className='relative bg-red-500/15 p-3 mt-4 rounded-md flex items-center
    gap-x-5 text-sm text-red-500'
		>
			<FaExclamationTriangle className='h-25% w-25%' />
			<p>{message}</p>
		</div>
	)
}
