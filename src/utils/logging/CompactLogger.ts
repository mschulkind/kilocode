// Compact Logger
export class CompactLogger {
	constructor(transport: any, meta?: any) {}
	child(meta: any) {
		return this
	}
	close() {}
	debug(message: string, meta?: any) {}
	info(message: string, meta?: any) {}
	warn(message: string, meta?: any) {}
	error(message: string | Error, meta?: any) {}
	fatal(message: string | Error, meta?: any) {}
}
