import { sleep } from '../deps.ts'
import {
	ChannelPin,
	ConfigId,
	Frequency,
	IOMode,
	IoPin,
	IOType,
	MessageId,
	ParameterDatas,
	RPConnection,
	SignalDatas,
} from '../types.ts'
import { gunzip } from '../utils.ts'
import { Channel } from './channel.ts'
import { IO } from './io.ts'

type AnalogPin = {
	readonly out0: IO<IOMode.WO, IOType.Analog>
	readonly out1: IO<IOMode.WO, IOType.Analog>
	readonly out2: IO<IOMode.WO, IOType.Analog>
	readonly out3: IO<IOMode.WO, IOType.Analog>
	readonly in0: IO<IOMode.RO, IOType.Analog>
	readonly in1: IO<IOMode.RO, IOType.Analog>
	readonly in2: IO<IOMode.RO, IOType.Analog>
	readonly in3: IO<IOMode.RO, IOType.Analog>
}
type DigitalPin = {
	readonly led0: IO<IOMode.RW, IOType.Digital>
	readonly led1: IO<IOMode.RW, IOType.Digital>
	readonly led2: IO<IOMode.RW, IOType.Digital>
	readonly led3: IO<IOMode.RW, IOType.Digital>
	readonly led4: IO<IOMode.RW, IOType.Digital>
	readonly led5: IO<IOMode.RW, IOType.Digital>
	readonly led6: IO<IOMode.RW, IOType.Digital>
	readonly led7: IO<IOMode.RW, IOType.Digital>
	readonly io0p: IO<IOMode.RW, IOType.Digital>
	readonly io1p: IO<IOMode.RW, IOType.Digital>
	readonly io2p: IO<IOMode.RW, IOType.Digital>
	readonly io3p: IO<IOMode.RW, IOType.Digital>
	readonly io4p: IO<IOMode.RW, IOType.Digital>
	readonly io5p: IO<IOMode.RW, IOType.Digital>
	readonly io6p: IO<IOMode.RW, IOType.Digital>
	readonly io7p: IO<IOMode.RW, IOType.Digital>
	readonly io0n: IO<IOMode.RW, IOType.Digital>
	readonly io1n: IO<IOMode.RW, IOType.Digital>
	readonly io2n: IO<IOMode.RW, IOType.Digital>
	readonly io3n: IO<IOMode.RW, IOType.Digital>
	readonly io4n: IO<IOMode.RW, IOType.Digital>
	readonly io5n: IO<IOMode.RW, IOType.Digital>
	readonly io6n: IO<IOMode.RW, IOType.Digital>
	readonly io7n: IO<IOMode.RW, IOType.Digital>
}

/**
 * The Redpitaya class provides a way to exchange messages with a Redpitaya device and control its
 * digital and analog inputs and outputs.
 * Redpitaya class is a proxy for Redpitaya low level API.
 * @example
 * ```ts
 * const redpitaya = await Project.init(config)
 * await redpitaya.channel.dac1.writeSlice([0, 0, 0, 256, 256, 256, 0, 0, 0])
 * console.log('Gate signal on DAC 1')
 * await redpitaya.pin.digital.led1.write(true)
 * console.log('Led 1 is ON')
 * ```
 */
export class Redpitaya {
	#listeners: Record<
		'connect' | 'disconnect' | 'error',
		((event: Event) => void | Promise<void>)[]
	> = {
		connect: [],
		disconnect: [],
		error: [],
	}

	#closed = false
	#closeCause?: string
	#digital: DigitalPin
	#analog: AnalogPin
	#ws: WebSocket
	#reader: ReadableStreamDefaultReader
	#writer: WritableStreamDefaultWriter
	channel: {
		readonly adc1: Channel<IOMode.RO>
		readonly adc2: Channel<IOMode.RO>
		readonly dac1: Channel<IOMode.WO>
		readonly dac2: Channel<IOMode.WO>
	}
	pin: { analog: AnalogPin; digital: DigitalPin }

	constructor({ endpoint }: { endpoint: `ws://${string}` }) {
		const ws = new WebSocket(endpoint)
		ws.binaryType = 'blob'
		this.#ws = ws

		const writable = new WritableStream({
			async write(chunk) {
				while (ws.readyState === ws.CONNECTING) {
					await sleep(50)
				}
				ws.send(chunk)
			},
		})
		this.#writer = writable.getWriter()

		ws.onopen = () =>
			this.#listeners.connect.forEach((listener) =>
				listener(new Event('connect'))
			)
		const readable = new ReadableStream({
			start(controller) {
				ws.onmessage = async (message: MessageEvent<Blob>) => {
					const buffer = await message.data.arrayBuffer()
					const decompressed = await gunzip(buffer)
					const string = new TextDecoder().decode(decompressed)
					const datas = JSON.parse(string)
					controller.enqueue(datas)
				}
			},
		})
		this.#reader = readable.getReader()
		ws.onerror = (error) =>
			this.#listeners.error.forEach((listener) =>
				listener(
					new CustomEvent('error', {
						detail: error,
					}),
				)
			)
		ws.onclose = (event) => this.close(event.toString())

		this.#digital = {
			led0: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.led0),
			}),
			led1: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.led1),
			}),
			led2: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.led2),
			}),
			led3: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.led3),
			}),
			led4: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.led4),
			}),
			led5: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.led5),
			}),
			led6: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.led6),
			}),
			led7: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.led7),
			}),
			io0p: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.io0p),
			}),
			io1p: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.io1p),
			}),
			io2p: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.io2p),
			}),
			io3p: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.io3p),
			}),
			io4p: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.io4p),
			}),
			io5p: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.io5p),
			}),
			io6p: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.io6p),
			}),
			io7p: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.io7p),
			}),
			io0n: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.io0n),
			}),
			io1n: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.io1n),
			}),
			io2n: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.io2n),
			}),
			io3n: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.io3n),
			}),
			io4n: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.io4n),
			}),
			io5n: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.io5n),
			}),
			io6n: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.io6n),
			}),
			io7n: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', IoPin.digital.io7n),
			}),
		} as const

		this.#analog = {
			out0: new IO({
				mode: IOMode.WO,
				type: IOType.Analog,
				connection: this.connection('signals', IoPin.analog.out0),
			}),
			out1: new IO({
				mode: IOMode.WO,
				type: IOType.Analog,
				connection: this.connection('signals', IoPin.analog.out1),
			}),
			out2: new IO({
				mode: IOMode.WO,
				type: IOType.Analog,
				connection: this.connection('signals', IoPin.analog.out2),
			}),
			out3: new IO({
				mode: IOMode.WO,
				type: IOType.Analog,
				connection: this.connection('signals', IoPin.analog.out3),
			}),
			in0: new IO({
				mode: IOMode.RO,
				type: IOType.Analog,
				connection: this.connection('signals', IoPin.analog.in0),
			}),
			in1: new IO({
				mode: IOMode.RO,
				type: IOType.Analog,
				connection: this.connection('signals', IoPin.analog.in1),
			}),
			in2: new IO({
				mode: IOMode.RO,
				type: IOType.Analog,
				connection: this.connection('signals', IoPin.analog.in2),
			}),
			in3: new IO({
				mode: IOMode.RO,
				type: IOType.Analog,
				connection: this.connection('signals', IoPin.analog.in3),
			}),
		} as const

		/**
		 * List of Redpitaya fast analog IOs.
		 * @example
		 * ```ts
		 * const redpitaya = await Project.init(config)
		 * await redpitaya.channel.dac1.writeSlice([0, 0, 0, 256, 256, 256, 0, 0, 0])
		 * console.log('Gate signal on DAC 1')
		 * ```
		 */
		this.channel = {
			adc1: new Channel({
				mode: IOMode.RO,
				bitness: 16n,
				frequency: Frequency.SMP_125M,
				connection: this.connection('signals', ChannelPin.adc1),
			}),
			adc2: new Channel({
				mode: IOMode.RO,
				bitness: 16n,
				frequency: Frequency.SMP_125M,
				connection: this.connection('signals', ChannelPin.adc2),
			}),
			dac1: new Channel({
				mode: IOMode.WO,
				bitness: 16n,
				frequency: Frequency.SMP_125M,
				connection: this.connection('signals', ChannelPin.dac1),
			}),
			dac2: new Channel({
				mode: IOMode.WO,
				bitness: 16n,
				frequency: Frequency.SMP_125M,
				connection: this.connection('signals', ChannelPin.dac2),
			}),
		} as const

		/**
		 * List of Redpitaya digital and slow analog IOs.
		 * @example
		 * ```ts
		 * const redpitaya = await Project.init(config)
		 * await redpitaya.pin.digital.led1.write(true)
		 * console.log('Led 1 is ON')
		 * ```
		 */
		this.pin = {
			analog: this.#analog,
			digital: this.#digital,
		}
	}

	/**
	 * Exchange messages with Redpitaya. Send and recieve signals and parameters from Redpitaya backend.
	 * @param {'signals' | 'parameters'} type Messages type.
	 * @param {Exclude<MessageId, ConfigId>} key Message id is JSON key used for coupling message data between frontend and backend.
	 * @returns Connection interface.
	 */
	connection<
		T extends 'signals' | 'parameters',
		K extends Exclude<MessageId, ConfigId>,
	>(
		type: T,
		key: K,
	) {
		return {
			read: () => this.#read(type, key),
			write: (datas) => this.#write(type, key, datas),
			readIter: this.#readIter(type, key),
			writeIter: this.#writeIter(type, key),
			getConfig: (name) =>
				this.#read('parameters', `${key}#${name}` as ConfigId),
			setConfig: (name, data) =>
				this.#write('parameters', `${key}#${name}` as ConfigId, data),
		} as RPConnection<T, K>
	}

	async #read<T extends 'signals' | 'parameters'>(
		type: T,
		key: MessageId,
	): Promise<T extends 'signals' ? SignalDatas : ParameterDatas> {
		const { done, value } = await this.#readIter(type, key).next()
		if (done) {
			this.#listeners.error.forEach((listener) =>
				listener(
					new CustomEvent('error', {
						detail: `no datas recieved for { ${type}: ${key} }`,
					}),
				)
			)
			throw new Error(`no datas recieved for { ${type}: ${key} }`)
		}
		return value
	}

	async #write<T extends 'signals' | 'parameters'>(
		type: T,
		key: MessageId,
		datas: T extends 'signals' ? SignalDatas : ParameterDatas,
	): Promise<void> {
		const { done, value } = await this.#writeIter(type, key).next()
		if (done) {
			this.#listeners.error.forEach((listener) =>
				listener(
					new CustomEvent('error', {
						detail: `no datas recieved for { ${type}: ${key} }`,
					}),
				)
			)
			throw new Error(`no datas recieved for { ${type}: ${key} }`)
		}
		return value(datas)
	}

	async *#readIter<T extends 'signals' | 'parameters'>(
		type: T,
		key: MessageId,
	): AsyncGenerator<
		T extends 'signals' ? SignalDatas : ParameterDatas,
		void,
		unknown
	> {
		if (this.#closed) {
			throw new Error(
				'Redpitaya connection was already closed by calling Redpitaya.close',
				{
					cause: new Error(
						this.#closeCause ?? 'no close detail provided',
					),
				},
			)
		}
		try {
			while (true) {
				const { done, value } = await this.#reader.read()
				if (done) break
				if (type in value && key in value[type]) {
					if ('signals' in value) {
						yield value.signals[key] as T extends 'signals'
							? SignalDatas
							: ParameterDatas
					}
					if ('parameters' in value) {
						yield value.parameters[key] as T extends 'signals'
							? SignalDatas
							: ParameterDatas
					}
				}
			}
		} catch (error) {
			this.#listeners.disconnect.forEach((listener) =>
				listener(new CustomEvent('disconnect', { detail: error }))
			)
		}
	}

	async *#writeIter<T extends 'signals' | 'parameters'>(
		type: T,
		key: MessageId,
	): AsyncGenerator<
		(
			data: T extends 'signals' ? SignalDatas : ParameterDatas,
		) => Promise<void>,
		void,
		void
	> {
		if (this.#closed) {
			throw new Error(
				'Redpitaya connection was already closed by calling Redpitaya.close',
				{
					cause: new Error(
						this.#closeCause ?? 'no close detail provided',
					),
				},
			)
		}

		try {
			const writer = (
				data: T extends 'signals' ? SignalDatas : ParameterDatas,
			) => this.#writer.write(
				JSON.stringify({ [type]: { [key]: data } }),
			)

			await this.#writer.ready

			while (true) {
				yield writer
			}
		} catch (error) {
			this.#listeners.disconnect.forEach((listener) =>
				listener(new CustomEvent('disconnect', { detail: error }))
			)
		}
	}

	/**
	 * Adds an event listener for connect, disconnect, or error events.
	 * @param {'connect' | 'disconnect' | 'error'} type - Type of event to listen for.
	 * @param listener - The listener parameter is a function that will be called when the specified event
	 * type occurs. It takes an event object as its parameter and can return either void or a Promise that
	 * resolves to void. The event object contains information about the event that occurred, such as the
	 * type of event and any additional data associated
	 * @example
	 * ```ts
	 * redpitaya.addEventListener('connect', () => alert('redpitaya is connected'))
	 * redpitaya.addEventListener('disconnect', () => alert('please check your connection'))
	 * redpitaya.addEventListener('error', () => alert('operation fails'))
	 * //...
	 * ```
	 */
	addEventListener(
		type: 'connect' | 'disconnect' | 'error',
		listener: (event: Event) => void | Promise<void>,
	) {
		this.#listeners[type].push(listener)
	}

	/**
	 * Close the Redpitaya connection and triggers disconnect event.
	 * @param {string} [cause] - The `cause` parameter is an optional string that describes the reason for
	 * closing the Redpitaya. If it is provided, it will be used as the detail for the `CustomEvent` that
	 * is dispatched to the `disconnect` listeners. If it is not provided, a default detail message will
	 * be used.
	 *
	 * close() abort all pending messages, no finished state is lost.
	 * @example
	 * ```ts
	 * redpitaya.addEventListener('disconnect', handleDisconnect)
	 * await redpitaya.pin.digital.led0.write(true) //ok
	 * await redpitaya.close()
	 * //handleDisconnect is called
	 * await redpitaya.pin.digital.led0.write(true) //error
	 * ```
	 */
	async close(cause?: string) {
		const detail = cause ??
			'Redpitaya was closed by calling Redpitaya.close'
		this.#listeners.disconnect.forEach((listener) =>
			listener(new CustomEvent('disconnect', { detail }))
		)
		await this.#writer.abort(cause)
		await this.#writer.abort(cause)
		this.#closeCause = detail
		this.#closed = true
	}

	/**
	 * True if Redpitaya.close() called.
	 * @example
	 * ```ts
	 * await redpitaya.pin.digital.led0.write(true) //ok
	 * redpitaya.closed //false
	 * await redpitaya.close()
	 * await redpitaya.pin.digital.led0.write(true) //error
	 * redpitaya.closed //true
	 * ```
	 */
	get closed() {
		return this.#closed
	}

	/**
	 * Check if underlaying websocket is opened
	 * @example
	 * ```ts
	 * await redpitaya.connected()
	 * ```
	 */
	async connected() {
		while (this.#ws.readyState === this.#ws.CONNECTING) {
			await sleep(50)
		}
	}
}
