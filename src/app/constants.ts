// percentage
import { MarginPresetsType } from "@/app/types";
import { generateAllMarginsFromCm } from "@/app/helpers";

export const FONT_SIZE_MULTIPLIER = 0.05;

export const SRC_URL_REGEX = /src:\s*url\(['"]?([^'")]+)['"]?\)/;

export const DEFAULT_PPI = 300;

export const UNITS = {
    cm: "cm",
    in: "in",
} as const;

export const DEFAULT_MARGIN_SIZE = "md";

export const MARGIN_SIZES = ["none", "sm", "md", "lg", "xl"] as const;

const _MARGINS_IN_CM: {
    [key in (typeof MARGIN_SIZES)[number]]: number;
} = {
    none: 0,
    sm: 1.5,
    md: 3,
    lg: 4,
    xl: 5,
};

export const MARGIN_PRESETS: MarginPresetsType =
    generateAllMarginsFromCm(_MARGINS_IN_CM);

export const ORIENTATIONS = {
    portrait: "Portrait",
    landscape: "Landscape",
} as const;

export const PRINT_SIZES: [
    number,
    number,
    (typeof UNITS)[keyof typeof UNITS],
][] = [
    [50, 70, UNITS.cm],
    [30, 40, UNITS.cm],
    [70, 100, UNITS.cm],
    [11, 17, UNITS.in],
    [12, 18, UNITS.in],
    [18, 24, UNITS.in],
    [24, 36, UNITS.in],
] as const;
