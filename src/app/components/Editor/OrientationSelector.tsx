import { ReactNode } from "react";
import { ORIENTATIONS, UNITS } from "@/app/constants";
import { SegmentedControl } from "@mantine/core";
import { OrientationType } from "@/app/types";

export const OrientationSelector = (): ReactNode => {
    return (
        <SegmentedControl
            value={`${orientation}`}
            onChange={(val) => setOrientation(val as OrientationType)}
            data={[ORIENTATIONS.portrait, ORIENTATIONS.landscape]}
            transitionDuration={250}
            transitionTimingFunction={"linear"}
        />
    );
};
