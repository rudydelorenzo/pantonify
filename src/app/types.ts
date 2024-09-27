import { UNITS } from "@/app/constants";

export type Size = {
    w: number;
    h: number;
};

export type UnitsType = (typeof UNITS)[keyof typeof UNITS];

export type ValueWithUnit = {
    value: number;
    units: UnitsType;
};

export type PhysicalSize = Size & { units: UnitsType };
