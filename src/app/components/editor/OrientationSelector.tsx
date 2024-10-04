import { ReactNode } from "react";
import { ORIENTATIONS } from "@/app/constants";
import { OrientationType } from "@/app/types";
import { useCanvasStore } from "@/app/stores/canvas";
import { SegmentedControlLabelled } from "@/app/components/wrappers/SegmentedControlLabelled";

export const OrientationSelector = (): ReactNode => {
    const orientation = useCanvasStore((state) => state.orientation);
    const setOrientation = useCanvasStore((state) => state.setOrientation);

    return (
        <SegmentedControlLabelled
            label={"Orientation"}
            value={`${orientation}`}
            onChange={(val) => setOrientation(val as OrientationType)}
            data={[ORIENTATIONS.portrait, ORIENTATIONS.landscape]}
            transitionDuration={250}
            transitionTimingFunction={"linear"}
        />
    );
};
