import {
    MarginPresetsType,
    PhysicalSize,
    Size,
    UnitsType,
    ValueWithUnit,
} from "@/app/types";
import { MARGIN_SIZES, UNITS } from "@/app/constants";

export const blobToURI = async (
    blob: Blob | undefined,
): Promise<string | undefined> => {
    if (!blob) return undefined;
    const dataUri = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(blob);
    });
    return typeof dataUri === "string" ? dataUri : undefined;
};

export const mergeStyles = <T>(styles1: T, styles2: T): T => {
    // styles from styles2 will take precedence
    return { ...styles1, ...styles2 };
};

export const cmToInches = (cm: number): number => {
    return cm * 0.3937007874;
};

export const inchesToCm = (inches: number): number => {
    return inches / 0.3937007874;
};

export const pythagoras = (w: number, h: number): number =>
    Math.sqrt(w ** 2 + h ** 2);

export const applyFunctionToObject = <
    T extends { [key: string]: any }, // eslint-disable-line @typescript-eslint/no-explicit-any
    L extends T[keyof T],
    M extends any[], // eslint-disable-line @typescript-eslint/no-explicit-any
    K extends (arg1: L, ...args: M) => any, // eslint-disable-line @typescript-eslint/no-explicit-any
>(
    obj: T,
    fn: K,
    ...args: M
): { [key in keyof T]: ReturnType<K> } => {
    for (const key in obj) {
        obj[key] = fn(obj[key], ...args);
    }
    return obj;
};

export const getPixelSizeFromPPI = (
    physicalSize: PhysicalSize,
    ppi: number,
): Size => {
    // definitely didn't waste an hour bc i forgot to clone the object...
    physicalSize = { ...physicalSize };
    let key: keyof PhysicalSize;
    for (key in physicalSize) {
        if (physicalSize[key].units === UNITS.in) {
            physicalSize[key] = {
                value: inchesToCm(physicalSize[key].value),
                units: UNITS.cm,
            };
        }
    }

    // all units are inches here
    const diagonalPrintSize = pythagoras(
        physicalSize.w.value,
        physicalSize.h.value,
    );
    const angle = Math.asin(physicalSize.h.value / diagonalPrintSize);
    const diagonalPixelSize = diagonalPrintSize * ppi;
    // calculate w and h
    const sizeInPixels: Size = {
        w: diagonalPixelSize * Math.cos(angle),
        h: diagonalPixelSize * Math.sin(angle),
    };

    return applyFunctionToObject(sizeInPixels, Math.round);
};

export const valueWithUnitsToPixels = (
    valueWithUnit: ValueWithUnit,
    ppi: number,
): number => {
    const val = { ...valueWithUnit };
    if (val.units === UNITS.cm) {
        val.value = cmToInches(val.value);
        val.units = UNITS.in;
    }

    return ppi * val.value;
};

export const physicalSizeToString = (size: PhysicalSize): string => {
    return `${size.w.value}${size.w.units} x ${size.h.value}${size.h.units}`;
};

export const generateAllMarginsFromCm = (marginsInCm: {
    [key in (typeof MARGIN_SIZES)[number]]: number;
}): MarginPresetsType => {
    let key: keyof typeof marginsInCm;
    const result: Record<string, { [key in UnitsType]: ValueWithUnit }> = {};
    for (key in marginsInCm) {
        const marginInCm = marginsInCm[key];
        result[key] = {
            [UNITS.cm]: {
                value: marginInCm,
                units: UNITS.cm,
            },
            [UNITS.in]: {
                value: cmToInches(marginInCm),
                units: UNITS.in,
            },
        };
    }
    return result as MarginPresetsType;
};
