import { ReactNode, useEffect, useState } from "react";
import { physicalSizeToString } from "@/app/helpers";
import { Select } from "@mantine/core";
import { useCanvasStore } from "@/app/stores/canvas";
import { OrientationType, PhysicalSize, UnitsType } from "@/app/types";
import { ORIENTATIONS, PRINT_SIZES } from "@/app/constants";
import { useShallow } from "zustand/react/shallow";

const getSizeOptions = (
    orientation: OrientationType,
    units: UnitsType,
): { [key in string]: PhysicalSize } => {
    const sizesInUnit = PRINT_SIZES.filter((item) => item[2] === units);
    const sizes = sizesInUnit.map(
        (size): PhysicalSize => ({
            w: {
                value:
                    orientation === ORIENTATIONS.landscape
                        ? Math.max(size[0], size[1])
                        : Math.min(size[0], size[1]),
                units,
            },
            h: {
                value:
                    orientation === ORIENTATIONS.landscape
                        ? Math.min(size[0], size[1])
                        : Math.max(size[0], size[1]),
                units,
            },
        }),
    );
    const result: { [key in string]: PhysicalSize } = {};
    for (const size of sizes) {
        result[physicalSizeToString(size)] = size;
    }
    return result;
};

export const PrintSizeSelector = (): ReactNode => {
    const { setPrintSize, printSize, orientation, units } = useCanvasStore(
        useShallow((state) => ({
            setPrintSize: state.setPrintSize,
            printSize: state.printSize,
            orientation: state.orientation,
            units: state.units,
        })),
    );
    const [sizeOptions, setSizeOptions] = useState<{
        [key in string]: PhysicalSize;
    }>(getSizeOptions(orientation, units));

    useEffect(() => {
        setSizeOptions(getSizeOptions(orientation, units));
    }, [units, orientation]);

    const handlePrintSizeChange = (value: string | null) => {
        setPrintSize(value ? sizeOptions[value] : null);
    };

    return (
        <Select
            label={"Print size (W x H)"}
            data={Object.keys(sizeOptions)}
            // caution: passing in undefined will cause unpredictable behaviour
            value={printSize ? physicalSizeToString(printSize) : null}
            onChange={handlePrintSizeChange}
            allowDeselect={false}
        />
    );
};
