import { PhysicalSize, Size } from "@/app/types";
import { create } from "zustand/react";
import { DEFAULT_PPI, UNITS } from "@/app/constants";
import { getPixelSizeFromPPI } from "@/app/helpers";

type CanvasStoreState = {
    pixelSize: Size;
    ppi: number;
    actualSize: PhysicalSize;
};

type CanvasStoreAction = {
    setActualSize: (size: CanvasStoreState["actualSize"]) => void;
    setPPI: (ppi: CanvasStoreState["ppi"]) => void;
};

export const useCanvasStore = create<CanvasStoreState & CanvasStoreAction>(
    (set) => ({
        pixelSize: {
            w: 0,
            h: 0,
        },
        actualSize: {
            w: 0,
            h: 0,
            units: UNITS.cm,
        },
        ppi: DEFAULT_PPI,
        setActualSize: (size) => {
            set((state) => ({
                actualSize: size,
                pixelSize: getPixelSizeFromPPI(size, state.ppi),
            }));
        },
        setPPI: (ppi) => {
            set((state) => ({
                ppi: ppi,
                pixelSize: getPixelSizeFromPPI(state.actualSize, ppi),
            }));
        },
    }),
);
