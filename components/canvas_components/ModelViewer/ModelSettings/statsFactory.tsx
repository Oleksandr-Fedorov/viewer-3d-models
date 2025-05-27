type StatsCreator = () => any

class StatsFactory {
	private creators: Record<string, StatsCreator> = {}

	register(name: string, creator: StatsCreator) {
		this.creators[name] = creator
	}

	create(name: string) {
		if (!this.creators[name]) {
			throw new Error(`Stats type "${name}" is not registered`)
		}
		return this.creators[name]()
	}
}

export const statsFactory = new StatsFactory()
