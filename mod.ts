/**
 * # Pita api
 *
 * Simpliest way to develop secure and powerful app for redpitaya.
 *
 * Pita 🫓 api provide frontend proxy to [Redpitaya](https://redpitaya.com/) low level API. Pita api allows you to manage your Redpitaya board without worring about backend, and with [Pita cli](https://deno.land/x/pita), build and implement your webapp with a robust and secure environement. It handle all your workflow, from tooling installation to testing, benching and publishing.
 *
 * ## Getting started
 *
 * Example app taken from [pita template](https://github.com/JOTSR/pita-template).
 * ```ts
 * import config from '@pita/project.json' assert { type: 'json' }
 * import { Project } from 'https://deno.land/x/pita_api/mod.ts'
 *
 * const redpitaya = await Project.init(config)
 *
 * await redpitaya.channel.dac1.writeSlice([0, 0, 0, 256, 256, 256, 0, 0, 0])
 * console.log('Gate signal on DAC 1')
 * await redpitaya.pin.digital.led1.write(true)
 * console.log('Led 1 is ON')
 * ```
 *
 * @module
 * @license MIT
 */

export { Channel } from './src/channel.ts'
export { IO } from './src/io.ts'
export { Project } from './src/project.ts'
export { Redpitaya } from './src/redpitaya.ts'
export type {
	Bitness,
	ChannelPin,
	Frequency,
	IOMode,
	IoPin,
	IOType,
	Trigger,
} from './types.ts'
