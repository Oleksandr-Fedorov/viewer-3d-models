'use client'

import { useRouter } from 'next/router'

interface LoginButtonProps {
	children: React.ReactNode
	mode?: 'modal' | 'redirect'
	asChild?: boolean
}

export const LoginButton = ({
	children,
	mode = 'redirect',
	asChild,
}: LoginButtonProps) => {
	const router = useRouter()

	if (mode === 'modal') {
		return <span>TODO: Login with OAuth</span>
	}

	return <span onClick={() => router.push('/auth_page')}>{children}</span>
}
