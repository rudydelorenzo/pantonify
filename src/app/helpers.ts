import { PhysicalSize, Size } from "@/app/types";
import { UNITS } from "@/app/constants";

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
    K extends (...args: any[]) => any, // eslint-disable-line @typescript-eslint/no-explicit-any
>(
    obj: T,
    fn: K,
): { [key in keyof T]: ReturnType<K> } => {
    for (const key in obj) {
        obj[key] = fn(obj[key]);
    }
    return obj;
};

export const getPixelSizeFromPPI = (
    physicalSize: PhysicalSize,
    ppi: number,
): Size => {
    if (physicalSize.units === UNITS.cm) {
        physicalSize = {
            w: cmToInches(physicalSize.w),
            h: cmToInches(physicalSize.h),
            units: UNITS.in,
        };
    }

    // all units are inches here
    const diagonalPrintSize = pythagoras(physicalSize.w, physicalSize.h);
    const angle = Math.asin(physicalSize.h / diagonalPrintSize);
    const diagonalPixelSize = diagonalPrintSize * ppi;
    // calculate w and h
    const sizeInPixels: Size = {
        w: diagonalPixelSize * Math.cos(angle),
        h: diagonalPixelSize * Math.sin(angle),
    };

    return applyFunctionToObject(sizeInPixels, Math.round);
};
