'use client'
import { useState } from 'react'
import LoginContent from './LoginContent'

const LoginTitle = () => {
	const [isWireFrame, setWireframe] = useState(false)

	return (
		<div className='relative h-screen'>
			<LoginContent />
			<button
				className='absolute top-5 right-5 bg-blue-500 text-white px-4 py-2 rounded-md shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400'
				onClick={() => setWireframe(!isWireFrame)}
			>
				Toggle Wireframe
			</button>
		</div>
	)
}

export default LoginTitle
