import { Size, ValueWithUnit } from "@/app/types";
import { create } from "zustand/react";
import { DEFAULT_PPI, UNITS } from "@/app/constants";
import { getPixelSizeFromPPI } from "@/app/helpers";

type ConfigStoreState = {
    imageUrl: string;
    topText: string;
    bottomText: string;
    dateText: string;
    margin: ValueWithUnit;
};

type ConfigStoreAction = {
    setImageUrl: (url: ConfigStoreState["imageUrl"]) => void;
    setTopText: (text: ConfigStoreState["topText"]) => void;
    setBottomText: (text: ConfigStoreState["bottomText"]) => void;
    setDateText: (text: ConfigStoreState["dateText"]) => void;
    setMargin: (amount: ConfigStoreState["margin"]) => void;
};

export const useCanvasStore = create<ConfigStoreState & ConfigStoreAction>(
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
