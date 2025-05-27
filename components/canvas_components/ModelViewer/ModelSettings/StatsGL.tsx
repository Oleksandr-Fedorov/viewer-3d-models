import Stats from 'stats-gl'
import { statsFactory } from './statsFactory'

export const createStatsGL = () => {
	return new Stats({
		logsPerSecond: 5,
		graphsPerSecond: 5,
		trackGPU: true,
		trackCPT: true,
		trackHz: true,
		samplesLog: 5,
		samplesGraph: 5,
	})
}

statsFactory.register('statsGL', createStatsGL)
