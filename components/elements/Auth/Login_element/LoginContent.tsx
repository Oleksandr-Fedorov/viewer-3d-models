'use client'
import { useContext, useState } from 'react'
import Input from '../Common_Elements/input'
import Button from '../Common_Elements/button'
import { FaUser, FaLock, FaGithub, FaLockOpen } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'

const LoginContent = () => {
	const [isOpen, SetOpen] = useState(false)
	return (
		<div
			className='flex items-center justify-center h-screen'
			style={{
				background:
					'linear-gradient(90deg, rgba(0,0,0,1) 15%, rgba(2,0,42,1) 58%, rgba(4,0,116,1) 100%)',
			}}
		>
			<div
				className='p-8 rounded-xl shadow-lg w-96 backdrop-blur-lg'
				style={{
					background:
						'linear-gradient(270deg, rgba(0,0,0,0.5) 15%, rgba(2,0,42,0.5) 58%, rgba(4,0,116,0.5) 100%)',
				}}
			>
				<h1 className='text-3xl font-bold text-center text-blue-400 mb-6'>
					Login
				</h1>
				<form
					onSubmit={event => {
						event.preventDefault()
						console.log('Login')
					}}
					className='space-y-6'
				>
					<div className='relative'>
						<Input
							type='text'
							placeholder='Login'
							required
							className='w-full py-3 px-4 bg-transparent border-2 border-gray-700 rounded-lg text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400'
						/>
						<FaUser className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl' />
					</div>

					<div className='relative'>
						<Input
							type={isOpen ? 'text' : 'password'}
							placeholder='Password'
							required
							className='w-full py-3 px-4 bg-transparent border-2 border-gray-700 rounded-lg text-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400'
						/>
						{isOpen ? (
							<FaLockOpen
								className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl cursor-pointer'
								onClick={() => SetOpen(!isOpen)}
							/>
						) : (
							<FaLock
								className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl cursor-pointer'
								onClick={() => SetOpen(!isOpen)}
							/>
						)}
					</div>

					<div className='flex justify-between items-center text-sm'>
						<label className='flex items-center space-x-2'>
							<input type='checkbox' className='form-checkbox text-blue-400' />
							<span className='text-white'>Save data</span>
						</label>
						<a href='#' className='text-blue-400 hover:underline'>
							Forgot password?
						</a>
					</div>

					<Button className='w-full  bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg shadow-md'>
						Enter
					</Button>

					<div className=' flex items-center space-x-3 h-15 '>
						<div className='border-t border-gray-700 w-full '></div>
						<span className=' text-gray-400 text-sm'>or</span>
						<div className='border-t border-gray-700 w-full'></div>
					</div>

					<div className='space-y-3'>
						<Button
							ColorText='gray-800'
							// Тут регистрация через Google API
							onClick={() => console.log('Google login')}
							className='w-full py-3 px-4 flex items-center justify-center space-x-2 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-lg shadow-md transition-colors duration-200'
						>
							<FcGoogle className='text-xl' />
							<span>Continue with Google</span>
						</Button>

						<Button
							type='button'
							// Тут регистрация через GitHub API
							onClick={() => console.log('GitHub login')}
							className='w-full py-3 flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg shadow-md transition-colors duration-200'
						>
							<FaGithub className='text-xl' />
							<span>Continue with GitHub</span>
						</Button>
					</div>

					<p className='text-center text-sm text-white'>
						Here first time?{' '}
						<a href='#' className='text-blue-400 hover:underline'>
							Registration
						</a>
					</p>
				</form>
			</div>
		</div>
	)
}

export default LoginContent
