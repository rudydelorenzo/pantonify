import { ReactNode } from "react";
import { Text } from "@mantine/core";
import { calculateImageSizeMb } from "@/app/helpers";
import { useCanvasStore } from "@/app/stores/canvas";

export const EstimatedFilesizeDisplay = (): ReactNode => {
    const imageSize = useCanvasStore((state) => state.pixelSize);

    return imageSize ? (
        <Text
            ta={"center"}
            size={"xs"}
        >{`Estimated filesize: ${calculateImageSizeMb(imageSize).toFixed(2)}MB`}</Text>
    ) : undefined;
};
