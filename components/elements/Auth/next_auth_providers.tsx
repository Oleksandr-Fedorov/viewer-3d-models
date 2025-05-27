'use client'
import NextTopLoader from 'nextjs-toploader'
import { SessionProvider } from 'next-auth/react'
import { Toaster } from 'react-hot-toast'

export const Providers: React.FC<React.PropsWithChildren> = ({ children }) => {
	return (
		<>
			<SessionProvider>{children}</SessionProvider>
			<Toaster reverseOrder={false} />
			<NextTopLoader />
		</>
	)
}
