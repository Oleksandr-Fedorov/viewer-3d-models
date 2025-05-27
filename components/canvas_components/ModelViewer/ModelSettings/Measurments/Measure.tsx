import React from 'react'
import * as THREE from 'three'
import { IsEqualEps, BigEps } from './Math_Equations'
export const IntersectionMode = {
	MeshOnly: 1,
	MeshAndLine: 2,
}

function CreateLineFromPoints(points: any, material: any) {
	let geometry = new THREE.BufferGeometry().setFromPoints(points)
	return new THREE.Line(geometry, material)
}

function GetFaceWorldNormal(intersection: any) {
	let normalMatrix = new THREE.Matrix4()
	intersection.object.updateWorldMatrix(true, false)
	normalMatrix.extractRotation(intersection.object.matrixWorld)
	let faceNormal = intersection.face.normal.clone()
	faceNormal.applyMatrix4(normalMatrix)
	return faceNormal
}
function CreateMaterial() {
	return new THREE.LineBasicMaterial({
		color: 0x263238,
		depthTest: false,
	})
}

class Marker {
	intersection: any
	markerObject: THREE.Object3D
	constructor({ intersection, radius }: any) {
		this.intersection = null
		this.markerObject = new THREE.Object3D()

		let material = CreateMaterial()
		let circleCurve = new THREE.EllipseCurve(
			0.0,
			0.0,
			radius,
			radius,
			0.0,
			2.0 * Math.PI,
			false,
			0.0
		)
		this.markerObject.add(
			CreateLineFromPoints(circleCurve.getPoints(50), material)
		)
		this.markerObject.add(
			CreateLineFromPoints(
				[
					new THREE.Vector3(-radius, 0.0, 0.0),
					new THREE.Vector3(radius, 0.0, 0.0),
				],
				material
			)
		)
		this.markerObject.add(
			CreateLineFromPoints(
				[
					new THREE.Vector3(0.0, -radius, 0.0),
					new THREE.Vector3(0.0, radius, 0.0),
				],
				material
			)
		)

		this.UpdatePosition(intersection)
	}

	UpdatePosition(intersection: any) {
		this.intersection = intersection
		let faceNormal = GetFaceWorldNormal(this.intersection)
		this.markerObject.updateMatrixWorld(true)
		this.markerObject.position.set(0.0, 0.0, 0.0)
		this.markerObject.lookAt(faceNormal)
		this.markerObject.position.set(
			this.intersection.point.x,
			this.intersection.point.y,
			this.intersection.point.z
		)
	}

	Show(show: boolean) {
		this.markerObject.visible = show
	}

	GetIntersection() {
		return this.intersection
	}

	GetObject() {
		return this.markerObject
	}
}

function CalculateMarkerValues(aMarker: Marker, bMarker: Marker) {
	const aIntersection = aMarker.GetIntersection()
	const bIntersection = bMarker.GetIntersection()
	let result = {
		pointsDistance: null as number | null,
		parallelFacesDistance: null as number | null,
		facesAngle: null as number | null,
	}

	const aNormal = GetFaceWorldNormal(aIntersection)
	const bNormal = GetFaceWorldNormal(bIntersection)
	result.pointsDistance = aIntersection.point.distanceTo(bIntersection.point)
	result.facesAngle = aNormal.angleTo(bNormal)
	if (
		IsEqualEps(result.facesAngle, 0.0, BigEps) ||
		IsEqualEps(result.facesAngle, Math.PI, BigEps)
	) {
		let aPlane = new THREE.Plane().setFromNormalAndCoplanarPoint(
			aNormal,
			aIntersection.point
		)
		result.parallelFacesDistance = Math.abs(
			aPlane.distanceToPoint(bIntersection.point)
		)
	}
	return result
}

const Measure = () => {
	const quentity = [new THREE.Vector2(0, 0), new THREE.Vector2(0, 0)]
	return
}

export default Measure
