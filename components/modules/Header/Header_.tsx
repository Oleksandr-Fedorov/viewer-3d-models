'use client'
import { ShoppingCart, User, LogIn } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useCurrentUser } from '@/hooks/UseCurrentUser'

export default function Header() {
	const user = useCurrentUser()

	return (
		<header className='main-header'>
			<div className='header-content'>
				<div className='flex items-center justify-between w-full'>
					{/* Logo section */}
					<div className='flex-shrink-0'>
						<Link href='/' className='flex items-center space-x-2'>
							<img src='/logo_1.png' width={50} alt='image' />
							<span className='text-xl font-bold logo-text'>Prisma3D</span>
						</Link>
					</div>

					{/* Icons section */}
					<div className='flex items-center space-x-6'>
						{user ? (
							<Link href='/settings'>
								<Button variant='ghost' size='icon' className='nav-icon-btn'>
									<User className='h-5 w-5 text-cyan-400' />
									<span className='sr-only'>Profile</span>
								</Button>
							</Link>
						) : (
							<Link href='/auth/login_register'>
								<Button variant='ghost' size='icon' className='nav-icon-btn'>
									<LogIn className='h-5 w-5 text-cyan-400' />
									<span className='sr-only'>Login</span>
								</Button>
							</Link>
						)}
					</div>
				</div>
			</div>
		</header>
	)
}
