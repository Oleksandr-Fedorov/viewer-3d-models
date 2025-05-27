import { FaCheckCircle } from 'react-icons/fa'

interface SuccessValid {
	message?: string
}

export const SuccessValidForm = ({ message }: SuccessValid) => {
	if (!message) return null

	return (
		<div
			className='relative bg-green-400/15 p-3 mt-4 rounded-md flex items-center
    gap-x-5 text-sm text-green-400'
		>
			<FaCheckCircle className='h-25% w-25%' />
			<p>{message}</p>
		</div>
	)
}
