import { ImageType, Size, ValueWithUnit } from "@/app/types";
import { create } from "zustand/react";
import {
    DEFAULT_MARGIN_SIZE,
    DEFAULT_PPI,
    DEFAULT_UNIT,
    DEFAULT_ZOOM,
    MARGIN_PRESETS,
    MIN_ZOOM,
} from "@/app/constants";
import {
    computeMaximumOffsets,
    getImageFrameSize,
    getRealImageSize,
    valueWithUnitsToPixels,
} from "@/app/helpers";
import { useCanvasStore } from "@/app/stores/canvas";

export type ConfigStoreState = {
    image: null | ImageType;
    topText: string;
    bottomText: string;
    dateText: string;
    margin: {
        withUnits: ValueWithUnit;
        pixels: Size;
    };
    offsets: Size;
    zoom: number;
};

export type ConfigStoreAction = {
    setImage: (url: string | null) => Promise<void>;
    setTopText: (text: ConfigStoreState["topText"]) => void;
    setBottomText: (text: ConfigStoreState["bottomText"]) => void;
    setDateText: (text: ConfigStoreState["dateText"]) => void;
    setMargin: (amount: ValueWithUnit, ppi: undefined | number) => void;
    setOffsets: (
        offsets: ConfigStoreState["offsets"],
        dependencies?: {
            pixelSize?: Size;
            zoom?: ConfigStoreState["zoom"];
        },
    ) => void;
    setZoom: (zoom: ConfigStoreState["zoom"]) => void;
};

export const useConfigStore = create<ConfigStoreState & ConfigStoreAction>(
    (set) => ({
        image: null,
        topText: "",
        bottomText: "",
        dateText: "",
        margin: {
            withUnits: MARGIN_PRESETS[DEFAULT_MARGIN_SIZE][DEFAULT_UNIT],
            pixels: {
                w: valueWithUnitsToPixels(
                    MARGIN_PRESETS[DEFAULT_MARGIN_SIZE][DEFAULT_UNIT],
                    DEFAULT_PPI,
                ),
                h: valueWithUnitsToPixels(
                    MARGIN_PRESETS[DEFAULT_MARGIN_SIZE][DEFAULT_UNIT],
                    DEFAULT_PPI,
                ),
            },
        },
        offsets: { w: 0, h: 0 },
        zoom: DEFAULT_ZOOM,
        setImage: async (url) => {
            if (!url) {
                set(() => ({ image: null }));
                return;
            }
            const imageSize = await getRealImageSize(url);
            set(() => ({ image: { url: url, size: imageSize } }));
        },
        setTopText: (text) => {
            set(() => ({
                topText: text,
            }));
        },
        setBottomText: (text) => {
            set(() => ({
                bottomText: text,
            }));
        },
        setDateText: (text) => {
            set(() => ({
                dateText: text,
            }));
        },
        setMargin: (amount, ppi) => {
            if (!ppi) ppi = useCanvasStore.getState().ppi;
            set((state) => {
                state.setOffsets(state.offsets, undefined);
                return {
                    margin: {
                        withUnits: amount,
                        pixels: {
                            w: valueWithUnitsToPixels(amount, ppi),
                            h: valueWithUnitsToPixels(amount, ppi),
                        },
                    },
                };
            });
        },
        setOffsets: (prospectiveOffsets, dependencies = {}) => {
            set((state) => {
                const pixelSize = dependencies.pixelSize
                    ? dependencies.pixelSize
                    : useCanvasStore.getState().pixelSize || undefined;
                const zoom = dependencies.zoom ? dependencies.zoom : state.zoom;

                if (!state.image || !pixelSize)
                    return {
                        offsets: { w: 0, h: 0 },
                    };

                const maxOffsets = computeMaximumOffsets(
                    state.image.size,
                    getImageFrameSize(pixelSize, state.margin.pixels),
                    zoom,
                );
                const offsets = {
                    w: Math.min(
                        Math.max(prospectiveOffsets.w, maxOffsets.w),
                        0,
                    ),
                    h: Math.min(
                        Math.max(prospectiveOffsets.h, maxOffsets.h),
                        0,
                    ),
                };
                return {
                    offsets,
                };
            });
        },
        setZoom: (zoom) => {
            // clamp zoom to minimum
            zoom = Math.max(zoom, MIN_ZOOM);
            set((state) => {
                state.setOffsets(state.offsets, { zoom });
                return {
                    zoom: zoom,
                };
            });
        },
    }),
);
