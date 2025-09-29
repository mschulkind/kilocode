import { vscode } from "../utils/vscode.js"
import debounce from "debounce"

export const showSystemNotification = debounce((message: string) => {
	vscode.postMessage({
		type: "showSystemNotification",
		notificationOptions: {
			message,
		},
	})
})
