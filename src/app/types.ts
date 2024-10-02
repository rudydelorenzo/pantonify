import { MARGIN_SIZES, ORIENTATIONS, UNITS } from "@/app/constants";

export type UnitsType = (typeof UNITS)[keyof typeof UNITS];
export type OrientationType = (typeof ORIENTATIONS)[keyof typeof ORIENTATIONS];

export type Size = {
    w: number;
    h: number;
};

export type ImageType = {
    url: string;
    size: Size;
};

export type ValueWithUnit = {
    value: number;
    units: UnitsType;
};

export type PhysicalSize = {
    [key in keyof Size]: ValueWithUnit;
};

export type MarginPresetsType = {
    [key in (typeof MARGIN_SIZES)[number]]: {
        [key in UnitsType]: ValueWithUnit;
    };
};
