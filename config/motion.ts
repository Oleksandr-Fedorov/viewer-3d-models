/**
 * Transition definition for frame-motion library
 *
 * Describes the animation transition behavior for all components.
 * The default transition is a spring animation with the following properties:
 * - duration: 0.8 seconds
 * - stiffness: 200
 * - damping: 20
 * - mass: 0.2
 *
 * The transition can be overridden by passing a custom transition object to the
 * frame-motion component.
 */
export const transition = {
	type: 'spring',
	duration: 0.8,
	stiffness: 200,
	damping: 20,
	mass: 0.2,
}

/**
 * Slide animation definition for frame-motion library
 *
 * Describes the animation behavior for components that slide in and out of the view.
 * The animation is a spring animation with the following properties:
 * - initial: { x: 100, opacity: 0 }
 * - animate: { x: 0, opacity: 1 }
 * - exit: { x: -100, opacity: 0 }
 * - transition: { type: 'spring', damping: 5, stiffness: 40, restDelta: 0.001, duration: 0.3 }
 *
 * The animation can be overridden by passing a custom animation object to the
 * frame-motion component.
 */
export const slideAnimation = ({
	direction,
}: {
	direction: 'left' | 'right' | 'up' | 'down'
}) => {
	return {
		initial: {
			x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
			y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0,
			opacity: 0,
			transition: { ...transition, delay: 0.5 },
		},
		animate: {
			x: 0,
			y: 0,
			opacity: 1,
			transition: { ...transition, delay: 0 },
		},
		exit: {
			x: direction === 'left' ? -100 : direction === 'right' ? 100 : 0,
			y: direction === 'up' ? 100 : direction === 'down' ? -100 : 0,
			opacity: 0,
			transition: { ...transition, delay: 0 },
		},
	}
}

/**
 * Frame animation definition for frame-motion library
 *
 * Describes the animation behavior for components that fade in and out of the view.
 * The animation is a spring animation with the following properties:
 * - initial: { opacity: 0 }
 * - animate: { opacity: 1 }
 * - exit: { opacity: 0 }
 * - transition: { type: 'spring', damping: 5, stiffness: 40, restDelta: 0.001, duration: 0.3 }
 *
 * The animation can be overridden by passing a custom animation object to the
 * frame-motion component.
 */
export const frameAnimation = {
	initial: { opacity: 0, transition: { ...transition, delay: 0.5 } },
	animate: {
		opacity: 1,
		transition: {
			...transition,
			delay: 0,
		},
		exit: { opacity: 0, transition: { ...transition, delay: 0 } },
	},
}

/**
 * Head text animation definition for frame-motion library
 *
 * Describes the animation behavior for the head text component.
 * The animation is a spring animation with the following properties:
 * - initial: { x: 100, opacity: 0 }
 * - animate: { x: 0, opacity: 1 }
 * - transition: { type: 'spring', damping: 5, stiffness: 40, restDelta: 0.001, duration: 0.3 }
 *
 * The animation can be overridden by passing a custom animation object to the
 * frame-motion component.
 */
export const headTextAnimation = {
	initial: { x: 100, opacity: 0 },
	animate: { x: 0, opacity: 1 },
	transition: {
		type: 'spring',
		damping: 5,
		stiffness: 40,
		restDelta: 0.001,
		duration: 0.3,
	},
}

/**
 * Head content animation definition for frame-motion library
 *
 * Describes the animation behavior for the head content component.
 * The animation is a spring animation with the following properties:
 * - initial: { y: 100, opacity: 0 }
 * - animate: { y: 0, opacity: 1 }
 * - transition: { type: 'spring', damping: 7, stiffness: 30, restDelta: 0.001, duration: 0.6 }
 * - delay: 0.2
 * - delayChildren: 0.2
 *
 * The animation can be overridden by passing a custom animation object to the
 * frame-motion component.
 */
export const headContentAnimation = {
	initial: { y: 100, opacity: 0 },
	animate: { y: 0, opacity: 1 },
	transition: {
		type: 'spring',
		damping: 7,
		stiffness: 30,
		restDelta: 0.001,
		duration: 0.6,
		delay: 0.2,
		delayChildren: 0.2,
	},
}

/**
 * Head container animation definition for frame-motion library
 *
 * Describes the animation behavior for the head container component.
 * The animation is a spring animation with the following properties:
 * - initial: { x: -100, opacity: 0 }
 * - animate: { x: 0, opacity: 1 }
 * - exit: { x: -100, opacity: 0 }
 * - transition: { type: 'spring', damping: 5, stiffness: 40, restDelta: 0.001, duration: 0.3 }
 * - delay: 0.5
 * - delayChildren: 0.5
 *
 * The animation can be overridden by passing a custom animation object to the
 * frame-motion component.
 */
export const headContainerAnimation = {
	initial: { x: -100, opacity: 0, transition: { ...transition, delay: 0.5 } },
	animate: { x: 0, opacity: 1, transition: { ...transition, delay: 0 } },
	exit: { x: -100, opacity: 0, transition: { ...transition, delay: 0 } },
}
