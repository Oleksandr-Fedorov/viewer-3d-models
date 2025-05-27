import GitHub from 'next-auth/providers/github'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import type { NextAuthConfig } from 'next-auth'
import bcrypt from 'bcryptjs'
import { getDB_User_ByEmail } from './data/user'
import { authValidationSchema } from './schemas'

export default {
	providers: [
		GitHub({
			clientId: process.env.GITHUB_AUTH_ID,
			clientSecret: process.env.GITHUB_AUTH_SECRET,
		}),
		Google({
			clientId: process.env.GOOGLE_AUTH_ID,
			clientSecret: process.env.GOOGLE_AUTH_SECRET,
		}),
		Credentials({
			async authorize(credentials) {
				const validatedFields = authValidationSchema.safeParse(credentials)
				if (validatedFields.success) {
					const { email, password } = validatedFields.data

					const user = await getDB_User_ByEmail(email)

					if (!user || !user.password) return null

					const isPasswordCorrect = await bcrypt.compare(
						password,
						user.password
					)

					if (isPasswordCorrect) return user
				}

				return null
			},
		}),
	],
} satisfies NextAuthConfig
