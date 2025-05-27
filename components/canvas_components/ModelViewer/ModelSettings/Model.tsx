import React, {
	useEffect,
	useRef,
	useLayoutEffect,
	useState,
	useMemo,
} from 'react'
import { useMyContext } from '../../MyContext'
import useModelLoader from './ModelLoader'
import {
	Box3,
	DoubleSide,
	FrontSide,
	BackSide,
	SkeletonHelper,
	Vector3,
	Object3D,
	AnimationClip,
	Mesh,
	AnimationAction,
	AnimationMixer,
	MeshNormalMaterial,
	Vector2,
	MeshDepthMaterial,
	RGBADepthPacking,
} from 'three'
import { useThree, useFrame } from '@react-three/fiber'
import { Center, useHelper } from '@react-three/drei'
import { useControls, button, folder } from 'leva'
import {
	ShaderBaker,
	getTextureAsDataUrl,
	downloadTexture,
} from 'three-shader-baker'

import JSZip, { forEach } from 'jszip'
import { VertexNormalsHelper } from 'three/examples/jsm/Addons.js'

interface ViewerProps {
	url: string
	rootPath: string
	fileMap: Map<string, File>
	options?: {
		kiosk?: boolean
		preset?: string
		cameraPosition?: number[] | null
	}
	rootFile: File | string
	fileType: string
}

interface TextureData {
	name: string
	dataUrl: string
}

const Model = React.memo(({ settings, modelStore }: any) => {
	const context = useMyContext()
	if (!context) throw new Error('Context is required')
	const { url, rootPath, fileMap, fileType, rootFile } = context as ViewerProps
	const { scene, camera, controls, gl }: any = useThree()
	const modelRef = useRef<Object3D | null>(null!)
	const innerModelRef = useRef<Object3D>(null!)
	const skeletonRef = useRef<SkeletonHelper | null>(null!)
	const vertexRef = useRef<VertexNormalsHelper[] | null>(null!)
	const actionsRef = useRef<Map<string, AnimationAction>>(new Map())
	const mixerRef = useRef<AnimationMixer>(null)

	const [bakeOptions, setBakeOptions] = useState(false)
	// State for animation control
	const [isPlaying, setIsPlaying] = useState<boolean>(false)
	const [activeClips, setActiveClips] = useState<string[]>([])
	const [n, setN] = useState(0)

	const model = useModelLoader({
		modelLoader: settings.onModelLoaded,
		url,
		rootPath,
		assetMap: fileMap,
		fileType,
		rootFile,
	})

	const clips = model?.clips || []

	useLayoutEffect(() => {
		if (clips.length > 0) {
			setN(clips.length)
		}
	}, [clips.length])

	// Move useControls to the top level
	const [{ dilation, size }] = useControls(
		() => ({
			buttons: folder(
				{
					'Reset Position': button(() => {
						if (modelRef.current) {
							console.log('in reset position')
							modelRef.current.position.set(0, 0, 0)
							modelRef.current.updateMatrixWorld()
							set({ xP: 0, yP: 0, zP: 0 })
							scene.updateMatrixWorld()
						}
					}),
					'Reset Rotation': button(() => {
						if (modelRef.current) {
							modelRef.current.rotation.set(0, 0, 0)
							set({ xR: 0, yR: 0, zR: 0 })
							modelRef.current.updateMatrixWorld()
						}
					}),
					'Reset Scale': button(() => {
						if (modelRef.current) {
							modelRef.current.scale.set(1, 1, 1)
							set({ scale: 1 })
							modelRef.current.updateMatrixWorld()
						}
					}),
					'Reset All': button(() => {
						if (modelRef.current) {
							modelRef.current.scale.set(1, 1, 1)
							modelRef.current.rotation.set(0, 0, 0)
							modelRef.current.position.set(0, 0, 0)
							set({ xP: 0, yP: 0, zP: 0, xR: 0, yR: 0, zR: 0, scale: 1 })
							modelRef.current.updateMatrixWorld()
						}
					}),
					'Download Texture': folder({
						dilation: { value: 2, min: 1, max: 10, step: 1 },
						size: { value: 1024, min: 128, max: 4096, step: 128 },
						'Bake & Export All': button(() => {
							if (modelRef.current) {
								setBakeOptions(true)
							}
						}),
					}),
				},
				{ collapsed: true }
			),
		}),
		{ store: modelStore }
	)

	//Leva
	const [
		{
			xP,
			yP,
			zP,
			xR,
			yR,
			zR,
			scale,
			skeleton,
			vertexHelper,
			materialChannels,
			side,
		},
		set,
	] = useControls(
		() => ({
			transform: folder(
				{
					position: folder(
						{
							xP: {
								value: 0,
								min: -10,
								max: 10,
								step: 0.1,
							},
							yP: {
								value: 0,
								min: -10,
								max: 10,
								step: 0.1,
							},
							zP: {
								value: 0,
								min: -10,
								max: 10,
								step: 0.1,
							},
						},
						{ collapsed: true }
					),
					rotation: folder(
						{
							xR: {
								value: 0,
								min: -Math.PI,
								max: Math.PI,
								step: 0.1,
							},
							yR: {
								value: 0,
								min: -Math.PI,
								max: Math.PI,
								step: 0.1,
							},
							zR: {
								value: 0,
								min: -Math.PI,
								max: Math.PI,
								step: 0.1,
							},
						},
						{ collapsed: true }
					),
					scale: {
						value: 1,
						min: 0.1,
						max: 10,
						step: 0.5,
					},
				},
				{ collapsed: true }
			),
			material: folder(
				{
					materialChannels: {
						options: ['Normal', 'Original', 'Depth'],
						value: 'Original',
					},
					side: {
						options: ['Front', 'Back', 'Double'],
						value: 'Front',
					},
					skeleton: false,
					vertexHelper: false,
					wireframe: {
						value: false,
						onChange: (value: boolean) => {
							if (innerModelRef.current) {
								innerModelRef.current.traverse((node: any) => {
									if (node.material) {
										node.material.wireframe = value
									}
								})
							}
						},
					},
				},
				{ collapsed: true }
			),
		}),
		{ store: modelStore }
	)
	console.log(model.clips)

	const inputs: any = {}

	if (clips.length > 0 && n > 0) {
		for (let i = 0; i < Math.min(n, clips.length); i++) {
			// Safely access clip name with null check
			const clipName = clips[i]?.name
			if (clipName) {
				inputs[clipName] = {
					value: false,
					onChange: (val: boolean) => {
						if (mixerRef.current) {
							const action = actionsRef.current.get(clipName)
							if (action) {
								if (val) {
									setIsPlaying(true)
									action.reset().play()
								} else {
									action.stop()
								}
							}
						}
					},
					transient: false,
				}
			}
		}
	}

	const [, setSelect] = useControls(
		() => ({
			animation: folder(
				{
					'Play All': button(
						() => {
							if (mixerRef.current) {
								mixerRef.current?.stopAllAction()
								actionsRef.current.forEach((action: any) => {
									action.setEffectiveTimeScale(1)
									action.clampWhenFinished = true
									action.reset().play()
								})
								setSelect({})

								setActiveClips(['all clips'])
								setIsPlaying(true)
							}
						},
						{
							disabled: n === 0,
						}
					),
					'Stop All': button(
						() => {
							if (mixerRef.current) {
								mixerRef.current.stopAllAction()
								setActiveClips([])
								setIsPlaying(false)
								model.clips.forEach((clip: AnimationClip) => {
									const action = actionsRef.current.get(clip.name)
									if (action) {
										action.reset()
									}
								})
							}
						},
						{
							disabled: n === 0,
						}
					),

					playbackSpeed: {
						value: 1.0,
						min: 0,
						max: 2,
						step: 0.1,
						onChange: value => {
							if (mixerRef.current) {
								mixerRef.current.timeScale = value
							}
						},
						render: () => n > 0,
					},
					animation_type: folder({ ...inputs }, { collapsed: true }),
				},
				{ collapsed: true }
			),
		}),
		{ store: modelStore },
		[model, n, clips]
	)

	useFrame((state, delta) => {
		// Сначала обновляем анимацию (это деформирует меши)
		if (mixerRef.current) {
			mixerRef.current.update(delta)
		}

		// Затем обновляем VertexNormalsHelper, чтобы он учел деформации
		if (vertexRef.current && vertexHelper) {
			vertexRef.current.forEach(helper => {
				// Важно: обновляем helper ПОСЛЕ обновления анимации
				helper.update()
			})
		}
	})

	useLayoutEffect(() => {
		if (vertexRef.current) {
			vertexRef.current.forEach((helper: any) => {
				helper.visible = vertexHelper
			})
		}
	}, [vertexHelper])

	useLayoutEffect(() => {
		if (skeletonRef.current) {
			skeletonRef.current.visible = skeleton
		}
	}, [skeleton])

	useLayoutEffect(() => {
		if (!innerModelRef.current) return

		innerModelRef.current.traverse((obj: any) => {
			if (obj instanceof Mesh) {
				// Просто переключаем между заранее подготовленными материалами
				obj.material =
					materialChannels === 'Normal'
						? obj.userData.normalMaterial
						: materialChannels === 'Original'
							? obj.userData.OriginalMaterial
							: obj.userData.DepthMaterial

				if (obj.material) {
					obj.material.needsUpdate = true
				}
			}
		})
	}, [materialChannels])

	useLayoutEffect(() => {
		if (!innerModelRef.current) return
		const side_ =
			side === 'Front' ? FrontSide : side === 'Back' ? BackSide : DoubleSide
		innerModelRef.current.traverse((obj: any) => {
			if (obj instanceof Mesh) {
				// Просто переключаем между заранее подготовленными материалами
				obj.material.side = side_
				if (obj.material) {
					obj.material.needsUpdate = true
				}
			}
		})
	}, [side])

	useLayoutEffect(() => {
		if (model?.scene) {
			console.log('model Loaded')
			const vertexHelpers: VertexNormalsHelper[] = []

			// setupModel(model.scene, model.clips)
			model.scene.traverse((object: any) => {
				if (object instanceof Mesh) {
					object.castShadow = true
					object.receiveShadow = true

					// Кешируем оригинальный материал (если еще не сохранен)
					if (!object.userData.OriginalMaterial) {
						object.userData.OriginalMaterial = object.material
					}

					// Создаем и кешируем normal материал для этого меша
					const normalMat = new MeshNormalMaterial()
					const depthMat = new MeshDepthMaterial()
					depthMat.depthPacking = RGBADepthPacking
					const origMat = object.material

					// Копируем важные карты из оригинального материала
					if (origMat.normalMap) {
						normalMat.normalMap = origMat.normalMap
						normalMat.normalScale =
							origMat.normalScale?.clone() || new Vector2(1, 1)
					}

					if (origMat.bumpMap) {
						normalMat.bumpMap = origMat.bumpMap
						normalMat.bumpScale = origMat.bumpScale || 1
					}

					if (origMat.displacementMap) {
						depthMat.displacementMap = origMat.displacementMap
						depthMat.displacementScale = origMat.displacementScale || 1
						depthMat.displacementBias = origMat.displacementBias || 0
						normalMat.displacementMap = origMat.displacementMap
						normalMat.displacementScale = origMat.displacementScale || 1
						normalMat.displacementBias = origMat.displacementBias || 0
					}

					// Копируем режимы отображения
					normalMat.wireframe = depthMat.wireframe = origMat.wireframe || false
					normalMat.flatShading = origMat.flatShading || false

					if (origMat.wireframeLinewidth) {
						normalMat.wireframeLinewidth = origMat.wireframeLinewidth
						depthMat.wireframeLinewidth = origMat.wireframeLinewidth
					}

					// Если есть alpha test или alpha hash
					if (origMat.alphaTest !== undefined) {
						normalMat.alphaTest = depthMat.alphaTest =
							origMat.alphaTest < 1e-4 ? 1e-4 : origMat.alphaTest
					}
					if (origMat.alphaHash !== undefined) {
						normalMat.alphaHash = depthMat.alphaHash = origMat.alphaHash
					}

					// Сохраняем подготовленный normal материал
					object.userData.normalMaterial = normalMat

					// Сохраняем подготовленный depth материал
					object.userData.DepthMaterial = depthMat

					if (object.geometry) {
						if (!object.geometry.attributes.normal) {
							object.geometry.computeVertexNormals()
						}
						const helper = new VertexNormalsHelper(object, 0.1, 0xffff00)
						helper.visible = false
						scene.add(helper)
						vertexHelpers.push(helper)
					}
				}
			})
			vertexRef.current = vertexHelpers
		}

		if (model.clips && model.clips.length > 0) {
			mixerRef.current = new AnimationMixer(model.scene)

			model.clips.forEach((clip: AnimationClip) => {
				const action = mixerRef.current!.clipAction(clip)
				actionsRef.current.set(clip.name, action)
			})
			setN(model.clips.length)
		}

		console.log('actionRef ', actionsRef.current)

		if (innerModelRef.current) {
			skeletonRef.current = new SkeletonHelper(innerModelRef.current)
			skeletonRef.current.visible = false
			scene.add(skeletonRef.current)
		}

		return () => {
			if (skeletonRef.current) {
				scene.remove(skeletonRef.current)
				skeletonRef.current.dispose()
				skeletonRef.current = null
			}
			if (vertexRef.current) {
				vertexRef.current.forEach((helper: any) => {
					scene.remove(helper)
					helper.geometry.dispose()
					helper.material.dispose()
				})
			}

			if (mixerRef.current) {
				mixerRef.current.stopAllAction()
				mixerRef.current = null
			}

			actionsRef.current.clear()

			if (modelRef.current) {
				modelRef.current.traverse((node: any) => {
					if (node.geometry) {
						node.geometry.dispose()
					}
					if (node.material) {
						if (Array.isArray(node.material)) {
							node.material.forEach((material: any) => material.dispose())
						} else {
							node.material.dispose()
						}
					}
					// Также очищаем кешированные материалы из userData
					if (node.userData.normalMaterial) {
						node.userData.normalMaterial.dispose()
						node.userData.normalMaterial = null
					}
					if (node.userData.originalMaterial) {
						node.userData.originalMaterial = null
					}
				})
			}
		}
	}, [model])

	const createAndDownloadZip = async (textures: TextureData[]) => {
		const zip = new JSZip()

		// Add each texture to the zip
		textures.forEach((texture, index) => {
			// Convert base64 data URL to binary
			const base64Data = texture.dataUrl.split(',')[1]
			zip.file(`texture_${index}_${texture.name}.png`, base64Data, {
				base64: true,
			})
		})

		// Generate zip file
		const zipBlob = await zip.generateAsync({ type: 'blob' })

		// Create download link
		const downloadUrl = URL.createObjectURL(zipBlob)
		const link = document.createElement('a')
		link.href = downloadUrl
		link.download = 'model_textures.zip'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
		URL.revokeObjectURL(downloadUrl)
	}

	useEffect(() => {
		if (!bakeOptions || !innerModelRef.current) return

		const baker = new ShaderBaker()
		const texturePromises: Promise<TextureData>[] = []
		const texturesToProcess: Mesh[] = []

		// Collect all meshes that need texture baking
		innerModelRef.current.traverse((node: any) => {
			if (node instanceof Mesh) {
				texturesToProcess.push(node)
			}
		})

		// Process each mesh
		texturesToProcess.forEach((mesh, index) => {
			const texturePromise = new Promise<TextureData>(resolve => {
				const fbo = baker.bake(gl, mesh, {
					scene: scene,
					size: size,
					dilation: dilation,
				})

				// Convert texture to data URL
				const dataUrl = getTextureAsDataUrl(gl, fbo.texture)
				resolve({
					name: mesh.name || `mesh_${index}`,
					dataUrl: dataUrl,
				})

				// Clean up FBO
				fbo.dispose()
			})

			texturePromises.push(texturePromise)
		})

		// When all textures are processed, create the zip file
		Promise.all(texturePromises)
			.then(textures => {
				createAndDownloadZip(textures)
				setBakeOptions(false)
			})
			.catch(error => {
				console.error('Error processing textures:', error)
				setBakeOptions(false)
			})
	}, [bakeOptions, size, dilation, gl, scene])

	if (!model?.scene) return null

	return (
		<group
			ref={modelRef}
			position={[xP, yP, zP]}
			rotation={[xR, yR, zR]}
			scale={scale}
		>
			<Center top>
				<primitive ref={innerModelRef} object={model.scene} />
			</Center>
		</group>
	)
})

export default Model
