'use server'
import * as zObject from 'zod'
import { authValidationSchema } from '@/schemas'
import { signIn } from '@/auth'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { AuthError } from 'next-auth'
import { revalidatePath } from 'next/cache'

export const login = async (
	fields: zObject.infer<typeof authValidationSchema>
) => {
	//возвращаем обьект с полями {success: true, data:...} || {success: false ,error:...}
	const receivedFields = authValidationSchema.safeParse(fields)

	if (!receivedFields.success) return { error: 'Fields are not valid' }

	const { password, email } = receivedFields.data

	try {
		await signIn('credentials', {
			email,
			password,
			redirect: false,
		})
		return { success: 'Fields are valid' }
	} catch (error) {
		if (error instanceof AuthError) {
			switch (error.type) {
				case 'CredentialsSignin':
					return { error: 'Incorrect email or password' }
				default:
					return { error: 'Something went wrong' }
			}
		}
		throw error
	}
}
