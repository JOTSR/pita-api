// @ts-ignore e
const ds = new DecompressionStream('gzip') as {
	readable: ReadableStream<Uint8Array>
	writable: WritableStream<ArrayBuffer>
}
const writer = ds.writable.getWriter()
const reader = ds.readable.getReader()

export async function gunzip(buffer: ArrayBuffer) {
	writer.write(buffer)
	const { value } = await reader.read()
	return value
}
