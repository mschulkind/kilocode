import { LaminarAttributes, observe, observeDecorator } from "@lmnr-ai/lmnr"
import { LaminarCoreService } from "./LaminarCoreService"

// Re-export the main service instance and types
const laminarService = LaminarCoreService.getInstance()

// Re-export all the public methods from the core service
export default laminarService
export { observeDecorator, observe, LaminarAttributes }
