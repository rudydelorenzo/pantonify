import { ReactNode } from "react";
import { ORIENTATIONS } from "@/app/constants";
import { OrientationType } from "@/app/types";
import { useCanvasStore } from "@/app/stores/canvas";
import { SegmentedControlLabelled } from "@/app/components/SegmentedControlLabelled";

export const OrientationSelector = (): ReactNode => {
    const { orientation, setOrientation } = useCanvasStore();

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
