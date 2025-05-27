import { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { LoaderUtils, Cache, Mesh } from 'three'
import {
	GLTFLoader,
	GLTFParser,
} from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader, TGALoader } from 'three/examples/jsm/Addons.js'
import { DRACOLoader } from 'three/examples/jsm/Addons.js'
import { KTX2Loader } from 'three/examples/jsm/Addons.js'
import { LoadingManager, REVISION } from 'three'
import { useLoader, useThree } from '@react-three/fiber'
import { useMyContext } from '../../MyContext'
import { WebIO } from '@gltf-transform/core'
import {
	ALL_EXTENSIONS,
	EXTMeshoptCompression,
	KHRONOS_EXTENSIONS,
} from '@gltf-transform/extensions'
import { metalRough } from '@gltf-transform/functions'
import {
	MeshoptDecoder,
	MeshoptEncoder,
	MeshoptSimplifier,
} from 'meshoptimizer'
import draco3d from 'draco3dgltf'
//Function of creating a modal window for model with KTX2 texture error(just UI with 2 buttons OK-true and Cancel-false)
import createDialog from './ModalDialog'

interface LoaderProps {
	url: string
	rootPath: string
	assetMap: Map<string, File>
	fileType: string
	rootFile: File | string
	modelLoader: any
}

const useModelLoader = ({
	url,
	rootPath,
	assetMap,
	fileType,
	rootFile,
	modelLoader,
}: LoaderProps): any => {
	const { gl, scene } = useThree()
	// Function for traverse materials(like in viewer.js file (DonMcCurdy))
	const traverseMaterials = useCallback(
		(object: any, callback: (mat: any) => void) => {
			object.traverse((node: any) => {
				if (!node.geometry) return
				const materials = Array.isArray(node.material)
					? node.material
					: [node.material]
				materials.forEach(callback)
			})
		},
		[]
	)

	const cleanup = useCallback(
		(model: any) => {
			if (!model) return

			scene.remove(model)

			model.traverse((node: any) => {
				if (node.geometry) {
					node.geometry.dispose()
				}
			})

			if (model.animations) {
				model.animations.forEach((animation: any) => {
					if (animation.clip) {
						animation.clip.dispose()
					}
				})
			}

			traverseMaterials(model, (material: any) => {
				if (material.dispose) {
					material.dispose()
				}
				for (const key in material) {
					if (
						key !== 'envMap' &&
						material[key] &&
						material[key].isTexture &&
						material[key].dispose
					) {
						material[key].dispose()
					}
				}
			})
		},
		[scene, traverseMaterials]
	)

	const { setIsViewerVisible } = useMyContext() as any
	const [content, setContent] = useState<any>({
		scene: null,
		clips: null,
	})
	const [errorOccurred, setErrorOccurred] = useState(false)

	const MANAGER = useMemo(() => new LoadingManager(), [])

	const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`

	const DRACO_LOADER = useMemo(
		() =>
			new DRACOLoader(MANAGER).setDecoderPath(
				`${THREE_PATH}/examples/jsm/libs/draco/gltf/`
			),
		[MANAGER]
	)

	const KTX2_LOADER = useMemo(
		() =>
			new KTX2Loader(MANAGER).setTranscoderPath(
				`${THREE_PATH}/examples/jsm/libs/basis/`
			),
		[MANAGER]
	)

	// Function for load model with KTX2 texture
	const loadModel = useCallback(
		async (url: string, loader: any, blobURLs: string[]) => {
			try {
				const io = new WebIO({ credentials: 'include' })
					.registerExtensions(ALL_EXTENSIONS)
					.registerDependencies({
						'meshopt.decoder': MeshoptDecoder,
						'meshopt.encoder': MeshoptEncoder,
					})

				console.log('Initializing WebIO:', io)

				const gltf_trans = await io.read(url)

				// Show dialog and wait for user's decision(Ti load custom KTX2 textures or not)
				const continueLoading = await createDialog()

				if (!continueLoading) {
					setIsViewerVisible(false)
					blobURLs.forEach((url: any) => URL.revokeObjectURL(url))
					return null // Return null to indicate that loading was canceled
				}

				// like in example=============================

				await gltf_trans.transform(metalRough())
				for (const material of gltf_trans.getRoot().listMaterials()) {
					if (material.getAlpha() === 0.0) {
						material.setAlphaMode('OPAQUE').setAlpha(1.0)
					}
				}

				const glb: any = await io.writeBinary(gltf_trans)

				if (loader) {
					return new Promise((resolve, reject) => {
						loader.parse(
							glb.buffer,
							'',
							(gltf: any) => {
								modelLoader(gltf)
								resolve({
									scene: gltf.scene,
									clips: gltf.animations || [],
								})
							},
							(error: any) => {
								reject(error)
							}
						)
					})
				}
				//==============================================
			} catch (error) {
				console.log('Ошибка загрузки модели:', error)
				setErrorOccurred(true)
			}
		},
		[setIsViewerVisible]
	)

	// Function for load model with fallback loader(like in viewer.js file (DonMcCurdy))
	const loadWithFallbackLoader = useCallback(
		async (url: string, otherLoader: any, fileType: string) => {
			return new Promise((resolve, reject) => {
				otherLoader.load(
					url,
					(object: any) => {
						modelLoader(object)
						console.log('Loaded model with fallback loader:', object)
						let loadedScene = null
						let clips = null

						if (fileType === 'gltf/glb') {
							loadedScene = object.scene || object.scenes[0]
							clips = object.animations || []
						} else if (fileType === 'fbx') {
							loadedScene = object
							clips = object.animations || []
						}

						if (!loadedScene) {
							reject(new Error('No scene found in the model'))
							return
						}

						resolve({ scene: loadedScene, clips })
					},
					undefined,
					(error: any) => {
						console.error('Error loading model with fallback:', error)
						reject(error)
					}
				)
			})
		},
		[]
	)
	const isLoadingStarted = useRef(false)
	useEffect(() => {
		if (!url) return

		const blobURLs: string[] = []

		MANAGER.setURLModifier((someUrl: string) => {
			const baseURL = LoaderUtils.extractUrlBase(url)
			const normalizedURL =
				rootPath +
				decodeURI(someUrl)
					.replace(baseURL, '')
					.replace(/^(\.?\/)/, '')

			if (assetMap.has(normalizedURL)) {
				const blob = assetMap.get(normalizedURL)
				const blobURL = URL.createObjectURL(blob!)
				blobURLs.push(blobURL)
				return blobURL
			}
			return someUrl
		})

		let loader: GLTFLoader | FBXLoader | null = null
		let otherLoader: GLTFLoader | FBXLoader | null = null

		if (fileType === 'gltf/glb') {
			loader = new GLTFLoader(MANAGER).setMeshoptDecoder(MeshoptDecoder)
			otherLoader = new GLTFLoader(MANAGER)
				.setCrossOrigin('anonymous')
				.setDRACOLoader(DRACO_LOADER)
				.setKTX2Loader(KTX2_LOADER.detectSupport(gl))
				.setMeshoptDecoder(MeshoptDecoder)

			MANAGER.onLoad = () => {
				console.log('All textures loaded successfully')
			}

			MANAGER.onError = url => {
				console.error('Error loading texture:', url)
			}
		} else if (fileType === 'fbx') {
			otherLoader = new FBXLoader(MANAGER).setCrossOrigin('anonymous')
		}

		const loadModelAsync = async () => {
			try {
				//First try to load model with KTX2 textures
				const result = await loadModel(url, loader, blobURLs)
				if (result) {
					setContent(result)
				} else {
					try {
						const fallbackResult = await loadWithFallbackLoader(
							url,
							otherLoader,
							fileType
						)
						setContent(fallbackResult)
					} catch (fallbackError) {
						console.error('All loaders failed:', fallbackError)
					}
				}
			} catch (error) {
				console.error('Primary loader failed, trying fallback:', error)
			} finally {
				// Clean up resources
				blobURLs.forEach(url => URL.revokeObjectURL(url))
			}
		}

		loadModelAsync().finally(() => {
			isLoadingStarted.current = false
		})

		return () => {
			// Clean up resources(once again XD for sure)
			blobURLs.forEach(url => URL.revokeObjectURL(url))
			DRACO_LOADER.dispose()
			KTX2_LOADER.dispose()
			useLoader.clear(GLTFLoader, url)
			if (content.scene) cleanup(content.scene)
			Cache.clear()
		}
	}, [url])

	useEffect(() => {
		if (content.scene) {
			console.log('content.scene', content.scene)
			content.scene.traverse((node: any) => {
				if (node instanceof Mesh) {
					node.userData = {
						...node.userData,
						OriginalMaterial: node.material,
					}
				}
			})
		}
		console.log('content after', content)
	}, [content])
	return content
}

export default useModelLoader
