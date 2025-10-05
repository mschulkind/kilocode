// Compact Transport
export class CompactTransport {
	constructor(config: any) {}

	write(entry: any): Promise<void> {
		return Promise.resolve()
	}

	close(): Promise<void> {
		return Promise.resolve()
	}
}
