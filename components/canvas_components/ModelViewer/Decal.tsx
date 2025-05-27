// import { useTexture } from '@react-three/drei'
// import { useFrame, useThree } from '@react-three/fiber'
// import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
// import * as THREE from 'three'

// function isMesh(
// 	child: THREE.Object3D
// ): child is THREE.Mesh<THREE.BufferGeometry, THREE.Material> {
// 	return (child as THREE.Mesh).isMesh
// }

// export function Decal3() {
// 	const map = useTexture('/uv.png')
// 	const scene = useThree(state => state.scene)

// 	const uDecalMatrix = useMemo(() => ({ value: new THREE.Matrix4() }), [])
// 	const uDecalMap = useMemo(() => ({ value: null! as THREE.Texture }), [])

// 	const [originalShaderLib] = useState({
// 		uv_pars_vertex: THREE.ShaderChunk.uv_pars_vertex,
// 		worldpos_vertex: THREE.ShaderChunk.worldpos_vertex,
// 		color_pars_fragment: THREE.ShaderChunk.color_pars_fragment,
// 		color_fragment: THREE.ShaderChunk.color_fragment,
// 		opaque_fragment: THREE.ShaderChunk.opaque_fragment,
// 	})

// 	useLayoutEffect(() => {
// 		scene.traverse(child => {
// 			if (isMesh(child)) {
// 				child.material.onBeforeCompile = shader => {
// 					shader.uniforms.uDecalMatrix = uDecalMatrix
// 					shader.uniforms.uDecalMap = uDecalMap
// 				}
// 			}
// 		})

// 		// Vertex shader

// 		THREE.ShaderChunk.uv_pars_vertex = /* glsl */ `
//     ${originalShaderLib.uv_pars_vertex}
//       uniform mat4 uDecalMatrix;
//       uniform float uDecalNormalBias;
//       varying vec4 vDecalCoord;
//       varying vec3 vSurfaceNormal;
//     `

// 		THREE.ShaderChunk.worldpos_vertex = /* glsl */ `
//     ${originalShaderLib.worldpos_vertex}
// 		  vDecalCoord = uDecalMatrix * worldPosition;
//       vSurfaceNormal = normal;
//     `

// 		// Fragment shader

// 		THREE.ShaderChunk.color_pars_fragment = /* glsl */ `
//     ${originalShaderLib.color_pars_fragment}
//     uniform sampler2D uDecalMap;
//     varying vec4 vDecalCoord;
//     varying vec3 Tri;
//     `

// 		THREE.ShaderChunk.color_fragment = /* glsl */ `
//     ${originalShaderLib.color_fragment}
// 		// vec3 decalCoord = vDecalCoord.xyz / vDecalCoord.w;
// 		vec3 decalCoord = vDecalCoord.xyz;
//     vec3 meshMin = vec3(-1.0);
//     vec3 meshMax = vec3(1.0);
//     float decalAlpha = 1.0;

//     // Clip decal if it's outside the mesh
//     if (any(lessThan(decalCoord, meshMin)) || any(greaterThan(decalCoord, meshMax))) {
//       decalAlpha = 0.0;
//     }

//     vec3 normalizedCoord = (decalCoord - meshMin) / (meshMax - meshMin);
//     vec3 decalColor = texture2D(uDecalMap, normalizedCoord.xz).rgb;

//     `

// 		THREE.ShaderChunk.opaque_fragment = /* glsl */ `
// 		${originalShaderLib.opaque_fragment}
// 		gl_FragColor.rgb = mix(gl_FragColor.rgb, decalColor, decalAlpha);
// 		`
// 	}, [])

// 	const meshRef = useRef<THREE.Mesh>(null!)

// 	useFrame(() => {
// 		// shadow.updateMatrices(meshRef.current);
// 		uDecalMatrix.value.copy(meshRef.current.matrixWorld).invert()
// 	})

// 	useEffect(() => {
// 		uDecalMap.value = map
// 	}, [map])

// 	return (
// 		<group>
// 			<mesh ref={meshRef}>
// 				<boxGeometry args={[2, 2, 2]} />
// 				<meshBasicMaterial wireframe />
// 				<arrowHelper
// 					args={[new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0.5, 0)]}
// 				/>
// 			</mesh>
// 		</group>
// 	)
// }
