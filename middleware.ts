import authConfig from './auth.config'
import NextAuth from 'next-auth'
import {
	DEFAULT_LOGIN_REDIRECT,
	apiAuthPrefix,
	authRoutes,
	publicRoutes,
} from '@/routes'

const { auth } = NextAuth(authConfig)

export default auth((req): any => {
	console.log('middleware')
	const { nextUrl } = req
	const isLogged = !!req.auth
	const isApiAuth = nextUrl.pathname.startsWith(apiAuthPrefix)
	const isPublicRoute = publicRoutes.includes(nextUrl.pathname)
	const isAuthRoute = authRoutes.includes(nextUrl.pathname)

	if (isApiAuth) return null

	if (isAuthRoute) {
		if (isLogged) {
			return Response.redirect(new URL('/', nextUrl))
		}
		return null
	}

	//authRoutes[0] вместо этого может просто '/auth/login_register'
	if (!isLogged && !isPublicRoute) {
		return Response.redirect(new URL(authRoutes[0], nextUrl))
	}

	return null
})

// Optionally, don't invoke Middleware on some paths
export const config = {
	matcher: [
		'/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
		// Always run for API routes
		'/(api|trpc)(.*)',
	],
}
