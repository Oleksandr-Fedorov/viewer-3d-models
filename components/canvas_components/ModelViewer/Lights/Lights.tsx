import React from 'react'
import DirectionalLightControls from './DirectionalLight'
import AmbientLightControls from './AmbedientLight'
import SpotLightning from './SpotLight'
const Lights = ({ lightStore }: any) => {
	return (
		<group>
			<DirectionalLightControls lightStore={lightStore} />
			<AmbientLightControls lightStore={lightStore} />
			{/* <SpotLightning /> */}
		</group>
	)
}

export default Lights
