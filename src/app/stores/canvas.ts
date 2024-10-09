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
    _setPixelSize: (
        size: CanvasStoreState["printSize"],
        ppi: CanvasStoreState["ppi"],
    ) => void;
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
        _setPixelSize: (physicalSize, ppi) => {
            const pixelSize = physicalSize
                ? getPixelSizeFromPPI(physicalSize, ppi)
                : undefined;
            const configState = useConfigStore.getState();
            configState.setOffsets(configState.offsets, { pixelSize });
            set(() => {
                return {
                    pixelSize: pixelSize || null,
                };
            });
        },
        setPrintSize: (size) => {
            set((state) => {
                state._setPixelSize(size, state.ppi);
                return {
                    printSize: size,
                };
            });
        },
        setPPI: (ppi) => {
            set((state) => {
                // change margins
                const configStore = useConfigStore.getState();
                configStore.setMargin(configStore.margin.withUnits, ppi);
                state._setPixelSize(state.printSize, ppi);
                return {
                    ppi: ppi,
                };
            });
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
                        state.ppi,
                    );
                state.setPrintSize(null);
                return {
                    units,
                };
            });
        },
    }),
);
