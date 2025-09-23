import { observeDecorator as rawObserveDecorator } from "./LaminarService"

/**
 * observeMethodDecorator
 *
 * A thin, properly-typed adapter that converts the library-provided decorator
 * factory into a TypeScript-friendly MethodDecorator. This avoids the TS errors
 * about mismatched decorator signatures while preserving runtime behavior.
 *
 * Usage:
 * import { observeMethodDecorator } from './services/laminar/typedObserveDecorator'
 * class X {
 *   @observeMethodDecorator({ name: 'something' })
 *   async foo() { ... }
 * }
 */
export const observeMethodDecorator = (opts: any): MethodDecorator => {
	// The library's observeDecorator factory may have incompatible typings for TS.
	// Cast to `any` to obtain the runtime decorator and then wrap it so TypeScript
	// sees the correct MethodDecorator signature.
	const factory = rawObserveDecorator as unknown as (opts: any) => MethodDecorator
	const runtimeDecorator = factory(opts)

	return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
		// Delegate to the runtime decorator. We don't change the behavior.
		return (runtimeDecorator as any)(target, propertyKey, descriptor)
	}
}
