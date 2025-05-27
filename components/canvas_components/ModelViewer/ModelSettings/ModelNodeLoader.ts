'use server'

import { NodeIO } from '@gltf-transform/core'
import { ALL_EXTENSIONS } from '@gltf-transform/extensions'
import { metalRough } from '@gltf-transform/functions'
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer'

export async function loadModelOnServer(url: string) {
	// Configure I/O.
	const io = new NodeIO({ credentials: 'include' })
		.registerExtensions(ALL_EXTENSIONS)
		.registerDependencies({
			'meshopt.decoder': MeshoptDecoder,
			'meshopt.encoder': MeshoptEncoder,
		})

	// Read from URL.
	const document = await io.read(
		'/public/animated-t-rex-dinosaur-biting-attack-loop/source/Rampaging T-Rex.glb'
	)
	await document.transform(metalRough())

	// Write to byte array (Uint8Array).
	return await io.writeBinary(document)
}
