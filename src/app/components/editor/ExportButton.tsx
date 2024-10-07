import { MutableRefObject, ReactNode, useState } from "react";
import { IconWindowMinimize } from "@tabler/icons-react";
import { Group, Loader, Text } from "@mantine/core";
import { SplitButton } from "@/app/components/wrappers/SplitButton";
import { exportAndSaveImage } from "@/app/helpers";
import { useConfigStore } from "@/app/stores/config";

export const ExportButton = ({
    svgCanvasElementRef,
}: {
    svgCanvasElementRef: MutableRefObject<SVGSVGElement | null>;
}): ReactNode => {
    const [exportInProgress, setExportInProgress] = useState<boolean>(false);

    const handleRenderImage = async () => {
        setExportInProgress(true);
        await exportAndSaveImage(
            `EXPORT_${useConfigStore.getState().topText}_${useConfigStore.getState().bottomText}.png`,
            svgCanvasElementRef,
        );
        setExportInProgress(false);
    };

    return (
        <SplitButton
            buttonProps={{
                onClick: handleRenderImage,
                disabled: exportInProgress,
            }}
            dropDownItems={[
                {
                    text: "Low Quality Export",
                    icon: IconWindowMinimize,
                    onClick: () => console.warn("whoops not enabled yet lol"),
                },
            ]}
        >
            {!exportInProgress ? (
                "Export as PNG..."
            ) : (
                <Group align={"center"} gap={"lg"}>
                    <Text c={"white"}>Exporting</Text>
                    <Loader type={"dots"} color={"white"} size={"sm"} />
                </Group>
            )}
        </SplitButton>
    );
};
