import React from 'react'
import { useControls, useCreateStore } from 'leva'
const AmbedientLight = ({ lightStore }: any) => {
	const { Intensity, ColorType, visibility } = useControls(
		'Ambient Light',
		{
			ColorType: '#191919',
			Intensity: { value: 1, min: 0, max: 10, step: 0.5 },
			visibility: true,
		},
		{ collapsed: true },
		{ store: lightStore }
	)

	return (
		<ambientLight
			visible={visibility}
			intensity={Intensity}
			color={ColorType}
		/>
	)
}

export default AmbedientLight
