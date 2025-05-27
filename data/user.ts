import { db } from '@/lib/db'

export const getDB_User_ByEmail = async (email: string) => {
	try {
		const user = await db.user.findUnique({
			where: {
				email,
			},
		})

		return user
	} catch (error) {
		return null
	}
}

export const getDB_User_ByID = async (id: string) => {
	try {
		const user = await db.user.findUnique({
			where: {
				id,
			},
		})
		return user
	} catch {
		return null
	}
}
