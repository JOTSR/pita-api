// // Import the Redpitaya class and the necessary types
// import { Redpitaya } from './redpitaya.ts'
// import { MessageData } from '../types.ts'
// import {
// 	assert,
// 	assertEquals,
// 	assertRejects,
// } from 'https://deno.land/std@0.187.0/testing/asserts.ts'
// import { gzipEncode } from 'https://deno.land/x/wasm_gzip@v1.0.0/mod.ts'
// import { sleep } from 'https://deno.land/x/delayed@2.0.2/mod.ts'

// // Define a mock message data chunk
// const signalValue = 105
// const messageData = {
// 	parameters: {
// 		'analog_in_0#active': {
// 			value: false,
// 		},
// 		'digital_led_0': {
// 			value: false,
// 		},
// 	},
// 	signals: {
// 		'analog_in_0': {
// 			size: 1,
// 			value: [signalValue],
// 		},
// 	},
// } satisfies MessageData

// // Define a mock readable stream
// const readable = () =>
// 	new ReadableStream<Uint8Array>({
// 		pull(controler) {
// 			const string = JSON.stringify(messageData)
// 			const buffer = new TextEncoder().encode(string)
// 			const gzipped = gzipEncode(buffer)
// 			controler.enqueue(gzipped)
// 		},
// 	})

// // Define a mock writable stream
// const writable = () =>
// 	new WritableStream<string>({
// 		write(chunk) {
// 			const message = JSON.parse(chunk) as MessageData
// 			Object.assign(
// 				messageData.parameters,
// 				'parameters' in message ? message.parameters : {},
// 			)
// 			Object.assign(
// 				messageData.signals,
// 				'signals' in message ? message.signals : {},
// 			)
// 		},
// 	})

// // Define a mock for websocket
// class WebSocket {
// 	constructor(_endpoint: string) {
// 		console.log('construct')
// 		const reader = readable().getReader()
// 		const writer = writable().getWriter()
// 		const ws = {
// 			binaryType: '',
// 			onopen: () => undefined,
// 			onerror: () => undefined,
// 			onclose: () => undefined,
// 			onmessage: (_message: Uint8Array) => undefined,
// 			send: (message: string) => writer.write(message),
// 			readyState: 1,
// 			CONNECTING: 0,
// 		}
// 		setInterval(async () => {
// 			console.log('update')
// 			const { done, value } = await reader.read()
// 			if (value) {
// 				ws.onmessage(value)
// 			}
// 			if (done) {
// 				ws.onclose()
// 			}
// 		})
// 		return ws
// 	}
// }

// //@ts-ignore global mock
// globalThis.WebSocket = WebSocket

// //release ressources opened in Deno.test scope before module end
// function closeResources() {
// 	for (const rid in Deno.resources()) {
// 		if (
// 			['compression', 'textDecoder'].includes(
// 				Deno.resources()[rid] as string,
// 			)
// 		) {
// 			Deno.close(Number(rid))
// 		}
// 	}
// }

// const endpoint = 'ws://mock'

// // Define tests for the Redpitaya class
// Deno.test('redpitaya should be instantiated with a valid connection', async () => {
// 	const redpitaya = new Redpitaya({ endpoint })
// 	await redpitaya.connected()
// 	assert(redpitaya)
// 	closeResources()
// })

// Deno.test('should be able to write a message to the connection', async () => {
// 	const redpitaya = new Redpitaya({ endpoint })
// 	assertEquals(messageData.parameters.digital_led_0.value, false)
// 	await redpitaya.pin.digital.led0.write(true)
// 	assertEquals(messageData.parameters.digital_led_0.value, true)
// 	closeResources()
// })

// Deno.test('should be able to read a message from the connection', async () => {
// 	const redpitaya = new Redpitaya({ endpoint })
// 	await assertRejects(() => redpitaya.pin.analog.in0.read())
// 	await redpitaya.pin.analog.in0.setActive(true)
// 	assertEquals(redpitaya.pin.analog.in0.getActive(), true)
// 	assertEquals(await redpitaya.pin.analog.in0.read(), signalValue)
// 	closeResources()
// })

// Deno.test('should abort the connection', async () => {
// 	const redpitaya = new Redpitaya({ endpoint })
// 	assertEquals(redpitaya.closed, false)
// 	await redpitaya.close()
// 	assertRejects(() => redpitaya.pin.digital.led0.write(true))
// 	assertEquals(redpitaya.closed, true)
// 	closeResources()
// })
