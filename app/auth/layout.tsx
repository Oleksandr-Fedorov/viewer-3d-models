import React from 'react'
import '@/app/auth/auth-styles.css'
const AuthLayout = ({ children }: { children: React.ReactNode }) => {
	return <div className='auth-popup'>{children}</div>
}

export default AuthLayout
