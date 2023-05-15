export const jsonStream = {
	parse<T extends Record<string, unknown>>() {
		return new TransformStream<string, T>({
			transform(chunk, controler) {
				try {
					controler.enqueue(JSON.parse(chunk))
				} catch (error) {
					controler.error(error)
				}
			},
		})
	},
	stringify<T extends Record<string, unknown>>() {
		return new TransformStream<T, string>({
			transform(chunk, controler) {
				try {
					controler.enqueue(JSON.stringify(chunk))
				} catch (error) {
					controler.error(error)
				}
			},
		})
	},
}
