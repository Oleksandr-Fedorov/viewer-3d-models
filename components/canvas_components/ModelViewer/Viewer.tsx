//viwer.js dsfsddf
'use client'

import { Color } from 'three'
import StatsPanel from './ModelSettings/StatsPanel'
import {
	AccumulativeShadows,
	GizmoHelper,
	GizmoViewport,
	RandomizedLight,
} from '@react-three/drei'
import Lights from './Lights/Lights'
import ModelHandler from './ModelSettings/ModelHandler'
//import Stats from 'three/examples/jsm/libs/stats.module.js'
import { OrbitControls } from '@react-three/drei'

import React, {
	useEffect,
	useRef,
	useState,
	Suspense,
	useCallback,
} from 'react'
import { useMyContext } from '../MyContext'
import Env from './Environment'
import { memo } from 'react'
import { useControls, LevaPanel, useCreateStore, folder, button } from 'leva'
import { Canvas, useThree } from '@react-three/fiber'
import Snapshot from '../Utils_Model/Snapshot'

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

const Shadows = memo(() => (
	<AccumulativeShadows
		temporal
		frames={100}
		color='#9d4b4b'
		colorBlend={0.5}
		alphaTest={0.9}
		scale={20}
	>
		<RandomizedLight amount={8} radius={4} position={[5, 5, -10]} />
	</AccumulativeShadows>
))

function SceneBackground({ backgroundStore }: any) {
	const { scene, gl } = useThree()

	// Добавляем кнопку для показа информации о модели
	const { ColorType } = useControls(
		{
			ColorType: '#191919',

			exposure: {
				value: 1,
				min: 0,
				max: 2,
				step: 0.1,
				onChange: value => {
					gl.toneMappingExposure = value
				},
			},
		},

		{ store: backgroundStore }
	)

	useEffect(() => {
		scene.background = new Color(ColorType)
	}, [ColorType])

	return null
}

const GridChange = ({ circleSize, segments }: any) => {
	// const { gridSize, ...gridConfig } = useControls({
	// 	gridSize: [10.5, 10.5],
	// 	cellSize: { value: 0.6, min: 0, max: 10, step: 0.1 },
	// 	cellThickness: { value: 1, min: 0, max: 5, step: 0.1 },
	// 	cellColor: '#6f6f6f',
	// 	sectionSize: { value: 3.3, min: 0, max: 10, step: 0.1 },
	// 	sectionThickness: { value: 1.5, min: 0, max: 5, step: 0.1 },
	// 	sectionColor: '#9d4b4b',
	// 	fadeDistance: { value: 25, min: 0, max: 100, step: 1 },
	// 	fadeStrength: { value: 1, min: 0, max: 1, step: 0.1 },
	// 	followCamera: false,
	// 	infiniteGrid: true,
	// })

	// return <Grid position={[0, -0.01, 0]} args={gridSize} {...gridConfig} />
	return (
		<mesh rotation-x={-Math.PI / 2} receiveShadow>
			<circleGeometry args={[circleSize, segments]} />
			<meshStandardMaterial />
		</mesh>
	)
}

const StatsHelper = ({ canvasRef, storeType }: any) => {
	const { statsType, showStats } = useControls(
		{
			showStats: true,
			statsType: {
				value: 'statsThree',
				options: ['statsThree', 'statsGL'],
			},
		},
		{ store: storeType }
	)

	return showStats ? (
		<StatsPanel
			canvasRef={canvasRef}
			type={statsType as 'statsGL' | 'statsThree'}
		/>
	) : null
}

const GridHelperChange = ({ gridSize }: any) => {
	return <gridHelper args={[gridSize]} position={[0, -0.01, 0]} />
}

const GridOrHelper = ({ gridChangeStore }: any) => {
	const { Change } = useControls(
		{
			Change: {
				options: ['Grid', 'Circle', 'None'],
				value: 'Grid',
			},
		},
		{ store: gridChangeStore }
	)

	const GridVal = useControls(
		{
			'Grid Helper': folder(
				{
					gridSize: 10,
				},
				{ render: get => get('Change') === 'Grid' }
			),
		},
		{ store: gridChangeStore },
		[Change]
	)

	// Standard grid controls - only rendered when Change is true
	const CircleVal = useControls(
		'',
		{
			'Circle Settings': folder(
				{
					circleSize: 10,
					segment: 10,
					cellColor: '#6f6f6f',
					// Add other grid controls
				},
				{ render: get => get('Change') === 'Circle' }
			),
		},
		{ store: gridChangeStore }
	)

	return Change === 'Circle' ? (
		<GridChange
			circleSize={CircleVal.circleSize}
			segments={CircleVal.segment}
		/>
	) : Change === 'Grid' ? (
		<GridHelperChange gridSize={GridVal.gridSize} />
	) : null
}

interface PanelConfig {
	id: string
	title: string
	Component?: React.FC<{ store: any }>
	store: any
	isCollapsed: boolean
}

interface Panel {
	id: string
	store: any
	isCollapsed: boolean
}
const Viewer = () => {
	useEffect(() => {
		return () => {
			console.log('Unmoun Viewer')
		}
	}, [])
	const canvasRef = useRef<HTMLElement>(null!)

	const panelConfigs: PanelConfig[] = [
		{
			id: 'grid',
			title: 'Grid Controls',
			store: useCreateStore(),
			isCollapsed: true,
			Component: GridOrHelper,
		},
		{
			id: 'background',
			title: 'Scene Settings',
			store: useCreateStore(),
			isCollapsed: true,
			Component: SceneBackground,
		},
		{
			id: 'transform',
			title: 'Transform Controls',
			store: useCreateStore(),
			isCollapsed: true,
			Component: ModelHandler,
		},
		{
			id: 'model',
			title: 'Model Settings',
			isCollapsed: true,
			store: useCreateStore(),
		},
		{
			id: 'performance',
			title: 'Performance Settings',
			isCollapsed: true,
			store: useCreateStore(),
		},
	]

	// Initialize panels with stores and collapse state
	const [panels, setPanels] = useState<PanelConfig[]>(panelConfigs)

	// Функция для обновления состояния сворачивания панели
	const updatePanelState = (panelId: string, isCollapsed: boolean) => {
		setPanels(prevPanels =>
			prevPanels.map(panel =>
				panel.id === panelId ? { ...panel, isCollapsed } : panel
			)
		)
	}

	// Получить store по id
	const getStoreById = (id: string) =>
		panels.find(panel => panel.id === id)?.store

	const renderPanel = ({ id, title }: PanelConfig) => {
		const panel = panels.find(p => p.id === id)
		if (!panel) return null

		return (
			<LevaPanel
				key={id}
				store={panel.store}
				titleBar={{
					drag: false,
					title: title,
				}}
				fill
				flat
				collapsed={{
					collapsed: panel.isCollapsed,
					onChange: state => updatePanelState(id, state),
				}}
			/>
		)
	}

	const rendererRef = useRef(null)
	const cameraRef = useRef(null)
	const sceneRef = useRef(null)
	function ThreeObjectsCapture({ rendererRef, cameraRef, sceneRef }: any) {
		const { gl, camera, scene } = useThree()

		useEffect(() => {
			rendererRef.current = gl
			cameraRef.current = camera
			sceneRef.current = scene
			setRenderer(gl)
		}, [gl, camera, scene])

		return null
	}
	const [isPanelCollapsed, setIsPanelCollapsed] = useState(false)
	const togglePanel = () => {
		setIsPanelCollapsed(!isPanelCollapsed)
	}
	const { openSnapshotDialog, setOpen, onModelLoaded, setRenderer } =
		useMyContext() as any
	return (
		<div ref={canvasRef as any} className='h-full w-full relative'>
			<Canvas
				shadows
				gl={{
					antialias: false,
					preserveDrawingBuffer: true,
				}}
			>
				<ThreeObjectsCapture
					rendererRef={rendererRef}
					cameraRef={cameraRef}
					sceneRef={sceneRef}
				/>
				<StatsHelper
					canvasRef={canvasRef}
					storeType={getStoreById('performance')}
				/>
				<SceneBackground backgroundStore={getStoreById('background')} />

				<ModelHandler
					onModelLoaded={onModelLoaded}
					transformStore={getStoreById('transform')}
					modelStore={getStoreById('model')}
				/>
				<Suspense fallback={null}>
					<Env envStore={getStoreById('background')} />
				</Suspense>
				<Lights lightStore={getStoreById('background')} />
				<OrbitControls makeDefault />
				<GridOrHelper gridChangeStore={getStoreById('grid')} />
				<GizmoHelper alignment='bottom-center' margin={[80, 80]}>
					<GizmoViewport
						axisColors={['red', 'green', 'blue']}
						labelColor='white'
					/>
				</GizmoHelper>
			</Canvas>
			<div className='absolute top-0 left-0 w-80 h-100'>
				{openSnapshotDialog && (
					<Snapshot
						onClose={() => setOpen(false)}
						renderer={rendererRef.current}
						scene={sceneRef.current}
						camera={cameraRef.current} // Pass onClose callback
					/>
				)}
			</div>
			<div
				className={`absolute top-1/2 ${isPanelCollapsed ? 'right-0' : 'right-80'} 
                   w-6 h-24 cursor-pointer z-10 flex items-center justify-center
                   bg-gray-800 hover:bg-gray-700 rounded-l-md transition-all duration-300`}
				onClick={togglePanel}
				style={{ transform: 'translateY(-50%)' }}
			>
				<div
					className={`transform ${isPanelCollapsed ? 'rotate-0' : 'rotate-180'} transition-transform duration-300`}
				>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						className='h-5 w-5 text-white'
						fill='none'
						viewBox='0 0 24 24'
						stroke='currentColor'
					>
						<path
							strokeLinecap='round'
							strokeLinejoin='round'
							strokeWidth={2}
							d='M9 5l7 7-7 7'
						/>
					</svg>
				</div>
			</div>

			{/* Right panel with collapsible feature */}
			<div
				className={`absolute top-0 right-0 w-80 h-full bg-black/20 backdrop-blur-sm transition-all duration-300 ease-in-out ${
					isPanelCollapsed ? 'transform translate-x-full' : ''
				}`}
				style={{
					maxHeight: 'calc(100vh - 5rem)',
					overflowY: 'auto',
					overflowX: 'hidden',
				}}
			>
				<div className='flex flex-col gap-2 p-2'>
					{panelConfigs.map(renderPanel)}
				</div>
			</div>
		</div>
	)
}

export default Viewer
