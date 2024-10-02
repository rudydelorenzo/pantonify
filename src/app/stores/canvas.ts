import { OrientationType, PhysicalSize, Size, UnitsType } from "@/app/types";
import { create } from "zustand/react";
import {
    DEFAULT_MARGIN_SIZE,
    DEFAULT_PPI,
    DEFAULT_UNIT,
    MARGIN_PRESETS,
    ORIENTATIONS,
} from "@/app/constants";
import { getPixelSizeFromPPI } from "@/app/helpers";
import { useConfigStore } from "@/app/stores/config";

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
        units: DEFAULT_UNIT,
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
            set((state) => {
                state.setPrintSize(null);
                return {
                    orientation,
                };
            });
        },
        setUnits: (units: UnitsType) => {
            set((state) => {
                useConfigStore
                    .getState()
                    .setMargin(
                        MARGIN_PRESETS[DEFAULT_MARGIN_SIZE][state.units],
                    );
                state.setPrintSize(null);
                return {
                    units,
                };
            });
        },
    }),
);
