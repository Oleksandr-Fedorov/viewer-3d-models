import create from 'zustand'

const useThreeStore = create(() => ({
	gl: null,
	camera: null,
	scene: null,
	updateThreeContext: state => {
		useThreeStore.setState({
			gl: state.gl,
			camera: state.camera,
			scene: state.scene,
		})
	},
}))

// Inside your Canvas
function ThreeContextUpdater() {
	const state = useThree()
	useEffect(() => {
		useThreeStore.getState().updateThreeContext(state)
	}, [state])
	return null
}
