import {
	Bitness,
	Frequency,
	IOMode,
	RPConnection,
	Trigger,
	Tuple,
} from '../types.ts'

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

	async readSlice<Size extends number>(
		bufferSize: Size,
	): Promise<Tuple<number, Size>> {
		if (this.#bufferSize !== bufferSize) {
			//TODO send buffersize to backend
			// this.#connection.write()
		}
		const { value } = await this.#connection.read()
		return value.slice(bufferSize) as Tuple<number, Size>
	}

	writeSlice(buffer: number[]): Promise<void> {
		return this.#connection.write({ size: buffer.length, value: buffer })
	}

	async *readIter<Size extends number>(
		bufferSize: Size,
	): AsyncGenerator<Tuple<number, Size>, void, unknown> {
		while (true) {
			const { done, value } = await this.#connection.readIter.next()
			if (done) {
				break
			}
			yield value.value.slice(bufferSize) as Tuple<number, Size>
		}
	}

	writeIter() {
		return this.#connection.writeIter
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
