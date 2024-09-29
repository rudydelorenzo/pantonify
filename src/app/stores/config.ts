import { ValueWithUnit } from "@/app/types";
import { create } from "zustand/react";
import { UNITS } from "@/app/constants";

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

export const useConfigStore = create<ConfigStoreState & ConfigStoreAction>(
    (set) => ({
        imageUrl: "",
        topText: "",
        bottomText: "",
        dateText: "",
        margin: {
            value: 0,
            units: UNITS.cm,
        },
        setImageUrl: (url) => {
            set(() => ({
                imageUrl: url,
            }));
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
    }),
);
