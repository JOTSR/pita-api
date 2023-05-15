import {
	Bitness,
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
	#connection: RPConnection<'signals'>
	#bufferSize = 1

	constructor(
		{ mode, bitness, frequency, connection }: {
			mode: Mode
			frequency: Frequency
			bitness: Bitness<16n>
			connection: RPConnection<'signals'>
		},
	) {
		this.#mode = mode
		this.#frequency = frequency
		this.bitness = bitness
		this.#connection = connection
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
		if (this.#bufferSize !== bufferSize) {
			//TODO send buffersize to backend
			// this.#connection.write()
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
	writeSlice(
		buffer: number[],
	): Promise<Mode extends IOMode.RO ? never : void> {
		if (this.#mode === IOMode.RO) {
			throw new TypeError(`can't write read only IO`)
		}
		return this.#connection.write({
			size: buffer.length,
			value: buffer,
		}) as Promise<Mode extends IOMode.RO ? never : void>
	}

	/**
	 * Continuously read a buffered slice from adc input.
	 * @param {Size} bufferSize - Size of the slice buffered by the backend.
	 * @returns Async iterator of signal value as number tuple of buffer size.
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
	 * @returns Async iterator.
	 * @example
	 * ```ts
	 * import { randomIntArray } from 'https://deno.land/x/denum@v1.2.0/mod.ts'
	 * //DAC 16bits @ 125MHz
	 * //Set voltage for 1µs continuously
	 * const write = adc1.writeIter()
	 * while (true) {
	 * 	const voltage = randomIntArray(0, 2 ** 16, 125)
	 * 	await write.next(voltage)
	 * }
	 * ```
	 */
	writeIter(): Mode extends IOMode.WO ? never
		: AsyncGenerator<void, void, SignalDatas> {
		if (this.#mode === IOMode.RO) {
			throw new TypeError(`can't write read only IO`)
		}
		return this.#connection.writeIter as Mode extends IOMode.WO ? never
			: AsyncGenerator<void, void, SignalDatas>
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
	}

	/**
	 * Get the bitness of the Channel.
	 * @returns bitness - The "bitness" parameter is a value that represents the number of bits used in the ADC/DAC.
	 */
	get bitness(): Bitness<16n> {
		return this.#bitness
	}
}
