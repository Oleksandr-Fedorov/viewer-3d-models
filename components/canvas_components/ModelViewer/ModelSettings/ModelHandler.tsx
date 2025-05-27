import Model from './Model'
import { useControls, folder, button } from 'leva'
import { useThree } from '@react-three/fiber'
import { TransformControls } from '@react-three/drei'
import React, { useRef, useEffect, useState } from 'react'

const ModelHandler = ({ onModelLoaded, transformStore, modelStore }: any) => {
	const myObj = useRef<any>(null!)
	const transformRef = useRef<any>(null!)

	// Контролы Leva для TransformControls
	const [{ enabled }] = useControls(
		() => ({
			mode: {
				options: ['translate', 'rotate', 'scale'],
				value: 'translate',
				onChange: v => {
					if (transformRef.current) {
						transformRef.current.mode = v
					}
				},
			},
			space: {
				options: ['world', 'local'],
				value: 'local',
				onChange: v => {
					if (transformRef.current) {
						transformRef.current.space = v
					}
				},
			},
			enabled: true,
			snap: { value: false },
		}),
		{ store: transformStore }
	)

	return (
		<TransformControls ref={transformRef} enabled={enabled} object={myObj}>
			<group ref={myObj}>
				<Model
					settings={{ transformStore, onModelLoaded }}
					modelStore={modelStore}
				/>
			</group>
		</TransformControls>
	)
}

export default ModelHandler
