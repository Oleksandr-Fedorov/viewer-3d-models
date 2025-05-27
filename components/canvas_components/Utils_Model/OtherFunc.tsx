import { Vector2 } from 'three'
import { IsEqual } from '../ModelViewer/ModelSettings/Measurments/Math_Equations'

export class CameraValidator {
	eyeCenterDistance: number
	forceUpdate: boolean
	constructor() {
		this.eyeCenterDistance = 0.0
		this.forceUpdate = true
	}

	ForceUpdate() {
		this.forceUpdate = true
	}

	ValidatePerspective() {
		if (this.forceUpdate) {
			this.forceUpdate = false
			return false
		}
		return true
	}

	//@ts-ignore
	ValidateOrthographic(eyeCenterDistance) {
		if (
			this.forceUpdate ||
			!IsEqual(this.eyeCenterDistance, eyeCenterDistance)
		) {
			this.eyeCenterDistance = eyeCenterDistance
			this.forceUpdate = false
			return false
		}
		return true
	}
}

//@ts-ignore
export const GetImageAsDataUrl = (
	width,
	height,
	isTransparent,
	gl,
	camera,
	scene
) => {
	const cameraValidator = new CameraValidator()
	const originalSize = GetImageSize(gl)
	let renderWidth = width
	let renderHeight = height
	if (window.devicePixelRatio) {
		renderWidth /= window.devicePixelRatio
		renderHeight /= window.devicePixelRatio
	}
	const clearAlpha = gl.getClearAlpha()

	// Если требуется прозрачность – задаём прозрачный фон рендера
	if (isTransparent) {
		gl.setClearAlpha(0.0)
		// Временно отключаем фон сцены
		var prevBackground = scene.background
		scene.background = null
	}

	ResizeRenderer(renderWidth, renderHeight, cameraValidator, gl, camera, scene)
	camera.updateProjectionMatrix()
	gl.render(scene, camera)
	let url = gl.domElement.toDataURL()

	// Восстанавливаем размеры, clearAlpha и фон
	ResizeRenderer(
		originalSize.width,
		originalSize.height,
		cameraValidator,
		gl,
		camera,
		scene
	)
	gl.setClearAlpha(clearAlpha)
	if (isTransparent) {
		scene.background = prevBackground
	}
	return url
}

//@ts-ignore
const ResizeRenderer = (width, height, cameraValidator, gl, camera, scene) => {
	if (window.devicePixelRatio) {
		gl.setPixelRatio(window.devicePixelRatio)
	}
	gl.setSize(width, height)
	cameraValidator.ForceUpdate()
	camera.updateProjectionMatrix()
	gl.render(scene, camera)
}

const GetImageSize = (gl: any) => {
	let originalSize = new Vector2()
	gl.getSize(originalSize)
	console.log('originalSize ', {
		width: parseInt(originalSize.x.toString(), 10),
		height: parseInt(originalSize.y.toString(), 10),
	})

	return {
		width: parseInt(originalSize.x.toString(), 10),
		height: parseInt(originalSize.y.toString(), 10),
	}
}
