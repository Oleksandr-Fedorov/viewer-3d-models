//Типизация для регистрации и авторизации

import { FieldErrors, FieldErrorsImpl, UseFormRegister } from 'react-hook-form'

//Типизация для входа
export interface IInputs {
	name: string
	email: string
	password: string
}

//Типизация для регистрации
export interface ISignUpFx {
	password: string
	email: string
	//Для сторонней регистрации(с других соц.сетей)
	isOAuth?: boolean
	name?: string
}

export interface IAuthSideProps {
	toggleAuth: VoidFunction
	isSideActive: boolean
}

export interface IAuthInput {
	register: UseFormRegister<IInputs>
	errors: Partial<FieldErrorsImpl<IInputs>>
}

export interface INameErrorMsgProps {
	errors: FieldErrors<IInputs & { [index: string]: string }>
	//Для передачи названия поля для интупа
	fieldName: string
	//Не только на форме регистрации будут выводиться ошибки,поэтому для
	//лучшего позиционирования используем класс
	className?: string
}
