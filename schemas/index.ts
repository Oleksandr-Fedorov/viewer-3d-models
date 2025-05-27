import * as zObject from 'zod'

export const authValidationSchema = zObject.object({
	email: zObject.string().email({ message: 'Invalid email' }),
	password: zObject.string().min(1, { message: 'Password is required' }),
})
export const registerValidationSchema = zObject.object({
	email: zObject.string().email({ message: 'Invalid email' }),
	password: zObject.string().min(6, { message: 'Minimum length is 6' }),
	name: zObject.string().min(1, { message: 'Name is required' }),
})
