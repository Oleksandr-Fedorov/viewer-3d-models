import NextAuth from 'next-auth'
import authConfig from './auth.config'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from './lib/db'
import { UserRole } from '@prisma/client'
import { getDB_User_ByID } from './data/user'

export const { auth, handlers, signIn, signOut } = NextAuth({
	pages: {
		signIn: '/auth/login_register',
		error: '/auth/error',
	},
	events: {
		async linkAccount({ user }) {
			await db.user.update({
				where: {
					id: user.id,
				},
				data: {
					emailVerified: new Date(),
				},
			})
		},
	},
	callbacks: {
		// async signIn({ user }) {
		// 	const existedUser = await getDB_User_ByID(user.id!)
		// 	console.log('USER_IN_SIGNIN', user)
		// 	console.log('existedUser', existedUser)
		// 	return true
		// },
		async jwt({ token, user, account }) {
			console.log('USER_IN_JWT', user)
			console.log('account', account)
			if (!token.sub) return token
			const existedUser = await getDB_User_ByID(token.sub)
			if (!existedUser) return token
			token.role = existedUser.role
			return token
		},
		async session({ session, token, user }) {
			console.log('TOKEN_IN_SESSION', token)
			if (session.user && token.sub) session.user.id = token.sub

			if (token.role && session.user) session.user.role = token.role as UserRole
			return session
		},
	},
	adapter: PrismaAdapter(db),
	session: {
		strategy: 'jwt',
	},
	...authConfig,
})
