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
 * Interface for Redpitaya fast analog IOs
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
	 * Reads a buffered slice of adc input
	 * @param {Size} bufferSize - `bufferSize` is a generic type parameter that represents the size of the
	 * buffer to be read from the connection. It is a number that specifies the number of bytes to be read
	 * from the connection. The function returns a promise that resolves to a tuple containing the number
	 * of bytes read and the buffer of
	 * @returns A tuple containing a number and a value of type `Size`, which is a generic type parameter
	 * representing a number. The returned value is obtained by slicing the `value` property of an object
	 * that is read from a connection.
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

	writeIter(): Mode extends IOMode.WO ? never
		: AsyncGenerator<void, void, SignalDatas> {
		if (this.#mode === IOMode.RO) {
			throw new TypeError(`can't write read only IO`)
		}
		return this.#connection.writeIter as Mode extends IOMode.WO ? never
			: AsyncGenerator<void, void, SignalDatas>
	}

	set bitness(bitness: Bitness<16n>) {
		if (bitness < 1n || bitness > 16n) {
			throw new RangeError(
				`${bitness} is invalid bitness for ACD, allowed range is (0n < bitness < 17n)`,
			)
		}
	}
	get bitness(): Bitness<16n> {
		return this.#bitness
	}
}
