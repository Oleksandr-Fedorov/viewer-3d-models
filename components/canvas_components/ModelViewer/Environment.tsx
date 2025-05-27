import React, { memo, useCallback } from 'react'
import { Environment } from '@react-three/drei'
import { useControls } from 'leva'

const Env = memo(({ envStore }: any) => {
	// Move state to component level to prevent re-renders
	const [isVisible, setIsVisible] = React.useState(true)

	const controls = useControls(
		'Ground',
		{
			'off/on': {
				value: true,
				onChange: useCallback((v: any) => setIsVisible(v), []),
			},
			height: {
				value: 10,
				min: 0,
				max: 100,
				step: 1,
			},
			radius: {
				value: 115,
				min: 0,
				max: 1000,
				step: 1,
			},
			scale: {
				value: 100,
				min: 0,
				max: 1000,
				step: 1,
			},
			preset_: {
				value: 'sunset' as const,
				options: [
					'apartment',
					'city',
					'dawn',
					'forest',
					'lobby',
					'night',
					'park',
					'studio',
					'sunset',
					'warehouse',
				] as const,
			},
			background_: {
				options: [false, true, 'only'] as const,
				value: true,
			},
		},
		{
			collapsed: true,
			store: envStore,
		}
	)

	// Memoize the Environment props
	const environmentProps = React.useMemo(
		() => ({
			preset: controls.preset_,
			background: controls.background_,
			ground: {
				height: controls.height,
				radius: controls.radius,
				scale: controls.scale,
			},
		}),
		[
			controls.preset_,
			controls.background_,
			controls.height,
			controls.radius,
			controls.scale,
		]
	)

	// Only render if visible
	if (!isVisible) return null

	return <Environment {...environmentProps} />
})

// Ensure proper display name for debugging
Env.displayName = 'Environment'

export default Env
