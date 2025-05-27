'use client'
import { useState } from 'react'
import AuthPopupRegistration from './AuthPopupReg'
import AuthPopupLogin from './AuthPopupLogin'
import { motion } from 'framer-motion'

const AuthPopup = () => {
	const [isStates, setIsStates] = useState({
		isAuthSwitched: false,
		isSignInActive: false,
		isSignUpActive: true,
	})

	const toggleAuth = () => {
		setIsStates({
			...isStates,
			isAuthSwitched: !isStates.isAuthSwitched,
			isSignInActive: !isStates.isSignInActive,
			isSignUpActive: !isStates.isSignUpActive,
		})
	}

	// Настройка анимации
	const animationVariants = {
		hidden: { opacity: 0, y: 50 }, // Начальное состояние
		visible: { opacity: 1, y: 0 }, // Финальное состояние
	}

	return (
		<div className='auth-popup'>
			<motion.div
				className={`auth-popup__card ${isStates.isAuthSwitched ? 'switched' : ''}`}
				variants={animationVariants}
				initial='hidden'
				animate='visible'
				transition={{ duration: 0.8, ease: 'easeOut' }} // Настройка перехода
			>
				<div className='auth-popup__card__inner'>
					<div className='card-front'>
						<AuthPopupRegistration
							toggleAuth={toggleAuth}
							isSideActive={isStates.isSignUpActive}
						/>
					</div>
					<div className='card-back'>
						<AuthPopupLogin
							toggleAuth={toggleAuth}
							isSideActive={isStates.isSignInActive}
						/>
					</div>
				</div>
			</motion.div>
		</div>
	)
}

export default AuthPopup
