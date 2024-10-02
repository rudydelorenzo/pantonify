import { OrientationType, PhysicalSize, Size, UnitsType } from "@/app/types";
import { create } from "zustand/react";
import { DEFAULT_PPI, ORIENTATIONS, UNITS } from "@/app/constants";
import { getPixelSizeFromPPI } from "@/app/helpers";

type CanvasStoreState = {
    pixelSize: Size | null;
    ppi: number;
    printSize: PhysicalSize | null;
    orientation: OrientationType;
    units: UnitsType;
};

type CanvasStoreAction = {
    setPrintSize: (size: CanvasStoreState["printSize"]) => void;
    setPPI: (ppi: CanvasStoreState["ppi"]) => void;
    setOrientation: (orientation: OrientationType) => void;
    setUnits: (units: UnitsType) => void;
};

export const useCanvasStore = create<CanvasStoreState & CanvasStoreAction>(
    (set) => ({
        pixelSize: null,
        printSize: null,
        ppi: DEFAULT_PPI,
        units: UNITS.cm,
        orientation: ORIENTATIONS.portrait,
        setPrintSize: (size) => {
            set((state) => ({
                printSize: size,
                pixelSize: size ? getPixelSizeFromPPI(size, state.ppi) : null,
            }));
        },
        setPPI: (ppi) => {
            set((state) => ({
                ppi: ppi,
                pixelSize: state.printSize
                    ? getPixelSizeFromPPI(state.printSize, ppi)
                    : null,
            }));
        },
        setOrientation: (orientation: OrientationType) => {
            set((state) => ({
                orientation,
            }));
        },
        setUnits: (units: UnitsType) => {
            set((state) => ({
                units,
            }));
        },
    }),
);
