// percentage
export const DEFAULT_PADDING_PERCENT = 0.06;

export const FONT_SIZE_MULTIPLIER = 0.05;

export const SRC_URL_REGEX = /src:\s*url\(['"]?([^'")]+)['"]?\)/;

export const DEFAULT_PPI = 300;

export const UNITS = {
    cm: "centimeters",
    in: "inches",
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
