'use server'
import * as zObject from 'zod'
import { registerValidationSchema } from '@/schemas'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { getDB_User_ByEmail } from '@/data/user'
export const register = async (
	fields: zObject.infer<typeof registerValidationSchema>
) => {
	//возвращаем обьект с полями {success: true, data:...} || {success: false ,error:...}
	const receivedFields = registerValidationSchema.safeParse(fields)

	if (!receivedFields.success) return { error: 'Fields are not valid' }

	const { password, email, name } = receivedFields.data
	const hashedPassword = await bcrypt.hash(password, 10)

	const existedUser = await getDB_User_ByEmail(email)

	if (existedUser) return { error: 'User already exists' }

	await db.user.create({
		data: {
			name,
			email,
			password: hashedPassword,
		},
	})

	return { success: 'Fields are valid' }
}
