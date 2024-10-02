import { ImageType, Size, ValueWithUnit } from "@/app/types";
import { create } from "zustand/react";
import {
    DEFAULT_MARGIN_SIZE,
    DEFAULT_UNIT,
    MARGIN_PRESETS,
} from "@/app/constants";
import { getRealImageSize } from "@/app/helpers";

type ConfigStoreState = {
    image: null | ImageType;
    topText: string;
    bottomText: string;
    dateText: string;
    margin: ValueWithUnit;
    offsets: Size;
};

type ConfigStoreAction = {
    setImage: (url: string | null) => Promise<void>;
    setTopText: (text: ConfigStoreState["topText"]) => void;
    setBottomText: (text: ConfigStoreState["bottomText"]) => void;
    setDateText: (text: ConfigStoreState["dateText"]) => void;
    setMargin: (amount: ConfigStoreState["margin"]) => void;
    setOffsets: (offsets: ConfigStoreState["offsets"]) => void;
};

export const useConfigStore = create<ConfigStoreState & ConfigStoreAction>(
    (set) => ({
        image: null,
        topText: "",
        bottomText: "",
        dateText: "",
        margin: MARGIN_PRESETS[DEFAULT_MARGIN_SIZE][DEFAULT_UNIT],
        offsets: { w: 0, h: 0 },
        setImage: async (url) => {
            const imageSize = await getRealImageSize(url);
            set(() => {
                // setImageOffset({ h: 0, w: 0 });
                if (!url) return { image: null };
                return { image: { url: url, size: imageSize } };
            });
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
        setMargin: (amount) => {
            set(() => ({
                margin: amount,
            }));
        },
        setOffsets: (offsets) => {
            set(() => ({
                offsets,
            }));
        },
    }),
);
