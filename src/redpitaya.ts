import {
	ChannelPin,
	Frequency,
	IOMode,
	IOType,
	MessageData,
	MessageId,
	ParameterDatas,
	Pin,
	SignalDatas,
} from '../types.ts'
import { IO } from './io.ts'
import { Channel } from './channel.ts'
import { JsonParseStream } from '../deps.ts'

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
	#readable: ReadableStream<MessageData>
	#writable: WritableStream<string>

	constructor({ connection }: { connection: WebSocketConnection }) {
		this.#writable = connection.writable
		this.#readable = connection.readable
			//@ts-ignore TODO fix definition
			.pipeThrough(new DecompressionStream('gzip'))
			.pipeThrough(new TextDecoderStream())
			.pipeThrough(new JsonParseStream()) as ReadableStream<MessageData>
	}

	#digital() {
		return {
			led0: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.led0),
			}),
			led1: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.led1),
			}),
			led2: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.led2),
			}),
			led3: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.led3),
			}),
			led4: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.led4),
			}),
			led5: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.led5),
			}),
			led6: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.led6),
			}),
			led7: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.led7),
			}),
			io0p: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.io0p),
			}),
			io1p: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.io1p),
			}),
			io2p: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.io2p),
			}),
			io3p: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.io3p),
			}),
			io4p: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.io4p),
			}),
			io5p: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.io5p),
			}),
			io6p: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.io6p),
			}),
			io7p: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.io7p),
			}),
			io1n: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.io1n),
			}),
			io2n: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.io2n),
			}),
			io3n: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.io3n),
			}),
			io4n: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.io4n),
			}),
			io5n: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.io5n),
			}),
			io6n: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.io6n),
			}),
			io7n: new IO({
				mode: IOMode.RW,
				type: IOType.Digital,
				connection: this.connection('parameters', Pin.digital.io7n),
			}),
		} as const
	}

	#analog() {
		return {
			out0: new IO({
				mode: IOMode.WO,
				type: IOType.Analog,
				connection: this.connection('signals', Pin.analog.out0),
			}),
			out1: new IO({
				mode: IOMode.WO,
				type: IOType.Analog,
				connection: this.connection('signals', Pin.analog.out1),
			}),
			out2: new IO({
				mode: IOMode.WO,
				type: IOType.Analog,
				connection: this.connection('signals', Pin.analog.out2),
			}),
			out3: new IO({
				mode: IOMode.WO,
				type: IOType.Analog,
				connection: this.connection('signals', Pin.analog.out3),
			}),
			in0: new IO({
				mode: IOMode.RO,
				type: IOType.Analog,
				connection: this.connection('signals', Pin.analog.in0),
			}),
			in1: new IO({
				mode: IOMode.RO,
				type: IOType.Analog,
				connection: this.connection('signals', Pin.analog.in1),
			}),
			in2: new IO({
				mode: IOMode.RO,
				type: IOType.Analog,
				connection: this.connection('signals', Pin.analog.in2),
			}),
			in3: new IO({
				mode: IOMode.RO,
				type: IOType.Analog,
				connection: this.connection('signals', Pin.analog.in3),
			}),
		} as const
	}

	/**
	 * List of Redpitaya fast analog IOs.
	 * @example
	 * ```ts
	 * const redpitaya = await Project.init(config)
	 * await redpitaya.channel.dac1.writeSlice([0, 0, 0, 256, 256, 256, 0, 0, 0])
	 * console.log('Gate signal on DAC 1')
	 * ```
	 */
	get channel() {
		return {
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
	}

	/**
	 * List of Redpitaya digital and slow analog IOs.
	 * @example
	 * ```ts
	 * const redpitaya = await Project.init(config)
	 * await redpitaya.pin.digital.led1.write(true)
	 * console.log('Led 1 is ON')
	 * ```
	 */
	get pin() {
		return {
			analog: this.#analog,
			digital: this.#digital,
		}
	}

	/**
	 * Exchange messages with Redpitaya. Send and recieve signals and parameters from Redpitaya backend.
	 * @param {string} type Messages type ('signals' | 'parameters').
	 * @param {MessageId} key Message id is JSON key used for coupling message data between frontend and backend.
	 * @returns Connection interface.
	 */
	connection<T extends 'signals' | 'parameters'>(type: T, key: MessageId) {
		return {
			read: () => this.#read(type, key),
			write: (
				datas: T extends 'signals' ? SignalDatas : ParameterDatas,
			) => this.#write(type, key, datas),
			readIter: this.#readIter(type, key),
			writeIter: this.#writeIter(type, key),
		}
	}

	async #read<T extends 'signals' | 'parameters'>(
		type: T,
		key: MessageId,
	): Promise<T extends 'signals' ? SignalDatas : ParameterDatas> {
		const { done, value } = await this.#readIter(type, key).next()
		if (done) {
			throw new Error(`no datas recieved for { ${type}: ${key} }`)
		}
		return value
	}

	async #write<T extends 'signals' | 'parameters'>(
		type: T,
		key: MessageId,
		datas: T extends 'signals' ? SignalDatas : ParameterDatas,
	): Promise<void> {
		const { done, value } = await this.#writeIter(type, key).next(datas)
		if (done) {
			throw new Error(`no datas recieved for { ${type}: ${key} }`)
		}
		return value
	}

	async *#readIter<T extends 'signals' | 'parameters'>(
		type: T,
		key: MessageId,
	): AsyncGenerator<
		T extends 'signals' ? SignalDatas : ParameterDatas,
		void,
		unknown
	> {
		const [readable] = this.#readable.tee()
		const filtered = readable.pipeThrough(
			new TransformStream<MessageData, MessageData<T>>({
				transform(chunk, controler) {
					if (
						type in chunk && key in chunk[type as keyof MessageData]
					) {
						controler.enqueue(chunk as MessageData<T>)
					}
				},
			}),
		).getReader()
		while (true) {
			const { done, value } = await filtered.read()
			if (done) break
			if ('signals' in value) {
				//@ts-ignore TODO fix type inference
				yield value.signals[key]
			}
			if ('parameters' in value) {
				//@ts-ignore TODO fix type inference
				yield value.parameters[key]
			}
		}
	}

	async *#writeIter<T extends 'signals' | 'parameters'>(
		type: T,
		key: MessageId,
	): AsyncGenerator<
		void,
		void,
		T extends 'signals' ? SignalDatas : ParameterDatas
	> {
		while (true) {
			this.#writable.getWriter().write(
				JSON.stringify({ [type]: { [key]: yield } }),
			)
		}
	}
}
