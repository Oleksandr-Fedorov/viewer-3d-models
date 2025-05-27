import React from 'react'
import { useControls, useCreateStore } from 'leva'
import { SpotLightShadow, SpotLight } from '@react-three/drei'
import { distance } from 'three/tsl'

const SpotLightning = () => {
	const result = {
		distance: { value: 0.4, min: 0, max: 2, step: 0.1 },
		alphaTest: { value: 0.4, min: 0, max: 2, step: 0.1 },
		scale: { value: 1, min: 0, max: 2, step: 0.1 },
		width: { value: 512, min: 0, max: 1024, step: 128 },
		height: { value: 512, min: 0, max: 1024, step: 128 },
		map: { value: null, type: 'texture' },
	}

	return (
		<SpotLight>
			<SpotLightShadow
				distance={0.4} // Distance between the shadow caster and light
				alphaTest={0.5} // Sets the alpha value to be used when running an alpha test. See Material.alphaTest
				scale={1} //  Scale of the shadow caster plane
				map={undefined} // Texture - Pattern of the shadow
				shader={undefined} // Optional shader to run. Lets you add effects to the shadow map. See bellow
				width={512} // Width of the shadow map. The higher the more expnsive
				height={512}
			/>
		</SpotLight>
	)
}

export default SpotLightning
