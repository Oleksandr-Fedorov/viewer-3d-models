'use client'
import { IAuthSideProps } from '@/types/authPopup'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import * as zObject from 'zod'
import { authValidationSchema } from '@/schemas'
import { Button } from '@/components/ui/button'
import AuthPopupSocials from './AuthPopupSocials'
import { FailValid } from '@/components/elements/form-error'
import { SuccessValidForm } from '@/components/elements/form-success'
import { login } from '@/actions/login'
import { DEFAULT_LOGIN_REDIRECT } from '@/routes'

//Принимает в качестве параметров переключение сторон
//(регистрация или авторизация) а также флаг активной стороны
const AuthPopupLogin = ({ toggleAuth, isSideActive }: IAuthSideProps) => {
	const router = useRouter()
	const searchParam = useSearchParams()
	const urlError =
		searchParam.get('error') === 'OAuthAccountNotLinked'
			? 'Email already exists in other provider'
			: ''

	const [isProcessing, startTransition] = useTransition()
	const [isSuccess, setIsSuccess] = useState<string | undefined>('')
	const [isFail, setIsFail] = useState<string | undefined>('')
	const form = useForm<zObject.infer<typeof authValidationSchema>>({
		resolver: zodResolver(authValidationSchema),
		defaultValues: {
			email: '',
			password: '',
		},
	})

	const onSubmit = (values: zObject.infer<typeof authValidationSchema>) => {
		setIsFail('')
		setIsSuccess('')
		startTransition(() => {
			router.push(DEFAULT_LOGIN_REDIRECT)
			login(values)
				.then(result => {
					if (!result) return
					if (result.error) {
						form.reset()
						setIsFail(result.error)
					}
					if (result.success) {
						setIsSuccess('Login successful')
						setTimeout(
							() => (window.location.href = DEFAULT_LOGIN_REDIRECT),
							300
						)
					}
				})
				.catch(error => {
					setIsFail('An error occurred during login')
				})
		})
	}

	return (
		<div className='card-body wow-bg'>
			<h3 className='card-body__title'>Login</h3>
			<p className='card-body__description'>
				Please fill in the form to create an account
			</p>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)}>
					<div className='space-y-3'>
						<FormField
							control={form.control}
							name='email'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email</FormLabel>
									<FormControl>
										<Input
											{...field}
											disabled={isProcessing}
											placeholder='olexandr.fedorov@gmail.com'
											type='email'
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<div className='pt-3'>
						<FormField
							control={form.control}
							name='password'
							render={({ field }) => (
								<FormItem>
									<FormLabel>Password</FormLabel>
									<FormControl>
										<Input
											{...field}
											disabled={isProcessing}
											placeholder='*********'
											type='password'
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<FailValid message={isFail || urlError} />
					<SuccessValidForm message={isSuccess} />
					<div className='card-body__inner'>
						<div className='inner__top'>
							<Button
								className='inner__btn'
								type='submit'
								disabled={isProcessing}
							>
								Enter
							</Button>
						</div>
					</div>
				</form>
			</Form>
			<div className='inner__bottom'>
				<span className='inner__bottom__text'>Don't have an account? </span>
				<button
					type='button'
					className='btn-reset inner__switch'
					onClick={() => toggleAuth()}
				>
					Register
				</button>
			</div>
			<AuthPopupSocials />
		</div>
	)
}

export default AuthPopupLogin
