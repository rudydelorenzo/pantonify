import { ReactNode } from "react";
import { UNITS } from "@/app/constants";
import { SegmentedControl } from "@mantine/core";

export const UnitSelector = (): ReactNode => {
    return (
        <SegmentedControl
            value={`${units}`}
            onChange={handleUnitsChange}
            data={[
                { label: "cm", value: UNITS.cm },
                { label: "in", value: UNITS.in },
            ]}
            transitionDuration={250}
            transitionTimingFunction={"linear"}
        />
    );
};
