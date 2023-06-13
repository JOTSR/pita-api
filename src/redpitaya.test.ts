// Import the Redpitaya class and the necessary types
import { Redpitaya } from './redpitaya.ts'
import { MessageData } from '../types.ts'
import {
	assert,
	assertEquals,
	assertRejects,
} from 'https://deno.land/std@0.187.0/testing/asserts.ts'
import { gzipEncode } from 'https://deno.land/x/wasm_gzip@v1.0.0/mod.ts'

// Define a mock message data chunk
const signalValue = 105
const messageData = {
	parameters: {
		'analog_in_0#active': {
			value: false,
		},
		'digital_led_0': {
			value: false,
		},
	},
	signals: {
		'analog_in_0': {
			size: 1,
			value: [signalValue],
		},
	},
} satisfies MessageData

// Define a mock readable stream
const readable = () =>
	new ReadableStream<Uint8Array>({
		pull(controler) {
			const string = JSON.stringify(messageData)
			const buffer = new TextEncoder().encode(string)
			const gzipped = gzipEncode(buffer)
			controler.enqueue(gzipped)
		},
	})

// Define a mock writable stream
const writable = () =>
	new WritableStream<string>({
		write(chunk) {
			const message = JSON.parse(chunk) as MessageData
			Object.assign(
				messageData.parameters,
				'parameters' in message ? message.parameters : {},
			)
			Object.assign(
				messageData.signals,
				'signals' in message ? message.signals : {},
			)
		},
	})

// Define a mock connection object
const getConnection: () => WebSocketConnection = () => ({
	readable: readable(),
	writable: writable(),
	extensions: '',
	protocol: '',
})

//release ressources opened in Deno.test scope before module end
function closeResources() {
	for (const rid in Deno.resources()) {
		if (
			['compression', 'textDecoder'].includes(
				Deno.resources()[rid] as string,
			)
		) {
			Deno.close(Number(rid))
		}
	}
}

// Define tests for the Redpitaya class
Deno.test('redpitaya should be instantiated with a valid connection', () => {
	// const connection = getConnection()
	// const redpitaya = new Redpitaya({ connection })
	// assert(redpitaya)
	// closeResources()
})

Deno.test('should be able to write a message to the connection', async () => {
	// const connection = getConnection()
	// const redpitaya = new Redpitaya({ connection })
	// assertEquals(messageData.parameters.digital_led_0.value, false)
	// await redpitaya.pin.digital.led0.write(true)
	// assertEquals(messageData.parameters.digital_led_0.value, true)
	// closeResources()
})

Deno.test('should be able to read a message from the connection', async () => {
	// const redpitaya = new Redpitaya({ connection: getConnection() })
	// await assertRejects(() => redpitaya.pin.analog.in0.read())
	// await redpitaya.pin.analog.in0.setActive(true)
	// assertEquals(redpitaya.pin.analog.in0.getActive(), true)
	// assertEquals(await redpitaya.pin.analog.in0.read(), signalValue)
	// closeResources()
})

Deno.test('should abort the connection', async () => {
	// const redpitaya = new Redpitaya({ connection: getConnection() })
	// assertEquals(redpitaya.closed, false)
	// await redpitaya.close()
	// assertRejects(() => redpitaya.pin.digital.led0.write(true))
	// assertEquals(redpitaya.closed, true)
	// closeResources()
})
