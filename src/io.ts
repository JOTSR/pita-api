import { Bitness, IOMode, IOType, RPConnection } from '../types.ts'

/**
 * Interface for Redpitaya digital and slow analog IOs.
 * @example
 * ```ts
 * const dio6p = new IO({
 * 	mode: IOMode.RW,
 * 	type: IOType.Digital,
 * 	connection: this.connection('parameters', Pin.digital.io6p),
 * })
 * ```
 */
export class IO<Mode extends IOMode, Type extends IOType> {
	#mode: IOMode
	#type: IOType
	#bitness: Bitness<12n> = 1n
	#connection: RPConnection<
		Type extends IOType.Digital ? 'parameters' : 'signals'
	>
	constructor(
		{ mode, type, bitness = 1n, connection }: {
			mode: Mode
			type: Type
			bitness?: Bitness<12n>
			connection: RPConnection<
				Type extends IOType.Digital ? 'parameters' : 'signals'
			>
		},
	) {
		this.#mode = mode
		this.#type = type
		this.bitness = bitness
		this.#connection = connection
	}

	/**
	 * Writes a value from IO.
	 * @param {number | boolean} value - Value to write.
	 * @example
	 * ```ts
	 * await dio6p.write(true)
	 * ```
	 */
	write(
		value: Mode extends IOMode.RO ? never
			: Type extends IOType.Digital ? boolean
			: number,
	): Promise<void> {
		//@ts-ignore TODO implement better type checking
		return this.#connection.write(value)
	}

	/**
	 * Reads a value from IO.
	 * @returns {number | boolean} value - Readed value.
	 * @example
	 * ```ts
	 * const state = await dio6p.read()
	 * ```
	 */
	async read(): Promise<
		Mode extends IOMode.WO ? never
			: Type extends IOType.Digital ? boolean
			: number
	> {
		if (this.#mode === IOMode.WO) {
			throw new TypeError(`can't read write only pin`)
		}
		const datas = await this.#connection.read()
		if ('size' in datas) {
			//@ts-ignore disable unecessary type checking
			return datas.value[0]
		}
		//@ts-ignore disable unecessary type checking
		return datas.value !== 0
	}

	//TODO add readSlice
	//TODO add writeSlice

	/**
	 * Continuously read a value from IO.
	 * @example
	 * ```ts
	 * for await (const state of dio6p.readIter()) {
	 * 	console.log(state)
	 * }
	 * ```
	 */
	readIter() {
		return this.#connection.readIter
	}

	/**
	 * Continuously write a value to IO.
	 * @example
	 * ```ts
	 * for await (const write of dio6p.writeIter()) {
	 * 	await write(Math.random() > 0.5)
	 * }
	 * ```
	 */
	writeIter() {
		return this.#connection.writeIter
	}

	/**
	 * Set the bitness of the IO.
	 * Only for Analog IOs.
	 * @param {Bitness<12n>} bitness - The "bitness" parameter is a value that represents the number of bits used in the ADC/DAC.
	 * @example
	 * ```ts
	 * analogOut1.bitness = 4n
	 * ```
	 */
	set bitness(bitness: Bitness<12n>) {
		if ((bitness < 1n || bitness > 12n) && this.#type === IOType.Analog) {
			throw new RangeError(
				`${bitness} is invalid bitness for Analog IO, allowed range is (0n < bitness < 13n)`,
			)
		}
		if (bitness !== 1n && this.#type === IOType.Digital) {
			throw new RangeError(
				`${bitness} is invalid bitness for Digital IO, bitness must be 1n`,
			)
		}
	}

	/**
	 * Get the bitness of the IO.
	 * Only for Analog IOs.
	 */
	get bitness(): Bitness<12n> {
		return this.#bitness
	}
}
