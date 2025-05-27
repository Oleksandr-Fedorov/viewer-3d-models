'use client'

import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'
import { Button } from '@/components/ui/button'
import { signInSoc } from '@/actions/authSoc'
import { toast } from 'react-hot-toast'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'

const AuthPopupSocials = () => {
	return (
		<div className='cart-body__socials'>
			<div className='space-y-3'>
				<Button
					onClick={() => {
						signInSoc('google')
					}}
					className='w-full py-3 px-4 flex items-center justify-center space-x-2 bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-lg shadow-md transition-colors duration-200'
				>
					<FcGoogle className='text-xl' />
					<span>Continue with Google</span>
				</Button>

				<Button
					onClick={() => signInSoc('github')}
					type='button'
					className='w-full py-3 flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold rounded-lg shadow-md transition-colors duration-200'
				>
					<FaGithub className='text-xl' />
					<span>Continue with GitHub</span>
				</Button>
			</div>
		</div>
	)
}

export default AuthPopupSocials
