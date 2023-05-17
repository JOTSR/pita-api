import {
	Bitness,
	ChannelId,
	Frequency,
	IOMode,
	RPConnection,
	SignalDatas,
	Trigger,
	Tuple,
} from '../types.ts'

/**
 * Interface for Redpitaya fast analog IOs.
 * @example
 * ```ts
 * const adc1 = new Channel({
 * 	 mode: IOMode.RO,
 * 	 bitness: 16n,
 * 	 frequency: Frequency.SMP_125M,
 * 	 connection: Redpitaya.connection('signals', ChannelPin.adc1),
 * })
 * ```
 */
export class Channel<Mode extends IOMode> {
	#bitness: Bitness<16n> = 16n
	#frequency: Frequency
	#trigger: Trigger = Trigger.Disabled

	#mode: IOMode
	#connection: RPConnection<'signals', ChannelId>
	#bufferSize = 1

	constructor(
		{ mode, bitness, frequency, connection }: {
			mode: Mode
			frequency: Frequency
			bitness: Bitness<16n>
			connection: RPConnection<'signals', ChannelId>
		},
	) {
		//! required to #connection in first
		this.#connection = connection
		this.#mode = mode
		this.#frequency = frequency
		this.bitness = bitness
	}

	/**
	 * Reads a buffered slice from adc input.
	 * @param {Size} bufferSize - Size of the slice buffered by the backend.
	 * @returns Signal value as number tuple of buffer size.
	 * @example
	 * ```ts
	 * //ADC 125MHz
	 * //Get voltage on 1µs
	 * const voltage = await adc1.readSlice(125)
	 * ```
	 */
	async readSlice<Size extends number>(
		bufferSize: Size,
	): Promise<Mode extends IOMode.WO ? never : Tuple<number, Size>> {
		if (this.#mode === IOMode.WO) {
			throw new TypeError(`can't read write only IO`)
		}
		if (this.#trigger === Trigger.Disabled) {
			throw new Error(
				'channel trigger is set to "Disabled", no data can be processed',
			)
		}
		if (this.#bufferSize !== bufferSize) {
			this.#bufferSize = bufferSize
			await this.#connection.setConfig('buffer_size', {
				value: bufferSize,
			})
		}
		const { value } = await this.#connection.read()
		return value.slice(bufferSize) as Mode extends IOMode.WO ? never
			: Tuple<number, Size>
	}

	/**
	 * Writes a slice of points to dac.
	 * @param {number[]} buffer - Buffer to write.
	 * @example
	 * ```ts
	 * import { randomIntArray } from 'https://deno.land/x/denum@v1.2.0/mod.ts'
	 * //DAC 16bits @ 125MHz
	 * //Set voltage for 1µs
	 * const voltage = randomIntArray(0, 2 ** 16, 125)
	 * await dac1.writeSlice(voltage)
	 * ```
	 */
	async writeSlice(
		buffer: number[],
	): Promise<Mode extends IOMode.RO ? never : void> {
		if (this.#mode === IOMode.RO) {
			throw new TypeError(`can't write read only IO`)
		}
		if (this.#trigger === Trigger.Disabled) {
			throw new Error(
				'channel trigger is set to "Disabled", no data can be processed',
			)
		}
		if (this.#bufferSize !== buffer.length) {
			this.#bufferSize = buffer.length
			await this.#connection.setConfig('buffer_size', {
				value: buffer.length,
			})
		}
		return this.#connection.write({
			size: buffer.length,
			value: buffer,
		}) as Promise<Mode extends IOMode.RO ? never : void>
	}

	/**
	 * Continuously read a buffered slice from adc input.
	 * @param {Size} bufferSize - Size of the slice buffered by the backend.
	 * @returns Async generator of signal value as number tuple of buffer size.
	 * @example
	 * ```ts
	 * //ADC 125MHz
	 * //Get voltage on 1µs continuously
	 * for await (const voltage of adc1.readIter(125)) {
	 * 	console.log(voltage)
	 * }
	 * ```
	 */
	async *readIter<Size extends number>(
		bufferSize: Size,
	): AsyncGenerator<
		Mode extends IOMode.WO ? never : Tuple<number, Size>,
		void,
		void
	> {
		if (this.#mode === IOMode.WO) {
			throw new TypeError(`can't read write only IO`)
		}
		if (this.#trigger === Trigger.Disabled) {
			throw new Error(
				'channel trigger is set to "Disabled", no data can be processed',
			)
		}
		if (this.#bufferSize !== bufferSize) {
			this.#bufferSize = bufferSize
			await this.#connection.setConfig('buffer_size', {
				value: bufferSize,
			})
		}
		while (true) {
			const { done, value } = await this.#connection.readIter.next()
			if (done) {
				break
			}
			yield value.value.slice(bufferSize) as Mode extends IOMode.WO
				? never
				: Tuple<number, Size>
		}
	}

	/**
	 * Continously write a slice of points to dac.
	 * @returns Async generator.
	 * @example
	 * ```ts
	 * import { randomIntArray } from 'https://deno.land/x/denum@v1.2.0/mod.ts'
	 * //DAC 16bits @ 125MHz
	 * //Set voltage for 1µs continuously
	 * for await (const write of adc1.writeIter(125)) {
	 * 	const voltage = randomIntArray(0, 2 ** 16, 125)
	 * 	await write(voltage)
	 * }
	 * ```
	 */
	async *writeIter<Size extends number>(
		bufferSize: Size,
	): AsyncGenerator<(data: SignalDatas) => Promise<void>, void, void> {
		if (this.#mode === IOMode.RO) {
			throw new TypeError(`can't write read only IO`)
		}
		if (this.#trigger === Trigger.Disabled) {
			throw new Error(
				'channel trigger is set to "Disabled", no data can be processed',
			)
		}
		if (this.#bufferSize !== bufferSize) {
			this.#bufferSize = bufferSize
			await this.#connection.setConfig('buffer_size', {
				value: bufferSize,
			})
		}
		yield* this.#connection.writeIter
	}

	/**
	 * Set the bitness of the Channel.
	 * @param {Bitness<16n>} bitness - The "bitness" parameter is a value that represents the number of bits used in the ADC/DAC.
	 * @example
	 * ```ts
	 * adc1.bitness = 8n
	 * ```
	 */
	set bitness(bitness: Bitness<16n>) {
		if (bitness < 1n || bitness > 16n) {
			throw new RangeError(
				`${bitness} is invalid bitness for ACD, allowed range is (0n < bitness < 17n)`,
			)
		}
		this.#bitness = bitness
		this.#connection.setConfig('bitness', { value: Number(bitness) })
	}

	/**
	 * Get the bitness of the Channel.
	 * @returns bitness - The "bitness" parameter is a value that represents the number of bits used in the ADC/DAC.
	 */
	get bitness(): Bitness<16n> {
		return this.#bitness
	}

	/**
	 * Set the clock frequency of the Channel.
	 * @param {Frequency} frequency - The frequency parameter is a value that represents the number conversions made by the ADC/DAC per seconds.
	 * @example
	 * ```ts
	 * adc1.frequency = Frequency.SMP_125M
	 * ```
	 */
	set frequency(frequency: Frequency) {
		this.#frequency = frequency
		this.#connection.setConfig('frequency', { value: Number(frequency) })
	}

	/**
	 * Get the clock frequency of the Channel.
	 * @returns frequency - The frequency parameter is a value that represents the number conversions made by the ADC/DAC per seconds.
	 */
	get frequency(): Frequency {
		return this.#frequency
	}

	/**
	 * Set the trigger of the Channel.
	 * @param {Trigger} trigger - The trigger parameter is a value that which event launch processing.
	 * @example
	 * ```ts
	 * adc1.trigger = Trigger.Now
	 * //channel start to acquire
	 * await adc1.readSlice(125) //ok
	 * adc1.trigger = Trigger.Disabled
	 * //channel stop to acquire
	 * await adc1.readSlice(125) //error
	 * ```
	 */
	set trigger(trigger: Trigger) {
		this.#trigger = trigger
		this.#connection.setConfig('trigger', { value: Number(trigger) })
	}

	/**
	 * Get the trigger of the Channel.
	 * @returns trigger - The trigger parameter is a value that which event launch processing.
	 */
	get trigger(): Trigger {
		return this.#trigger
	}
}
