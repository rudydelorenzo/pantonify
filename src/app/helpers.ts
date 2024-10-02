import {
    MarginPresetsType,
    PhysicalSize,
    Size,
    UnitsType,
    ValueWithUnit,
} from "@/app/types";
import { MARGIN_SIZES, SRC_URL_REGEX, UNITS } from "@/app/constants";
import { MutableRefObject } from "react";

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
        if (physicalSize[key].units === UNITS.cm) {
            physicalSize[key] = {
                value: cmToInches(physicalSize[key].value),
                units: UNITS.in,
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

export const downloadURI = (uri: string, name: string) => {
    const link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const substituteURLsWithURI = async (
    cssString: string,
): Promise<string> => {
    const url = cssString.match(SRC_URL_REGEX)?.[1];
    if (url) {
        const blob = await (await fetch(url)).blob();
        const uri = await blobToURI(blob);
        if (uri) {
            cssString = cssString.replace(url, uri);
        }
    }
    return cssString;
};

export const getCSSFontRules = async (): Promise<string> => {
    const rules: string[] = [];
    for (const stylesheet of document.styleSheets) {
        for (const rule of stylesheet.cssRules) {
            if (rule.type === rule.FONT_FACE_RULE) {
                const ruleText = rule.cssText;
                // dedupe
                let alreadyInList = false;
                for (const item of rules) {
                    if (ruleText === item) {
                        alreadyInList = true;
                        break;
                    }
                }
                if (!alreadyInList) {
                    rules.push(await substituteURLsWithURI(ruleText));
                }
            }
        }
    }
    return rules.join("\n");
};

export const svgElementToString = async (svgElement: Node): Promise<string> => {
    // first we serialize the document to a string
    const serializer = new XMLSerializer();
    const serializedString = serializer.serializeToString(svgElement);

    // now we re-parse it into an XML document object. this allows us to inject font styles
    const parser = new DOMParser();
    const xmlDocument = parser.parseFromString(
        serializedString,
        "image/svg+xml",
    );

    /* We need to embed the fonts as data URIs in the SVG. Why? Glad you asked. When we load the SVG into an
     * <img> element (so we can then draw it on the canvas) the browser is very strict about not letting that <img>
     * element establish any outbound network connections. Thus, when the <img> element tries to load the font from
     * the URL (as determined by the @font-face.src property present in the global document stylesheet),
     * the browser will block that request. To get around this we must define the @font-face declaration in the SVG
     * itself, and instead of having the URL of the font file in the 'src' field, we swap it to be a data URI
     * representation of what that URL points to. Got it? Good. I'm going to bed now
     */
    const svgNS = "http://www.w3.org/2000/svg";
    const defs = xmlDocument.createElementNS(svgNS, "defs");
    const style = xmlDocument.createElementNS(svgNS, "style");
    style.innerHTML = await getCSSFontRules();
    defs.appendChild(style);
    xmlDocument.documentElement.appendChild(defs);

    // we re-serialize the edited svg, and return it
    return serializer.serializeToString(xmlDocument);
};

export const exportAndSaveImage = async (
    filename: string,
    svgCanvasElement: MutableRefObject<SVGSVGElement | null>,
): Promise<void> => {
    return new Promise(async (resolve) => {
        const canvas = document.createElement("canvas");
        const w = svgCanvasElement.current?.viewBox.baseVal.width || 0;
        const h = svgCanvasElement.current?.viewBox.baseVal.height || 0;
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");

        if (ctx && svgCanvasElement.current) {
            const svg = new Blob(
                [await svgElementToString(svgCanvasElement.current)],
                {
                    type: "image/svg+xml",
                },
            );
            const url = URL.createObjectURL(svg);

            const img = new Image();
            img.onload = function () {
                ctx.drawImage(img, 0, 0, w, h);
                URL.revokeObjectURL(url);
                const png_img = canvas.toDataURL("image/png");
                resolve();
                downloadURI(png_img, filename);
            };
            img.src = url;
        }
    });
};
