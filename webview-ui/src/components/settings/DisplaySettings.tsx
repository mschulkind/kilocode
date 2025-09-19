import { HTMLAttributes, useMemo } from "react"
import { useAppTranslation } from "@/i18n/TranslationContext"
import { VSCodeCheckbox } from "@vscode/webview-ui-toolkit/react"
import { Monitor } from "lucide-react"

import { SetCachedStateField } from "./types"
import { SectionHeader } from "./SectionHeader"
import { Section } from "./Section"
import { TaskTimeline } from "../chat/TaskTimeline"
import { generateSampleTimelineData } from "../../utils/timeline/mockData"

type DisplaySettingsProps = HTMLAttributes<HTMLDivElement> & {
	showTaskTimeline?: boolean
	showTimestamps?: boolean //kilocode_change
	setCachedStateField: SetCachedStateField<"showTaskTimeline" | "showTimestamps"> //kilocode_change
}

export const DisplaySettings = ({
	showTaskTimeline,
	showTimestamps,
	setCachedStateField,
	...props
}: DisplaySettingsProps) => {
	//kilocode_change
	const { t } = useAppTranslation()

	const sampleTimelineData = useMemo(() => generateSampleTimelineData(), [])

	return (
		<div {...props}>
			<SectionHeader>
				<div className="flex items-center gap-2">
					<Monitor className="w-4" />
					<div>{t("settings:sections.display")}</div>
				</div>
			</SectionHeader>

			<Section>
				<div>
					<VSCodeCheckbox
						checked={showTaskTimeline}
						onChange={(e: any) => {
							setCachedStateField("showTaskTimeline", e.target.checked)
						}}>
						<span className="font-medium">{t("settings:display.taskTimeline.label")}</span>
					</VSCodeCheckbox>
					<div className="text-vscode-descriptionForeground text-sm mt-1">
						{t("settings:display.taskTimeline.description")}
					</div>

					{/* Sample TaskTimeline preview */}
					<div className="mt-3">
						<div className="font-medium text-vscode-foreground text-xs mb-4">Preview</div>
						<div className="opacity-60">
							<TaskTimeline groupedMessages={sampleTimelineData} isTaskActive={false} />
						</div>
					</div>

					{/* Show Timestamps checkbox */}
					<div className="mt-3">
						<VSCodeCheckbox
							checked={showTimestamps}
							onChange={(e: any) => {
								setCachedStateField("showTimestamps", e.target.checked)
							}}>
							<span className="font-medium">{t("settings:display.showTimestamps.label")}</span>
						</VSCodeCheckbox>
						<div className="text-vscode-descriptionForeground text-sm mt-1">
							{t("settings:display.showTimestamps.description")}
						</div>
					</div>
				</div>
			</Section>
		</div>
	)
}
