import { Bitness, IoId, IOMode, IOType, RPConnection } from '../types.ts'

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
	#active = false
	#connection: RPConnection<
		Type extends IOType.Digital ? 'parameters' : 'signals',
		IoId
	>
	constructor(
		{ mode, type, bitness = 1n, connection }: {
			mode: Mode
			type: Type
			bitness?: Bitness<12n>
			connection: RPConnection<
				Type extends IOType.Digital ? 'parameters' : 'signals',
				IoId
			>
		},
	) {
		//! required to #connection in first
		this.#connection = connection
		this.#mode = mode
		this.#type = type
		this.setBitness(bitness)
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
		if (!this.#active && this.#type === IOType.Analog) {
			throw new Error(
				'analog IO "active" parameter is set to "false", no data can be processed',
			)
		}
		//@ts-ignore TODO implement better type checking
		return this.#connection.write({ value })
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
		if (!this.#active && this.#type === IOType.Analog) {
			throw new Error(
				'analog IO "active" parameter is set to "false", no data can be processed',
			)
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
		if (!this.#active && this.#type === IOType.Analog) {
			throw new Error(
				'analog IO "active" parameter is set to "false", no data can be processed',
			)
		}
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
		if (!this.#active && this.#type === IOType.Analog) {
			throw new Error(
				'analog IO "active" parameter is set to "false", no data can be processed',
			)
		}
		return this.#connection.writeIter
	}

	/**
	 * Set the bitness of the IO.
	 * Only for Analog IOs.
	 * @param {Bitness<12n>} bitness - The "bitness" parameter is a value that represents the number of bits used in the ADC/DAC.
	 * @example
	 * ```ts
	 * analogOut1.setBitness(4n)
	 * ```
	 */
	async setBitness(bitness: Bitness<12n>) {
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
		await this.#connection.setConfig('bitness', { value: Number(bitness) })
		this.#bitness = bitness
	}

	/**
	 * Get the bitness of the IO.
	 * Only for Analog IOs.
	 */
	getBitness(): Bitness<12n> {
		return this.#bitness
	}

	/**
	 * Set the state of the IO.
	 * Only for Analog IOs.
	 * @param {active<12n>} active - The "active" parameter enable or disable the analog IO.
	 * @example
	 * ```ts
	 * analogIn1.setActive(true)
	 * //analog in 1 start to acquire
	 * await analogIn1.read() //ok
	 * analogOut1.setActive(false)
	 * //analog in 1 stop to acquire
	 * await analogIn1.read() //error
	 * ```
	 */
	async setActive(active: boolean) {
		if (this.#type === IOType.Digital) {
			throw new RangeError(
				'invalid active parameter is invalid for Digital IO',
			)
		}
		await this.#connection.setConfig('active', { value: Boolean(active) })
		this.#active = active
	}

	/**
	 * Get the state of the IO.
	 * Only for Analog IOs.
	 * @return active - The "active" parameter enable or disable the analog IO.
	 */
	getActive(): boolean {
		return this.#active
	}
}
