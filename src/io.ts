import { Bitness, IOMode, IOType, RPConnection } from '../types.ts'

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

	write(
		value: Mode extends IOMode.RO ? never
			: Type extends IOType.Digital ? boolean
			: number,
	): Promise<void> {
		//@ts-ignore TODO implement better type checking
		return this.#connection.write(value)
	}

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

	readIter() {
		return this.#connection.readIter
	}
	writeIter() {
		return this.#connection.writeIter
	}

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
	get bitness(): Bitness<12n> {
		return this.#bitness
	}
}
