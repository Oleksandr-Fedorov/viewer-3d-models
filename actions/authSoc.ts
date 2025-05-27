'use server'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'
import { signIn, signOut } from '@/auth'
import { revalidatePath } from 'next/cache'

export async function signInSoc(provider: string) {
	await signIn(provider, { redirectTo: DEFAULT_LOGIN_REDIRECT })
	revalidatePath(DEFAULT_LOGIN_REDIRECT)
}

export async function signOutSoc() {
	await signOut({ redirect: false })
}
