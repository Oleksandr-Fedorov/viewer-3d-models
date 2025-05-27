import Stats from 'three/examples/jsm/libs/stats.module.js'
import { statsFactory } from './statsFactory'

export const createStatsThree = () => {
	return new Stats()
}

statsFactory.register('statsThree', createStatsThree)
