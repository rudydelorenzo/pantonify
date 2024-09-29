import { PhysicalSize, Size } from "@/app/types";
import { create } from "zustand/react";
import { DEFAULT_PPI } from "@/app/constants";
import { getPixelSizeFromPPI } from "@/app/helpers";

type CanvasStoreState = {
    pixelSize: Size | null;
    ppi: number;
    printSize: PhysicalSize | null;
};

type CanvasStoreAction = {
    setPrintSize: (size: CanvasStoreState["printSize"]) => void;
    setPPI: (ppi: CanvasStoreState["ppi"]) => void;
};

export const useCanvasStore = create<CanvasStoreState & CanvasStoreAction>(
    (set) => ({
        pixelSize: null,
        printSize: null,
        ppi: DEFAULT_PPI,
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
    }),
);
