import { ReactNode } from "react";
import { UNITS } from "@/app/constants";
import { useCanvasStore } from "@/app/stores/canvas";
import { UnitsType } from "@/app/types";
import { SegmentedControlLabelled } from "@/app/components/SegmentedControlLabelled";

export const UnitSelector = (): ReactNode => {
    const { units, setUnits } = useCanvasStore();

    const handleUnitsChange = (value: string) => {
        setUnits(value as UnitsType);
    };

    return (
        <SegmentedControlLabelled
            label={"Units"}
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
