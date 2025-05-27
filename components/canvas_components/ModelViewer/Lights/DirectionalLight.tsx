import React, {
	useRef,
	useEffect,
	useMemo,
	useLayoutEffect,
	useCallback,
} from 'react'
import {
	Color,
	DirectionalLight,
	DirectionalLightHelper,
	CameraHelper,
	Camera,
	PCFShadowMap,
} from 'three'
import { useControls, folder } from 'leva'
import { useThree } from '@react-three/fiber'

function DirectionalLightControls({ lightStore }: any) {
	const { gl, scene } = useThree()
	const directionalLightRef = useRef<DirectionalLight>(null!)
	const cameraHelperRef = useRef<Camera>(null)
	const helperRef = useRef<DirectionalLightHelper>(null!)
	const camHelperRef = useRef<CameraHelper>(null!)

	gl.shadowMap.type = PCFShadowMap
	const updateShadow = useCallback(() => {
		requestAnimationFrame(() => {
			if (
				helperRef.current &&
				camHelperRef.current &&
				directionalLightRef.current
			) {
				helperRef.current.update()
				camHelperRef.current.update()
			}
		})
	}, [])

	const options = useMemo(
		() => ({
			visible: true,
			color: 'white',
			intensity: { value: 0.5, min: 0, max: 1, step: 0.05 },
			position: folder({
				x: { value: -4.2, min: -10, max: 10, step: 0.1 },
				y: { value: 0, min: -10, max: 10, step: 0.1 },
				z: { value: 0.2, min: -10, max: 10, step: 0.1 },
			}),
			scale: { value: 1, min: 0, max: 10, step: 0.1 },
			'Camera Settings': folder({
				size: {
					value: 10,
					min: 0,
					max: 20,
					step: 0.5,
					onChange: (v: number) => {
						if (!directionalLightRef.current) return

						const camera = directionalLightRef.current.shadow.camera
						camera.top = v
						camera.bottom = -v
						camera.left = -v
						camera.right = v
						camera.updateProjectionMatrix()

						updateShadow()
					},
				},
				'near/far': {
					value: [1, 20],
					min: 1,
					max: 100,
					step: 1,
					onChange: (v: number[]) => {
						requestAnimationFrame(() => {
							if (!directionalLightRef.current) return

							const camera = directionalLightRef.current.shadow.camera
							if (camera.near === v[0] && camera.far === v[1]) return
							camera.near = v[0]
							camera.far = v[1]
							camera.updateProjectionMatrix()

							updateShadow()
						})
					},
				},
				radius: {
					value: 6,
					onChange: (v: number) => {
						if (!directionalLightRef.current) return
						directionalLightRef.current.shadow.radius = v
						directionalLightRef.current.shadow.camera.updateProjectionMatrix()
						updateShadow()
					},
				},
				bias: {
					value: -0.0005,
					step: 0.0001,
					pad: 4,
					onChange: (v: number) => {
						if (!directionalLightRef.current) return
						directionalLightRef.current.shadow.bias = v
						directionalLightRef.current.shadow.camera.updateProjectionMatrix()
						updateShadow()
					},
				},
				mapSize: {
					value: 1024,
					min: 256,
					max: 2048,
					step: 128,
					onChange: (v: number) => {
						requestAnimationFrame(() => {
							if (!directionalLightRef.current) return
							directionalLightRef.current.shadow.mapSize.set(v, v)
							directionalLightRef.current.shadow.camera.updateProjectionMatrix()
							updateShadow()
						})
					},
				},
			}),
		}),
		[]
	)

	const props = useControls(
		'Directional Light',
		options,
		{ collapsed: true },
		{ store: lightStore }
	)

	useEffect(() => {
		if (helperRef.current) helperRef.current.visible = props.visible
		if (directionalLightRef.current)
			directionalLightRef.current.visible = props.visible
		if (camHelperRef.current) camHelperRef.current.visible = props.visible
	}, [props.visible])

	const position = useMemo(
		() => ({ x: props.x, y: props.y, z: props.z }),
		[props.x, props.y, props.z]
	)

	useLayoutEffect(() => {
		if (directionalLightRef.current) {
			directionalLightRef.current.position.set(
				position.x,
				position.y,
				position.z
			)
			if (helperRef.current) {
				helperRef.current.update()
			}
		}
	}, [position])

	useLayoutEffect(() => {
		let isSetup = false

		if (directionalLightRef.current && cameraHelperRef.current && !isSetup) {
			helperRef.current = new DirectionalLightHelper(
				directionalLightRef.current,
				3,
				'red'
			)
			scene.add(helperRef.current)

			camHelperRef.current = new CameraHelper(cameraHelperRef.current)
			scene.add(camHelperRef.current)

			if (!directionalLightRef.current) return

			directionalLightRef.current.shadow.camera.lookAt(0, 0, 0)
			directionalLightRef.current.shadow.radius = 6
			directionalLightRef.current.shadow.bias = -0.0005
			directionalLightRef.current.shadow.mapSize.set(1024, 1024)

			directionalLightRef.current.shadow.camera.top = 10
			directionalLightRef.current.shadow.camera.bottom = -10
			directionalLightRef.current.shadow.camera.left = -10
			directionalLightRef.current.shadow.camera.right = 10

			updateShadow()
			isSetup = true
		}

		return () => {
			if (helperRef.current) {
				scene.remove(helperRef.current)
				helperRef.current.dispose()
			}
			if (camHelperRef.current) {
				scene.remove(camHelperRef.current)
				camHelperRef.current.dispose()
			}
		}
	}, [scene])

	return (
		<directionalLight
			ref={directionalLightRef}
			scale={props.scale}
			color={props.color}
			intensity={props.intensity}
			position={[-4.2, 0, 0.2]}
			castShadow
		>
			<orthographicCamera ref={cameraHelperRef} attach='shadow-camera' />
		</directionalLight>
	)
}

export default DirectionalLightControls
