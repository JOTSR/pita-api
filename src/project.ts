import { Redpitaya } from '../mod.ts'

/**
 * Project represent the host configuration.
 * @example
 * ```ts
 * const app = Project.init(projectConfig, initialState)
 * ```
 */
export class Project {
	static #config: Config
	/**
	 * This initializes an App from an UUID from the 🫓 pita project configuration.
	 * It init the connection to the backend.
	 * @param {{ uuid: string }} { uuid } - The 🫓 pita project uuid.
	 * @returns A new instance of App.
	 */
	static async init(
		{ uuid }: { uuid: string },
	): Promise<Redpitaya> {
		this.#config = {
			uuid,
			startEndpoint: `/bazaar?start=${uuid}?${
				location.search.substring(1)
			}`,
			wsEndpoint: `ws://${location.hostname}:9002`,
		}

		const response = await fetch(this.#config.startEndpoint)
		if (!response.ok) {
			throw new Error(
				`Unable to start the application, server respond with (${response.status}) ${response.statusText}`,
			)
		}

		const connection = await new WebSocketStream(this.#config.wsEndpoint)
			.connection

		return new Redpitaya({ connection })
	}

	/**
	 * @throws Static only class, "new" is not disponible
	 */
	constructor() {
		throw new TypeError('Static only class, "new" is not disponible')
	}
}

export type Config = {
	uuid: string
	startEndpoint: string
	wsEndpoint: string
}
